// ==UserScript==  
// @name        Hide All URLs  
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Hide the URL links when printing a page 
// @include     https://*.instructure.com/courses/*/pages/*  
// @version     1  
// @grant       GM_addStyle  
// ==/UserScript==  
GM_addStyle('@media print { a:link:after, a:visited:after { content: none; }}');
