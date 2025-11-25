#!/usr/bin/env python3
"""
Llama 모델 다운로드 스크립트
"""
import os
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoProcessor, MllamaForConditionalGeneration

load_dotenv()


def download_llama_3_1():
    """Llama 3.1 8B Instruct 다운로드"""
    print("\n" + "="*60)
    print("🔄 Llama 3.1 8B Instruct 다운로드 시작")
    print("="*60)

    model_name = "meta-llama/Llama-3.1-8B-Instruct"
    token = os.getenv("HUGGINGFACE_TOKEN")

    if not token:
        print("❌ HUGGINGFACE_TOKEN이 설정되지 않았습니다!")
        print("💡 .env 파일에 HUGGINGFACE_TOKEN을 추가하세요.")
        return False

    try:
        print("\n1/2 토크나이저 다운로드 중...")
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=token)
        print("✅ 토크나이저 다운로드 완료")

        print("\n2/2 모델 다운로드 중... (약 15GB, 시간이 걸립니다)")
        model = AutoModelForCausalLM.from_pretrained(model_name, token=token)
        print("✅ 모델 다운로드 완료")

        print("\n🎉 Llama 3.1 8B Instruct 다운로드 완료!")
        return True

    except Exception as e:
        print(f"\n❌ 다운로드 실패: {e}")
        return False


def download_llama_3_2_vision():
    """Llama 3.2 11B Vision Instruct 다운로드"""
    print("\n" + "="*60)
    print("🔄 Llama 3.2 11B Vision Instruct 다운로드 시작")
    print("="*60)

    model_name = "meta-llama/Llama-3.2-11B-Vision-Instruct"
    token = os.getenv("HUGGINGFACE_TOKEN")

    if not token:
        print("❌ HUGGINGFACE_TOKEN이 설정되지 않았습니다!")
        print("💡 .env 파일에 HUGGINGFACE_TOKEN을 추가하세요.")
        return False

    try:
        print("\n1/3 토크나이저 다운로드 중...")
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=token)
        print("✅ 토크나이저 다운로드 완료")

        print("\n2/3 프로세서 다운로드 중...")
        processor = AutoProcessor.from_pretrained(model_name, token=token)
        print("✅ 프로세서 다운로드 완료")

        print("\n3/3 모델 다운로드 중... (약 22GB, 시간이 오래 걸립니다)")
        model = MllamaForConditionalGeneration.from_pretrained(model_name, token=token)
        print("✅ 모델 다운로드 완료")

        print("\n🎉 Llama 3.2 11B Vision Instruct 다운로드 완료!")
        return True

    except Exception as e:
        print(f"\n❌ 다운로드 실패: {e}")
        return False


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("🚀 Llama 모델 다운로드 도구")
    print("="*60)
    print("\n다운로드할 모델을 선택하세요:")
    print("  1. Llama 3.1 8B Instruct (~15GB)")
    print("  2. Llama 3.2 11B Vision Instruct (~22GB)")
    print("  3. 둘 다 다운로드 (~37GB)")
    print("  4. 종료")

    choice = input("\n선택 (1-4): ").strip()

    if choice == "1":
        download_llama_3_1()
    elif choice == "2":
        download_llama_3_2_vision()
    elif choice == "3":
        print("\n📦 모든 모델 다운로드 시작 (약 37GB)")
        success1 = download_llama_3_1()
        success2 = download_llama_3_2_vision()

        if success1 and success2:
            print("\n" + "="*60)
            print("🎉 모든 모델 다운로드 완료!")
            print("="*60)
        else:
            print("\n⚠️  일부 모델 다운로드 실패")
    elif choice == "4":
        print("\n✅ 종료합니다.")
    else:
        print("\n❌ 잘못된 선택입니다.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  사용자가 다운로드를 중단했습니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
