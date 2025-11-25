"""
FastAPI 기반 YouTube 영상 분석 API
- 비동기 영상 분석 처리
- 작업 상태 조회
- 결과 조회
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
import uuid
import os
import logging
from datetime import datetime
from enum import Enum
import json
import asyncio

import sys
from pathlib import Path
import re

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     %(message)s'
)
logger = logging.getLogger(__name__)

# 프로젝트 루트를 PYTHONPATH에 추가
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


def remove_repetitive_sentences(text: str, max_repetition: int = 2) -> str:
    """
    반복되는 문장을 제거하는 함수

    Args:
        text: 입력 텍스트
        max_repetition: 허용할 최대 반복 횟수

    Returns:
        반복이 제거된 텍스트
    """
    if not text:
        return text

    # 문장 단위로 분리 (마침표, 느낌표, 물음표 기준)
    sentences = re.split(r'([.!?]\s*)', text)

    # 분리된 문장을 다시 합치기 (구분자 포함)
    combined = []
    for i in range(0, len(sentences), 2):
        if i + 1 < len(sentences):
            combined.append(sentences[i] + sentences[i + 1])
        else:
            combined.append(sentences[i])

    # 연속된 중복 문장 제거
    result = []
    prev_sentence = None
    repeat_count = 0

    for sentence in combined:
        sentence = sentence.strip()
        if not sentence:
            continue

        if sentence == prev_sentence:
            repeat_count += 1
            if repeat_count < max_repetition:
                result.append(sentence)
        else:
            result.append(sentence)
            prev_sentence = sentence
            repeat_count = 0

    return ' '.join(result).strip()

from src.core import (
    # FrameExtractor,  # 사용 안함 (영상 다운로드 안함)
    TranscriptExtractor,
    LlamaVisionAnalyzer,
    LlamaTextAnalyzer
)
from src.core.image_analyzer import ImageAnalyzer
from src.api.models import (
    TaskStatus,
    AnalyzeRequest,
    ImageAnalyzeRequest,
    TextAnalyzeRequest,
    TaskResponse,
    AnalysisResult,
    ImageAnalysisResult,
    TextAnalysisResult,
    MindMapNode
)
from src.kafka.kafka_handler import kafka_handler, KafkaHandler
from src.kafka.analysis_processor import AnalysisProcessor
import torch

# Organize 전용 Kafka Handler
organize_kafka_handler: Optional[KafkaHandler] = None


# ============================================================================
# 전역 상태 저장소 (실제 프로덕션에서는 Redis 등 사용)
# ============================================================================

tasks: Dict[str, AnalysisResult] = {}

# 전역 모델 캐시 (서버 시작 시 한 번만 로드)
_vision_analyzer: Optional[LlamaVisionAnalyzer] = None
_text_analyzer: Optional[LlamaTextAnalyzer] = None
_models_loaded = False


# ============================================================================
# FastAPI 앱 초기화
# ============================================================================

app = FastAPI(
    title="YouTube Video Analysis API",
    description="Llama 3.2 Vision + Llama 3.1을 사용한 YouTube 영상 분석 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# 모델 로딩 함수
# ============================================================================

def load_models(vision_quantization: str = "int4", text_quantization: str = "int4"):
    """
    서버 시작 시 모델을 한 번만 로드합니다.

    Args:
        vision_quantization: Vision 모델 양자화 방식 (int4/int8/bfloat16)
        text_quantization: Text 모델 양자화 방식 (int4/int8/fp16)
    """
    global _vision_analyzer, _text_analyzer, _models_loaded

    if _models_loaded:
        logger.info("모델이 이미 로드되어 있습니다.")
        return

    logger.info("=== 모델 로딩 시작 ===")

    # Vision 모델 로드
    logger.info(f"Vision 모델 로딩 중... (quantization: {vision_quantization})")
    _vision_analyzer = LlamaVisionAnalyzer(quantization=vision_quantization)
    logger.info("✅ Vision 모델 로드 완료")

    # Text 모델 로드
    logger.info(f"Text 모델 로딩 중... (quantization: {text_quantization})")
    _text_analyzer = LlamaTextAnalyzer(quantization=text_quantization)
    logger.info("✅ Text 모델 로드 완료")

    _models_loaded = True
    logger.info("=== 모든 모델 로딩 완료 ===")


def get_vision_analyzer() -> LlamaVisionAnalyzer:
    """Vision 분석기 인스턴스 반환"""
    if not _models_loaded or _vision_analyzer is None:
        raise RuntimeError("모델이 로드되지 않았습니다. 서버 시작 시 모델을 로드해주세요.")
    return _vision_analyzer


def get_text_analyzer() -> LlamaTextAnalyzer:
    """Text 분석기 인스턴스 반환"""
    if not _models_loaded or _text_analyzer is None:
        raise RuntimeError("모델이 로드되지 않았습니다. 서버 시작 시 모델을 로드해주세요.")
    return _text_analyzer


def create_fallback_mindmap(
    video_title: str,
    frame_analyses: List[str],
    transcript: str
) -> MindMapNode:
    """
    LLM 실패 시 기본 마인드맵 생성 (폴백)

    Args:
        video_title: 영상 제목
        frame_analyses: 프레임 분석 결과 리스트
        transcript: 영상 자막

    Returns:
        기본 마인드맵 루트 노드
    """
    # 루트 노드
    root = MindMapNode(
        keyword=video_title,
        description="영상 분석 결과",
        children=[]
    )

    # 자막 노드
    if transcript and transcript != "[자막 없음]":
        transcript_node = MindMapNode(
            keyword="음성/자막 내용",
            description=transcript[:500] + "..." if len(transcript) > 500 else transcript,
            children=None
        )
        root.children.append(transcript_node)

    # 프레임 분석 노드
    frame_children = []
    for i, analysis in enumerate(frame_analyses):
        frame_node = MindMapNode(
            keyword=f"프레임 {i+1}",
            description=analysis,
            children=None
        )
        frame_children.append(frame_node)

    if frame_children:
        frames_parent = MindMapNode(
            keyword="시각 분석",
            description=f"총 {len(frame_children)}개 프레임 분석",
            children=frame_children
        )
        root.children.append(frames_parent)

    return root


def create_mindmap_from_image_llm(
    image_url: str,
    image_analysis: str,
    user_query: Optional[str] = None
) -> MindMapNode:
    """
    이미지 분석으로부터 LLM을 사용하여 마인드맵 생성

    Args:
        image_url: 이미지 URL
        image_analysis: Vision 모델의 이미지 분석 결과
        user_query: 사용자 질문/프롬프트

    Returns:
        마인드맵 루트 노드
    """
    try:
        text_analyzer = get_text_analyzer()

        # 이미지 분석 기반 마인드맵 생성 프롬프트
        if user_query:
            system_prompt = f"""당신은 이미지 분석 결과를 구조화된 마인드맵으로 변환하는 전문가입니다.

