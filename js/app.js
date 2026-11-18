(function () {
  var FILES = {
    site: "content/site.json",
    about: "content/about.json",
    contact: "content/contact.json",
    illustrations: "content/illustrations.json",
    animations: "content/animations.json",
    games: "content/games.json",
    commissions: "content/commissions.json"
  };

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
    try {
      return localStorage.getItem("notsotoons-lang");
    } catch (err) {
      return null;
    }
  }

  function el(tag, props, kids) {
    var node = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = String(value);
      else if (key === "disabled") node.disabled = Boolean(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    appendKids(node, kids);
    return node;
  }

  function appendKids(node, kids) {
    (kids || []).forEach(function (kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) {
        appendKids(node, kid);
        return;
      }
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
  }

  function smartImg(src, alt) {
    var img = el("img", { src: src, alt: alt || "" });
    img.addEventListener("error", function () {
      img.classList.add("is-broken");
    });
    return img;
  }

  function extLink(href, label, className, rel) {
    var a = el("a", {
      class: className || "",
      href: href,
      target: "_blank",
      rel: rel || "noopener noreferrer"
    });
    a.append(document.createTextNode(label));
    var extra = t(ui("newTab"));
    if (extra) a.append(el("span", { class: "sr-only", text: " (" + extra + ")" }));
    return a;
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
      if (window.innerWidth >= 1100) setMenu(false);
    });

    var dialog = document.getElementById("lightbox");
    document.querySelector("[data-lightbox='close']").addEventListener("click", function () {
      if (dialog.close) dialog.close();
      else dialog.removeAttribute("open");
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

    var touchX = null;
    var shot = document.getElementById("lightbox-img");
    shot.addEventListener("touchstart", function (event) {
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    shot.addEventListener("touchend", function (event) {
      if (touchX == null) return;
      var dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) fillLightbox(state.lightboxIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
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
    document.getElementById("app").replaceChildren(
      renderHero(data),
      renderIllustration(data),
      renderAnimation(data),
      renderGames(data),
      renderCommissions(data),
      renderAbout(data),
      renderContact(data)
    );
    renderFooter(data);
    watchSections();
    var dialog = document.getElementById("lightbox");
    if (dialog.open) fillLightbox(state.lightboxIndex);
    syncLangButtons();
  }

  function applyChrome(data) {
    var site = data.site;
    document.title = t(site.metaTitle) || site.brand || "NotSoToons";
    setMeta("name", "description", t(site.metaDescription));
    setMeta("property", "og:title", document.title);
    setMeta("property", "og:description", t(site.metaDescription));
    setMeta("property", "og:type", "website");
    var canonicalHref = location.origin + state.base;
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalHref;
    setMeta("property", "og:url", canonicalHref);

    var brand = document.querySelector(".brand-name");
    if (brand) brand.textContent = site.brand || "NotSoToons";

    var navMap = {
      illustration: site.illustration && site.illustration.title,
      animation: site.animation && site.animation.title,
      games: site.games && site.games.title,
      commissions: site.commissions && site.commissions.title,
      about: data.about && data.about.title,
      contact: data.contact && data.contact.title
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
    setJsonLd(data);
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

  function setJsonLd(data) {
    var node = document.getElementById("nts-ld");
    if (!node) {
      node = document.createElement("script");
      node.id = "nts-ld";
      node.type = "application/ld+json";
      document.head.append(node);
    }
    var socials = ((data.contact && data.contact.socials) || []).map(function (item) {
      return NTS.safeUrl(item.url);
    }).filter(Boolean);
    var email = String((data.contact && data.contact.email) || "");
    var obj = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: (data.about && data.about.fullName) || "Juan Pablo Arango Castro",
      alternateName: data.site.brand || "NotSoToons",
      jobTitle: t(data.site.tagline),
      url: location.origin + state.base,
      knowsAbout: ((data.about && data.about.skills) || []).map(t).filter(Boolean),
      sameAs: socials
    };
    if (email && email.indexOf("@example.") === -1 && email.indexOf("@") > 0) obj.email = email;
    node.textContent = JSON.stringify(obj);
  }

  function chapter(section) {
    section = section || {};
    return el("header", { class: "chapter" }, [
      section.index ? el("p", { class: "index-giant", "aria-hidden": "true", text: section.index }) : null,
      el("div", { class: "wrap chapter-copy" }, [
        section.index ? el("p", { class: "index-small", text: section.index }) : null,
        el("h2", { text: t(section.title) }),
        t(section.lead) ? el("p", { class: "lead", text: t(section.lead) }) : null
      ])
    ]);
  }

  function renderHero(data) {
    var site = data.site;
    var src = asset(site.heroImage);
    var frame = el("div", { class: "hero-frame marks" });
    if (src) {
      var img = smartImg(src, t(site.heroAlt) || site.brand || "");
      img.setAttribute("fetchpriority", "high");
      frame.append(img);
    }
    var footBits = [];
    if (t(site.availability)) {
      footBits.push(el("p", { class: "avail" }, [
        el("span", { class: "dot", "aria-hidden": "true" }),
        el("span", { text: t(site.availability) })
      ]));
    }
    if (t(site.location)) footBits.push(el("p", { text: t(site.location) }));

    return el("header", { class: "hero", id: "top" }, [
      el("div", { class: "wrap" }, [
        el("h1", { class: "hero-title", text: site.brand || "NotSoToons" }),
        el("div", { class: "hero-grid" }, [
          el("div", { class: "hero-copy" }, [
            el("p", { class: "credit", text: t(site.credit) }),
            el("p", { class: "tagline", text: t(site.tagline) }),
            t(site.heroLead) ? el("p", { class: "hero-lead", text: t(site.heroLead) }) : null,
            el("div", { class: "cta-row" }, [
              el("a", { class: "btn", href: "#illustration", text: t(site.ctaWork) }),
              el("a", { class: "btn ghost", href: "#commissions", text: t(site.ctaCommissions) })
            ])
          ]),
          frame
        ]),
        footBits.length ? el("div", { class: "hero-foot" }, footBits) : null
      ])
    ]);
  }

  function renderIllustration(data) {
    var items = (data.illustrations && data.illustrations.items) || [];
    state.gallery = items;
    var body;
    if (!items.length) body = el("p", { class: "empty", text: t(ui("emptyIllustration")) });
    else {
      body = el("ul", { class: "gallery" });
      items.forEach(function (item, index) {
        var button = el("button", { class: "shot", type: "button" });
        var frame = el("div", { class: "frame" });
        var src = asset(item.image);
        if (src) {
          var img = smartImg(src, t(item.alt) || t(item.title));
          img.loading = "lazy";
          frame.append(img);
        }
        button.append(frame);
        var title = el("span", { class: "cap-title", text: t(item.title) });
        if (item.year) title.append(el("span", { class: "year", text: item.year }));
        var cap = el("span", { class: "cap" }, [
          title,
          t(item.caption) ? el("span", { class: "cap-meta", text: t(item.caption) }) : null
        ]);
        button.append(cap);
        button.addEventListener("click", function () { openLightbox(index); });
        body.append(el("li", {}, [button]));
      });
    }
    return el("section", { class: "block", id: "illustration" }, [
      chapter(data.site.illustration),
      el("div", { class: "wrap section-body" }, [body])
    ]);
  }

  function renderAnimation(data) {
    var pack = data.animations || {};
    var videos = pack.videos || [];
    var grid = el("div", { class: "video-grid" });
    if (!videos.length && !pack.reel) grid.append(el("p", { class: "empty", text: t(ui("emptyAnimation")) }));
    videos.forEach(function (item) { grid.append(player(item, false)); });
    var kids = [];
    if (pack.reel) kids.push(player(pack.reel, true));
    if (videos.length) kids.push(grid);
    else if (!pack.reel) kids.push(el("p", { class: "empty", text: t(ui("emptyAnimation")) }));
    return el("section", { class: "block", id: "animation" }, [
      chapter(data.site.animation),
      el("div", { class: "wrap section-body" }, kids)
    ]);
  }

  function player(item, reel) {
    var id = NTS.youtubeId(item.youtube);
    var pageUrl = NTS.safeUrl(item.url);
    var watchUrl = id ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id) : pageUrl;
    var frame = el("div", { class: "player " + (reel ? "reel-player" : "card-player") });
    var src = asset(item.poster);
    if (src) {
      var img = smartImg(src, t(item.title));
      img.loading = reel ? "eager" : "lazy";
      frame.append(img);
    }
    if (!id) frame.append(el("p", { class: "pending", text: t(ui("noEmbed")) }));
    if (id || watchUrl) {
      var play = el("button", {
        class: "play",
        type: "button",
        "aria-label": t(ui(id ? "watch" : "watchOnYoutube"))
      });
      play.append(el("span", { class: "tri", "aria-hidden": "true" }));
      play.addEventListener("click", function () {
        if (id) mountIframe(frame, id, t(item.title));
        else if (watchUrl) window.open(watchUrl, "_blank", "noopener,noreferrer");
      });
      frame.append(play);
    }
    var copy = [
      el("h3", { text: t(item.title) }),
      t(item.description) ? el("p", { text: t(item.description) }) : null
    ];
    if (watchUrl) copy.push(extLink(watchUrl, t(ui("watchOnYoutube")), "text-link"));
    frame.append(el("div", { class: "player-copy" }, copy));
    return frame;
  }

  function mountIframe(frame, id, title) {
    if (frame.querySelector("iframe")) return;
    frame.classList.add("is-playing");
    frame.append(el("iframe", {
      src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0",
      title: title || "YouTube",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      allowfullscreen: "true",
      referrerpolicy: "strict-origin-when-cross-origin"
    }));
  }

  function renderGames(data) {
    var items = (data.games && data.games.items) || [];
    var split = splitGames(items);
    var kids = [];
    if (!split.feature && !split.rest.length) {
      kids.push(el("p", { class: "empty", text: t(ui("emptyGames")) }));
    } else {
      if (split.feature) kids.push(featureCard(split.feature));
      if (split.rest.length) {
        var grid = el("div", { class: "game-grid" });
        split.rest.forEach(function (item) { grid.append(gameCard(item)); });
        kids.push(grid);
      }
    }
    return el("section", { class: "block", id: "games" }, [
      chapter(data.site.games),
      el("div", { class: "wrap section-body" }, kids)
    ]);
  }

  function splitGames(items) {
    var featured = [];
    var rest = [];
    (items || []).forEach(function (item) {
      if (item && item.featured) featured.push(item);
      else rest.push(item);
    });
    if (!featured.length && items && items.length) return { feature: items[0], rest: items.slice(1) };
    return { feature: featured[0] || null, rest: rest.concat(featured.slice(1)) };
  }

  function mediaFrame(item, featured) {
    var frame = el("div", { class: "feature-media marks" });
    var src = asset(item.image);
    if (src) {
      var img = smartImg(src, t(item.imageAlt) || t(item.title));
      img.loading = "lazy";
      frame.append(img);
    }
    if (featured) frame.append(el("span", { class: "badge", text: t(ui("featured")) }));
    return frame;
  }

  function gameBits(item) {
    var bits = [item.engine, item.year, t(item.role)].filter(Boolean);
    var tags = (item.tags || []).filter(Boolean);
    return [
      t(item.status) ? el("p", { class: "game-meta", text: t(item.status) }) : null,
      el("h3", { text: t(item.title) }),
      t(item.summary) ? el("p", { text: t(item.summary) }) : null,
      tags.length ? el("ul", { class: "tags" }, tags.map(function (tag) { return el("li", { text: tag }); })) : null,
      bits.length ? el("p", { class: "game-meta", text: bits.join(" · ") }) : null,
      projectLink(item)
    ];
  }

  function featureCard(item) {
    return el("article", { class: "feature" }, [
      mediaFrame(item, true),
      el("div", { class: "feature-copy" }, gameBits(item))
    ]);
  }

  function gameCard(item) {
    return el("article", { class: "game-card" }, [
      mediaFrame(item, false),
      el("div", {}, gameBits(item))
    ]);
  }

  function projectLink(item) {
    var href = NTS.safeUrl(item.url);
    if (href) return extLink(href, t(ui("viewProject")), "btn");
    return el("p", { class: "soon", text: t(ui("linkSoon")) });
  }

  function renderCommissions(data) {
    var pack = data.commissions || {};
    var items = pack.items || [];
    var grid = el("div", { class: "prices" });
    if (!items.length) grid = el("p", { class: "empty", text: t(ui("emptyPrices")) });
    items.forEach(function (item) {
      var price = NTS.formatPrice(item.price, pack.currency, state.lang);
      grid.append(el("article", { class: "price-card" }, [
        el("h3", { text: t(item.name) }),
        t(item.description) ? el("p", { text: t(item.description) }) : null,
        el("p", { class: "amount" }, [
          el("span", { class: "currency", text: price.code }),
          el("span", { class: "num", text: price.num })
        ]),
        t(item.unit) ? el("p", { class: "unit", text: t(item.unit) }) : null
      ]));
    });
    return el("section", { class: "block", id: "commissions" }, [
      chapter(data.site.commissions),
      el("div", { class: "wrap section-body" }, [
        grid,
        t(pack.note) ? el("p", { class: "fine-print", text: t(pack.note) }) : null
      ])
    ]);
  }

  function renderAbout(data) {
    var about = data.about || {};
    var src = asset(about.portrait);
    var portrait = el("div", { class: "portrait feature-media marks" });
    if (src) {
      var img = smartImg(src, t(about.portraitAlt) || about.fullName || "");
      img.loading = "lazy";
      portrait.append(img);
    }
    var facts = el("dl", { class: "facts" });
    (about.facts || []).forEach(function (fact) {
      facts.append(el("div", { class: "fact" }, [
        el("dt", { text: t(fact.label) }),
        el("dd", { text: t(fact.value) })
      ]));
    });
    var skills = el("ul", { class: "skills" });
    (about.skills || []).forEach(function (skill) {
      var label = t(skill);
      if (label) skills.append(el("li", { text: label }));
    });
    var prose = el("div", { class: "prose" }, paragraphs(about.body));
    return el("section", { class: "block", id: "about" }, [
      chapter(about),
      el("div", { class: "wrap section-body" }, [
        el("div", { class: "about-grid" }, [
          portrait,
          el("div", {}, [prose, skills.childNodes.length ? skills : null, facts.childNodes.length ? facts : null])
        ])
      ])
    ]);
  }

  function paragraphs(value) {
    return t(value).split(/\n{2,}/).map(function (part) {
      var trimmed = part.trim();
      return trimmed ? el("p", { text: trimmed }) : null;
    }).filter(Boolean);
  }

  function renderContact(data) {
    var contact = data.contact || {};
    var email = String(contact.email || "").trim();
    var mail = NTS.safeUrl("mailto:" + email);
    var emailNode = mail
      ? el("a", { class: "email", href: mail, text: email })
      : el("p", { class: "email", text: email });
    var socials = el("div", { class: "socials" });
    (contact.socials || []).forEach(function (item) {
      var href = NTS.safeUrl(item.url);
      if (!href) return;
      var row = el("a", { class: "social", href: href, target: "_blank", rel: "me noopener noreferrer" });
      row.append(el("span", { class: "net-mark", "aria-hidden": "true", text: netMark(item) }));
      var name = el("span", { class: "social-name", text: item.label || item.network || "" });
      var extra = t(ui("newTab"));
      if (extra) name.append(el("span", { class: "sr-only", text: " (" + extra + ")" }));
      row.append(name);
      if (item.handle) row.append(el("span", { class: "handle", text: item.handle }));
      socials.append(row);
    });
    return el("section", { class: "block", id: "contact" }, [
      chapter(contact),
      el("div", { class: "wrap section-body" }, [
        el("div", { class: "contact-grid" }, [
          el("div", {}, [
            emailNode,
            t(contact.note) ? el("p", { class: "fine-print", text: t(contact.note) }) : null,
            mail ? el("div", { class: "contact-actions" }, [el("a", { class: "btn", href: mail, text: t(ui("emailCta")) })]) : null
          ]),
          socials
        ])
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
    footer.replaceChildren(el("div", { class: "wrap footer-inner" }, [
      el("div", {}, [
        el("p", { class: "footer-brand", text: data.site.brand || "NotSoToons" }),
        el("p", { class: "credit", text: t(data.site.credit) })
      ]),
      el("p", { class: "footer-note", text: "© " + year + " · " + t(data.site.footerNote) })
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
    img.src = asset(item.image);
    img.alt = t(item.alt) || t(item.title);
    document.getElementById("lightbox-cap").textContent = [t(item.title), item.year, t(item.caption)].filter(Boolean).join(" — ");
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
