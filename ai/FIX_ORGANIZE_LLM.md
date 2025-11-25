# 🔧 Organize 기능 LLM 프롬프트 개선

## 문제점

테스트 결과 두 가지 문제가 발견되었습니다:

1. **언어 번역 문제**: 한국어 내용이 영어로 번역됨
   - 예: "프로젝트 기획" → "Project Planning"
   - 예: "요구사항 분석하기" → "Requirements Analysis"

2. **노드 병합 미작동**: 유사한 노드가 통합되지 않음
   - "요구사항 분석하기" + "요구사항 수집" → 통합되지 않음
   - "개발 진행" + "개발 작업" → 통합되지 않음
   - "모니터링" + "시스템 관찰" → 통합되지 않음

---

## 해결 방법

### 1. System Prompt 강화 (llama_text_analyzer.py:583-624)

**추가된 규칙**:
```python
Rules:
- **MAINTAIN ORIGINAL LANGUAGE - DO NOT translate Korean to English or vice versa**
- **AGGRESSIVELY merge similar/duplicate nodes - aim to reduce count by 20-30%**
- When merging: keep better keyword, combine memos, update parentId of merged children
```

### 2. User Prompt 전면 개선 (llama_text_analyzer.py:626-665)

**추가된 CRITICAL INSTRUCTIONS**:

#### 🚨 1. LANGUAGE PRESERVATION (최우선 규칙)
- 한국어 입력이면 한국어로 출력
- 영어 입력이면 영어로 출력
- **절대 번역하지 않음**
- 예시: "프로젝트 기획" must stay "프로젝트 기획", NOT "Project Planning"

#### 🚨 2. AGGRESSIVE NODE MERGING (중복 제거)
- 유사한 의미의 노드를 **반드시 통합**
- 통합 예시:
  * "요구사항 분석하기" + "요구사항 수집" → "요구사항 분석 및 수집"
  * "개발 진행" + "개발 작업" → "개발 진행"
  * "모니터링" + "시스템 관찰" → "시스템 모니터링"
- **목표: 중복이 있으면 20-30% 노드 개수 감소**

#### 🚨 3. ROOT NODE PROTECTION (루트 노드 보호)
- parentId=null인 노드는 keyword와 memo를 **절대 변경하지 않음**

#### ✅ 4. VERIFICATION CHECKLIST
LLM이 출력 전에 검증하는 체크리스트:
- [ ] 입력과 같은 언어로 유지했는가?
- [ ] 유사/중복 노드를 모두 통합했는가?
- [ ] 루트 노드를 그대로 보존했는가?
- [ ] 노드 개수가 줄었는가? (중복이 있었다면)

---

## 수정된 파일

### [src/core/llama_text_analyzer.py](src/core/llama_text_analyzer.py#L583-L665)

**변경 사항**:
1. `system_prompt`의 Rules 섹션에 언어 유지 및 병합 규칙 추가
2. `user_prompt` 전체 재구성:
   - 4가지 CRITICAL INSTRUCTIONS 추가
   - 구체적인 한국어 예시 추가
   - 검증 체크리스트 추가

---

## 테스트 방법

### 1. AI 서버 시작

```bash
cd /workspace/S13P31D202/ai
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

### 2. 테스트 Producer 실행 (다른 터미널)

```bash
python test_kafka_organize.py
```

### 3. 테스트 Consumer 실행 (다른 터미널)

```bash
python test_kafka_organize_consumer.py
```

### 4. 결과 확인

**확인 사항**:

✅ **언어 유지**:
- 한국어 노드가 한국어로 유지되는지 확인
- "프로젝트 기획"이 "Project Planning"으로 번역되지 않았는지 확인

✅ **노드 병합**:
- 유사한 노드가 통합되었는지 확인:
  * "요구사항 분석하기" + "요구사항 수집" → 1개로 통합
  * "개발 진행" + "개발 작업" → 1개로 통합
  * "모니터링" + "시스템 관찰" → 1개로 통합
- 노드 개수가 20개 → 14-16개 정도로 감소했는지 확인

✅ **루트 노드 보호**:
- parentId=null 노드의 keyword와 memo가 그대로인지 확인

---

## 예상 결과

### Before (수정 전)
```
📌 노드 개수: 20개
   - text: 20개

🔴 문제:
- "프로젝트 기획" → "Project Planning" (영어로 번역됨)
- "요구사항 분석하기"와 "요구사항 수집"이 별도 노드로 유지됨 (통합 안 됨)
```

### After (수정 후)
```
📌 노드 개수: 14-16개
   - text: 14-16개

✅ 개선:
- "프로젝트 기획" → "프로젝트 기획" (한국어 유지)
- "요구사항 분석하기" + "요구사항 수집" → "요구사항 분석 및 수집" (1개로 통합)
- "개발 진행" + "개발 작업" → "개발 진행" (1개로 통합)
- "모니터링" + "시스템 관찰" → "시스템 모니터링" (1개로 통합)
```

---

## 기술적 세부 사항

### 왜 이 방법이 효과적인가?

1. **System Prompt + User Prompt 이중 강화**:
   - System Prompt: 전체적인 규칙 정의
   - User Prompt: 구체적인 예시와 체크리스트로 강화

2. **구체적인 한국어 예시 제공**:
   - LLM이 실제 테스트 데이터의 예시를 보고 학습
   - "요구사항 분석하기" + "요구사항 수집" → "요구사항 분석 및 수집"

3. **검증 체크리스트**:
   - LLM이 출력 전에 자기 검증 수행
   - 언어 유지, 노드 병합, 루트 보호 확인

4. **명확한 목표 설정**:
   - "20-30% 노드 개수 감소" 구체적 목표 제시
   - "AGGRESSIVELY merge" 강력한 표현 사용

---

## 추가 개선 사항 (향후)

만약 이 프롬프트로도 충분하지 않다면:

1. **Few-shot Learning 추가**:
   - 실제 입력/출력 예시를 프롬프트에 포함

2. **Temperature 조정**:
   - 현재 0.2 → 0.1로 낮춰서 더 일관성 있는 출력

3. **Post-processing 추가**:
   - 코드 레벨에서 언어 검증 (한국어 비율 체크)
   - 코드 레벨에서 노드 유사도 계산 후 강제 병합

4. **프롬프트 길이 축약**:
   - 너무 긴 프롬프트는 LLM의 attention을 분산시킬 수 있음

---

## 문의

이슈가 있으면 팀에 문의하세요!
