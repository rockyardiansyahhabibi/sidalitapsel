// === Util ===
function parseCSV(text){
  const rows=[];let row=[],col='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c==='\"'){ if(q && n==='\"'){ col+='\"'; i++; } else { q=!q; } }
    else if(c===',' && !q){ row.push(col); col=''; }
    else if((c==='\n'||c==='\r') && !q){ if(col.length||row.length){ row.push(col); rows.push(row); row=[]; col=''; } }
    else { col+=c; }
  }
  if(col.length||row.length){ row.push(col); rows.push(row); }
  return rows;
}
function toObjects(rows){
  const header = rows.shift().map(h=>h.trim());
  return rows.filter(r=>r.length && r.some(x=>(x||'').trim().length))
         .map(r=>Object.fromEntries(header.map((h,i)=>[h,(r[i]||'').trim()])));
}
function unique(a){ return [...new Set(a.filter(Boolean))]; }
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000); }

// === Tabs ===
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{
  $$('.nav a').forEach(x=>x.classList.remove('active')); a.classList.add('active');
  const id=a.getAttribute('data-tab'); $$('.tab').forEach(t=>t.classList.remove('active')); $(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}));

// === Beranda: isi profil & link + sinkron statistik dari Sheet ===
async function fetchCSV({SHEET_ID, GID}){
  const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
  const res = await fetch(url,{cache:'no-store'});
  if(!res.ok) throw new Error('CSV fetch failed'); const text = await res.text();
  return toObjects(parseCSV(text));
}
async function loadBeranda(){
  // profil
  const list = $("#profilList"); list.innerHTML = PROFIL_TAPSEL.map(x=>`<li>${x}</li>`).join('');
  // quick links
  const links = $("#quickLinks"); links.innerHTML = QUICK_LINKS.map(x=>`<a target="_blank" rel="noopener" href="${x.href}">${x.text}</a>`).join('');
  // stats
  try{
    const data = await fetchCSV({SHEET_ID, GID});
    $("#b-statKec").textContent = unique(data.map(d=>d['Kecamatan'])).length || '—';
    $("#b-statKel").textContent = unique(data.map(d=>d['Kelurahan'])).length || '—';
    $("#b-statPenduduk").textContent = '—'; // isi manual lewat profil bila dibutuhkan
  }catch(e){ console.error(e); }
}

// === Infografis ===
async function loadInfografis(){
  try{
    const data = await fetchCSV({SHEET_ID, GID});
    $("#sheetLink").href = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${GID}`;
    $("#statRows").textContent = data.length;
    const uniqKec = unique(data.map(d=>d['Kecamatan'])); $("#statKec").textContent = uniqKec.length;
    const uniqKel = unique(data.map(d=>d['Kelurahan'])); $("#statKel").textContent = uniqKel.length;
    // Chart
    const counts = {}; data.forEach(d=>{ const k=d['Kecamatan']||'-'; counts[k]=(counts[k]||0)+1; });
    const labels = Object.keys(counts).sort(); const values = labels.map(k=>counts[k]);
    new Chart($("#chartKec"), { type:'bar', data:{ labels, datasets:[{label:'Entri per Kecamatan', data: values}] }, options:{plugins:{legend:{display:false}},scales:{x:{ticks:{autoSkip:false}}}} });
  }catch(e){ console.error(e); toast('Gagal memuat infografis'); }
}

// === Tabel Master ===
function renderTable(th,tb,data){ const cols = Object.keys(data[0]||{}); th.innerHTML='<tr>'+cols.map(c=>`<th>${c}</th>`).join('')+'</tr>'; tb.innerHTML = data.map(o=>'<tr>'+cols.map(c=>`<td>${o[c]??''}</td>`).join('')+'</tr>').join(''); }
async function loadMasters(){
  try{
    const [c,l,k] = await Promise.all([ fetchCSV(CAMAT), fetchCSV(LURAH), fetchCSV(KEPLING) ]);
    renderTable($("#th-camat"), $("#tb-camat"), c);
    renderTable($("#th-lurah"), $("#tb-lurah"), l);
    renderTable($("#th-kepling"), $("#tb-kepling"), k);
  }catch(e){ console.error(e); toast('Gagal memuat tabel master'); }
}

// === Form Submit ===
$("#submitForm").addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const p = {
    kecamatan: $("#f_kec").value.trim(),
    kelurahan: $("#f_kel").value.trim(),
    kepling: $("#f_kepling").value.trim(),
    alamat: $("#f_alamat").value.trim(),
    kontak: $("#f_kontak").value.trim(),
    catatan: $("#f_catatan").value.trim(),
    sumber: $("#f_sumber").value.trim(),
    timestamp: new Date().toISOString(),
  };
  if(!p.kecamatan || !p.kelurahan){ toast('Kecamatan & Kelurahan wajib diisi'); return; }
  if(!SUBMIT_ENDPOINT){ toast('SUBMIT_ENDPOINT belum diisi di config.js'); return; }
  $("#formStatus").textContent='Mengirim…';
  try{
    const res = await fetch(SUBMIT_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p), mode:'cors' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const out = await res.json().catch(()=>({message:'OK'}));
    $("#formStatus").textContent='Terkirim ✅'; (ev.target).reset(); toast(out.message || 'Terima kasih');
  }catch(e){ console.error(e); $("#formStatus").textContent='Gagal mengirim ❌'; toast('Gagal mengirim'); }
});

document.addEventListener('DOMContentLoaded', ()=>{
  $("#year").textContent = new Date().getFullYear();
  loadBeranda(); loadInfografis(); loadMasters();
});