사용자 질문: {user_query}

이미지 분석 결과를 바탕으로 사용자 질문에 초점을 맞춘 마인드맵을 생성하세요.
마인드맵은 반드시 다음 JSON 형식으로 작성해야 합니다:

{{
  "keyword": "사용자 질문의 핵심 주제",
  "description": "{image_url}",
  "children": [
    {{
      "keyword": "주요 카테고리 1",
      "description": "구체적인 사실, 숫자, 특징",
      "children": [
        {{
          "keyword": "세부 항목",
          "description": "상세 설명",
          "children": null
        }}
      ]
    }}
  ]
}}

**중요 규칙:**
1. 반드시 "keyword", "description", "children" 키를 사용하세요
2. keyword를 JSON 키로 사용하지 마세요
3. description에는 구체적인 사실, 숫자, 특징을 포함하세요
4. 이미지에서 관찰된 구체적인 내용을 기반으로 작성하세요
5. JSON만 출력하고, 마크다운 코드 블록(```)은 사용하지 마세요
"""
        else:
            system_prompt = f"""당신은 이미지 분석 결과를 구조화된 마인드맵으로 변환하는 전문가입니다.

이미지 분석 결과를 바탕으로 포괄적인 마인드맵을 생성하세요.
마인드맵은 반드시 다음 JSON 형식으로 작성해야 합니다:

{{
  "keyword": "이미지 주요 주제",
  "description": "{image_url}",
  "children": [
    {{
      "keyword": "주요 카테고리 1",
      "description": "구체적인 사실, 숫자, 특징",
      "children": [
        {{
          "keyword": "세부 항목",
          "description": "상세 설명",
          "children": null
        }}
      ]
    }}
  ]
}}

**중요 규칙:**
1. 반드시 "keyword", "description", "children" 키를 사용하세요
2. keyword를 JSON 키로 사용하지 마세요
3. description에는 구체적인 사실, 숫자, 특징을 포함하세요
4. 이미지에서 관찰된 객체, 색상, 구조, 텍스트 등을 체계적으로 정리하세요
5. JSON만 출력하고, 마크다운 코드 블록(```)은 사용하지 마세요
"""

        user_prompt_text = f"""이미지 분석 결과:
{image_analysis}

