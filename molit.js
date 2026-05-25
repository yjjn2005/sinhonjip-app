*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: #1B3A6B;
  --sky: #2E75B6;
  --gold: #C9A84C;
  --green: #1E7E34;
  --red: #C0392B;
  --gray: #555555;
  --light-bg: #EEF3FA;
  --gold-bg: #FDF6E3;
  --green-bg: #E8F5E9;
  --white: #FFFFFF;
  --border: #CCCCCC;
}

body {
  font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f8f9fb;
  color: var(--gray);
  min-height: 100vh;
}

/* 헤더 */
.app-header {
  background: var(--navy);
  color: white;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}
.app-header h1 { font-size: 1.2rem; font-weight: 700; }
.app-header .subtitle { font-size: 0.8rem; opacity: 0.8; margin-left: auto; }

/* 메인 레이아웃 */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
}
@media (max-width: 768px) {
  .app-main { grid-template-columns: 1fr; }
}

/* 검색 패널 */
.search-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 72px;
}
.search-panel-title {
  background: var(--sky);
  color: white;
  padding: 14px 18px;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
}
.search-form { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 5px;
}
.form-group select,
.form-group input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--gray);
  background: white;
  transition: border-color 0.2s;
}
.form-group select:focus,
.form-group input:focus { outline: none; border-color: var(--sky); }

.range-row { display: flex; gap: 8px; align-items: center; }
.range-row input { flex: 1; }
.range-row span { color: var(--gray); font-size: 0.85rem; white-space: nowrap; }

.checkbox-group { display: flex; flex-wrap: wrap; gap: 7px; }
.checkbox-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.85rem; cursor: pointer;
  background: var(--light-bg); border-radius: 6px;
  padding: 5px 10px; transition: background 0.15s;
}
.checkbox-label:hover { background: #dce8f7; }
.checkbox-label input { cursor: pointer; accent-color: var(--sky); }

.radio-group { display: flex; gap: 10px; }
.radio-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.9rem; cursor: pointer;
  padding: 7px 14px; border-radius: 7px;
  border: 1.5px solid var(--border);
  transition: all 0.15s;
}
.radio-label.active { background: var(--sky); color: white; border-color: var(--sky); }

.btn-search {
  background: var(--navy);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 13px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-search:hover { background: var(--sky); }
.btn-search:disabled { background: #aaa; cursor: not-allowed; }

/* 빠른 추천 버튼 */
.quick-btns { display: flex; flex-wrap: wrap; gap: 7px; padding: 14px 18px; border-top: 1px solid #eee; }
.quick-btn {
  background: var(--gold-bg); color: var(--gold);
  border: 1.5px solid var(--gold); border-radius: 20px;
  padding: 5px 12px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  font-family: inherit;
}
.quick-btn:hover { background: var(--gold); color: white; }

/* 결과 패널 */
.result-panel { display: flex; flex-direction: column; gap: 16px; }

.map-container {
  background: white; border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}
.map-header {
  background: var(--light-bg); padding: 12px 18px;
  font-weight: 700; font-size: 0.9rem; color: var(--navy);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 6px;
}
#kakao-map { width: 100%; height: 360px; }

.result-header {
  background: white; border-radius: 10px;
  padding: 14px 18px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.result-count {
  font-weight: 700; font-size: 1rem; color: var(--navy);
}
.dedup-badge {
  background: var(--green-bg); color: var(--green);
  border-radius: 20px; padding: 3px 10px;
  font-size: 0.78rem; font-weight: 700;
}
.sort-select {
  margin-left: auto; padding: 5px 10px;
  border: 1px solid var(--border); border-radius: 6px;
  font-family: inherit; font-size: 0.82rem; cursor: pointer;
}

.listings { display: flex; flex-direction: column; gap: 12px; }

/* 매물 카드 */
.listing-card {
  background: white; border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  overflow: hidden; transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
}
.listing-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }

.card-top {
  padding: 16px 18px 12px;
  border-left: 4px solid var(--sky);
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 10px;
}
.card-name { font-weight: 700; font-size: 1rem; color: var(--navy); }
.card-location { font-size: 0.82rem; color: #888; margin-top: 2px; }
.card-price { text-align: right; }
.card-price .amount { font-size: 1.2rem; font-weight: 800; color: var(--navy); }
.card-price .type-label { font-size: 0.75rem; color: #888; }

.card-badges {
  padding: 0 18px 10px;
  display: flex; gap: 7px; flex-wrap: wrap;
}
.badge {
  border-radius: 20px; padding: 3px 10px;
  font-size: 0.75rem; font-weight: 700;
}
.badge-loan { background: var(--green-bg); color: var(--green); }
.badge-no-loan { background: #f5f5f5; color: #999; }
.badge-area { background: var(--light-bg); color: var(--sky); }
.badge-dup { background: #fff3e0; color: #e65100; }

.card-stats {
  padding: 10px 18px 14px;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; border-top: 1px solid #f0f0f0;
}
.stat-item { text-align: center; }
.stat-label { font-size: 0.72rem; color: #aaa; margin-bottom: 2px; }
.stat-value { font-size: 0.88rem; font-weight: 700; color: var(--navy); }

/* 빈 상태 */
.empty-state {
  background: white; border-radius: 12px; padding: 60px 20px;
  text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-title { font-size: 1.1rem; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
.empty-desc { font-size: 0.87rem; color: #aaa; }

/* 로딩 */
.loading-state {
  background: white; border-radius: 12px; padding: 50px 20px;
  text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.spinner {
  width: 40px; height: 40px; border: 4px solid var(--light-bg);
  border-top-color: var(--sky); border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { color: var(--sky); font-weight: 700; }

/* API 키 안내 배너 */
.api-banner {
  background: var(--gold-bg); border: 1.5px solid var(--gold);
  border-radius: 10px; padding: 14px 18px;
  font-size: 0.85rem; color: #7a5a00;
  display: flex; gap: 8px; align-items: flex-start;
}
.api-banner a { color: var(--sky); }

/* 반응형 */
@media (max-width: 480px) {
  .card-top { flex-direction: column; }
  .card-price { text-align: left; }
  .card-stats { grid-template-columns: repeat(2, 1fr); }
}
