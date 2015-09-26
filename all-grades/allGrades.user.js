// ==UserScript==
// @name        View All Grades for Student
// @namespace   https://github.com/jamesjonesmath/canvancement
// @include     /^https://.*\.instructure\.com/?.*/users/[0-9]+$/
// @version     1
// @grant       none
// ==/UserScript==
var regex = new RegExp('/users/([0-9]+)$');
var matches = regex.exec(document.location);
if (matches) {
  if ($('#jj_allgrades').length == 0) {
    var url = '/users/' + matches[1] + '/grades';
    $('#right-side-wrapper div').append('<a id="jj_allgrades" class="btn button-sidebar-wide" href="' + url + '"><i class="icon-gradebook"></i> View All Grades for Student</a>');
  }
}
