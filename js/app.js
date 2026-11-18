(function () {
  var FILES = {
    theme: "content/theme.json",
    site: "content/site.json",
    illustration: "content/illustration.json",
    animation: "content/animation.json",
    threed: "content/threed.json",
    games: "content/games.json"
  };

  var TAB_DEFAULTS = [
    { id: "illustration", show: true, label: { es: "Ilustración", en: "Illustration" } },
    { id: "animation", show: true, label: { es: "Animación", en: "Animation" } },
    { id: "3d", show: true, label: { es: "3D", en: "3D" } },
    { id: "games", show: true, label: { es: "Videojuegos", en: "Video Games" } },
    { id: "contact", show: true, label: { es: "Contacto", en: "Contact" } }
  ];

  var FONT_QUERY = {
    "Bricolage Grotesque": "Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800",
    "Syne": "Syne:wght@600;700;800",
    "Space Grotesk": "Space+Grotesk:wght@500;600;700",
    "Fraunces": "Fraunces:opsz,wght@9..144,560;9..144,700",
    "Outfit": "Outfit:wght@300;400;500;600",
    "Source Sans 3": "Source+Sans+3:wght@400;500;600",
    "DM Sans": "DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600",
    "Literata": "Literata:opsz,wght@7..72,400;7..72,600"
  };

  var ASPECTS = { cinema: 2.39, "21:9": 2.333, "16:9": 1.778, "4:3": 1.333, "1:1": 1 };
  var TITLE_SIZES = {
    small: ["6vw", "4.6rem"],
    medium: ["7.2vw", "6.4rem"],
    large: ["8.4vw", "8.4rem"]
  };
  var LINE_PATHS = {
    brackets: ["M8 48 H250", "M28 28 V190", "M430 36 H690", "M668 16 V150", "M70 300 H230"],
    horizon: ["M0 90 H700", "M30 180 H540", "M140 270 H700"],
    slash: ["M40 300 L260 40", "M250 320 L520 20", "M480 310 L680 120"],
    frame: ["M36 40 H280", "M36 40 V210", "M664 40 H420", "M664 40 V210", "M36 300 H280", "M664 300 H420"]
  };

  var TABS = ["illustration", "animation", "3d", "games", "contact"];

  var SVG_NS = "http://www.w3.org/2000/svg";

  var state = {
    lang: "en",
    base: "/",
    data: null,
    gallery: [],
    lightboxIndex: 0,
    lastFocus: null,
    observer: null
  };

  function t(value) {
    return NTS.translate(value, state.lang);
  }

  function ui(key) {
    var bag = state.data && state.data.site && state.data.site.ui;
    return bag ? bag[key] : null;
  }

  function asset(path) {
    return NTS.assetUrl(path, state.base);
  }

  function readSaved() {
    try { return localStorage.getItem("notsotoons-lang"); }
    catch (err) { return null; }
  }

  function el(tag, props, kids) {
    var node = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (kids || []).forEach(function (kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) {
        kid.forEach(function (nested) {
          if (nested == null || nested === false) return;
          node.append(nested.nodeType ? nested : document.createTextNode(String(nested)));
        });
        return;
      }
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return node;
  }

  function init() {
    var navLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    state.lang = NTS.pickLang(readSaved(), navLang);
    state.base = NTS.baseFromPath(window.location.pathname);
    document.documentElement.lang = state.lang;
    document.documentElement.dataset.lang = state.lang;
    bindChrome();
    load();
  }

  function bindChrome() {
    syncLangButtons();
    var group = document.querySelector(".lang");
    if (group) {
      group.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        setLang(state.lang === "es" ? "en" : "es");
      });
    }
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-set-lang"));
      });
    });

    var menuBtn = document.querySelector(".menu-btn");
    if (menuBtn) {
      menuBtn.addEventListener("click", function () {
        var open = !document.body.classList.contains("nav-open");
        setMenu(open);
        if (open) {
          var first = document.querySelector("#nav-links a");
          if (first) first.focus();
        }
      });
    }

    var links = document.getElementById("nav-links");
    if (links) {
      links.addEventListener("click", function (event) {
        if (event.target.closest("a")) setMenu(false);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setMenu(false);
        if (menuBtn) menuBtn.focus();
      }
    });

    window.addEventListener("hashchange", function () {
      showTab(currentTab(), true);
    });

    var dialog = document.getElementById("lightbox");
    document.querySelector("[data-lightbox='close']").addEventListener("click", function () {
      if (dialog.close) dialog.close();
    });
    document.querySelector("[data-lightbox='prev']").addEventListener("click", function () {
      fillLightbox(state.lightboxIndex - 1);
    });
    document.querySelector("[data-lightbox='next']").addEventListener("click", function () {
      fillLightbox(state.lightboxIndex + 1);
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog && dialog.close) dialog.close();
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        fillLightbox(state.lightboxIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        fillLightbox(state.lightboxIndex - 1);
      }
    });
    dialog.addEventListener("close", function () {
      if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
    });
  }

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    var btn = document.querySelector(".menu-btn");
    if (!btn) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var sr = btn.querySelector(".sr-only");
    if (!sr) return;
    if (state.data) sr.textContent = t(ui(open ? "closeMenu" : "menu"));
    else sr.textContent = open
      ? (state.lang === "es" ? "Cerrar menú" : "Close menu")
      : (state.lang === "es" ? "Menú" : "Menu");
  }

  function syncLangButtons() {
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === state.lang;
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (state.data) {
        btn.setAttribute("aria-label", btn.getAttribute("data-set-lang") === "es" ? t(ui("spanish")) : t(ui("english")));
      }
    });
    var group = document.querySelector(".lang");
    if (group && state.data) group.setAttribute("aria-label", t(ui("language")));
  }

  function setLang(lang) {
    if (lang !== "es" && lang !== "en") return;
    state.lang = lang;
    try { localStorage.setItem("notsotoons-lang", lang); } catch (err) { /* private mode */ }
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    syncLangButtons();
    if (state.data) {
      var y = window.scrollY;
      render();
      window.scrollTo(0, y);
    }
    var live = document.getElementById("lang-status");
    if (live) {
      live.textContent = state.data
        ? (lang === "es" ? t(ui("spanish")) : t(ui("english")))
        : (lang === "es" ? "Español" : "English");
    }
  }

  function load() {
    var keys = Object.keys(FILES);
    Promise.all(keys.map(function (key) {
      return fetch(state.base + FILES[key], { cache: "no-cache" }).then(function (res) {
        if (!res.ok) throw new Error(FILES[key] + " (" + res.status + ")");
        return res.json();
      });
    })).then(function (values) {
      var data = {};
      keys.forEach(function (key, index) { data[key] = values[index]; });
      state.data = data;
      render();
    }).catch(function (err) {
      var status = document.getElementById("status");
      var message = state.lang === "es" ? "No se pudo cargar el contenido." : "Could not load the content.";
      if (status) {
        status.classList.add("is-error");
        status.textContent = message + " " + (err && err.message ? err.message : "");
      }
    });
  }

  function themeOf() {
    return (state.data && state.data.theme) || {};
  }

  function colorValue(value, fallback) {
    var v = String(value || "").trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
    if (/^rgba?\(/i.test(v)) return v;
    return fallback;
  }

  function unitOpacity(value, fallback) {
    var n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    if (n > 1) n = n / 100;
    return Math.max(0, Math.min(1, n));
  }

  function normalizeTabs(theme) {
    var incoming = theme && theme.tabs;
    var seen = {};
    var out = [];
    (incoming || []).forEach(function (tab) {
      var id = String((tab && tab.id) || "");
      if (TABS.indexOf(id) < 0 || seen[id]) return;
      seen[id] = true;
      var fallback = TAB_DEFAULTS.filter(function (item) { return item.id === id; })[0];
      out.push({
        id: id,
        show: !(tab && tab.show === false),
        label: (tab && tab.label) || fallback.label,
        intro: (tab && tab.intro) || { es: "", en: "" }
      });
    });
    TAB_DEFAULTS.forEach(function (tab) {
      if (!seen[tab.id]) out.push(tab);
    });
    return out;
  }

  function visibleTabs() {
    var list = (state.tabs || TAB_DEFAULTS).filter(function (tab) { return tab.show !== false; });
    return list.length ? list : TAB_DEFAULTS.slice(0, 1);
  }

  function applyTheme() {
    var theme = themeOf();
    var root = document.documentElement;
    var aspectKey = ASPECTS[theme.aspect] ? theme.aspect : "cinema";
    var sizeKey = TITLE_SIZES[theme.titleSize] ? theme.titleSize : "large";
    var cols = Number(theme.columns);
    if (cols !== 2 && cols !== 3) cols = 1;
    var pattern = LINE_PATHS[theme.linePattern] ? theme.linePattern : "brackets";
    var titlePos = theme.titlePosition === "overlay" || theme.titlePosition === "below" ? theme.titlePosition : "attached";
    var heading = FONT_QUERY[theme.headingFont] ? theme.headingFont : "Bricolage Grotesque";
    var body = FONT_QUERY[theme.bodyFont] ? theme.bodyFont : "Outfit";
    root.style.setProperty("--bg", colorValue(theme.background, "#f4f4f2"));
    root.style.setProperty("--paper", colorValue(theme.surface, "#ffffff"));
    root.style.setProperty("--ink", colorValue(theme.text, "#171717"));
    root.style.setProperty("--accent", colorValue(theme.accent, "#e23b2f"));
    root.style.setProperty("--line-color", colorValue(theme.lineColor, colorValue(theme.accent, "#e23b2f")));
    root.style.setProperty("--line-width", (Number(theme.lineThickness) > 0 ? Number(theme.lineThickness) : 10) + "px");
    root.style.setProperty("--line-opacity", String(unitOpacity(theme.lineOpacity, 1)));
    root.style.setProperty("--radius", Math.max(0, Number(theme.radius) || 0) + "px");
    root.style.setProperty("--gap", Math.max(0, Number(theme.gap) || 0) + "px");
    root.style.setProperty("--ratio", String(ASPECTS[aspectKey]));
    root.style.setProperty("--title-vw", TITLE_SIZES[sizeKey][0]);
    root.style.setProperty("--title-max", TITLE_SIZES[sizeKey][1]);
    root.style.setProperty("--display", '"' + heading + '", "Avenir Next", sans-serif');
    root.style.setProperty("--body", '"' + body + '", "Avenir Next", sans-serif');
    root.dataset.cols = String(cols);
    root.dataset.title = titlePos;
    root.dataset.lines = theme.lines === true ? "on" : "off";
    root.dataset.pattern = pattern;
    state.pattern = pattern;
    var families = ["family=" + FONT_QUERY[heading]];
    if (body !== heading) families.push("family=" + FONT_QUERY[body]);
    var href = "https://fonts.googleapis.com/css2?" + families.join("&") + "&display=swap";
    var link = document.getElementById("theme-fonts");
    if (!link) {
      link = document.createElement("link");
      link.id = "theme-fonts";
      link.rel = "stylesheet";
      document.head.append(link);
    }
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    state.tabs = normalizeTabs(theme);
  }

  function render() {
    var data = state.data;
    applyTheme();
    applyChrome(data);
    var status = document.getElementById("status");
    if (status) status.remove();
    state.panels = {
      illustration: usableItems(data.illustration && data.illustration.items),
      animation: usableItems(data.animation && data.animation.items),
      "3d": usableItems(data.threed && data.threed.items),
      games: usableItems(data.games && data.games.items)
    };
    document.getElementById("app").replaceChildren(
      renderHero(data),
      renderCategory("illustration", "01", state.panels.illustration, ui("emptyIllustration")),
      renderCategory("animation", "02", state.panels.animation, ui("emptyAnimation")),
      renderCategory("3d", "03", state.panels["3d"], ui("emptyThreed")),
      renderCategory("games", "04", state.panels.games, ui("emptyGames")),
      renderContact(data)
    );
    renderFooter(data);
    showTab(currentTab(), false);
    var dialog = document.getElementById("lightbox");
    if (dialog.open) fillLightbox(state.lightboxIndex);
    syncLangButtons();
  }

  function usableItems(list) {
    return (list || []).map(function (item) {
      var youtubeId = NTS.youtubeId(item.youtube || item.video || "");
      var video = asset(item.videoFile || "");
      var image = asset(item.image || "");
      if (!image && !video && !youtubeId) return null;
      return {
        raw: item,
        title: t(item.title),
        alt: t(item.alt) || t(item.title),
        image: image,
        video: video,
        youtubeId: youtubeId,
        size: NTS.pieceSize(item.size)
      };
    }).filter(Boolean);
  }

  function applyChrome(data) {
    var site = data.site;
    document.title = t(site.metaTitle) || themeOf().heroTitle || "NotSoToons";
    setMeta("name", "description", t(site.metaDescription));
    setMeta("property", "og:title", document.title);
    setMeta("property", "og:description", t(site.metaDescription));
    var href = location.origin + state.base;
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = href;
    setMeta("property", "og:url", href);

    var theme = themeOf();
    var brand = document.querySelector(".brand-name");
    if (brand) brand.textContent = theme.heroTitle || "NotSoToons";

    var nav = document.getElementById("nav-links");
    if (nav) {
      var sectionsLabel = t(ui("sectionsLabel"));
      if (sectionsLabel) nav.setAttribute("aria-label", sectionsLabel);
      nav.replaceChildren.apply(nav, visibleTabs().map(function (tab) {
        return el("a", {
          href: "#" + tab.id,
          "data-nav": tab.id,
          role: "tab",
          "aria-controls": tab.id,
          text: t(tab.label) || tab.id
        });
      }));
    }

    var skip = document.querySelector(".skip");
    if (skip) skip.textContent = t(ui("skip"));
    var esBtn = document.querySelector("[data-set-lang='es']");
    var enBtn = document.querySelector("[data-set-lang='en']");
    if (esBtn && t(ui("langEs"))) esBtn.textContent = t(ui("langEs"));
    if (enBtn && t(ui("langEn"))) enBtn.textContent = t(ui("langEn"));
    setMenu(document.body.classList.contains("nav-open"));
    labelButton("[data-lightbox='close']", t(ui("close")));
    labelButton("[data-lightbox='prev']", t(ui("previous")));
    labelButton("[data-lightbox='next']", t(ui("next")));
  }

  function labelButton(selector, text) {
    var node = document.querySelector(selector);
    if (node && text) node.textContent = text;
  }

  function setMeta(attr, key, content) {
    if (!content) return;
    var node = document.querySelector("meta[" + attr + "='" + key + "']");
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attr, key);
      document.head.append(node);
    }
    node.setAttribute("content", content);
  }

  function decoration() {
    if (themeOf().lines !== true) return null;
    var wrap = el("div", { class: "deco-wrap", "aria-hidden": "true" });
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "deco");
    svg.setAttribute("viewBox", "0 0 700 340");
    svg.setAttribute("fill", "none");
    var paths = LINE_PATHS[state.pattern] || LINE_PATHS.brackets;
    svg.innerHTML = "<g fill=\"none\" stroke-linecap=\"square\">" + paths.map(function (d) {
      return '<path d="' + d + '"/>';
    }).join("") + "</g>";
    wrap.append(svg);
    return wrap;
  }

  function tabById(id) {
    return (state.tabs || TAB_DEFAULTS).filter(function (tab) { return tab.id === id; })[0] || { label: {} };
  }

  function renderHero() {
    var theme = themeOf();
    var image = asset(theme.heroImage);
    var bio = t(theme.heroBio);
    var copy = [
      el("h1", { class: "hero-title", text: theme.heroTitle || "NotSoToons" })
    ];
    var credit = t(theme.heroSubtitle);
    if (credit) copy.push(el("p", { class: "credit", text: credit }));
    if (bio) copy.push(el("p", { class: "hero-bio", text: bio }));
    var kids = [decoration()];
    if (image) {
      kids.push(el("div", { class: "hero-header" }, [
        el("img", {
          src: image,
          alt: t(theme.headerAlt) || theme.heroTitle || ""
        })
      ]));
    }
    kids.push(el("div", { class: "bleed hero-copy" }, copy));
    return el("header", { class: "hero" + (image ? " has-header" : ""), id: "top" }, kids);
  }

  function renderCategory(id, index, items, emptyText) {
    var empty = !items.length;
    var body = empty
      ? el("p", { class: "empty", text: t(emptyText) })
      : el("div", { class: "works" }, items.map(renderPiece));
    return el("section", {
      class: "block" + (empty ? " is-empty" : ""),
      id: id,
      "data-panel": id,
      role: "tabpanel"
    }, [
      empty ? decoration() : null,
      el("div", { class: "bleed" }, [
        sectionIntro(id),
        body
      ])
    ]);
  }

  function sectionIntro(id) {
    var nodes = [];
    if (themeOf().showSectionHeading === true) {
      var heading = t(tabById(id).label);
      if (heading) nodes.push(el("h2", { text: heading }));
    }
    var intro = t(tabById(id).intro);
    if (intro) nodes.push(el("p", { class: "lead", text: intro }));
    return nodes;
  }

  function renderPiece(item) {
    var title = item.title
      ? el("h3", { class: "piece-title" }, [el("span", { text: item.title })])
      : null;
    return el("article", { class: "piece", "data-size": item.size }, [
      title,
      el("div", { class: "frame" }, [mediaNode(item)])
    ]);
  }

  function mediaNode(item) {
    if (item.youtubeId) return youtubeFrame(item);
    if (item.video) return fileVideo(item);
    return imageButton(item);
  }

  function imageButton(item) {
    var button = el("button", { class: "shot", type: "button" });
    var img = el("img", { src: item.image, alt: item.alt || item.title || "" });
    img.loading = "lazy";
    button.append(img);
    button.addEventListener("click", function () {
      var index = state.gallery.indexOf(item);
      if (index < 0) return;
      openLightbox(index);
    });
    return button;
  }

  function fileVideo(item) {
    var video = el("video", {
      controls: "true",
      playsinline: "true",
      preload: "metadata"
    });
    if (item.image) video.setAttribute("poster", item.image);
    video.append(el("source", { src: item.video }));
    if (item.title) video.setAttribute("aria-label", item.title);
    return video;
  }

  function youtubeFrame(item) {
    var holder = el("div", { class: "yt" });
    if (item.image) {
      var img = el("img", { src: item.image, alt: item.alt || item.title || "" });
      holder.append(img);
    }
    var play = el("button", { class: "play", type: "button", "aria-label": t(ui("watch")) });
    play.append(el("span", { class: "tri", "aria-hidden": "true" }));
    play.addEventListener("click", function () {
      if (holder.querySelector("iframe")) return;
      holder.append(el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(item.youtubeId) + "?autoplay=1&rel=0",
        title: item.title || t(ui("watch")) || "YouTube",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: "true",
        referrerpolicy: "strict-origin-when-cross-origin"
      }));
      play.remove();
    });
    holder.append(play);
    holder.style.position = "absolute";
    holder.style.inset = "0";
    return holder;
  }

  function renderContact() {
    var theme = themeOf();
    var email = String(theme.email || "").trim();
    var mail = NTS.safeUrl("mailto:" + email);
    var socials = (theme.socials || []).map(function (item) {
      var href = NTS.safeUrl(item.url);
      if (!href) return null;
      var row = el("a", { class: "social", href: href, target: "_blank", rel: "me noopener noreferrer" });
      row.append(el("span", { class: "net-mark", "aria-hidden": "true", text: netMark(item) }));
      var name = el("span", { text: item.label || "" });
      var extra = t(ui("newTab"));
      if (extra) name.append(el("span", { class: "sr-only", text: " (" + extra + ")" }));
      row.append(name);
      if (item.handle) row.append(el("span", { class: "handle", text: item.handle }));
      return row;
    }).filter(Boolean);
    var filled = Boolean(mail || socials.length);
    var main = el("div", {}, [sectionIntro("contact")]);
    if (!filled) main.append(el("p", { class: "empty", text: t(ui("emptyContact")) }));
    else {
      if (mail) {
        main.append(el("a", { class: "email", href: mail, text: email }));
        main.append(el("div", { class: "contact-actions" }, [
          el("a", { class: "btn", href: mail, text: t(ui("emailCta")) })
        ]));
      }
    }
    return el("section", { class: "contact-block", id: "contact", "data-panel": "contact", role: "tabpanel" }, [
      decoration(),
      el("div", { class: "bleed contact-layout" }, [
        main,
        socials.length ? el("div", { class: "socials" }, socials) : null
      ])
    ]);
  }

  function netMark(item) {
    var label = String(item.label || "").trim();
    if (!label) return "";
    return label.slice(0, 2).toUpperCase();
  }

  function renderFooter() {
    var footer = document.getElementById("footer");
    var line = t(themeOf().footerText);
    footer.replaceChildren(line ? el("div", { class: "bleed footer-inner" }, [
      el("p", { class: "footer-brand", text: line })
    ]) : el("div"));
  }

  function openLightbox(index) {
    fillLightbox(index);
    var dialog = document.getElementById("lightbox");
    state.lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function fillLightbox(index) {
    var items = state.gallery || [];
    if (!items.length) return;
    var count = items.length;
    index = ((index % count) + count) % count;
    state.lightboxIndex = index;
    var item = items[index];
    var img = document.getElementById("lightbox-img");
    img.src = item.image;
    img.alt = item.alt || item.title || "";
    document.getElementById("lightbox-cap").textContent = item.title || "";
    document.getElementById("lightbox-count").textContent = (index + 1) + " / " + count;
  }

  function currentTab() {
    var id = String(location.hash || "").replace(/^#/, "");
    var visible = visibleTabs().map(function (tab) { return tab.id; });
    if (visible.indexOf(id) >= 0) return id;
    return visible[0] || "illustration";
  }

  function showTab(id, scroll) {
    state.tab = id;
    state.gallery = (state.panels[id] || []).filter(function (item) {
      return item.image && !item.youtubeId && !item.video;
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      var on = panel.id === id;
      panel.hidden = !on;
    });
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var on = link.getAttribute("data-nav") === id;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-selected", on ? "true" : "false");
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      if (on && scroll) link.scrollIntoView({ inline: "center", block: "nearest" });
    });
    if (scroll) {
      var panel = document.getElementById(id);
      if (panel) panel.scrollIntoView({ block: "start" });
    }
  }

  init();
})();
