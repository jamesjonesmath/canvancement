// ==UserScript==
// @name        Show Question Names
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Appends the name of the question to the Question number when viewing quiz results
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     2
// @grant none
// ==/UserScript==
(function() {
  'use strict';
  fetchQuestionNames();

  function fetchQuestionNames() {
    try {
      var form = document.getElementById('update_history_form');
      if (!form) {
        return;
      }
      var actionRegex = new RegExp('/courses/([0-9]+)/quizzes/([0-9]+)/submissions/([0-9]+)$');
      var match = actionRegex.exec(form.action);
      if (!match) {
        return;
      }
      var courseId = match[1];
      var quizId = match[2];
      var submissionId = match[3];
      var submissionVersion = form.querySelector('input[name="submission_version_number"]');
      var url = '/api/v1/courses/' + courseId + '/quizzes/' + quizId + '/questions';
      var parms = {
        'quiz_submission_id' : submissionId,
        'quiz_submission_attempt' : submissionVersion.value,
        'per_page' : 50
      };
      $.getJSON(url, parms, function(data, status, jqXHR) {
        paginationUrls(jqXHR, displayQuestionNames);
        displayQuestionNames(data);
      });
    } catch (e) {
      console.log(e);
    }
  }

  function displayQuestionNames(data) {
    try {
      var question, title;
      var i, j;
      var titleRegEx = new RegExp('^Question [0-9]+$');
      for (i = 0; i < data.length; i++) {
        if (data[i].question_name && data[i].question_name !== 'Question') {
          question = document.getElementById('question_' + data[i].id);
          title = question.querySelector('div.header span.name.question_name');
          for (j = 0; j < title.childNodes.length; j++) {
            if (title.childNodes[j].textContent && titleRegEx.test(title.childNodes[j].textContent)) {
              title.childNodes[j].textContent += ' : ' + data[i].question_name;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  function paginationUrls(jqXHR, callback) {
    var urls = null;
    try {
      var linkHeader = jqXHR.getResponseHeader('link');
      if (linkHeader) {
        var link = {};
        var validLinks = ['current','first','next','last'];
        var links = linkHeader.split(',');
        var urlRegex = new RegExp('<(.*)>');
        var relRegex = new RegExp('rel="([a-z]+)"');
        var urlMatch;
        var relMatch;
        for (var i = 0; i < links.length; i++) {
          relMatch = relRegex.exec(links[i]);
          urlMatch = urlRegex.exec(links[i]);
          if (relMatch && urlMatch) {
            var rel = relMatch[1];
            if (validLinks.indexOf(rel) > -1) {
              link[rel] = urlMatch[1];
            }
          }
        }
        if (link.next) {
          urls = [];
          var pageRegex = new RegExp('^(.*[?&]page=)([0-9]+)(.*)$');
          var nextMatch = pageRegex.exec(link.next);
          var lastMatch = pageRegex.exec(link.last);
          var startPage = nextMatch[2];
          var endPage = lastMatch[2];
          var url;
          for (var j = startPage; j <= endPage; j++) {
            url = nextMatch[1] + j + nextMatch[3];
            urls.push(url);
            if (typeof callback === 'function') {
              $.getJSON(url, callback);
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    return urls;
  }
})();
