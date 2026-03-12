# 01. Auth - 인증

## Screenshots

| Screen | File |
|--------|------|
| 로그인 (빈 폼) | ![](../images/01-login.png) |
| 로그인 (입력됨) | ![](../images/03-login-filled.png) |
| 회원가입 | ![](../images/02-register.png) |

## Pages

### Login (`/login`)

비인증 사용자의 진입점. 로그인 후 대시보드로 이동.

**UI 구성:**
- Email 입력 (필수)
- Password 입력 (필수)
- "Sign In" 버튼
- "Don't have an account? Register" 링크 → `/register`

**동작:**
1. 이메일/비밀번호 입력 후 Sign In 클릭
2. `POST /users/token` (form-urlencoded: username=email, password)
3. 성공 → JWT 토큰을 localStorage에 저장, `/dashboard`로 리다이렉트
4. 실패 → 에러 메시지 표시

### Register (`/register`)

신규 사용자 등록.

**UI 구성:**
- Email 입력 (필수)
- Password 입력 (필수)
- "Sign Up" 버튼
- "Already have an account? Login" 링크 → `/login`

**동작:**
1. 이메일/비밀번호 입력 후 Sign Up 클릭
2. `POST /users/` (JSON: email, password)
3. 성공 → `/login`으로 리다이렉트
4. 실패 (이메일 중복 등) → 에러 알림 표시

## Auth Flow

```
[Login Form] → POST /users/token → JWT (access_token, 30min)
                                      ↓
                              localStorage('token')
                                      ↓
                         Axios interceptor: Authorization: Bearer {token}
                                      ↓
                              [401 Response]
                                      ↓
                         window event: 'auth-error'
                                      ↓
                         AuthErrorModal → 토큰 삭제 → /login 리다이렉트
```

## Backend API

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/users/` | POST | No | `{email, password}` | User object |
| `/users/token` | POST | No | form-urlencoded `{username, password}` | `{access_token, token_type}` |

## Implementation Details

**Backend:**
- 비밀번호: bcrypt 해싱 (passlib)
- JWT: HS256 알고리즘, SECRET_KEY 환경변수 (미설정 시 자동생성 + 경고)
- 토큰 만료: 30분
- `get_current_user` dependency로 보호된 엔드포인트에서 사용자 주입

**Frontend:**
- `AuthProvider` (useAuth hook): token, isAuthenticated, setToken(), logout()
- `ProtectedRoute`: 인증되지 않은 사용자를 `/login`으로 리다이렉트
- `AuthErrorModal`: 401 응답 시 세션 만료 모달 표시 후 로그아웃
- Axios request interceptor: 모든 요청에 Bearer 헤더 자동 추가
