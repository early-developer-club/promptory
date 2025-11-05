# 프롬프토리 (Promptory)

## 🚀 서비스 바로가기

**[https://promptory-frontend.vercel.app/](https://promptory-frontend.vercel.app/)**

---

## 🤔 이런 문제, 없으셨나요?

- "분명히 어제 ChatGPT한테 물어봐서 해결했는데... 그 코드가 어디 갔지?"
- "Gemini랑 나눴던 좋은 아이디어가 있었는데, 다시 찾으려니 막막하다."
- "팀원에게 예전에 얻었던 인사이트를 공유하고 싶은데, 스크롤만 한참 올리고 있다."

개발자에게 AI와의 대화는 단순한 질문과 답변을 넘어, **문제 해결의 과정이자 중요한 지식 자산**입니다. 하지만 이 자산들은 대화창의 히스토리 속에 흩어져 쉽게 사라지곤 합니다.

## ✨ Promptory: 당신의 AI 대화를 자산으로

**프롬프토리(Promptory)**는 개발자를 위한 AI 대화 아카이빙 및 자산화 서비스입니다. Gemini, ChatGPT 등 생성형 AI와의 모든 상호작용을 자동으로 백업하고, 체계적으로 정리하여 당신만의 강력한 지식 베이스를 구축해 드립니다.

- **자동 아카이빙:** 다시는 유용한 코드 조각이나 번뜩이는 프롬프트를 잃어버리지 마세요.
- **강력한 검색:** 흩어져 있는 대화 기록 속에서 필요한 정보를 즉시 찾아내세요.
- **통계 대시보드:** 당신의 AI 활용 패턴을 분석하고, 생산성을 한 단계 높여보세요.

프롬프토리를 통해, 스쳐 지나가는 아이디어를 붙잡아 성장의 발판으로 만드세요.

- **VIBECODING 소요 시간:** 약 12시간
  - **Frontend:**
    - Next.js, React, TypeScript
    - Tailwind CSS
    - `shadcn/ui`: UI 컴포넌트 시스템
    - `recharts`: 데이터 시각화
  - **Database:** PostgreSQL (기존 SQLite에서 변경)
  - **Extension:** Chrome Extension (JavaScript)
  - **Deployment:**
    - **Frontend:** Vercel
    - **Backend & Database:** Render

---

## 🚀 프로젝트 주요 기능

- **코어 백엔드 및 인증:**
  -   FastAPI 기반 프로젝트 구조 설정 및 SQLAlchemy 연동
  -   Google OAuth2를 통한 안전한 사용자 인증 기능
- **대화 수집 및 관리:**
  -   **Chrome 확장 프로그램**을 통한 Gemini, ChatGPT 대화 내용 자동 수집
  -   **새로운 대화만 저장:** ChatGPT에서 기존 대화는 제외하고, 새로 생성되는 대화만 저장하는 기능
  -   대화 내용 **키워드 검색** 및 **날짜 필터링** 기능
  -   대화 삭제 기능
- **지능형 태그 추출 및 관리:**
  -   `KoNLPy` (형태소 분석) 및 `nltk` (품사 태깅)를 이용한 한/영 혼용 키워드 추출
  -   질문(Prompt)의 키워드에 가중치를 부여하여 정확도 높은 태그 자동 생성
  -   **불용어(Stopwords) 관리:** 불필요한 단어를 태그에서 제외할 수 있도록 백엔드에 설정 기능 추가
- **대시보드 및 시각화:**
  -   전체 대화 수, AI 소스별 대화 수 시각화 (파이 차트)
  -   **태그 빈도 분석:** 가장 많이 사용된 상위 10개 태그 시각화 (막대 차트)
  -   **태그 기반 필터링:** 대시보드의 태그 클릭 시, 해당 태그를 포함한 대화 목록으로 바로 이동
- **UI/UX 개선 및 사용자 접근성:**
  - `shadcn/ui` 기반의 모던하고 직관적인 UI 시스템 도입으로 사용자 경험 극대화.
  - **날짜 선택(DatePicker) 개선:** 대화가 있는 날짜만 활성화하고, UI 여백을 조정하여 사용성 증진.
  - 반응형 레이아웃 (사이드바, 헤더 등)을 통해 다양한 기기에서 일관된 사용 경험 제공.
  - **다국어 지원 및 확장성 고려:** 다른 사용자들도 쉽게 접근하고 활용할 수 있도록 설계.

---

## ✅ 오늘 해결된 문제 (2025-11-05)

- **데이터베이스 마이그레이션:**
  - SQLite에서 PostgreSQL로 데이터베이스를 성공적으로 변경했습니다. Render 배포 환경에서 PostgreSQL이 사용되도록 설정되었습니다.
- **프론트엔드 인증 오류 (401 Unauthorized) 해결:**
  - Google OAuth 콜백 시 JWT 토큰이 URL 해시(#)로 전달되어 Next.js SSR 환경에서 토큰이 유실되던 문제를 해결했습니다.
  - 백엔드(`backend/main.py`)에서 토큰을 URL 쿼리 파라미터(`?access_token=...`)로 전달하도록 수정했습니다.
  - 프론트엔드(`frontend/app/auth/callback/page.tsx`)에서 토큰을 쿼리 파라미터에서 파싱하도록 수정했습니다.
  - `AuthContext`에 `isLoading` 상태를 추가하여 인증 상태 로딩 완료 후 API 요청을 보내도록 프론트엔드 로직을 개선했습니다 (`frontend/app/context/AuthContext.tsx`, `frontend/app/dashboard/page.tsx`, `frontend/app/ui/conversation-search.tsx`).
- **크롬 확장 프로그램 데이터 저장 오류 해결 (Failed to fetch):**
  - 크롬 확장 프로그램이 백엔드 API를 호출할 때 발생하던 CORS(Cross-Origin Resource Sharing) 정책 위반 문제를 해결했습니다.
  - 백엔드(`backend/main.py`)의 `CORSMiddleware` 설정에 크롬 확장 프로그램의 출처(`chrome-extension://{CHROME_EXTENSION_ID}`)를 허용 목록에 추가했습니다.
  - `CHROME_EXTENSION_ID` 환경 변수를 통해 확장 프로그램 ID를 동적으로 설정하도록 개선했습니다.

---

## 💻 최근 개발 진행 상황

- **대시보드 기능 고도화:**
  -   백엔드에 태그 통계 API (`/api/v1/statistics/tags`)를 추가하여, 사용자의 태그 사용 빈도를 집계하는 기능을 구현했습니다.
  -   프론트엔드 대시보드에 `recharts`를 활용하여 **상위 10개 태그를 보여주는 막대 차트**를 추가했습니다.
  -   사용자가 차트의 막대를 클릭하면, 해당 태그가 포함된 대화 목록을 바로 볼 수 있도록 **태그 필터링 기능**을 연동했습니다.
- **UI/UX 개선:**
  -   **날짜 필터(DatePicker)**의 사용성을 개선했습니다. API 통신을 통해 실제 대화가 존재하는 날짜만 활성화하고, 나머지 날짜는 비활성화하여 사용자가 무의미한 선택을 하지 않도록 변경했습니다.
  -   전체적인 시각적 편안함을 위해 대시보드와 캘린더의 여백(padding)을 조정했습니다.
- **지능형 태그 추출 기능 개선:**
  -   키워드 추출의 정확도를 높이기 위해, 백엔드(`crud.py`)에 **한국어 및 영어 불용어(Stopwords) 목록**을 추가하고 이를 관리할 수 있도록 리팩토링했습니다.
- **Chrome 확장 프로그램 안정화:**
  -   Gemini, ChatGPT 등 각 사이트의 동적인 웹 구조 변화에 대응하기 위해 `content.js`의 대화 감지 로직을 전면 재설계했습니다.
  -   특히, ChatGPT에서 기존 대화는 제외하고 **새로 생성되는 대화만 저장**하도록 기능을 개선하여 사용 편의성을 높였습니다.
  -   Gemini 사이트의 엄격한 콘텐츠 보안 정책(CSP)을 우회하기 위해, `background.js`를 통해 백엔드와 통신하도록 구조를 변경하여 데이터 전송 안정성을 확보했습니다.
- **버그 수정 및 안정화:**
  -   개발 과정에서 발생한 다수의 백엔드 오류(`AttributeError`, `NameError` 등)와 프론트엔드 렌더링 문제를 해결하여 전체적인 안정성을 높였습니다.

---

## 🌐 배포 환경 구성 (Deployment)

- **프론트엔드 (Vercel):**
  - `main` 브랜치에 푸시될 때마다 Vercel을 통해 자동으로 빌드 및 배포됩니다.
  - **환경 변수 설정:**
    - `NEXT_PUBLIC_API_BASE_URL`: 배포된 백엔드 서버의 주소 (예: `https://your-backend.onrender.com`)

- **백엔드 & 데이터베이스 (Render):**
  - `main` 브랜치에 푸시될 때마다 Render의 Blueprint 기능을 통해 백엔드 서버와 PostgreSQL 데이터베이스가 함께 배포됩니다.
  - **환경 변수 설정:**
    - `DATABASE_URL`: Render에서 제공하는 PostgreSQL 내부 연결(Internal Connection String) 주소
    - `FRONTEND_URL`: 배포된 프론트엔드 주소 (`https://promptory-frontend.vercel.app`)
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET_KEY` 등 인증 관련 정보

---

## 🛠️ 향후 개선 과제 (Troubleshooting & TODO)

### 2025-11-06 작업 예정
- **UI 개선:**
  - 대화 목록(`Conversation List`) 및 개별 항목(`Conversation Item`)의 UI를 보다 직관적으로 개선합니다.
  - 사이드바(`Sidebar`)의 레이아웃과 기능을 검토하고 사용성을 높입니다.
- **태그 기능 복구:**
  - PostgreSQL 데이터베이스로 마이그레이션한 후, 대화 저장 시 태그가 정상적으로 추출되고 연결되지 않는 문제를 진단하고 해결합니다.
  - 백엔드의 `crud.py` 내 `extract_and_add_tags` 함수 로직을 집중적으로 검토합니다.

---

현재 배포 환경에서 대화 내용이 데이터베이스에 저장되지 않는 문제가 있으며, 아래와 같은 사항들을 순차적으로 점검하고 해결해야 합니다.

1.  **크롬 확장 프로그램 인증 토큰 문제:**
    - **현상:** 웹사이트 로그인 시 발급된 인증 토큰(JWT)이 크롬 확장 프로그램의 로컬 스토리지에 정상적으로 저장되지 않는 것으로 추정됩니다.
    - **진단 방법:**
      1. 웹사이트 로그인 후, `chrome://extensions`에서 Promptory 확장 프로그램의 서비스 워커(background.js) 개발자 도구를 엽니다.
      2. Console에 `Access token stored successfully` 메시지가 출력되는지 확인합니다.
      3. 대화 저장 시도 시 `No access token found` 에러가 발생하는지 확인합니다.
    - **해결 방안:** 프론트엔드 로그인 콜백 페이지(`AuthContext.tsx` 등)에서 확장 프로그램으로 토큰을 전송하는 로직(`chrome.runtime.sendMessage`)이 올바르게 구현되었는지 확인하고 수정합니다.

2.  **데이터 형식(Timestamp) 불일치 문제:**
    - **현상:** 확장 프로그램이 전송하는 `conversation_timestamp`의 데이터 형식이 백엔드(Pydantic 모델)가 기대하는 `datetime` 형식과 일치하지 않을 수 있습니다.
    - **진단 방법:** Render 백엔드 로그에서 `422 Unprocessable Entity` 또는 `invalid datetime format` 관련 유효성 검사 오류가 발생하는지 확인합니다.
    - **해결 방안:** 확장 프로그램의 `content.js`에서 타임스탬프 생성 시, ISO 8601 표준 형식(`new Date().toISOString()`)으로 변환하여 전송하도록 수정합니다.

3.  **PostgreSQL 데이터베이스 호환성 검증:**
    - **현상:** SQLite에서 PostgreSQL로 마이그레이션하면서 발생할 수 있는 데이터 타입 또는 제약 조건 불일치로 인해 DB 쓰기 작업이 실패할 수 있습니다.
    - **진단 방법:** Render 백엔드 로그에서 `psycopg2.Error` 등 데이터베이스 관련 오류가 발생하는지 확인합니다.
    - **해결 방안:** 오류 로그를 기반으로 `models.py`의 SQLAlchemy 모델 정의를 PostgreSQL에 맞게 수정합니다.
