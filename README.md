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

- **VIBECODING 소요 시간:** 약 6시간
- **기술 스택 (Tech Stack):**
  - **Backend:**
    - Python
    - FastAPI: Modern, fast web framework for building APIs.
    - SQLAlchemy: SQL toolkit and Object-Relational Mapper (ORM).
    - Pydantic: Data validation and settings management.
    - `google-auth-oauthlib`: For Google OAuth2 authentication flow.
    - `python-jose`: For JWT creation and validation.
  - **Frontend:**
    - TypeScript
    - React
    - Next.js: The React framework for production.
    - Tailwind CSS: A utility-first CSS framework for rapid UI development.
  - **Database:**
    - SQLite: For lightweight, local database storage.
  - **Chrome Extension:**
    - JavaScript (ES6+)
    - Chrome Extension Manifest V3

---

## 🚀 프로젝트 개발 계획

- **Week 1 & 2: Core Foundation, UI, and Intelligence (완료)**
  - [x] 프로젝트 구조 설정 및 기본 골격 구현
  - [x] 데이터베이스 모델링 및 연동 (SQLAlchemy)
  - [x] 사용자 인증(OAuth) 기능 구현
  - [x] 프론트엔드(Next.js) 프로젝트 초기 설정
  - [x] 대화 목록 및 상세 뷰 UI 개발
  - [x] Chrome 확장 프로그램: 대화 내용 감지 로직 구현 (ChatGPT, Gemini)
  - [x] 통계 대시보드 UI 개발
  - [x] 대화 삭제 기능 구현
  - [x] 전체 UI "미니멀 & 클린" 테마로 재디자인
  - [x] 전체 기능 디버깅 및 안정화

- **Week 3: 추가 개발 계획 (Next Step)**
  - [ ] 프론트엔드 로고 크기 적용 문제 해결
  - [ ] 검색 기능 구현
  - [ ] 로그인/로그아웃 버튼 디자인 개선
  - [ ] 사이드바 네비게이션 UI 구현
  - [ ] 대시보드 시각화 기능 강화

---

## 💻 개발 진행 상황

### ✅ 완료된 작업

- **프로젝트 구조 생성 및 기본 설정**
- **백엔드 초기 설정 (FastAPI) 및 데이터베이스 연동 (SQLAlchemy)**
- **사용자 인증 리팩토링 (헤더 기반 인증)**
  - 기존 쿠키 기반 인증 방식의 문제를 해결하기 위해, `Authorization: Bearer <토큰>` 헤더를 사용하는 표준 방식으로 리팩토링했습니다.
  - 백엔드의 `get_current_user` 의존성을 수정하고, 프론트엔드에서는 `AuthContext`를 구현하여 토큰을 관리합니다.
- **Chrome 확장 프로그램 기능 구현 및 고도화**
  - `background.js`를 도입하여, 웹페이지-확장 프로그램 간 메시지 통신 아키텍처를 구현하고 안정성을 높였습니다.
  - `content.js`의 대화 추출 로직을 대폭 개선하여 ChatGPT와 Gemini를 모두 지원하도록 구현했습니다.
  - `debounce`와 중복 전송 방지 로직을 통해 대화가 여러 번 저장되는 문제를 해결했습니다.
- **프론트엔드 UI/UX 개발 및 개선 (Next.js)**
  - 대화 목록 및 상세 뷰, 대시보드 등 핵심 UI를 개발했습니다.
  - **대화 삭제 기능:** 개별 대화 및 대시보드 목록에서 대화를 삭제하는 기능을 구현했습니다.
  - **UI 재디자인:** "미니멀 & 클린" 테마를 적용하여 전체적인 UI를 트렌디하게 개선했습니다.
- **전체 기능 디버깅 및 안정화**
  - Gemini 대화 수집 오류, CORS 정책 오류, `422`, `500` 서버 오류, `Invalid Date` 등 MVP 구현 과정에서 발생한 모든 버그를 해결했습니다.

### 📝 앞으로의 작업

- **프론트엔드**
  - 특정 조건에서 발생하는 로고 폰트 크기 미적용 문제를 해결합니다.
  - 헤더의 로그인/로그아웃 버튼 디자인을 개선합니다.
  - 사이드바를 구현하여 앱의 전체적인 레이아웃을 개선합니다.
  - 대시보드에 차트 라이브러리 등을 활용하여 시각화 요소를 추가합니다.
- **기능**
  - 대화 내용을 검색하는 기능을 구현합니다.

---

## ⚙️ 실행 방법

### 백엔드 서버

1. `promptory-jinyoung/backend` 디렉토리로 이동합니다.
2. `.env.example` 파일을 참고하여 `.env` 파일을 생성하고, 필요한 값들을 채워넣습니다.
3. 가상환경을 생성하고 활성화합니다.
   ```bash
   python -m venv venv
   .\venv\Scripts\activate # Windows
   ```
4. 의존성을 설치합니다.
   ```bash
   pip install -r requirements.txt
   ```
5. FastAPI 서버를 실행합니다.
   ```bash
   uvicorn main:app --reload
   ```

### 프론트엔드 서버

1. `promptory-jinyoung/frontend` 디렉토리로 이동합니다.
2. 의존성을 설치합니다.
   ```bash
   npm install
   ```
3. Next.js 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
4. 브라우저에서 `http://localhost:3000`으로 접속합니다.

### Chrome 확장 프로그램

1. Chrome 브라우저에서 `chrome://extensions` 페이지로 이동합니다.
2. 오른쪽 상단의 '개발자 모드'를 활성화합니다.
3. '압축 해제된 확장 프로그램을 로드합니다' 버튼을 클릭하고 `promptory-jinyoung/chrome-extension` 폴더를 선택합니다.
4. (코드 수정 시) 확장 프로그램 카드에 있는 새로고침 아이콘을 클릭하여 변경사항을 적용합니다.