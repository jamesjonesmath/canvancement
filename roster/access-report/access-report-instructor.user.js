// ==UserScript==
// @name        Instructor Access Report Data
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for faculty in current courses in an account
// @match       https://*.instructure.com/accounts/*
// @version     3
// @grant       none
// ==/UserScript==
(function () {
  'use strict';

  // Only the account's main page, not its other pages
  var accountId = getAccountId();
  if (!accountId) {
    return;
  }

  // The most usage requests to have running at one time
  var maxConcurrent = 10;

  var courseData = {};
  var userData = {};
  var accessData = [];
  var fetched = 0;
  var needsFetched = 0;
  var controller = null;
  var aborted = false;
  addAccessReportButton();

  function addAccessReportButton() {
    if (document.getElementById('jj_instructor_access_report')) {
      return;
    }
    // Next to the account analytics button, or else at the end of the sidebar
    var parent = null;
    var rsMargins = document.querySelectorAll(
      'div#right-side-wrapper div.rs-margin-bottom'
    );
    for (var i = 0; i < rsMargins.length; i++) {
      if (rsMargins[i].querySelector('i.icon-analytics')) {
        parent = rsMargins[i];
        break;
      }
    }
    if (!parent) {
      parent = document.getElementById('right-side');
    }
    if (parent) {
      var anchor = document.createElement('a');
      anchor.id = 'jj_instructor_access_report';
      anchor.classList.add('Button', 'button-sidebar-wide');
      var icon = document.createElement('i');
      icon.classList.add('icon-analytics');
      anchor.appendChild(icon);
      var text = document.createTextNode(' Instructor Access Report Data');
      anchor.appendChild(text);
      parent.appendChild(anchor);
      activateLink();
    }
  }

  function activateLink() {
    document
      .getElementById('jj_instructor_access_report')
      .addEventListener('click', accessReport, { once: true });
  }

  function abortAll() {
    aborted = true;
    controller.abort();
    activateLink();
  }

  function accessReport() {
    aborted = false;
    controller = new AbortController();
    courseData = {};
    userData = {};
    accessData = [];
    fetched = 0;
    needsFetched = 0;
    // Current courses are those that have started and not yet ended
    var now = encodeURIComponent(new Date().toISOString());
    var url = [
      `/api/v1/accounts/${accountId}/courses?enrollment_type[]=teacher`,
      'include[]=teachers',
      'include[]=term',
      `starts_before=${now}`,
      `ends_after=${now}`,
      'per_page=100',
    ].join('&');
    progressbar();
    progressMessage('Fetching courses');
    getCourses(url)
      .then(getAccessReport)
      .then(makeReport)
      .catch(function (e) {
        // Cancel already closed the dialog and reset the link
        if (!aborted) {
          document.getElementById('jj_progress_dialog').close();
          activateLink();
          errorHandler(e);
        }
      });
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

  function getJson(url) {
    var options = {
      headers: {
        accept: 'application/json',
      },
      credentials: 'same-origin',
      signal: controller.signal,
    };
    return fetch(url, options).then(function (res) {
      if (!res.ok) {
        throw new Error(`Got an HTTP status of ${res.status} for ${url}`);
      }
      var next = nextURL(res.headers.get('link'));
      return res.json().then(function (data) {
        return { data: data, next: next };
      });
    });
  }

  function getCourses(url) {
    return getJson(url).then(function (res) {
      for (var i = 0; i < res.data.length; i++) {
        var course = res.data[i];
        var crs = {
          id: course.id,
          name: course.name,
          account_id: course.account_id,
          course_code: course.course_code,
          term: course.term.name,
          sis_course_id: course.sis_course_id,
          teachers: [],
        };
        if (course.teachers.length > 0) {
          for (var j = 0; j < course.teachers.length; j++) {
            var user = course.teachers[j];
            crs.teachers.push(user.id);
            if (typeof userData[user.id] === 'undefined') {
              userData[user.id] = {
                id: user.id,
                display_name: user.display_name,
                courses: [course.id],
              };
            } else {
              userData[user.id].courses.push(course.id);
            }
          }
        }
        courseData[course.id] = crs;
      }
      if (res.next) {
        return getCourses(res.next);
      }
    });
  }

  // Runs maxConcurrent workers, each taking the next teacher off the list
  function getAccessReport() {
    var jobs = [];
    for (var courseId in courseData) {
      if (courseData.hasOwnProperty(courseId)) {
        var course = courseData[courseId];
        for (var i = 0; i < course.teachers.length; i++) {
          jobs.push({ courseId: courseId, userId: course.teachers[i] });
        }
      }
    }
    needsFetched = jobs.length;
    progressMessage('Fetching access reports');
    progressbar(fetched, needsFetched);
    var workers = [];
    for (var w = 0; w < maxConcurrent; w++) {
      workers.push(nextJob());
    }
    return Promise.all(workers);

    function nextJob() {
      if (aborted || jobs.length === 0) {
        return Promise.resolve();
      }
      var job = jobs.shift();
      var url = `/courses/${job.courseId}/users/${job.userId}/usage?per_page=100`;
      return getAccesses(job.courseId, url)
        .catch(function (e) {
          if (aborted) {
            throw e;
          }
          console.log(`Some access report data failed to load: ${e.message}`);
        })
        .then(function () {
          fetched++;
          progressbar(fetched, needsFetched);
          return nextJob();
        });
    }
  }

  function getAccesses(courseId, url) {
    return getJson(url).then(function (res) {
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].asset_user_access.course_id = courseId;
        accessData.push(res.data[i]);
      }
      if (res.next) {
        return getAccesses(courseId, res.next);
      }
    });
  }

  function getAccountId() {
    var matches = /^\/accounts\/([0-9]+)$/.exec(window.location.pathname);
    return matches ? matches[1] : null;
  }

  function makeReport() {
    // Requests that finished just before Cancel still end up here
    if (aborted) {
      return;
    }
    progressbar();
    var csv = createCSV();
    // A byte order mark tells Excel the file is UTF-8, which only matters
    // when something in it isn't ASCII
    var bom = /[\u0080-\uffff]/.test(csv) ? '\ufeff' : '';
    var blob = new Blob([bom, csv], {
      type: 'text/csv;charset=utf-8',
    });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'access-report.csv';
    link.click();
    setTimeout(function () {
      URL.revokeObjectURL(link.href);
    }, 1000);
    activateLink();
  }

  function createCSV() {
    var fields = [
      {
        name: 'Course ID',
        src: 'c.id',
      },
      {
        name: 'SIS Course ID',
        src: 'c.sis_course_id',
        sis: true,
      },
      {
        name: 'Course Title',
        src: 'c.name',
      },
      {
        name: 'User ID',
        src: 'u.id',
      },
      {
        name: 'Display Name',
        src: 'u.display_name',
      },
      {
        name: 'Category',
        src: 'a.asset_category',
      },
      {
        name: 'Class',
        src: 'a.asset_class_name',
      },
      {
        name: 'Title',
        src: 'a.readable_name',
      },
      {
        name: 'Views',
        src: 'a.view_score',
      },
      {
        name: 'Participations',
        src: 'a.participate_score',
      },
      {
        name: 'Last Access',
        src: 'a.last_access',
        fmt: 'date',
      },
      {
        name: 'First Access',
        src: 'a.created_at',
        fmt: 'date',
      },
      {
        name: 'Action',
        src: 'a.action_level',
      },
      {
        name: 'Code',
        src: 'a.asset_code',
      },
      {
        name: 'Group Code',
        src: 'a.asset_group_code',
      },
      {
        name: 'Context Type',
        src: 'a.context_type',
        disabled: true,
      },
      {
        name: 'Context ID',
        src: 'a.context_id',
        disabled: true,
      },
    ];
    fields = fields.filter(function (f) {
      return !f.disabled;
    });
    var canSIS = false;
    for (var id in courseData) {
      if (courseData.hasOwnProperty(id)) {
        if (
          typeof courseData[id].sis_course_id !== 'undefined' &&
          courseData[id].sis_course_id
        ) {
          canSIS = true;
          break;
        }
      }
    }
    var CRLF = '\r\n';
    var hdr = [];
    fields.forEach(function (e) {
      if (typeof e.sis === 'undefined' || (e.sis && canSIS)) {
        hdr.push(e.name);
      }
    });
    var rows = [hdr.join(',')];
    var item, user, course, userId, fieldInfo, value, field, row;
    for (var i = 0; i < accessData.length; i++) {
      item = accessData[i].asset_user_access;
      userId = item.user_id;
      user = userData[userId];
      course = courseData[item.course_id];
      row = [];
      for (var j = 0; j < fields.length; j++) {
        if (typeof fields[j].sis !== 'undefined' && fields[j].sis && !canSIS) {
          continue;
        }
        fieldInfo = fields[j].src.split('.');
        field = fieldInfo[1];
        switch (fieldInfo[0]) {
          case 'a':
            value = item[field];
            break;
          case 'c':
            value = course[field];
            break;
          case 'u':
            value = user[field];
            break;
        }
        if (typeof value === 'undefined' || value === null) {
          value = '';
        } else {
          if (typeof fields[j].fmt !== 'undefined') {
            switch (fields[j].fmt) {
              case 'date':
                value = excelDate(value);
                break;
              default:
                break;
            }
          }
          value = addQuotes(value);
        }
        row.push(value);
      }
      rows.push(row.join(','));
    }
    // The empty string ends the file with a line break
    rows.push('');
    return rows.join(CRLF);
  }

  function addQuotes(value) {
    if (typeof value === 'string') {
      // Keep a spreadsheet from treating text as a formula
      if (/^[=+\-@\t\r]/.test(value)) {
        value = `'${value}`;
      }
      if (/[",\r\n]/.test(value)) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
    }
    return value;
  }

  function excelDate(timestamp) {
    var d = '';
    try {
      if (!timestamp) {
        return '';
      }
      timestamp = timestamp.replace('Z', '.000Z');
      var dt = new Date(timestamp);
      if (typeof dt !== 'object') {
        return '';
      }
      var dPart = [
        dt.getFullYear(),
        pad(1 + dt.getMonth()),
        pad(dt.getDate()),
      ].join('-');
      var tPart = [
        pad(dt.getHours()),
        pad(dt.getMinutes()),
        pad(dt.getSeconds()),
      ].join(':');
      d = `${dPart} ${tPart}`;
    } catch (e) {
      errorHandler(e);
    }
    return d;

    function pad(n) {
      return n < 10 ? `0${n}` : n;
    }
  }

  function progressbar(x, n) {
    if (typeof x === 'undefined' || typeof n == 'undefined') {
      var dialog = document.getElementById('jj_progress_dialog');
      if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'jj_progress_dialog';
        dialog.setAttribute('aria-labelledby', 'jj_progress_title');
        dialog.style.width = '25em';
        dialog.innerHTML = [
          '<h3 id="jj_progress_title">Instructor Access Report Data</h3>',
          // The message labels the bar and is read out when it changes
          '<label for="jj_progressbar" id="jj_progress_message"',
          ' aria-live="polite"></label>',
          '<div style="display: flex; align-items: center; gap: 0.5em;">',
          '<progress id="jj_progressbar" style="flex: 1;"></progress>',
          // Hidden from screen readers, which get the percentage from the bar
          '<span id="jj_progress_percent" aria-hidden="true"',
          ' style="min-width: 3em; text-align: right;"></span>',
          '</div>',
          '<p style="text-align: right;">',
          '<button type="button" class="btn">Cancel</button></p>',
        ].join('');
        dialog.querySelector('button').addEventListener('click', function () {
          dialog.close();
          abortAll();
        });
        // Esc closes a native dialog, so treat it the same as Cancel
        dialog.addEventListener('cancel', abortAll);
        document.body.appendChild(dialog);
      }
      if (dialog.open) {
        dialog.close();
      } else {
        document.getElementById('jj_progressbar').removeAttribute('value');
        document.getElementById('jj_progress_percent').textContent = '';
        dialog.showModal();
      }
    } else {
      if (!aborted) {
        var bar = document.getElementById('jj_progressbar');
        var percent = document.getElementById('jj_progress_percent');
        if (n > 0) {
          bar.max = n;
          bar.value = x;
          percent.textContent = `${Math.round((100 * x) / n)}%`;
        } else {
          bar.removeAttribute('value');
          percent.textContent = '';
        }
      }
    }
  }

  function progressMessage(msg) {
    document.getElementById('jj_progress_message').textContent = msg;
  }

  function errorHandler(e) {
    console.log(e);
    alert(e.message);
  }
})();
