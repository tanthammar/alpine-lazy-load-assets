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
    async function loadCSS(path, mediaAttr) {
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

        document.head.append(link)

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
    async function loadJS(path, position) {
        if (
            document.querySelector(`script[src="${path}"]`)
            || Alpine.store('lazyLoadedAssets').check(path)
        ) {
            return
        }

        const script = document.createElement('script')
        script.src = path

        position.has('body-start')
            ? document.body.prepend(script)
            : document[position.has('body-end') ? 'body' : 'head'].append(script)

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

        Promise.all(paths.map(path => loadCSS(path, mediaAttr)))
            .then(() => {
                console.log('All CSS files loaded!')
                if (eventName) {
                    console.log('dispatching event: ' + eventName + '-css')
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

        const eventName = el.getAttribute('data-dispatch')

        Promise.all(paths.map(path => loadJS(path, position)))
            .then(() => {
                console.log('All JS files loaded!')
                if (eventName) {
                    console.log('dispatching event: ' + eventName + '-js')
                    window.dispatchEvent(assetLoadedEvent(eventName + '-js'))
                }
            })
            .catch((error) => {
                console.error(error)
            })
    })
}
