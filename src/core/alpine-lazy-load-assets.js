/**
 * This function initializes Alpine.js custom stores and directives for lazily loading CSS and JS assets.
 * @param {Object} Alpine - The Alpine.js instance
 */
export default function (Alpine) {
        // Create a store to keep track of loaded assets
    Alpine.store('lazyLoadedAssets', {
        loaded: new Set(),

        // Check if the assets (paths) are already loaded
        check(paths) {
            return Array.isArray(paths)
                ? paths.every(path => this.loaded.has(path))
                : this.loaded.has(paths)
        },

        // Mark the assets (paths) as loaded
        markLoaded(paths) {
            Array.isArray(paths)
                ? paths.forEach(path => this.loaded.add(path))
                : this.loaded.add(paths)
        }
    })

    /**
     * Replicated Alpine.dispatch functionality to create a custom event
     * @param {String} eventName - Name of the event to be dispatched
     * @returns {CustomEvent} - The custom event
     */
    const assetLoadedEvent = eventName => new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        cancelable: true,
    })

    /**
     * Helper function to create a DOM element with specified attributes and insert it at a specific position in the target element
     * @param {String} elementType - Type of the element to create (e.g., 'script', 'link')
     * @param {Object} attributes - Attributes to set on the created element
     * @param {HTMLElement} targetElement - Target element where the new element will be added
     * @param {HTMLElement} insertBeforeElement - Existing element before which the new element will be added
     * @returns {HTMLElement} - The created DOM element
     */
    const createDomElement = (elementType, attributes = {}, targetElement, insertBeforeElement) => {
        const element = document.createElement(elementType)
        Object.entries(attributes).forEach(([attribute, value]) => element[attribute] = value)

        if (targetElement) {
            if (insertBeforeElement) {
                targetElement.insertBefore(element, insertBeforeElement)
            } else {
                targetElement.appendChild(element)
            }
        }

        return element
    }

    /**
     * Helper function to load a CSS or JS asset
     * @param {String} elementType - Type of the element to create ('link' for CSS, 'script' for JS)
     * @param {String} path - Path to the asset
     * @param {Object} attributes - Attributes to set on the created element
     * @param {HTMLElement} targetElement - Target element where the asset element will be added
     * @param {HTMLElement} insertBeforeElement - Existing element before which the asset element will be added
     * @returns {Promise} - Resolves when the asset is loaded or rejects if loading fails
     */
    const loadAsset = (elementType, path, attributes = {}, targetElement = null, insertBeforeElement = null) => {
        const selector = elementType === 'link' ? `link[href="${path}"]` : `script[src="${path}"]`

        if (document.querySelector(selector) || Alpine.store('lazyLoadedAssets').check(path)) {
            return Promise.resolve()
        }

        const elementAttributes = elementType === 'link'
            ? { ...attributes, href: path }
            : { ...attributes, src: path }
        const element = createDomElement(elementType, elementAttributes, targetElement, insertBeforeElement)

        return new Promise((resolve, reject) => {
            element.onload = () => {
                Alpine.store('lazyLoadedAssets').markLoaded(path)
                resolve()
            }

            element.onerror = () => {
                reject(new Error(`Failed to load ${elementType}: ${path}`))
            }
        })
    }

    /**
     * Load a CSS file with specified options
     * @param {String} path - Path to the CSS file
     * @param {String} mediaAttr - Media attribute for the link element
     * @param {String} position - Specifies whether to insert the link element before or after a target link element
     * @param {String} target - Target link element before or after which the new link element will be inserted
     */
    const loadCSS = async (path, mediaAttr, position = null, target = null) => {
        // Define attributes for CSS link element
        const attributes = { type: 'text/css', rel: 'stylesheet' }
        if (mediaAttr) {
            attributes.media = mediaAttr
        }

        let targetElement = document.head
        let insertBeforeElement = null

        // Determine target element and position
        if (position && target) {

            // A certain link element has been targeted
            const targetLink = document.querySelector(`link[href*="${target}"]`)
            if (targetLink) {
                targetElement = targetLink.parentElement // Ensure we use the parent element for insertion
                insertBeforeElement = position === 'before' ? targetLink : targetLink.nextSibling
            } else {
                console.warn(`Target (${target}) not found for ${path}. Appending to head.`)
                targetElement = document.head
                insertBeforeElement = null
            }
        }

        await loadAsset('link', path, attributes, targetElement, insertBeforeElement)
    }

    /**
     * Load a JS file with specified options
     * @param {String} path - Path to the JS file
     * @param {Set<String>} position - Set containing position modifiers (e.g., 'body-start', 'body-end')
     * @param {String} relativePosition - Relative position to insert the new script element (before or after)
     * @param {String} targetScript - Target script element before or after which the new script element will be inserted
     */
    const loadJS = async (path, position, relativePosition = null, targetScript = null) => {
        // Default insertion point is head
        let targetElement = document.head
        let insertBeforeElement = null

        if (relativePosition && targetScript) {

            //A certain script element has been targeted
            const targetScriptElement = document.querySelector(`script[src*="${targetScript}"]`)
            if (targetScriptElement) {
                targetElement = targetScriptElement.parentElement // Ensure we use the parent element for insertion
                insertBeforeElement = relativePosition === 'before' ? targetScriptElement : targetScriptElement.nextSibling
            } else {
                console.warn(`Target (${targetScript}) not found for ${path}. Falling back to head or body.`)
                targetElement = document.head
                insertBeforeElement = null
            }

        } else if (position.has('body-start') || position.has('body-end')) {

            //the js should go into body
            targetElement = document.body
            if (position.has('body-start')) {
                insertBeforeElement = document.body.firstChild
            }
        }

        await loadAsset('script', path, {}, targetElement, insertBeforeElement)
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
                    window.dispatchEvent(assetLoadedEvent(`${eventName}-css`))
                }
            })
            .catch(console.error)
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
                    window.dispatchEvent(assetLoadedEvent(`${eventName}-js`))
                }
            })
            .catch(console.error)
    })
}