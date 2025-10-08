# 프롬프토리 (Promptory)

개발자를 위한 AI 대화 아카이빙 및 자산화 서비스입니다. Gemini, ChatGPT 등 생성형 AI와의 모든 상호작용을 체계적인 지식 자산으로 전환하여, 개발 생산성과 문제 해결 능력을 극대화하도록 돕습니다.

- **VIBECODING 소요 시간:** 약 15분 (초기 설정)
- **기술 스택:**
  - **Backend:** Python, FastAPI
  - **Frontend:** Next.js (예정)
  - **Database:** PostgreSQL (예정)
  - **Extension:** Chrome Extension (JavaScript)

---

## 🚀 프로젝트 개발 계획

- **Week 1: Core Foundation & Data Pipeline**
  - [x] 프로젝트 구조 설정
  - [x] FastAPI 백엔드 및 Chrome 확장 프로그램 기본 골격 구현
  - [ ] 데이터베이스 모델링 및 연동
  - [ ] 사용자 인증(OAuth) 기능 구현

- **Week 2: User Interface & Core Experience**
  - [ ] 대화 목록 및 상세 뷰 UI 개발
  - [ ] 태그 및 키워드 검색 기능 구현
  - [ ] 수동 태그 관리 기능 구현

- **Week 3: Intelligence & Polish**
  - [ ] 대화 자동 요약 기능 (LLM 연동)
  - [ ] 통계 대시보드 UI 개발
  - [ ] 최종 테스트 및 MVP 배포

---

## 💻 개발 진행 상황

### ✅ 완료된 작업 (Week 1)

- **프로젝트 구조 생성**
  - `promptory/backend`
  - `promptory/chrome-extension`

- **백엔드 초기 설정 (FastAPI)**
  - `backend/requirements.txt`: FastAPI, Uvicorn 등 의존성 정의
  - `backend/main.py`: 기본 FastAPI 앱 및 대화 저장 API (`/api/v1/conversations`) 엔드포인트 골격 구현

- **Chrome 확장 프로그램 초기 설정**
  - `chrome-extension/manifest.json`: 확장 프로그램 기본 설정 및 권한 정의
  - `chrome-extension/content.js`: AI 챗봇 페이지에 주입될 스크립트 골격 구현
  - `chrome-extension/popup.html`: 간단한 팝업 UI 구현

### 📝 앞으로의 작업

- **백엔드**
  - SQLAlchemy를 사용한 데이터베이스 모델(Users, Conversations, Tags) 정의
  - 실제 데이터베이스 연동 및 CRUD 로직 구현
  - Google/Github OAuth를 사용한 사용자 인증 및 JWT 발급 로직 구현
- **Chrome 확장 프로그램**
  - `content.js`에 `MutationObserver`를 사용하여 실제 대화 내용을 감지하고 파싱하는 로직 구현
  - `chrome.storage`를 사용하여 로그인 상태(JWT)를 관리하는 로직 구현

---

## ⚙️ 실행 방법

### 백엔드 서버

1. `promptory/backend` 디렉토리로 이동합니다.
2. 가상환경을 생성하고 활성화합니다.
   ```bash
   python -m venv venv
   source venv/bin/activate # Linux/macOS
   .\venv\Scripts\activate # Windows
   ```
3. 의존성을 설치합니다.
   ```bash
   pip install -r requirements.txt
   ```
4. FastAPI 서버를 실행합니다.
   ```bash
   uvicorn main:app --reload
   ```
   서버는 `http://127.0.0.1:8000`에서 실행됩니다.
