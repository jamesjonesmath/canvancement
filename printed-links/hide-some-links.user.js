// ==UserScript==  
// @name        No Print Links  
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Hide the links when printing  
// @include     https://*.instructure.com/courses/*/pages/*  
// @version     1  
// @grant       GM_addStyle  
// ==/UserScript==  
GM_addStyle('@media print { .no_print_links a:link:after, .no_print_links a:visited:after { content: none; }}');
