"""
Llama 3.1 8B Text Analyzer
텍스트 요약 및 합성을 위한 Llama 3.1 8B 모델 래퍼
"""
import torch
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class LlamaTextAnalyzer:
    """Llama 3.1 8B를 사용한 텍스트 분석 및 요약기"""

    def __init__(
        self,
        model_name: str = "meta-llama/Llama-3.1-8B-Instruct",
        quantization: Optional[str] = "int4"
    ):
        """
        Llama Text Analyzer 초기화

        Args:
            model_name: HuggingFace 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        self.model_name = model_name
        logger.info(f"🚀 Llama Text 모델 로딩 중: {model_name}")
        logger.info(f"📊 양자화: {quantization if quantization else 'FP16'}")
        logger.info(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n")

        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정에 따른 모델 로드
        if quantization == "int4" and torch.cuda.is_available():
            logger.info("⚙️  INT4 양자화 설정 (VRAM ~4GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                llm_int8_enable_fp32_cpu_offload=True
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        elif quantization == "int8" and torch.cuda.is_available():
            logger.info("⚙️  INT8 양자화 설정 (VRAM ~8GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_8bit=True,
                llm_int8_enable_fp32_cpu_offload=True
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            logger.info("⚙️  FP16 설정 (VRAM ~16GB)")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
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

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 40,
        repetition_penalty: float = 1.15
    ) -> str:
        """
        텍스트 생성

        Args:
            prompt: 사용자 프롬프트
            system_prompt: 시스템 프롬프트 (선택)
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도
            top_p: Top-p (nucleus) 샘플링 값
            top_k: Top-k 샘플링 값
            repetition_penalty: 반복 패널티 (1.0=없음, 높을수록 반복 방지)

        Returns:
            생성된 텍스트
        """
        # 메시지 구성
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # 채팅 템플릿 적용
        formatted_prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # 토큰화
        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt"
        ).to(self.model.device)

        # 생성
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                repetition_penalty=repetition_penalty,
                do_sample=True if temperature > 0 else False,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )

        # 디코딩 (입력 제거하고 생성된 부분만)
        generated_text = self.tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return generated_text.strip()

    def summarize_video(
        self,
        frame_analyses: List[str],
        transcript: str,
        max_tokens: int = 2048,
        temperature: float = 0.3
    ) -> str:
        """
        영상 프레임 분석 결과와 자막을 종합하여 요약

        Args:
            frame_analyses: 각 프레임의 시각 분석 결과 리스트
            transcript: 영상 자막/음성 텍스트
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도 (낮을수록 일관성 높음)

        Returns:
            종합 요약 결과
        """
        # 프레임 분석 결과 포매팅
        frame_summary = "\n\n".join([
            f"[프레임 {i+1}]\n{analysis}"
            for i, analysis in enumerate(frame_analyses)
        ])

        system_prompt = """당신은 영상 분석 전문가입니다.
영상의 주요 프레임 분석 결과와 음성/자막 내용을 종합하여
영상 전체를 이해하기 쉽게 요약해주세요."""

        user_prompt = f"""다음은 YouTube 영상 분석 결과입니다:

## 시각 정보 (주요 프레임 분석)
{frame_summary}

## 음성/자막 내용
{transcript}

---

위 정보를 바탕으로 다음 형식으로 영상을 종합 요약해주세요:

1. 영상 주제 및 개요
2. 주요 내용 (불릿 포인트)
3. 핵심 메시지
4. 주목할 만한 시각적 요소
"""

        return self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

    def synthesize_analysis(
        self,
        vision_results: List[Dict],
        transcript: str,
        additional_context: Optional[str] = None,
        max_tokens: int = 2048,
        temperature: float = 0.3
    ) -> str:
        """
        비전 분석 결과 (객체 감지, 장면 분류, OCR 등)와 텍스트를 종합

        Args:
            vision_results: 비전 분석 결과 딕셔너리 리스트
                예: [{"frame": 1, "objects": [...], "scene": "...", "text": "..."}]
            transcript: 영상 자막/음성 텍스트
            additional_context: 추가 컨텍스트 정보
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            종합 분석 결과
        """
        # 비전 결과 포매팅
        vision_summary = ""
        for result in vision_results:
            frame_num = result.get("frame", "?")
            vision_summary += f"\n[프레임 {frame_num}]\n"

            if "objects" in result:
                vision_summary += f"- 감지된 객체: {', '.join(result['objects'])}\n"
            if "scene" in result:
                vision_summary += f"- 장면 분류: {result['scene']}\n"
            if "text" in result and result["text"]:
                vision_summary += f"- 텍스트(OCR): {result['text']}\n"
            if "description" in result:
                vision_summary += f"- 설명: {result['description']}\n"

        system_prompt = """당신은 멀티모달 영상 분석 AI입니다.
