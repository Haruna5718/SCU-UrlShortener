# URL Shortener

서울사이버대학교 클라우드 컴퓨팅 수업의 [1~7주차 실습 저장소](https://github.com/alifewellspent/iscu_cloud_class)를 바탕으로 완성했습니다.

주차별 입력 검증, API, Neon 저장, 307 리다이렉트, 클릭 통계, 관리자 인증을 이어 붙였고, 과제 요구사항인 중복 URL 재사용과 자기 서비스 URL 차단을 추가했습니다.

## 실행

```bash
npm install
npm run dev
```

`DATABASE_URL`이 없는 로컬 개발에서는 메모리 저장소를 사용합니다. 서버를 재시작하면 로컬 데이터가 초기화됩니다. Neon을 연결하려면 `.env.local`에 `DATABASE_URL`을 설정하세요.

## Neon 설정

Neon SQL Editor에서 [`db/schema.sql`](db/schema.sql)을 실행한 뒤, Vercel Production 환경변수에 pooled connection string을 `DATABASE_URL`로 등록하고 새로 배포합니다. 로컬 관리자 인증에는 `.env.local`에 `ADMIN_PASSWORD`를 설정합니다. 계정 이름은 `admin`입니다.

Vercel Firewall에서 `POST /api/shorten`에 IP 기준 **60초당 10회** Rate Limit을 설정하세요. 이는 7주차 실습의 Vercel 설정이며 애플리케이션 코드만으로 적용되지 않습니다.

## 자동 점검

```bash
python -m pip install requests
python -X utf8 iscu_url_shortener_check.py --url https://본인프로젝트.vercel.app
```

로컬 개발 서버:

```bash
python -X utf8 iscu_url_shortener_check.py --url http://localhost:3000 --allow-local
```
