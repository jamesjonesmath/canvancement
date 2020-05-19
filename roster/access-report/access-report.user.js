// ==UserScript==
// @name        Access Report Data
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for all students in a course
// @include     https://*.instructure.com/courses/*/users
// @require     https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js
// @require     https://cdn.jsdelivr.net/npm/file-saver/dist/FileSaver.min.js
// @version     14
// @grant       none
// ==/UserScript==
/* global ENV,Bottleneck,saveAs */

(function() {
  'use strict';

  // Begin user configuration section

  // Some software doesn't like spaces in the headings. You may replace
  // spaces in the column headings by specifying something other than a space
  // for headingSpaces. Example, '' will remove spaces and '_' will replace them
  // with underscores
  const headingSpaces = ' ';

  // Viewing a student's profile page now counts as a participation.
  // This can confuse the faculty when student names show up as titles.
  // By default these are now removed from the data before downloading
  // Set showViewStudent = true to include these views in the data
  const showViewStudent = false;

  // Canvas counts taking a quiz as both a view and a participation.
  // The web interface subtracts 1 from the views for each participation
  // To repeat that behavior here, set quizParticipation = true
  const quizParticipation = true;

  // enrollmentStates defines which students to include in the report
  // Possible values are active, invited, rejected, completed, and inactive
  // See
  // https://canvas.instructure.com/doc/api/courses.html#method.courses.users
  // for additional information.
  const enrollmentStates = [ 'active', 'completed' ];

  // There are some analytics available including the last activity, the
  // time spent in the course, the course grade, and course score. The analytics
  // array can contain 'activity' or 'grades' to enable this data. Leave it
  // blank to omit both
  const analytics = [ 'activity', 'grades' ];

  // Bottleneck configuration options
  // These are advanced options for those with large classes who are having
  // issues. These can be tweaked to modify the limiting of the API calls

  // maxConcurrent is the maximum number of requests to attempt at one time
  // For quick API calls, you may never see reach number based on minTime
  const maxConcurrent = 40;
  // minTime is the minimum number of milliseconds to wait before attempting a
  // new connection. This is the more important of the two options and making it
  // too low will likely cause Canvas to stop delivering data
  const minTime = 30;

  // Set debug true for help troubleshooting the process
  // Leave it false for normal operations
  const debug = false;

  // End of user configuration section

  // Check to make sure person has permission to read reports
  if (typeof ENV !== 'undefined') {
    if (typeof ENV.permissions === 'undefined' || ENV.permissions.read_reports === false) {
      return;
    }
  }

  const courseId = getCourseId();
  if (!courseId) {
    return;
  }

  const userData = {};
  const accessData = [];
  const sections = {};
  const failedFetches = [];
  let limiter = null;
  let aborted = false;
  let userFetchCount = 0;
  let userFetchTotal = 0;
  let minimumRateRemaining = null;
  let pass = 0;
  let startTime = 0;
  let finishTime = 0;
  addAccessReportButton();

  function addAccessReportButton() {
    if (!document.getElementById('jj_access_report')) {
      const parent = document.querySelector('#people-options > ul');
      if (parent) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.classList.add('ui-menu-item');
        const anchor = document.createElement('a');
        anchor.id = 'jj_access_report';
        anchor.classList.add('ui-corner-all');
        anchor.setAttribute('tabindex', -1);
        anchor.setAttribute('role', 'menuitem');
        const icon = document.createElement('i');
        icon.classList.add('icon-analytics');
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(' Access Report Data'));
        anchor.addEventListener('click', setupBottleneck, {
          'once' : true
        });
        li.appendChild(anchor);
        parent.appendChild(li);
      }
    }
    return;
  }

  function setupBottleneck() {
    if (typeof Bottleneck === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js';
      script.onload = function() {
        setupBottleneck();
      };
      document.head.appendChild(script);
    } else {
      if (aborted === true || limiter === null) {
        limiter = new Bottleneck();
        limiter.on('idle', limiterIdle);
      }
      limiter.updateSettings({
          'maxConcurrent' : maxConcurrent,
          'minTime' : minTime,
        });
      aborted = false;
      accessReport();
    }
  }
  
  function limiterIdle() {
    pass++;
    if (pass === 1) {
      if (debug) {
        console.log('Minimum x-rate-limit-remaining: ' + minimumRateRemaining);
      }
      if (failedFetches.length > 0) {
        // Some of the results failed with a 403 error
        // Try again after slowing down Bottleneck;
        limiter.updateSettings({
          'maxConcurrent' : Math.floor(Math.max(5, maxConcurrent / 2)),
          'minTime' : minTime < 30 ? 45 : Math.floor(minTime * 1.5),
        });
        fetchResults(failedFetches);
      } else {
        pass++;
      }
    }
    if (pass > 1) {
      makeReport();
    }
  }

  function accessReport() {
    startTime = Date.now().toString();
    userFetchCount = 0;
    userFetchTotal = 0;
    pass = 0;
    aborted = false;
    progressbar();
    Promise.all([getSections(), getStudentList()]);
  }

  function getSections() {
    if (typeof ENV === 'object') {
      if (typeof ENV.SECTIONS === 'object') {
        saveSections(ENV.SECTIONS);
      }
      if (typeof ENV.CONCLUDED_SECTIONS === 'object') {
        saveSections(ENV.CONCLUDED_SECTIONS);
      }
      return Promise.resolve(true);
    } else {
      const url = `/api/v1/courses/${courseId}?include[]=sections&per_page=50`;
      return fetchResults(url);
    }
  }

  function fetchResults(url) {
    const p = [];
    if (Array.isArray(url)) {
      url.forEach(function(u) {
        p.push(fetchResult(u));
      });
    } else {
      p.push(fetchResult(url));
    }
    return Promise.all(p);
  }

  function fetchResult(url) {
    return limiter.schedule(function() {
      const options = {
          'method' : 'GET',
          'headers' : {
            'accept' : 'application/json'
          },
          'credentials' : 'same-origin',
          'timeout' : 30000
        };
      let linkHeader = '';
      return fetch(url, options).then(function(res) {
        if (res.ok) {
          const xremaining = parseFloat(res.headers.get('x-rate-limit-remaining'));
          const xcost = parseFloat(res.headers.get('x-request-cost'));
          if (minimumRateRemaining === null || xremaining < minimumRateRemaining) {
            minimumRateRemaining = xremaining;
          }
          const outstat = [ Date.now().toString(), xremaining, xcost, res.url ];
          if (debug) {
            console.log(outstat.join('\t'));
          }
          linkHeader = res.headers.get('link');
          return res.json();
        } else if (res.status === 403) {
          // Forbidden status code happens if you have exhausted API requests
          // Add these to a queue to be reattempted later
          if (failedFetches.indexOf(res.url) > -1) {
            if (debug) {
              console.log('FETCH FAILED A SECOND TIME');
              console.log(res);
              console.log(res.headers.entries());
            }
          } else {
            // Failed, retry once
            if (debug) {
              console.log('FETCH FAILED: ' + res.url);
            }
            failedFetches.push(res.url);
          }
          return Promise.resolve(false);
        } else {
          abortAll();
          return Promise.reject(false);
        }
      }).then(function(json) {
        if (typeof json === 'undefined' || json === false || json.length === 0) {
          return Promise.resolve(false);
        }
        const resultType = Array.isArray(json) ? determineResultType(json[0]) : determineResultType(json);
        let records = 1;
        switch (resultType) {
        case 'enrollment':
          saveEnrollments(json);
          records = json.length;
          break;
        case 'usage':
          saveUsage(json);
          records = json.length;
          break;
        case 'sections':
          saveSections(json);
          break;
        default:
          console.log('CANNOT DETERMINE DATA TYPE');
          console.log(json);
        }
        return nextPage(linkHeader, resultType, records);
      })
    }).catch(function(e){
      // Suppress warnings when canceled
      if (!(e instanceof Bottleneck.BottleneckError)) {
        console.log('Error: ' + e);
      }
    });
  }

  // This is overkill for this script, but lays a foundation for other scripts
  function determineResultType(result) {
    // fields used to identify the type of response
    const resultTypes = {
      'usage' : [ 'asset_user_access' ],
      'enrollment' : [ 'name', 'short_name', 'enrollments' ],
      'course' : [ 'name', 'course_code', 'default_view', 'is_public' ]
    };
    let resultType = null;
    const types = Object.keys(resultTypes);
    const resultKeys = Object.keys(result);
    let i = 0;
    while (resultType === null && i < types.length) {
      const type = types[i];
      if (resultTypes[type].every(function(e){return resultKeys.indexOf(e) > -1;})) {
        resultType = type;
      }
      else {
        i++;
      }
    }
    return resultType;
  }

  function nextPage(hdr, resultType, resultCount) {
    return new Promise(function(resolve) {
      if (typeof hdr !== 'string' || !hdr) {
        resolve(false);
      }
      const linkRegex = new RegExp('^<(.*?)>; rel="(current|first|last|next|prev)"$');
      const linkStr = hdr.split(',');
      const links = {};
      for (let i = 0; i < linkStr.length; i++) {
        const matches = linkRegex.exec(linkStr[i]);
        if (matches) {
          const linkUrl = matches[1];
          const linkType = matches[2];
          links[linkType] = linkUrl;
        }
      }
      if (typeof links.prev === 'undefined') {
        if (resultType === 'enrollment') {
          userFetchTotal = resultCount;
        }
      }
      if (typeof links.next === 'undefined') {
        // this is the last page of data for this request
        if (resultType === 'usage') {
          userFetchCount++;
          progressbar(userFetchCount, userFetchTotal);
        }
        if (resultType === 'enrollment' && typeof links.prev !== 'undefined') {
          // We need to adjust the total count
          const currentUrl = new URL(links.current);
          const currentSearch = currentUrl.searchParams;
          const perPage = currentSearch.get('per_page');
          if (perPage > resultCount) {
            userFetchTotal -= perPage - resultCount;
          }
        }
        resolve(false);
      }
      let results = [];
      if (typeof links.last !== 'undefined') {
        const nextUrl = new URL(links.next);
        const nextSearch = nextUrl.searchParams;
        let page = nextSearch.get('page');
        if (page && parseInt(page) === 2) {
          const lastUrl = new URL(links.last);
          let lastPage = lastUrl.searchParams.get('page');
          if (lastPage) {
            results.push(links.next);
            page = parseInt(page);
            lastPage = parseInt(lastPage);
            if (resultType === 'enrollment') {
              userFetchTotal = resultCount * lastPage;
            }
            while (page < lastPage) {
              page++;
              nextUrl.searchParams.set('page', page);
              results.push(nextUrl.toString());
            }
          }
        }
      } else {
        results.push(links.next);
      }
      if (results.length > 0) {
        fetchResults(results.length === 1 ? results[0] : results);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  function getStudentList() {
    const q = [];
    q.push('enrollment_type[]=student');
    q.push('include[]=enrollments');
    enrollmentStates.forEach(function(state) {
      q.push('enrollment_state[]=' + state)
    });
    q.push('per_page=20');
    const queryString = q.join('&');
    const url = `/api/v1/courses/${courseId}/users?${queryString}`;
    return fetchResults(url);
  }

  function saveEnrollments(data) {
    if (typeof data !== 'object' || data.length === 0) {
      return false;
    }
    const usageUrls = [];
    const userAttributes = [ 'id', 'name', 'sortable_name', 'short_name', 'login_id', 'sis_user_id', 'email' ];
    const enrollmentAttributes = [ 'course_id', 'course_section_id:section_id', 'last_activity_at', 'total_activity_time', 'sis_user_id', 'sis_course_id',
        'sis_section_id' ];
    const gradeAttributes = [ 'current_grade', 'current_score' ];
    for (let i = 0; i < data.length; i++) {
      let valid = false;
      const d = data[i];
      const userId = d.id;
      const user = {};
      if (typeof d.enrollments === 'object') {
        const enrollments = d.enrollments.filter(function(e) {
          return e.type === 'StudentEnrollment'
        });
        if (enrollments.length > 0) {
          addUserAttributes(user, d, userAttributes);
          valid = true;
          const enrollment = enrollments[0];
          addUserAttributes(user, enrollment, enrollmentAttributes);
          if (typeof enrollment.grades === 'object') {
            addUserAttributes(user, enrollment.grades, gradeAttributes);
          }
        }
      }
      if (valid) {
        userData[userId] = user;
        usageUrls.push(`/courses/${courseId}/users/${userId}/usage?per_page=100`);
      }
    }
    if (usageUrls.length > 0) {
      fetchResults(usageUrls);
    }
    return true;
  }

  function addUserAttributes(user, obj, attr) {
    attr.forEach(function(key) {
      if (/:/.test(key)) {
        const keys = key.split(':');
        user[keys[1]] = nullify(obj[keys[0]]);
      } else {
        user[key] = nullify(obj[key]);
      }
    });
  }

  function saveUsage(data) {
    if (typeof data !== 'object' || data.length === 0) {
      return false;
    }
    for (let i = 0; i < data.length; i++) {
      let asset = data[i].asset_user_access;
      const userId = asset.user_id;
      if (quizParticipation && asset.asset_class_name === 'quizzes/quiz' && asset.participate_score) {
        asset.view_score -= asset.participate_score;
      }
      if (typeof accessData[userId] === 'undefined') {
        accessData[userId] = [];
      }
      accessData[userId].push(asset);
    }
    return true;
  }

  function saveSections(data) {
    if (typeof data !== 'object' || data.length === 0) {
      return false;
    }
    data.forEach(function(e) {
      const sectionId = e.id;
      if (typeof sections[sectionId] === 'undefined') {
        sections[sectionId] = e.name;
      }
    });
    return true;
  }

  function nullify(e) {
    return typeof e === 'undefined' ? null : e;
  }

  function getCourseId() {
    let courseId = false;
    const courseRegex = new RegExp('^/courses/([0-9]+)');
    const matches = courseRegex.exec(window.location.pathname);
    if (matches) {
      courseId = matches[1];
    }
    return courseId;
  }

  function makeReport() {
    finishTime = Date.now().toString();
    if (debug) {
      console.log('Fetching Time : ' + ((finishTime - startTime) / 1000) + ' seconds');
    }
    if (aborted) {
      if (debug) {
        console.log('Process aborted');
      }
      return;
    }
    if (typeof saveAs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/file-saver/dist/FileSaver.min.js';
      script.onload = function() {
        makeReport();
      };
      document.head.appendChild(script);
    } else {
      progressbar();
      const csv = createCSV();
      if (csv) {
        const blob = new Blob([ csv ], {
          'type' : 'text/csv;charset=utf-8'
        });
        saveAs(blob, 'access-report.csv');
        $('#jj_access_report').one('click', setupBottleneck);
      }
    }
  }

  function createCSV() {
    // for each value, you may specify
    // name: human friendly name
    // src: location in data
    // fmt: special formatting instructions (date is recognized)
    // disabled: set true to skip this value
    const fields = [ {
      'name' : 'User ID',
      'src' : 'u.id'
    }, {
      'name' : 'Display Name',
      'src' : 'u.name'
    }, {
      'name' : 'Sortable Name',
      'src' : 'u.sortable_name'
    }, {
      'name' : 'Category',
      'src' : 'a.asset_category'
    }, {
      'name' : 'Class',
      'src' : 'a.asset_class_name'
    }, {
      'name' : 'Title',
      'src' : 'a.readable_name'
    }, {
      'name' : 'Views',
      'src' : 'a.view_score'
    }, {
      'name' : 'Participations',
      'src' : 'a.participate_score'
    }, {
      'name' : 'Last Access',
      'src' : 'a.last_access',
      'fmt' : 'date'
    }, {
      'name' : 'First Access',
      'src' : 'a.created_at',
      'fmt' : 'date'
    }, {
      'name' : 'Action',
      'src' : 'a.action_level'
    }, {
      'name' : 'Code',
      'src' : 'a.asset_code'
    }, {
      'name' : 'Group Code',
      'src' : 'a.asset_group_code'
    }, {
      'name' : 'Context Type',
      'src' : 'a.context_type'
    }, {
      'name' : 'Context ID',
      'src' : 'a.context_id'
    }, {
      'name' : 'Login ID',
      'src' : 'u.login_id'
    }, {
      'name' : 'Email',
      'src' : 'u.email',
      'disabled' : true,
    }, {
      'name' : 'Section',
      'src' : 'u.section_name',
    }, {
      'name' : 'Section ID',
      'src' : 'u.section_id',
    }, {
      'name' : 'SIS Course ID',
      'src' : 'u.sis_course_id',
    }, {
      'name' : 'SIS Section ID',
      'src' : 'u.sis_section_id',
    }, {
      'name' : 'SIS User ID',
      'src' : 'u.sis_user_id',
    }, {
      'name' : 'Last Activity',
      'src' : 'u.last_activity_at',
      'fmt' : 'date',
      'disabled' : analytics.indexOf('activity') > -1 ? false : true,
    }, {
      'name' : 'Total Activity',
      'src' : 'u.total_activity_time',
      'fmt' : 'hours',
      'disabled' : analytics.indexOf('activity') > -1 ? false : true,
    }, {
      'name' : 'Course Score',
      'src' : 'u.current_score',
      'disabled' : analytics.indexOf('grades') > -1 ? false : true,
    }, {
      'name' : 'Course Grade',
      'src' : 'u.current_grade',
      'disabled' : analytics.indexOf('grades') > -1 ? false : true,
    } ];
    let hasSis = false;
    let userKeys = Object.keys(userData);
    let j = 0;
    while (j < userKeys.length && !hasSis) {
      const id = userKeys[j];
      if (typeof userData[id].sis_user_id !== 'undefined' && userData[id].sis_user_id) {
        hasSis = true;
      }
      j++;
    }
    const CRLF = '\r\n';
    const hdr = [];
    const sisRegex = new RegExp('^[au][.]sis_');
    const stripSpaces = (typeof headingSpaces !== 'undefined') ? headingSpaces : ' ';
    for (let k = 0; k < fields.length; k++) {
      const e = fields[k];
      e.sis = sisRegex.test(e.src);
      if (e.sis && !hasSis) {
        e.disabled = true;
      }
      if (!e.disabled) {
        const name = e.name.replace(' ', stripSpaces);
        hdr.push(name);
      }
    }
    let t = hdr.join(',') + CRLF;
    const showStudentViews = typeof showViewStudent === 'undefined' ? false : showViewStudent;
    for (let j = 0; j < userKeys.length; j++) {
      const userId = userKeys[j];
      if (typeof accessData[userId] === 'undefined') {
        continue;
      }
      const user = userData[userId];
      if (user.section_id !== null && typeof sections[user.section_id] !== undefined) {
        user.section_name = sections[user.section_id];
      }
      for (let i = 0; i < accessData[userId].length; i++) {
        const item = accessData[userId][i];
        // Skip viewing student enrollments unless enabled
        if (item.asset_category === 'roster' && item.asset_class_name === 'student_enrollment' && !showStudentViews) {
          continue;
        }
        const row = [];
        for (let k = 0; k < fields.length; k++) {
          if (fields[k].disabled) {
            continue;
          }
          const field = fields[k];
          const fieldInfo = field.src.split('.');
          let value = fieldInfo[0] == 'a' ? item[fieldInfo[1]] : user[fieldInfo[1]];
          if (typeof value === 'undefined' || value === null) {
            value = '';
          } else {
            if (typeof field.fmt !== 'undefined') {
              switch (field.fmt) {
              case 'date':
                value = excelDate(value);
                break;
              case 'minutes':
                value = parseInt(value) / 60;
                break;
              case 'hours':
                value = parseInt(value) / 3600;
                break;
              default:
                break;
              }
            }
            if (typeof value === 'string') {
              let quote = false;
              if (value.indexOf('"') > -1) {
                value = value.replace(/"/g, '""');
                quote = true;
              }
              if (value.indexOf(',') > -1) {
                quote = true;
              }
              if (quote) {
                value = '"' + value + '"';
              }
            }
          }
          row.push(value);
        }
        t += row.join(',') + CRLF;
      }
    }
    return t;
  }

  function excelDate(timestamp) {
    let d = '';
    if (timestamp) {
      timestamp = timestamp.replace('Z', '.000Z');
      const dt = new Date(timestamp);
      if (typeof dt === 'object') {
        d = dt.getFullYear() + '-' + pad(1 + dt.getMonth()) + '-' + pad(dt.getDate()) + ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()) + ':'
            + pad(dt.getSeconds());
      }
    }
    return d;

    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
  }

  function progressbar(x, n) {
      if (typeof x === 'undefined' || typeof n == 'undefined') {
        const dialog = document.getElementById('jj_progress_dialog');
        if (!dialog) {
          $('body').append('<div id="jj_progress_dialog"></div>');
          $('#jj_progress_dialog').append('<div id="jj_progressbar"></div>');
          $('#jj_progress_dialog').dialog({
            'title' : 'Fetching Access Reports',
            'autoOpen' : false,
            'buttons' : [ {
              'text' : 'Cancel',
              'click' : function() {
                $(this).dialog('close');
                abortAll();
                $('#jj_access_report').one('click', setupBottleneck);
              }
            } ]
          });
        }
        if ($('#jj_progress_dialog').dialog('isOpen')) {
          $('#jj_progress_dialog').dialog('close');
        } else {
          $('#jj_progressbar').progressbar({
            'value' : false
          });
          $('#jj_progress_dialog').dialog('open');
        }
      } else {
        if (!aborted) {
          const val = n > 0 ? Math.round(100 * x / n) : false;
          $('#jj_progressbar').progressbar('option', 'value', val);
        }
      }
  }

  function abortAll() {
    if (typeof limiter !== 'undefined') {
      limiter.stop();
    }
    aborted = true;
  }

})();
