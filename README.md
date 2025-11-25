# o-O
> AI 아이디어 협업 마인드맵 서비스 

## 개발자
### 프론트
| | 박소영 | 홍시은 |
|-----------|:------------------------:|:---------------------------:|
| **프로필** | <img src="/uploads/f9e7d1a05dbd63afc0ed509c87c23702/image.png" width="150"/> | <img src="https://lab.ssafy.com/-/project/1050572/uploads/589e6a7e6b97c9ba15e062f1f24e0ea9/image.png" width="150"/> |
| **기술 스택** | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" width="40" height="40"/> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" width="40" height="40"/>|
| **R&R** | Y.js 구현 <br> 마인드맵 UI 구현 <br> 실시간 협업 UI 구현 | D3.js 구현 <br> 트렌드보드 UI 구현 <br> 마이페이지 UI 구현 |

### 백엔드
| | 송진우 | 한동근 |
|-----------|:------------------------:|:---------------------------:|
| **프로필** | <img src="/uploads/a65270d565d09e6d7daed46692e984f5/image.png" width="150"/> | <img src="https://lab.ssafy.com/-/project/1050572/uploads/646f4fb9a45d3ff51c85b2f6792c97b4/image.png" width="150"/> |
| **기술 스택** | <img src="https://www.vectorlogo.zone/logos/springio/springio-icon.svg" width="40" height="40"/> | <img src="https://www.vectorlogo.zone/logos/springio/springio-icon.svg" width="40" height="40" /> <img src="https://cdn-icons-png.flaticon.com/512/919/919825.png" width="40" height="40"/>|
| **R&R** | 인프라, 배포 총괄 <br> 트렌드, 마이페이지 서버 개발 <br> 게이트웨이 서버 구현 | Y.js, WebRTC 구현 <br> 마인드맵 및 워크스페이스 서버 구현 <br> 유저 서버 구현 |

### AI*모바일
| | 이승훈 | 
|-----------|:------------------------:|
| **프로필** | <img src="https://lab.ssafy.com/-/project/1050572/uploads/0b06db2392416920758e8e9d2e8559c6/image.png" width="150"/>  
| **기술 스택** | <img src="https://www.vectorlogo.zone/logos/python/python-icon.svg" width="40" height="40"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flutter_logo.svg/1024px-Flutter_logo.svg.png" width="40" height="40"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" width="40" height="40"/>
| **R&R** | Flutter 앱 개발 <br> Llama 연결 <br> WebRTC 기능 구현


## 프로젝트 기획 배경
프로젝트 기간 동안 기획 단계에서 여러 팀들이 **소통의 어려움**을 겪었습니다. 예비군, 면접, 일정 충돌 등으로 회의 인원이 자주 변동되며 회의 내용이 말로만 전달되거나 가독성 낮은 회의록으로 남는 경우가 많았습니다. <br>

하지만 기존 협업 도구들은 기획 흐름을 한눈에 파악하기 어렵고, AI가 스스로 새로운 아이디어를 창출하기도 어렵습니다. **세계경제포럼(WEF)** 역시 창의성은 인간 고유의 영역이며 AI는 이를 보조하는 도구에 가깝다고 분석합니다. 
이에 따라 저희는 **AI를 ‘대신’이 아니라 ‘도구’로 활용하는 새로운 형태의 기획 플랫폼**을 고민했습니다.

또한 기존 마인드맵 툴의 한계였던 **자료 요약 중심 기능, 협업 부재, 아이디어 확장 불가, 시각적 맥락 부족**을 보완하여, 팀의 아이디어를 즉시 구조화하고 연결하여 흐름을 한눈에 볼 수 있도록 하는 방향으로 문제를 정의했습니다. <br>

**o-O는 흩어진 아이디어를 자동으로 정리하고, 팀 회의 내용을 실시간으로 구조화하며, 모바일 음성 입력까지 지원하여 언제 어디서든 아이디어를 기록할 수 있도록 돕는 플랫폼입니다.**

## 프로젝트 소개
**o-O**는 아이디어를 구조화하고 확장하는 전 과정을 AI와 함께 수행할 수 있는 **AI 협업형 마인드맵 플랫폼**입니다. <br>
말로 시작된 아이디어도, 자료 조사로 쌓인 정보도, 팀 회의에서 오간 대화도 모두 자동으로 정리·연결·구조화하여 시각적으로 표현해줍니다.
또한 실시간 협업을 위해 Yjs 기반의 CRDT 구조, WebSocket, WebRTC 음성 채팅, Kafka 기반 비동기 AI 처리, 멀티모달 LLAMA 모델 등을 결합하여 기획 과정 전체를 빠르고 안정적으로 지원하는 기술적 기반을 구축했습니다.

