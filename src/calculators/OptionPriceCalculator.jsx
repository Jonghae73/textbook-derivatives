import React, { useState } from 'react';

// 정규분포 누적분포함수 (CDF) 근사
const normCDF = (x) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
};

// 정규분포 확률밀도함수 (PDF)
const normPDF = (x) => {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
};

// Black-Scholes 공식
const calculateBlackScholes = (S, K, T, r, sigma, optionType) => {
  if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
    return null;
  }

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let price, delta, gamma, theta, vega, rho;

  if (optionType === 'call') {
    // Call Option
    price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
    delta = normCDF(d1);
    rho = K * T * Math.exp(-r * T) * normCDF(d2) / 100; // per 1% change
  } else {
    // Put Option
    price = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
    delta = normCDF(d1) - 1;
    rho = -K * T * Math.exp(-r * T) * normCDF(-d2) / 100; // per 1% change
  }

  // Greeks (same for both call and put)
  gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
  
  const theta1 = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T));
  const theta2 = optionType === 'call' 
    ? -r * K * Math.exp(-r * T) * normCDF(d2)
    : r * K * Math.exp(-r * T) * normCDF(-d2);
  theta = (theta1 + theta2) / 365; // per day

  vega = S * normPDF(d1) * Math.sqrt(T) / 100; // per 1% change in volatility

  return {
    price,
    delta,
    gamma,
    theta,
    vega,
    rho,
    d1,
    d2
  };
};

