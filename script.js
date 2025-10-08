// Util: CSV parser (sederhana, mendukung koma di dalam kutip)
function parseCSV(text) {
  const rows = [];
  let row = [], col = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"') {
      if (inQuotes && n === '"') { col += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(col); col = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (col.length || row.length) { row.push(col); rows.push(row); row = []; col = ''; }
    } else {
      col += c;
    }
  }
  if (col.length || row.length) { row.push(col); rows.push(row); }
  return rows;
}

function toObjects(rows) {
  const header = rows.shift().map(h => h.trim());
  return rows.filter(r => r.length && r.some(x => (x || '').trim().length))
             .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
}

function buildThead(columns) {
  const thead = document.getElementById('thead');
  thead.innerHTML = '<tr>' + columns.map(c => `<th>${c}</th>`).join('') + '</tr>';
}

function buildTbody(data, columns) {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = data.map(obj => '<tr>' + columns.map(c => `<td>${(obj[c] ?? '')}</td>`).join('') + '</tr>').join('');
  document.getElementById('count').textContent = `${data.length} baris ditampilkan`;
}

function unique(list) { return [...new Set(list.filter(Boolean))]; }

function fillKecamatanFilter(data) {
  const sel = document.getElementById('kecamatan');
  const opts = ['(Semua Kecamatan)', ...unique(data.map(d => d['Kecamatan']))];
  sel.innerHTML = opts.map((o, i) => `<option value="${i === 0 ? '' : o}">${o}</option>`).join('');
}

function matchesQuery(obj, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return SEARCH_COLUMNS.some(k => (obj[k] || '').toString().toLowerCase().includes(needle));
}

async function loadData() {
  const status = document.getElementById('status');
  status.textContent = 'Memuat data…';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
  document.getElementById('sheetLink').href = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${GID}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengunduh CSV');
    const text = await res.text();
    const rows = parseCSV(text);
    const objs = toObjects(rows);
    window.__DATA__ = objs;

    // Siapkan kolom & tabel
    const columns = COLUMN_ORDER.filter(c => c in (objs[0] || {}));
    buildThead(columns);
    buildTbody(objs, columns);
    fillKecamatanFilter(objs);
    status.textContent = `Data termuat (${objs.length} baris)`;
  } catch (e) {
    console.error(e);
    status.textContent = 'Gagal memuat data. Pastikan Sheet dapat diakses publik (Anyone with the link) dan ID/GID benar.';
  }
}

function applyFilters() {
  const q = document.getElementById('q').value.trim();
  const kec = document.getElementById('kecamatan').value;
  const src = window.__DATA__ || [];
  let filtered = src.filter(o => matchesQuery(o, q));
  if (kec) filtered = filtered.filter(o => (o['Kecamatan'] || '') === kec);
  const columns = COLUMN_ORDER.filter(c => c in (src[0] || {}));
  buildTbody(filtered, columns);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('refresh').addEventListener('click', loadData);
  document.getElementById('q').addEventListener('input', applyFilters);
  document.getElementById('kecamatan').addEventListener('change', applyFilters);
  loadData();
});
