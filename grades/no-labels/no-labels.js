/*
 * This script with disable / reset the late policy status in the new Canvas Gradebook
 * It does not have a slick interface yet, but I want to get it out there for people to use
 * See the instructions in the Canvas Community
 * https://community.canvaslms.com/people/james@richland.edu/blog/2019/01/10/removing-missing-and-late-labels
 * You may want to edit the config section before executing this script
 */
(function() {
  'use strict';

  const config = {
    'missing' : true, // disable Missing labels, can be done at any time
    'late' : false, // remove late labels, only affects things after submissions
    'reset' : false, // reset missing or late status to Canvas default
  };

  const courseRegex = new RegExp('^/courses/(\\d+)/(assignments|quizzes|discussion_topics)(?:/(\\d+))?');
  const courseMatch = courseRegex.exec(window.location.pathname);
  if (!courseMatch) {
    return;
  }

  const courseId = courseMatch[1];
  const contextType = courseMatch[2];
  const contextId = typeof courseMatch[3] === 'undefined' ? false : courseMatch[3];

  let url = '/api/v1/courses/' + courseId;
  switch (contextType) {
  case 'assignments':
    if (contextId) {
      url += '/assignments/' + contextId;
    } else {
      url += '/assignment_groups?include[]=assignments'
          + '&exclude_response_fields[]=rubric&exclude_response_fields[]=description&override_assignment_dates=false';
    }
    break;
  case 'discussion_topics':
    if (contextId) {
      url += '/discussion_topics/' + contextId;
    } else {
      url += '/discussion_topics?exclude_assignment_descriptions=true&plain_messages=true&per_page=30';
    }
    break;
  case 'quizzes':
    if (contextId) {
      url += '/quizzes/' + contextId;
    } else {
      url += '/quizzes?per_page=30';
    }
    break;
  }

  console.log('Beginning to set labels.');
  getAPI(url, 'assignments').then(function() {
    console.log('Finished setting labels.');
  });

  function getCookie(name) {
    return document.cookie.split(';').reduce(function(a, c) {
      const d = c.trim().split('=', 2);
      return d[0] === name ? decodeURIComponent(d[1]) : a;
    }, '');
  }

  function putAPI(url, data) {
    data.authenticity_token = getCookie('_csrf_token');
    const options = {
      'method' : 'PUT',
      'headers' : {
        'content-type' : 'application/json',
        'accept' : 'application/json'
      },
      'body' : JSON.stringify(data),
      'timeout' : 3000
    };
    return fetch(url, options);
  }

  function getAPI(url, handler) {
    const options = {
      'method' : 'GET',
      'headers' : {
        'content-type' : 'application/json',
        'accept' : 'application/json'
      },
      'timeout' : 3000
    };
    const linkRegex = new RegExp('<(.*?)>; rel="next"');
    let nextUrl = null;
    return fetch(url, options).then(function(res) {
      if (res.ok) {
        const linkHeader = res.headers.get('link');
        const links = linkRegex.exec(linkHeader);
        if (links) {
          nextUrl = links[1];
        }
        return res.json();
      } else {
        return Promise.reject(res.status);
      }
    }).then(function(json) {
      return processData(json, handler);
    }).then(function() {
      return nextUrl ? getAPI(nextUrl, handler) : Promise.resolve(true);
    });
  }

  function processData(data, handler) {
    switch (handler) {
    case 'assignments':
      return processAssignments(data);
      break;
    case 'submissions':
      return processSubmissions(data);
      break;
    }
    return Promise.resolve(true);
  }

  function processSubmissions(data) {
    const P = [];
    let status;
    for (let i = 0; i < data.length; i++) {
      const submission = data[i];
      status = false;
      if (submission.excused) {
        // Do not do anything with excused submissions
        continue;
      }
      if (config.reset) {
        if (submission.late_policy_status === 'none') {
          const isMissing = submission.submitted_at === null;
          const isLate = (submission.cached_due_date && submission.submitted_at && submission.submitted_at > submission.cached_due_date) ? true
              : false;
          if ((config.missing && isMissing) || (config.late && isLate)) {
            status = null;
          }
        }
      } else if (submission.late_policy_status === null) {
        if ((config.missing && !submission.late) || (config.late && submission.late)) {
          status = 'none';
        }
      }
      if (status !== false) {
        const parms = {
          'submission' : {
            'late_policy_status' : status
          }
        };
        const url = '/api/v1/courses/' + courseId + '/assignments/' + submission.assignment_id + '/submissions/'
            + submission.user_id;
        P.push(putAPI(url, parms));
      }
    }
    return Promise.all(P);
  }

  function processAssignments(data) {
    const assignmentIds = [];
    let id = null;
    if (!Array.isArray(data)) {
      id = checkAssignment(data);
      if (id) {
        assignmentIds.push(id);
      }
    } else {
      if (contextType === 'assignments') {
        data.forEach(function(group) {
          group.assignments.forEach(function(a) {
            id = checkAssignment(a);
            if (id) {
              assignmentIds.push(id);
            }
          });
        });
      } else {
        data.forEach(function(a) {
          id = checkAssignment(a);
          if (id) {
            assignmentIds.push(id);
          }
        });
      }
    }
    return getSubmissions(assignmentIds);
  }

  function checkAssignment(a) {
    const types = [ 'none', 'not_graded', 'on_paper', 'wiki_page', 'external_tool' ];
    let valid = false;
    if (contextId === false || (contextId == a.id)) {
      let dueAt = false;
      let assignmentId = false;
      let extra = true;
      switch (contextType) {
      case 'assignments':
        assignmentId = a.id;
        dueAt = a.due_at;
        extra = !a.submission_types.some(function(t) {
          return types.indexOf(t) > -1;
        })
        break;
      case 'discussion_topics':
        assignmentId = a.assignment_id;
        dueAt = typeof a.assignment !== 'undefined' ? a.assignment.due_at : false;
        break;
      case 'quizzes':
        assignmentId = a.assignment_id;
        dueAt = a.due_at;
        break;
      }
      valid = (dueAt && assignmentId && extra) ? assignmentId : false;
    }
    return valid;
  }

  function getSubmissions(assignmentIds) {
    const P = [];
    if (assignmentIds.length) {
      let n = assignmentIds.length;
      let m = Math.ceil(n / 4);
      if (m > 10 || n <= 10) {
        m = 10;
      }
      let a = 0;
      while (a < n) {
        let b = a + m > n ? n : a + m;
        const url = '/api/v1/courses/' + courseId + '/students/submissions' + '?student_ids[]=all&enrollment_state=active'
            + '&exclude_response_fields[]=attachments&exclude_response_fields[]=discussion_entries'
            + '&exclude_response_fields[]=preview_url&per_page=40&assignment_ids[]='
            + assignmentIds.slice(a, b).join('&assignment_ids[]=');
        P.push(getAPI(url, 'submissions'));
        a = b;
      }
    }
    return Promise.all(P);
  }

})();
