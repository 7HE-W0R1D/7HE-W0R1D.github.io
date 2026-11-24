/* Tuning Life favicon: Conway's Life on a 7x7 board, read like a tuning dial.
   One generation every 10 seconds. A sweep advances one tick per generation and
   turns the cells it passes yellow, so the lit sector goes round every
   10 minutes. When the sweep finds nothing, or the world gets stuck, static cells
   appear inside the sweep, like noise on an empty station, so there is always some
   yellow. Drawn on a pixel grid (at 32px: 3px cells, 1px gaps) so it stays crisp
   in the tab bar; 7 cells don't centre on whole pixels, so the right/bottom margin
   is 1px wider than the left/top. The world is saved in localStorage, so it keeps
   going across pages and visits instead of restarting on every load. */
(function () {
  var N = 7, MS = 10000, KEY = "tuning-life-7b", SIZE = 64, SWEEP = 0.8;
  var mask = new Uint8Array(N * N), c = (N - 1) / 2;
  for (var y = 0; y < N; y++) for (var x = 0; x < N; x++)
    mask[y * N + x] = Math.hypot(x - c, y - c) <= c + 0.7 ? 1 : 0;   // only the 4 corner cells are dead

  function inSweep(i, theta) {
    var d = Math.atan2(i % N - c, c - ((i / N) | 0)) - theta;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < SWEEP;
  }

  function create() {
    var s = { cells: new Uint8Array(N * N), theta: Math.random() * Math.PI * 2, gen: 0, hist: [] };
    for (var i = 0; i < N * N; i++) s.cells[i] = mask[i] && Math.random() < 0.4 ? 1 : 0;
    return s;
  }

  function step(s) {
    var a = s.cells, b = new Uint8Array(N * N), pop = 0;
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var i = y * N + x; if (!mask[i]) continue;
      var n = 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        var X = x + dx, Y = y + dy;
        if (X >= 0 && Y >= 0 && X < N && Y < N) n += a[Y * N + X];
      }
      b[i] = (n === 3 || (n === 2 && a[i])) ? 1 : 0; pop += b[i];
    }
    s.theta = (s.theta + Math.PI / 30) % (Math.PI * 2);
    var sweep = [], lit = 0;
    for (var k = 0; k < N * N; k++) if (mask[k] && inSweep(k, s.theta)) { sweep.push(k); lit += b[k]; }
    var key = b.join(""), stuck = pop < 3 || s.hist.indexOf(key) !== -1;
    if (stuck || !lit) {                                   // static on the tuned station
      for (var m = stuck ? 5 : 2; m > 0; m--) b[sweep[(Math.random() * sweep.length) | 0]] = 1;
      key = b.join("");
    }
    s.hist.push(key); if (s.hist.length > 24) s.hist.shift();
    s.cells = b; s.gen++;
  }

  function draw(ctx, size, s, col) {
    var P = size * 4 / 32, M = size * 2 / 32, gap = size * 1 / 32, R = size * 0.22;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = col.disc; ctx.beginPath();                 // full-bleed rounded tile
    ctx.moveTo(R, 0); ctx.arcTo(size, 0, size, size, R); ctx.arcTo(size, size, 0, size, R);
    ctx.arcTo(0, size, 0, 0, R); ctx.arcTo(0, 0, size, 0, R); ctx.fill();
    for (var i = 0; i < N * N; i++) {
      if (!s.cells[i]) continue;
      ctx.fillStyle = inSweep(i, s.theta) ? col.lamp : col.cell;
      ctx.fillRect(M + (i % N) * P, M + ((i / N) | 0) * P, P - gap, P - gap);
    }
  }

  // --- persistence: pick up where the last page left off ---
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY));
      if (!o || typeof o.c !== "string" || o.c.length !== N * N) return null;
      var s = { cells: new Uint8Array(N * N), theta: +o.t || 0, gen: +o.g || 0, hist: [], at: +o.at || Date.now() };
      for (var i = 0; i < N * N; i++) s.cells[i] = o.c[i] === "1" && mask[i] ? 1 : 0;
      return s;
    } catch (e) { return null; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: s.cells.join(""), t: s.theta, g: s.gen, at: s.at })); } catch (e) {}
  }

  var s = load(), now = Date.now();
  if (s) {                                                // catch up on missed steps (max 60, i.e. 10 minutes)
    var missed = Math.min(60, Math.floor((now - s.at) / MS));
    for (var m = 0; m < missed; m++) step(s);
    s.at += missed * MS;
    if (now - s.at > MS) s.at = now;                      // long gap: don't owe more steps
  } else { s = create(); s.at = now; }

  // --- favicon loop ---
  // site palette: frost-deep disc, frost-sage cells (dim, so the lamp stands out), aurora-yellow lamp.
  // The mid-tone green reads on both light and dark tab bars, so one scheme serves both.
  function colors() { return { disc: "#3a8467", cell: "#86c4bf", lamp: "#f2cd7e" }; }
  var cv = document.createElement("canvas"); cv.width = cv.height = SIZE;
  var ctx = cv.getContext("2d");
  document.querySelectorAll("link[rel~='icon']").forEach(function (l) { l.remove(); });
  var link = document.createElement("link");
  link.rel = "icon"; link.type = "image/png"; document.head.appendChild(link);
  function paint() { draw(ctx, SIZE, s, colors()); link.href = cv.toDataURL("image/png"); }
  function tick() { step(s); s.at += MS; save(s); paint(); }

  save(s); paint();
  setTimeout(function () { tick(); setInterval(tick, MS); }, Math.max(0, s.at + MS - Date.now()));
})();
