// ==UserScript==
// @name        Remove Max Width
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Override CSS to lets pages expand to full width of page
// @include     https://*.instructure.com/courses/*
// @version     1
// @grant       GM_addStyle
// ==/UserScript==
(function () {
  try {
    GM_addStyle('body:not(.full-width) .ic-app-main-layout-vertical {max-width:none;}');
    GM_addStyle('body:not(.full-width):not(.outcomes) .ic-Layout-wrapper {max-width:none;}');
  } 
  catch (e) {
    console.log(e);
  }
}) ();