위 분석 결과를 바탕으로 마인드맵 JSON을 생성해주세요."""

        mindmap_json_str = text_analyzer.generate(
            prompt=user_prompt_text,
            system_prompt=system_prompt,
            max_tokens=4096,
            temperature=0.2,
            top_p=0.85,
            top_k=40,
            repetition_penalty=1.15
        )

        print("=" * 80)
        print("이미지 마인드맵 LLM 생성 원본 출력:")
        print(mindmap_json_str[:1000])
        print("=" * 80)

        # JSON 파싱 (마크다운 코드 블록 제거)
        mindmap_json_str = mindmap_json_str.strip()
        if mindmap_json_str.startswith('```json'):
            mindmap_json_str = mindmap_json_str[7:]
        if mindmap_json_str.startswith('```'):
            mindmap_json_str = mindmap_json_str[3:]
        if mindmap_json_str.endswith('```'):
            mindmap_json_str = mindmap_json_str[:-3]
        mindmap_json_str = mindmap_json_str.strip()

        # JSON을 MindMapNode로 변환
        def json_to_mindmap_node(data: Dict) -> MindMapNode:
            children = None
            if 'children' in data and data['children']:
                children = [json_to_mindmap_node(child) for child in data['children']]

            return MindMapNode(
                keyword=data.get('keyword', ''),
                description=data.get('description', ''),
                children=children
            )

        mindmap_data = json.loads(mindmap_json_str)

        # 잘못된 형식 수정
        if 'keyword' not in mindmap_data and 'description' not in mindmap_data:
            first_key = list(mindmap_data.keys())[0]
            first_value = mindmap_data[first_key]
            mindmap_data = {
                'keyword': first_key,
                'description': first_value.get('description', image_url),
                'children': first_value.get('children', None)
            }

        root = json_to_mindmap_node(mindmap_data)

        # 루트 노드 description을 이미지 URL로 설정
        root.description = image_url

        print(f"✅ 이미지 마인드맵 생성: keyword='{root.keyword}', children={len(root.children) if root.children else 0}")

        return root

    except Exception as e:
        logger.error(f"이미지 마인드맵 생성 실패: {e}")
        # 폴백: 간단한 마인드맵 생성
        return MindMapNode(
            keyword="이미지 분석",
            description=image_url,
            children=[
                MindMapNode(
                    keyword="분석 결과",
                    description=image_analysis[:500] if len(image_analysis) > 500 else image_analysis,
                    children=None
                )
            ]
        )


def create_mindmap_from_text_llm(
    text_prompt: str,
    detail_level: str = "medium"
) -> MindMapNode:
    """
    텍스트 프롬프트로부터 LLM을 사용하여 마인드맵 생성

    Args:
        text_prompt: 사용자 입력 텍스트/주제
        detail_level: 상세 수준 ("simple", "medium", "detailed")

    Returns:
        마인드맵 루트 노드
    """
    try:
        text_analyzer = get_text_analyzer()

        # 상세 수준에 따른 토큰 수 및 지시사항 설정
        if detail_level == "simple":
            max_tokens = 2048
            depth_instruction = "최대 2단계 깊이로 간단하게 구성하세요."
            detail_instruction = "각 노드는 핵심 키워드와 짧은 설명만 포함하세요."
        elif detail_level == "detailed":
            max_tokens = 6144
            depth_instruction = "최대 4-5단계 깊이로 매우 상세하게 구성하세요."
            detail_instruction = "각 노드에 구체적인 예시, 수치, 근거를 포함하세요."
        else:  # medium
            max_tokens = 4096
            depth_instruction = "최대 3-4단계 깊이로 적절하게 구성하세요."
            detail_instruction = "각 노드에 중요한 정보와 설명을 포함하세요."

        system_prompt = f"""당신은 텍스트를 구조화된 마인드맵으로 변환하는 전문가입니다.

사용자가 제공한 주제나 텍스트를 분석하여 체계적인 마인드맵을 생성하세요.
마인드맵은 반드시 다음 JSON 형식으로 작성해야 합니다:

{{
  "keyword": "주제의 핵심 키워드",
  "description": "주제에 대한 간단한 설명 또는 정의",
  "children": [
    {{
      "keyword": "주요 카테고리 1",
      "description": "구체적인 설명, 예시, 특징",
      "children": [
        {{
          "keyword": "세부 항목",
          "description": "상세 내용",
          "children": null
        }}
      ]
    }},
    {{
      "keyword": "주요 카테고리 2",
      "description": "구체적인 설명",
      "children": null
    }}
  ]
}}

