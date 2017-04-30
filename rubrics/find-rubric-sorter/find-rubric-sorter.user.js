// ==UserScript==
// @name        Find Rubric Sorter
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description This will reorder the Find a Rubric dialog so the current class is listed first as well as perform other filtering and sorting
// @include     /^https://.*\.instructure\.com/courses/[0-9]+/(assignments|quizzes|discussion_topics)/[0-9]+[?]?/
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var assignRegex = new RegExp('^/courses/[0-9]+/(assignments|quizzes|discussion_topics)/[0-9]+$');
  var assignMatch = assignRegex.test(window.location.pathname);
  if (!assignMatch) {
    return;
  }

  var config = {
    // sortOrder is the order to sort any courses after the current one, which
    // will always be placed first. See sortableKeys and predefinedSorts below.
    // The default sort is by name and then term (sortOrder 1)
    // 0 : do not sort
    // 1 : courses first, then sort by name, then term
    // 2 : courses first, then sort by term, then name
    // 3: accounts first, then sort by name, then term
    // You may add your own custom sort order by specifying an array of keys.
    // You may specify a + or - at the end of each key to sort in ascending or
    // descending order for that key. For example, the following line would
    // sort by contexts in ascending order, then course title, and then terms
    // 'sortOrder' : [ 'context+', 'title', 'term' ],
    'sortOrder' : 1,

    // courseLookup = true will attempt to look up the course information for
    // the courses. Setting this to false will cause all of
    // the configuration settings below except for sortOrder and hideAccounts to
    // be ignored. Default is true
    'courseLookup' : true,

    // addTerm = true will add the term name beneath the course name. Default
    // is true.
    'addTerm' : true,

    // removeCount = true will remove the rubric count and show just the term.
    // You may want to do this if your term names are really long and the
    // lines wrap or if all you care about is the term. Default is false.
    'removeCount' : false,

    // prependTerm = true will put the term in front of the rubric count and
    // false will put it after the rubric count. Default is true.
    'prependTerm' : true,

    // hideDays will hide any course that ended more than hiddenDays ago. To
    // disable hiding old courses and show all of them, leave this out or set
    // it to a negative value. Default is -1 to show all courses
    'hideDays' : -1,

    // hideUnknown = true will hide courses that do not appear in your
    // list of courses. Default is false
    'hideUnknown' : false,

    // hideAccounts = true will hide the account contexts and show only the
    // course contexts. Default is false
    'hideAccounts' : false,

    // hideNeverending = true will hide courses that belong to a term that does
    // not have an end date listed. This may be your default term, but there may
    // be other open terms. Default is false
    'hideNeverending' : false,

    // separator is the string to put between the rubric count and the term.
    // Default is the pipe symbol |
    'separator' : ' | '
  };

  // Global defines
  var sortableKeys = {
    'name' : 's+',
    'title' : 's+',
    'context' : 's-',
    'courseEnd' : 'd-',
    'courseStart' : 'd-',
    'termName' : 's-',
    'termStart' : 'd-',
    'termEnd' : 'd-',
    'term' : ':termEnd'
  };
  var predefinedSorts = {
    1 : [ 'context', 'name', 'term' ],
    2 : [ 'context', 'term', 'name' ],
    3 : [ 'context+', 'name', 'term' ],
  };
  var courses;
  var contextInfo = {};
  var contextRegex = contextRegex || new RegExp('^(account|course)_([0-9]+)$');
  var isCurrentFirst = false;

  checkDialog();

  function checkDialog() {
    var selector = 'ul.rubrics_dialog_contexts_select';
    var element = document.querySelector(selector);
    if (element) {
      checkList();
    } else {
      var dialogTarget = document.body;
      var dialogObserver = new MutationObserver(function(mutations) {
        var found = false;
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length === 1) {
            var node = mutation.addedNodes[0];
            if (node.querySelector(selector)) {
              found = true;
            }
          }
        });
        if (found) {
          dialogObserver.disconnect();
          checkList();
        }
      });
      dialogObserver.observe(dialogTarget, {
        'childList' : true
      });
    }
  }

  function checkList() {
    var selector = 'ul.rubrics_dialog_contexts_select';
    var element = document.querySelector(selector);
    if (element.children.length > 1) {
      processList();
    } else {
      var listObserver = new MutationObserver(function() {
        listObserver.disconnect();
        processList();
      });
      listObserver.observe(element, {
        'childList' : true
      });
    }
  }

  function doneLoading(a) {
    if (typeof doneLoading.loaded === 'undefined') {
      doneLoading.loaded = a;
    } else {
      if (a == 1) {
        loadCurrentContext();
      }
    }
  }

  function waitForLoad(element, a) {
    if (element.classList.contains('loaded')) {
      doneLoading(a);
    } else {

      var observer = new MutationObserver(function() {
        if (element.classList.contains('loaded')) {
          doneLoading(a);
          observer.disconnect();
        }
      });
      observer.observe(element, {
        'attributes' : true
      });
    }
  }

  function getName(item) {
    var name;
    if (typeof item !== 'undefined') {
      var el = item.querySelector('span.name');
      if (el) {
        name = el.textContent;
      }
    }
    return name;
  }

  function getContext(item) {
    var context;
    if (typeof item !== 'undefined') {
      var el = item.querySelector('span.context_code');
      if (el) {
        context = parseContextCode(el.textContent);
      }
    }
    return context;
  }

  function parseContextCode(code) {
    var item;
    var matches = contextRegex.exec(code);
    if (matches) {
      item = {
        'code' : code,
        'context' : matches[1],
        'id' : matches[2]
      };
    }
    return item;
  }

  function getContextList() {
    var selector = 'ul.rubrics_dialog_contexts_select li:not(.blank)';
    var list = document.querySelectorAll(selector);
    var context;
    if (list.length > 0) {
      for (var i = 0; i < list.length; i++) {
        context = getContext(list[i]);
        if (typeof contextInfo[context.code] === 'undefined') {
          contextInfo[context.code] = context;
          contextInfo[context.code].name = getName(list[i]);
        }
        contextInfo[context.code].row = i;
      }
    }
    return list;
  }

  function processList() {
    var list = getContextList();
    if (list.length > 1) {
      waitForLoad(list[0], 1);
      var parent = list[0].parentNode;
      var currentContext = 'course_' + ENV.COURSE_ID;
      if (parent && typeof contextInfo[currentContext] !== 'undefined') {
        isCurrentFirst = true;
        var currentPosition = contextInfo[currentContext].row;
        if (currentPosition > 0) {
          var current = list[currentPosition];
          var cur = parent.insertBefore(current, list[0]);
          waitForLoad(current, 2);
          cur.click();
        }
      }
    }
    if (typeof config.courseLookup === 'undefined' || config.courseLookup) {
      courses = new GetData('/api/v1/courses', addCourseInfo, {
        'data' : {
          'include' : [ 'term' ]
        },
        'perPage' : 50
      });
    } else {
      sortList();
    }
  }

  function loadCurrentContext() {
    var list = getContextList();
    if (list.length > 1) {
      list[0].click();
      // var context = 'course_' + ENV.COURSE_ID;
      // var item = list[contextInfo[context].row];
      // item.click();
    }
  }

  function determineSortOrder(userOrder) {
    if (typeof userOrder === 'undefined' || typeof sortableKeys !== 'object') {
      return false;
    }
    var sortOrder;
    var keyRegex = new RegExp('^([a-zA-Z]+)([+-])?$');
    var keyInfoRegex = new RegExp('^([sd])([+-])$');
    var matches;
    if (typeof userOrder !== 'object' && (/^[0-9]+$/.test(userOrder))) {
      if (typeof predefinedSorts[userOrder] !== 'undefined') {
        userOrder = predefinedSorts[userOrder];
      }
    }
    var key;
    var asc;
    var type;
    if (Array.isArray(userOrder)) {
      sortOrder = [];
      for (var k = 0; k < userOrder.length; k++) {
        matches = keyRegex.exec(userOrder[k]);
        if (matches) {
          key = matches[1];
          // Resolve aliases
          while (typeof sortableKeys[key] !== 'undefined' && /^[:]/.test(sortableKeys[key])) {
            key = sortableKeys[key].substr(1);
          }
          if (typeof sortableKeys[key] !== 'undefined') {
            var keyInfo = keyInfoRegex.exec(sortableKeys[key]);
            type = 's';
            if (keyInfo) {
              type = keyInfo[1];
              asc = keyInfo[2] === '+' ? true : false;
            }
            if (typeof matches[2] !== 'undefined') {
              asc = matches[2] === '+' ? true : false;
            }
            sortOrder.push({
              'key' : key,
              'asc' : asc,
              'type' : type
            });
          }
        }
      }
    }
    if (typeof sortOrder === 'undefined' || sortOrder.length === 0) {
      sortOrder = false;
    }
    return sortOrder;
  }

  function sortList() {
    hideContent();
    var keys = determineSortOrder(config.sortOrder);
    if (keys === false) {
      return;
    }
    var list = getContextList();
    if (typeof list === 'undefined' || list.length < (isCurrentFirst ? 3 : 2)) {
      // No point in sorting if there's only one item that can be sorted
      return;
    }
    var parent = list[0].parentNode;
    if (!parent) {
      return;
    }
    var currentContext = 'course_' + ENV.COURSE_ID;
    var items = [];
    var contextKeys = Object.keys(contextInfo);
    for (var i = 0; i < contextKeys.length; i++) {
      if (typeof contextInfo[contextKeys[i]].hidden === 'undefined' || contextInfo[contextKeys[i]].hidden === false) {
        items.push(contextKeys[i]);
      }
    }
    items.sort(multisort);
    var rows = [];
    var row;
    for (var k = 0; k < items.length; k++) {
      row = contextInfo[items[k]].row;
      rows.push(list[row]);
    }
    var start = isCurrentFirst ? 1 : 0;
    var top = list[start];
    for (k = rows.length - 1; k >= start; k--) {
      top = parent.insertBefore(rows[k], top);
      // top = rows[k];
    }
    if (!isCurrentFirst) {
      // Activate the top one
      waitForLoad(top, 2);
      top.click();
    }
    return;

    function multisort(a, b) {
      var A;
      var B;
      var order = 0;
      var current = (a === currentContext ? -1 : 0) + (b === currentContext ? 1 : 0);
      if (current !== 0) {
        return current;
      }
      var i = 0;
      while (order === 0 && i < keys.length) {
        var key = keys[i];
        i++;
        A = typeof contextInfo[a][key.key] === 'undefined' ? null : contextInfo[a][key.key];
        B = typeof contextInfo[b][key.key] === 'undefined' ? null : contextInfo[b][key.key];
        if (A === B) {
          continue;
        }
        if (A !== null && B !== null) {
          switch (key.type) {
          case 's':
            order = A.localeCompare(B);
            break;
          case 'd':
            order = A < B ? -1 : 1;
            break;
          }
        } else {
          order = A === null ? -1 : 1;
        }
        if (order !== 0 && !key.asc) {
          order = -order;
        }
      }
      return order;
    }
  }

  function addCourseInfo() {
    var list = getContextList();
    if (list.length > 0) {
      var sep = typeof config.separator === 'undefined' ? ' | ' : config.separator;
      var addTerm = typeof config.addTerm === 'undefined' ? true : config.addTerm;
      var course;
      var courseCode;
      var context;
      for (var j = 0; j < courses.data.length; j++) {
        course = courses.data[j];
        courseCode = 'course_' + course.id;
        if (typeof contextInfo[courseCode] === 'undefined') {
          continue;
        }
        // This course is in context list
        context = contextInfo[courseCode];
        context.courseStart = course.start_at;
        context.courseEnd = course.end_at;
        var courseRow = context.row;
        var el = list[courseRow];
        if (course.name) {
          context.title = course.name;
          var anchor = el.querySelector('a');
          anchor.title = course.name;
        }
        if (addTerm && typeof course.term !== 'undefined') {
          context.termName = course.term.name;
          context.termStart = course.term.start_at;
          context.termEnd = course.term.end_at;
          var div = el.querySelector('div.rubrics');
          var rubricCount = div.textContent;
          var txt = '';
          if (typeof config.removeCount !== 'undefined' && config.removeCount) {
            txt = course.term.name;
          } else {
            if (typeof config.prependTerm === 'undefined' || config.prependTerm) {
              txt = course.term.name + sep + rubricCount;
            } else {
              txt = rubricCount + sep + course.term.name;
            }
          }
          div.textContent = txt;
        }
      }
    }
    sortList();
  }

  function hideContent() {
    var hideAccounts = typeof config.hideAccounts === 'undefined' ? false : config.hideAccounts;
    var hideUnknown = false;
    var hideDate = false;
    var hideNeverending = false;
    if (typeof config.courseLookup !== 'undefined') {
      hideUnknown = typeof config.hideUnknown === 'undefined' ? false : config.hideUnknown;
      if (typeof config.hideDays !== 'undefined' && config.hideDays >= 0) {
        var dt = new Date();
        dt.setDate(dt.getDate() - config.hideDays);
        hideDate = dt.toISOString().replace(/[.][0-9]{3}Z$/, 'Z');
      }
      hideNeverending = typeof config.hideNeverending === 'undefined' ? false : config.hideNeverending;
    }
    var list = getContextList();
    var codes = Object.keys(contextInfo);
    var context;
    var hidden;
    var hiddenCount = 0;
    for (var i = 0; i < codes.length; i++) {
      hidden = false;
      context = contextInfo[codes[i]];
      if (context.context === 'course' && context.id === ENV.COURSE_ID) {
        continue;
      }
      if (hideAccounts && context.context === 'account') {
        hidden = true;
      }
      if (hideUnknown && context.context === 'course' && typeof context.title === 'undefined') {
        hidden = true;
      }
      if (hideDate !== false && context.context === 'course' && context.courseEnd && context.courseEnd < hideDate) {
        hidden = true;
      }
      if (hideNeverending && context.context === 'course' && context.termEnd === null) {
        hidden = true;
      }
      if (hidden) {
        context.hidden = true;
        hiddenCount++;
      }
    }
    if (hiddenCount < codes.length) {
      for (i = 0; i < codes.length; i++) {
        context = contextInfo[codes[i]];
        if (typeof context.hidden !== 'undefined' && context.hidden) {
          list[context.row].style.display = 'none';
        }
      }
    }
  }

  function GetData(url, finishedFunction, opts) {
    if (typeof this === 'undefined') {
      throw new Error('GetData must be invoked with a new statement');
    }
    var finished = typeof finishedFunction === 'function' ? finishedFunction : false;

    // Options that can be specified
    // filter: a function that will be passed the data item and should return
    // true if the item should be kept
    // fetchAll: a boolean that will load all of the data if true (default) or
    // just the first page (if false). May be useful for testing purposes
    // perPage: an integer that says how many items to load per page. The
    // default is 100. To skip this and use the Canvas default, specify 0.
    // timeout: the number of milliseconds to wait for a request to return,
    // the default is 2000 (2 seconds)
    // data: is an object that is passed on to the jQuery AJAX call so
    // that you can specify extra parameters
    // deferReady: hold off on marking the data done when loaded and allow
    // other code to make that determination
    var options = {
      'filter' : false,
      'fetchAll' : true,
      'perPage' : 100,
      'timeout' : 2000,
      'data' : undefined,
      'deferReady' : false
    };
    if (typeof opts === 'object') {
      for ( var prop in opts) {
        if (opts.hasOwnProperty(prop) && options.hasOwnProperty(prop)) {
          options[prop] = opts[prop];
        }
      }
    }
    if (options.perPage > 0) {
      if (typeof options.data === 'undefined') {
        options.data = {};
      }
      if (typeof options.data.per_page === 'undefined') {
        options.data.per_page = options.perPage;
      }
    }
    var pending = 0;
    this.isReady = false;
    this.data = undefined;
    var parent = this;
    try {
      (function getUrl() {
        pending++;
        $.ajax({
          'url' : url,
          'dataType' : 'json',
          'data' : options.data,
          'timeout' : options.timeout
        }).done(function(d, status, jqXHR) {
          url = nextURL(jqXHR.getResponseHeader('Link'));
          var valid;
          if (typeof d === 'object') {
            if (Array.isArray(d)) {
              if (typeof parent.data === 'undefined') {
                parent.data = [];
              }
              for (var i = 0; i < d.length; i++) {
                valid = true;
                if (typeof options.filter === 'function') {
                  valid = options.filter(d[i]);
                }
                if (valid) {
                  parent.data.push(d[i]);
                }
              }
            } else {
              if (typeof parent.data === 'undefined') {
                valid = true;
                if (typeof options.filter === 'function') {
                  valid = options.filter(d);
                }
                if (valid) {
                  parent.data = d;
                }
              }
            }
          }
          if (options.fetchAll && url) {
            getUrl();
          }
          pending--;
          if (pending <= 0) {
            if (!options.deferReady) {
              parent.isReady = true;
            }
            if (finished) {
              finished();
            }
          }
        }).fail(function() {
          pending--;
          throw new Error('Failed to load all of the data');
        });
      })();
    } catch (e) {
      console.log(e);
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

})();
