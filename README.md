# 프롬프토리 (Promptory)

개발자를 위한 AI 대화 아카이빙 및 자산화 서비스입니다. Gemini, ChatGPT 등 생성형 AI와의 모든 상호작용을 체계적인 지식 자산으로 전환하여, 개발 생산성과 문제 해결 능력을 극대화하도록 돕습니다.

- **VIBECODING 소요 시간:** 약 1시간
- **기술 스택:**
  - **Backend:** Python, FastAPI, SQLAlchemy, OAuth2
  - **Frontend:** Next.js (예정)
  - **Database:** SQLite (초기), PostgreSQL (예정)
  - **Extension:** Chrome Extension (JavaScript)

---

## 🚀 프로젝트 개발 계획

- **Week 1: Core Foundation & Data Pipeline (완료)**
  - [x] 프로젝트 구조 설정
  - [x] FastAPI 백엔드 및 Chrome 확장 프로그램 기본 골격 구현
  - [x] 데이터베이스 모델링 및 연동
  - [x] 사용자 인증(OAuth) 기능 구현

- **Week 2: User Interface & Core Experience**
  - [ ] 프론트엔드(Next.js) 프로젝트 초기 설정
  - [ ] 대화 목록 및 상세 뷰 UI 개발
  - [ ] 태그 및 키워드 검색 기능 구현

- **Week 3: Intelligence & Polish**
  - [ ] Chrome 확장 프로그램: 실제 대화 내용 감지 로직 구현
  - [ ] 대화 자동 요약 기능 (LLM 연동)
  - [ ] 통계 대시보드 UI 개발

---

## 💻 개발 진행 상황

### ✅ 완료된 작업

- **프로젝트 구조 생성**
- **백엔드 초기 설정 (FastAPI)**
- **데이터베이스 연동 (SQLAlchemy)**
  - `models.py`, `database.py`, `schemas.py` 생성
- **사용자 인증 구현 (OAuth2 & JWT)**
  - `requirements.txt`: `google-auth-oauthlib` 등 인증 라이브러리 추가
  - `crud.py`: 데이터베이스 처리 함수 분리
  - `auth.py`: Google OAuth 및 JWT 토큰 생성 로직 구현
  - `main.py`: 로그인/콜백 API 엔드포인트 추가 및 API 보호 적용
  - `.env.example`: 인증 관련 환경 변수(ID, Secret, JWT Key) 추가
- **Chrome 확장 프로그램 초기 설정**

### 📝 앞으로의 작업

- **프론트엔드**
  - Next.js 프로젝트를 생성하고 기본 레이아웃을 구성합니다.
  - 백엔드 API와 연동하여 로그인/로그아웃 및 대화 목록을 표시합니다.
- **Chrome 확장 프로그램**
  - `content.js`에 `MutationObserver`를 사용하여 실제 대화 내용을 감지하고 백엔드로 전송하는 로직을 구현합니다.

---

## ⚙️ 실행 방법

### 백엔드 서버

1. `promptory-jinyoung/backend` 디렉토리로 이동합니다.
2. `.env.example` 파일을 참고하여 `.env` 파일을 생성하고, 아래 값들을 채워넣습니다.
   - `DATABASE_URL` (기본값 유지)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET_KEY` (e.g., `openssl rand -hex 32` 명령어로 생성)
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
