# Alpine.js - lazy load assets
[Alpine.js](https://alpinejs.dev/) directive to lazy load js and css assets.

This package is **_NOT_** meant to lazy load Alpine components. You will want to use [Async Alpine](https://async-alpine.dev/) for that.
It is however **the perfect complement to Async Alpine**, as it lazy loads all assets your Alpine.js component needs.

Assets are only loaded once (on a page), no matter how many times you use the directives.

## Installation

## CDN
```html
<script 
    src="https://unpkg.com/alpine-lazy-load-assets@1.0.2/dist/alpine-lazy-load-assets.cdn.js" 
    defer
></script>
```


## NPM
```bash
npm install alpine-lazy-load-assets -D
```

Add the `x-load-css` and `x-load-js` directives to your project by registering the plugin with Alpine.
```js
import Alpine from "alpinejs";
import AlpineLazyLoadAssets from "alpine-lazy-load-assets";

Alpine.plugin(AlpineLazyLoadAssets);

window.Alpine = Alpine;
window.Alpine.start();
```

## Usage

### x-load-js
The `x-load-js` directive will add a `<script>` tag to the `<head>` of your document.
```html
<div x-load-js="['/path/to/your/js/file.js']"></div>
```

### x-load-css
The `x-load-css` directive will add a `<link>` tag to the `<head>` of your document.
You can add media attributes to the `<link>` tag by adding a `media` attribute to the element.
**Warning**: adding the `media` attribute to an element with multiple css files will apply the media attribute to all files.
```html
<div x-load-css="['/path/to/your/css/file.css']"></div>
<div x-load-css="['/path/to/your/css/print-file.css']" media="print"></div>
```

## Multiple files
Both directives accept an array of files.

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