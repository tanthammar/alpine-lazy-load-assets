# Alpine.js - lazy load assets
This package provides directives for lazy loading JavaScript and CSS assets in [Alpine.js](https://alpinejs.dev/) projects.

**Note:** This package is specifically designed for lazy loading css/js assets but does **_not_** handle lazy loading of Alpine components. You could use [Async Alpine](https://async-alpine.dev/) for that. 
However, it is the perfect companion to use alongside Async Alpine to lazy load all the assets required by your Alpine.js components.

Assets are loaded only once per page, regardless of the number of times the directives are used.

## Installation

## CDN
Laravel Filament users, see end of page.
```html
<script 
    src="https://unpkg.com/alpine-lazy-load-assets@1.0.4/dist/alpine-lazy-load-assets.cdn.js" 
    defer
></script>
```


## NPM
```bash
npm install alpine-lazy-load-assets -D
```

To add the `x-load-css` and `x-load-js` directives to your project, register the plugin with Alpine.js.
```js
import Alpine from "alpinejs";
import AlpineLazyLoadAssets from "alpine-lazy-load-assets";

Alpine.plugin(AlpineLazyLoadAssets);

window.Alpine = Alpine;
window.Alpine.start();
```

## Usage

### x-load-js
The `x-load-js` directive adds a `<script>` tag to the `<head>` of your document.
```html
<div x-load-js="['/path/to/your/js/file.js']"></div>
```

### x-load-css
The `x-load-css` directive adds a `<link>` tag to the `<head>` of your document.
You can add a css link `media` attribute. 
**Warning**: Please note that when the media attribute is added to an element with multiple CSS files, it will be applied to all of them.
```html
<div x-load-css="['/path/to/your/css/file.css']"></div>
//or with media attribute
<div x-load-css="['/path/to/your/css/print-file.css']" media="print"></div>
```

## Multiple files
Both directives support an array of files, allowing you to load multiple assets simultaneously.

Example from a Laravel project in combination with Async Alpine:
```html
<div
    x-load-js="[
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/{{ $locale }}.js'
    ]"
    x-load-css="[
        '{{ asset('bundles/AlpineFlatPicker/AlpineFlatPicker.css') }}',
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/{{ $theme }}.css'
    ]"
    x-ignore
    ax-load="visible"
    ax-load-src="{{ asset('bundles/AlpineFlatPicker/AlpineFlatPicker.js') }}"
    x-data="AlpineFlatPicker(...)"
>
```

## Filament
[Laravel Filament](https://filamentphp.com/)

### Filament v3
This package is included from Filament v3.0.0-alpha102. (No need to do anything).

If you are on an earlier version or for other reasons need to add this manually ...
Add the following code to any service provider `register()` method.
```php
$this->app->resolving(AssetManager::class, function () {
    FilamentAsset::register([
        Js::make('alpine-lazy-load-assets', 'https://unpkg.com/alpine-lazy-load-assets@1.0.4/dist/alpine-lazy-load-assets.cdn.js'),
    ], 'app'); //change 'app' to a unique key suitable for your project
});
```

### Filament v2
Add the following code to any service providers `boot()` method.
```php
Filament::registerScripts([
    'https://unpkg.com/alpine-lazy-load-assets@1.0.4/dist/alpine-lazy-load-assets.cdn.js',
], true);
```
