import esbuild from 'esbuild'
async function build(src, opts) {
    const name = `alpine-lazy-load-assets.${ opts.name }.js`;

    console.log(`Building ${ name }`);

    return esbuild.build({
        entryPoints: [ `./src/${ src }` ],
        bundle: true,
        outfile: `./dist/${ name }`,
        platform: opts.platform,
        minify: opts.minify,
        target: opts.target,
        define: opts.define ?? {},
    });
}

async function buildAll() {
    return Promise.all([
        build('cdn.js', { name: 'cdn', platform: 'browser', target: [ 'es2020' ], minify: true, define: { CDN: true } }),
        build('module.js', { name: 'esm', platform: 'neutral', target: [ 'es2020' ], minify: false }),
        build('module.js', { name: 'cjs', platform: 'node', target: ['node10.4'], minify: false }),
    ]);
}

buildAll().catch(e => console.error(e));
