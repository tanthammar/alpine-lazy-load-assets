# Alpine.js - lazy load assets
[Alpine.js](https://alpinejs.dev/) directive to lazy load js and css assets.

This package is NOT meant to lazy load Alpine components. You will want to use [Async Alpine](https://async-alpine.dev/) for that.
It is however **the perfect complement to Async Alpine**. As it lazy loads all assets your Alpine.js component needs.

Assets are only loaded once (on a page), no matter how many times you use the directives.

Example from a Laravel project in combination with Async Alpine:
```html
<div
    x-load-js="[
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/{{ $locale }}.js'
    ]"
    x-load-css="[
        {{ asset('bundles/AlpineFlatPicker/AlpineFlatPicker.css') }},
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/{{ $theme }}.css
    ]"
    x-ignore
    ax-load="visible"
    ax-load-src="{{ asset('bundles/AlpineFlatPicker/AlpineFlatPicker.js') }}"
    x-data="AlpineFlatPicker(...)"
>
```