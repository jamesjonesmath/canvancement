// ==UserScript==
// @name        Add Name to Grades page
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Adds a users name to their all grades page
// @include     https://*.instructure.com/users/*/grades
// @version     2
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var includeSisId = true;
  var nameOrder = [ 'short_name', 'name', 'sortable_name' ];
  var regex = new RegExp('/users/([0-9]+)/grades$');
  var matches = regex.exec(document.location.pathname);
  if (matches) {
    var userId = matches[1];
    var options = {
      'credentials' : 'same-origin',
      'headers' : {
        'accept' : 'application/json'
      }
    };
    fetch('/api/v1/users/' + userId, options)
      .then(checkStatus)
      .then(parseJSON)
      .then(updatePage)
      .catch(function(error) {
        console.log('Unable to lookup user information ', error);
      });
  }

  function updatePage(data) {
    var name;
    for (var i = 0; i < nameOrder.length; i++) {
      var key = nameOrder[i];
      if (typeof data[key] !== 'undefined' && data[key]) {
        name = data[key];
        break;
      }
    }
    if (typeof name !== 'undefined') {
      // Change the title on the page
      var htmlTitle = document.title.split(':');
      if (htmlTitle.length === 2) {
        htmlTitle[1] = ' ' + name;
        document.title = htmlTitle.join(':');
      }
      // Change the breadcrumb
      var breadcrumb = document.querySelectorAll('nav#breadcrumbs ul li a');
      if (breadcrumb.length === 3) {
        var bcName = breadcrumb[1];
        bcName.href = '/users/' + userId;
        var bcNameText = bcName.querySelector('span');
        if (bcNameText) {
          bcNameText.textContent = name;
        }
        var bcGrades = breadcrumb[2];
        bcGrades.href = '/users/' + userId + '/grades';
      }
      // Change the First heading, include SIS if requested
      if (includeSisId && typeof data.sis_user_id !== 'undefined' && data.sis_user_id) {
        name += ' (' + data.sis_user_id + ')';
      }
      // Start with table and work backwards to find heading
      var table = document.querySelector('table.course_details.student_grades');
      if (table) {
        var heading = table.previousSibling;
        while (heading && heading.nodeName !== 'H2') {
          heading = heading.previousSibling;
        }
        if (heading) {
          heading.textContent = name;
        }
      }
    }
  }

  function parseJSON(response) {
    return response.json();
  }

  function checkStatus(response) {
    // From https://github.com/github/fetch
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

})();
