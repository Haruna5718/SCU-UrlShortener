# URL Shortener

ISCU 1–7주차 URL Shortener 과제용 Next.js 서비스입니다.

## 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. Vercel 밖에서는 메모리 저장소로 바로 실행되고, 프로세스를 재시작하면 데이터가 초기화됩니다.

## Vercel 배포 전 저장소 설정

Vercel 서버리스 함수는 요청 간 메모리를 공유하지 않으므로, 배포 환경에는 영구 저장소가 필요합니다. Upstash Redis에서 데이터베이스를 만든 다음 Vercel 프로젝트의 **Settings → Environment Variables**에 다음 두 값을 추가하고 Production 배포를 다시 실행하세요.

```text
KV_REST_API_URL
KV_REST_API_TOKEN
```

각 값은 Upstash 콘솔의 REST URL과 REST token입니다. 같은 이름을 `.env.local`에 넣으면 로컬에서도 Redis를 사용할 수 있습니다. 이 앱은 URL 중복 확인과 shortCode 저장을 Redis Lua 스크립트 한 번으로 처리합니다.

관리자 화면과 통계 API를 사용하려면 Vercel 환경변수에 `ADMIN_USERNAME`, `ADMIN_PASSWORD`도 설정하세요. 둘 다 설정되면 `/admin`과 `/api/stats`가 HTTP Basic 인증으로 보호됩니다.

## 자동 채점

과제에서 공개한 `iscu_url_shortener_check.py`로 배포 주소를 검사할 수 있습니다.

```bash
python -m pip install requests
python -X utf8 iscu_url_shortener_check.py --url https://본인프로젝트.vercel.app
```

로컬 검사:

```bash
python -X utf8 iscu_url_shortener_check.py --url http://localhost:3000 --allow-local
```

로컬 메모리 저장소 테스트가 통과해도 Vercel Production 주소에서 다시 검사해야 합니다.
