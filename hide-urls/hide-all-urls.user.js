// ==UserScript==  
// @name        Hide All URLs  
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Hide the URL links when printing from within Canvas page 
// @include     https://*.instructure.com/*  
// @version     1  
// @grant       GM_addStyle  
// ==/UserScript==  
GM_addStyle('@media print { a:link:after, a:visited:after { content: none; }}');
