(() => {
  const locations = [
    { id: "san-francisco", name: "San Francisco", note: "California, United States", region: "North America", view: "north-america", x: 160, y: 145 },
    { id: "las-vegas", name: "Las Vegas", note: "Nevada, United States", region: "North America", view: "north-america", x: 180, y: 150 },
    { id: "seattle", name: "Seattle", note: "Washington, United States", region: "North America", view: "north-america", x: 160, y: 118 },
    { id: "los-angeles", name: "Los Angeles", note: "California, United States", region: "North America", view: "north-america", x: 172, y: 155 },
    { id: "atlanta", name: "Atlanta", note: "Georgia, United States", region: "North America", view: "north-america", x: 266, y: 156 },
    { id: "denver", name: "Denver", note: "Colorado, United States", region: "North America", view: "north-america", x: 208, y: 140 },
    { id: "dallas", name: "Dallas", note: "Texas, United States", region: "North America", view: "north-america", x: 231, y: 159 },
    { id: "milwaukee", name: "Milwaukee", note: "Wisconsin, United States", region: "North America", view: "north-america", x: 254, y: 128 },
    { id: "chicago", name: "Chicago", note: "Illinois, United States", region: "North America", view: "north-america", x: 258, y: 136 },
    { id: "new-york", name: "New York", note: "New York, United States", region: "North America", view: "north-america", x: 294, y: 137 },
    { id: "washington-dc", name: "Washington, DC", note: "District of Columbia, United States", region: "North America", view: "north-america", x: 286, y: 145 },
    { id: "boston", name: "Boston", note: "Massachusetts, United States", region: "North America", view: "north-america", x: 304, y: 131 },
    { id: "new-orleans", name: "New Orleans", note: "Louisiana, United States", region: "North America", view: "north-america", x: 250, y: 167 },
    { id: "tulum", name: "Tulum", note: "Quintana Roo, Mexico", region: "North America", view: "north-america", x: 257, y: 194 },
    { id: "guadalajara", name: "Guadalajara", note: "Jalisco, Mexico", region: "North America", view: "north-america", x: 213, y: 193 },
    { id: "hawaii", name: "Hawaiʻi", note: "United States", region: "North America", view: "north-america", x: 62, y: 191 },
    { id: "montreal", name: "Montreal", note: "Quebec, Canada", region: "North America", view: "north-america", x: 296, y: 123 },
    { id: "amsterdam", name: "Amsterdam", note: "Netherlands", region: "Europe", view: "europe", x: 514, y: 105 },
    { id: "frankfurt", name: "Frankfurt", note: "Germany", region: "Europe", view: "europe", x: 524, y: 111 },
    { id: "new-delhi", name: "New Delhi", note: "Delhi, India", region: "India", view: "india", x: 715, y: 171 },
    { id: "vadodara", name: "Vadodara", note: "Gujarat, India", region: "India", view: "india", x: 703, y: 188 },
    { id: "bhopal", name: "Bhopal", note: "Madhya Pradesh, India", region: "India", view: "india", x: 716, y: 185 },
    { id: "mumbai", name: "Mumbai", note: "Maharashtra, India", region: "India", view: "india", x: 702, y: 198 },
    { id: "hong-kong", name: "Hong Kong", note: "Hong Kong SAR", region: "East and Southeast Asia", view: "asia", x: 817, y: 188 },
    { id: "kuala-lumpur", name: "Kuala Lumpur", note: "Malaysia", region: "East and Southeast Asia", view: "asia", x: 783, y: 239 },
    { id: "johor-bahru", name: "Johor Bahru", note: "Johor, Malaysia", region: "East and Southeast Asia", view: "asia", x: 787, y: 246 },
    { id: "singapore", name: "Singapore", note: "Singapore", region: "East and Southeast Asia", view: "asia", x: 791, y: 250 },
  ];

  const WORLD = { x: 0, y: 0, w: 1000, h: 500 };
  const ASPECT = WORLD.h / WORLD.w;
  const MIN_W = 45;
  const views = {
    world: WORLD,
    "north-america": { x: 25, y: 45, w: 340, h: 170 },
    europe: { x: 440, y: 62, w: 150, h: 75 },
    india: { x: 650, y: 140, w: 120, h: 60 },
    asia: { x: 735, y: 165, w: 130, h: 65 },
  };

  const svg = document.querySelector("#travel-map");
  const pointLayer = document.querySelector("#map-points");
  const hint = document.querySelector(".map-hint");
  const viewButtons = [...document.querySelectorAll("[data-map-view]")];
  const zoomButtons = [...document.querySelectorAll("[data-zoom]")];
  const locationButtons = [...document.querySelectorAll("[data-location]")];
  const detailIndex = document.querySelector("#map-detail-index");
  const detailRegion = document.querySelector("#map-detail-region");
  const detailName = document.querySelector("#map-detail-name");
  const detailNote = document.querySelector("#map-detail-note");
  const ns = "http://www.w3.org/2000/svg";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  if (!svg || !pointLayer) return;

  let vb = { ...WORLD };
  let animation = null;

  /* View box */

  function clamp(box) {
    const w = Math.min(Math.max(box.w, MIN_W), WORLD.w);
    const h = w * ASPECT;
    const x = Math.min(Math.max(box.x, WORLD.x), WORLD.w - w);
    const y = Math.min(Math.max(box.y, WORLD.y), WORLD.h - h);
    return { x, y, w, h };
  }

  function apply(box) {
    vb = clamp(box);
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const k = vb.w / WORLD.w;
    pointLayer.querySelectorAll(".map-point").forEach((point) => {
      const circle = point.querySelector("circle");
      const label = point.querySelector("text");
      circle.setAttribute("r", String(4.5 * k));
      circle.setAttribute("stroke-width", String(1.5 * k));
      label.setAttribute("font-size", String(12 * k));
      label.setAttribute("stroke-width", String(3 * k));
      label.setAttribute("y", String(-10 * k));
    });
  }

  function animateTo(target) {
    const end = clamp(target);
    if (animation) cancelAnimationFrame(animation);
    if (reducedMotion) return apply(end);
    const start = { ...vb };
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / 380, 1);
      const e = 1 - Math.pow(1 - t, 3);
      apply({
        x: start.x + (end.x - start.x) * e,
        y: start.y + (end.y - start.y) * e,
        w: start.w + (end.w - start.w) * e,
        h: start.h + (end.h - start.h) * e,
      });
      if (t < 1) animation = requestAnimationFrame(step);
    };
    animation = requestAnimationFrame(step);
  }

  function setActiveRegion(name) {
    viewButtons.forEach((button) => {
      const active = button.dataset.mapView === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function toSvgPoint(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    return {
      x: vb.x + ((clientX - rect.left) / rect.width) * vb.w,
      y: vb.y + ((clientY - rect.top) / rect.height) * vb.h,
    };
  }

  function zoomAt(factor, cx, cy, smooth) {
    const w = Math.min(Math.max(vb.w / factor, MIN_W), WORLD.w);
    const scale = w / vb.w;
    const next = { x: cx - (cx - vb.x) * scale, y: cy - (cy - vb.y) * scale, w, h: w * ASPECT };
    setActiveRegion(null);
    smooth ? animateTo(next) : apply(next);
  }

  function zoomCenter(factor) {
    zoomAt(factor, vb.x + vb.w / 2, vb.y + vb.h / 2, true);
  }

  /* Points */

  function selectLocation(location) {
    pointLayer.querySelectorAll(".map-point").forEach((point) => {
      const active = point.dataset.locationId === location.id;
      point.classList.toggle("active", active);
      point.setAttribute("aria-pressed", String(active));
      if (active) pointLayer.appendChild(point);
    });
    locationButtons.forEach((button) => button.classList.toggle("active", button.dataset.location === location.id));
    detailIndex.textContent = `${String(locations.indexOf(location) + 1).padStart(2, "0")} / ${locations.length}`;
    detailRegion.textContent = location.region;
    detailName.textContent = location.name;
    detailNote.textContent = location.note;
  }

  let suppressClick = false;

  locations.forEach((location) => {
    const point = document.createElementNS(ns, "g");
    point.classList.add("map-point");
    point.dataset.locationId = location.id;
    point.setAttribute("transform", `translate(${location.x} ${location.y})`);
    point.setAttribute("tabindex", "0");
    point.setAttribute("role", "button");
    point.setAttribute("aria-label", `${location.name}, ${location.note}`);
    point.setAttribute("aria-pressed", "false");

    const circle = document.createElementNS(ns, "circle");
    const label = document.createElementNS(ns, "text");
    label.textContent = location.name;
    const title = document.createElementNS(ns, "title");
    title.textContent = `${location.name}, ${location.note}`;
    point.append(circle, label, title);

    point.addEventListener("click", () => {
      if (!suppressClick) selectLocation(location);
    });
    point.addEventListener("focus", () => selectLocation(location));
    point.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectLocation(location);
    });
    pointLayer.appendChild(point);
  });

  /* Drag and pinch */

  const pointers = new Map();
  let dragStart = null;
  let pinchStart = null;

  svg.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    svg.setPointerCapture(event.pointerId);
    if (animation) cancelAnimationFrame(animation);
    if (pointers.size === 1) {
      dragStart = { x: event.clientX, y: event.clientY, vb: { ...vb }, moved: false };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: toSvgPoint((a.x + b.x) / 2, (a.y + b.y) / 2),
        vb: { ...vb },
      };
      dragStart = null;
    }
  });

  svg.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = svg.getBoundingClientRect();

    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const w = Math.min(Math.max(pinchStart.vb.w * (pinchStart.dist / dist), MIN_W), WORLD.w);
      const fx = ((a.x + b.x) / 2 - rect.left) / rect.width;
      const fy = ((a.y + b.y) / 2 - rect.top) / rect.height;
      apply({ x: pinchStart.mid.x - fx * w, y: pinchStart.mid.y - fy * w * ASPECT, w, h: w * ASPECT });
      setActiveRegion(null);
      suppressClick = true;
      return;
    }

    if (dragStart) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      if (!dragStart.moved && Math.hypot(dx, dy) < 4) return;
      dragStart.moved = true;
      suppressClick = true;
      svg.classList.add("dragging");
      apply({
        x: dragStart.vb.x - (dx / rect.width) * dragStart.vb.w,
        y: dragStart.vb.y - (dy / rect.height) * dragStart.vb.h,
        w: dragStart.vb.w,
        h: dragStart.vb.h,
      });
      setActiveRegion(null);
    }
  });

  function endPointer(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) {
      dragStart = null;
      svg.classList.remove("dragging");
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  }

  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);

  /* Wheel and keyboard */

  let hintTimer = null;

  function showHint() {
    if (!hint) return;
    hint.textContent = isMac ? "Use ⌘ + scroll or pinch to zoom" : "Use Ctrl + scroll to zoom";
    hint.classList.add("show");
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => hint.classList.remove("show"), 1200);
  }

  svg.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        showHint();
        return;
      }
      event.preventDefault();
      const p = toSvgPoint(event.clientX, event.clientY);
      zoomAt(Math.exp(-event.deltaY * 0.0022), p.x, p.y, false);
    },
    { passive: false }
  );

  svg.addEventListener("dblclick", (event) => {
    const p = toSvgPoint(event.clientX, event.clientY);
    zoomAt(2, p.x, p.y, true);
  });

  svg.addEventListener("keydown", (event) => {
    const panStep = vb.w * 0.12;
    const moves = { ArrowLeft: [-panStep, 0], ArrowRight: [panStep, 0], ArrowUp: [0, -panStep * ASPECT], ArrowDown: [0, panStep * ASPECT] };
    if (moves[event.key] && event.target === svg) {
      event.preventDefault();
      setActiveRegion(null);
      animateTo({ ...vb, x: vb.x + moves[event.key][0], y: vb.y + moves[event.key][1] });
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomCenter(1.6);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomCenter(1 / 1.6);
    }
  });

  /* Controls */

  viewButtons.forEach((button) =>
    button.addEventListener("click", () => {
      setActiveRegion(button.dataset.mapView);
      animateTo(views[button.dataset.mapView]);
    })
  );

  zoomButtons.forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.zoom === "in") zoomCenter(1.6);
      if (button.dataset.zoom === "out") zoomCenter(1 / 1.6);
      if (button.dataset.zoom === "reset") {
        setActiveRegion("world");
        animateTo(WORLD);
      }
    })
  );

  locationButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const location = locations.find((item) => item.id === button.dataset.location);
      if (!location) return;
      setActiveRegion(location.view);
      animateTo(views[location.view]);
      selectLocation(location);
      const rect = svg.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        svg.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      }
    })
  );

  svg.setAttribute("tabindex", "0");
  apply(WORLD);
  selectLocation(locations[0]);
})();
