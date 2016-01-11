// ==UserScript==  
// @name        Hide some URLs
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Hide the URL links within a "hide_url" class when printing from within Canvas
// @include     https://*.instructure.com/*
// @version     1  
// @grant       GM_addStyle  
// ==/UserScript==  
GM_addStyle('@media print { .hide_url a:link:after, .hide_url a:visited:after { content: none; }}');
