# 프롬프토리 (Promptory)

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
(이하 생략 - 기존 내용과 동일)
(중략)
---

## ⚙️ 실행 방법
(이하 생략 - 기존 내용과 동일)
(중략)
4.  (코드 수정 시) 확장 프로그램 카드에 있는 새로고침 아이콘을 클릭하여 변경사항을 적용합니다.

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
    - `FRONTEND_URL`: 배포된 프론트엔드 주소 (예: `https://your-frontend.vercel.app`)
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET_KEY` 등 인증 관련 정보

---

## 🛠️ 향후 개선 과제 (Troubleshooting & TODO)

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
