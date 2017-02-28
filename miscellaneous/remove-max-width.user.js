// ==UserScript==
// @name        Remove Max Width
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Override CSS to lets pages expand to full width of page
// @include     https://*.instructure.com/courses/*
// @include     https://*.instructure.com/accounts/*
// @version     2
// @grant       GM_addStyle
// ==/UserScript==
(function () {
  try {
    // Do not run in iFrames
    if (window === parent.window) {
      GM_addStyle('body:not(.full-width):not(.outcomes) .ic-Layout-wrapper {max-width:none;}');
    }
  } 
  catch (e) {
    console.log(e);
  }
}) ();
