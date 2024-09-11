var stack = [{
  "type": "IMG",
  "isCompleteSetting": false,
  "xpath": "/html/body/div/section[2]/div/div/div/div/div[1]/a/div/img",
  "newXpath": "null",
  "script": "currentEle.setAttribute(`src`,`https://upload-opt.mieru-ca.com/useruploads/39101/images/129533fc32e3a56d391aa30c0429f2b4_ava.png`);currentEle.style.cssText+=`height:285px !Important;width:400px !Important;`;",
  "hash": "798e6570fc48a2943ea5e6dd2993e7f00d6bcc6e5c64a5a95900ce9628900244"
}, {
  "type": "ADD_TEXT",
  "isCompleteSetting": false,
  "xpath": "/html/body/div/section[1]/div/div/div/h2",
  "newXpath": "null",
  "script": "let spanEl=document.createElement('span');spanEl.style.cssText+=`color:magenta !Important;background-color:cyan !Important;`;abInsertAfter(currentEle,spanEl);let newAnchor=document.createElement('a');newAnchor.setAttribute(`href`,`https://example.com`);newAnchor.setAttribute(`target`,`_blank`);abWrap(newAnchor,spanEl);spanEl.innerHTML=`Mieruca Optimize Visual Editor`;",
  "hash": "5938ed6311c111dd77ec80908813e1346d8c782f6ff925d60b3514848db2031c"
}],
abGetELByXpath = (xpath) => {
  return document.evaluate(xpath, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
},
abWrap = (wrapper, el) => {
  abInsertBefore(el, wrapper);
  wrapper.appendChild(el);
},
abInsertAfter = (referenceNode, newNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
},
abInsertBefore = (referenceNode, newNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
},
hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}, applyChange = (isAddedElement) => {
  stack.forEach(async (item) => {
    let currentEle = abGetELByXpath(item.xpath);
    let currentEleHtml = currentEle.outerHTML;
    let hashData = await hashString(currentEleHtml).then(str => str);
    if (!currentEle || item.hash !== hashData) {
      item.isisCompleteSetting = false;
      return;
    }
    let newEle = abGetELByXpath(item.newXpath);
    if ((item.type === 'MOVE' || item.type === 'DUPLICATE') && !newEle) {
      item.isisCompleteSetting = false;
      return;
    }
    
    if (item.isisCompleteSetting) {
      return;
    }
    if (!isAddedElement) {
      item.isisCompleteSetting = true;
    }
    eval(item.script);
  });
};
(function() {
  var init = () => {
    applyChange(false);
    const observer = new MutationObserver((mutationsList, observer) => {
//      for (let mutation of mutationsList) {
//        if (mutation.type === 'childList') {
          applyChange(true);
//        }
//      }
    });
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    };
    observer.observe(document.body, config);
  }
  "complete"!==document.readyState?window.attachEvent?window.attachEvent("onload",init):window.addEventListener("load",init,!1):init();
}).call(this);