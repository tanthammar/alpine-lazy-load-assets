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
  const assetLoadedEvent = (eventName) => new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    cancelable: true
  });
  const createDomElement = (elementType, attributes = {}, targetElement, insertBeforeElement) => {
    const element = document.createElement(elementType);
    Object.entries(attributes).forEach(([attribute, value]) => element[attribute] = value);
    if (targetElement) {
      if (insertBeforeElement) {
        targetElement.insertBefore(element, insertBeforeElement);
      } else {
        targetElement.appendChild(element);
      }
    }
    return element;
  };
  const loadAsset = (elementType, path, attributes = {}, targetElement = null, insertBeforeElement = null) => {
    const selector = elementType === "link" ? `link[href="${path}"]` : `script[src="${path}"]`;
    if (document.querySelector(selector) || Alpine.store("lazyLoadedAssets").check(path)) {
      return Promise.resolve();
    }
    const elementAttributes = elementType === "link" ? { ...attributes, href: path } : { ...attributes, src: path };
    const element = createDomElement(elementType, elementAttributes, targetElement, insertBeforeElement);
    return new Promise((resolve, reject) => {
      element.onload = () => {
        Alpine.store("lazyLoadedAssets").markLoaded(path);
        resolve();
      };
      element.onerror = () => {
        reject(new Error(`Failed to load ${elementType}: ${path}`));
      };
    });
  };
  const loadCSS = async (path, mediaAttr, position = null, target = null) => {
    const attributes = { type: "text/css", rel: "stylesheet" };
    if (mediaAttr) {
      attributes.media = mediaAttr;
    }
    let targetElement = document.head;
    let insertBeforeElement = null;
    if (position && target) {
      const targetLink = document.querySelector(`link[href*="${target}"]`);
      if (targetLink) {
        targetElement = targetLink.parentElement;
        insertBeforeElement = position === "before" ? targetLink : targetLink.nextSibling;
      } else {
        console.warn(`Target (${target}) not found for ${path}. Appending to head.`);
        targetElement = document.head;
        insertBeforeElement = null;
      }
    }
    await loadAsset("link", path, attributes, targetElement, insertBeforeElement);
  };
  const loadJS = async (path, position, relativePosition = null, targetScript = null, asModule = null) => {
    let targetElement = document.head;
    let insertBeforeElement = null;
    if (relativePosition && targetScript) {
      const targetScriptElement = document.querySelector(`script[src*="${targetScript}"]`);
      if (targetScriptElement) {
        targetElement = targetScriptElement.parentElement;
        insertBeforeElement = relativePosition === "before" ? targetScriptElement : targetScriptElement.nextSibling;
      } else {
        console.warn(`Target (${targetScript}) not found for ${path}. Falling back to head or body.`);
        targetElement = document.head;
        insertBeforeElement = null;
      }
    } else if (position.has("body-start") || position.has("body-end")) {
      targetElement = document.body;
      if (position.has("body-start")) {
        insertBeforeElement = document.body.firstChild;
      }
    }
    const attributes = {};
    if (asModule) {
      attributes.type = "module";
    }
    await loadAsset("script", path, attributes, targetElement, insertBeforeElement);
  };
  Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
    const paths = evaluate(expression);
    const mediaAttr = el.media;
    const eventName = el.getAttribute("data-dispatch");
    const position = el.getAttribute("data-css-before") ? "before" : el.getAttribute("data-css-after") ? "after" : null;
    const target = el.getAttribute("data-css-before") || el.getAttribute("data-css-after") || null;
    Promise.all(paths.map((path) => loadCSS(path, mediaAttr, position, target))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(`${eventName}-css`));
      }
    }).catch(console.error);
  });
  Alpine.directive("load-js", (el, { expression, modifiers }, { evaluate }) => {
    const paths = evaluate(expression);
    const position = new Set(modifiers);
    const relativePosition = el.getAttribute("data-js-before") ? "before" : el.getAttribute("data-js-after") ? "after" : null;
    const targetScript = el.getAttribute("data-js-before") || el.getAttribute("data-js-after") || null;
    const asModule = el.getAttribute("data-js-as-module") || el.getAttribute("data-as-module") || false;
    const eventName = el.getAttribute("data-dispatch");
    Promise.all(paths.map((path) => loadJS(path, position, relativePosition, targetScript, asModule))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(`${eventName}-js`));
      }
    }).catch(console.error);
  });
}

// src/module.js
var module_default = alpine_lazy_load_assets_default;
export {
  module_default as default
};