const OptionPriceCalculator = () => {
  const [optionType, setOptionType] = useState('call');
  const [spotPrice, setSpotPrice] = useState('');
  const [strikePrice, setStrikePrice] = useState('');
  const [timeToMaturity, setTimeToMaturity] = useState('');
  const [riskFreeRate, setRiskFreeRate] = useState('');
  const [volatility, setVolatility] = useState('');
  const [result, setResult] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);

  const calculateOption = () => {
    const S = parseFloat(spotPrice);
    const K = parseFloat(strikePrice);
    const T = parseFloat(timeToMaturity);
    const r = parseFloat(riskFreeRate) / 100; // Convert percentage to decimal
    const sigma = parseFloat(volatility) / 100; // Convert percentage to decimal

    if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(sigma)) {
      alert('모든 값을 올바르게 입력해주세요.');
      return;
    }

    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
      alert('모든 값은 양수여야 합니다.');
      return;
    }

    const calculated = calculateBlackScholes(S, K, T, r, sigma, optionType);
    
    if (calculated) {
      setResult({
        ...calculated,
        inputs: { S, K, T, r: r * 100, sigma: sigma * 100, optionType }
      });
    }
  };

  const resetForm = () => {
    setSpotPrice('');
    setStrikePrice('');
    setTimeToMaturity('');
    setRiskFreeRate('');
    setVolatility('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg font-sans">
      {/* 헤더 - Part 3 파란색 테마 - 축소 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-bold font-serif">블랙-숄즈 옵션 가격 계산기</h2>
        <p className="text-blue-100 text-xs mt-0.5">Black-Scholes Option Pricing Model</p>
      </div>

      {/* 입력/출력 좌우 분할 - 입력 20%, 출력 80% */}
      <div className="grid grid-cols-5 gap-6">
        {/* 왼쪽: 입력 영역 (1/5 = 20%) */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-300 pb-2 flex items-center gap-2 font-serif">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            입력 파라미터
          </h3>

          {/* 입력 필드들 */}
          <div className="space-y-3">
            {/* 옵션 유형 선택 */}
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
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                기초자산 가격 (S) <span className="text-red-500">*</span>
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
                만기 (T, 년) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={timeToMaturity}
                onChange={(e) => setTimeToMaturity(e.target.value)}
                placeholder="예: 1"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
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
                변동성 (σ, %) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={volatility}
                onChange={(e) => setVolatility(e.target.value)}
                placeholder="예: 20"
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
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

          {/* Black-Scholes 모델 설명 */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
            <h4 className="font-bold mb-2 text-blue-800 flex items-center gap-2 font-serif">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              Black-Scholes 모델
            </h4>
            <div className="text-gray-700 space-y-1">
              <p>• 유럽형 옵션의 이론가격 산출 모델</p>
              <p>• 무배당 주식, 연속 거래 가정</p>
              <p>• Greeks: 민감도 지표</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 출력 영역 (4/5 = 80%) */}
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
                  {result.inputs.optionType === 'call' ? '콜 옵션' : '풋 옵션'} 이론가격
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {result.price.toFixed(4)}
                </p>
              </div>

              {/* 계산 과정 표시 */}
              {showCalculation && (
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <h4 className="text-sm font-bold mb-3 text-blue-800 font-serif">📐 계산 과정</h4>
                  
                  <div className="space-y-3 text-xs">
                    {/* Step 1: d1 계산 */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">1. d₁ 계산</p>
                      <div className="font-mono text-xs bg-white p-2 rounded border">
                        <p>d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)</p>
                        <p className="mt-1 text-gray-600">
                          = [ln({result.inputs.S}/{result.inputs.K}) + ({(result.inputs.r/100).toFixed(4)} + {(Math.pow(result.inputs.sigma/100, 2)/2).toFixed(6)}) × {result.inputs.T}] / ({(result.inputs.sigma/100).toFixed(4)} × √{result.inputs.T})
                        </p>
                        <p className="mt-1 text-blue-600 font-bold">
                          = {result.d1.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: d2 계산 */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">2. d₂ 계산</p>
                      <div className="font-mono text-xs bg-white p-2 rounded border">
                        <p>d₂ = d₁ - σ√T</p>
                        <p className="mt-1 text-gray-600">
                          = {result.d1.toFixed(6)} - {(result.inputs.sigma/100).toFixed(4)} × √{result.inputs.T}
                        </p>
                        <p className="mt-1 text-blue-600 font-bold">
                          = {result.d2.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: N(d1), N(d2) */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">3. 정규분포 누적확률</p>
                      <div className="font-mono text-xs bg-white p-2 rounded border">
                        <p>N(d₁) = {normCDF(result.d1).toFixed(6)}</p>
                        <p>N(d₂) = {normCDF(result.d2).toFixed(6)}</p>
                        {result.inputs.optionType === 'put' && (
                          <>
                            <p className="mt-1">N(-d₁) = {normCDF(-result.d1).toFixed(6)}</p>
                            <p>N(-d₂) = {normCDF(-result.d2).toFixed(6)}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Step 4: 옵션 가격 계산 */}
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700 mb-2">4. {result.inputs.optionType === 'call' ? '콜' : '풋'} 옵션 가격</p>
                      <div className="font-mono text-xs bg-white p-2 rounded border">
                        {result.inputs.optionType === 'call' ? (
                          <>
                            <p>C = S × N(d₁) - K × e^(-rT) × N(d₂)</p>
                            <p className="mt-1 text-gray-600">
                              = {result.inputs.S} × {normCDF(result.d1).toFixed(6)} - {result.inputs.K} × e^(-{(result.inputs.r/100).toFixed(4)} × {result.inputs.T}) × {normCDF(result.d2).toFixed(6)}
                            </p>
                            <p className="mt-1 text-gray-600">
                              = {(result.inputs.S * normCDF(result.d1)).toFixed(4)} - {(result.inputs.K * Math.exp(-(result.inputs.r/100) * result.inputs.T) * normCDF(result.d2)).toFixed(4)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p>P = K × e^(-rT) × N(-d₂) - S × N(-d₁)</p>
                            <p className="mt-1 text-gray-600">
                              = {result.inputs.K} × e^(-{(result.inputs.r/100).toFixed(4)} × {result.inputs.T}) × {normCDF(-result.d2).toFixed(6)} - {result.inputs.S} × {normCDF(-result.d1).toFixed(6)}
                            </p>
                            <p className="mt-1 text-gray-600">
                              = {(result.inputs.K * Math.exp(-(result.inputs.r/100) * result.inputs.T) * normCDF(-result.d2)).toFixed(4)} - {(result.inputs.S * normCDF(-result.d1)).toFixed(4)}
                            </p>
                          </>
                        )}
                        <p className="mt-2 text-blue-600 font-bold text-base">
                          = {result.price.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Greeks 계산 요약 */}
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border border-yellow-300">
                      <p className="font-semibold text-gray-700 mb-2">5. Greeks 계산 공식</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-semibold">Delta:</span> {result.inputs.optionType === 'call' ? 'N(d₁)' : 'N(d₁) - 1'} = {result.delta.toFixed(4)}</p>
                        <p><span className="font-semibold">Gamma:</span> N'(d₁) / (S × σ × √T) = {result.gamma.toFixed(6)}</p>
                        <p><span className="font-semibold">Theta:</span> [계산식 생략] / 365 = {result.theta.toFixed(4)} (per day)</p>
                        <p><span className="font-semibold">Vega:</span> S × N'(d₁) × √T / 100 = {result.vega.toFixed(4)} (per 1%)</p>
                        <p><span className="font-semibold">Rho:</span> [계산식 생략] / 100 = {result.rho.toFixed(4)} (per 1%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Greeks */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-300">
                <h4 className="text-sm font-bold mb-3 text-yellow-800 font-serif">Greeks (민감도 지표)</h4>
                
                <div className="space-y-2">
                  {/* Delta */}
                  <div className="bg-white p-2.5 rounded border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Delta (Δ)</span>
                      <span className="text-lg font-bold text-blue-600">{result.delta.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">기초자산 1원 변화 시 옵션가격 변화</p>
                  </div>

                  {/* Gamma */}
                  <div className="bg-white p-2.5 rounded border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Gamma (Γ)</span>
                      <span className="text-lg font-bold text-green-600">{result.gamma.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">기초자산 1원 변화 시 Delta 변화</p>
                  </div>

                  {/* Theta */}
                  <div className="bg-white p-2.5 rounded border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Theta (Θ)</span>
                      <span className="text-lg font-bold text-red-600">{result.theta.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">하루 경과 시 옵션가격 변화</p>
                  </div>

                  {/* Vega */}
                  <div className="bg-white p-2.5 rounded border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Vega (ν)</span>
                      <span className="text-lg font-bold text-purple-600">{result.vega.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">변동성 1% 변화 시 옵션가격 변화</p>
                  </div>

                  {/* Rho */}
                  <div className="bg-white p-2.5 rounded border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Rho (ρ)</span>
                      <span className="text-lg font-bold text-orange-600">{result.rho.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">금리 1% 변화 시 옵션가격 변화</p>
                  </div>
                </div>
              </div>

              {/* 입력값 요약 */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2 font-serif">
                  <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  입력값 요약
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">기초자산:</span>
                    <p className="font-semibold">{result.inputs.S.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">행사가:</span>
                    <p className="font-semibold">{result.inputs.K.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">만기:</span>
                    <p className="font-semibold">{result.inputs.T.toFixed(2)}년</p>
                  </div>
                  <div>
                    <span className="text-gray-600">금리:</span>
                    <p className="font-semibold">{result.inputs.r.toFixed(2)}%</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">변동성:</span>
                    <p className="font-semibold">{result.inputs.sigma.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
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

export default OptionPriceCalculator;
