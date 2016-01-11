// ==UserScript==  
// @name        No Print Links  
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Hide the links when printing  
// @include     https://*.instructure.com/courses/*/pages/*  
// @version     1  
// @grant       GM_addStyle  
// ==/UserScript==  
GM_addStyle('@media print { a:link:after, a:visited:after { content: none; }}');
