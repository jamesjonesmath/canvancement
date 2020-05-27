//==UserScript==
//@name        Access Report Data
//@namespace   https://github.com/jamesjonesmath/canvancement
//@description Generates a .CSV download of the access report for all students in a course
//@include     https://*.instructure.com/courses/*/users
//@require     https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js
//@require     https://cdn.jsdelivr.net/npm/file-saver/dist/FileSaver.min.js
//@version     15
//@grant       none
//@supportURL  https://community.canvaslms.com/docs/DOC-6061-obtaining-and-using-access-report-data-for-an-entire-course
//==/UserScript==
/* global ENV,Bottleneck,saveAs */

(function() {
  'use strict';

  const courseId = getCourseId();
  if (!courseId) {
    return;
  }

  /** Begin user configuration section */

  /**
   * Viewing a student's profile page now counts as a participation. This can
   * confuse the faculty when student names show up as titles. By default these
   * are now removed from the data before downloading Set showViewStudent = true
   * to include these views in the data
   */
  const showViewStudent = false;

  /**
   * Canvas counts taking a quiz as both a view and a participation. The web
   * interface subtracts 1 from the views for each participation To repeat that
   * behavior here, set quizParticipation = true
   */
  const quizParticipation = true;

  /**
   * enrollmentStates defines which students to include in the report Possible
   * values are active, invited, rejected, completed, and inactive. See
   * https://canvas.instructure.com/doc/api/courses.html#method.courses.users
   * for additional information.
   */
  const enrollmentStates = [ 'active', 'completed' ];

  /**
   * There are some analytics available including the last activity, the time
   * spent in the course, the course grade, and course score. The analytics
   * array can contain 'activity' or 'grades' to enable this data. Leave it
   * blank to omit both
   */
  const analytics = [ 'activity', 'grades' ];

  /**
   * disableMissing controls whether to hide columns that have no data. true
   * will hide the columns without data and false will show them.
   */
  const disableMissing = true;

  /**
   * Some software doesn't like spaces in the headings. You may replace spaces
   * in the column headings by specifying something other than a space for
   * headingSpaces. Example, '' will remove spaces and '_' will replace them
   * with underscores
   */
  const headingSpaces = ' ';

  /**
   * multipleSections determines how to handle students who are enrolled in
   * multiple sections. Valid values and the results are: 1 to provide a
   * separate row for each section, 2 to provide a single row for the student
   * with just the first section listed, and 'x' to provide a separated list
   * with x as the delimiter. Replace x by your favorite delimiter such as a
   * comma or semicolon.
   */
  const multipleSections = ', ';

  /** Advanced Configuration */

  /**
   * Bottlneck js is a library that allows you to throttle requests. This is an
   * advanced section for those who want to tweak the settings or who have large
   * classes and find that the report is not running. If you exceed the
   * x-rate-limit-remaining value, then Canvas will shut down the requests.
   */

  /**
   * minTime specifies the number of milliseconds you must wait between
   * successive API calls. Making them all at the same time imposes a penalty
   * that can quickly deplete the Canvas x-rate-limit-remaining value. This will
   * have a greater impact than maxConcurrent and if your network calls are too
   * excessive, try increasing this first.
   */
  const minTime = 30;

  /**
   * maxConcurrent specifies the maximum number of concurrent requests that can
   * be made.
   */
  const maxConcurrent = 40;

  /**
   * Set debug true for help troubleshooting the process. Leave it false for
   * normal operations
   */

  const debug = false;

  /**
   * csvFields is an ordered list of the information that will be included in
   * the report. For each entry, you may specify the name (the header), src
   * (where the information is found), fmt (any special formatting rules), and
   * disabled (do not include this field when true).
   */
  const csvFields = [ {
    'name' : 'User ID',
    'src' : 'u.id',
  }, {
    'name' : 'Display Name',
    'src' : 'u.name',
  }, {
    'name' : 'Sortable Name',
    'src' : 'u.sortable_name',
  }, {
    'name' : 'Category',
    'src' : 'a.asset_category',
  }, {
    'name' : 'Class',
    'src' : 'a.asset_class_name',
  }, {
    'name' : 'Title',
    'src' : 'a.readable_name',
  }, {
    'name' : 'Views',
    'src' : 'a.view_score',
  }, {
    'name' : 'Participations',
    'src' : 'a.participate_score',
  }, {
    'name' : 'Last Access',
    'src' : 'a.last_access',
    'fmt' : 'date',
  }, {
    'name' : 'First Access',
    'src' : 'a.created_at',
    'fmt' : 'date',
  }, {
    'name' : 'Action',
    'src' : 'a.action_level',
  }, {
    'name' : 'Code',
    'src' : 'a.asset_code',
  }, {
    'name' : 'Group Code',
    'src' : 'a.asset_group_code',
  }, {
    'name' : 'Context Type',
    'src' : 'a.context_type',
  }, {
    'name' : 'Context ID',
    'src' : 'a.context_id',
  }, {
    'name' : 'Login ID',
    'src' : 'u.login_id',
  }, {
    'name' : 'Email',
    'src' : 'u.email',
  }, {
    'name' : 'Section',
    'src' : 's.name',
  }, {
    'name' : 'Section ID',
    'src' : 's.id',
  }, {
    'name' : 'SIS Course ID',
    'src' : 'u.sis_course_id',
  }, {
    'name' : 'SIS Section ID',
    'src' : 's.sis_section_id',
  }, {
    'name' : 'SIS User ID',
    'src' : 'u.sis_user_id',
  }, {
    'name' : 'Last Activity',
    'src' : 'u.last_activity_at',
    'fmt' : 'date',
  }, {
    'name' : 'Total Activity',
    'src' : 'u.total_activity_time',
    'fmt' : 'hours',
  }, {
    'name' : 'Course Score',
    'src' : 'u.current_score',
  }, {
    'name' : 'Course Grade',
    'src' : 'u.current_grade',
  }, {
    'name' : 'Final Course Score',
    'src' : 'u.final_score',
    'disabled' : true,
  }, {
    'name' : 'Final Course Grade',
    'src' : 'u.final_grade',
    'disabled' : true,
  } ];

  /** End of user configuration section */

  // Check to make sure person has permission to read reports
  if (typeof ENV !== 'object' || typeof ENV.permissions === 'undefined' || ENV.permissions.read_reports === false) {
    return;
  }

  const uniqueLinkId = 'jj_access_report';
  const userData = {};
  const accessData = {};
  const sectionData = {};
  const failedFetches = {};
  let limiter = null;
  let aborted = false;
  let userFetchCount = 0;
  let userFetchTotal = 0;
  let minimumRateRemaining = null;
  let maximumRequestCost = null;
  let displaySummary = true;
  let startTime = 0;
  let finishTime = 0;
  addRosterButton('Access Report Data', 'icon-analytics');

  function addRosterButton(linkText, iconType) {
    if (!document.getElementById(uniqueLinkId)) {
      const parent = document.querySelector('#people-options > ul');
      if (parent) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.classList.add('ui-menu-item');
        const anchor = document.createElement('a');
        anchor.id = uniqueLinkId;
        anchor.classList.add('ui-corner-all');
        anchor.setAttribute('tabindex', -1);
        anchor.setAttribute('role', 'menuitem');
        const icon = document.createElement('i');
        icon.classList.add(iconType);
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(` ${linkText}`));
        li.appendChild(anchor);
        parent.appendChild(li);
        activateLink();
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
      limiter = new Bottleneck({
        'maxConcurrent' : maxConcurrent,
        'minTime' : minTime,
      });
      accessReport();
    }
  }

  function accessReport() {
    initializeGlobals();
    progressbar();
    startTime = Date.now().toString();
    getSections()
    .then(getStudentList)
    .then(checkFailed)
    .then(makeReport)
    .catch(function(e){
        console.log(e);
    });
  }

  function checkFailed() {
    const urls = Object.keys(failedFetches);
    if (urls.length > 0) {
      limiter.updateSettings({
        'maxConcurrent' : Math.floor(Math.max(5, maxConcurrent / 2)),
        'minTime' : minTime < 30 ? 45 : Math.floor(minTime * 1.5),
      });
      return fetchResults(urls);
    } else {
      return Promise.resolve(false);
    }
  }

  function fetchResults(url, callback) {
    if (typeof url === 'object') {
      const p = [];
      if (Array.isArray(url)) {
        url.forEach(function(u) {
          p.push(fetchResult(u, callback));
        });
      } else {
        const keys = Object.keys(url);
        keys.forEach(function(u) {
          p.push(fetchResult(u, url[u]));
        });
      }
      return p.length > 0 ? Promise.all(p) : Promise.resolve(false);
    } else {
      return fetchResult(url, callback);
    }
  }

  function fetchResult(url, callback) {
    let links;
    return limiter.schedule(function() {
      const options = {
        'method' : 'GET',
        'headers' : {
          'accept' : 'application/json',
        },
        'credentials' : 'same-origin',
        'timeout' : 30000,
      };
      return fetch(url, options);
    }).then(function(res) {
      if (res.ok) {
        links = extractLinks(res.headers.get('link'));
        if (debug) {
          calculateLimits(res);
        }
        return res.json();
      } else if (res.status === 403) {
        if (typeof failedFetches[res.url] !== 'undefined') {
          if (debug) {
            console.log('FETCH FAILED A SECOND TIME');
            console.log(res.headers.entries());
          }
          return Promise.reject('A fetch failed for the second time, giving up.');
        } else {
          failedFetches[res.url] = callback;
          if (debug) {
            console.log(`FAILED FAILED : ${res.url}`);
          }
        }
        return Promise.resolve(true);
      } else {
        return Promise.reject(`Got an HTTP status of ${res.status}`);
      }
    }).then(function(json) {
      if (typeof json === 'object') {
        return typeof callback === 'function' ? callback(json, links) : Promise.resolve(json);
      } else {
        return Promise.resolve(false);
      }
    }).then(function() {
      const additionalLinks = nextPage(links);
      if (additionalLinks !== false && additionalLinks.length > 0) {
        return fetchResults(additionalLinks, callback);
      } else {
        return Promise.resolve(true);
      }
    }).catch(function(e){
      // Suppress warnings when canceled
      if (!(e instanceof Bottleneck.BottleneckError)) {
        console.log(`Error: ${e}`);
      }
    });
  }

  function calculateLimits(res) {
    const xremaining = parseFloat(res.headers.get('x-rate-limit-remaining'));
    const xcost = parseFloat(res.headers.get('x-request-cost'));
    if (minimumRateRemaining === null || xremaining < minimumRateRemaining) {
      minimumRateRemaining = xremaining;
    }
    if (maximumRequestCost === null || xcost > maximumRequestCost) {
      maximumRequestCost = xcost;
    }
    const outstat = [ Date.now().toString(), xremaining, xcost, res.url ];
    console.log(outstat.join('\t'));
  }

  function extractLinks(hdr) {
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
    return links;
  }

  function paginationInfo(link) {
    if (typeof link !== 'string' || link === '') {
      return false;
    }
    const url = new URL(link);
    const params = url.searchParams;
    const page = params.get('page');
    const perPage = params.get('per_page') || 10;
    const isNumeric = /^[0-9]+$/.test(page);
    return {
      'url' : url,
      'page' : isNumeric ? parseInt(page, 10) : page,
      'perPage' : perPage,
      'isNumeric' : isNumeric,
    };
  }

  function nextPage(links) {
    if (typeof links.next === 'undefined') {
      return false;
    }
    const results = [];
    if (typeof links.last !== 'undefined') {
      const next = paginationInfo(links.next);
      const last = paginationInfo(links.last);
      if (next.isNumeric && next.page === 2 && last.isNumeric) {
        results.push(links.next);
        const url = next.url;
        for (let i = next.page; i < last.page; i++) {
          url.searchParams.set('page', i + 1);
          results.push(url.toString());
        }
      }
    } else {
      results.push(links.next);
    }
    return results.length > 0 ? results : false;
  }

  function adjustFetchTotal(links, resultCount) {
    if (typeof links.prev === 'undefined') {
      let count = resultCount;
      const last = paginationInfo(links.last);
      if (last !== false && last.isNumeric && last.page > 1) {
        count = last.perPage * last.page;
      }
      userFetchTotal = count;
    } else {
      if (typeof links.next === 'undefined') {
        const current = paginationInfo(links.current);
        if (current.perPage > resultCount) {
          userFetchTotal -= current.perPage - resultCount;
        }
      }
    }
  }

  function adjustFetchCount(links) {
    if (typeof links.next === 'undefined') {
      userFetchCount++;
      progressbar(userFetchCount, userFetchTotal);
    }
  }

  function getSections() {
    return fetchResults(`/api/v1/courses/${courseId}/sections?per_page=50`, saveSections);
  }

  function getStudentList() {
    const q = [];
    q.push('enrollment_type[]=student');
    q.push('include[]=enrollments');
    enrollmentStates.forEach(function(state) {
      q.push(`enrollment_state[]=${state}`);
    });
    q.push('per_page=20');
    const queryString = q.join('&');
    const url = `/api/v1/courses/${courseId}/users?${queryString}`;
    return fetchResults(url, saveEnrollments);
  }

  function saveEnrollments(data, links) {
    if (typeof data !== 'object' || data.length === 0) {
      return Promise.resolve(false);
    }
    adjustFetchTotal(links, data.length);
    const usageIds = [];
    for (let i = 0; i < data.length; i++) {
      if (compileUserData(data[i]) !== false) {
        const userId = data[i].id;
        if (typeof userData[userId].last_activity_at !== 'undefined' && userData[userId].last_activity_at !== null) {
          usageIds.push(userId);
        } else {
          userFetchCount++;
        }
      }
    }
    return getUsage(usageIds);
  }

  function compileUserData(d) {
    const userId = d.id;
    const user = {};
    const userAttributes = [ 'id', 'name', 'sortable_name', 'short_name', 'login_id', 'sis_user_id', 'email' ];
    const enrollmentAttributes = [ 'course_id', 'last_activity_at', 'total_activity_time' ];
    const gradeAttributes = [ 'current_grade', 'current_score', 'final_grade', 'final_score' ];
    let valid = false;
    if (typeof d.enrollments === 'object') {
      const enrollments = d.enrollments.filter(function(e) {
        return e.type === 'StudentEnrollment';
      });
      if (enrollments.length > 0) {
        addUserAttributes(user, d, userAttributes);
        valid = true;
        const enrollment = enrollments[0];
        addUserAttributes(user, enrollment, enrollmentAttributes);
        if (typeof enrollment.grades === 'object') {
          addUserAttributes(user, enrollment.grades, gradeAttributes);
        }
        user.section_ids = enrollments.map(function(e) {
          return e.course_section_id;
        }).join(',');
      }
    }
    if (valid) {
      userData[userId] = user;
      return true;
    } else {
      return false;
    }
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

  function getUsage(ids) {
    if (typeof ids === 'object' && ids.length > 0) {
      const urls = ids.map(function(userId) {
        return `/courses/${courseId}/users/${userId}/usage?per_page=100`;
      });
      return fetchResults(urls, saveUsage);
    } else {
      return Promise.resolve(false);
    }
  }

  function saveUsage(data, links) {
    adjustFetchCount(links);
    if (typeof data !== 'object' || data.length === 0) {
      return Promise.resolve(false);
    }
    const userId = data[0].asset_user_access.user_id;
    if (typeof accessData[userId] === 'undefined') {
      accessData[userId] = [];
    }
    for (let i = 0; i < data.length; i++) {
      const asset = data[i].asset_user_access;
      if (quizParticipation && asset.asset_class_name === 'quizzes/quiz' && asset.participate_score) {
        asset.view_score -= asset.participate_score;
      }
      accessData[userId].push(asset);
    }
    return Promise.resolve(true);
  }

  function saveSections(data) {
    if (typeof data !== 'object' || data.length === 0) {
      return Promise.resolve(false);
    }
    data.forEach(function(e) {
      const sectionId = e.id;
      sectionData[sectionId] = e;
    });
    return Promise.resolve(true);
  }

  function nullify(e) {
    return typeof e === 'undefined' ? null : e;
  }

  function getCourseId() {
    let id = false;
    const courseRegex = new RegExp('^/courses/([0-9]+)');
    const matches = courseRegex.exec(window.location.pathname);
    if (matches) {
      id = matches[1];
    }
    return id;
  }

  function makeReport() {
    finishTime = Date.now().toString();
    if (debug && displaySummary) {
      const execTime = (finishTime - startTime) / 1000;
      console.log(`Fetching Time : ${execTime} seconds`);
      console.log(`Minimum x-rate-limit-remaining : ${minimumRateRemaining}`);
      console.log(`Maximum x-request-cost : ${maximumRequestCost}`);
      displaySummary = false;
    }
    if (aborted) {
      return Promise.reject('Process canceled');
    }
    if (typeof saveAs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/file-saver/dist/FileSaver.min.js';
      script.onload = function() {
        return makeReport();
      };
      document.head.appendChild(script);
    } else {
      progressbar();
      const csv = createCSV();
      if (csv) {
        const blob = new Blob([ csv ], {
          'type' : 'text/csv;charset=utf-8',
        });
        saveAs(blob, 'access-report.csv');
      }
      activateLink();
    }
    return Promise.resolve(true);
  }

  function eliminateMissingFields(fields) {
    processAnalytics('activity', [ 'last_activity_at', 'total_activity_time' ]);
    processAnalytics('grades', [ 'current_score', 'current_grade', 'final_score', 'final_grade' ]);
    if (typeof disableMissing === 'undefined' || disableMissing) {
      checkMissing();
    }
    const shortFields = [];
    fields.forEach(function(f) {
      if (typeof f.disabled === 'undefined' || !f.disabled) {
        shortFields.push(f);
      }
    });
    return shortFields;

    function processAnalytics(analyticKey, fieldKeys) {
      if (analytics.indexOf(analyticKey) === -1) {
        fieldKeys.forEach(function(f) {
          if (fields.indexOf(`u.${f}`) > -1) {
            fields[fields.indexOf(`u.${f}`)].disabled = true;
          }
        });
      }
    }

    function checkMissing() {
      fields.forEach(function(f) {
        if (typeof f.disabled !== 'undefined' && f.disabled === true) {
          return;
        }
        const field = fieldInfo(f);
        let hasData = false;
        switch (field.src) {
        case 'a':
          hasData = Object.keys(accessData).some(function(id) {
            return hasSomeData(accessData[id], field.key);
          });
          break;
        case 's':
          hasData = hasSomeData(sectionData, field.key);
          break;
        case 'u':
          hasData = hasSomeData(userData, field.key);
          break;
        default:
          break;
        }
        if (!hasData) {
          f.disabled = true;
        }
      });
    }

    function hasSomeData(data, key) {
      const keys = Object.keys(data);
      const hasKey = keys.some(function(id) {
        return (typeof data[id][key] !== 'undefined' && data[id][key] !== null);
      });
      return hasKey;
    }
  }

  function createCSV() {
    const fields = eliminateMissingFields(csvFields);
    const hasSections = fields.some(function(f) {
      return /^s\./.test(f.src);
    });
    const userKeys = Object.keys(userData);
    userKeys.sort(function(a,b){
      if (typeof userData[a].sortable_name !== 'undefined' && typeof userData[b].sortable_name !== 'undefined') {
        return userData[a].sortable_name.localeCompare(userData[b].sortable_name);
      } else {
        return 0;
      }
    });
    const CRLF = '\r\n';
    const stripSpaces = (typeof headingSpaces !== 'undefined') ? headingSpaces : ' ';
    const hdr = fields.map(function(f) {
      return f.name.replace(' ', stripSpaces);
    });
    const hdrTxt = hdr.join(',') + CRLF;
    let dataTxt = '';
    const showStudentViews = typeof showViewStudent === 'undefined' ? false : showViewStudent;
    for (let j = 0; j < userKeys.length; j++) {
      const userId = userKeys[j];
      dataTxt += getUserCSV(userId);
    }
    return dataTxt === '' ? false : `${hdrTxt}${dataTxt}`;

    function getUserCSV(userId) {
      if (typeof accessData[userId] === 'undefined') {
        return '';
      }
      let t = '';
      const user = userData[userId];
      const sectionInfo = createSectionInfo(user);
      for (let j = 0; j < accessData[userId].length; j++) {
        const item = accessData[userId][j];
        if (item.asset_category === 'roster' && item.asset_class_name === 'student_enrollment' && !showStudentViews) {
          continue;
        }
        for (let k = 0; k < sectionInfo.length; k++) {
          t += getUserRow(user,item,sectionInfo[k]);
        }
      }
      return t;
    }

    function createSectionInfo(user) {
      const sections = [];
      const sectionIds = user.section_ids.split(',');
      let sectionCount = 1;
      let separator = false;
      if (/^[0-9]+$/.test(multipleSections)) {
        if (hasSections && parseInt(multipleSections, 10) === 1) {
          sectionCount = sectionIds.length;
        }
      } else {
        separator = multipleSections || ', ';
      }
      for (let i = 0; i < sectionCount; i++) {
        let section = {};
        if (separator !== false && sectionIds.length > 1) {
          sectionIds.forEach(function(s) {
            const secPropKeys = Object.keys(sectionData[s]);
            secPropKeys.forEach(function(key) {
              const value = nullify(sectionData[s][key]);
              if (typeof section[key] === 'undefined') {
                section[key] = value;
              } else if (section[key] !== value) {
                section[key] = section[key] === null ? value : section[key] + separator + value;
              }
            });
          });
        } else {
          const sectionId = sectionIds[i];
          section = sectionData[sectionId];
        }
        sections.push(section);
      }
      return sections;
    }

    function getUserRow(user, item, section) {
      const row = fields.map(function(f) {
        const field = fieldInfo(f);
        let value = null;
        if (field.src === 's') {
          value = getValue(section[field.key], f.fmt);
        } else {
          value = getValue(field.src === 'a' ? item[field.key] : user[field.key], f.fmt);
        }
        return addQuotes(value);
      });
      return row.join(',') + CRLF;
    }

    function getValue(value, fmt) {
      if (typeof value === 'undefined' || value === null) {
        value = '';
      }
      if (typeof fmt === 'undefined') {
        return value;
      }
      switch (fmt) {
      case 'date':
        value = excelDate(value);
        break;
      case 'minutes':
        value = parseInt(value, 10) / 60;
        break;
      case 'hours':
        value = parseInt(value, 10) / 3600;
        break;
      default:
        break;
      }
      return value;
    }

    function addQuotes(value) {
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
          value = `"${value}"`;
        }
      }
      return value;
    }

  }

  function excelDate(timestamp) {
    let d = '';
    if (timestamp) {
      timestamp = timestamp.replace('Z', '.000Z');
      const dt = new Date(timestamp);
      if (typeof dt === 'object') {
        const dPart = [ dt.getFullYear(), pad(1 + dt.getMonth()), pad(dt.getDate()) ].join('-');
        const tPart = [ pad(dt.getHours()), pad(dt.getMinutes()), pad(dt.getSeconds()) ].join(':');
        d = `${dPart} ${tPart}`;
      }
    }
    return d;

    function pad(n) {
      return n < 10 ? `0${n}` : n;
    }
  }

  function fieldInfo(field) {
    const info = field.src.split('.');
    return {
      'src' : info[0],
      'key' : info[1],
    };
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
            },
          }, ],
        });
      }
      if ($('#jj_progress_dialog').dialog('isOpen')) {
        $('#jj_progress_dialog').dialog('close');
      } else {
        $('#jj_progressbar').progressbar({
          'value' : false,
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
    activateLink();
  }

  function initializeGlobals() {
    const sectionKeys = Object.keys(sectionData);
    if (sectionKeys.length > 0) {
      sectionKeys.forEach(function(key) {delete sectionData[key]});
    }
    const userKeys = Object.keys(userData);
    if (userKeys.length > 0) {
      userKeys.forEach(function(key) {delete userData[key]});
    }
    const accessKeys= Object.keys(accessData);
    if (accessKeys.length > 0) {
      accessKeys.forEach(function(key) {delete accessData[key]});
    }
    aborted = false;
    userFetchCount = 0;
    userFetchTotal = 0;
    minimumRateRemaining = null;
    maximumRequestCost = null;
    displaySummary = true;
    startTime = 0;
    finishTime = 0;
  }

  function activateLink() {
    document.getElementById(uniqueLinkId).addEventListener('click', setupBottleneck, {
      'once' : true,
    });
  }

})();
