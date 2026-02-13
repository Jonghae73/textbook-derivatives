import React, { useState } from 'react';

const FuturesHedgeCalculator = () => {
  const [hedgeType, setHedgeType] = useState('naive');
  const [spotValue, setSpotValue] = useState('');
  const [futuresPrice, setFuturesPrice] = useState('');
  const [multiplier, setMultiplier] = useState('250000');
  const [spotStdDev, setSpotStdDev] = useState('');
  const [futuresStdDev, setFuturesStdDev] = useState('');
  const [correlation, setCorrelation] = useState('');
  const [result, setResult] = useState(null);

  const calculateHedge = () => {
    const S = parseFloat(spotValue);
    const F = parseFloat(futuresPrice);
    const M = parseFloat(multiplier);

    if (isNaN(S) || isNaN(F) || isNaN(M) || S <= 0 || F <= 0 || M <= 0) {
      alert('유효한 값을 입력해주세요.');
      return;
    }

    const contractValue = F * M;
    let hedgeRatio;
    let contracts;

    if (hedgeType === 'naive') {
      // 기본 헤지비율
      hedgeRatio = 1;
      contracts = S / contractValue;
    } else {
      // 최소분산 헤지비율
      const sigmaS = parseFloat(spotStdDev);
      const sigmaF = parseFloat(futuresStdDev);
      const rho = parseFloat(correlation);

      if (isNaN(sigmaS) || isNaN(sigmaF) || isNaN(rho) || 
          sigmaS <= 0 || sigmaF <= 0 || rho < -1 || rho > 1) {
        alert('최소분산 헤지를 위한 유효한 값을 입력해주세요.');
        return;
      }

      hedgeRatio = rho * (sigmaS / sigmaF);
      contracts = hedgeRatio * (S / contractValue);
    }

    setResult({
      hedgeRatio: hedgeRatio,
      contracts: contracts,
      roundedContracts: Math.round(contracts),
      contractValue: contractValue,
      hedgedValue: Math.round(contracts) * contractValue,
      hedgeType: hedgeType === 'naive' ? '기본 헤지' : '최소분산 헤지'
    });
  };

  const resetForm = () => {
    setSpotValue('');
    setFuturesPrice('');
    setMultiplier('250000');
    setSpotStdDev('');
    setFuturesStdDev('');
    setCorrelation('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
        선물 헤지비율 계산기
      </h2>

      {/* 헤지 방식 선택 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-lg font-semibold mb-3 text-gray-700">
          헤지 방식 선택
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="naive"
              checked={hedgeType === 'naive'}
              onChange={(e) => setHedgeType(e.target.value)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-base">기본 헤지 (Naive Hedge)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="minvar"
              checked={hedgeType === 'minvar'}
              onChange={(e) => setHedgeType(e.target.value)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-base">최소분산 헤지 (Minimum Variance Hedge)</span>
          </label>
        </div>
      </div>

      {/* 기본 입력값 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            현물 포지션 가치 (원)
          </label>
          <input
            type="number"
            value={spotValue}
            onChange={(e) => setSpotValue(e.target.value)}
            placeholder="예: 100000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            선물 가격
          </label>
          <input
            type="number"
            value={futuresPrice}
            onChange={(e) => setFuturesPrice(e.target.value)}
            placeholder="예: 400"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            선물 계약 승수
          </label>
          <input
            type="number"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            placeholder="예: 250000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            KOSPI200 선물: 250,000원
          </p>
        </div>
      </div>

      {/* 최소분산 헤지 추가 입력값 */}
      {hedgeType === 'minvar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              현물 수익률 표준편차 (σ_S)
            </label>
            <input
              type="number"
              step="0.01"
              value={spotStdDev}
              onChange={(e) => setSpotStdDev(e.target.value)}
              placeholder="예: 0.15"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              선물 수익률 표준편차 (σ_F)
            </label>
            <input
              type="number"
              step="0.01"
              value={futuresStdDev}
              onChange={(e) => setFuturesStdDev(e.target.value)}
              placeholder="예: 0.16"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              상관계수 (ρ)
            </label>
            <input
              type="number"
              step="0.01"
              min="-1"
              max="1"
              value={correlation}
              onChange={(e) => setCorrelation(e.target.value)}
              placeholder="예: 0.95"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              -1 ~ 1 사이 값
            </p>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={calculateHedge}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          계산하기
        </button>
        <button
          onClick={resetForm}
          className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-lg"
        >
          초기화
        </button>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
          <h3 className="text-2xl font-bold mb-4 text-green-700">
            계산 결과 ({result.hedgeType})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">헤지비율</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.hedgeRatio.toFixed(4)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">필요한 선물 계약 수</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.contracts.toFixed(2)} 계약
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (반올림: {result.roundedContracts} 계약)
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">선물 계약 1개당 가치</p>
              <p className="text-xl font-bold text-gray-700">
                {result.contractValue.toLocaleString()} 원
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">실제 헤지 금액</p>
              <p className="text-xl font-bold text-gray-700">
                {result.hedgedValue.toLocaleString()} 원
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 해석:</span> 현물 포지션을 헤지하기 위해서는 
              선물 <span className="font-bold text-blue-600">{result.roundedContracts}계약</span>을 
              <span className="font-bold text-red-600"> 매도</span>해야 합니다.
            </p>
          </div>
        </div>
      )}

      {/* 설명 섹션 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-2 text-gray-800">📚 계산 방식 설명</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <span className="font-semibold">• 기본 헤지:</span> 헤지비율 = 1, 
            계약수 = 현물가치 / (선물가격 × 승수)
          </p>
          <p>
            <span className="font-semibold">• 최소분산 헤지:</span> 헤지비율 = ρ × (σ_S / σ_F), 
            계약수 = 헤지비율 × 현물가치 / (선물가격 × 승수)
          </p>
          <p className="text-xs text-gray-500 mt-2">
            * 매도 포지션이므로 실제 거래 시 선물을 매도(Short)해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuturesHedgeCalculator;
