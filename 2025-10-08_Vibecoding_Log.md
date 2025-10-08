# 2025-10-08 바이브코딩 작업 로그

이 문서는 2025년 10월 8일에 진행된 Gemini와의 모든 인터랙션과 그에 따른 처리 내용을 요약한 것입니다.

---

### 1. PRD 작성 요청

> **사용자 프롬프트:** "나는 매일 Gemini·ChatGPT 같은 대화를 자동 백업/태그해서 프롬프트 재사용 + 학습 자산화를 도와주는 서비스를 만들고 싶어... 실제 서비스로 출시할 수 있는 수준의 PRD를 작성해줘..."

- **Gemini 처리 내용:**
  - 서비스 이름으로 '프롬프토리(Promptory)'를 제안.
  - 제품 개요, 목표, 사용자 스토리, 핵심 기능, 기술 스택, 3주 MVP 개발 계획 등을 포함한 상세한 PRD(제품 요구 명세서)를 작성함.

---

### 2. 상세 기능 명세서 작성 요청

> **사용자 프롬프트:** "위 PRD를 바탕으로 개발자가 바로 개발할 수 있는 수준의 상세 기능 명세서를 작성해줘. 각 기능별로 입력값, 출력값, 예외처리까지 포함해서."

- **Gemini 처리 내용:**
  - PRD를 기반으로 각 기능(API, Chrome 확장 프로그램 등)의 ID, 설명, 입출력 값, 처리 로직, 예외 처리 등을 포함한 개발자용 상세 기능 명세서를 작성함.

---

### 3. 프로젝트 개발 시작

> **사용자 프롬프트:** "위에서 작성한 PRD, 기능 명세서를 바탕으로 계획한 프로젝트를 개발해줘."

- **Gemini 처리 내용:**
  - 개발 계획 1주차 목표에 따라 프로젝트 폴더 구조(`promptory/backend`, `promptory/chrome-extension`)를 생성.
  - FastAPI 백엔드(`requirements.txt`, `main.py`)와 크롬 확장 프로그램(`manifest.json`, `content.js`, `popup.html`)의 기본 골격 파일들을 생성함.

---

### 4. README.md 작성 요청

> **사용자 프롬프트:** "지금까지 바이브코딩한 내용을 README.md에 기록할거야..."

- **Gemini 처리 내용:**
  - 프로젝트 개요, 기술 스택, 3주 개발 계획, 현재까지의 진행 상황(완료/예정), 서버 실행 방법 등을 포함하는 `README.md` 파일을 생성함.

---

### 5. 데이터베이스 연동 작업 요청

> **사용자 프롬프트:** "promptory 파일에 있던 것을 Git 레포지토리와 연동하느라 promptory-jinyoung 폴더로 옮겼어. 다음 할 일인 [ ] 데이터베이스 모델링 및 연동에 대해서 개발 진행해줘..."

- **Gemini 처리 내용:**
  - `models.py`, `database.py`, `schemas.py` 파일을 생성하고 `main.py`를 수정하여 SQLAlchemy를 사용한 데이터베이스 연동 기능을 구현함.
  - 사용자에게 `.env` 파일 설정 방법을 안내하고, `SQLite` 사용을 제안함.

---

### 6. 서버 실행 방법 상세 안내 요청 (여러 차례)

> **사용자 프롬프트:** "그러면 내가 할 일이 뭐야?", "해야할 일 별로 구체적으로 어떻게 실행해야하는지 알려줘.", "...가상환경 만들고 필요한 패키지들 다 설치할게..."

- **Gemini 처리 내용:**
  - 사용자의 질문 수준에 맞춰, Windows 환경 기준으로 폴더 이동, 가상환경 생성 및 활성화, `pip`를 이용한 패키지 설치, 서버 실행 명령어(`uvicorn`) 등을 단계별로 상세히 안내함.

---

### 7. 서버 실행 오류 디버깅 (여러 차례)

> **사용자 프롬프트:** 서버 실행 시 발생한 여러 `Traceback` 오류 로그를 공유함.

- **Gemini 처리 내용:**
  - **`ImportError`:** `main.py`의 상대 경로 임포트 문제를 절대 경로 임포트로 수정하여 해결.
  - **`TypeError (unsupported operand |)`:** Python 3.9 호환성을 위해 `schemas.py`의 `str | None` 타입을 `Optional[str]`로 수정하고, Pydantic V2 문법에 맞게 `orm_mode`를 `from_attributes`로 변경하여 해결.
  - **`TypeError (__init__ got an unexpected keyword)`:** Google 인증 라이브러리 `Flow` 객체 생성 방법의 오류를 여러 번에 걸쳐 수정하여, 최종적으로 `Flow.from_client_config()`를 사용하는 올바른 코드로 수정함.
  - **`NameError (name 'requests' is not defined)`:** `main.py`에 누락된 `import requests` 구문을 추가하여 해결.
  - **`Internal Server Error (InvalidGrantError)`:** 로컬 `http` 환경에서의 OAuth 문제를 해결하기 위해 `main.py`에 `OAUTHLIB_INSECURE_TRANSPORT` 환경 변수를 설정하여 해결.

---

### 8. 최종 로그인 테스트 및 성공 확인

> **사용자 프롬프트:** "사이트에 연결할 수 없음... ERR_CONNECTION_REFUSED" 

- **Gemini 처리 내용:**
  - 해당 오류가 프론트엔드(`localhost:3000`)가 아직 없기 때문에 발생하는 **정상적인 결과**임을 설명함.
  - 터미널 로그를 통해 백엔드에서의 인증 처리는 최종적으로 성공했음을 확인하도록 안내함.
  - Week 1의 모든 목표가 달성되었음을 선언함.
