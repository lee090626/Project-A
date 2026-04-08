# 🚀 개발 시작하기 (Getting Started)

Drilling RPG 프로젝트의 로컬 개발 환경을 설정하고 실행하는 방법을 안내합니다.

---

## 1. 사전 요구 사항 (Prerequisites)

이 프로젝트를 실행하기 위해 다음 도구들이 설치되어 있어야 합니다.
- **Node.js**: v20 이상 권장
- **npm**: v10 이상 권장

---

## 2. 설치 및 실행 (Installation & Run)

### **의존성 설치**
저장소를 클론한 후 프로젝트 루트에서 다음 명령어를 실행합니다.
```bash
npm install
```

### **에셋 최적화 (중요)**
게임에 필요한 텍스처 아틀라스를 생성하고 최적화해야 합니다. 최초 실행 시 또는 자산이 변경되었을 때 필수적으로 실행해야 합니다.
```bash
# 이미지 최적화 및 스프라이트 시트(Atlas) 생성
npm run optimize:atlas
```

### **개발 서버 실행**
Next.js 개발 서버를 실행합니다.
```bash
npm run dev
```
이후 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 시 게임이 로드됩니다.

---

## 3. 빌드 및 배포 (Build & Deploy)

프로젝트는 다양한 환경으로의 배포 스크립트를 지원합니다.

### **GitHub Pages 배포**
```bash
npm run deploy
```

### **Cloudflare Pages 배포**
```bash
npm run deploy:cf
```

---

## 4. 유용한 명령어 (Utility Commands)

- `npm run lint`: ESLint를 사용하여 코드 스타일 및 잠재적 오류를 검사합니다.
- `npm run optimize:images`: `public/assets` 내의 원본 이미지를 최적화합니다.
- `npm run start`: 빌드된 프로덕션 서버를 실행합니다.
