/* Pure helpers for language, base path, and media URLs.
   Asset paths stay relative (media/...) so a renamed GitHub user or repo still works. */
(function (root) {
  function pickLang(saved, navigatorLanguage) {
    if (saved === "es" || saved === "en") return saved;
    var lang = String(navigatorLanguage || "").toLowerCase();
    return lang.indexOf("es") === 0 ? "es" : "en";
  }

  function translate(value, lang) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value).trim();
    if (typeof value === "object") {
      var order = lang === "es" ? ["es", "en"] : ["en", "es"];
      for (var i = 0; i < order.length; i++) {
        var key = order[i];
        if (value[key] != null && String(value[key]).trim() !== "") return String(value[key]).trim();
      }
    }
    return "";
  }

  function baseFromPath(pathname) {
    var path = String(pathname || "/");
    if (path.charAt(0) !== "/") path = "/" + path;
    path = path.replace(/[^/]*\.[^/]*$/, "");
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return path;
  }

  function assetUrl(stored, base) {
    var value = String(stored || "").trim();
    if (!value) return "";
    if (/^(https?:)?\/\//i.test(value) || value.indexOf("data:") === 0 || value.indexOf("blob:") === 0) {
      return value;
    }
    var path = value.replace(/^\/+/, "");
    var seg = String(base || "/").replace(/^\/+|\/+$/g, "");
    if (seg && (path === seg || path.indexOf(seg + "/") === 0)) {
      path = path.slice(seg.length).replace(/^\/+/, "");
    }
    var b = base && base.charAt(base.length - 1) === "/" ? base : String(base || "/") + "/";
    if (b.charAt(0) !== "/") b = "/" + b;
    return b + path;
  }

  function youtubeId(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (/^[\w-]{11}$/.test(raw)) return raw;
    if (/^(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(raw)) {
      return youtubeId("https://" + raw.replace(/^\/\//, ""));
    }
    try {
      var url = new URL(raw);
      var host = url.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        var shortId = (url.pathname.split("/").filter(Boolean)[0] || "");
        return /^[\w-]{11}$/.test(shortId) ? shortId : "";
      }
      if (host === "youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) {
        var v = url.searchParams.get("v");
        if (v && /^[\w-]{11}$/.test(v)) return v;
        var parts = url.pathname.split("/").filter(Boolean);
        var markers = { embed: 1, shorts: 1, live: 1, v: 1 };
        for (var i = 0; i < parts.length; i++) {
          if (markers[parts[i]] && parts[i + 1] && /^[\w-]{11}$/.test(parts[i + 1])) return parts[i + 1];
        }
      }
    } catch (err) {
      return "";
    }
    return "";
  }

  function safeUrl(value) {
    var v = String(value || "").trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (/^mailto:/i.test(v)) {
      var address = v.slice(7).split("?")[0];
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return v;
    }
    return "";
  }

  function formatPrice(amount, currency, lang) {
    var n = Number(amount);
    var num = "";
    if (Number.isFinite(n)) {
      num = new Intl.NumberFormat(lang === "es" ? "es" : "en", { maximumFractionDigits: 2 }).format(n);
    }
    var code = String(currency || "USD").trim() || "USD";
    return { code: code, num: num, label: num ? code + " " + num : code };
  }

  root.NTS = {
    pickLang: pickLang,
    translate: translate,
    baseFromPath: baseFromPath,
    assetUrl: assetUrl,
    youtubeId: youtubeId,
    safeUrl: safeUrl,
    formatPrice: formatPrice
  };
})(typeof window !== "undefined" ? window : globalThis);