**중요 규칙:**
1. 반드시 "keyword", "description", "children" 키를 사용하세요
2. keyword를 JSON 키로 사용하지 마세요
3. {depth_instruction}
4. {detail_instruction}
5. 논리적 계층 구조를 만드세요 (상위 개념 → 하위 개념)
6. 구체적인 사실, 예시, 수치를 포함하세요
7. JSON만 출력하고, 마크다운 코드 블록(```)은 사용하지 마세요

주제 분석 가이드:
- 개념/용어인 경우: 정의 → 특징 → 유형 → 예시 → 응용
- 프로세스/절차인 경우: 단계별 분해 → 각 단계의 세부사항
- 비교/대조인 경우: 항목별 비교 → 차이점과 공통점
- 역사/시간순인 경우: 시대별/단계별 구분 → 주요 사건/특징
- 문제/해결인 경우: 문제 정의 → 원인 → 해결방안 → 기대효과
"""

        user_prompt_text = f"""주제/텍스트: {text_prompt}

위 내용을 바탕으로 체계적인 마인드맵 JSON을 생성해주세요."""

        mindmap_json_str = text_analyzer.generate(
            prompt=user_prompt_text,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=0.2,
            top_p=0.85,
            top_k=40,
            repetition_penalty=1.15
        )

        print("=" * 80)
        print("텍스트 마인드맵 LLM 생성 원본 출력:")
        print(mindmap_json_str[:1000])
        print("=" * 80)

        # JSON 파싱 (마크다운 코드 블록 제거)
        mindmap_json_str = mindmap_json_str.strip()
        if mindmap_json_str.startswith('```json'):
            mindmap_json_str = mindmap_json_str[7:]
        if mindmap_json_str.startswith('```'):
            mindmap_json_str = mindmap_json_str[3:]
        if mindmap_json_str.endswith('```'):
            mindmap_json_str = mindmap_json_str[:-3]
        mindmap_json_str = mindmap_json_str.strip()

        # JSON을 MindMapNode로 변환
        def json_to_mindmap_node(data: Dict) -> MindMapNode:
            children = None
            if 'children' in data and data['children']:
                children = [json_to_mindmap_node(child) for child in data['children']]

            return MindMapNode(
                keyword=data.get('keyword', ''),
                description=data.get('description', ''),
                children=children
            )

        mindmap_data = json.loads(mindmap_json_str)

        # 잘못된 형식 수정
        if 'keyword' not in mindmap_data and 'description' not in mindmap_data:
            first_key = list(mindmap_data.keys())[0]
            first_value = mindmap_data[first_key]
            mindmap_data = {
                'keyword': first_key,
                'description': first_value.get('description', ''),
                'children': first_value.get('children', None)
            }

        root = json_to_mindmap_node(mindmap_data)

        print(f"✅ 텍스트 마인드맵 생성: keyword='{root.keyword}', children={len(root.children) if root.children else 0}")

        return root

    except Exception as e:
        logger.error(f"텍스트 마인드맵 생성 실패: {e}")
        # 폴백: 간단한 마인드맵 생성
        return MindMapNode(
            keyword=text_prompt[:50] if len(text_prompt) <= 50 else text_prompt[:47] + "...",
            description="AI가 생성한 마인드맵",
            children=[
                MindMapNode(
                    keyword="분석 필요",
                    description="이 주제에 대한 상세 분석이 필요합니다.",
                    children=None
                )
            ]
        )


def create_mindmap_from_llm(
    video_title: str,
    frame_analyses: List[str],
    transcript: str,
    user_query: Optional[str] = None,
    youtube_url: Optional[str] = None
) -> MindMapNode:
    """
    LLM을 사용하여 마인드맵 데이터 생성 (폴백 보장)

    Args:
        video_title: 영상 제목
        frame_analyses: 프레임 분석 결과 리스트
        transcript: 영상 자막
        user_query: 사용자 질문/프롬프트
        youtube_url: YouTube URL

    Returns:
        마인드맵 루트 노드 (항상 None이 아님)
    """
    try:
        text_analyzer = get_text_analyzer()

        # LLM으로 마인드맵 JSON 생성
        mindmap_json_str = text_analyzer.generate_mindmap(
            video_title=video_title,
            frame_analyses=frame_analyses,
            transcript=transcript,
            user_query=user_query,
            max_tokens=4096,
            temperature=0.7
        )

        print("=" * 80)
        print("LLM 마인드맵 생성 원본 출력:")
        print(mindmap_json_str[:1000])  # 처음 1000자
        print("=" * 80)

        # JSON 파싱
        # LLM이 ```json ``` 로 감싸서 반환할 수 있으므로 제거
        mindmap_json_str = mindmap_json_str.strip()
        if mindmap_json_str.startswith('```json'):
            mindmap_json_str = mindmap_json_str[7:]
        if mindmap_json_str.startswith('```'):
            mindmap_json_str = mindmap_json_str[3:]
        if mindmap_json_str.endswith('```'):
            mindmap_json_str = mindmap_json_str[:-3]
        mindmap_json_str = mindmap_json_str.strip()

        print("정제 후 JSON:")
        print(mindmap_json_str[:500])
        print("=" * 80)

        # JSON을 MindMapNode로 변환
        def json_to_mindmap_node(data: Dict) -> MindMapNode:
            children = None
            if 'children' in data and data['children']:
                children = [json_to_mindmap_node(child) for child in data['children']]

            return MindMapNode(
                keyword=data.get('keyword', ''),
                description=data.get('description', ''),
                children=children
            )

        mindmap_data = json.loads(mindmap_json_str)

        # LLM이 잘못된 형식으로 생성한 경우 수정
        # {"영상 제목": {"description": ..., "children": ...}} 형식을 감지
        if 'keyword' not in mindmap_data and 'description' not in mindmap_data:
            # 첫 번째 키를 keyword로 사용
            first_key = list(mindmap_data.keys())[0]
            first_value = mindmap_data[first_key]

            print(f"⚠️  잘못된 JSON 형식 감지! 자동 수정 중...")
            print(f"   키워드: {first_key}")

            # 올바른 형식으로 재구성
            mindmap_data = {
                'keyword': first_key,
                'description': first_value.get('description', ''),
                'children': first_value.get('children', None)
            }

        root = json_to_mindmap_node(mindmap_data)

        print(f"생성된 마인드맵 루트: keyword='{root.keyword}', children={len(root.children) if root.children else 0}")
        print("=" * 80)

        # 유효성 검증
        if not root.keyword or not root.children:
            logger.warning(f"LLM 생성 마인드맵이 불완전함. keyword={root.keyword}, children={root.children}")
            logger.warning("폴백 마인드맵 사용.")
            return create_fallback_mindmap(video_title, frame_analyses, transcript)

        # 루트 노드 강제 설정: keyword=영상 제목, description=YouTube URL
        root.keyword = video_title
        root.description = youtube_url if youtube_url else root.description

        print(f"✅ 루트 노드 설정: keyword='{root.keyword}', description='{root.description[:50]}...'")

        return root

    except json.JSONDecodeError as e:
        logger.error(f"마인드맵 JSON 파싱 실패: {e}")
        logger.error(f"LLM 출력: {mindmap_json_str[:500] if 'mindmap_json_str' in locals() else 'N/A'}")
        logger.info("폴백 마인드맵 생성 중...")
        return create_fallback_mindmap(video_title, frame_analyses, transcript)
    except Exception as e:
        logger.error(f"마인드맵 생성 실패: {e}")
        logger.info("폴백 마인드맵 생성 중...")
        return create_fallback_mindmap(video_title, frame_analyses, transcript)


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드 및 Kafka Consumer 시작"""
    global organize_kafka_handler

    # 환경 변수로 양자화 방식 설정 가능
    vision_quant = os.getenv("VISION_QUANTIZATION", "int4")
    text_quant = os.getenv("TEXT_QUANTIZATION", "int4")

    load_models(vision_quantization=vision_quant, text_quantization=text_quant)

    # Analysis Processor 생성
    text_analyzer = get_text_analyzer()
    vision_analyzer = get_vision_analyzer()
    analysis_processor = AnalysisProcessor(text_analyzer, vision_analyzer)

    # 1. Analysis Kafka Consumer 시작
    logger.info("Analysis Kafka Consumer 시작 중...")
    kafka_handler.set_analysis_callback(analysis_processor.process_request)

    if kafka_handler.start():
        logger.info("✅ Analysis Kafka Consumer 시작 완료")
    else:
        logger.error("❌ Analysis Kafka Consumer 시작 실패")

    # 2. Organize Kafka Consumer 시작
    logger.info("Organize Kafka Consumer 시작 중...")
    organize_kafka_handler = KafkaHandler(topics={
        'request': os.getenv('KAFKA_ORGANIZE_REQUEST_TOPIC', 'ai.organize.request'),
        'response': os.getenv('KAFKA_ORGANIZE_RESULT_TOPIC', 'ai.organize.result')
    })
    organize_kafka_handler.set_analysis_callback(analysis_processor.process_organize)

    if organize_kafka_handler.start():
        logger.info("✅ Organize Kafka Consumer 시작 완료")
    else:
        logger.error("❌ Organize Kafka Consumer 시작 실패")


@app.on_event("shutdown")
async def shutdown_event():
    """서버 종료 시 Kafka Consumer 종료"""
    logger.info("Analysis Kafka Consumer 종료 중...")
    kafka_handler.stop()

    if organize_kafka_handler:
        logger.info("Organize Kafka Consumer 종료 중...")
        organize_kafka_handler.stop()


# ============================================================================
# 분석 함수
# ============================================================================

def analyze_video_sync(
    youtube_url: str,
    max_frames: Optional[int],
    proxy: Optional[str],
    user_prompt: Optional[str] = None
) -> AnalysisResult:
    """
    영상 분석을 수행하고 결과를 반환합니다. (자막 기반 - 영상 다운로드 없음)
    """
    task_id = str(uuid.uuid4())

    # 초기 결과 객체 생성
    result = AnalysisResult(
        task_id=task_id,
        status=TaskStatus.EXTRACTING_TRANSCRIPT,
        youtube_url=youtube_url,
        created_at=datetime.now().isoformat()
    )

    try:
        # 1. 자막 추출 (ngrok 서버 사용)
        logger.info("자막 추출 시작...")
        transcript_result = TranscriptExtractor.get_transcript(
            youtube_url,
            languages=['ko', 'en']
        )

        if not transcript_result['success']:
            raise Exception(f"자막 추출 실패: {transcript_result['error']}")

        transcript = transcript_result['full_text']
        video_id = transcript_result['video_id']

        result.video_info = {
            "video_id": video_id,
            "title": f"YouTube Video {video_id}",  # 제목 정보 없음
            "subtitle_method": transcript_result['method']
        }
        result.transcript = transcript

        # 2. 마인드맵 생성 (자막 기반)
        result.status = TaskStatus.CREATING_MINDMAP
        logger.info("마인드맵 생성 중...")

        text_analyzer = get_text_analyzer()

        # 자막 기반 마인드맵 생성
        mindmap = create_mindmap_from_llm(
            video_title=f"YouTube Video {video_id}",
            frame_analyses=[],  # 프레임 분석 없음
            transcript=transcript,
            user_query=user_prompt,
            youtube_url=youtube_url
        )

        result.mindmap = mindmap
        result.frame_analyses = []  # 프레임 분석 없음
        result.summary = None  # summary는 마인드맵으로 대체
        result.key_points = None  # key_points는 마인드맵으로 대체

        # 완료
        result.status = TaskStatus.COMPLETED
        result.completed_at = datetime.now().isoformat()

    except Exception as e:
        result.status = TaskStatus.FAILED
        result.error = str(e)
        result.completed_at = datetime.now().isoformat()

    return result


async def analyze_video_stream(
    youtube_url: str,
    max_frames: Optional[int],
    proxy: Optional[str],
    user_prompt: Optional[str] = None
):
    """
    영상 분석을 수행하면서 실시간으로 진행 상황을 스트리밍합니다. (자막 기반 - 영상 다운로드 없음)
    """
    task_id = str(uuid.uuid4())

    try:
        # 시작 메시지
        yield f"data: {json.dumps({'status': 'started', 'task_id': task_id, 'progress': 0, 'message': '분석 시작'})}\n\n"
        await asyncio.sleep(0.1)

        # 1. 자막 추출 (ngrok 서버 사용)
        yield f"data: {json.dumps({'status': 'extracting_transcript', 'progress': 20, 'message': 'ngrok 서버로부터 자막 추출 중...'})}\n\n"
        await asyncio.sleep(0.1)

        transcript_result = TranscriptExtractor.get_transcript(
            youtube_url,
            languages=['ko', 'en']
        )

        if not transcript_result['success']:
            error_msg = f"자막 추출 실패: {transcript_result['error']}"
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"
            return

        transcript = transcript_result['full_text']
        video_id = transcript_result['video_id']

        video_info = {
            "video_id": video_id,
            "title": f"YouTube Video {video_id}",
            "subtitle_method": transcript_result['method']
        }

        message = f"자막 추출 완료: {len(transcript_result['segments'])}개 세그먼트"
        yield f"data: {json.dumps({'status': 'transcript_extracted', 'progress': 50, 'message': message, 'video_info': video_info})}\n\n"
        await asyncio.sleep(0.1)

        # 2. 마인드맵 생성 (자막 기반)
        yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 60, 'message': 'LLM으로 마인드맵 생성 중...'})}\n\n"
        await asyncio.sleep(0.1)

        mindmap = create_mindmap_from_llm(
            video_title=f"YouTube Video {video_id}",
            frame_analyses=[],  # 프레임 분석 없음
            transcript=transcript,
            user_query=user_prompt,
            youtube_url=youtube_url
        )

        yield f"data: {json.dumps({'status': 'mindmap_complete', 'progress': 95, 'message': '마인드맵 생성 완료'})}\n\n"
        await asyncio.sleep(0.1)

        # 최종 결과
        result = {
            "task_id": task_id,
            "status": "completed",
            "youtube_url": youtube_url,
            "created_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat(),
            "video_info": video_info,
            "summary": None,  # 자막 기반이므로 summary 제외
            "key_points": None,  # 자막 기반이므로 key_points 제외
            "frame_analyses": [],  # 프레임 분석 없음
            "transcript": transcript,
            "mindmap": mindmap.dict()  # 마인드맵 데이터 (항상 존재)
        }

        yield f"data: {json.dumps({'status': 'completed', 'progress': 100, 'message': '분석 완료!', 'result': result}, ensure_ascii=False)}\n\n"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"분석 중 오류 발생: {error_msg}")
        yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"


# ============================================================================
# API 엔드포인트
# ============================================================================

@app.get("/")
def root():
    """API 정보"""
    return {
        "name": "AI Analysis API - Video, Image & Text",
        "version": "2.0.0",
        "description": "Llama 3.2 Vision + Llama 3.1을 사용한 멀티모달 분석 및 마인드맵 생성 (자막 기반)",
        "note": "YouTube 분석은 영상 다운로드 없이 ngrok 서버를 통한 자막만 사용합니다",
        "endpoints": {
            "POST /analyze/youtube": "YouTube 영상 분석 (스트리밍, 자막 기반)",
            "POST /analyze/youtube/sync": "YouTube 영상 분석 (동기식, 자막 기반)",
            "POST /analyze/image": "이미지 URL 분석 (스트리밍)",
            "POST /analyze/text": "텍스트 프롬프트 분석 (스트리밍)",
            "GET /tasks/{task_id}": "작업 상태 및 결과 조회",
            "GET /tasks": "모든 작업 목록 조회",
            "DELETE /tasks/{task_id}": "작업 삭제",
            "GET /health": "헬스 체크"
        }
    }


@app.post("/analyze/youtube")
async def analyze_video(request: AnalyzeRequest):
    """
    YouTube 영상 분석 (스트리밍 - 자막 기반)

    Server-Sent Events (SSE) 형식으로 실시간 진행 상황을 전달합니다.

    ⚠️ **중요**: 이 API는 영상 다운로드를 하지 않고 자막만 사용합니다.
    ngrok 서버를 통해 자막을 가져와서 마인드맵을 생성합니다.

    - **youtube_url**: YouTube 영상 URL
    - **user_prompt**: 사용자 질문/프롬프트 (선택)

    ### 응답 형식 (SSE)
    각 이벤트는 다음 형식으로 전달됩니다:
    ```
    data: {"status": "...", "progress": 0-100, "message": "...", ...}
    ```

    ### 상태 종류
    - `started`: 분석 시작
    - `extracting_transcript`: ngrok 서버로부터 자막 추출 중
    - `transcript_extracted`: 자막 추출 완료
    - `creating_mindmap`: 마인드맵 생성 중
    - `mindmap_complete`: 마인드맵 생성 완료
    - `completed`: 분석 완료 (result 포함)
    - `failed`: 오류 발생 (error 포함)
    """
    return StreamingResponse(
        analyze_video_stream(
            youtube_url=str(request.youtube_url),
            max_frames=request.max_frames,
            proxy=request.proxy,
            user_prompt=request.user_prompt
        ),
        media_type="text/event-stream"
    )


@app.post("/analyze/youtube/sync", response_model=AnalysisResult)
def analyze_video_sync_endpoint(request: AnalyzeRequest):
    """
    YouTube 영상 분석 (동기식 - 자막 기반)

    ⚠️ **중요**: 이 API는 영상 다운로드를 하지 않고 자막만 사용합니다.
    ngrok 서버를 통해 자막을 가져와서 마인드맵을 생성합니다.

    타임아웃이 발생할 수 있으므로 /analyze/youtube (스트리밍) 사용을 권장합니다.

    - **youtube_url**: YouTube 영상 URL
    - **user_prompt**: 사용자 질문/프롬프트 (선택)
    """
    result = analyze_video_sync(
        youtube_url=str(request.youtube_url),
        max_frames=request.max_frames,
        proxy=request.proxy,
        user_prompt=request.user_prompt
    )

    return result


@app.get("/tasks/{task_id}", response_model=AnalysisResult)
async def get_task(task_id: str):
    """
    작업 상태 및 결과 조회

    - **task_id**: 작업 ID
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    return tasks[task_id]


@app.get("/tasks")
async def list_tasks():
    """
    모든 작업 목록 조회
    """
    return {
        "total": len(tasks),
        "tasks": [
            {
                "task_id": task.task_id,
                "status": task.status,
                "youtube_url": task.youtube_url,
                "created_at": task.created_at,
                "completed_at": task.completed_at
            }
            for task in tasks.values()
        ]
    }


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """
    작업 삭제

    - **task_id**: 작업 ID
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    del tasks[task_id]

    return {
        "message": f"작업 {task_id}가 삭제되었습니다."
    }


@app.get("/health")
async def health_check():
    """
    헬스 체크
    """
    gpu_available = torch.cuda.is_available()

    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "gpu_name": torch.cuda.get_device_name(0) if gpu_available else None,
        "models_loaded": _models_loaded,
        "vision_model_loaded": _vision_analyzer is not None,
        "text_model_loaded": _text_analyzer is not None,
        "active_tasks": sum(1 for task in tasks.values() if task.status not in [TaskStatus.COMPLETED, TaskStatus.FAILED])
    }


# ============================================================================
# 이미지 분석 API
# ============================================================================

async def analyze_image_stream(
    image_url: str,
    user_prompt: Optional[str] = None
):
    """
    이미지 분석을 수행하면서 실시간으로 진행 상황을 스트리밍합니다.
    """
    task_id = str(uuid.uuid4())
    output_dir = f"temp_image_analysis_{task_id}"

    try:
        # 시작 메시지
        yield f"data: {json.dumps({'status': 'started', 'task_id': task_id, 'progress': 0, 'message': '이미지 분석 시작'})}\n\n"
        await asyncio.sleep(0.1)

        # 1. 이미지 다운로드
        yield f"data: {json.dumps({'status': 'downloading_image', 'progress': 10, 'message': '이미지 다운로드 중...'})}\n\n"
        await asyncio.sleep(0.1)

        os.makedirs(output_dir, exist_ok=True)
        image_analyzer = ImageAnalyzer(output_dir=output_dir)

        image_path = image_analyzer.download_image(image_url)
        if not image_path:
            error_msg = "이미지 다운로드 실패"
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"
            return

        # 이미지 메타데이터 추출
        from PIL import Image
        with Image.open(image_path) as img:
            image_info = {
                "format": img.format,
                "size": img.size,
                "mode": img.mode,
                "width": img.width,
                "height": img.height
            }

        message = f"이미지 다운로드 완료: {image_info['width']}x{image_info['height']}, {image_info['format']}"
        yield f"data: {json.dumps({'status': 'download_complete', 'progress': 30, 'message': message, 'image_info': image_info})}\n\n"
        await asyncio.sleep(0.1)

        # 2. Vision 분석
        yield f"data: {json.dumps({'status': 'analyzing_vision', 'progress': 40, 'message': 'Vision 모델로 이미지 분석 중...'})}\n\n"
        await asyncio.sleep(0.1)

        vision_analyzer = get_vision_analyzer()

        # 프롬프트 구성
        if user_prompt:
            final_prompt = f"""{user_prompt}

다음을 포함하여 상세하게 설명해주세요:
1. 이미지의 주요 객체와 구성
2. 색상과 시각적 특징
3. 텍스트가 있다면 그 내용
4. 전체적인 분위기와 맥락"""
        else:
            final_prompt = """이 이미지를 상세하게 분석해주세요:
1. 주요 객체와 구성
2. 색상과 시각적 특징
3. 화면에 보이는 텍스트
4. 전체적인 분위기와 맥락"""

        analysis = vision_analyzer.analyze_image(
            image=image_path,
            prompt=final_prompt,
            max_tokens=500,
            temperature=0.3
        )

        # 반복 문장 제거
        cleaned_analysis = remove_repetitive_sentences(analysis, max_repetition=1)

        yield f"data: {json.dumps({'status': 'vision_complete', 'progress': 70, 'message': 'Vision 분석 완료'})}\n\n"
        await asyncio.sleep(0.1)

        # 3. 마인드맵 생성
        yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 80, 'message': 'LLM으로 마인드맵 생성 중...'})}\n\n"
        await asyncio.sleep(0.1)

        mindmap = create_mindmap_from_image_llm(
            image_url=image_url,
            image_analysis=cleaned_analysis,
            user_query=user_prompt
        )

        yield f"data: {json.dumps({'status': 'mindmap_complete', 'progress': 95, 'message': '마인드맵 생성 완료'})}\n\n"
        await asyncio.sleep(0.1)

        # 최종 결과
        result = {
            "task_id": task_id,
            "status": "completed",
            "image_url": image_url,
            "created_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat(),
            "image_info": image_info,
            "analysis": cleaned_analysis,
            "mindmap": mindmap.dict()
        }

        yield f"data: {json.dumps({'status': 'completed', 'progress': 100, 'message': '이미지 분석 완료!', 'result': result}, ensure_ascii=False)}\n\n"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"이미지 분석 중 오류 발생: {error_msg}")
        yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"

    finally:
        # 임시 디렉토리 정리
        import shutil
        if os.path.exists(output_dir):
            try:
                shutil.rmtree(output_dir)
            except Exception as e:
                logger.warning(f"임시 디렉토리 삭제 실패: {e}")


@app.post("/analyze/image")
async def analyze_image(request: ImageAnalyzeRequest):
    """
    이미지 분석 (스트리밍 - 실시간 진행 상황 + 최종 결과)

    Server-Sent Events (SSE) 형식으로 실시간 진행 상황을 전달합니다.

    - **image_url**: 분석할 이미지 URL
    - **user_prompt**: 사용자 질문/프롬프트 (선택)

    ### 응답 형식 (SSE)
    각 이벤트는 다음 형식으로 전달됩니다:
    ```
    data: {"status": "...", "progress": 0-100, "message": "...", ...}
    ```

    ### 상태 종류
    - `started`: 분석 시작
    - `downloading_image`: 이미지 다운로드 중
    - `download_complete`: 다운로드 완료
    - `analyzing_vision`: Vision 모델 분석 중
    - `vision_complete`: Vision 분석 완료
    - `creating_mindmap`: 마인드맵 생성 중
    - `mindmap_complete`: 마인드맵 생성 완료
    - `completed`: 분석 완료 (result 포함)
    - `failed`: 오류 발생 (error 포함)
    """
    return StreamingResponse(
        analyze_image_stream(
            image_url=str(request.image_url),
            user_prompt=request.user_prompt
        ),
        media_type="text/event-stream"
    )


# ============================================================================
# 텍스트 분석 API
# ============================================================================

async def analyze_text_stream(
    text_prompt: str,
    detail_level: str = "medium"
):
    """
    텍스트 프롬프트를 분석하여 마인드맵을 생성하면서 실시간으로 진행 상황을 스트리밍합니다.
    """
    task_id = str(uuid.uuid4())

    try:
        # 시작 메시지
        yield f"data: {json.dumps({'status': 'started', 'task_id': task_id, 'progress': 0, 'message': '텍스트 분석 시작'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        # 텍스트 검증
        yield f"data: {json.dumps({'status': 'validating', 'progress': 10, 'message': '입력 텍스트 검증 중...'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        if not text_prompt or len(text_prompt.strip()) < 3:
            error_msg = "텍스트가 너무 짧습니다. 최소 3자 이상 입력해주세요."
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg}, ensure_ascii=False)}\n\n"
            return

        if len(text_prompt) > 10000:
            error_msg = "텍스트가 너무 깁니다. 최대 10,000자까지 지원합니다."
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg}, ensure_ascii=False)}\n\n"
            return

        # 텍스트 정보
        text_info = {
            "length": len(text_prompt),
            "word_count": len(text_prompt.split()),
            "detail_level": detail_level
        }

        message = f"텍스트 검증 완료: {text_info['length']}자, {text_info['word_count']}단어, 상세도={detail_level}"
        yield f"data: {json.dumps({'status': 'validation_complete', 'progress': 20, 'message': message, 'text_info': text_info}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        # 마인드맵 생성
        yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 30, 'message': 'LLM으로 마인드맵 생성 중...'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        # 상세도에 따라 예상 시간 표시
        if detail_level == "simple":
            yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 40, 'message': '간단한 마인드맵 생성 중... (예상 5-10초)'}, ensure_ascii=False)}\n\n"
        elif detail_level == "detailed":
            yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 40, 'message': '상세한 마인드맵 생성 중... (예상 15-30초)'}, ensure_ascii=False)}\n\n"
        else:
            yield f"data: {json.dumps({'status': 'creating_mindmap', 'progress': 40, 'message': '표준 마인드맵 생성 중... (예상 10-20초)'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        # LLM으로 마인드맵 생성
        mindmap = create_mindmap_from_text_llm(
            text_prompt=text_prompt,
            detail_level=detail_level
        )

        yield f"data: {json.dumps({'status': 'mindmap_complete', 'progress': 95, 'message': '마인드맵 생성 완료'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.1)

        # 최종 결과
        result = {
            "task_id": task_id,
            "status": "completed",
            "text_prompt": text_prompt[:200] if len(text_prompt) > 200 else text_prompt,  # 응답 크기 제한
            "created_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat(),
            "mindmap": mindmap.dict()
        }

        yield f"data: {json.dumps({'status': 'completed', 'progress': 100, 'message': '텍스트 분석 완료!', 'result': result}, ensure_ascii=False)}\n\n"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"텍스트 분석 중 오류 발생: {error_msg}")
        yield f"data: {json.dumps({'status': 'failed', 'error': error_msg}, ensure_ascii=False)}\n\n"


@app.post("/analyze/text")
async def analyze_text(request: TextAnalyzeRequest):
    """
    텍스트 프롬프트 분석 및 마인드맵 생성 (스트리밍)

    Server-Sent Events (SSE) 형식으로 실시간 진행 상황을 전달합니다.

    - **text_prompt**: 분석할 텍스트/주제 (예: "인공지능의 역사와 발전")
    - **detail_level**: 상세 수준 - "simple" (간단), "medium" (보통), "detailed" (상세)

    ### 응답 형식 (SSE)
    각 이벤트는 다음 형식으로 전달됩니다:
    ```
    data: {"status": "...", "progress": 0-100, "message": "...", ...}
    ```

    ### 상태 종류
    - `started`: 분석 시작
    - `validating`: 텍스트 검증 중
    - `validation_complete`: 검증 완료
    - `creating_mindmap`: 마인드맵 생성 중
    - `mindmap_complete`: 마인드맵 생성 완료
    - `completed`: 분석 완료 (result 포함)
    - `failed`: 오류 발생 (error 포함)

    ### 사용 예시
    ```json
    {
      "text_prompt": "인공지능의 역사와 주요 발전 단계",
      "detail_level": "medium"
    }
    ```

    ### 상세 수준 설명
    - **simple**: 2단계 깊이, 핵심 내용만 간단히 (~5-10초)
    - **medium**: 3-4단계 깊이, 적절한 상세도 (~10-20초)
    - **detailed**: 4-5단계 깊이, 매우 상세한 내용 (~15-30초)
    """
    return StreamingResponse(
        analyze_text_stream(
            text_prompt=request.text_prompt,
            detail_level=request.detail_level or "medium"
        ),
        media_type="text/event-stream"
    )


if __name__ == "__main__":
    import uvicorn

    # 환경변수로 포트 설정 가능
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "src.api.main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
