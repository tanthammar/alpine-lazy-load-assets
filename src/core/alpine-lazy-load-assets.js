export default function (Alpine) {
    Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
        try {
            const paths = evaluate(expression)
            paths?.forEach( path => {
                // Check that the CSS file is not already loaded
                //console.info('wanting:' + path)
                if (document.querySelector(`link[href="${path}"]`)) {
                    return;
                }

                //the css file wasn't loaded
                //console.info('loading:' + path)

                // If the CSS file is not already loaded, create a new link element and append it to the head of the document
                const link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = path;

                // Check if the media attribute is set
                const mediaAttr = el.attributes?.media?.value
                if (mediaAttr) {
                    link.media = mediaAttr;
                }

                //Append the css file to the head of the document
                const head = document.getElementsByTagName("head")[0];
                head.appendChild(link);
            })
        } catch (error) {
            console.error(error);
        }
    });

    Alpine.directive("load-js", (el, { expression }, { evaluate }) => {
        try {
            const paths = evaluate(expression)
            paths?.forEach( path => {
                // Check that the JS file is not already loaded
                //console.info('wanting:' + path)
                if (document.querySelector(`script[src="${path}"]`)) {
                    return;
                }

                //The JS file wasn't loaded
                //console.info('loading:' + path)

                // If the JS file is not already loaded, create a new link element and append it to the head of the document
                const script = document.createElement("script");
                script.src = path;

                //Append the JS file to the head of the document
                const head = document.getElementsByTagName("head")[0];
                head.appendChild(script);
            })
        } catch (error) {
            console.error(error);
        }
    });
}