컴퓨터 비전 분석 결과와 음성/자막을 종합하여
사용자가 이해하기 쉬운 마크다운 형식 리포트를 생성하세요."""

        user_prompt = f"""다음은 영상 분석 결과입니다:

## 컴퓨터 비전 분석
{vision_summary}

## 음성/자막
{transcript}
"""

        if additional_context:
            user_prompt += f"\n## 추가 정보\n{additional_context}\n"

        user_prompt += """
---

위 정보를 종합하여 다음 형식의 마크다운 리포트를 작성하세요:

# 영상 분석 리포트

## 요약

## 시각적 하이라이트

## 주요 내용

## 핵심 인사이트
"""

        return self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

    def extract_key_points(
        self,
        text: str,
        max_points: int = 5,
        max_tokens: int = 512,
        temperature: float = 0.3
    ) -> List[str]:
        """
        텍스트에서 핵심 포인트 추출

        Args:
            text: 입력 텍스트
            max_points: 최대 포인트 개수
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            핵심 포인트 리스트
        """
        prompt = f"""다음 텍스트에서 핵심 포인트 {max_points}개를 추출하세요.
각 포인트는 한 문장으로 간결하게 작성하고, 번호 없이 "-"로 시작하세요.

텍스트:
{text}

핵심 포인트:"""

        result = self.generate(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

        # 결과 파싱
        points = []
        for line in result.split("\n"):
            line = line.strip()
            if line.startswith("-") or line.startswith("•"):
                points.append(line.lstrip("-•").strip())
            elif line and len(points) < max_points:
                points.append(line)

        return points[:max_points]

    def generate_mindmap(
        self,
        video_title: str,
        frame_analyses: List[str],
        transcript: str,
        user_query: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.2
    ) -> str:
        """
        영상 내용을 바탕으로 마인드맵 구조를 JSON 형식으로 생성

        Args:
            video_title: 영상 제목
            frame_analyses: 프레임 분석 결과 리스트
            transcript: 영상 자막
            user_query: 사용자 질문/프롬프트 (예: "이 기술로 어떤 프로젝트를 만들 수 있을까?")
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도 (JSON 생성을 위해 낮게 설정)

        Returns:
            마인드맵 JSON 문자열
        """
        # 프레임 분석 요약
        frame_summary = "\n\n".join([
            f"[프레임 {i+1}] {analysis}"
            for i, analysis in enumerate(frame_analyses)
        ])

        # 기본 시스템 프롬프트
        system_prompt = """You are an expert at structuring information into mindmaps.
Analyze the given video content and convert it into a mindmap structure.
You can create hierarchies of unlimited depth.

**CRITICAL: You MUST respond ONLY with valid JSON. Do NOT include any explanatory text, backticks, or comments.**"""

        # 사용자 쿼리에 따른 프롬프트 구성
        if user_query:
            analysis_instruction = f"""
🎯 **USER'S SPECIFIC REQUEST (THIS IS THE PRIMARY GOAL):**
"{user_query}"

**CRITICAL INSTRUCTIONS:**
- Your ENTIRE mindmap MUST be focused on answering/explaining this user request
- The root keyword should reflect this topic (NOT just the video title)
- ALL children nodes must be directly relevant to this user question
- Extract ONLY the parts of the video that relate to this topic
- Ignore unrelated video content

**If user asks to "정리" (organize/list):**
- Create systematic categorization of items mentioned in video
- Each item should be a separate child node with specific details

**If user asks to "아이디어 확장" (expand ideas) or "어떻게 활용" (how to use):**
- You MUST create a separate child node called "활용 아이디어" or "확장 방안"
- Include minimum 3-5 CONCRETE, ACTIONABLE ideas with SPECIFIC DETAILS
- Each idea should include:
  * What to build/create (구체적 제품/서비스명)
  * How it works (기술적 구현 방법)
  * Target users/market (타겟 사용자)
  * Expected benefits (예상 효과 - 수치 포함)
  * Optional: estimated cost, timeline, technical requirements
- Be creative but PRACTICAL - avoid vague statements like "AI 도구 결합"

❌ BAD Idea Examples (TOO VAGUE):
- "AI 도구를 결합해서 사용"
- "업무 효율성 향상"
- "다양한 분야에 활용 가능"