## 주요 기능 
- 🧠 **AI 기반 마인드맵 생성** : 텍스트·이미지·유튜브 영상을 입력하면, AI가 맥락을 이해해 자동으로 노드 생성 및 구조화
- 🔄 **실시간 협업 편집** : Yjs 기반 CRDT로 여러 사용자가 동시에 수정해도 충돌 없이 안정적으로 동기화Yjs 기반 CRDT로 여러 사용자가 동시에 수정해도 충돌 없이 안정적으로 동기화
- 🎙️ **음성 기반 아이디어 입력(모바일)** : 떠오르는 생각을 말하기만 하면 자동으로 마인드맵에 반영되는 즉시 기록 기능
- 💬 **음성 회의 + 실시간 기록** : WebRTC 음성 채팅을 제공하며, 회의 중 발화 내용을 자동으로 정리해 마인드맵으로 구성
- ✏️ **AI 아이디어 확장 & 요약** : 단일 주제 확장, 다중 노드 요약, 콘셉트 변환 등 다양한 기획 보조 기능 지원
- 🖥️ **협업 편의 기능 (커서·대화·알림)** : 실시간 커서 공유, 사용자 상태 인식 등 팀 협업을 위한 기능 제공

## 화면 구성


## 시스템 아키텍처



### Environment
![Android Studio](https://img.shields.io/badge/Android_Studio-3DDC84?style=flat&logo=AndroidStudio&logoColor=white)
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-2C2255?style=flat&logo=intellij-idea&logoColor=white)
![VScode](https://img.shields.io/badge/Visual%20Studio%20Code-1E97E8?style=flat&logo=visual-studio-code&logoColor=white)
![GitLab](https://img.shields.io/badge/GitLab-E34124?style=flat&logo=Gitlab&logoColor=white)
![Git](https://img.shields.io/badge/git-F05032?style=flat&logo=git&logoColor=white)

### Backend
![Java21](https://img.shields.io/badge/Java21-4D7896?style=flat&logo=Java&logoColor=white)
![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=flat&logo=Spring&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-012F38?style=flat&logo=Gradle&logoColor=white)
![Spring Security](https://img.shields.io/badge/SpringSecurity-6BB344?style=flat&logo=SpringSecurity&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-4AD5FF?style=flat&logo=React&logoColor=white)
![TailwindCss](https://img.shields.io/badge/TailwindCss-41A2AD?style=flat&logo=TailwindCss&logoColor=white)
![Redux-toolkit](https://img.shields.io/badge/ReduxToolkit-764ABB?style=flat&logo=Redux-toolkit&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4AD5FF?style=flat&logo=Zustand&logoColor=white)
![TanStack-Query](https://img.shields.io/badge/TanStackQuery-F73F51?style=flat&logo=TanStackQuery&logoColor=white)
![Y.js](https://img.shields.io/badge/Y.js-FFBC42?style=flat&logo=Y.js&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-EE8447?style=flat&logo=D3.js&logoColor=white)

### Mobile
![Flutter](https://img.shields.io/badge/flutter-02569B?style=flat&logo=Flutter&logoColor=white)
![Dart](https://img.shields.io/badge/dart-0175C2?style=flat&logo=Dart&logoColor=white)
![Android](https://img.shields.io/badge/android-3DDC84?style=flat&logo=android&logoColor=white)
![Androidstudio](https://img.shields.io/badge/Android%20studio-3DDC84?style=flat&logo=androidstudio&logoColor=white)
![Dio](https://img.shields.io/badge/Dio-02569B?style=flat&logo=flutter&logoColor=white)
![Freezed](https://img.shields.io/badge/Freezed-4FC3F7?style=flat&logo=snowflake&logoColor=white)
![Bloc](https://img.shields.io/badge/Bloc-0175C2?style=flat&logo=flutter&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Flame](https://img.shields.io/badge/Flame-F44336?style=flat&logo=flame&logoColor=white)
![go_router](https://img.shields.io/badge/go__router-7E57C2?style=flat&logo=flutter&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=white)


### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-306091?style=flat&logo=PostgreSQL&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-A41E11?style=flat&logo=Redis&logoColor=white)

### Search Engine
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=flat&logo=Elasticsearch&logoColor=white)

### Infra
![AWS](https://img.shields.io/badge/AWS-333664?style=flat&logo=aws&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CC3631?style=flat&logo=Jenkins&logoColor=white)

### AI
![LLAMA](https://img.shields.io/badge/Llama-0081FB?style=flat&logo=meta&logoColor=white)



### Communication
![GitLab](https://img.shields.io/badge/GitLab-E34124?style=flat&logo=Gitlab&logoColor=white)
![Mattermost](https://img.shields.io/badge/Mattermost-284077?style=flat&logo=Mattermost&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=flat&logo=Notion&logoColor=white)
![JIRA](https://img.shields.io/badge/jira-0052CC?style=flat&logo=jira&logoColor=white)