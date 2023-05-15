import AlpineLazyLoadAssets from './core/alpine-lazy-load-assets'

document.addEventListener('alpine:initializing', () => {
    AlpineLazyLoadAssets(window.Alpine)
})