✅ GOOD Idea Examples (CONCRETE & SPECIFIC):
- "Claude Skills + Haiku 4.5 결합 → '자동 코드 리뷰 시스템': GitHub PR 분석 후 버그 리포트 자동 생성, 예상 비용 월 $50, 개발 기간 2주, 팀 코드 품질 30% 향상 예상"
- "Veo 3.1 영상 생성 + 음성 AI → '5분 자동 뉴스 제작 시스템': 기사 텍스트 입력하면 영상+내레이션 자동 생성, 유튜브 채널 운영자 대상, 제작 시간 2시간→10분으로 단축"
- "Haiku 4.5 저비용 특성 활용 → '실시간 고객 상담 챗봇': 1000건 상담 비용 $0.5, 기존 GPT 대비 90% 절감, 24시간 자동 응답으로 고객 만족도 향상"

**Examples:**

Example 1 - "캐나다 관세 인상 이슈에 대해 설명해줘":
- Root: "캐나다 관세 인상 이슈"
- Children: Only Canada tariff content (ignore Argentina, Nike)

Example 2 - "영상에서 나온 AI들을 정리해주고 아이디어를 어떻게 확장할 수 있는지 생각해줘":
- Root: "영상 속 AI 도구 및 활용 아이디어"
- Children:
  - "AI 도구 목록" node with children:
    * "Claude Skills" → "자율 에이전트 프레임워크, 도구 통합 기능 제공, 2025년 출시"
    * "Haiku 4.5" → "Sonnet 3.5 수준 성능, 비용은 1/10 수준 ($0.4/1M), 속도 50% 향상"
    * "Veo 3.1" → "Google의 AI 영상 생성 모델, 텍스트→영상 변환, 실사 품질"
  - "활용 아이디어" node with CONCRETE children:
    * "자동 코드 리뷰 시스템" → "Claude Skills로 GitHub PR 분석 + Haiku 4.5로 리뷰 생성. 월 $50 비용, 2주 개발, 코드 품질 30% 향상"
    * "5분 자동 뉴스 제작" → "Veo 3.1로 영상 생성 + 음성 AI 결합. 유튜버 대상, 제작 시간 2시간→10분 단축"
    * "실시간 상담 챗봇" → "Haiku 4.5 저비용 특성 활용. 1000건 $0.5, GPT 대비 90% 절감, 24시간 자동 응답"
"""
        else:
            analysis_instruction = """
Organize the main content of the video hierarchically into a mindmap.
Structure main topics, subtopics, and details freely.
"""

        user_prompt = f"""Here is the YouTube video analysis:

**Video Title:** {video_title}

**Visual Information (Key Frames):**
{frame_summary}

**Audio/Transcript Content:**
{transcript}

---

{analysis_instruction}

**OUTPUT LANGUAGE: You MUST write all "keyword" and "description" fields in KOREAN (한국어).**

**MANDATORY RULES:**
1. Root node keyword:
   - If user query exists: Use the TOPIC from user's question (e.g., "캐나다 관세 인상 이슈")
   - If no user query: Use the video title
   - Root description should always include the YouTube URL
2. Each node MUST have "keyword" and "description" fields
   - **keyword**: Short, clear key phrase (3-5 words)
   - **description**: SPECIFIC FACTS from the video - numbers, dates, quotes, names, concrete details (NO abstract explanations!)
