// ==UserScript==
// @name        Admin User Search Details
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Show the names of the students who have an assignment override
// @include     /^https://.*\.instructure\.com/accounts/[0-9]+/users(\?|$)/
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var css = '\
    ul.users li.user a { display: inline-block; width: 15em; overflow: hidden; vertical-align: middle;} \
    .login_id { display: inline-block; width: 8em; font-size: 90%; font-style: italic; padding-left: 2em; color: #666; overflow: hidden; vertical-align: middle;} \
    .sis_user_id { display: inline-block; width 8em; text-align: right; font-size: 90%; padding-left: 1em; color: #666; overflow: hidden; vertical-align: middle;} \
  ';
  var userRegex = new RegExp('/accounts/([0-9]+)/users/([0-9]+)');
  var userData = {};
  $('ul.users li.user a').each(function(i, e) {
    var match = userRegex.exec(e.href);
    if (match) {
      getUser(match[1], match[2]);
    }
  });

  function getUser(accountId, userId) {
    var url = '/api/v1/users/' + userId;
    $.getJSON(url, function(data, status, jqXHR) {
      var userId = data.id;
      userData[userId] = data;
      if (Object.keys(userData).length == 1) {
        $('head').append($('<style>').prop('type', 'text/css').html(css));
      }
      updateInfo(data);
    });
  }

  function updateInfo(user) {
    var userId = user.id;
    var info = [];
    if (typeof user.login_id !== 'undefined' && user.login_id) {
      info.push('<span class="login_id">' + user.login_id + '</span>');
    }
    if (typeof user.sis_user_id !== 'undefined' && user.sis_user_id) {
      info.push('<span class="sis_user_id">' + user.sis_user_id + '</span>');
    }
    if (info.length > 0) {
      $('li#user_' + userId).append(info.join(' '));
    }
  }

})();
