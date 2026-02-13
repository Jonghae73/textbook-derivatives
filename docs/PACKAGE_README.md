# 파생상품론 시뮬레이터 - 배포 패키지

## 📦 포함된 파일

### HTML 파일 (배포용)
- `index.html` - 메인 페이지 ✅
- `futures-hedge.html` - 선물 헤지 계산기 ✅
- `black-scholes.html` - 블랙-숄즈 계산기 (생성 필요)
- `binomial-option.html` - 이항모형 계산기 (생성 필요)

### JSX 파일 (원본 소스)
- `FuturesHedgeCalculator.jsx` ✅
- `OptionPriceCalculator.jsx` ✅
- `BinomialOptionCalculator.jsx` ✅

## 🚀 빠른 배포 방법

### 방법 1: GitHub Pages (권장)

```bash
# 1. 저장소 클론
git clone https://github.com/Jonghae73/textbook-derivatives.git
cd textbook-derivatives

# 2. docs 폴더 생성
mkdir docs

# 3. HTML 파일들을 docs 폴더로 복사
cp index.html futures-hedge.html docs/

# 4. GitHub에 푸시
git add docs/
git commit -m "Add derivatives simulators"
git push origin main

# 5. GitHub Settings > Pages에서 설정
# Source: main branch
# Folder: /docs
```

접속 URL: `https://jonghae73.github.io/textbook-derivatives/`

### 방법 2: Vite 프로젝트로 변환 (고급)

```bash
# 1. Vite React 프로젝트 생성
npm create vite@latest derivatives-sim -- --template react
cd derivatives-sim
npm install

# 2. JSX 파일들을 src/components/ 폴더로 복사

# 3. src/App.jsx 수정하여 라우팅 추가

# 4. 빌드
npm run build

# 5. dist 폴더를 docs로 복사
cp -r dist/* ../docs/
```

## 📝 나머지 2개 HTML 파일 생성 방법

### 블랙-숄즈 계산기 (black-scholes.html)

`futures-hedge.html` 을 복사해서:
1. 제목 변경
2. `<script type="text/babel">` 안의 컴포넌트를 `OptionPriceCalculator.jsx` 내용으로 교체
3. `import` 문 제거
4. `export default` 제거
5. 마지막에 `ReactDOM.render(<OptionPriceCalculator />, document.getElementById('root'));` 추가

### 이항모형 계산기 (binomial-option.html)

동일한 방법으로 `BinomialOptionCalculator.jsx` 사용

## 🛠️ HTML 변환 템플릿

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>계산기 이름</title>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            color: #667eea;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    </style>
</head>
<body>
    <a href="index.html" class="back-button">← 메인으로</a>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useRef, useEffect } = React;
        
        // JSX 파일 내용을 여기에 붙여넣기 (import/export 제외)
        
        ReactDOM.render(<ComponentName />, document.getElementById('root'));
    </script>
</body>
</html>
```

## ✅ 체크리스트

### 파일 준비
- [x] index.html
- [x] futures-hedge.html  
- [ ] black-scholes.html
- [ ] binomial-option.html
- [x] FuturesHedgeCalculator.jsx
- [x] OptionPriceCalculator.jsx
- [x] BinomialOptionCalculator.jsx

### GitHub 배포
- [ ] docs 폴더 생성
- [ ] HTML 파일 복사
- [ ] Git commit & push
- [ ] GitHub Pages 활성화
- [ ] 웹사이트 접속 테스트

## 🎯 다음 단계

1. **지금 제공된 파일들을 다운로드**
2. **나머지 2개 HTML을 변환** (위의 템플릿 사용)
3. **모든 파일을 `docs/` 폴더에 넣기**
4. **GitHub에 push**
5. **GitHub Pages 활성화**

## 💡 팁

- HTML 파일 크기가 크면 브라우저가 느려질 수 있습니다
- 향후 Vite로 빌드하면 최적화됩니다
- JSX 원본은 꼭 백업해두세요!

## 📞 문제 해결

**Q: HTML 파일이 너무 큽니다**
A: Vite로 프로젝트화하면 코드 스플리팅으로 해결됩니다

**Q: Canvas가 안 보입니다**
A: 브라우저 콘솔에서 에러 확인, React CDN 로드 확인

**Q: 스타일이 안 먹힙니다**
A: Tailwind CDN이 제대로 로드되었는지 확인
