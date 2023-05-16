// src/core/alpine-lazy-load-assets.js
function alpine_lazy_load_assets_default(Alpine) {
  Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
    try {
      const paths = evaluate(expression);
      paths?.forEach((path) => {
        if (document.querySelector(`link[href="${path}"]`)) {
          return;
        }
        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = path;
        const mediaAttr = el.attributes?.media?.value;
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
      paths?.forEach((path) => {
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
export {
  module_default as default
};
