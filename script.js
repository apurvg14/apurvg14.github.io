(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EMAIL = "apurvatwork@gmail.com";

  const path = window.location.pathname;
  const onHome = path.endsWith("/") || path.endsWith("/index.html") || path === "";
  const home = onHome ? "" : "index.html";

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll("[data-kbd]").forEach((el) => {
    el.textContent = isMac ? "⌘K" : "Ctrl K";
  });

  /* Theme */

  const themeBtn = document.querySelector("[data-theme-toggle]");

  function setTheme(theme, save) {
    root.dataset.theme = theme;
    themeBtn?.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0c0c0d" : "#fbfbfa");
    if (save) localStorage.setItem("theme", theme);
  }

  setTheme(root.dataset.theme || "light", false);
  const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  themeBtn?.addEventListener("click", toggleTheme);

  /* Header and menu */

  const header = document.querySelector(".header");
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
  }

  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  /* Copy email */

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = EMAIL;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyEmail();
      btn.classList.add("copied");
      window.setTimeout(() => btn.classList.remove("copied"), 1800);
    });
  });

  /* Open a project when linked directly */

  function openFromHash() {
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const target = id && document.getElementById(id);
    if (target && target.tagName === "DETAILS") target.open = true;
  }

  document.querySelectorAll("[data-print]").forEach((btn) => btn.addEventListener("click", () => window.print()));
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* Reveal */

  const revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -3% 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Search palette */

  const projects = [
    ["arrow", "Logistics systems redesign"],
    ["servicing", "Customer-service automation roadmap"],
    ["erp", "ERP data-access benchmark"],
    ["semis", "Data-center and planning strategy"],
    ["pricing", "AI pricing impact measurement"],
    ["compute", "AI compute economics research"],
    ["quoting", "Agentic quoting tool"],
  ];

  const items = [
    { label: "Home", hint: "Page", href: onHome ? "#top" : "index.html" },
    { label: "Selected work", hint: "Section", href: `${home}#work` },
    ...projects.map(([id, name]) => ({ label: name, hint: "Project", href: `${home}#${id}` })),
    { label: "Experience", hint: "Section", href: `${home}#experience` },
    { label: "Research and open source", hint: "Section", href: `${home}#research` },
    { label: "Education", hint: "Section", href: `${home}#education` },
    { label: "Outside work", hint: "Section", href: `${home}#outside` },
    { label: "Contact", hint: "Section", href: `${home}#contact` },
    { label: "Résumé", hint: "Page", href: "resume.html" },
    { label: "Photography", hint: "Page", href: "photography.html" },
    { label: "Travel map", hint: "Page", href: "travel.html" },
    { label: "Games", hint: "Page", href: "games.html" },
    { label: "LinkedIn", hint: "Link", href: "https://www.linkedin.com/in/apurvji", external: true },
    { label: "GitHub", hint: "Link", href: "https://github.com/apurvg14", external: true },
    { label: `Copy email address`, hint: "Action", action: copyEmail },
    { label: "Switch light or dark theme", hint: "Action", action: toggleTheme },
    { label: "Profile for AI agents (llms.txt)", hint: "Page", href: "llms.txt" },
  ];

  if (document.querySelector(".resume")) {
    items.push({ label: "Print or save résumé as PDF", hint: "Action", action: () => window.print() });
  }

  const palette = document.createElement("div");
  palette.className = "palette";
  palette.setAttribute("role", "dialog");
  palette.setAttribute("aria-modal", "true");
  palette.setAttribute("aria-label", "Search");
  palette.innerHTML = `
    <div class="palette-box">
      <input class="palette-input" type="text" placeholder="Search pages, projects, and links" aria-label="Search" aria-controls="palette-list" autocomplete="off" spellcheck="false" />
      <ul class="palette-list" id="palette-list" role="listbox"></ul>
      <div class="palette-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
    </div>`;
  document.body.appendChild(palette);

  const input = palette.querySelector(".palette-input");
  const list = palette.querySelector(".palette-list");
  let filtered = items;
  let selected = 0;
  let lastFocus = null;

  function render() {
    const query = input.value.trim().toLowerCase();
    filtered = query ? items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query)) : items;
    selected = Math.min(selected, Math.max(filtered.length - 1, 0));
    list.innerHTML = "";
    if (!filtered.length) {
      const empty = document.createElement("li");
      empty.className = "palette-empty";
      empty.textContent = "No results.";
      list.appendChild(empty);
      return;
    }
    filtered.forEach((item, index) => {
      const li = document.createElement("li");
      li.id = `palette-item-${index}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(index === selected));
      li.innerHTML = "<span></span><small></small>";
      li.querySelector("span").textContent = item.label;
      li.querySelector("small").textContent = item.hint;
      li.addEventListener("mouseenter", () => {
        selected = index;
        updateSelection();
      });
      li.addEventListener("click", () => run(item));
      list.appendChild(li);
    });
    input.setAttribute("aria-activedescendant", `palette-item-${selected}`);
  }

  function updateSelection() {
    list.querySelectorAll("[role=option]").forEach((li, index) => {
      li.setAttribute("aria-selected", String(index === selected));
      if (index === selected) li.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", `palette-item-${selected}`);
  }

  function openPalette() {
    lastFocus = document.activeElement;
    palette.classList.add("is-open");
    input.value = "";
    selected = 0;
    render();
    input.focus();
  }

  function closePalette() {
    palette.classList.remove("is-open");
    lastFocus?.focus?.();
  }

  function run(item) {
    closePalette();
    if (item.action) return item.action();
    if (item.external) return window.open(item.href, "_blank", "noopener");
    window.location.href = item.href;
    if (item.href.startsWith("#")) openFromHash();
  }

  input.addEventListener("input", () => {
    selected = 0;
    render();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selected = (selected + 1) % Math.max(filtered.length, 1);
      updateSelection();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selected = (selected - 1 + filtered.length) % Math.max(filtered.length, 1);
      updateSelection();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[selected]) run(filtered[selected]);
    }
  });

  palette.addEventListener("click", (event) => {
    if (event.target === palette) closePalette();
  });

  document.querySelectorAll(".search-btn").forEach((btn) => btn.addEventListener("click", openPalette));

  document.addEventListener("keydown", (event) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      palette.classList.contains("is-open") ? closePalette() : openPalette();
    } else if (event.key === "/" && !typing && !palette.classList.contains("is-open")) {
      event.preventDefault();
      openPalette();
    } else if (event.key === "Escape") {
      if (palette.classList.contains("is-open")) closePalette();
      setMenu(false);
    }
  });
})();
