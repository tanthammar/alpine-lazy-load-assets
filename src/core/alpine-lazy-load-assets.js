export default function (Alpine) {
    Alpine.store('lazyLoadedAssets', {
        loaded: new Set(),
        check(paths) {
            return Array.isArray(paths)
                ? paths.every(path => this.loaded.has(path))
                : this.loaded.has(paths)
        },
        markLoaded(paths) {
            Array.isArray(paths)
                ? paths.forEach(path => this.loaded.add(path))
                : this.loaded.add(paths)
        }
    })

    //replicate Alpine.dispatch
    function assetLoadedEvent(eventName) {
        return new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            cancelable: true,
        })
    }

    function createDomElement(elementType, attributes = {}, targetElement, insertBeforeElement) {
        const element = document.createElement(elementType);

        for (const [attribute, value] of Object.entries(attributes)) {
            element[attribute] = value;
        }

        if (targetElement) {
            if (insertBeforeElement) {
                targetElement.insertBefore(element, insertBeforeElement);
            } else {
                targetElement.appendChild(element);
            }
        }

        return element;
    }

    function loadAsset(elementType, path, attributes = {}, targetElement = null, insertBeforeElement = null) {
        const selector = (elementType === 'link') ? `link[href="${path}"]` : `script[src="${path}"]`;

        if (document.querySelector(selector) || Alpine.store('lazyLoadedAssets').check(path)) {
            return Promise.resolve()
        }

        const element = createDomElement(elementType, { ...attributes, href: path }, targetElement, insertBeforeElement);

        return new Promise((resolve, reject) => {
            element.onload = () => {
                Alpine.store('lazyLoadedAssets').markLoaded(path);
                resolve();
            }

            element.onerror = () => {
                reject(new Error(`Failed to load ${elementType}: ${path}`));
            }
        });
    }

    async function loadCSS(path, mediaAttr, position = null, target = null) {
        // Define attributes for CSS link element
        const attributes = { type: 'text/css', rel: 'stylesheet' };
        if (mediaAttr) {
            attributes.media = mediaAttr;
        }

        // Determine target element and position
        let targetElement = document.head;
        let insertBeforeElement = null;
        if (position && target) {
            const targetLink = document.querySelector(`link[href*="${target}"]`)
            if (targetLink) {
                targetElement = targetLink.parentNode;
                insertBeforeElement = (position === 'before') ? targetLink : targetLink.nextSibling;
            } else {
                console.warn(`Target (${target}) not found for ${path}. Appending to head.`);
            }
        }

        await loadAsset('link', path, attributes, targetElement, insertBeforeElement);
    }

    async function loadJS(path, position, relativePosition = null, targetScript = null) {
        // Determine target element and position
        let positionElement, insertBeforeElement;
        if (relativePosition && targetScript) {
            positionElement = document.querySelector(`script[src*="${targetScript}"]`);
            if (positionElement) {
                insertBeforeElement = relativePosition === 'before'
                    ? positionElement
                    : positionElement.nextSibling;
            } else {
                console.warn(`Target (${targetScript}) not found for ${path}. Appending to body.`);
            }
        }

        const insertLocation = position.has('body-start') ? 'prepend' : 'append';

        await loadAsset('script', path, {}, positionElement || document[position.has('body-end') ? 'body' : 'head'], insertBeforeElement);
    }

    Alpine.directive('load-css', (el, { expression }, { evaluate }) => {
        const paths = evaluate(expression)
        const mediaAttr = el.media
        const eventName = el.getAttribute('data-dispatch')
        const position = el.getAttribute('data-css-before') ? 'before' : el.getAttribute('data-css-after') ? 'after' : null
        const target = el.getAttribute('data-css-before') || el.getAttribute('data-css-after') || null

        Promise.all(paths.map(path => loadCSS(path, mediaAttr, position, target)))
            .then(() => {
                //console.log('All CSS files loaded!')
                if (eventName) {
                    //console.log('dispatching event: ' + eventName + '-css')
                    window.dispatchEvent(assetLoadedEvent(eventName + '-css'))
                }
            })
            .catch((error) => {
                console.error(error)
            })
    })

    Alpine.directive('load-js', (el, { expression, modifiers }, { evaluate }) => {
        const paths = evaluate(expression)
        const position = new Set(modifiers)
        const relativePosition = el.getAttribute('data-js-before') ? 'before' : el.getAttribute('data-js-after') ? 'after' : null
        const targetScript = el.getAttribute('data-js-before') || el.getAttribute('data-js-after') || null

        const eventName = el.getAttribute('data-dispatch')

        Promise.all(paths.map(path => loadJS(path, position, relativePosition, targetScript)))
            .then(() => {
                //console.log('All JS files loaded!')
                if (eventName) {
                    //console.log('dispatching event: ' + eventName + '-js')
                    window.dispatchEvent(assetLoadedEvent(eventName + '-js'))
                }
            })
            .catch((error) => {
                console.error(error)
            })
    })
}
