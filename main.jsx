import { useState, useEffect, useCallback } from 'react'
import { SEOUL_GU, fetchAptRent, deduplicateListings, checkLoanEligibility, calcMonthlyInterest } from './api/molit.js'

// ── 카카오맵 로더 ───────────────────────────────────────
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY || '';

function loadKakaoMap(appKey) {
  return new Promise((resolve) => {
    if (window.kakao?.maps) { resolve(window.kakao.maps); return; }
    if (!appKey) { resolve(null); return; }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.onload = () => { window.kakao.maps.load(() => resolve(window.kakao.maps)); };
    document.head.appendChild(script);
  });
}

// ── 메인 앱 ────────────────────────────────────────────
export default function App() {
  // 검색 조건
  const [gu, setGu] = useState('송파구');
  const [minDeposit, setMinDeposit] = useState(30000);
  const [maxDeposit, setMaxDeposit] = useState(70000);
  const [moveMonth, setMoveMonth] = useState('2026-11');
  const [areas, setAreas] = useState(['59', '74', '84']);
  const [rentType, setRentType] = useState('all');
  const [sortBy, setSortBy] = useState('deposit_asc');

  // 결과
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [rawCount, setRawCount] = useState(0);

  // 카카오맵
  const [kakaoMaps, setKakaoMaps] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    loadKakaoMap(KAKAO_APP_KEY).then(m => setKakaoMaps(m));
  }, []);

  useEffect(() => {
    if (!kakaoMaps || !listings.length) return;
    const container = document.getElementById('kakao-map');
    if (!container) return;
    const m = map || new kakaoMaps.Map(container, {
      center: new kakaoMaps.LatLng(37.5665, 126.9780),
      level: 7,
    });
    if (!map) setMap(m);
    // 기존 마커 제거 후 재표시 (실제 배포 시 geocoding API로 좌표 변환 필요)
    listings.slice(0, 10).forEach((item, i) => {
      const lat = 37.5665 + (Math.random() - 0.5) * 0.1;
      const lng = 126.9780 + (Math.random() - 0.5) * 0.1;
      const marker = new kakaoMaps.Marker({ position: new kakaoMaps.LatLng(lat, lng), map: m });
      const info = new kakaoMaps.InfoWindow({
        content: `<div style="padding:8px;font-size:12px;font-family:맑은 고딕;min-width:120px">
          <b style="color:#1B3A6B">${item.aptName}</b><br/>
          보증금 ${(item.deposit/10000).toFixed(1)}억
          ${item.monthlyRent ? ' / 월세 ' + item.monthlyRent + '만' : ''}
          ${checkLoanEligibility(item.deposit) ? '<br/><span style="color:#1E7E34;font-weight:700">✓ 서울시 대출 가능</span>' : ''}
        </div>`,
      });
      kakaoMaps.event.addListener(marker, 'click', () => info.open(m, marker));
    });
  }, [kakaoMaps, listings]);

  // 검색 실행
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const lawdCd = SEOUL_GU[gu];
      const ym = moveMonth.replace('-', '');
      const prev = String(parseInt(ym) - 1);
      const [curr, prevData] = await Promise.all([
        fetchAptRent(lawdCd, ym),
        fetchAptRent(lawdCd, prev),
      ]);
      const raw = [...curr, ...prevData];
      setRawCount(raw.length);

      // 조건 필터링
      let filtered = raw.filter(item => {
        const depositOk = item.deposit >= minDeposit && item.deposit <= maxDeposit;
        const areaOk = areas.length === 0 || areas.some(a => {
          if (a === '59') return item.area < 70;
          if (a === '74') return item.area >= 70 && item.area < 80;
          if (a === '84') return item.area >= 80 && item.area < 100;
          return true;
        });
        const typeOk = rentType === 'all' ||
          (rentType === 'jeonse' && item.monthlyRent === 0) ||
          (rentType === 'semi' && item.monthlyRent > 0);
        return depositOk && areaOk && typeOk;
      });

      // 중복배제
      const deduped = deduplicateListings(filtered);

      // 정렬
      deduped.sort((a, b) => {
        if (sortBy === 'deposit_asc') return a.deposit - b.deposit;
        if (sortBy === 'deposit_desc') return b.deposit - a.deposit;
        if (sortBy === 'area_desc') return b.area - a.area;
        return 0;
      });

      setListings(deduped);
    } finally {
      setLoading(false);
    }
  }, [gu, minDeposit, maxDeposit, moveMonth, areas, rentType, sortBy]);

  // 빠른 추천 버튼
  const quickSearch = (guName, max) => {
    setGu(guName);
    setMaxDeposit(max);
    setTimeout(handleSearch, 100);
  };

  // 평형 체크박스 토글
  const toggleArea = (v) => {
    setAreas(prev => prev.includes(v) ? prev.filter(a => a !== v) : [...prev, v]);
  };

  // 정렬 적용
  const sorted = [...listings].sort((a, b) => {
    if (sortBy === 'deposit_asc') return a.deposit - b.deposit;
    if (sortBy === 'deposit_desc') return b.deposit - a.deposit;
    if (sortBy === 'area_desc') return b.area - a.area;
    return 0;
  });

  const fmtDeposit = (v) => v >= 10000 ? `${(v/10000).toFixed(v%10000===0?0:1)}억` : `${v}만`;

  return (
    <>
      {/* 헤더 */}
      <header className="app-header">
        <span style={{fontSize:'1.4rem'}}>🏠</span>
        <h1>HomeFit</h1>
        <span style={{fontSize:'0.75rem',background:'rgba(255,255,255,0.15)',padding:'3px 8px',borderRadius:20,marginLeft:8}}>
          중복배제 실시간 전세 탐색
        </span>
        <span className="subtitle">신혼부부 맞춤 · 서울시 대출 자동 판단</span>
      </header>

      <main className="app-main">
        {/* 검색 패널 */}
        <aside>
          <div className="search-panel">
            <div className="search-panel-title">🔍 매물 검색 조건</div>
            <div className="search-form">

              {/* ① 서울시 구 선택 */}
              <div className="form-group">
                <label>① 서울시 구 선택</label>
                <select value={gu} onChange={e => setGu(e.target.value)}>
                  {Object.keys(SEOUL_GU).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* ② 전세보증금 범위 */}
              <div className="form-group">
                <label>② 전세보증금 범위 (만원)</label>
                <div className="range-row">
                  <input type="number" value={minDeposit} min={0} step={1000}
                    onChange={e => setMinDeposit(Number(e.target.value))}
                    placeholder="최소" />
                  <span>~</span>
                  <input type="number" value={maxDeposit} min={0} step={1000}
                    onChange={e => setMaxDeposit(Number(e.target.value))}
                    placeholder="최대" />
                </div>
                {maxDeposit <= 70000 && (
                  <div style={{fontSize:'0.75rem',color:'#1E7E34',marginTop:4,fontWeight:700}}>
                    ✓ 서울시 이자지원 대상 (7억 이하)
                  </div>
                )}
                {maxDeposit > 70000 && (
                  <div style={{fontSize:'0.75rem',color:'#C0392B',marginTop:4}}>
                    ⚠ 7억 초과 시 서울시 이자지원 불가
                  </div>
                )}
              </div>

              {/* ③ 필요시기 */}
              <div className="form-group">
                <label>③ 필요시기 (입주 희망월)</label>
                <input type="month" value={moveMonth}
                  onChange={e => setMoveMonth(e.target.value)} />
              </div>

              {/* ④ 평형 */}
              <div className="form-group">
                <label>④ 평형 (전용면적)</label>
                <div className="checkbox-group">
                  {[['59', '59㎡ (~70㎡)'], ['74', '74㎡ (70~80㎡)'], ['84', '84㎡ (80~100㎡)']].map(([v, l]) => (
                    <label key={v} className="checkbox-label">
                      <input type="checkbox" checked={areas.includes(v)}
                        onChange={() => toggleArea(v)} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              {/* ⑤ 매물 유형 */}
              <div className="form-group">
                <label>⑤ 매물 유형</label>
                <div className="radio-group">
                  {[['all','전체'], ['jeonse','전세'], ['semi','반전세']].map(([v, l]) => (
                    <label key={v} className={`radio-label ${rentType===v?'active':''}`}
                      onClick={() => setRentType(v)} style={{cursor:'pointer'}}>
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn-search" onClick={handleSearch} disabled={loading}>
                {loading ? '🔄 검색 중...' : '🔍 매물 검색 (중복배제)'}
              </button>
            </div>

            {/* 빠른 추천 */}
            <div>
              <div style={{padding:'10px 18px 6px',fontSize:'0.78rem',color:'#aaa',fontWeight:700}}>⚡ 빠른 추천</div>
              <div className="quick-btns">
                {[['송파구', 70000], ['은평구', 50000], ['마포구', 65000], ['강서구', 55000], ['성동구', 68000]].map(([g, m]) => (
                  <button key={g} className="quick-btn" onClick={() => quickSearch(g, m)}>
                    {g} ▶
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API 키 안내 */}
          {!import.meta.env.VITE_MOLIT_API_KEY && (
            <div className="api-banner" style={{marginTop:12}}>
              <span>ℹ️</span>
              <div>
                <b>데모 모드 실행 중</b><br/>
                실제 매물 조회를 위해 <a href="https://data.go.kr" target="_blank" rel="noreferrer">data.go.kr</a>에서
                국토부 API 키를 발급받고, .env 파일에 <code>VITE_MOLIT_API_KEY=인증키</code>를 설정하세요.
              </div>
            </div>
          )}
        </aside>

        {/* 결과 패널 */}
        <section className="result-panel">
          {/* 카카오맵 */}
          <div className="map-container">
            <div className="map-header">
              🗺 카카오맵 시각화
              {!KAKAO_APP_KEY && <span style={{fontSize:'0.75rem',color:'#aaa',marginLeft:8}}>(Kakao App Key 설정 후 활성화)</span>}
            </div>
            <div id="kakao-map" style={{
              background: KAKAO_APP_KEY ? undefined : 'linear-gradient(135deg,#EEF3FA,#dce8f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', color: '#888'
            }}>
              {!KAKAO_APP_KEY && (
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'2rem',marginBottom:8}}>🗺</div>
                  <div><b>.env</b>에 <code>VITE_KAKAO_APP_KEY</code>를 설정하면 지도가 표시됩니다</div>
                  <div style={{fontSize:'0.8rem',marginTop:4}}>developers.kakao.com에서 발급</div>
                </div>
              )}
            </div>
          </div>

          {/* 결과 헤더 */}
          {searched && !loading && (
            <div className="result-header">
              <span className="result-count">
                {listings.length === 0 ? '조건에 맞는 매물 없음' : `매물 ${listings.length}건`}
              </span>
              {listings.length > 0 && (
                <span className="dedup-badge">
                  ✓ 중복배제 완료 ({rawCount} → {listings.length}건)
                </span>
              )}
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="deposit_asc">보증금 낮은 순</option>
                <option value="deposit_desc">보증금 높은 순</option>
                <option value="area_desc">면적 큰 순</option>
              </select>
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <div className="loading-text">실거래가 조회 중 · 중복 제거 중...</div>
            </div>
          )}

          {/* 빈 상태 */}
          {!loading && !searched && (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <div className="empty-title">조건을 입력하고 검색하세요</div>
              <div className="empty-desc">
                구 · 보증금 · 평형 · 입주시기를 설정하면<br/>
                중복배제된 맞춤 매물을 바로 확인할 수 있습니다
              </div>
            </div>
          )}

          {!loading && searched && listings.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">조건에 맞는 매물이 없습니다</div>
              <div className="empty-desc">
                보증금 범위를 늘리거나 다른 구를 선택해 보세요
              </div>
            </div>
          )}

          {/* 매물 카드 리스트 */}
          {!loading && listings.length > 0 && (
            <div className="listings">
              {sorted.map((item, i) => {
                const loanOk = checkLoanEligibility(item.deposit);
                const loanAmt = 30000; // 3억 기준
                const monthly = loanOk ? calcMonthlyInterest(loanAmt) : null;
                return (
                  <div key={i} className="listing-card">
                    <div className="card-top">
                      <div>
                        <div className="card-name">{item.aptName}</div>
                        <div className="card-location">
                          {gu} {item.dong} · {item.floor}층 · {item.buildYear}년
                        </div>
                      </div>
                      <div className="card-price">
                        <div className="amount">{fmtDeposit(item.deposit)}</div>
                        {item.monthlyRent > 0 && (
                          <div style={{fontSize:'0.85rem',color:'#C0392B',fontWeight:700}}>
                            + 월 {item.monthlyRent}만
                          </div>
                        )}
                        <div className="type-label">{item.type}</div>
                      </div>
                    </div>
                    <div className="card-badges">
                      <span className={`badge ${loanOk ? 'badge-loan' : 'badge-no-loan'}`}>
                        {loanOk ? '✓ 서울시 이자지원 가능' : '✗ 이자지원 한도 초과'}
                      </span>
                      <span className="badge badge-area">{item.area.toFixed(1)}㎡</span>
                      {item.brokerCount > 1 && (
                        <span className="badge badge-dup">{item.brokerCount}개 중개소</span>
                      )}
                    </div>
                    <div className="card-stats">
                      <div className="stat-item">
                        <div className="stat-label">추정 월이자 (3억 기준)</div>
                        <div className="stat-value">
                          {loanOk ? `${monthly?.toLocaleString()}만원` : '-'}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">계약연월</div>
                        <div className="stat-value">{item.dealYear}.{item.dealMonth}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">평형</div>
                        <div className="stat-value">
                          {item.area < 70 ? '59㎡형' : item.area < 80 ? '74㎡형' : '84㎡형'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
