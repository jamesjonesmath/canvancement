// ==UserScript==
// @name         Canvas Chat CSS Tweaks
// @namespace    https://github.com/jamesjonesmath/canvancement
// @description  Tweaks to Canvas Chat
// @version      1.0
// @author       James Jones <james@richland.edu>
// @match        https://chat.instructure.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const rules = [];
  rules.push('.ctf-message div.ctf-message__text-wrapper-sending { color: #990000; }');
  if (rules.length) {
    const style = document.createElement('style');
    document.head.appendChild(style);
    const sheet = style.sheet;
    for (let i = 0; i < rules.length; i++) {
      sheet.insertRule(rules[i],i);
    }
  }
})();
