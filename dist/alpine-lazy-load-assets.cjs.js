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
  Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
    try {
      const paths = evaluate(expression);
      paths == null ? void 0 : paths.forEach((path) => {
        var _a, _b;
        if (document.querySelector(`link[href="${path}"]`)) {
          return;
        }
        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = path;
        const mediaAttr = (_b = (_a = el.attributes) == null ? void 0 : _a.media) == null ? void 0 : _b.value;
        if (mediaAttr) {
          link.media = mediaAttr;
        }
        const head = document.getElementsByTagName("head")[0];
        head.appendChild(link);
      });
    } catch (error) {
      console.error(error);
    }
  });
  Alpine.directive("load-js", (el, { expression }, { evaluate }) => {
    try {
      const paths = evaluate(expression);
      paths == null ? void 0 : paths.forEach((path) => {
        if (document.querySelector(`script[src="${path}"]`)) {
          return;
        }
        const script = document.createElement("script");
        script.src = path;
        const head = document.getElementsByTagName("head")[0];
        head.appendChild(script);
      });
    } catch (error) {
      console.error(error);
    }
  });
}

// src/module.js
var module_default = alpine_lazy_load_assets_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
