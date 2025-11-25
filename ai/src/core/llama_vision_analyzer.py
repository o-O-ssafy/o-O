"""
Llama 3.2 11B Vision Analyzer
이미지 분석을 위한 Llama 3.2 Vision 모델 래퍼
"""
import torch
import logging
from transformers import MllamaForConditionalGeneration, AutoProcessor, BitsAndBytesConfig
from PIL import Image
from typing import List, Dict, Union, Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class LlamaVisionAnalyzer:
    """Llama 3.2 11B Vision을 사용한 이미지 분석기"""

    def __init__(
        self,
        model_name: str = "meta-llama/Llama-3.2-11B-Vision-Instruct",
        quantization: Optional[str] = "int4"
    ):
        """
        Llama Vision Analyzer 초기화

        Args:
            model_name: HuggingFace 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        self.model_name = model_name
        logger.info(f"🚀 Llama Vision 모델 로딩 중: {model_name}")
        logger.info(f"📊 양자화: {quantization if quantization else 'BF16'}")
        logger.info(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n")

        # Processor (토크나이저 + 이미지 프로세서) 로드
        self.processor = AutoProcessor.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정에 따른 모델 로드
        if quantization == "int4" and torch.cuda.is_available():
            logger.info("⚙️  INT4 양자화 설정 (VRAM ~10GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                llm_int8_enable_fp32_cpu_offload=True
            )
            self.model = MllamaForConditionalGeneration.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        elif quantization == "int8" and torch.cuda.is_available():
            logger.info("⚙️  INT8 양자화 설정 (VRAM ~15GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_8bit=True,
                llm_int8_enable_fp32_cpu_offload=True
            )
            self.model = MllamaForConditionalGeneration.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            logger.info("⚙️  BF16 설정 (VRAM ~22GB)")
            self.model = MllamaForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.bfloat16,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

        # VRAM 사용량 출력
        if torch.cuda.is_available():
            logger.info(f"✅ 모델 로딩 완료!")
            logger.info(f"📊 VRAM 사용량: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
            logger.info(f"📊 VRAM 예약: {torch.cuda.memory_reserved() / 1024**3:.2f} GB\n")
        else:
            logger.info("✅ 모델 로딩 완료! (CPU 모드)\n")

    def analyze_image(
        self,
        image: Union[str, Image.Image],
        prompt: str = "이 이미지에 대해 자세히 설명해주세요.",
        max_tokens: int = 1024,
        temperature: float = 0.7,
        repetition_penalty: float = 1.0
    ) -> str:
        """
        단일 이미지 분석

        Args:
            image: 이미지 파일 경로 또는 PIL Image 객체
            prompt: 분석 프롬프트
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도
            repetition_penalty: 반복 억제 (1.0=없음, 1.2-1.5 권장)

        Returns:
            분석 결과 텍스트
        """
        # 이미지 로드
        if isinstance(image, str):
            pil_image = Image.open(image).convert("RGB")
        else:
            pil_image = image.convert("RGB")

        # 메시지 구성
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image"},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # 입력 준비
        input_text = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True
        )

        inputs = self.processor(
            images=pil_image,
            text=input_text,
            return_tensors="pt"
        ).to(self.model.device)

        # 생성
        with torch.no_grad():
            # repetition_penalty는 양자화 모델에서 CUDA 에러 발생 가능하므로 제거
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                do_sample=True if temperature > 0 else False,
                pad_token_id=self.processor.tokenizer.pad_token_id
            )

        # 디코딩 (입력 제거하고 생성된 부분만)
        generated_text = self.processor.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return generated_text.strip()

    def analyze_images_batch(
        self,
        images: List[Union[str, Image.Image]],
        prompt: str = "이 이미지에 대해 자세히 설명해주세요.",
        max_tokens: int = 1024,
        temperature: float = 0.7,
        repetition_penalty: float = 1.0,
        batch_size: int = 1
    ) -> List[str]:
        """
        여러 이미지를 배치로 분석

        배치 크기가 1보다 크면 동시에 여러 프레임을 처리하지만,
        VRAM 제약으로 인해 기본값은 1입니다.

        Args:
            images: 이미지 파일 경로 또는 PIL Image 객체 리스트
            prompt: 분석 프롬프트
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도
            repetition_penalty: 반복 억제 (1.0=없음, 1.2-1.5 권장)
            batch_size: 배치 크기 (기본: 1, 순차 처리)

        Returns:
            각 이미지의 분석 결과 리스트
        """
        results = []

        # 배치 단위로 나누어 처리
        for batch_start in range(0, len(images), batch_size):
            batch_end = min(batch_start + batch_size, len(images))
            batch_images = images[batch_start:batch_end]

            logger.info(f"📸 이미지 배치 {batch_start+1}-{batch_end}/{len(images)} 분석 중...")

            # 배치 내 이미지를 순차적으로 처리 (현재 모델이 배치 추론을 지원하지 않음)
            for i, image in enumerate(batch_images):
                result = self.analyze_image(image, prompt, max_tokens, temperature, repetition_penalty)
                results.append(result)

        return results

    def analyze_with_context(
        self,
        image: Union[str, Image.Image],
        prompt: str,
        context: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        repetition_penalty: float = 1.0
    ) -> str:
        """
        컨텍스트와 함께 이미지 분석

        Args:
            image: 이미지 파일 경로 또는 PIL Image 객체
            prompt: 분석 프롬프트
            context: 추가 컨텍스트 정보 (예: 영상 자막, 이전 프레임 분석 결과)
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도
            repetition_penalty: 반복 억제 (1.0=없음, 1.2-1.5 권장)

        Returns:
            분석 결과 텍스트
        """
        # 이미지 로드
        if isinstance(image, str):
            pil_image = Image.open(image).convert("RGB")
        else:
            pil_image = image.convert("RGB")

        # 컨텍스트가 포함된 프롬프트 구성
        full_prompt = f"컨텍스트:\n{context}\n\n질문: {prompt}"

        # 메시지 구성
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image"},
                    {"type": "text", "text": full_prompt}
                ]
            }
        ]

        # 입력 준비
        input_text = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True
        )

        inputs = self.processor(
            images=pil_image,
            text=input_text,
            return_tensors="pt"
        ).to(self.model.device)

        # 생성
        with torch.no_grad():
            # repetition_penalty는 양자화 모델에서 CUDA 에러 발생 가능하므로 제거
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                do_sample=True if temperature > 0 else False,
                pad_token_id=self.processor.tokenizer.pad_token_id
            )

        # 디코딩
        generated_text = self.processor.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return generated_text.strip()

    def get_vram_usage(self) -> Dict[str, float]:
        """현재 VRAM 사용량 반환"""
        if torch.cuda.is_available():
            return {
                "allocated_gb": torch.cuda.memory_allocated() / 1024**3,
                "reserved_gb": torch.cuda.memory_reserved() / 1024**3
            }
        return {"allocated_gb": 0.0, "reserved_gb": 0.0}

    def cleanup(self):
        """메모리 정리"""
        if hasattr(self, 'model'):
            del self.model
        if hasattr(self, 'processor'):
            del self.processor

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        logger.info("🧹 메모리 정리 완료")


def main():
    """테스트 예제"""
    logger.info("=" * 60)
    logger.info("🦙 Llama 3.2 11B Vision Analyzer 테스트")
    logger.info("=" * 60)

    # Analyzer 초기화
    analyzer = LlamaVisionAnalyzer(quantization="int4")

    # 테스트 이미지 경로 (실제 경로로 변경 필요)
    test_image = "test_image.jpg"

    if os.path.exists(test_image):
        # 기본 분석
        logger.info("\n📸 이미지 분석 중...")
        result = analyzer.analyze_image(
            test_image,
            prompt="이 이미지에서 무엇이 보이나요? 자세히 설명해주세요."
        )
        logger.info(f"\n🤖 분석 결과:\n{result}\n")

        # VRAM 사용량 확인
        vram = analyzer.get_vram_usage()
        logger.info(f"📊 VRAM 사용량: {vram['allocated_gb']:.2f} GB")
    else:
        logger.info(f"\n⚠️  테스트 이미지 '{test_image}'를 찾을 수 없습니다.")
        logger.info("실제 이미지 경로를 지정하여 테스트하세요.")

    # 메모리 정리
    analyzer.cleanup()


if __name__ == "__main__":
    main()
