// Bargain Beacon — renders the deal finder, its search, filters and sorting.
// Everything runs from local files only: no fetch, no network, no cookies.
import { CHECKED_AT, CHECKED_NOTE, CATEGORIES, STORES, DEALS, discountOf, savedOf } from './deals.js';

const VERDICT_LABEL = {
  'new-low': 'NEW LOW',
  strong: 'STRONG DEAL',
  routine: 'ROUTINE SALE',
};

const state = {
  q: '',
  category: 'All',
  store: 'All',
  minDiscount: 0,
  sort: 'discount',
};

const grid = document.getElementById('grid');
const countLine = document.getElementById('count-line');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const discountSelect = document.getElementById('min-discount');
const chipRow = document.getElementById('category-chips');
const storeRow = document.getElementById('store-chips');
const topPicks = document.getElementById('top-picks');

function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '');
}

function dealCard(d) {
  const pct = discountOf(d);
  const saved = savedOf(d);
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = d.id;
  card.innerHTML =
    '<div class="card-top"><span class="cat">' + escapeHtml(d.category) + '</span>' +
    '<span class="verdict verdict-' + d.verdict + '">' + VERDICT_LABEL[d.verdict] + '</span></div>' +
    '<h3>' + escapeHtml(d.name) + '</h3>' +
    '<div class="prices"><span class="sale">' + money(d.sale) + '</span>' +
    '<span class="usual">' + money(d.usual) + '</span>' +
    '<span class="pct">-' + pct + '%</span></div>' +
    '<p class="save">You save <strong>' + money(saved) + '</strong></p>' +
    '<p class="why">' + escapeHtml(d.verdictNote) + '</p>' +
    '<div class="meta"><span class="store store-' + d.store.toLowerCase().replace(/[^a-z]/g, '') + '">' + escapeHtml(d.store) + '</span>' +
    '<span class="checked">Checked ' + CHECKED_AT + '</span></div>' +
    '<p class="source">Source: ' + escapeHtml(d.source) + '</p>' +
    '<a class="buy" href="' + escapeAttr(d.link) + '" target="_blank" rel="noopener">View at ' + escapeHtml(d.store) + ' &rarr;</a>';
  return card;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

function visibleDeals() {
  const q = state.q.trim().toLowerCase();
  let list = DEALS.filter((d) => {
    if (state.category !== 'All' && d.category !== state.category) return false;
    if (state.store !== 'All' && d.store !== state.store) return false;
    if (discountOf(d) < state.minDiscount) return false;
    if (q && !(d.name + ' ' + d.store + ' ' + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    discount: (a, b) => discountOf(b) - discountOf(a),
    saved: (a, b) => savedOf(b) - savedOf(a),
    priceAsc: (a, b) => a.sale - b.sale,
    priceDesc: (a, b) => b.sale - a.sale,
  };
  return list.sort(by[state.sort] || by.discount);
}

function render() {
  const list = visibleDeals();
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p class="empty">No deals match those filters. Try clearing the search or lowering the discount.</p>';
  } else {
    for (const d of list) grid.appendChild(dealCard(d));
  }
  const totalSaved = list.reduce((sum, d) => sum + savedOf(d), 0);
  countLine.textContent =
    list.length + ' of ' + DEALS.length + ' deals shown \u00b7 ' +
    money(totalSaved) + ' total savings on screen \u00b7 prices checked ' + CHECKED_AT;
  syncChips();
  writeParams();
}

function chip(container, values, current, onPick, label) {
  container.innerHTML = '';
  for (const v of values) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (v === current ? ' active' : '');
    b.textContent = v;
    b.setAttribute('aria-pressed', v === current ? 'true' : 'false');
    b.setAttribute('aria-label', label + ': ' + v);
    b.addEventListener('click', () => onPick(v));
    container.appendChild(b);
  }
}

function syncChips() {
  chip(chipRow, CATEGORIES, state.category, (v) => { state.category = v; render(); }, 'Category');
  chip(storeRow, STORES, state.store, (v) => { state.store = v; render(); }, 'Store');
}

function readParams() {
  const p = new URLSearchParams(location.search);
  if (p.get('q')) { state.q = p.get('q'); searchInput.value = state.q; }
  if (p.get('cat') && CATEGORIES.includes(p.get('cat'))) state.category = p.get('cat');
  if (p.get('store') && STORES.includes(p.get('store'))) state.store = p.get('store');
  const min = Number(p.get('min'));
  if (Number.isFinite(min) && [0, 20, 40, 50].includes(min)) { state.minDiscount = min; discountSelect.value = String(min); }
  if (p.get('sort') && ['discount', 'saved', 'priceAsc', 'priceDesc'].includes(p.get('sort'))) {
    state.sort = p.get('sort');
    sortSelect.value = state.sort;
  }
  // Deep link: ?view=grid jumps straight to the deal grid (shareable view).
  if (p.get('view') === 'grid') {
    requestAnimationFrame(() => document.getElementById('grid').scrollIntoView());
  }
}

function writeParams() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category !== 'All') p.set('cat', state.category);
  if (state.store !== 'All') p.set('store', state.store);
  if (state.minDiscount) p.set('min', String(state.minDiscount));
  if (state.sort !== 'discount') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? '?' + qs : location.pathname);
}

function renderTopPicks() {
  const picks = [...DEALS].sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 3);
  topPicks.innerHTML = '';
  for (const d of picks) {
    const li = document.createElement('li');
    li.innerHTML =
      '<span class="pick-rank">-' + discountOf(d) + '%</span> ' +
      '<strong>' + escapeHtml(d.name) + '</strong> \u2014 ' + money(d.sale) +
      ' at ' + escapeHtml(d.store) + ' (was ' + money(d.usual) + ')';
    topPicks.appendChild(li);
  }
}

searchInput.addEventListener('input', () => { state.q = searchInput.value; render(); });
sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; render(); });
discountSelect.addEventListener('change', () => { state.minDiscount = Number(discountSelect.value); render(); });
document.getElementById('clear-filters').addEventListener('click', () => {
  state.q = '';
  state.category = 'All';
  state.store = 'All';
  state.minDiscount = 0;
  state.sort = 'discount';
  searchInput.value = '';
  sortSelect.value = 'discount';
  discountSelect.value = '0';
  render();
});

readParams();
renderTopPicks();
render();
