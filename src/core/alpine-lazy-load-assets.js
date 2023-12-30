export default function (Alpine) {
    // Initialize Alpine store for CSS and JS loading status
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

    // Function to load CSS file and mark it as loaded in the store
    async function loadCSS(path, mediaAttr, position = null, target = null) {
        if (
            document.querySelector(`link[href="${path}"]`)
            || Alpine.store('lazyLoadedAssets').check(path)
        ) {
            return
        }

        const link = document.createElement('link')
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = path

        if (mediaAttr) {
            link.media = mediaAttr
        }

        // if position and target are defined, position the link based on the target link
        if (position && target) {
            const targetLink = document.querySelector(`link[href*="${target}"]`)

            if (targetLink) {
                if (position === 'before') {
                    targetLink.parentNode.insertBefore(link, targetLink)
                } else if (position === 'after') {
                    if (targetLink.nextSibling) {
                        targetLink.parentNode.insertBefore(link, targetLink.nextSibling)
                    } else {
                        targetLink.parentNode.appendChild(link)
                    }
                }
            } else {
                console.warn(`Target (${target}) not found for ${path}. Appending to head.`)
                document.head.append(link)
            }
        } else {
            document.head.append(link)
        }

        await new Promise((resolve, reject) => {
            link.onload = () => {
                Alpine.store('lazyLoadedAssets').markLoaded(path)
                resolve()
            }

            link.onerror = () => {
                reject(new Error(`Failed to load CSS: ${path}`))
            }
        })
    }

    // Function to load JS file and mark it as loaded in the store
    async function loadJS(path, position, relativePosition = null, targetScript = null) {
        if (
            document.querySelector(`script[src="${path}"]`)
            || Alpine.store('lazyLoadedAssets').check(path)
        ) {
            return
        }

        const script = document.createElement('script')
        script.src = path

        if (relativePosition && targetScript) {
            const target = document.querySelector(`script[src*="${targetScript}"`)

            if (target) {
                if (relativePosition === 'before') {
                    target.parentNode.insertBefore(script, target)
                } else if (relativePosition === 'after') {
                    if (target.nextSibling) {
                        target.parentNode.insertBefore(script, target.nextSibling)
                    } else {
                        target.parentNode.appendChild(script)
                    }
                }
            } else {
                console.warn(`Target (${targetScript}) not found for ${path}. Appending to body.`)
                document.body.append(script)
            }
        } else {
            position.has('body-start')
                ? document.body.prepend(script)
                : document[position.has('body-end') ? 'body' : 'head'].append(script)
        }

        await new Promise((resolve, reject) => {
            script.onload = () => {
                Alpine.store('lazyLoadedAssets').markLoaded(path)
                resolve()
            }

            script.onerror = () => {
                reject(new Error(`Failed to load JS: ${path}`))
            }
        })
    }

    // Custom directive to load CSS and mark it as loaded in the store
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

    // Custom directive to load JS and mark it as loaded in the store
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
