var mierucaOptimize = function () {

    this.protocol = 'http:';

    this.getCombineCookie = (name) => {
        var cookie, valueSet = new Set();
        document.cookie.split('; ').forEach((el) => {
            let [k, v] = el.split('=');
            if (k.startsWith(name)) {
                valueSet.add(v);
            }
        })
        cookie = [...valueSet].join(';');
        return cookie;
    };

    this.getSessionIdFromCookie = (name) => {
        var cookies = document.cookie.split('; '),
        sessionId = '';
        for (var i = 0; i < cookies.length; i++) {
            let [k, v] = cookies[i].split('=');
            if (k.startsWith(name)) {
                sessionId = v.split('_')[1];
                break;
            }
        }
        return sessionId;
    };

    var url, urlParams, protocol,
    getCombineCookie = this.getCombineCookie;

    var reloadAbProcess = function() {
        window.__mieruca_optimize_queue = [];
        window.__mieruca_optimize.init();
    };

    this.init = () => {
        url = new URL(window.location.href),
        urlParams = url.searchParams,
        protocol = this.protocol,
        window.__mieruca_optimize_previousUrl = window.__mieruca_optimize_previousUrl || location.href;
        window.__mieruca_optimize_queue = window.__mieruca_optimize_queue || [];
        for (let i = 0; i < window.__optimizeid.length; i++) {
            let siteCode = window.__optimizeid[i][0];
            if (!window.__mieruca_optimize_queue.includes(siteCode)) {
                window.__mieruca_optimize_queue.push(siteCode);
                visualEditorCommunicate(siteCode);
                if (isHMCapture()) {
                    return;
                }
                handleCrossDomainParam();
                loadRedirectScript(siteCode);
                if (urlParams.has("_mo_ab_preview_mode")) {
                    loadViewModeScript(siteCode);
                } else if (urlParams.has("_mo_ab_preview_pid")) {
                    loadABPreviewScript(siteCode);
                } else {
                    loadABTestScript(siteCode);
                }
            }
        }
        if (!window.__mieruca_optimize_url_change_handler) {
            window.__mieruca_optimize_url_change_handler = true;
            moUrlChangeListener.bind(this)(reloadAbProcess, null);
        }
    };

    var loadRedirectScript = (siteCode) => {
        let a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = protocol + '//localhost:8080/redirect-url/embed'
        + '?siteId=' + moEncode(siteCode)
        + '&visitorUrl=' + moEncode(url.toString())
        + '&dv=' + moEncode(getDeviceType())
        + '&ck=' + moEncode(getCombineCookie("__MOR-"))
        + '&referUrl=' + moEncode(document.referrer)
        + '&ua=' + moEncode(navigator.userAgent)
        moAddElementScript(a);
    },
    loadABPreviewScript = (siteCode) => {
        let device = urlParams.get('dv') || getDeviceType();
        let a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = protocol + '//localhost:8080/ab/preview'
        + '?sId=' + moEncode(siteCode)
        + '&dv=' + moEncode(device)
        + '&pId=' + moEncode(urlParams.get('_mo_ab_preview_pid') || '');
        moAddElementScript(a);
    },
    loadABTestScript = (siteCode) => {
        let a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = protocol + '//localhost:8080/ab/embed'
        + '?siteId=' + moEncode(siteCode)
        + '&visitorUrl=' + moEncode(url.toString())
        + '&dv=' + moEncode(getDeviceType())
        + '&ck=' + moEncode(getCombineCookie("__MOAB-"))
        + '&ua=' + moEncode(navigator.userAgent)
        moAddElementScript(a);
    },
    loadViewModeScript = (siteCode) => {
        const urlObj = new URL(window.location.href);
        const params = new URLSearchParams(urlObj.search);
        params.delete('_mo_ab_preview_mode');
        urlObj.search = params.toString();
        let a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = protocol + '//localhost:8080/ab/view'
        + '?sId=' + moEncode(siteCode)
        + '&visitorUrl=' + moEncode(urlObj.toString())
        + '&pId=' + moEncode(urlParams.get('_mo_ab_preview_mode') || '')
        moAddElementScript(a);
    },

    getDeviceType = () => {
        var mobilePattern = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/,
        tabletPattern = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i,
        userAgent = navigator.userAgent;
        if (tabletPattern.test(userAgent)) {
            return "TABLET";
        }
        if (mobilePattern.test(userAgent)) {
            return "MOBILE";
        }
        return "DESKTOP";
    },

    isHMCapture = () => {
        var mierucaHMPattern = /MierucaHeatmap|fabercompany.co.jp/,
        userAgent = navigator.userAgent;
        return mierucaHMPattern.test(userAgent);
    },

    handleCrossDomainParam = () => {
        if (!urlParams.has("_mo")) {
            return;
        }
        var isCookieExisted = false;
        var parameterArrays = urlParams.get("_mo").split(";_;");
        parameterArrays.forEach(function(param) {
            var [cookieKey, cookieVal] = param.split(":");
            document.cookie.split('; ').forEach((el) => {
                let [k, v] = el.split('=');
                if (cookieKey === k && cookieVal === v) {
                    isCookieExisted = true;
                }
            });
            if (!isCookieExisted) {
                var date = new Date();
                date.setTime(date.getTime() + 93 * 24 * 60 * 60 * 1000);
                var expiresDateTime = date.toUTCString();
                var domain = "." + window.location.host.replace("www.", "");
                var encodeKey = moEncode(cookieKey), encodeVal = moEncode(cookieVal);
                document.cookie = `${encodeKey}=${encodeVal};domain=${domain};expires=${expiresDateTime};path=/;`;
            }
        });
        urlParams.delete('_mo');
        url.search = urlParams.toString();
    },

    visualEditorCommunicate = (siteCode) => {
        let parent = window.opener;
        if (!parent || !document.referrer || new URL(document.referrer).origin !== "http://localhost:8083") {
            return;
        }
        // Listen for messages from the sender tab
        window.addEventListener('message', (event) => {
            if (event.origin !== "http://localhost:8083") {
                return;
            }
            let dataMessage = event.data;
            switch (dataMessage.action) {
                case "VISUAL_EDITOR_SCRIPT" : {
                    if (dataMessage.status === "open" && dataMessage.code === siteCode) {
                        window.__mosCode = dataMessage.code;
                        event.source.postMessage({
                            "action" : "VISUAL_EDITOR_SCRIPT",
                            "status" : "ready"
                        },event.origin);
                        const encoding = document.characterSet;
                        const scriptBaseUrl = 'https://dev.opt.mieru-ca.com/service/js/mieruca-optimize-ve';
                        const encodingSuffix = (encoding === "UTF-8") ? '' : '-sjis';
                        const timestamp = new Date().getTime();
                        let a = document.createElement("script");
                        a.type = "text/javascript",
                        a.async = !0,
                        a.src = `${scriptBaseUrl}${encodingSuffix}.js?v=${timestamp}`;
                        moAddElementScript(a);
                    }
                }
            }
        });
    };
},
moObserverHandler = function (callbackFn, callbackArg, config = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true}) {
    // Observer DOM change
    let observer = new MutationObserver((mutations, observer) => {
        if (callbackFn) {
            callbackFn(callbackArg, mutations, observer);
        }
    });

    observer.observe(document.body, config);
    return observer;
},
moUrlChangeListener = function (callbackFn, callbackArg) {
    var moUrlChange = function () {
        if (location.href !== window.__mieruca_optimize_previousUrl) {
            window.__mieruca_optimize_previousUrl = location.href;
            // The URL has changed, do something here
            if (callbackFn) {
                callbackFn(callbackArg);
            }
        }
    };
    moObserverHandler(moUrlChange, null, {childList: true, subtree: true});
},
moGetELByXpath = (xpath) => {
    return document.evaluate(xpath, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
},
moWrap = (wrapper, el) => {
    moInsertBefore(el, wrapper);
    wrapper.appendChild(el);
},
moInsertAfter = (referenceNode, newNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
},
moInsertBefore = (referenceNode, newNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
},
moApplyChange = async (stacks, mutations, observer) => {
    try {
        let finalJS;
        for (let i = 0; i < stacks.length; i++) {
            let item = stacks[i];

            if (item.type === "CODE") {
                if (item.isCompleteSetting) {
                    continue;
                }
                if (item.css) {
                    moAppendCss(item.css);
                }
                if (item.html) {
                    document.body.outerHTML = item.html;
                }
                if (item.javaScript) {
                    try {
                        finalJS = item.javaScript;
                    } catch (error) {
                        console.log(error);
                    }
                }
                item.isCompleteSetting = true;
                continue;
            }

            let currentEle = moGetELByXpath(item.xpath);
            if (!currentEle) {
                continue;
            }
            if ((item.type === 'MOVE' || item.type === 'DUPLICATE')) {
                let desEle = moGetELByXpath(item.desXpath);
                if (!desEle) {
                    continue;
                }
            }
            if (item.isCompleteSetting) {
                continue;
            }
            item.isCompleteSetting = true;
            try {
                eval(item.script);
            } catch (error) {
                console.log(error);
            }
        }
        if (finalJS) {
            eval(finalJS);
        }
        if (observer) {
            let incompleteStacks = stacks.filter(stack => !stack.isCompleteSetting);
            if (incompleteStacks.length === 0) {
                observer.disconnect();
            }
        }
    } catch (error) {
        console.log(error)
    }
},
moAppendCss = (strCss) => {
    let eleStyle = document.getElementById("mo-visual-editor-style");
    if (eleStyle) {
        eleStyle.firstChild ? eleStyle.replaceChild(document.createTextNode(strCss), eleStyle.firstChild) : eleStyle.appendChild(document.createTextNode(strCss));
    } else {
        let e = document.createElement("style");
        e.type = "text/css", e.id = "mo-visual-editor-style",
        e.appendChild(document.createTextNode(strCss)),
        document.head.appendChild(e)
    }
},
moAddEventListeners = (stacks) => {
    stacks.forEach(item => {
        let elements = item.elFn();
        elements.forEach(el => {
            el.addEventListener("click", item.clFn);
        });
    });
},
moRemoveEventListeners = (stacks) => {
    stacks.forEach(item => {
        let elements = item.elFn();
        elements.forEach(el => {
            el.removeEventListener("click", item.clFn);
        });
    });
},
moEncode = (value) => {
    return encodeURIComponent(value);
},
moLinkageGoal = () => {
    var optimize = window.__mieruca_optimize,
    refId = window.__hmrid, urlId = window.__hmuid,
    sessionId = optimize.getSessionIdFromCookie("__MOAB-");
    if (refId && urlId && sessionId) {
        const e = optimize.protocol + "//localhost:8080/hm/record/goal?rId=" + moEncode(refId) + "&uId=" + moEncode(urlId) + "&sesId=" + moEncode(sessionId);
        fetch(e, {method: "GET", mode: "no-cors"}).then().catch((e => console.log(e)));
    }
},
moAddElementScript = (ele) => {
    let n = document.getElementsByTagName("script")[0];
    n ? n.parentNode.insertBefore(ele,n) : document.head.appendChild(ele);
};
(function () {
    window.__mieruca_optimize_queue = window.__mieruca_optimize_queue || [];
    window.__mieruca_optimize = new mierucaOptimize();
    window.__mieruca_optimize.init();
}());