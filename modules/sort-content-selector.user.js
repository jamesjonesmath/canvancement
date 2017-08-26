// ==UserScript==
// @name        Sort Content Selector List
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Alphabetically sort the items in the content selector
// @include     https://*.instructure.com/courses/*/modules
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';

  var pageRegex = new RegExp('^/courses/[0-9]+/modules$');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  var itemTypes = [ 'assignments', 'discussion_topics', 'wiki_pages', 'quizs' ];

  for (var i = 0; i < itemTypes.length; i++) {
    var sel = '#' + itemTypes[i] + '_select select.module_item_select';
    if ($(sel + ' optgroup').length > 0) {
      sel += ' optgroup';
    }
    $(sel).each(function() {
      sortOptions($(this));
    });
  }

  function sortOptions(j) {
    var newRegex = new RegExp('^\\[ New');
    var numRegex = new RegExp('^([^0-9]*)([0-9.]+)');
    var options = $(j).children('option');
    if (options.length > 0) {
      options.sort(function(a, b) {
        var atxt = a.text;
        var btxt = b.text;
        if (newRegex.test(atxt)) {
          return -1;
        }
        if (newRegex.test(btxt)) {
          return 1;
        }
        var anum = numRegex.exec(atxt);
        var bnum = numRegex.exec(btxt);
        if (anum && bnum && anum[1] == bnum[1]) {
          return parseFloat(anum[2]) > parseFloat(bnum[2]) ? 1 : -1;
        }
        return atxt.localeCompare(btxt);
      });
      $(j).empty().append(options);
    }
  }
})();
