// ==UserScript==
// @name        Show Override Names
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Show the names of the students who have an assignment override
// @include     /^https://.*\.instructure\.com/courses/[0-9]+/(assignments|quizzes|discussion_topics)/[0-9]+(\?|$)/
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  // Change studentRegex for international support
  var studentRegex = new RegExp('^([0-9]+) student');
  var pending = -1;
  var userData = {};
  var overrides = [];
  var tableSelector = 'table.assignment_dates';
  check_page();

  function check_page() {
    var urlRegex = new RegExp('/courses/([0-9]+)/(assignments|quizzes|discussion_topics)/([0-9]+)');
    var matches = urlRegex.exec(window.location.href);
    if (!matches) {
      return;
    }
    var courseId = matches[1];
    var assignmentType = matches[2];
    var assignmentId = matches[3];
    if (assignmentType == 'discussion_topics') {
      tableSelector = 'table.discussion-topic-due-dates';
    }
    if ($(tableSelector)
      .length === 0) {
      return;
    }
    var isBeneficial = false;
    $(tableSelector + ' tr td:nth-child(2)')
      .each(function(i, e) {
        if (studentRegex.test(e.textContent)) {
          isBeneficial = true;
        }
      });
    if (!isBeneficial) {
      return;
    }
    if (assignmentType === 'assignments') {
      getAssignment(courseId, assignmentId);
    } else {
      var url = '/api/v1/courses/' + courseId + '/' + assignmentType + '/' + assignmentId;
      getAssignmentId(courseId, url);
    }
  }

  function nextURL(linkTxt) {
    var url = null;
    if (linkTxt) {
      var links = linkTxt.split(',');
      var nextRegEx = new RegExp('^<(.*)>; rel="next"$');
      for (var i = 0; i < links.length; i++) {
        var matches = nextRegEx.exec(links[i]);
        if (matches) {
          url = matches[1];
        }
      }
    }
    return url;
  }

  function getAssignmentId(courseId, url) {
    $.getJSON(url, function(data, status, jqXHR) {
      var assignmentId = data.assignment_id;
      getAssignment(courseId, assignmentId);
    });
  }

  function getAssignment(courseId, assignmentId) {
    var url = '/api/v1/courses/' + courseId + '/assignments/' + assignmentId + '/overrides?per_page=100';
    pending = 0;
    getAssignmentOverrides(courseId, url);
  }

  function getAssignmentOverrides(courseId, url) {
    pending++;
    $.getJSON(url, function(data, status, jqXHR) {
      url = nextURL(jqXHR.getResponseHeader('Link'));
      for (var i = 0; i < data.length; i++) {
        if (typeof data[i].student_ids !== 'undefined') {
          overrides.push(data[i]);
          for (var j = 0; j < data[i].student_ids.length; j++) {
            var userId = data[i].student_ids[j];
            userData[userId] = {
              'id': userId
            };
          }
        }
      }
      if (url) {
        getAssignmentOverrides(courseId, url);
      }
      pending--;
      if (pending <= 0) {
        getUsers(courseId);
      }
    });
  }

  function getUsers(courseId) {
    var userList = Object.getOwnPropertyNames(userData);
    if (userList.length === 0) {
      return;
    }
    // Batch name requests into groups of 50

    var chunkSize = 50;
    var chunk;
    var url;
    var i = 0;
    var n = userList.length;
    pending = 0;
    while (i < n) {
      chunk = userList.slice(i, i + chunkSize > n ? n : i + chunkSize)
        .map(function(e, i) {
          return 'user_ids[]=' + e;
        })
        .join('&');
      i += chunkSize;
      url = '/api/v1/courses/' + courseId + '/users?' + chunk + '&per_page=100';
      getUser(courseId, url);
    }
  }

  function getUser(courseId, url) {
    pending++;
    $.getJSON(url, function(data, status, jqXHR) {
      url = nextURL(jqXHR.getResponseHeader('Link'));
      for (var i = 0; i < data.length; i++) {
        var userId = data[i].id;
        // Check for existence of sortable name. Not sure if this is enabled for instututions who haven't turned the feature on so don't take chances
        if (typeof data[i].sortable_name === 'undefined' || !data[i].sortable_name) {
          data[i].sortable_name = data[i].name;
        }
        userData[userId] = data[i];
      }
      if (url) {
        getUser(courseId, url);
      }
      pending--;
      if (pending <= 0) {
        process(courseId);
      }
    });
  }

  function process(courseId) {
    var studentMatch;
    var datenames = [
      'due',
      'unlock',
      'lock'
    ];
    var items = [];
    var info;
    $(tableSelector + ' tbody tr td:nth-child(2)')
      .each(function(i, e) {
        studentMatch = studentRegex.exec(e.textContent);
        if (studentMatch) {
          info = {
            'size': studentMatch[1],
            'element': e
          };
          $('span:first', $(this)
              .siblings())
            .each(function(j, f) {
              info[datenames[j]] = f.textContent;
            });
          items.push(info);
        }
      });
    if (items.length > 0) {
      findMatch(items);
    }
  }

  function findMatch(itemList) {
    var matches;
    var count = 0;
    var items = {};
    var info,
      override;
    var i,
      j,
      k;
    var fmts = {
      'date': [
        'date.formats.short',
        'date.formats.medium'
      ],
      'time': [
        'time.formats.tiny',
        'time.formats.tiny_on_the_hour'
      ],
    };
    itemList.map(function(e, i) {
      items[i] = e;
    });
    // Attempt to identify the row with the override by checking characteristics
    // Repeat the process a few times because uniqueness may develop after eliminating other choices
    while (Object.keys(items)
      .length > 0 && count++ < 3) {
      // Check for unique number of students
      for (j in items) {
        if (items.hasOwnProperty(j)) {
          info = items[j];
          matches = [];
          for (i = 0; i < overrides.length; i++) {
            if (overrides[i].student_ids.length == info.size) {
              matches.push(i);
            }
          }
          if (matches.length == 1) {
            overrideNames(matches[0], info.element);
            delete items[j];
          }
        }
      }
      // Check for exact matches

      for (i = 0; i < overrides.length; i++) {
        override = overrides[i];
        for (j in items) {
          if (items.hasOwnProperty(j)) {
            info = items[j];
            if (isMatch(override.due_at, info.due, override.all_day) && isMatch(override.lock_at, info.lock) && isMatch(override.unlock_at, info.unlock)) {
              overrideNames(i, info.element);
              delete items[j];
            }
          }
        }
      }
      // Check for uniqueness in existence of information without looking at content

      for (j in items) {
        if (items.hasOwnProperty(j)) {
          info = items[j];
          matches = [];
          for (i = 0; i < overrides.length; i++) {
            override = overrides[i];
            var matchingItems = 0;
            matchingItems += (!override.due_at && info.due == '-') || (override.due_at && info.due != '-') ? 1 : 0;
            matchingItems += (!override.lock_at && info.lock == '-') || (override.lock_at && info.lock != '-') ? 1 : 0;
            matchingItems += (!override.unlock_at && info.unlock == '-') || (override.unlock_at && info.unlock != '-') ? 1 : 0;
            if (matchingItems === 3) {
              matches.push(i);
            }
          }
          if (matches.length == 1) {
            overrideNames(matches[0], info.element);
            delete items[j];
          }
        }
      }
      // Check for just one override left

      if (overrides.length == 1 && Object.keys(items)
        .length == 1) {
        j = Object.keys(items)[0];
        info = items[j];
        overrideNames(0, info.element);
        delete items[j];
      }
    }

    function isMatch(dt, txt, all_day) {
      // This script will try different combinations of date and time to match value
      if (txt == '-') {
        return dt ? false : true;
      } else if (!dt) {
        return false;
      }
      var isDate = false;
      var isTime = true;
      var i;
      var date;
      var time;
      var lpad = txt + ' ';
      var rpad = ' ' + txt;
      for (i = 0; i < fmts.date.length; i++) {
        date = I18n.toTime(fmts.date[i], dt) + ' ';
        if (lpad.substr(0, date.length) == date) {
          isDate = true;
          break;
        }
      }
      if (typeof all_day === 'undefined' || !all_day) {
        isTime = false;
        for (i = 0; i < fmts.time.length; i++) {
          time = I18n.toTime(fmts.time[i], dt);
          if (rpad.substr(-time.length) == time) {
            isTime = true;
            break;
          }
        }
      }
      return isDate && isTime;
    }
  }

  function overrideNames(index, e) {
    var override = overrides[index];
    overrides.splice(index, 1);
    var orderedIds = override.student_ids.sort(function(a, b) {
      return userData[a].sortable_name < userData[b].sortable_name ? -1 : 1;
    });
    var names = orderedIds.map(function(e, i) {
      return userData[e].name;
    });
    e.innerHTML = names.join(', ');
  }
})();
