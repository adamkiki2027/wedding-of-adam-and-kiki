/* =====================================================================
   Label amplop/kado — pengaturan ukuran, desain, cetak, dan Stasiun Cetak
   Dipakai oleh index.html (aplikasi scan) dan cetak.html.
   ===================================================================== */
(function () {
  'use strict';

  var PRESETS = [
    { id: '60x40', n: 'Stiker 60 × 40 mm (disarankan)', w: 60, h: 40 },
    { id: '50x30', n: 'Stiker 50 × 30 mm', w: 50, h: 30 },
    { id: '40x30', n: 'Stiker 40 × 30 mm', w: 40, h: 30 },
    { id: '70x50', n: 'Stiker 70 × 50 mm', w: 70, h: 50 },
    { id: '80x50', n: 'Stiker 80 × 50 mm', w: 80, h: 50 },
    { id: '100x50', n: 'Stiker 100 × 50 mm', w: 100, h: 50 },
    { id: '58x40', n: 'Roll struk/stiker 58 mm (panjang 40 mm)', w: 58, h: 40 },
    { id: '80x60', n: 'Roll struk 80 mm (panjang 60 mm)', w: 80, h: 60 },
    { id: '62x29', n: 'Brother DK 62 × 29 mm', w: 62, h: 29 },
    { id: '62x100', n: 'Brother DK 62 × 100 mm', w: 62, h: 100 },
    { id: 'custom', n: 'Ukuran lain (isi sendiri)…' }
  ];
  var FIELDS = [
    ['acara', 'Nama acara'], ['urut', 'Nomor urut'], ['nama', 'Nama tamu'], ['kat', 'Kategori / asal'],
    ['jumlah', 'Jumlah orang'], ['meja', 'Meja / sesi'], ['jam', 'Jam datang'], ['id', 'ID tamu']
  ];
  var DEF = { preset: '60x40', w: 60, h: 40, margin: 2, scale: 100, copies: 1, offsetX: 0, offsetY: 0,
    f: { acara: true, urut: true, nama: true, kat: true, jumlah: true, meja: true, jam: true, id: false } };
  var KEY = 'gb_label';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clamp(v, a, b) { v = parseFloat(v); if (isNaN(v)) v = a; return Math.min(b, Math.max(a, v)); }

  function load() {
    var o = JSON.parse(JSON.stringify(DEF));
    try { var s = JSON.parse(lsGet(KEY) || 'null'); if (s) { for (var k in s) if (k !== 'f') o[k] = s[k]; if (s.f) for (var f in s.f) o.f[f] = s.f[f]; } } catch (e) {}
    o.w = clamp(o.w, 20, 150); o.h = clamp(o.h, 15, 200); o.margin = clamp(o.margin, 0, 10); o.scale = clamp(o.scale, 60, 160); o.copies = Math.round(clamp(o.copies, 1, 5));
    o.offsetX = clamp(o.offsetX, -10, 10); o.offsetY = clamp(o.offsetY, -10, 10);
    return o;
  }
  function save(o) { lsSet(KEY, JSON.stringify(o)); }

  function info() {
    var a = (lsGet('gb_acara') || '').replace(/^pernikahan\s+/i, '');
    return { acara: a || 'Buku Tamu', tanggal: lsGet('gb_tgl') || '' };
  }
  function jam(w) { return w ? String(w).slice(11, 16) : ''; }
  function pad(n) { n = parseInt(n, 10) || 0; return n < 10 ? '00' + n : n < 100 ? '0' + n : String(n); }

  /* ---------- isi label (satuan mm, hitam pekat untuk printer thermal) ---------- */
  function labelHTML(g, o, inf, jumlahOverride) {
    o = o || load(); inf = inf || info();
    var W = o.w, H = o.h, m = o.margin, k = o.scale / 100;
    var innerW = W - 2 * m, innerH = H - 2 * m, base = Math.min(innerH, innerW * 0.75);
    var small = Math.max(1.9, base * 0.085) * k;
    var nama = String(g.nama || '');
    var nameMax = base * 0.2 * k, len = Math.max(nama.length, 6);
    var nameFs = Math.max(2.2 * k, Math.min(nameMax, (innerW * 1.75) / (0.66 * len) * k));
    var jml = jumlahOverride != null && jumlahOverride !== '' ? jumlahOverride : (g.jumlahHadir || g.jumlahUndangan || '');
    var sub = [o.f.kat ? g.kategori : '', o.f.kat ? g.asal : ''].filter(Boolean).join(' · ');
    var top = (o.f.acara ? '<span class="gbl-ac">' + esc(inf.acara) + '</span>' : '<span></span>') +
              (o.f.urut && g.urut ? '<span class="gbl-no">No. ' + pad(g.urut) + '</span>' : '');
    var bot = [o.f.jumlah && jml ? '<b>' + esc(jml) + ' orang</b>' : '', o.f.meja && g.meja ? '<b>' + esc(g.meja) + '</b>' : '',
               o.f.jam && g.waktuDatang ? '<span>' + esc(jam(g.waktuDatang)) + '</span>' : '', o.f.id && g.id ? '<span>' + esc(g.id) + '</span>' : ''].filter(Boolean);
    return '<div class="gbl" style="width:' + W + 'mm;height:' + (H - 0.4) + 'mm;padding:' + m + 'mm;font-size:' + small.toFixed(2) + 'mm;' +
        'transform:translate(' + o.offsetX + 'mm,' + o.offsetY + 'mm)">' +
      ((o.f.acara || (o.f.urut && g.urut)) ? '<div class="gbl-top">' + top + '</div>' : '') +
      '<div class="gbl-mid">' +
        (o.f.nama ? '<div class="gbl-name" style="font-size:' + nameFs.toFixed(2) + 'mm">' + esc(nama) + '</div>' : '') +
        (sub ? '<div class="gbl-sub">' + esc(sub) + '</div>' : '') +
      '</div>' +
      (bot.length ? '<div class="gbl-bot">' + bot.join('<i>•</i>') + '</div>' : '') +
    '</div>';
  }

  var CSS = '.gbl{box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;background:#fff;color:#000;' +
    'font-family:Arial,"Helvetica Neue",Helvetica,sans-serif;line-height:1.15;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.gbl-top{display:flex;justify-content:space-between;align-items:center;gap:1mm;border-bottom:.3mm solid #000;padding-bottom:.6mm}' +
    '.gbl-ac{font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.gbl-no{background:#000;color:#fff;font-weight:700;padding:.2mm 1mm;border-radius:.6mm;white-space:nowrap}' +
    '.gbl-mid{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:.6mm 0}' +
    '.gbl-name{font-weight:800;line-height:1.08;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}' +
    '.gbl-sub{margin-top:.5mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.gbl-bot{display:flex;flex-wrap:wrap;align-items:center;gap:.4mm 1.2mm;border-top:.3mm solid #000;padding-top:.6mm}' +
    '.gbl-bot i{font-style:normal}' +
    '#gbl-area{display:none}' +
    '@media print{html,body{margin:0!important;padding:0!important;background:#fff!important;width:auto!important;min-height:0!important}' +
    'body>*:not(#gbl-area){display:none!important}#gbl-area{display:block!important}#gbl-area .gbl+.gbl{break-before:page;page-break-before:always}}';

  function ensureStyle() {
    if (!document.getElementById('gbl-css')) { var s = document.createElement('style'); s.id = 'gbl-css'; s.textContent = CSS; document.head.appendChild(s); }
    var area = document.getElementById('gbl-area');
    if (!area) { area = document.createElement('div'); area.id = 'gbl-area'; document.body.appendChild(area); }
    var pg = document.getElementById('gbl-page'); if (!pg) { pg = document.createElement('style'); pg.id = 'gbl-page'; document.head.appendChild(pg); }
    return { area: area, page: pg };
  }

  /* ---------- antrean cetak (satu per satu) ---------- */
  var queue = [], printing = false, listeners = [];
  function onPrinted(fn) { listeners.push(fn); }
  function print(items) {   // items: [{guest, jumlah}]
    items.forEach(function (it) { queue.push(it); });
    if (!printing) next();
  }
  function next() {
    if (!queue.length) { printing = false; return; }
    printing = true;
    var batch = queue.splice(0, queue.length);   // cetak semua yang menunggu dalam satu kali print
    var o = load(), inf = info(), el = ensureStyle(), html = '';
    batch.forEach(function (it) { for (var c = 0; c < o.copies; c++) html += labelHTML(it.guest, o, inf, it.jumlah); });
    el.page.textContent = '@page{size:' + o.w + 'mm ' + o.h + 'mm;margin:0}';
    el.area.innerHTML = html;
    setTimeout(function () {
      var ok = true;
      try { window.print(); } catch (e) { ok = false; }
      setTimeout(function () {
        el.area.innerHTML = '';
        listeners.forEach(function (fn) { try { fn(batch, ok); } catch (e) {} });
        next();
      }, 700);
    }, 120);
  }

  /* ---------- Stasiun Cetak: pantau check-in dari semua perangkat ---------- */
  var ST = { on: false, timer: null, api: null, cursorKey: 'gb_print_cursor', busy: false, onStatus: null, onPending: null, wake: null };
  function status(msg, kind) { if (ST.onStatus) ST.onStatus(msg, kind || 'ok'); }
  function stationStart(apiFn, opts) {
    opts = opts || {};
    ST.api = apiFn; ST.on = true; ST.onStatus = opts.onStatus || ST.onStatus; ST.onPending = opts.onPending || ST.onPending;
    lsSet('gb_station', '1');
    requestWake();
    var saved = parseInt(lsGet(ST.cursorKey), 10);
    status('Menghubungkan…', 'wait');
    ST.api('queue', { after: '' }).then(function (r) {
      if (!ST.on) return;
      var last = r.last;
      if (saved && saved < last && ST.onPending) {
        // ada check-in yang terjadi saat stasiun mati → tanyakan
        ST.api('queue', { after: saved }).then(function (q) {
          var items = q.items || [];
          if (items.length) ST.onPending(items, function (printThem) {
            if (printThem) print(items.map(function (it) { return { guest: it.guest, jumlah: it.jumlah }; }));
            lsSet(ST.cursorKey, last); loop();
          }); else { lsSet(ST.cursorKey, last); loop(); }
        }).catch(function () { lsSet(ST.cursorKey, last); loop(); });
      } else { lsSet(ST.cursorKey, last); loop(); }
    }).catch(function (e) { status('Gagal terhubung: ' + e.message + ' — mencoba lagi…', 'err'); ST.timer = setTimeout(function () { if (ST.on) stationStart(apiFn, opts); }, 5000); });
  }
  function loop() {
    clearTimeout(ST.timer);
    if (!ST.on) return;
    status('Aktif — label tercetak otomatis', 'ok');
    ST.timer = setTimeout(tick, 2500);
  }
  function tick() {
    if (!ST.on || ST.busy) return loop();
    ST.busy = true;
    var cur = lsGet(ST.cursorKey) || '';
    ST.api('queue', { after: cur }).then(function (r) {
      if (r.reset) { lsSet(ST.cursorKey, r.last); return; }
      if (r.items && r.items.length) print(r.items.map(function (it) { return { guest: it.guest, jumlah: it.jumlah }; }));
      lsSet(ST.cursorKey, r.last);
    }).catch(function (e) {
      if (/PIN/.test(e.message)) { stationStop(); status('PIN salah / diganti — stasiun berhenti', 'err'); return; }
      status('Koneksi terputus, mencoba lagi…', 'err');
    }).then(function () { ST.busy = false; if (ST.on) ST.timer = setTimeout(tick, document.hidden ? 4000 : 2500); });
  }
  function stationStop() { ST.on = false; clearTimeout(ST.timer); lsSet('gb_station', '0'); releaseWake(); status('Nonaktif', 'off'); }
  function requestWake() { try { if (navigator.wakeLock && !ST.wake) navigator.wakeLock.request('screen').then(function (w) { ST.wake = w; w.addEventListener('release', function () { ST.wake = null; }); }).catch(function () {}); } catch (e) {} }
  function releaseWake() { try { if (ST.wake) ST.wake.release(); } catch (e) {} ST.wake = null; }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && ST.on) requestWake(); });

  /* ---------- panel pengaturan (dipakai di kedua halaman) ---------- */
  var SAMPLE = { id: 'K7Q2M9PA', nama: 'Bpk. Budi Santoso & Keluarga', kategori: 'Keluarga Pria', asal: 'Bandung', meja: 'Meja 1', jumlahUndangan: 4, jumlahHadir: 4, waktuDatang: '2027-12-05 10:20:00', urut: 23 };
  function settingsPanel(container, opt) {
    opt = opt || {};
    var o = load();
    var presetOpts = PRESETS.map(function (p) { return '<option value="' + p.id + '"' + (p.id === o.preset ? ' selected' : '') + '>' + esc(p.n) + '</option>'; }).join('');
    container.innerHTML =
      '<div class="gbs">' +
        '<label class="gbs-l">Ukuran label</label>' +
        '<select class="gbs-in" data-k="preset">' + presetOpts + '</select>' +
        '<div class="gbs-row"><div><label class="gbs-l">Lebar (mm)</label><input class="gbs-in" type="number" step="1" min="20" max="150" data-k="w" value="' + o.w + '"></div>' +
        '<button type="button" class="gbs-swap" title="Tukar lebar & tinggi">⇄</button>' +
        '<div><label class="gbs-l">Tinggi (mm)</label><input class="gbs-in" type="number" step="1" min="15" max="200" data-k="h" value="' + o.h + '"></div></div>' +
        '<label class="gbs-l">Isi label</label><div class="gbs-chk">' +
          FIELDS.map(function (f) { return '<label><input type="checkbox" data-f="' + f[0] + '"' + (o.f[f[0]] ? ' checked' : '') + '> ' + f[1] + '</label>'; }).join('') + '</div>' +
        '<div class="gbs-row3">' +
          '<div><label class="gbs-l">Ukuran huruf</label><input class="gbs-in" type="range" min="60" max="160" step="5" data-k="scale" value="' + o.scale + '"><small data-o="scale">' + o.scale + '%</small></div>' +
          '<div><label class="gbs-l">Margin (mm)</label><input class="gbs-in" type="number" min="0" max="10" step="0.5" data-k="margin" value="' + o.margin + '"></div>' +
          '<div><label class="gbs-l">Salinan</label><input class="gbs-in" type="number" min="1" max="5" step="1" data-k="copies" value="' + o.copies + '"></div>' +
        '</div>' +
        '<details class="gbs-adv"><summary>Geser posisi cetak (kalau hasil cetak meleset)</summary><div class="gbs-row">' +
          '<div><label class="gbs-l">Geser kanan/kiri (mm)</label><input class="gbs-in" type="number" min="-10" max="10" step="0.5" data-k="offsetX" value="' + o.offsetX + '"></div>' +
          '<div><label class="gbs-l">Geser bawah/atas (mm)</label><input class="gbs-in" type="number" min="-10" max="10" step="0.5" data-k="offsetY" value="' + o.offsetY + '"></div></div></details>' +
        '<label class="gbs-l">Pratinjau</label><div class="gbs-pv"><div class="gbs-pvin"></div></div><div class="gbs-pvcap"></div>' +
        '<div class="gbs-btns"><button type="button" class="gbs-test">🖨️ Tes cetak</button><span class="gbs-saved"></span></div>' +
      '</div>';
    ensureStyle();
    var q = function (s) { return container.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(container.querySelectorAll(s)); };
    var savedT;
    function sync(changedKey) {
      if (changedKey === 'preset') {
        var p = PRESETS.filter(function (x) { return x.id === o.preset; })[0];
        if (p && p.w) { o.w = p.w; o.h = p.h; q('[data-k=w]').value = o.w; q('[data-k=h]').value = o.h; }
      }
      if (changedKey === 'w' || changedKey === 'h') {
        var match = PRESETS.filter(function (x) { return x.w === o.w && x.h === o.h; })[0];
        o.preset = match ? match.id : 'custom'; q('[data-k=preset]').value = o.preset;
      }
      q('[data-o=scale]').textContent = o.scale + '%';
      save(o); o = load(); preview();
      var sv = q('.gbs-saved'); sv.textContent = 'Tersimpan ✓ — dipakai untuk cetakan berikutnya'; clearTimeout(savedT); savedT = setTimeout(function () { sv.textContent = ''; }, 2500);
      if (opt.onChange) opt.onChange(o);
    }
    function preview() {
      var box = q('.gbs-pv'), inner = q('.gbs-pvin');
      inner.innerHTML = labelHTML(opt.sample || SAMPLE, o, info());
      var pxW = o.w * 3.7795, pxH = o.h * 3.7795, maxW = Math.max(160, box.clientWidth - 24), sc = Math.min(maxW / pxW, 210 / pxH, 3);
      inner.style.width = pxW + 'px'; inner.style.height = pxH + 'px'; inner.style.transform = 'scale(' + sc + ')';
      box.style.height = (pxH * sc + 24) + 'px';
      q('.gbs-pvcap').textContent = 'Ukuran asli ' + o.w + ' × ' + o.h + ' mm' + (o.copies > 1 ? ' • ' + o.copies + ' salinan per tamu' : '');
    }
    qa('[data-k]').forEach(function (el) {
      el.addEventListener(el.type === 'range' ? 'input' : 'change', function () {
        var k = el.dataset.k; o[k] = el.tagName === 'SELECT' ? el.value : parseFloat(el.value); sync(k);
      });
    });
    qa('[data-f]').forEach(function (el) { el.addEventListener('change', function () { o.f[el.dataset.f] = el.checked; sync('f'); }); });
    q('.gbs-swap').onclick = function () { var t = o.w; o.w = o.h; o.h = t; q('[data-k=w]').value = o.w; q('[data-k=h]').value = o.h; sync('w'); };
    q('.gbs-test').onclick = function () { print([{ guest: opt.sample || SAMPLE }]); };
    setTimeout(preview, 30);
    window.addEventListener('resize', preview);
    return { refresh: preview };
  }
  var PANEL_CSS = '.gbs{font-size:14px}.gbs-l{display:block;font-size:12px;font-weight:700;color:#6f6158;margin:12px 0 6px}' +
    '.gbs-in{width:100%;padding:10px 12px;font-size:15px;border:1.5px solid #ece3d9;border-radius:12px;background:#fcfaf7;color:#2f2520;font-family:inherit;box-sizing:border-box}' +
    '.gbs-in[type=range]{padding:0;border:0;background:none;accent-color:#b8875c}.gbs small{color:#6f6158;font-size:12px}' +
    '.gbs-row{display:flex;gap:8px;align-items:flex-end}.gbs-row>div{flex:1}.gbs-row3{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}' +
    '.gbs-swap{height:42px;width:42px;flex:none;border:1.5px solid #ece3d9;border-radius:12px;background:#fff;font-size:18px;cursor:pointer}' +
    '.gbs-chk{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:13px}.gbs-chk label{display:flex;gap:6px;align-items:center;cursor:pointer}' +
    '.gbs-chk input{width:17px;height:17px;accent-color:#b8875c}' +
    '.gbs-adv{margin-top:10px;font-size:13px;color:#6f6158}.gbs-adv summary{cursor:pointer;font-weight:600}' +
    '.gbs-pv{position:relative;background:repeating-linear-gradient(45deg,#f4ede4,#f4ede4 8px,#efe6db 8px,#efe6db 16px);border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center}' +
    '.gbs-pvin{transform-origin:center;box-shadow:0 4px 14px rgba(0,0,0,.18);flex:none}.gbs-pvin .gbl{transform:none!important}' +
    '.gbs-pvcap{font-size:12px;color:#a39388;text-align:center;margin-top:6px}' +
    '.gbs-btns{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}' +
    '.gbs-test{border:0;border-radius:12px;padding:11px 16px;font-weight:700;font-size:14px;background:#2f2520;color:#fff;cursor:pointer;font-family:inherit}' +
    '.gbs-saved{font-size:12px;color:#4f7a5f;font-weight:600}';
  (function () { var s = document.createElement('style'); s.textContent = PANEL_CSS; document.head.appendChild(s); })();

  window.GBLabel = {
    load: load, save: save, html: labelHTML, print: print, onPrinted: onPrinted, settingsPanel: settingsPanel,
    station: { start: stationStart, stop: stopWrap, isOn: function () { return ST.on; }, wanted: function () { return lsGet('gb_station') === '1'; } },
    SAMPLE: SAMPLE
  };
  function stopWrap() { stationStop(); }
})();
