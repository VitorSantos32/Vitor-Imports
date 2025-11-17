(function (window) {
    function setCss(element, stylesOrKey, value) {
        var attributeValue;

        if ("object" === typeof stylesOrKey) {
            for (var key in stylesOrKey) {
                setCss(element, key, stylesOrKey[key]);
            }

            return;
        }

        if (element.style) {
            element.style.setProperty ? element.style.setProperty(stylesOrKey, "") : element.style.setAttribute(stylesOrKey, "");
            attributeValue = ("undefined" !== typeof element.style.cssText ? element.style.cssText : "") + stylesOrKey + ":" + value + " !important;";
        } else {
            attributeValue = stylesOrKey + ":" + value + " !important;";
        }

        element.setAttribute("style", attributeValue);
    }

    function getQueryVal(key) {
        key = key.replace(/[\[\]]/g, "\\$&");
        var result = (new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)")).exec(window.location.href);
        if (result === null || !result[2]) {
            return false;
        }

        return result[2] ? decodeURIComponent(result[2].replace(/\+/g, " ")) : false;
    }

    try {
        var body = document.getElementsByTagName("body")[0];
        var tracker = getQueryVal("tracker");
        var cubeSide = getQueryVal("cube-side");
        var xmT_1 = getQueryVal("t_1");

        /**
         * Skip another x3 sides of Cube format.
         */
        if (cubeSide !== false && cubeSide > 0) {
            return;
        }

        if (typeof body === "undefined" || !tracker) {
            return;
        }

        var href = window.atob(tracker);
        if (xmT_1) {
            var url = new URL(href, window.location.origin);
            url.searchParams.set('t_1', xmT_1);
            href = url.toString();
        }
        var iframe = document.createElement("iframe");

        iframe.id = "iftr";
        iframe.src = href;
        setCss(iframe, {width: "1px", height: "1px", position: "fixed", bottom: "0px", left: "0px", display: "none"});

        body.appendChild(iframe);

        /**
         * VTA
         */
        let params = new URL(document.location).searchParams;
        if (params.has("vta") && params.get("vta") !== "") {
            let iframe = document.createElement("iframe");
            iframe.src = window.atob(params.get("vta"));
            iframe.style.setProperty("width", "1px", "important");
            iframe.style.setProperty("height", "1px", "important");
            iframe.style.setProperty("position", "fixed", "important");
            iframe.style.setProperty("bottom", "0px", "important");
            iframe.style.setProperty("left", "0px", "important");
            iframe.style.setProperty("display", "none", "important");

            body.appendChild(iframe);
        }
    } catch (err) {
        console.error(err);
    }
}(window));
