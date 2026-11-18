(function () {
  var FILES = {
    site: "content/site.json",
    illustration: "content/illustration.json",
    threed: "content/threed.json"
  };

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

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 980) setMenu(false);
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

  function render() {
    var data = state.data;
    applyChrome(data);
    var status = document.getElementById("status");
    if (status) status.remove();
    var illu = usableItems(data.illustration && data.illustration.items);
    var three = usableItems(data.threed && data.threed.items);
    state.gallery = illu.concat(three).filter(function (item) { return item.image && !item.youtubeId && !item.video; });
    document.getElementById("app").replaceChildren(
      renderHero(data),
      renderCategory("illustration", data.site.illustrationTitle, "01", illu, ui("emptyIllustration")),
      renderCategory("threed", data.site.threedTitle, "02", three, ui("emptyThreed")),
      renderContact(data)
    );
    renderFooter(data);
    watchSections();
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
    document.title = t(site.metaTitle) || site.brand || "NotSoToons";
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

    var brand = document.querySelector(".brand-name");
    if (brand) brand.textContent = site.brand || "NotSoToons";

    var navMap = {
      illustration: site.illustrationTitle,
      threed: site.threedTitle,
      contact: site.contactTitle
    };
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.textContent = t(navMap[link.getAttribute("data-nav")]);
    });

    var skip = document.querySelector(".skip");
    if (skip) skip.textContent = t(ui("skip"));
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
    var wrap = el("div", { class: "deco-wrap", "aria-hidden": "true" });
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "deco");
    svg.setAttribute("viewBox", "0 0 700 340");
    svg.setAttribute("fill", "none");
    svg.innerHTML = [
      '<g stroke="#e23b2f" stroke-width="1.25" fill="none" opacity="0.85">',
      '<path d="M12 36 H250"/>',
      '<path d="M12 36 V168"/>',
      '<path d="M238 22 V50"/>',
      '<path d="M250 36 H310"/>',
      '<circle cx="455" cy="176" r="112"/>',
      '<path d="M455 52 V74 M455 278 V300 M343 176 H365 M545 176 H567"/>',
      '<path d="M18 292 H190" stroke-dasharray="2 7"/>',
      '<path d="M560 48 H680 M640 28 V88"/>',
      '</g>',
      '<text x="292" y="214" fill="none" stroke="#171717" stroke-width="1.35" font-family="Bricolage Grotesque, Avenir Next, sans-serif" font-size="168" font-weight="700" opacity="0.28">09</text>'
    ].join("");
    wrap.append(svg);
    return wrap;
  }

  function renderHero(data) {
    var site = data.site;
    return el("header", { class: "hero", id: "top" }, [
      decoration(),
      el("div", { class: "bleed hero-copy" }, [
        el("h1", { class: "hero-title", text: site.brand || "NotSoToons" }),
        el("p", { class: "credit", text: t(site.credit) })
      ])
    ]);
  }

  function renderCategory(id, title, index, items, emptyText) {
    var empty = !items.length;
    var body = empty
      ? el("p", { class: "empty", text: t(emptyText) })
      : el("div", { class: "works" }, items.map(renderPiece));
    return el("section", { class: "block" + (empty ? " is-empty" : ""), id: id }, [
      empty ? decoration() : null,
      el("div", { class: "bleed" }, [
        el("p", { class: "kicker", text: index }),
        el("h2", { text: t(title) }),
        body
      ])
    ]);
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
        title: item.title || "YouTube",
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

  function renderContact(data) {
    var site = data.site;
    var email = String(site.email || "").trim();
    var mail = NTS.safeUrl("mailto:" + email);
    var socials = (site.socials || []).map(function (item) {
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
    var main = el("div", {}, [
      el("p", { class: "kicker", text: "03" }),
      el("h2", { text: t(site.contactTitle) })
    ]);
    if (!filled) main.append(el("p", { class: "empty", text: t(ui("emptyContact")) }));
    else {
      if (mail) {
        main.append(el("a", { class: "email", href: mail, text: email }));
        main.append(el("div", { class: "contact-actions" }, [
          el("a", { class: "btn", href: mail, text: t(ui("emailCta")) })
        ]));
      }
    }
    return el("section", { class: "contact-block", id: "contact" }, [
      decoration(),
      el("div", { class: "bleed contact-layout" }, [
        main,
        socials.length ? el("div", { class: "socials" }, socials) : null
      ])
    ]);
  }

  function netMark(item) {
    var blob = (String(item.network || "") + " " + String(item.label || "")).toLowerCase();
    var network = String(item.network || "").toLowerCase();
    if (blob.indexOf("you") !== -1) return "YT";
    if (blob.indexOf("insta") !== -1) return "IG";
    if (blob.indexOf("art") !== -1) return "AS";
    if (blob.indexOf("itch") !== -1) return "IT";
    if (network === "x" || blob.indexOf("twitter") !== -1) return "X";
    if (blob.indexOf("tiktok") !== -1) return "TT";
    if (blob.indexOf("discord") !== -1) return "DC";
    return "↗";
  }

  function renderFooter(data) {
    var footer = document.getElementById("footer");
    var year = new Date().getFullYear();
    footer.replaceChildren(el("div", { class: "bleed footer-inner" }, [
      el("div", {}, [
        el("p", { class: "footer-brand", text: data.site.brand || "NotSoToons" }),
        el("p", { class: "credit", text: t(data.site.credit) })
      ]),
      el("p", { text: "© " + year })
    ]));
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

  function watchSections() {
    if (state.observer) state.observer.disconnect();
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
    if (!("IntersectionObserver" in window)) return;
    state.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var on = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", on);
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });
    links.forEach(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      if (section) state.observer.observe(section);
    });
  }

  init();
})();
