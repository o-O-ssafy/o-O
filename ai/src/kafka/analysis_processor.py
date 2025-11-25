"""
Kafka 메시지 분석 처리 모듈
- INITIAL: VIDEO/IMAGE/TEXT 분석하여 마인드맵 노드 생성
- CONTEXTUAL: 3개 자식 노드 생성
"""
import logging
from typing import Dict, Any, List, Optional
from src.core.transcript_extractor import TranscriptExtractor
from src.core.llama_text_analyzer import LlamaTextAnalyzer
from src.core.llama_vision_analyzer import LlamaVisionAnalyzer
from src.core.image_analyzer import ImageAnalyzer

logger = logging.getLogger(__name__)


class AnalysisProcessor:
    """Kafka 분석 요청 처리기"""

    def __init__(self, text_analyzer: LlamaTextAnalyzer, vision_analyzer: LlamaVisionAnalyzer):
        """
        Args:
            text_analyzer: LLM 텍스트 분석기
            vision_analyzer: LLM 비전 분석기
        """
        self.text_analyzer = text_analyzer
        self.vision_analyzer = vision_analyzer
        self.image_analyzer = ImageAnalyzer()

    def process_initial(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        INITIAL 분석 처리 - contentType에 따라 VIDEO/IMAGE/TEXT 처리

        Args:
            request: Kafka 요청 메시지
                - workspaceId: 워크스페이스 ID
                - nodeId: 노드 ID
                - contentType: 'VIDEO', 'IMAGE', 'TEXT'
                - contentUrl: 컨텐츠 URL (TEXT일 경우 null)
                - prompt: 사용자 프롬프트

        Returns:
            분석 결과 딕셔너리
        """
        # workspaceId를 int로 변환 (Java long과 호환)
        workspace_id = int(request['workspaceId'])
        node_id = request['nodeId']
        content_url = request.get('contentUrl')
        content_type = request.get('contentType', 'TEXT')
        prompt = request.get('prompt', '')

        logger.info(f"INITIAL 분석 시작: workspaceId={workspace_id}, nodeId={node_id}, "
                   f"contentType={content_type}")

        try:
            # ContentType에 따라 컨텐츠 추출
            content_text = ""

            if content_type == 'VIDEO':
                # VIDEO: YouTube 자막 추출
                if not content_url:
                    raise ValueError("VIDEO 타입인데 contentUrl이 없습니다")

                logger.info(f"📹 VIDEO 분석: {content_url}")
                transcript_result = TranscriptExtractor.get_transcript(content_url)
                if transcript_result['success']:
                    content_text = transcript_result['full_text']
                    logger.info(f"✅ 자막 추출 성공: {len(content_text)}자")
                else:
                    error_msg = transcript_result.get('error', 'Unknown error')
                    logger.warning(f"⚠️  자막 추출 실패: {error_msg}")
                    raise ValueError(f"자막 추출 실패: {error_msg}")

            elif content_type == 'IMAGE':
                # IMAGE: 이미지 다운로드 후 Vision 모델로 분석
                if not content_url:
                    raise ValueError("IMAGE 타입인데 contentUrl이 없습니다")

                logger.info(f"🖼️  IMAGE 분석: {content_url}")

                # 이미지 다운로드
                image_path = self.image_analyzer.download_image(content_url)
                if not image_path:
                    raise ValueError(f"이미지 다운로드 실패: {content_url}")

                logger.info(f"✅ 이미지 다운로드 성공: {image_path}")

                # Vision 모델로 이미지 분석
                vision_prompt = f"""Analyze this image concisely in 3-5 sentences. Focus on unique information only.

User request: {prompt}

Describe:
1. Main visible text and content
2. Key visual elements (charts, diagrams, logos)
3. Core concepts presented

Be concise. Never repeat yourself. Stop after describing main points."""

                content_text = self.vision_analyzer.analyze_image(
                    image=image_path,
                    prompt=vision_prompt,
                    max_tokens=512,
                    temperature=0.3
                )
                logger.info(f"✅ Vision 분석 완료: {len(content_text)}자")
                logger.info(f"📄 Vision 분석 내용:\n{content_text}")

                # 이미지 파일 삭제
                self.image_analyzer.cleanup(image_path)

            elif content_type == 'TEXT':
                # TEXT: prompt만 사용
                logger.info(f"📝 TEXT 분석: prompt만 사용")
                content_text = ""  # 빈 문자열, prompt만 사용

            else:
                raise ValueError(f"알 수 없는 contentType: {content_type}")

            # 마인드맵 생성 프롬프트 (TEXT 타입일 때만 keyword 필드 추가)
            if content_type == 'TEXT':
                # TEXT 타입: keyword 필드 포함
                system_prompt = """You are an expert at analyzing content and generating hierarchical mindmap nodes in JSON format.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - No explanations, no markdown, no code blocks
2. MUST include "title", "keyword", "aiSummary", and "nodes" fields
3. The root node already exists - DO NOT create a top-level category node
4. Each field must appear ONLY ONCE per node (no duplicate keys)

Generate nodes with appropriate depth (5-15 nodes recommended):
- All first-level nodes MUST have parentId={node_id}
- Create sub-nodes under categories as needed
- Build a logical hierarchical structure

REQUIRED JSON structure (copy this format exactly):
{{
  "title": "Concise mindmap title (3-10 words)",
  "keyword": "Short root keyword (1-3 words)",
  "aiSummary": "Brief 1-2 sentence summary of the content",
  "nodes": [
    {{"tempId": "temp-1", "parentId": {node_id}, "keyword": "Main Topic 1", "memo": "Detailed description"}},
    {{"tempId": "temp-2", "parentId": {node_id}, "keyword": "Main Topic 2", "memo": "Detailed description"}},
    {{"tempId": "temp-3", "parentId": "temp-1", "keyword": "Subtopic 1-1", "memo": "Specific details"}},
    {{"tempId": "temp-4", "parentId": "temp-1", "keyword": "Subtopic 1-2", "memo": "Specific details"}}
  ]
}}

MANDATORY Rules:
1. "title" field is REQUIRED - a concise title for the entire mindmap (3-10 words)
2. "keyword" field is REQUIRED - a very short root keyword (1-3 words) representing the main topic
3. "aiSummary" field is REQUIRED at the top level
4. tempId: "temp-1", "temp-2", etc (sequential)
5. parentId: MUST be {node_id} or another tempId (NEVER null, NEVER duplicate)
6. keyword (in nodes): 2-5 words, concise (NEVER empty)
7. memo: 10-50 characters, informative (NEVER empty)
8. Each node must have exactly 4 fields: tempId, parentId, keyword, memo
9. DO NOT repeat field names within a single node
""".format(node_id=node_id)
            else:
                # VIDEO/IMAGE 타입: keyword 필드 없음 (기존 방식)
                system_prompt = """You are an expert at analyzing content and generating hierarchical mindmap nodes in JSON format.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - No explanations, no markdown, no code blocks
2. MUST include "title", "aiSummary", and "nodes" fields
3. The root node already exists - DO NOT create a top-level category node
4. Each field must appear ONLY ONCE per node (no duplicate keys)

Generate nodes with appropriate depth (5-15 nodes recommended):
- All first-level nodes MUST have parentId={node_id}
- Create sub-nodes under categories as needed
- Build a logical hierarchical structure

REQUIRED JSON structure (copy this format exactly):
{{
  "title": "Concise mindmap title (3-10 words)",
  "aiSummary": "Brief 1-2 sentence summary of the content",
  "nodes": [
    {{"tempId": "temp-1", "parentId": {node_id}, "keyword": "Main Topic 1", "memo": "Detailed description"}},
    {{"tempId": "temp-2", "parentId": {node_id}, "keyword": "Main Topic 2", "memo": "Detailed description"}},
    {{"tempId": "temp-3", "parentId": "temp-1", "keyword": "Subtopic 1-1", "memo": "Specific details"}},
    {{"tempId": "temp-4", "parentId": "temp-1", "keyword": "Subtopic 1-2", "memo": "Specific details"}}
  ]
}}

MANDATORY Rules:
1. "title" field is REQUIRED - a concise title for the entire mindmap (3-10 words)
2. "aiSummary" field is REQUIRED at the top level
3. tempId: "temp-1", "temp-2", etc (sequential)
4. parentId: MUST be {node_id} or another tempId (NEVER null, NEVER duplicate)
5. keyword: 2-5 words, concise (NEVER empty)
6. memo: 10-50 characters, informative (NEVER empty)
7. Each node must have exactly 4 fields: tempId, parentId, keyword, memo
8. DO NOT repeat field names within a single node
""".format(node_id=node_id)

            # contentType에 따라 user prompt 구성
            if content_text:
                user_prompt_text = f"""사용자 요청: {prompt}

콘텐츠 내용:
{content_text[:5000]}

위 내용을 분석하여 체계적인 마인드맵 노드들을 생성해주세요.
콘텐츠의 복잡도와 내용에 따라 적절한 개수와 깊이로 구성하세요.

IMPORTANT: keyword와 memo는 반드시 한국어로 작성해주세요. title과 aiSummary도 한국어로 작성해주세요."""
            else:
                # TEXT 타입: prompt만 사용
                user_prompt_text = f"""사용자 요청: {prompt}

위 주제/요청을 분석하여 체계적인 마인드맵 노드들을 생성해주세요.
주제의 복잡도와 내용에 따라 적절한 개수와 깊이로 구성하세요.

IMPORTANT: keyword와 memo는 반드시 한국어로 작성해주세요. title과 aiSummary도 한국어로 작성해주세요."""

            # LLM 호출 (JSON 생성을 위해 낮은 temperature)
            logger.info("🤖 LLM으로 마인드맵 생성 중...")
            response = self.text_analyzer.generate(
                prompt=user_prompt_text,
                system_prompt=system_prompt,
                max_tokens=2048,
                temperature=0.2,
                top_p=0.85,
                top_k=40,
                repetition_penalty=1.15
            )

            # 응답 검증 및 로깅
            logger.info(f"📄 LLM 원본 응답 길이: {len(response)}자")
            logger.info(f"📄 LLM 응답 미리보기:\n{response[:500]}")

            # 빈 응답 체크
            if not response or not response.strip():
                raise ValueError("LLM이 빈 응답을 반환했습니다")

            # JSON 파싱 전처리
            response = response.strip()

            # JSON 코드 블록 제거
            if '```json' in response:
                response = response.split('```json')[1]
            if '```' in response:
                response = response.split('```')[0]

            # JSON 객체 추출 (첫 번째 { 부터 마지막 } 까지)
            start_idx = response.find('{')
            end_idx = response.rfind('}')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("응답에서 JSON 객체를 찾을 수 없습니다")

            response = response[start_idx:end_idx+1].strip()

            # JSON 파싱 시도
            import json
            import re
            try:
                result_data = json.loads(response)
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ JSON 파싱 실패. 오류 복구를 시도합니다: {e}")

                # 중복 필드 제거: 같은 객체 내에서 동일 필드가 2번 나오면 첫 번째만 유지
                # 각 노드 객체를 순회하며 중복 제거
                try:
                    # 수동으로 노드별로 파싱
                    fixed_response = response
                    # 중복 parentId 패턴 찾기
                    fixed_response = re.sub(
                        r'("parentId"\s*:\s*"[^"]*"),\s*("keyword"[^}]*)"parentId"\s*:\s*"[^"]*"',
                        r'\1, \2',
                        fixed_response
                    )
                    result_data = json.loads(fixed_response)
                    logger.info("✅ JSON 오류 복구 성공")
                except Exception as e2:
                    logger.error(f"JSON 파싱 최종 실패!")
                    logger.error(f"원본:\n{response[:500]}")
                    raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e2}")

            # 결과 검증 및 보정
            if 'nodes' not in result_data:
                raise ValueError("응답에 nodes가 없습니다")

            # title이 없으면 기본값 생성
            if 'title' not in result_data or not result_data['title']:
                logger.warning("⚠️ title이 없습니다. 기본값을 생성합니다.")
                result_data['title'] = f"{content_type} 분석 마인드맵"

            # aiSummary가 없으면 기본값 생성
            if 'aiSummary' not in result_data or not result_data['aiSummary']:
                logger.warning("⚠️ aiSummary가 없습니다. 기본값을 생성합니다.")
                result_data['aiSummary'] = f"{content_type} 컨텐츠 분석 결과입니다."

            # TEXT 타입일 때만 keyword 검증 및 기본값 생성
            if content_type == 'TEXT':
                if 'keyword' not in result_data or not result_data['keyword']:
                    logger.warning("⚠️ keyword가 없습니다. title에서 추출합니다.")
                    # title의 첫 1-3 단어를 keyword로 사용
                    title_words = result_data['title'].split()[:3]
                    result_data['keyword'] = ' '.join(title_words)

            logger.info(f"✅ 생성된 노드 개수: {len(result_data['nodes'])}개")

            # 후처리: parentId가 None/null인 노드를 nodeId로 변경
            for node in result_data['nodes']:
                if node.get('parentId') is None or node.get('parentId') == 'null':
                    logger.warning(f"⚠️ 노드 {node.get('tempId')}의 parentId가 null입니다. nodeId({node_id})로 변경합니다.")
                    node['parentId'] = node_id

                # memo가 비어있으면 keyword 기반 기본 설명 추가
                if not node.get('memo') or node.get('memo').strip() == '':
                    default_memo = f"{node.get('keyword', 'Topic')}에 대한 내용"
                    logger.warning(f"⚠️ 노드 {node.get('tempId')}의 memo가 비어있습니다. 기본값으로 설정: {default_memo}")
                    node['memo'] = default_memo

            # Kafka 응답 형식으로 변환 (TEXT 타입일 때만 keyword 포함)
            kafka_response = {
                "workspaceId": workspace_id,
                "title": result_data['title'],
                "aiSummary": result_data['aiSummary'],
                "status": "SUCCESS",
                "nodes": result_data['nodes']
            }

            # TEXT 타입일 때만 keyword 추가
            if content_type == 'TEXT':
                kafka_response["keyword"] = result_data.get('keyword', result_data['title'].split()[0])

            logger.info(f"✅ INITIAL 분석 완료 ({content_type}): {len(result_data['nodes'])}개 노드 생성")
            return kafka_response

        except Exception as e:
            logger.error(f"❌ INITIAL 분석 실패 ({content_type}): {e}", exc_info=True)
            return {
                "workspaceId": workspace_id,
                "status": "FAILED",
                "error": str(e)
            }

    def process_contextual(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        CONTEXTUAL 분석 처리 - 3개 자식 노드 생성
        contentType에 따라 VIDEO/IMAGE/TEXT 처리

        Args:
            request: Kafka 요청 메시지
                - workspaceId: 워크스페이스 ID
                - nodeId: 확장할 노드 ID
                - nodes: 부모 노드들 (내 노드 포함)
                - contentType: 'VIDEO', 'IMAGE', 'TEXT'

        Returns:
            분석 결과 딕셔너리
        """
        # workspaceId를 int로 변환 (Java long과 호환)
        workspace_id = int(request['workspaceId'])
        node_id = request['nodeId']
        parent_nodes = request.get('nodes', [])
        content_type = request.get('contentType', 'TEXT')

        logger.info(f"CONTEXTUAL 분석 시작: workspaceId={workspace_id}, nodeId={node_id}, "
                   f"contentType={content_type}, 노드 체인 수={len(parent_nodes)}")

        try:
            # 1. nodeId로 확장할 노드 찾기
            target_node = None
            for node in parent_nodes:
                if node.get('nodeId') == node_id or node.get('id') == node_id:
                    target_node = node
                    break

            if not target_node:
                raise ValueError(f"nodeId={node_id}인 노드를 찾을 수 없습니다")

            logger.info(f"확장할 노드 찾음: keyword={target_node.get('keyword')}")

            # 2. ContentType에 따라 컨텐츠 추출
            content_text = ""

            if content_type == 'VIDEO':
                # VIDEO: keyword에서 YouTube URL 추출
                content_url = target_node.get('keyword', '')
                if not content_url:
                    raise ValueError("VIDEO 타입인데 keyword에 URL이 없습니다")

                logger.info(f"📹 VIDEO 분석: {content_url}")
                transcript_result = TranscriptExtractor.get_transcript(content_url)
                if transcript_result['success']:
                    content_text = transcript_result['full_text']
                    logger.info(f"✅ 자막 추출 성공: {len(content_text)}자")
                else:
                    error_msg = transcript_result.get('error', 'Unknown error')
                    logger.warning(f"⚠️  자막 추출 실패: {error_msg}")
                    raise ValueError(f"자막 추출 실패: {error_msg}")

            elif content_type == 'IMAGE':
                # IMAGE: keyword에서 이미지 URL 추출
                content_url = target_node.get('keyword', '')
                if not content_url:
                    raise ValueError("IMAGE 타입인데 keyword에 URL이 없습니다")

                logger.info(f"🖼️  IMAGE 분석: {content_url}")

                # 이미지 다운로드
                image_path = self.image_analyzer.download_image(content_url)
                if not image_path:
                    raise ValueError(f"이미지 다운로드 실패: {content_url}")

                logger.info(f"✅ 이미지 다운로드 성공: {image_path}")

                # Vision 모델로 이미지 분석
                vision_prompt = f"""Analyze this image concisely in 3-5 sentences. Focus on unique information only.

Describe:
1. Main visible text and content
2. Key visual elements (charts, diagrams, logos)
3. Core concepts and subtopics

Be concise. Never repeat yourself. Stop after describing main points."""

                content_text = self.vision_analyzer.analyze_image(
                    image=image_path,
                    prompt=vision_prompt,
                    max_tokens=512,
                    temperature=0.3
                )
                logger.info(f"✅ Vision 분석 완료: {len(content_text)}자")
                logger.info(f"📄 Vision 분석 내용:\n{content_text}")

                # 이미지 파일 삭제
                self.image_analyzer.cleanup(image_path)

            elif content_type == 'TEXT':
                # TEXT: 부모 노드 문맥만 사용
                logger.info(f"📝 TEXT 분석: 부모 노드 문맥 사용")
                content_text = ""

            else:
                raise ValueError(f"알 수 없는 contentType: {content_type}")

            # 3. 부모 노드 문맥 구성
            context_text = self._build_context_from_parents(parent_nodes)

            # 4. 마인드맵 생성 프롬프트
            system_prompt = """You are an expert at generating exactly 3 child nodes based on parent context.

CRITICAL: You MUST output ONLY valid JSON. No explanations, no markdown, no code blocks.

Output this EXACT JSON structure:
{{
  "nodes": [
    {{"keyword": "Subtopic 1", "memo": "Specific description"}},
    {{"keyword": "Subtopic 2", "memo": "Specific description"}},
    {{"keyword": "Subtopic 3", "memo": "Specific description"}}
  ]
}}

Rules:
1. Generate EXACTLY 3 nodes
2. keyword: 2-5 words, concise
3. memo: 10-30 characters, specific
4. Follow the flow of parent nodes logically
5. Output ONLY JSON, nothing else
"""

            # contentType에 따라 user prompt 구성
            if content_text:
                # VIDEO/IMAGE: 컨텐츠 내용 + 부모 노드 문맥
                user_prompt_text = f"""부모 노드 문맥:
{context_text}

컨텐츠 분석 결과:
{content_text[:3000]}

위 문맥과 컨텐츠를 기반으로 해당 노드의 3개 하위 노드를 생성해주세요."""
            else:
                # TEXT: 부모 노드 문맥만 사용
                user_prompt_text = f"""부모 노드 문맥:
{context_text}

위 문맥을 기반으로 해당 노드의 3개 하위 노드를 생성해주세요."""

            # LLM 호출 (JSON 생성을 위해 낮은 temperature)
            logger.info("🤖 LLM으로 3개 자식 노드 생성 중...")
            response = self.text_analyzer.generate(
                prompt=user_prompt_text,
                system_prompt=system_prompt,
                max_tokens=1024,
                temperature=0.2,
                top_p=0.85,
                top_k=40,
                repetition_penalty=1.15
            )

            # 응답 검증 및 로깅
            logger.info(f"📄 LLM 원본 응답 길이: {len(response)}자")
            logger.info(f"📄 LLM 응답 미리보기:\n{response[:500]}")

            # 빈 응답 체크
            if not response or not response.strip():
                raise ValueError("LLM이 빈 응답을 반환했습니다")

            # JSON 파싱 전처리
            response = response.strip()

            # JSON 코드 블록 제거
            if '```json' in response:
                response = response.split('```json')[1]
            if '```' in response:
                response = response.split('```')[0]

            # JSON 객체 추출 (첫 번째 { 부터 마지막 } 까지)
            start_idx = response.find('{')
            end_idx = response.rfind('}')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("응답에서 JSON 객체를 찾을 수 없습니다")

            response = response[start_idx:end_idx+1].strip()

            # JSON 파싱 시도
            import json
            import re
            try:
                result_data = json.loads(response)
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ JSON 파싱 실패. 오류 복구를 시도합니다: {e}")

                # 중복 필드 제거: 같은 객체 내에서 동일 필드가 2번 나오면 첫 번째만 유지
                # 각 노드 객체를 순회하며 중복 제거
                try:
                    # 수동으로 노드별로 파싱
                    fixed_response = response
                    # 중복 parentId 패턴 찾기
                    fixed_response = re.sub(
                        r'("parentId"\s*:\s*"[^"]*"),\s*("keyword"[^}]*)"parentId"\s*:\s*"[^"]*"',
                        r'\1, \2',
                        fixed_response
                    )
                    result_data = json.loads(fixed_response)
                    logger.info("✅ JSON 오류 복구 성공")
                except Exception as e2:
                    logger.error(f"JSON 파싱 최종 실패!")
                    logger.error(f"원본:\n{response[:500]}")
                    raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e2}")

            # 결과 검증
            if 'nodes' not in result_data:
                raise ValueError("응답에 nodes가 없습니다")

            if len(result_data['nodes']) != 3:
                logger.warning(f"노드 개수가 3개가 아닙니다: {len(result_data['nodes'])}개")
                # 3개로 자르기 또는 채우기
                if len(result_data['nodes']) > 3:
                    result_data['nodes'] = result_data['nodes'][:3]
                elif len(result_data['nodes']) < 3:
                    # 부족한 만큼 기본 노드 추가
                    for i in range(3 - len(result_data['nodes'])):
                        result_data['nodes'].append({
                            "keyword": f"추가 주제 {i+1}",
                            "memo": "상세 내용이 필요합니다"
                        })

            # Kafka 응답 형식으로 변환
            kafka_response = {
                "workspaceId": workspace_id,
                "nodeId": node_id,
                "status": "SUCCESS",
                "nodes": result_data['nodes']
            }

            logger.info(f"✅ CONTEXTUAL 분석 완료: {len(result_data['nodes'])}개 노드 생성")
            return kafka_response

        except Exception as e:
            logger.error(f"❌ CONTEXTUAL 분석 실패: {e}", exc_info=True)
            return {
                "workspaceId": workspace_id,
                "status": "FAILED",
                "error": str(e)
            }

    def _build_context_from_parents(self, parent_nodes: List[Dict]) -> str:
        """
        부모 노드들로부터 문맥 텍스트 생성

        Args:
            parent_nodes: 부모 노드 리스트

        Returns:
            문맥 텍스트
        """
        if not parent_nodes:
            return "(부모 노드 없음)"

        context_lines = []
        for i, node in enumerate(parent_nodes, 1):
            keyword = node.get('keyword', '')
            memo = node.get('memo', '')
            context_lines.append(f"{i}. {keyword}: {memo}")

        return "\n".join(context_lines)

    def process_organize(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        ORGANIZE 처리 - text 노드만 정리, image/video는 유지

        Args:
            request: Kafka 요청 메시지
                - workspaceId: 워크스페이스 ID
                - nodes: 전체 노드 리스트 (text, image, video)

        Returns:
            정리된 마인드맵 결과
        """
        # workspaceId를 int로 변환
        workspace_id = int(request['workspaceId'])
        all_nodes = request.get('nodes', [])

        logger.info(f"ORGANIZE 시작: workspaceId={workspace_id}, 전체 노드 수={len(all_nodes)}")

        try:
            # text, image, video 노드 분리
            text_nodes = [node for node in all_nodes if node.get('type') == 'text']
            non_text_nodes = [node for node in all_nodes if node.get('type') in ['image', 'video']]

            logger.info(f"📝 text 노드: {len(text_nodes)}개, 🖼️ image/video 노드: {len(non_text_nodes)}개")

            if not text_nodes:
                logger.warning("⚠️ text 노드가 없습니다. 원본 그대로 반환합니다.")
                # analyzedAt 추가
                from datetime import datetime, timezone
                analyzed_at = datetime.now(timezone.utc).astimezone().isoformat()

                return {
                    "workspaceId": workspace_id,
                    "status": "COMPLETED",
                    "nodes": all_nodes,
                    "analyzedAt": analyzed_at
                }

            # LLM으로 text 노드 정리
            logger.info("🤖 LLM으로 text 노드 정리 중...")
            organized_json = self.text_analyzer.organize_mindmap(
                nodes=all_nodes,  # 전체 노드 전달 (내부에서 text만 필터링)
                max_tokens=4096,
                temperature=0.2
            )

            # 응답 검증 및 로깅
            logger.info(f"📄 LLM 원본 응답 길이: {len(organized_json)}자")
            logger.info(f"📄 LLM 응답 미리보기:\n{organized_json[:500]}")

            # 빈 응답 체크
            if not organized_json or not organized_json.strip():
                raise ValueError("LLM이 빈 응답을 반환했습니다")

            # JSON 파싱 전처리
            organized_json = organized_json.strip()

            # JSON 코드 블록 제거
            if '```json' in organized_json:
                organized_json = organized_json.split('```json')[1]
            if '```' in organized_json:
                organized_json = organized_json.split('```')[0]

            # JSON 배열 추출 (첫 번째 [ 부터 마지막 ] 까지)
            start_idx = organized_json.find('[')
            end_idx = organized_json.rfind(']')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("응답에서 JSON 배열을 찾을 수 없습니다")

            organized_json = organized_json[start_idx:end_idx+1].strip()

            # JSON 파싱
            import json
            try:
                organized_text_nodes = json.loads(organized_json)
            except json.JSONDecodeError as e:
                logger.error(f"JSON 파싱 실패!")
                logger.error(f"파싱하려던 문자열:\n{organized_json}")
                raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e}")

            if not isinstance(organized_text_nodes, list):
                raise ValueError(f"LLM 응답이 배열이 아닙니다: {type(organized_text_nodes)}")

            logger.info(f"✅ 정리된 text 노드: {len(organized_text_nodes)}개 (원본: {len(text_nodes)}개)")

            # 정리된 text 노드에 원본의 x, y, color 정보 복원
            original_node_map = {node['nodeId']: node for node in text_nodes}

            # 루트 노드 추출 (parentId=null)
            root_nodes_map = {node['nodeId']: node for node in text_nodes if node.get('parentId') is None}

            for organized_node in organized_text_nodes:
                node_id = organized_node.get('nodeId')
                if node_id in original_node_map:
                    original = original_node_map[node_id]
                    # x, y, color, type 복원
                    organized_node['x'] = original.get('x', 0.0)
                    organized_node['y'] = original.get('y', 0.0)
                    organized_node['color'] = original.get('color', '#3b82f6')
                    organized_node['type'] = 'text'

                    # 루트 노드 보호: keyword와 memo를 원본으로 강제 복원
                    if node_id in root_nodes_map:
                        original_keyword = original.get('keyword')
                        original_memo = original.get('memo')
                        current_keyword = organized_node.get('keyword')
                        current_memo = organized_node.get('memo')

                        # keyword 복원
                        if current_keyword != original_keyword:
                            logger.warning(f"🔒 루트 노드 {node_id}의 keyword 변경 감지 - 원본으로 복원: '{current_keyword}' → '{original_keyword}'")
                            organized_node['keyword'] = original_keyword

                        # memo 복원
                        if current_memo != original_memo:
                            logger.warning(f"🔒 루트 노드 {node_id}의 memo 변경 감지 - 원본으로 복원")
                            organized_node['memo'] = original_memo

                        # parentId도 null 유지
                        if organized_node.get('parentId') is not None:
                            logger.warning(f"🔒 루트 노드 {node_id}의 parentId 변경 감지 - null로 복원")
                            organized_node['parentId'] = None

                else:
                    logger.warning(f"⚠️ nodeId={node_id}인 원본 노드를 찾을 수 없습니다")

            # text + non-text 노드 병합
            final_nodes = organized_text_nodes + non_text_nodes

            logger.info(f"📊 최종 노드 수: {len(final_nodes)}개")

            # analyzedAt 추가
            from datetime import datetime, timezone
            analyzed_at = datetime.now(timezone.utc).astimezone().isoformat()

            # Kafka 응답 형식
            kafka_response = {
                "workspaceId": workspace_id,
                "status": "COMPLETED",
                "nodes": final_nodes,
                "analyzedAt": analyzed_at
            }

            logger.info(f"✅ ORGANIZE 완료: {len(final_nodes)}개 노드 반환")
            return kafka_response

        except Exception as e:
            logger.error(f"❌ ORGANIZE 실패: {e}", exc_info=True)
            from datetime import datetime, timezone
            analyzed_at = datetime.now(timezone.utc).astimezone().isoformat()

            return {
                "workspaceId": workspace_id,
                "status": "FAILED",
                "nodes": all_nodes,  # 실패 시 원본 반환
                "analyzedAt": analyzed_at,
                "error": str(e)
            }

    def process_request(self, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Kafka 요청 처리 (분석 타입에 따라 분기)

        Args:
            request: Kafka 요청 메시지

        Returns:
            분석 결과 또는 None
        """
        analysis_type = request.get('analysisType')

        if analysis_type == 'INITIAL':
            return self.process_initial(request)
        elif analysis_type == 'CONTEXTUAL':
            return self.process_contextual(request)
        else:
            logger.error(f"알 수 없는 분석 타입: {analysis_type}")
            return {
                "workspaceId": request.get('workspaceId'),
                "status": "FAILED",
                "error": f"Unknown analysis type: {analysis_type}"
            }
