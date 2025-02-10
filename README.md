# Alpine.js - lazy load assets
This package provides directives for lazy loading JavaScript and CSS assets in [Alpine.js](https://alpinejs.dev/) projects.

**Note:** This package is specifically designed for lazy loading css/js assets but does **_not_** handle lazy loading of Alpine components. You should use [Async Alpine](https://async-alpine.dev/) for that. 
However, it is the perfect companion to use alongside Async Alpine to lazy load all the assets required by your Alpine.js components.


## Features

- Lazily load CSS and JS files on-demand.
- Prevent redundant loading of the same asset.
- Saves loaded assets in Alpine global state to avoid reloading them, and to check asset existence.
- Position scripts in head, body-start or body-end.
- Optionally dispatch window events when assets have finished loading.

## Installation

## CDN
Laravel Filament users, see end of page.
```html
<script 
    src="https://unpkg.com/alpine-lazy-load-assets@latest/dist/alpine-lazy-load-assets.cdn.js" 
    defer
></script>
```


## NPM
```bash
npm install alpine-lazy-load-assets -D
```

#### Script Bundle
To add the `x-load-css` and `x-load-js` directives to your project, register the plugin with Alpine.js.
```js
import Alpine from 'alpinejs';
import AlpineLazyLoadAssets from 'alpine-lazy-load-assets';

Alpine.plugin(AlpineLazyLoadAssets);

window.Alpine = Alpine;
window.Alpine.start();
```

#### Script include
```js
import AlpineLazyLoadAssets from 'alpine-lazy-load-assets'

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(AlpineLazyLoadAssets)
})
```

#### Livewire v3
```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import AlpineLazyLoadAssets from 'alpine-lazy-load-assets';

Alpine.plugin(AlpineLazyLoadAssets);

Livewire.start();
```
# Usage

### x-load-js
* The `x-load-js` directive adds a `<script>` tag to the `head` or `body` of your document.
* The script can be loaded as a module by adding the `data-js-as-module="true"` attribute.
* You can also position the script before or after an existing script. You don't have to supply a full path, the script searches for a script tag that **contains** the given value.
```html
//appended to <head>
<div x-load-js="['/path/to/your/js/file.js']"></div>

//prepended to <body>
<div x-load-js.body-start="['/path/to/your/js/file.js']"></div>

//appended to <body>
<div x-load-js.body-end="['/path/to/your/js/file.js']"></div>

//load as module
<div data-js-as-module="true" x-load-js="['/path/to/your/js/file.js']"></div>

//position before an existing script. 
<div data-js-before="app.js" x-load-js="['/path/to/your/js/file.js']"></div>

//position after an existing script. 
<div data-js-after="app.js" x-load-js="['/path/to/your/js/file.js']"></div>
```

### x-load-css
* The `x-load-css` directive adds a `<link>` tag to the `<head>` of your document. 
* You can add a css link `media` attribute. 
* **Warning**: Please note that when the media attribute is added to an element with multiple CSS files, it will be applied to all of them.
* You can also position the link before or after an existing css link. You don't have to supply a full path, the script searches for a css link that **contains** the given value.
```html
<div x-load-css="['/path/to/your/css/file.css']"></div>

//or with media attribute
<div media="print" x-load-css="['/path/to/your/css/print-file.css']"></div>

//position before an existing css link.
<div data-css-before="app.css" x-load-css="['/path/to/your/css/file.css']"></div>

//position after an existing css link.
<div data-css-after="app.css" x-load-css="['/path/to/your/css/file.css']"></div>
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
    x-load="visible"
    x-load-src="{{ asset('bundles/AlpineFlatPicker/AlpineFlatPicker.js') }}"
    x-data="AlpineFlatPicker(...)"
>
```

## Window events
Define a `data-dispatch` attribute with an event name, to the same element as the css or js directives to dispatch a window event when the asset has finished loading.
The script will append `-css` or `-js` to the event name, depending on which directive is used.
- The event will be dispatched once **for each file path**
- **_Beware that the event may be emitted multiple times._** If you have multiple elements that pushes the same asset, on the same page.
```html
<div
    data-dispatch="foo-loaded"
    x-load-js="['/path/to/your/js/foo.js']"
    x-load-css="['/path/to/your/css/foo.css']"
></div>

//listen for the event, observe the -css or -js suffix
<div x-on:foo-loaded-css.window="alert('the CSS file was loaded')"></div>
<div x-on:foo-loaded-js.window="alert('the JS file was loaded')"></div>
```

### Example handling multiple window events
In a Laravel blade file
```html
    <div data-js-before="app.js"
         x-load-js="['{{ asset('js/jsoneditor.js') }}']"
         data-dispatch="jsoneditor-loaded"
         x-on:jsoneditor-loaded-js.window="start"
         x-data="{
            editor: null,
            destroy() {
                this.editor = null;
            },
            start() {
                $nextTick(() => {
                    if(!this.editor && typeof JSONEditor !== 'undefined') {
                        const options = {}
                        this.editor = new JSONEditor($refs.editor, options);
                    }
                });
            }
        }"
    >
```

## Global state, check if assets are loaded
The loaded assets are saved in `lazyLoadedAssets` global state, allowing you to `check` if an asset has already been loaded.
```js
//in any Alpine component
$store.lazyLoadedAssets.check('path/foo.js'); //returns boolean

//you can check multiple files at once
$store.lazyLoadedAssets.check(['path/foo.js', 'path/bar.css']);
```
Example from a Laravel blade file
```html
<div x-on:loaded-map-css.window="console.info($store.lazyLoadedAssets.check('{{ asset('css/foo.css') }}'))"></div>
```


## [Laravel Filament](https://filamentphp.com/)

### Filament v3
This package is included from Filament v3.0.0-alpha102. (No need to do anything).

If you are on an earlier version or for other reasons need to add this manually ...
Add the following code to any service provider `register()` method.
```php
$this->app->resolving(AssetManager::class, function () {
    FilamentAsset::register([
        Js::make('alpine-lazy-load-assets', 'https://unpkg.com/alpine-lazy-load-assets@latest/dist/alpine-lazy-load-assets.cdn.js'),
    ], 'app'); //change 'app' to a unique key suitable for your project
});
```

### Filament v2
Add the following code to any service providers `boot()` method.
```php
Filament::registerScripts([
    'https://unpkg.com/alpine-lazy-load-assets@latest/dist/alpine-lazy-load-assets.cdn.js',
], true);
```

### Contributing
Contributions are welcome! If you find a bug, have an enhancement idea, or want to contribute in any other way, please open an issue or submit a pull request.

### License
This project is licensed under the MIT License.
