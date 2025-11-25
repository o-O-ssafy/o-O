"""
Pydantic 데이터 모델
"""
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
from enum import Enum


class TaskStatus(str, Enum):
    """작업 상태"""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    DOWNLOADING_IMAGE = "downloading_image"  # 이미지 다운로드
    EXTRACTING_FRAMES = "extracting_frames"
    EXTRACTING_TRANSCRIPT = "extracting_transcript"
    ANALYZING_VISION = "analyzing_vision"
    ANALYZING_TEXT = "analyzing_text"
    CREATING_MINDMAP = "creating_mindmap"  # 마인드맵 생성
    COMPLETED = "completed"
    FAILED = "failed"


class AnalyzeRequest(BaseModel):
    """영상 분석 요청"""
    youtube_url: HttpUrl
    max_frames: Optional[int] = None  # None이면 영상 길이에 따라 자동 계산 (로그 스케일)
    proxy: Optional[str] = None
    user_prompt: Optional[str] = None  # 사용자 질문/프롬프트 (예: "캐나다 관세 인상 이슈에 대해 설명해줘")


class ImageAnalyzeRequest(BaseModel):
    """이미지 분석 요청"""
    image_url: HttpUrl  # 이미지 URL
    user_prompt: Optional[str] = None  # 사용자 질문/프롬프트 (예: "이 이미지의 주요 내용을 분석해줘")


class TextAnalyzeRequest(BaseModel):
    """텍스트 분석 요청"""
    text_prompt: str  # 분석할 텍스트/주제 (예: "인공지능의 역사와 발전 과정")
    detail_level: Optional[str] = "medium"  # 상세 수준: "simple", "medium", "detailed"


class TaskResponse(BaseModel):
    """작업 응답"""
    task_id: str
    status: TaskStatus
    message: str


class MindMapNode(BaseModel):
    """마인드맵 노드"""
    keyword: str  # 노드에 표시될 키워드
    description: str  # 노드 상세 설명
    children: Optional[List['MindMapNode']] = None  # 하위 노드들


class AnalysisResult(BaseModel):
    """분석 결과"""
    task_id: str
    status: TaskStatus
    youtube_url: str
    created_at: str
    completed_at: Optional[str] = None
    video_info: Optional[Dict] = None
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    frame_analyses: Optional[List[str]] = None
    transcript: Optional[str] = None
    mindmap: Optional[MindMapNode] = None  # 마인드맵 데이터
    error: Optional[str] = None


class ImageAnalysisResult(BaseModel):
    """이미지 분석 결과"""
    task_id: str
    status: TaskStatus
    image_url: str
    created_at: str
    completed_at: Optional[str] = None
    image_info: Optional[Dict] = None  # 이미지 메타데이터 (크기, 포맷 등)
    analysis: Optional[str] = None  # Vision 모델의 이미지 분석 결과
    mindmap: Optional[MindMapNode] = None  # 마인드맵 데이터
    error: Optional[str] = None


class TextAnalysisResult(BaseModel):
    """텍스트 분석 결과"""
    task_id: str
    status: TaskStatus
    text_prompt: str
    created_at: str
    completed_at: Optional[str] = None
    mindmap: Optional[MindMapNode] = None  # 마인드맵 데이터
    error: Optional[str] = None


class OrganizeNode(BaseModel):
    """마인드맵 정리용 노드"""
    nodeId: int
    parentId: Optional[int]
    type: str  # "text", "image", "video"
    keyword: str
    memo: str
    x: float
    y: float
    color: str


class OrganizeRequest(BaseModel):
    """마인드맵 정리 요청"""
    workspaceId: int
    nodes: List[OrganizeNode]


class OrganizeResult(BaseModel):
    """마인드맵 정리 결과"""
    workspaceId: int
    status: str  # "COMPLETED", "FAILED"
    nodes: List[OrganizeNode]
    analyzedAt: str
    error: Optional[str] = None


# Forward reference 해결
MindMapNode.model_rebuild()
