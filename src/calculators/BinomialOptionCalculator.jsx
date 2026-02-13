import React, { useState, useRef, useEffect } from 'react';

const BinomialOptionCalculator = () => {
  const [optionType, setOptionType] = useState('call');
  const [exerciseType, setExerciseType] = useState('european');
  const [spotPrice, setSpotPrice] = useState('');
  const [strikePrice, setStrikePrice] = useState('');
  const [upFactor, setUpFactor] = useState('');
  const [downFactor, setDownFactor] = useState('');
  const [riskFreeRate, setRiskFreeRate] = useState('');
  const [periods, setPeriods] = useState('2');
  const [result, setResult] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);

  // 이항트리 계산
  const calculateBinomialTree = (S0, K, u, d, r, n, isCall, isEuropean) => {
    // 주가 트리 생성
    const stockTree = Array(n + 1).fill(null).map(() => []);
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= i; j++) {
        const price = S0 * Math.pow(u, i - j) * Math.pow(d, j);
        stockTree[i].push(price);
      }
    }

    // 위험중립확률
    const p = (Math.exp(r) - d) / (u - d);

    // 옵션가치 트리 생성
    const optionTree = Array(n + 1).fill(null).map(() => []);
    
    // 만기 시점의 옵션가치
    for (let j = 0; j <= n; j++) {
      const ST = stockTree[n][j];
      if (isCall) {
        optionTree[n][j] = Math.max(ST - K, 0);
      } else {
        optionTree[n][j] = Math.max(K - ST, 0);
      }
    }

    // 조기행사 여부 저장
    const earlyExercise = Array(n + 1).fill(null).map(() => []);

    // 후진귀납법
    for (let i = n - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        // 보유가치 (계속 보유)
        const holdValue = Math.exp(-r) * (p * optionTree[i + 1][j] + (1 - p) * optionTree[i + 1][j + 1]);
        
        if (isEuropean) {
          // 유럽형: 보유가치만
          optionTree[i][j] = holdValue;
          earlyExercise[i][j] = false;
        } else {
          // 미국형: 보유가치 vs 행사가치
          const ST = stockTree[i][j];
          const exerciseValue = isCall ? Math.max(ST - K, 0) : Math.max(K - ST, 0);
          
          if (exerciseValue > holdValue) {
            optionTree[i][j] = exerciseValue;
            earlyExercise[i][j] = true;
          } else {
            optionTree[i][j] = holdValue;
            earlyExercise[i][j] = false;
          }
        }
      }
    }

    return { stockTree, optionTree, riskNeutralProb: p, earlyExercise };
  };

  const calculateOption = () => {
    const S0 = parseFloat(spotPrice);
    const K = parseFloat(strikePrice);
    const u = parseFloat(upFactor);
    const d = parseFloat(downFactor);
    const r = parseFloat(riskFreeRate) / 100;
    const n = parseInt(periods);

    if (isNaN(S0) || isNaN(K) || isNaN(u) || isNaN(d) || isNaN(r) || isNaN(n)) {
      alert('모든 값을 올바르게 입력해주세요.');
      return;
    }

    if (u <= 1 || d >= 1 || d >= u) {
      alert('상승률(u)은 1보다 크고, 하락률(d)은 1보다 작아야 하며, u > d 이어야 합니다.');
      return;
    }

    const calculated = calculateBinomialTree(
      S0, K, u, d, r, n,
      optionType === 'call',
      exerciseType === 'european'
    );

    setResult({
      ...calculated,
      inputs: { S0, K, u, d, r: r * 100, n, optionType, exerciseType }
    });
  };

  const resetForm = () => {
    setSpotPrice('');
    setStrikePrice('');
    setUpFactor('');
    setDownFactor('');
    setRiskFreeRate('');
    setPeriods('2');
    setResult(null);
    setShowCalculation(false);
    setScale(1);
  };

  // Canvas에 트리 그리기
  useEffect(() => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const n = result.inputs.n;

    // Canvas 크기 설정 - 계산식 표시를 위해 높이 증가
    const baseWidth = 800;
    const baseHeight = 700;
    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    // 트리 그리기 설정
    const padding = 30;
    const width = baseWidth - 2 * padding;
    const height = baseHeight - 2 * padding;
    const dx = width / n;
    const nodeRadius = 40;

    // 폰트 설정
    ctx.font = '11px Noto Sans KR, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 선 그리기
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;

    for (let i = 0; i < n; i++) {
      const x1 = padding + i * dx;
      const nodeCount = i + 1;
      const dy = height / nodeCount;

      for (let j = 0; j <= i; j++) {
        const y1 = padding + j * dy + dy / 2;

        // 상승 연결선
        const x2 = padding + (i + 1) * dx;
        const nodeCount2 = i + 2;
        const dy2 = height / nodeCount2;
        const y2_up = padding + j * dy2 + dy2 / 2;
        const y2_down = padding + (j + 1) * dy2 + dy2 / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2_up);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2_down);
        ctx.stroke();
      }
    }

    // 노드 그리기
    for (let i = 0; i <= n; i++) {
      const x = padding + i * dx;
      const nodeCount = i + 1;
      const dy = height / nodeCount;

      for (let j = 0; j <= i; j++) {
        const y = padding + j * dy + dy / 2;
        const stockPrice = result.stockTree[i][j];
        const optionValue = result.optionTree[i][j];
        const isEarlyExercise = result.earlyExercise[i] && result.earlyExercise[i][j];

        // 노드 원 그리기
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        
        if (isEarlyExercise) {
          ctx.fillStyle = '#FEF3C7'; // 조기행사 노드는 노란색
          ctx.strokeStyle = '#F59E0B';
        } else {
          ctx.fillStyle = '#EFF6FF';
          ctx.strokeStyle = '#3B82F6';
        }
        
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // 주가 텍스트
        ctx.fillStyle = '#1E40AF';
        ctx.font = 'bold 12px Noto Sans KR, sans-serif';
        ctx.fillText(`S=${stockPrice.toFixed(2)}`, x, y - 12);

        // 옵션가치 텍스트 - C 또는 P로 표시
        const optionLabel = result.inputs.optionType === 'call' ? 'C' : 'P';
        ctx.fillStyle = isEarlyExercise ? '#D97706' : '#059669';
        ctx.font = '12px Noto Sans KR, sans-serif';
        ctx.fillText(`${optionLabel}=${optionValue.toFixed(2)}`, x, y + 8);

        // 조기행사 표시
        if (isEarlyExercise) {
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 9px Noto Sans KR, sans-serif';
          ctx.fillText('행사', x, y + 20);
        }

        // 계산식 표시 (노드 아래) - 주가 계산식
        ctx.fillStyle = '#4B5563';
        ctx.font = '13px Noto Sans KR, sans-serif';
        
        const upCount = i - j;
        const downCount = j;
        let yOffset = nodeRadius + 18;
        
        if (i === 0) {
          ctx.fillText('S₀', x, y + yOffset);
        } else if (upCount === 0) {
          ctx.fillText(`S₀ × d${downCount > 1 ? `^${downCount}` : ''}`, x, y + yOffset);
        } else if (downCount === 0) {
          ctx.fillText(`S₀ × u${upCount > 1 ? `^${upCount}` : ''}`, x, y + yOffset);
        } else {
          ctx.fillText(`S₀ × u${upCount > 1 ? `^${upCount}` : ''} × d${downCount > 1 ? `^${downCount}` : ''}`, x, y + yOffset);
        }

        // 옵션가치 계산식 표시
        yOffset += 18;
        ctx.fillStyle = '#059669';
        ctx.font = '13px Noto Sans KR, sans-serif';
        
        if (i === n) {
          // 만기시점: max 계산식
          if (result.inputs.optionType === 'call') {
            ctx.fillText(`max(S - K, 0)`, x, y + yOffset);
            yOffset += 16;
            ctx.font = '12px Noto Sans KR, sans-serif';
            ctx.fillText(`= ${(Math.max(stockPrice - result.inputs.K, 0)).toFixed(2)}`, x, y + yOffset);
          } else {
            ctx.fillText(`max(K - S, 0)`, x, y + yOffset);
            yOffset += 16;
            ctx.font = '12px Noto Sans KR, sans-serif';
            ctx.fillText(`= ${(Math.max(result.inputs.K - stockPrice, 0)).toFixed(2)}`, x, y + yOffset);
          }
        } else if (i === 0) {
          // 초기 노드: 최종 결과
          ctx.font = 'bold 13px Noto Sans KR, sans-serif';
          ctx.fillText(`최종 ${optionLabel}`, x, y + yOffset);
        } else {
          // 중간 노드: 할인된 기댓값
          const upValue = result.optionTree[i + 1][j];
          const downValue = result.optionTree[i + 1][j + 1];
          const p = result.riskNeutralProb;
          const discount = Math.exp(-result.inputs.r / 100);
          
          // 첫 줄: 공식
          ctx.fillText(`e^(-r) × [p × ${optionLabel}ᵤ + (1-p) × ${optionLabel}ᵨ]`, x, y + yOffset);
          yOffset += 16;
          
          // 둘째 줄: 값 대입
          ctx.font = '12px Noto Sans KR, sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText(`= ${discount.toFixed(4)} × [${p.toFixed(3)} × ${upValue.toFixed(2)}`, x, y + yOffset);
          yOffset += 14;
          ctx.fillText(`  + ${(1-p).toFixed(3)} × ${downValue.toFixed(2)}]`, x, y + yOffset);
          yOffset += 16;
          
          // 결과
          if (isEarlyExercise) {
            // 조기행사한 경우
            const exerciseValue = result.inputs.optionType === 'call' ? 
              Math.max(stockPrice - result.inputs.K, 0) : 
              Math.max(result.inputs.K - stockPrice, 0);
            ctx.fillStyle = '#D97706';
            ctx.font = 'bold 12px Noto Sans KR, sans-serif';
            ctx.fillText(`행사 = ${exerciseValue.toFixed(2)}`, x, y + yOffset);
          } else {
            ctx.fillStyle = '#059669';
            ctx.font = 'bold 13px Noto Sans KR, sans-serif';
            ctx.fillText(`= ${optionValue.toFixed(2)}`, x, y + yOffset);
          }
        }
      }
    }

    // 레이블 추가
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Noto Sans KR, sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i <= n; i++) {
      const x = padding + i * dx;
      ctx.fillText(`t=${i}`, x - 10, padding - 20);
    }

  }, [result, scale]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg font-sans">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-bold font-serif">이항옵션가격결정모형 계산기</h2>
        <p className="text-blue-100 text-xs mt-0.5">Binomial Option Pricing Model</p>
      </div>

      {/* 입력/출력 좌우 분할 */}
      <div className="grid grid-cols-5 gap-6">
        {/* 왼쪽: 입력 영역 */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-300 pb-2 flex items-center gap-2 font-serif">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            입력 파라미터
          </h3>

          <div className="space-y-3">
            {/* 옵션 유형 */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                옵션 유형 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center cursor-pointer px-2 py-1.5 rounded bg-white border border-blue-300 hover:border-blue-500 transition-colors text-xs">
                  <input
                    type="radio"
                    value="call"
                    checked={optionType === 'call'}
                    onChange={(e) => setOptionType(e.target.value)}
                    className="mr-2 w-3 h-3 text-blue-600"
                  />
                  <span className="font-medium">콜 (Call)</span>
                </label>
                <label className="flex items-center cursor-pointer px-2 py-1.5 rounded bg-white border border-blue-300 hover:border-blue-500 transition-colors text-xs">
                  <input
                    type="radio"
                    value="put"
                    checked={optionType === 'put'}
                    onChange={(e) => setOptionType(e.target.value)}
                    className="mr-2 w-3 h-3 text-blue-600"
                  />
                  <span className="font-medium">풋 (Put)</span>
                </label>
              </div>
            </div>

            {/* 행사 유형 */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                행사 유형 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center cursor-pointer px-2 py-1.5 rounded bg-white border border-blue-300 hover:border-blue-500 transition-colors text-xs">
                  <input
                    type="radio"
                    value="european"
                    checked={exerciseType === 'european'}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="mr-2 w-3 h-3 text-blue-600"
                  />
                  <span className="font-medium">유럽형</span>
                </label>
                <label className="flex items-center cursor-pointer px-2 py-1.5 rounded bg-white border border-blue-300 hover:border-blue-500 transition-colors text-xs">
                  <input
                    type="radio"
                    value="american"
                    checked={exerciseType === 'american'}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="mr-2 w-3 h-3 text-blue-600"
                  />
                  <span className="font-medium">미국형</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                현재 주가 (S₀) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={spotPrice}
                onChange={(e) => setSpotPrice(e.target.value)}
                placeholder="예: 100"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                행사가격 (K) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
                placeholder="예: 100"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                상승률 (u) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={upFactor}
                onChange={(e) => setUpFactor(e.target.value)}
                placeholder="예: 1.2"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-0.5">u &gt; 1</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                하락률 (d) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={downFactor}
                onChange={(e) => setDownFactor(e.target.value)}
                placeholder="예: 0.8"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-0.5">d &lt; 1, d &lt; u</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                무위험이자율 (r, %) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(e.target.value)}
                placeholder="예: 5"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                기간 수 (n) <span className="text-red-500">*</span>
              </label>
              <select
                value={periods}
                onChange={(e) => setPeriods(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="1">1단계</option>
                <option value="2">2단계</option>
                <option value="3">3단계</option>
                <option value="4">4단계</option>
                <option value="5">5단계</option>
              </select>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={calculateOption}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
            >
              계산하기
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm shadow-md"
            >
              초기화
            </button>
          </div>

          {/* 이항모형 설명 */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
            <h4 className="font-bold mb-2 text-blue-800 flex items-center gap-2 font-serif">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              이항옵션가격모형
            </h4>
            <div className="text-gray-700 space-y-1">
              <p>• 각 기간마다 주가가 u배 상승 또는 d배 하락</p>
              <p>• 후진귀납법으로 옵션가치 계산</p>
              <p>• 미국형은 조기행사 고려</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 출력 영역 */}
        <div className="col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-300 pb-2 flex items-center gap-2 font-serif flex-1">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              계산 결과
            </h3>
            {result && (
              <button
                onClick={() => setShowCalculation(!showCalculation)}
                className="ml-4 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {showCalculation ? '계산과정 숨기기' : '계산과정 보기'}
              </button>
            )}
          </div>

          {result ? (
            <>
              {/* 옵션 가격 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                <p className="text-xs text-gray-600 mb-1">
                  {result.inputs.optionType === 'call' ? '콜' : '풋'} 옵션 ({result.inputs.exerciseType === 'european' ? '유럽형' : '미국형'}) 가격
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {result.optionTree[0][0].toFixed(4)}
                </p>
              </div>

              {/* 위험중립확률 */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300">
                <h4 className="text-sm font-bold mb-3 text-green-800 font-serif">위험중립확률 (p) 계산</h4>
                <div className="space-y-3">
                  {/* 공식 */}
                  <div className="font-mono text-sm bg-white p-3 rounded border">
                    <p className="font-bold text-gray-800 mb-2">1. 기본 공식</p>
                    <p className="text-gray-700">p = (e^r - d) / (u - d)</p>
                  </div>

                  {/* 입력값 대입 */}
                  <div className="font-mono text-sm bg-white p-3 rounded border">
                    <p className="font-bold text-gray-800 mb-2">2. 입력값 대입</p>
                    <div className="text-gray-700 space-y-1">
                      <p>• u (상승률) = {result.inputs.u}</p>
                      <p>• d (하락률) = {result.inputs.d}</p>
                      <p>• r (무위험이자율) = {result.inputs.r}% = {(result.inputs.r/100).toFixed(4)}</p>
                    </div>
                  </div>

                  {/* 단계별 계산 */}
                  <div className="font-mono text-sm bg-white p-3 rounded border">
                    <p className="font-bold text-gray-800 mb-2">3. 단계별 계산</p>
                    <div className="text-gray-700 space-y-1">
                      <p>Step 1: e^r 계산</p>
                      <p className="ml-4 text-blue-600">
                        e^{(result.inputs.r/100).toFixed(4)} = {Math.exp(result.inputs.r/100).toFixed(6)}
                      </p>
                      
                      <p className="mt-2">Step 2: 분자 계산 (e^r - d)</p>
                      <p className="ml-4 text-blue-600">
                        {Math.exp(result.inputs.r/100).toFixed(6)} - {result.inputs.d} = {(Math.exp(result.inputs.r/100) - result.inputs.d).toFixed(6)}
                      </p>
                      
                      <p className="mt-2">Step 3: 분모 계산 (u - d)</p>
                      <p className="ml-4 text-blue-600">
                        {result.inputs.u} - {result.inputs.d} = {(result.inputs.u - result.inputs.d).toFixed(6)}
                      </p>
                      
                      <p className="mt-2">Step 4: 최종 계산</p>
                      <p className="ml-4 text-blue-600">
                        p = {(Math.exp(result.inputs.r/100) - result.inputs.d).toFixed(6)} / {(result.inputs.u - result.inputs.d).toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {/* 최종 결과 */}
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded border-2 border-green-400">
                    <p className="font-bold text-green-800 mb-1">최종 결과:</p>
                    <div className="font-mono text-lg">
                      <p className="text-green-700">
                        <span className="font-bold">p = {result.riskNeutralProb.toFixed(6)}</span>
                        <span className="text-sm ml-2">≈ {(result.riskNeutralProb * 100).toFixed(2)}%</span>
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        1 - p = {(1 - result.riskNeutralProb).toFixed(6)}
                        <span className="ml-2">≈ {((1 - result.riskNeutralProb) * 100).toFixed(2)}%</span>
                      </p>
                    </div>
                  </div>

                  {/* 해석 */}
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-xs">
                    <p className="font-semibold text-blue-800 mb-1">💡 의미:</p>
                    <p className="text-gray-700">
                      위험중립 세계에서 주가가 상승할 확률이 {(result.riskNeutralProb * 100).toFixed(2)}%, 
                      하락할 확률이 {((1 - result.riskNeutralProb) * 100).toFixed(2)}%입니다.
                      이는 실제 확률이 아닌, 옵션 가격 결정을 위한 가상의 확률입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 이항트리 시각화 */}
              <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-blue-800 font-serif">🌳 이항트리 시각화</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                    >
                      축소
                    </button>
                    <span className="text-xs text-gray-600">{Math.round(scale * 100)}%</span>
                    <button
                      onClick={() => setScale(Math.min(2, scale + 0.1))}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                    >
                      확대
                    </button>
                  </div>
                </div>
                
                <div className="overflow-auto border rounded">
                  <canvas ref={canvasRef} className="mx-auto" />
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-semibold mb-1">범례:</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full"></div>
                      <span>일반 노드</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-100 border-2 border-orange-500 rounded-full"></div>
                      <span>조기행사 노드 (미국형)</span>
                    </div>
                  </div>
                  <p className="mt-1 text-gray-600">S = 주가, V = 옵션가치</p>
                </div>
              </div>

              {/* 계산 과정 */}
              {showCalculation && (
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <h4 className="text-sm font-bold mb-3 text-blue-800 font-serif">📐 계산 과정 (후진귀납법)</h4>
                  
                  <div className="space-y-3 text-xs">
                    {/* 만기시점 옵션가치 */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">1. 만기시점 (t={result.inputs.n}) 옵션가치</p>
                      <div className="space-y-1">
                        {result.stockTree[result.inputs.n].map((price, j) => {
                          const optVal = result.optionTree[result.inputs.n][j];
                          const optionLabel = result.inputs.optionType === 'call' ? 'C' : 'P';
                          return (
                            <div key={j} className="font-mono text-xs bg-white p-2 rounded border">
                              <p>S({result.inputs.n},{j}) = {price.toFixed(2)}</p>
                              <p className="text-blue-600">
                                {optionLabel}({result.inputs.n},{j}) = max({result.inputs.optionType === 'call' ? `${price.toFixed(2)} - ${result.inputs.K}` : `${result.inputs.K} - ${price.toFixed(2)}`}, 0) = {optVal.toFixed(4)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 후진귀납 예시 (첫 몇 단계만) */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">2. 후진귀납법 (예시: t={result.inputs.n - 1})</p>
                      <div className="space-y-2">
                        {result.optionTree[result.inputs.n - 1].map((optVal, j) => {
                          const stockPrice = result.stockTree[result.inputs.n - 1][j];
                          const upValue = result.optionTree[result.inputs.n][j];
                          const downValue = result.optionTree[result.inputs.n][j + 1];
                          const holdValue = Math.exp(-result.inputs.r/100) * (result.riskNeutralProb * upValue + (1 - result.riskNeutralProb) * downValue);
                          const isEarlyEx = result.earlyExercise[result.inputs.n - 1] && result.earlyExercise[result.inputs.n - 1][j];
                          const optionLabel = result.inputs.optionType === 'call' ? 'C' : 'P';
                          
                          return (
                            <div key={j} className="font-mono text-xs bg-white p-2 rounded border">
                              <p className="font-semibold">노드 ({result.inputs.n - 1},{j}): S = {stockPrice.toFixed(2)}</p>
                              <p>보유가치 = e^(-r) × [p×{optionLabel}_up + (1-p)×{optionLabel}_down]</p>
                              <p className="text-gray-600 text-xs">
                                = e^(-{(result.inputs.r/100).toFixed(4)}) × [{result.riskNeutralProb.toFixed(4)}×{upValue.toFixed(4)} + {(1-result.riskNeutralProb).toFixed(4)}×{downValue.toFixed(4)}]
                              </p>
                              <p className="text-blue-600">= {holdValue.toFixed(4)}</p>
                              {result.inputs.exerciseType === 'american' && (
                                <>
                                  <p className="mt-1">
                                    행사가치 = {result.inputs.optionType === 'call' ? 
                                      `max(${stockPrice.toFixed(2)} - ${result.inputs.K}, 0)` : 
                                      `max(${result.inputs.K} - ${stockPrice.toFixed(2)}, 0)`
                                    } = {(result.inputs.optionType === 'call' ? Math.max(stockPrice - result.inputs.K, 0) : Math.max(result.inputs.K - stockPrice, 0)).toFixed(4)}
                                  </p>
                                  <p className="mt-1 font-bold text-green-600">
                                    최종 {optionLabel} = {isEarlyEx ? '행사가치 (조기행사)' : '보유가치'} = {optVal.toFixed(4)}
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-300">
                      <p className="font-semibold text-gray-700">최종 옵션가격 (t=0)</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {result.inputs.optionType === 'call' ? 'C' : 'P'}(0,0) = {result.optionTree[0][0].toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-sm font-medium">왼쪽에서 입력값을 입력하고<br/>계산하기 버튼을 눌러주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinomialOptionCalculator;
