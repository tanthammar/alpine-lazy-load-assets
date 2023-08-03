var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/module.js
__export(exports, {
  default: () => module_default
});

// src/core/alpine-lazy-load-assets.js
function alpine_lazy_load_assets_default(Alpine) {
  Alpine.store("lazyLoadedAssets", {
    loaded: new Set(),
    check(paths) {
      return Array.isArray(paths) ? paths.every((path) => this.loaded.has(path)) : this.loaded.has(paths);
    },
    markLoaded(paths) {
      Array.isArray(paths) ? paths.forEach((path) => this.loaded.add(path)) : this.loaded.add(paths);
    }
  });
  function assetLoadedEvent(eventName) {
    return new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }
  async function loadCSS(path, mediaAttr) {
    if (document.querySelector(`link[href="${path}"]`) || Alpine.store("lazyLoadedAssets").check(path)) {
      return;
    }
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = path;
    if (mediaAttr) {
      link.media = mediaAttr;
    }
    document.head.append(link);
    await new Promise((resolve, reject) => {
      link.onload = () => {
        Alpine.store("lazyLoadedAssets").markLoaded(path);
        resolve();
      };
      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${path}`));
      };
    });
  }
  async function loadJS(path, position) {
    if (document.querySelector(`script[src="${path}"]`) || Alpine.store("lazyLoadedAssets").check(path)) {
      return;
    }
    const script = document.createElement("script");
    script.src = path;
    position.has("body-start") ? document.body.prepend(script) : document[position.has("body-end") ? "body" : "head"].append(script);
    await new Promise((resolve, reject) => {
      script.onload = () => {
        Alpine.store("lazyLoadedAssets").markLoaded(path);
        resolve();
      };
      script.onerror = () => {
        reject(new Error(`Failed to load JS: ${path}`));
      };
    });
  }
  Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
    const paths = evaluate(expression);
    const mediaAttr = el.media;
    const eventName = el.getAttribute("data-dispatch");
    Promise.all(paths.map((path) => loadCSS(path, mediaAttr))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(eventName + "-css"));
      }
    }).catch((error) => {
      console.error(error);
    });
  });
  Alpine.directive("load-js", (el, { expression, modifiers }, { evaluate }) => {
    const paths = evaluate(expression);
    const position = new Set(modifiers);
    const eventName = el.getAttribute("data-dispatch");
    Promise.all(paths.map((path) => loadJS(path, position))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(eventName + "-js"));
      }
    }).catch((error) => {
      console.error(error);
    });
  });
}

// src/module.js
var module_default = alpine_lazy_load_assets_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
