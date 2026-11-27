(function () {
  "use strict";

  var canvas = document.getElementById("globe");
  var data = window.GLOBE_DATA;
  if (!canvas || !canvas.getContext || !data) return;
  var ctx = canvas.getContext("2d");
  var tip = document.querySelector(".globe-tip");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RAD = Math.PI / 180;

  var count = data.land.length / 3;
  var lat = new Float32Array(count);
  var lon = new Float32Array(count);
  var seen = new Uint8Array(count);
  for (var i = 0; i < count; i++) {
    lat[i] = data.land[i * 3] / 10 * RAD;
    lon[i] = data.land[i * 3 + 1] / 10 * RAD;
    seen[i] = data.land[i * 3 + 2];
  }
  var sinLat = lat.map(Math.sin);
  var cosLat = lat.map(Math.cos);

  var places = data.places.map(function (p) {
    return { name: p.name, note: p.note, kind: p.kind, lat: p.lat * RAD, lon: p.lon * RAD, phase: Math.random() * Math.PI * 2 };
  });

  places.sort(function (a, b) { return (a.kind === "home") - (b.kind === "home"); });

  var view = { lon: -55 * RAD, lat: 24 * RAD };
  var vel = { lon: 0, lat: 0 };
  var spin = reduce ? 0 : 0.00007;
  var dragging = false;
  var lastMove = 0;
  var last = { x: 0, y: 0, t: 0 };
  var hover = null;

  var W = 0;
  var H = 0;
  var R = 0;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    R = Math.min(W, H) * 0.44;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(sLat, cLat, lo, out) {
    var sv = Math.sin(view.lat);
    var cv = Math.cos(view.lat);
    var d = lo - view.lon;
    var cd = Math.cos(d);
    out[0] = W / 2 + R * cLat * Math.sin(d);
    out[1] = H / 2 - R * (cv * sLat - sv * cLat * cd);
    out[2] = sv * sLat + cv * cLat * cd;
    return out;
  }

  var q = [0, 0, 0];
  var projected = places.map(function () { return [0, 0, 0]; });

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2;
    var cy = H / 2;

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.lineWidth = 1;
    ctx.stroke();

    var base = Math.max(1.1, R / 170);
    for (var i = 0; i < count; i++) {
      project(sinLat[i], cosLat[i], lon[i], q);
      if (q[2] <= 0.02) continue;
      var z = q[2];
      var s = base * (0.55 + 0.6 * z);
      if (seen[i] === 1) {
        ctx.fillStyle = "rgba(124, 156, 255," + (0.35 + 0.65 * z).toFixed(3) + ")";
        s *= 1.15;
      } else if (seen[i] === 2) {
        ctx.fillStyle = "rgba(124, 156, 255," + (0.18 + 0.32 * z).toFixed(3) + ")";
        s *= 1.1;
      } else {
        ctx.fillStyle = "rgba(205, 209, 220," + (0.12 + 0.5 * z).toFixed(3) + ")";
      }
      ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s);
    }

    for (var k = 0; k < places.length; k++) {
      var p = places[k];
      var o = projected[k];
      project(Math.sin(p.lat), Math.cos(p.lat), p.lon, o);
      if (o[2] <= 0.05) continue;
      var on = p === hover;
      if (p.kind === "planned") {
        ctx.strokeStyle = on ? "#ffffff" : "rgba(255, 90, 78, 0.95)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(o[0], o[1], on ? 4.5 : 3.6, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      var rgb = p.kind === "home" ? "242, 193, 78" : "255, 90, 78";
      var pulse = reduce ? 0.5 : (Math.sin(now / 520 + p.phase) + 1) / 2;
      var rr = (p.kind === "home" ? 4 : 3) + pulse * (p.kind === "home" ? 9 : 7);
      ctx.fillStyle = "rgba(" + rgb + "," + (0.3 * (1 - pulse) * o[2]).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(o[0], o[1], rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = on ? "#ffffff" : "rgb(" + rgb + ")";
      ctx.beginPath();
      ctx.arc(o[0], o[1], on ? 4.2 : p.kind === "home" ? 3.6 : 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step(now) {
    var dt = Math.min(48, now - (step.prev || now));
    step.prev = now;
    if (!dragging) {
      view.lon += vel.lon * dt;
      view.lat += vel.lat * dt;
      vel.lon *= Math.pow(0.94, dt / 16);
      vel.lat *= Math.pow(0.94, dt / 16);
      if (now - lastMove > 2200 && Math.abs(vel.lon) < spin * 2) view.lon += spin * dt;
    }
    view.lat = Math.max(-60 * RAD, Math.min(70 * RAD, view.lat));
    draw(now);
    if (visible) requestAnimationFrame(step);
  }

  function pick(x, y) {
    var best = null;
    var bestD = 14 * 14;
    for (var k = 0; k < places.length; k++) {
      var o = projected[k];
      if (o[2] <= 0.05) continue;
      var dx = o[0] - x;
      var dy = o[1] - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = places[k]; }
    }
    return best;
  }

  function showTip(p, x, y) {
    hover = p;
    if (!p) { tip.hidden = true; return; }
    tip.textContent = p.name;
    var small = document.createElement("small");
    small.textContent = p.note;
    tip.append(small);
    tip.hidden = false;
    var tx = Math.min(x + 14, W - tip.offsetWidth - 4);
    tip.style.transform = "translate(" + Math.round(tx) + "px," + Math.round(y - tip.offsetHeight - 10) + "px)";
  }

  function local(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", function (e) {
    var pt = local(e);
    var dx = pt.x - W / 2;
    var dy = pt.y - H / 2;
    if (dx * dx + dy * dy > R * R * 1.1) return;
    dragging = true;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
    last = { x: e.clientX, y: e.clientY, t: performance.now() };
    vel.lon = 0;
    vel.lat = 0;
    if (e.pointerType !== "mouse") showTip(pick(pt.x, pt.y), pt.x, pt.y);
  });

  canvas.addEventListener("pointermove", function (e) {
    var pt = local(e);
    if (!dragging) {
      if (e.pointerType === "mouse") showTip(pick(pt.x, pt.y), pt.x, pt.y);
      return;
    }
    var now = performance.now();
    var dt = Math.max(1, now - last.t);
    var k = 1 / R;
    var dLon = -(e.clientX - last.x) * k;
    var dLat = e.pointerType === "mouse" ? (e.clientY - last.y) * k : 0;
    view.lon += dLon;
    view.lat += dLat;
    vel.lon = dLon / dt;
    vel.lat = dLat / dt;
    last = { x: e.clientX, y: e.clientY, t: now };
    lastMove = now;
    if (hover) showTip(null);
  });

  function end(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    lastMove = performance.now();
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse" && !dragging) showTip(null);
  });

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var was = visible;
      visible = entries[0].isIntersecting;
      if (visible && !was) requestAnimationFrame(step);
    }).observe(canvas);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(step);
})();
