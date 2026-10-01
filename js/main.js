(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var CONFIG = window.CONFIG || {};
  var FILM = CONFIG.FILM_TITLE || "(500) Days of Summer";
  var TRAILER_ID = CONFIG.TRAILER_ID || "PsD0NpFSADM";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var noCount = 0;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ------------------------------------------------------------
     Soft glow that follows the pointer
  ------------------------------------------------------------ */
  window.addEventListener("pointermove", function (e) {
    var s = document.documentElement.style;
    s.setProperty("--x", e.clientX + "px");
    s.setProperty("--y", e.clientY + "px");
  }, { passive: true });

  /* ------------------------------------------------------------
     Ambient layer: drifting petals, and hearts that rise on every tap
  ------------------------------------------------------------ */
  var fx = $("#fx"), fctx = fx.getContext("2d");
  var fw = 0, fh = 0, petals = [], hearts = [], fxLast = 0, scratchDone = false;
  var diamonds = [], diamondOn = false, diaLast = 0, diaReady = false, dia = new Image();
  var pictureArea = $("#s-ask");
  var portraits = $("#portraits"), pctx = portraits.getContext("2d");
  dia.onload = function () { diaReady = true; };
  dia.src = "assets/prince-diamond.png";

  function sizeFx() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    fw = window.innerWidth; fh = window.innerHeight;
    fx.width = fw * r; fx.height = fh * r;
    portraits.width = fw * r; portraits.height = fh * r;
    fctx.setTransform(r, 0, 0, r, 0, 0);
    pctx.setTransform(r, 0, 0, r, 0, 0);
  }
  function makePetal(initial) {
    return {
      x: Math.random() * fw, y: initial ? Math.random() * fh : -20,
      s: 6 + Math.random() * 7, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
      vy: 0.25 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.2,
      w: Math.random() * 6, a: 0.12 + Math.random() * 0.16
    };
  }
  sizeFx();
  window.addEventListener("resize", sizeFx);
  if (!reduce) { for (var pi = 0; pi < 10; pi++) petals.push(makePetal(true)); }

  function pictureLanes() {
    var area = pictureArea.getBoundingClientRect();
    // On phones, include the card's empty side padding, up to the content edge.
    // The eight-pixel gap and the canvas clip keep pictures away from the content.
    if (fw <= 640) {
      var content = $("#trailer").getBoundingClientRect();
      return [
        { left: 6, width: Math.max(0, content.left - 14) },
        { left: content.right + 8, width: Math.max(0, fw - content.right - 14) }
      ];
    }
    // Larger screens have enough space outside the card and its outer outline.
    return [
      { left: 6, width: Math.max(0, area.left - 16) },
      { left: area.right + 10, width: Math.max(0, fw - area.right - 16) }
    ];
  }

  function makeDiamond(lanes) {
    var available = [];
    lanes.forEach(function (lane, index) { if (lane.width >= 20) available.push(index); });
    if (!available.length) return null;
    var side = available[Math.floor(Math.random() * available.length)], lane = lanes[side];
    var maxW = Math.min(fw <= 640 ? 28 : 46, lane.width - 4), minW = Math.min(28, maxW);
    var w = minW + Math.random() * (maxW - minW);
    return {
      side: side,
      x: lane.left + w / 2 + Math.random() * Math.max(0, lane.width - w),
      y: -w / 2,
      w: w, h: w * (dia.naturalHeight / dia.naturalWidth || 0.76),
      vy: 0.9 + Math.random() * 1.1, ph: Math.random() * 6.28, sw: 0.4 + Math.random() * 0.6,
      r: (Math.random() - 0.5) * 0.4, vr: (Math.random() - 0.5) * 0.012
    };
  }

  function fxLoop(t) {
    var dt = Math.min((t - fxLast) / 16.67 || 1, 3);
    fxLast = t;
    fctx.clearRect(0, 0, fw, fh);
    pctx.clearRect(0, 0, fw, fh);
    fctx.save();
    // Keep all decorations clear of the video while it is playing.
    var video = $("#trailer.playing");
    if (video) {
      var videoRect = video.getBoundingClientRect();
      fctx.beginPath();
      fctx.rect(0, 0, fw, fh);
      fctx.rect(videoRect.left, videoRect.top, videoRect.width, videoRect.height);
      fctx.clip("evenodd");
    }

    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.w += 0.01 * dt;
      p.x += (p.vx + Math.sin(p.w) * 0.3) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y > fh + 20) petals[i] = makePetal(false);
      fctx.save();
      fctx.translate(p.x, p.y); fctx.rotate(p.r);
      fctx.fillStyle = "rgba(231,168,184," + p.a + ")";
      fctx.beginPath(); fctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.2832); fctx.fill();
      fctx.restore();
    }

    var lanes = pictureLanes();
    if (diamondOn && diaReady && !reduce) {
      if (t - diaLast > 650 && diamonds.length < 16) {
        diaLast = t;
        var nextPicture = makeDiamond(lanes);
        if (nextPicture) diamonds.push(nextPicture);
      }
    }
    pctx.save();
    pctx.beginPath();
    lanes.forEach(function (lane) { pctx.rect(lane.left, 0, lane.width, fh); });
    pctx.clip();
    for (var k = diamonds.length - 1; k >= 0; k--) {
      var d = diamonds[k];
      var lane = lanes[d.side];
      if (!diamondOn || lane.width < d.w || (fw <= 640 && d.w > 28)) { diamonds.splice(k, 1); continue; }
      d.ph += 0.02 * dt;
      d.x += Math.sin(d.ph) * d.sw * dt;
      d.x = Math.max(lane.left + d.w / 2, Math.min(lane.left + lane.width - d.w / 2, d.x));
      d.y += d.vy * dt;
      d.r += d.vr * dt;
      if (d.y > fh + d.w / 2) { diamonds.splice(k, 1); continue; }
      pctx.save();
      pctx.translate(d.x, d.y); pctx.rotate(d.r);
      pctx.globalAlpha = 1;
      // round picture: clip to a circle, draw the centre square of the image, then a thin ring
      var rr = d.w / 2, nh = dia.naturalHeight, nw = dia.naturalWidth;
      pctx.save();
      pctx.beginPath(); pctx.arc(0, 0, rr, 0, 6.2832); pctx.clip();
      pctx.drawImage(dia, (nw - nh) / 2, 0, nh, nh, -rr, -rr, d.w, d.w);
      pctx.restore();
      pctx.beginPath(); pctx.arc(0, 0, rr, 0, 6.2832);
      pctx.lineWidth = 1.5; pctx.strokeStyle = "rgba(255,255,255,0.85)"; pctx.stroke();
      pctx.restore();
    }
    pctx.restore();

    for (var j = hearts.length - 1; j >= 0; j--) {
      var h = hearts[j];
      h.x += h.vx * dt; h.y += h.vy * dt; h.vy *= 0.992; h.life -= 0.013 * dt;
      if (h.life <= 0) { hearts.splice(j, 1); continue; }
      fctx.globalAlpha = Math.min(1, h.life * 1.4);
      fctx.fillStyle = h.c;
      fctx.font = h.s + "px Georgia, serif";
      fctx.textAlign = "center"; fctx.textBaseline = "middle";
      fctx.fillText("\u2665\uFE0E", h.x, h.y);
      fctx.globalAlpha = 1;
    }
    fctx.restore();
    requestAnimationFrame(fxLoop);
  }
  requestAnimationFrame(fxLoop);

  document.addEventListener("pointerdown", function (e) {
    if (reduce || !scratchDone || hearts.length > 70) return;
    for (var i = 0; i < 6; i++) {
      hearts.push({
        x: e.clientX + (Math.random() - 0.5) * 24, y: e.clientY,
        vx: (Math.random() - 0.5) * 1.6, vy: -(1.6 + Math.random() * 2),
        s: 12 + Math.random() * 14, life: 1,
        c: Math.random() > 0.35 ? "#e7a8b8" : "#d9b779"
      });
    }
  });

  /* ------------------------------------------------------------
     1. Scratch card
  ------------------------------------------------------------ */
  var sc = $("#scratch"), sctx = sc.getContext("2d");
  var spk = $("#spark"), spctx = spk.getContext("2d");
  var W = 0, H = 0, dpr = 1, started = false, drawing = false, last = null, lastCheck = 0;
  var sparks = [], sparkRaf = 0;

  function drawFoil() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    sc.width = Math.round(W * dpr); sc.height = Math.round(H * dpr);
    spk.width = Math.round(W * dpr); spk.height = Math.round(H * dpr);
    spctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.globalCompositeOperation = "source-over";

    var g = sctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#ffb3d6");
    g.addColorStop(0.3, "#e2c9ff");
    g.addColorStop(0.55, "#b8dcff");
    g.addColorStop(0.8, "#ffc8e4");
    g.addColorStop(1, "#c9b6ff");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, W, H);

    // soft shimmer stripes
    sctx.globalAlpha = 0.22;
    sctx.strokeStyle = "#ffffff";
    sctx.lineWidth = 10;
    for (var i = -H; i < W; i += 34) {
      sctx.beginPath(); sctx.moveTo(i, 0); sctx.lineTo(i + H, H); sctx.stroke();
    }
    sctx.globalAlpha = 1;

    var seed = 11;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    function sparkle(x, y, r, color) {
      sctx.fillStyle = color;
      sctx.beginPath();
      sctx.moveTo(x, y - r);
      sctx.quadraticCurveTo(x, y, x + r, y);
      sctx.quadraticCurveTo(x, y, x, y + r);
      sctx.quadraticCurveTo(x, y, x - r, y);
      sctx.quadraticCurveTo(x, y, x, y - r);
      sctx.fill();
    }
    function moon(x, y, r, color) {
      sctx.fillStyle = color;
      sctx.beginPath();
      sctx.moveTo(x, y - r);
      sctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, true);
      sctx.quadraticCurveTo(x - r * 0.85, y, x, y - r);
      sctx.fill();
    }

    var cols = ["#ffffff", "#fff3a8", "#ff9fcb", "#ffffff"];
    for (var k = 0; k < 46; k++) {
      sparkle(rnd() * W, rnd() * H, 5 + rnd() * 11, cols[k % cols.length]);
    }
    for (var m = 0; m < 5; m++) {
      moon(rnd() * W, rnd() * H, 12 + rnd() * 10, "#fff3a8");
    }

    // white double frame
    sctx.strokeStyle = "rgba(255,255,255,0.9)";
    sctx.lineWidth = 2;
    sctx.strokeRect(16, 16, W - 32, H - 32);
    sctx.lineWidth = 1;
    sctx.strokeRect(24, 24, W - 48, H - 48);

    // the big crescent moon above the text
    var fs = Math.min(54, W * 0.12);
    moon(W / 2 + fs * 0.25, H / 2 - fs * 1.85, fs * 0.75, "#ffe27a");

    sctx.textAlign = "center"; sctx.textBaseline = "middle";
    sctx.font = "italic 600 " + fs + "px 'Cormorant Garamond', Georgia, serif";
    sctx.lineJoin = "round";
    sctx.lineWidth = 7;
    sctx.strokeStyle = "rgba(255,255,255,0.95)";
    sctx.fillStyle = "#8a2f8f";
    sctx.strokeText("Scratch me", W / 2, H / 2 - fs * 0.45);
    sctx.fillText("Scratch me", W / 2, H / 2 - fs * 0.45);
    sctx.strokeText("for a surprise", W / 2, H / 2 + fs * 0.65);
    sctx.fillText("for a surprise", W / 2, H / 2 + fs * 0.65);
  }
  drawFoil();

  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
      if (!started) drawFoil();
    });
  }
  window.addEventListener("resize", function () {
    if (!scratchDone && !started && window.innerWidth !== W) drawFoil();
  });

  function scratchLine(a, b) {
    sctx.globalCompositeOperation = "destination-out";
    sctx.lineCap = "round"; sctx.lineJoin = "round"; sctx.lineWidth = 64;
    sctx.beginPath(); sctx.moveTo(a.x, a.y); sctx.lineTo(b.x + 0.01, b.y); sctx.stroke();
    sctx.globalCompositeOperation = "source-over";
  }
  function addSparks(x, y) {
    if (reduce) return;
    for (var i = 0; i < 2; i++) {
      sparks.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 1.4, vy: -Math.random() * 1.2, life: 1, r: 1 + Math.random() * 2,
        c: Math.random() > 0.5 ? "#ffffff" : "#ff9fcb" });
    }
    if (!sparkRaf) sparkRaf = requestAnimationFrame(sparkLoop);
  }
  function sparkLoop() {
    spctx.clearRect(0, 0, W, H);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.life -= 0.035;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      spctx.globalAlpha = s.life;
      spctx.fillStyle = s.c;
      spctx.beginPath(); spctx.arc(s.x, s.y, s.r, 0, 6.2832); spctx.fill();
    }
    spctx.globalAlpha = 1;
    if (sparks.length) sparkRaf = requestAnimationFrame(sparkLoop);
    else { sparkRaf = 0; spctx.clearRect(0, 0, W, H); }
  }

  var tmp = document.createElement("canvas"), tctx = tmp.getContext("2d");
  function clearedRatio() {
    var tw = 40, th = Math.max(1, Math.round(40 * H / W));
    tmp.width = tw; tmp.height = th;
    tctx.clearRect(0, 0, tw, th);
    tctx.drawImage(sc, 0, 0, tw, th);
    var d = tctx.getImageData(0, 0, tw, th).data, sum = 0;
    for (var i = 3; i < d.length; i += 4) sum += d[i];
    return 1 - sum / (tw * th * 255);
  }
  function check() {
    if (scratchDone) return;
    if (clearedRatio() > 0.25) reveal();
  }
  function reveal() {
    scratchDone = true;
    sc.classList.add("gone");
    document.documentElement.classList.remove("lock");
    setTimeout(function () { sc.remove(); }, 900);
  }

  sc.addEventListener("pointerdown", function (e) {
    drawing = true; last = { x: e.clientX, y: e.clientY };
    try { sc.setPointerCapture(e.pointerId); } catch (err) {}
    scratchLine(last, last);
    if (!started) { started = true; startIntro(); }
    e.preventDefault();
  });
  sc.addEventListener("pointermove", function (e) {
    if (!drawing) return;
    var p = { x: e.clientX, y: e.clientY };
    scratchLine(last, p); last = p;
    addSparks(p.x, p.y);
    var now = Date.now();
    if (now - lastCheck > 250) { lastCheck = now; check(); }
  });
  function endScratch() { if (!drawing) return; drawing = false; check(); }
  sc.addEventListener("pointerup", endScratch);
  sc.addEventListener("pointercancel", endScratch);

  /* ------------------------------------------------------------
     2. Intro: typewriter title, then the rest fades in
  ------------------------------------------------------------ */
  function startIntro() {
    diamondOn = true;
    var title = $("#title");
    var done = title.querySelector(".t-done"), rest = title.querySelector(".t-rest");
    var full = rest.textContent, i = 0;

    function showRest() {
      var items = document.querySelectorAll("#s-ask .rv");
      Array.prototype.forEach.call(items, function (el, k) {
        el.style.transitionDelay = (k * 0.22) + "s";
        el.classList.add("in");
      });
    }
    if (reduce) { done.textContent = full; rest.textContent = ""; showRest(); return; }

    done.classList.add("typing");
    (function tick() {
      i++;
      done.textContent = full.slice(0, i);
      rest.textContent = full.slice(i);
      if (i < full.length) { setTimeout(tick, 36); }
      else { done.classList.remove("typing"); showRest(); }
    })();
  }

  /* ------------------------------------------------------------
     3. Trailer: click to play
  ------------------------------------------------------------ */
  var trailer = $("#trailer");
  $("#poster").src = "https://img.youtube.com/vi/" + TRAILER_ID + "/hqdefault.jpg";

  function playTrailer() {
    if (trailer.classList.contains("playing")) return;
    // Local files have no HTTP referrer. Keep the visitor here and explain how to open the site.
    if (location.protocol === "file:") {
      $("#trailerHelp").hidden = false;
      return;
    }
    var f = document.createElement("iframe");
    f.src = "https://www.youtube.com/embed/" + encodeURIComponent(TRAILER_ID) +
      "?autoplay=1&rel=0&playsinline=1&origin=" + encodeURIComponent(location.origin);
    f.title = FILM + " trailer";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share";
    f.setAttribute("allowfullscreen", "");
    trailer.classList.add("playing");
    trailer.removeAttribute("role");
    trailer.removeAttribute("tabindex");
    trailer.appendChild(f);
  }
  trailer.addEventListener("click", playTrailer);
  trailer.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playTrailer(); }
  });

  /* ------------------------------------------------------------
     4. Yes grows, No runs away
  ------------------------------------------------------------ */
  var yes = $("#yes"), no = $("#no"), noSlot = $("#noSlot"), caption = $("#caption");
  var lastDodge = 0, pointer = { x: -999, y: -999 };
  var lines = [
    "Nice try.",
    "Are you sure?",
    "Come on, say yes!",
    "That button doesn't want to be pressed.",
    "It keeps running away from you.",
    "You know you want to say yes.",
    "Yes is getting bigger and bigger."
  ];
  var yesLabels = ["Yes", "Yes, of course", "Yes, a thousand times"];

  function overlap(a, b, pad) {
    return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
  }
  function dodge() {
    noCount++;
    lastDodge = Date.now();
    if (!no.classList.contains("flee")) {
      var r0 = no.getBoundingClientRect();
      noSlot.style.width = r0.width + "px"; noSlot.style.height = r0.height + "px";
      no.style.left = r0.left + "px"; no.style.top = r0.top + "px";
      no.classList.add("flee");
      void no.offsetWidth;
    }
    var w = no.offsetWidth, h = no.offsetHeight, m = 10;
    var yr = yes.getBoundingClientRect();
    var best = null;
    for (var i = 0; i < 60; i++) {
      var x = m + Math.random() * Math.max(1, window.innerWidth - w - 2 * m);
      var y = m + Math.random() * Math.max(1, window.innerHeight - h - 2 * m);
      var box = { left: x, top: y, right: x + w, bottom: y + h };
      var dist = Math.hypot(x + w / 2 - pointer.x, y + h / 2 - pointer.y);
      if (dist > 150 && !overlap(box, yr, 14)) { best = { x: x, y: y }; break; }
      if (!best || dist > best.d) best = { x: x, y: y, d: dist };
    }
    no.style.left = best.x + "px"; no.style.top = best.y + "px";

    var maxS = Math.min(8, (window.innerWidth * 0.94) / yes.offsetWidth);
    yes.style.setProperty("--s", Math.min(1 + noCount * 0.38, maxS).toFixed(2));
    yes.textContent = yesLabels[Math.min(Math.floor(noCount / 4), yesLabels.length - 1)];
    caption.textContent = lines[(noCount - 1) % lines.length];
  }
  no.addEventListener("pointerenter", dodge);
  no.addEventListener("pointerdown", function (e) { e.preventDefault(); dodge(); });
  no.addEventListener("focus", dodge);
  no.addEventListener("click", function (e) { e.preventDefault(); dodge(); });
  document.addEventListener("pointermove", function (e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!no.classList.contains("flee") || Date.now() - lastDodge < 220) return;
    var r = no.getBoundingClientRect();
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 95) dodge();
  });

  function go(id) {
    Array.prototype.forEach.call(document.querySelectorAll(".scene"), function (s) {
      s.hidden = s.id !== id;
      if (s.id === id) { s.classList.remove("enter"); void s.offsetWidth; s.classList.add("enter"); }
    });
    no.classList.remove("flee");
    diamondOn = (id === "s-ask");
    if (!diamondOn) diamonds.length = 0;
    window.scrollTo(0, 0);
  }
  yes.addEventListener("click", function () { go("s-time"); });

  /* ------------------------------------------------------------
     5. Calendar and time (all in English, no native pickers)
  ------------------------------------------------------------ */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var state = { date: null, hour: null, min: 0 };
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var view = new Date(firstOfThisMonth);

  var grid = $("#grid"), calTitle = $("#calTitle"), prev = $("#prev"), next = $("#next");
  var timesBox = $("#times"), hoursEl = $("#hours"), minsEl = $("#mins");
  var summary = $("#summary"), confirmBtn = $("#confirm");

  function fmtTime(h, m) { return (h % 12 || 12) + ":" + pad(m) + " " + (h >= 12 ? "PM" : "AM"); }
  function fmtDay(d) { return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }

  function renderCal() {
    calTitle.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
    prev.disabled = view <= firstOfThisMonth;
    next.disabled = view >= new Date(today.getFullYear(), today.getMonth() + 6, 1);
    grid.innerHTML = "";
    DOW.forEach(function (d) {
      var s = document.createElement("span"); s.className = "dow"; s.textContent = d; grid.appendChild(s);
    });
    var lead = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    for (var i = 0; i < lead; i++) grid.appendChild(document.createElement("span"));
    var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      var dt = new Date(view.getFullYear(), view.getMonth(), d);
      var b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.textContent = d;
      b.dataset.ts = String(+dt);
      b.setAttribute("aria-label", fmtDay(dt));
      b.disabled = dt < today;
      if (+dt === +today) b.classList.add("today");
      if (state.date && +state.date === +dt) b.classList.add("sel");
      grid.appendChild(b);
    }
  }
  prev.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  next.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".day");
    if (!b || b.disabled) return;
    state.date = new Date(Number(b.dataset.ts));
    timesBox.hidden = false;
    renderCal(); refresh();
  });

  for (var h = 12; h <= 23; h++) {
    (function (hour) {
      var c = document.createElement("button");
      c.type = "button"; c.className = "chip"; c.textContent = (hour % 12 || 12) + " " + (hour >= 12 ? "PM" : "AM");
      c.dataset.v = String(hour); c.setAttribute("aria-pressed", "false");
      hoursEl.appendChild(c);
    })(h);
  }
  [0, 15, 30, 45].forEach(function (m) {
    var c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.textContent = ":" + pad(m);
    c.dataset.v = String(m); c.setAttribute("aria-pressed", "false");
    minsEl.appendChild(c);
  });
  hoursEl.addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c || c.disabled) return;
    state.hour = Number(c.dataset.v); refresh();
  });
  minsEl.addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c || c.disabled) return;
    state.min = Number(c.dataset.v); refresh();
  });

  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  tz = tz.replace(/_/g, " ");

  function refresh() {
    var now = new Date();
    var isToday = state.date && +state.date === +today;
    Array.prototype.forEach.call(hoursEl.children, function (c) {
      var v = Number(c.dataset.v);
      c.disabled = !!(isToday && v < now.getHours());
      c.setAttribute("aria-pressed", String(state.hour === v));
    });
    if (state.hour !== null && isToday && state.hour < now.getHours()) state.hour = null;
    Array.prototype.forEach.call(minsEl.children, function (c) {
      var v = Number(c.dataset.v);
      c.disabled = !!(isToday && state.hour === now.getHours() && v < now.getMinutes());
      c.setAttribute("aria-pressed", String(state.min === v));
    });
    var ok = !!(state.date && state.hour !== null);
    confirmBtn.disabled = !ok;
    summary.textContent = ok ? fmtDay(state.date).replace(/, (\d{4})$/, "") + ", at " + fmtTime(state.hour, state.min) : "";
  }
  renderCal(); refresh();

  /* ------------------------------------------------------------
     6. Confetti (fast, Sailor Moon style emoji)
  ------------------------------------------------------------ */
  var cv = $("#confetti"), cx = cv.getContext("2d");
  var cw = 0, ch = 0, parts = [], cRaf = 0, cLast = 0, spawnUntil = 0;
  var EMOJI = ["\uD83C\uDF19", "\u2B50", "\uD83D\uDC96", "\uD83C\uDF80", "\u2728", "\uD83C\uDF38", "\uD83D\uDD2E", "\uD83D\uDC51", "\uD83E\uDE84", "\uD83D\uDCAB", "\uD83C\uDF1F", "\uD83E\uDD8B", "\uD83D\uDC97", "\uD83D\uDC30"];
  function sizeC() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth; ch = window.innerHeight;
    cv.width = cw * r; cv.height = ch * r;
    cx.setTransform(r, 0, 0, r, 0, 0);
  }
  sizeC();
  window.addEventListener("resize", sizeC);
  function pick() { return EMOJI[Math.floor(Math.random() * EMOJI.length)]; }
  function burst(n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.2832, sp = 12 + Math.random() * 16;
      parts.push({ x: cw / 2, y: ch * 0.55, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 8, g: 0.75,
        e: pick(), s: 22 + Math.random() * 22, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4 });
    }
  }
  function rain(n) {
    for (var i = 0; i < n; i++) {
      parts.push({ x: Math.random() * cw, y: -30 - Math.random() * 60, vx: (Math.random() - 0.5) * 3, vy: 7 + Math.random() * 7, g: 0.12,
        e: pick(), s: 22 + Math.random() * 22, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3 });
    }
  }
  function cLoop(t) {
    var dt = Math.min((t - cLast) / 16.67 || 1, 3);
    cLast = t;
    cx.clearRect(0, 0, cw, ch);
    if (Date.now() < spawnUntil) rain(reduce ? 1 : 2);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g * dt; p.vx *= Math.pow(0.985, dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (!reduce) p.r += p.vr * dt;
      if (p.y > ch + 60) { parts.splice(i, 1); continue; }
      cx.save();
      cx.translate(p.x, p.y); cx.rotate(p.r);
      cx.font = p.s + "px sans-serif";
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(p.e, 0, 0);
      cx.restore();
    }
    if (parts.length || Date.now() < spawnUntil) cRaf = requestAnimationFrame(cLoop);
    else { cRaf = 0; cx.clearRect(0, 0, cw, ch); }
  }
  function party() {
    burst(reduce ? 20 : 90);
    spawnUntil = Date.now() + (reduce ? 1200 : 2200);
    if (!cRaf) { cLast = performance.now(); cRaf = requestAnimationFrame(cLoop); }
  }

  /* ------------------------------------------------------------
     7. Confirm: ticket, countdown, notification
  ------------------------------------------------------------ */
  var when = null, cdTimer = 0, dateInfo = null, notifying = false;
  var status = $("#status"), retryEmail = $("#retryEmail"), anotherDate = $("#anotherDate");
  var directEmail = $("#directEmail");

  function startCount() {
    clearInterval(cdTimer);
    var el = $("#count");
    function tick() {
      var ms = when - Date.now();
      if (ms <= 0) { el.textContent = "It is time."; clearInterval(cdTimer); return; }
      var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600),
        mm = Math.floor((s % 3600) / 60), ss = s % 60;
      el.textContent = (d ? d + (d === 1 ? " day, " : " days, ") : "") + hh + "h " + mm + "m " + ss + "s until our movie night";
    }
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  // _url identifies the same form during setup, retries and later visits.
  function emailFields(info) {
    return {
      _url: CONFIG.FORM_URL || location.href.split(/[?#]/)[0],
      _subject: "She said YES! " + info.day + " at " + info.time,
      _captcha: "false",
      _template: "table",
      message: info.message,
      date: info.day,
      time: info.time,
      time_zone: info.tz,
      film: FILM,
      confirmed_at: info.confirmedAt,
      no_button_presses: String(noCount)
    };
  }

  function prepareDirectEmail(info) {
    directEmail.action = "https://formsubmit.co/" + encodeURIComponent(CONFIG.NOTIFY_EMAIL || "");
    Array.prototype.forEach.call(directEmail.querySelectorAll("input"), function (input) { input.remove(); });
    var fields = emailFields(info);
    Object.keys(fields).forEach(function (name) {
      var input = document.createElement("input");
      input.type = "hidden"; input.name = name; input.value = fields[name];
      directEmail.appendChild(input);
    });
  }

  // FormData avoids the extra JSON CORS preflight. There is no per-person send limit.
  function sendEmail(info) {
    var to = CONFIG.NOTIFY_EMAIL;
    if (!to) return Promise.resolve({ ok: false, message: "The notification email is not configured." });
    var data = new FormData(), fields = emailFields(info);
    Object.keys(fields).forEach(function (name) { data.append(name, fields[name]); });
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 30000);
    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), {
      method: "POST",
      signal: controller.signal,
      headers: { "Accept": "application/json" },
      body: data
    }).then(function (r) {
      return r.json().then(function (j) {
        var message = typeof j.message === "string" ? j.message : typeof j.error === "string" ? j.error : "";
        return { ok: r.ok && (j.success === true || j.success === "true"),
          activation: /activat|confirm.*email|verify.*email/i.test(message),
          message: message || (r.ok ? "FormSubmit did not accept the submission." : "FormSubmit returned HTTP " + r.status + ".") };
      });
    }).catch(function (error) {
      return { ok: false, message: error.name === "AbortError" ? "FormSubmit took too long to respond."
        : "Could not reach FormSubmit. Check your connection or use the direct send button below." };
    }).then(function (result) {
      clearTimeout(timeout);
      return result;
    });
  }

  function notify() {
    if (!dateInfo || notifying) return;
    notifying = true;
    retryEmail.hidden = true;
    retryEmail.disabled = true;
    anotherDate.disabled = true;
    directEmail.hidden = true;
    status.textContent = "Sending the details\u2026";
    prepareDirectEmail(dateInfo);
    sendEmail(dateInfo).then(function (result) {
      notifying = false;
      retryEmail.disabled = false;
      anotherDate.disabled = false;
      retryEmail.hidden = false;
      if (result.activation) {
        status.textContent = "One-time setup: open the FormSubmit activation email sent to " + CONFIG.NOTIFY_EMAIL +
          ", check Spam too, and click Activate Form. Then send the details again.";
        retryEmail.textContent = "Send after activation";
        directEmail.hidden = false;
      } else if (result.ok) {
        status.textContent = "Your answer is already sending right to me, be ready for our date.";
        retryEmail.textContent = "Send details again";
      } else {
        status.textContent = "Your date is saved here, but the email was not submitted. " + result.message;
        retryEmail.textContent = "Try sending again";
        directEmail.hidden = false;
      }
    });
  }
  retryEmail.addEventListener("click", notify);
  anotherDate.addEventListener("click", function () {
    if (notifying) return;
    clearInterval(cdTimer);
    go("s-time");
    refresh();
  });

  confirmBtn.addEventListener("click", function () {
    if (confirmBtn.disabled || !state.date || state.hour === null) return;
    confirmBtn.disabled = true;
    when = new Date(state.date.getFullYear(), state.date.getMonth(), state.date.getDate(), state.hour, state.min);
    var dayTxt = fmtDay(state.date), timeTxt = fmtTime(state.hour, state.min);
    $("#tFilm").textContent = FILM;
    $("#tDay").textContent = dayTxt;
    $("#tTime").textContent = timeTxt;

    var message = "She said YES! Movie date on Discord: " + FILM + ". " + dayTxt + " at " + timeTxt +
      (tz ? " (" + tz + ")" : "") + "." +
      (noCount > 0 ? " She tried to press No " + noCount + (noCount === 1 ? " time." : " times.") : "");
    dateInfo = { day: dayTxt, time: timeTxt, tz: tz, message: message, confirmedAt: new Date().toISOString() };

    go("s-done");
    party();
    startCount();

    notify();
  });

})();