3. Use "children" array for child nodes (null if no children)
4. No depth limit - create as many levels as needed
5. **Output ONLY valid JSON. NO backticks (```), explanations, or comments**

**DO NOT use keywords as JSON keys! ALWAYS use "keyword" field!**

**Description Writing Rules - THIS IS CRITICAL:**
❌ BAD Examples (NEVER do this):
- "트럼프의 관세 인상에 대해 설명" (too abstract, no facts)
- "무역 관계에 대해 설명" (vague, no specifics)
- "캐나다와 미국의 무역이 어떻게 캐나다와 미국의 경제에 영향을 미치는지 설명" (just says "explain", no actual content)

✅ GOOD Examples (ALWAYS do this):
- "트럼프가 캐나다에 추가 10% 관세 부과. 레이건 광고를 오도적이라 비판. 11월 5일 대법원 심리 예정"
- "미-캐 무역 규모 $762B, 캐나다는 미국의 2위 무역 파트너. USMCA가 $650B 커버"
- "Ontario가 World Series 중 광고 방영 ($53M 지출), Reagan의 1987년 반관세 연설 인용"
- "Argentina 선거에서 Milei 41% 득표로 승리. 인플레이션 200%→32% 감소, 빈곤율 여전히 33%"
- "Nike의 새 전동 신발 2028년 출시 예정, 10-12분 마일 주자 대상"

**KEY PRINCIPLE: Extract WHO, WHAT, WHEN, WHERE, WHY, HOW with actual data from the video!**
- Include numbers, percentages, dollar amounts
- Include dates and timeframes
- Include names of people, companies, places
- Include direct quotes or paraphrases
- Include specific events and outcomes
- NO vague phrases like "에 대해 설명", "에 미치는 영향", "대해 다룸"

Correct format (NO user query):
{{
  "keyword": "Video Title Here",
  "description": "https://www.youtube.com/watch?v=...",
  "children": [
    {{
      "keyword": "Main Topic 1",
      "description": "SPECIFIC DETAILS: names, numbers, dates, quotes from this topic",
      "children": [
        {{
          "keyword": "Subtopic 1-1",
          "description": "MORE CONCRETE FACTS: what actually happened, who said what, exact figures",
          "children": null
        }}
      ]
    }}
  ]
}}

Correct format (WITH user query like "캐나다 관세 인상 이슈에 대해 설명해줘"):
{{
  "keyword": "캐나다 관세 인상 이슈",
  "description": "트럼프가 Ontario의 Reagan 광고에 반발하여 캐나다에 추가 10% 관세 부과. 미-캐 무역 $762B, 11월 5일 대법원 심리 예정. https://www.youtube.com/watch?v=...",
  "children": [
    {{
      "keyword": "관세 인상 배경",
      "description": "Ontario가 World Series 중 $53M 규모 Reagan 반관세 광고 방영. 1987년 연설 인용. Reagan Foundation이 오도 주장, 트럼프 무역협상 중단 후 추가 관세",
      "children": [
        {{
          "keyword": "Reagan 광고 논란",
          "description": "1987년 Reagan 라디오 연설 인용 (일본 반도체 관세 언급하며 전반적 반대 표명). Reagan Foundation은 오도라 주장하나 구체적 근거 제시 안 함",
          "children": null
        }}
      ]
    }},
    {{
      "keyword": "무역 규모와 영향",
      "description": "미-캐 무역 $762B (캐나다는 미국 2위 파트너). USMCA가 $650B 커버 (85%). 추가 10% 관세는 non-USMCA 품목 대상. 철강/알루미늄은 50% 관세",
      "children": null
    }},
    {{
      "keyword": "향후 전망",
      "description": "11월 5일 대법원이 Trump 관세 합법성 심리. 1977년 법 기반 '비상사태' 주장 여부 판단. 위헌 시 미국 기업들에 대규모 환급 발생",
      "children": null
    }}
  ]
}}

Wrong format (NEVER use):
{{
  "Video Title": {{
    "description": "...",
    "children": [...]
  }}
}}

Now output ONLY valid JSON following the correct format above:"""

        result = self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.85,  # JSON 생성에 최적화
            top_k=40,
            repetition_penalty=1.15
        )

        return result.strip()

    def organize_mindmap(
        self,
        nodes: List[Dict],
        max_tokens: int = 4096,
        temperature: float = 0.2
    ) -> str:
        """
        마인드맵의 text 노드들을 정리하여 구조 최적화

        Args:
            nodes: 전체 노드 리스트 (text, image, video 포함)
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도 (낮을수록 일관성 높음)

        Returns:
            정리된 text 노드 JSON 문자열
        """
        # text 노드만 추출
        text_nodes = [node for node in nodes if node.get('type') == 'text']

        if not text_nodes:
            return "[]"

        # 노드 정보를 텍스트로 구성
        nodes_text = []
        for node in text_nodes:
            node_info = f"""
노드 ID: {node.get('nodeId')}
부모 ID: {node.get('parentId')}
키워드: {node.get('keyword')}
메모: {node.get('memo')}
"""
            nodes_text.append(node_info.strip())

        nodes_summary = "\n\n".join(nodes_text)

        system_prompt = """You are an expert at organizing mindmap nodes. Your PRIMARY goal is to MERGE similar/duplicate nodes.

🎯 CORE RULES (READ CAREFULLY):
1. **MERGE DUPLICATES**: If 2+ nodes have similar meanings → combine into ONE node
2. **KEEP LANGUAGE**: Korean stays Korean, English stays English (NO translation)
3. **PROTECT ROOT**: Nodes with parentId=null → keep keyword/memo EXACTLY as-is

📚 FEW-SHOT EXAMPLES:

Example 1 - MERGING DUPLICATES:
INPUT:
[
  {"nodeId": 3, "parentId": 2, "keyword": "요구사항 분석하기", "memo": "사용자가 원하는 기능을 조사하고 분석"},
  {"nodeId": 4, "parentId": 2, "keyword": "요구사항 수집", "memo": "사용자 인터뷰를 통해 니즈 파악"}
]
OUTPUT (nodeId 4 removed, merged into 3):
[
  {"nodeId": 3, "parentId": 2, "keyword": "요구사항 분석 및 수집", "memo": "사용자가 원하는 기능을 조사하고 인터뷰를 통해 니즈를 파악"}
]

Example 2 - MORE MERGING:
INPUT:
[
  {"nodeId": 13, "parentId": 1, "keyword": "개발 진행", "memo": "실제 코딩 작업을 진행하는 단계"},
  {"nodeId": 14, "parentId": 13, "keyword": "개발 작업", "memo": "코드를 작성하고 구현하는 과정"}
]
OUTPUT (nodeId 14 removed, merged into 13):
[
  {"nodeId": 13, "parentId": 1, "keyword": "개발 진행", "memo": "실제 코딩 작업을 진행하고 코드를 작성하여 구현"}
]

Example 3 - ROOT NODE PROTECTION:
INPUT:
[
  {"nodeId": 1, "parentId": null, "keyword": "AI 협업 플랫폼 개발 프로젝트", "memo": "팀 협업을 위한 AI 기반 마인드맵 플랫폼 구축 프로젝트입니다. 이 내용은 절대 변경되면 안 됩니다!"}
]
OUTPUT (UNCHANGED):
[
  {"nodeId": 1, "parentId": null, "keyword": "AI 협업 플랫폼 개발 프로젝트", "memo": "팀 협업을 위한 AI 기반 마인드맵 플랫폼 구축 프로젝트입니다. 이 내용은 절대 변경되면 안 됩니다!"}
]

⚠️ CRITICAL: Output ONLY valid JSON array. NO explanations, NO markdown blocks, NO comments."""

        user_prompt = f"""Input nodes to organize:

{nodes_summary}

🎯 YOUR TASK:
1. **MERGE similar nodes** (reduce count by 20-30%)
2. **Keep same language** (Korean→Korean, English→English)
3. **Protect root nodes** (parentId=null → no changes)

Apply the FEW-SHOT EXAMPLES from above. Output ONLY JSON array:"""

        result = self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=0.1,  # 매우 낮게 설정 (일관성 향상)
            top_p=0.85,
            top_k=40,
            repetition_penalty=1.15
        )

        return result.strip()

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
        if hasattr(self, 'tokenizer'):
            del self.tokenizer

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        logger.info("🧹 메모리 정리 완료")


def main():
    """테스트 예제"""
    logger.info("=" * 60)
    logger.info("🦙 Llama 3.1 8B Text Analyzer 테스트")
    logger.info("=" * 60)

    # Analyzer 초기화
    analyzer = LlamaTextAnalyzer(quantization="int4")

    # 간단한 생성 테스트
    logger.info("\n📝 텍스트 생성 테스트...")
    result = analyzer.generate(
        "인공지능의 미래에 대해 3문장으로 설명해주세요.",
        temperature=0.7
    )
    logger.info(f"\n🤖 생성 결과:\n{result}\n")

    # VRAM 사용량 확인
    vram = analyzer.get_vram_usage()
    logger.info(f"📊 VRAM 사용량: {vram['allocated_gb']:.2f} GB")

    # 핵심 포인트 추출 테스트
    logger.info("\n📌 핵심 포인트 추출 테스트...")
    sample_text = """
    인공지능은 현대 사회에서 점점 더 중요한 역할을 하고 있습니다.
    의료, 교육, 금융, 제조업 등 다양한 분야에서 AI가 활용되고 있으며,
    특히 대규모 언어 모델의 발전으로 자연어 처리 능력이 크게 향상되었습니다.
    하지만 AI 윤리와 개인정보 보호 문제도 함께 고려해야 합니다.
    """
    points = analyzer.extract_key_points(sample_text, max_points=3)
    logger.info("핵심 포인트:")
    for i, point in enumerate(points, 1):
        logger.info(f"{i}. {point}")

    # 메모리 정리
    analyzer.cleanup()


if __name__ == "__main__":
    main()
