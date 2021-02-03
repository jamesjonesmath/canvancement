// ==UserScript==
// @name        IntraGroup Peer Reviews
// @description Assign intra-group peer reviews
// @namespace   https://github.com/jamesjonesmath/canvancement
// @match       https://*.instructure.com/courses/*/assignments/*/peer_reviews
// @require     https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js
// @version     2
// @grant       none
// ==/UserScript==
/* global Bottleneck */

(function () {
  'use strict';
  const reloadPageWhenFinished = true;
  const debug = false;
  let courseId = null;
  let assignmentId = null;
  let groupSets = null;
  const pageRegex = new RegExp(
    '^/courses/([0-9]+)/assignments/([0-9]+)/peer_reviews$'
  );
  const pageMatches = pageRegex.exec(window.location.pathname);

  let limiter = null;
  if (typeof Bottleneck === 'function') {
    limiter = new Bottleneck({
      maxConcurrent: 10,
      minTime: 20,
    });
  }
  const fetch = limiter ? limiter.wrap(window.fetch) : window.fetch;

  if (pageMatches) {
    courseId = pageMatches[1];
    assignmentId = pageMatches[2];
    getJson(`/api/v1/courses/${courseId}/group_categories?per_page=50`).then(
      v => {
        if (!v || v.length === 0) {
          return;
        }
        if (v.length === 1) {
          groupSets = v;
          addDialog(v[0].id);
        } else {
          groupSets = sortEmbeddedNumeric(v, 'name');
          checkGroupAssignment();
        }
      }
    );
  }

  function checkGroupAssignment() {
    getJson(`/api/v1/courses/${courseId}/assignments/${assignmentId}`).then(
      v => {
        addDialog(v.group_category_id);
      }
    );
  }

  function sortEmbeddedNumeric(data, keyField) {
    const numberRegex = new RegExp('([0-9]+)', 'g');
    for (let i = 0; i < data.length; i++) {
      data[i].paddedKey = data[i][keyField].replace(
        numberRegex,
        (match, p1, offset, string) => {
          const padded = '0000' + match;
          return padded.substr(-5);
        }
      );
    }
    data.sort((a, b) => a.paddedKey.localeCompare(b.paddedKey));
    return data;
  }

  function addDialog(assignmentGroupId) {
    if (typeof groupSets === 'undefined' || groupSets.length === 0) {
      return;
    }
    const parent = document.querySelector(
      'div#right-side-wrapper aside#right-side'
    );
    if (!parent) {
      return;
    }
    const el = document.createElement('div');
    el.id = 'jj_intragroup';
    const heading = document.createElement('h3');
    heading.textContent = 'Intra-Group Reviews';
    el.appendChild(heading);
    const intro = document.createElement('div');
    intro.textContent =
      'This will assign reviews to other people in the same group.' +
      (reloadPageWhenFinished
        ? ' If any peer reviews are assigned, this page will reload when finished.'
        : '');
    el.appendChild(intro);
    const select = document.createElement('select');
    select.id = 'jj_intragroup_select';
    const defaultGroupSetId = assignmentGroupId ? assignmentGroupId : false;
    select.add(
      new Option('Choose a Group Set', 0, defaultGroupSetId === false)
    );
    for (let i = 0; i < groupSets.length; i++) {
      const item = groupSets[i];
      const groupSetId = item.id;
      const isSelected = defaultGroupSetId && defaultGroupSetId == groupSetId;
      select.add(new Option(item.name, groupSetId, isSelected, isSelected));
    }
    el.appendChild(select);
    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add(
      'button-container',
      'button-container-right-aligned'
    );
    const button = document.createElement('button');
    button.id = 'jj_intragroup_button';
    button.classList.add('btn');
    button.textContent = 'Assign IntraGroup Reviews';
    button.addEventListener('click', assignGroups, {
      once: true,
    });
    buttonDiv.appendChild(button);
    const progress = document.createElement('progress');
    progress.id = 'jj_intragroup_progress';
    progress.style.cssText = 'width: 90%; display: none; height: 2em;';
    buttonDiv.appendChild(progress);
    el.appendChild(buttonDiv);
    parent.appendChild(el);
  }

  function assignGroups() {
    const el = document.getElementById('jj_intragroup_select');
    if (!el) {
      return;
    }
    const selectedItems = el.selectedOptions;
    if (selectedItems.length !== 1 || selectedItems[0].value == 0) {
      return;
    }
    const button = document.getElementById('jj_intragroup_button');
    button.style.display = 'none';
    updateProgressBar();
    const groupSetId = selectedItems[0].value;
    getJson(`/api/v1/group_categories/${groupSetId}/groups?per_page=50`).then(
      processGroups
    );
  }

  function processGroups(groupList) {
    const groupIds = groupList.map(group => group.id);
    const p = groupIds.map(groupId =>
      getJson(`/api/v1/groups/${groupId}/users`)
    );
    Promise.all(p).then(values => {
      const groups = [];
      for (let i = 0; i < groupIds.length; i++) {
        groups.push({
          id: groupIds[i],
          users: values[i].map(user => user.id),
        });
      }
      addReviews(groups);
    });
  }

  function addReviews(groups) {
    const adds = computeNeeds(groups);
    if (adds.length) {
      updateProgressBar(0);
      const n = adds.length;
      let completed = 0;
      const csrfToken = getCookie('_csrf_token');
      const pl = adds.map(add => {
        const userId = add.userId;
        const reviews = add.reviews;
        const url = `/courses/${courseId}/assignments/${assignmentId}/peer_reviews/users/${userId}`;
        const p = reviews.map(revieweeId => {
          const data = {
            reviewee_id: revieweeId,
            authenticity_token: csrfToken,
          };
          return postData(url, data);
        });
        return Promise.all(p).then(() => {
          completed++;
          updateProgressBar(completed / n);
          return Promise.resolve(true);
        });
      });
      Promise.all(pl).then(() => {
        updateProgressBar(1);
        if (reloadPageWhenFinished && completed >= n) {
          window.location.reload();
        }
      });
    }
  }

  function updateProgressBar(x) {
    const progress = document.getElementById('jj_intragroup_progress');
    if (progress) {
      if (typeof x !== 'undefined') {
        progress.value = x;
        progress.textContent = `${Math.round(x * 100)}%`;
      }
      if (typeof x === 'undefined' || x === 0) {
        progress.style.display = 'inline-block';
      } else if (x === 1) {
        progress.style.display = 'none';
      }
    }
  }

  function computeNeeds(groups) {
    const existing = getUsers();
    const adds = [];
    for (let i = 0; i < groups.length; i++) {
      const users = groups[i].users;
      for (let j = 0; j < users.length; j++) {
        const userId = users[j];
        if (typeof existing[userId] === 'undefined') {
          continue;
        }
        const existingReviews = existing[userId];
        const reviews = [];
        for (let k = 0; k < users.length; k++) {
          if (j === k || typeof existing[users[k]] === 'undefined') {
            continue;
          }
          const dstUser = users[k];
          if (existingReviews.indexOf(dstUser) === -1) {
            reviews.push(dstUser);
          }
        }
        if (reviews.length) {
          adds.push({
            userId: userId,
            reviews: reviews,
          });
        }
      }
    }
    return adds;
  }

  function getUsers() {
    const users = {};
    const studentList = document.querySelectorAll(
      '#content ul li.student_reviews'
    );
    if (studentList.length > 0) {
      for (let i = 0; i < studentList.length; i++) {
        const item = studentList[i];
        const userSpan = item.querySelector('a span.user_id.student_review_id');
        if (userSpan) {
          const userId = userSpan.textContent;
          const reviews = [];
          const assignedList = item.querySelectorAll(
            'ul.peer_reviews li.peer_review.assigned'
          );
          if (assignedList) {
            for (let j = 0; j < assignedList.length; j++) {
              const assignSpan = assignedList[j].querySelector('span.user_id');
              if (assignSpan) {
                const assigneeId = parseInt(assignSpan.textContent);
                reviews.push(assigneeId);
              }
            }
          }
          users[userId] = reviews;
        }
      }
    }
    return users;
  }

  function getCookie(name) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    let cookieValue = null;
    let i = 0;
    while (i < cookies.length && cookieValue === null) {
      const cookie = cookies[i].split('=', 2);
      if (cookie[0] === name) {
        cookieValue = decodeURIComponent(cookie[1]);
      }
      i++;
    }
    return cookieValue;
  }

  function postData(url, data) {
    const init = {
      credentials: 'same-origin',
      headers: new Headers({
        'content-type': 'application/json',
        'accept': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify(data),
    };
    return fetch(url, init)
      .then(res => displayLimits(res, url))
      .then(response => response.json());
  }

  function getJson(url) {
    const init = {
      credentials: 'same-origin',
      headers: new Headers({
        'content-type': 'application/json',
        'accept': 'application/json',
      }),
    };
    return fetch(url, init)
      .then(res => displayLimits(res, url))
      .then(response => {
        const links = checkLinkHeader(response.headers.get('link'));
        if (typeof links !== 'undefined' && links.length) {
          const promises = links.map(u => getJson(u));
          promises.unshift(response.json());
          return Promise.all(promises).then(values => {
            const data = [];
            values.map(v => Array.prototype.push.apply(data, v));
            return data;
          });
        } else {
          return response.json();
        }
      })
      .catch(e => new Error(e));
  }

  function checkLinkHeader(hdrText) {
    if (typeof hdrText !== 'string') {
      return;
    }
    const linkHeaderRegex = new RegExp('<([^>]+)>; rel="(next|last)"', 'g');
    const links = {};
    const urls = [];
    let link = null;
    while ((link = linkHeaderRegex.exec(hdrText)) !== null) {
      const linkType = link[2];
      links[linkType] = new URL(link[1]);
    }
    if (typeof links.next !== 'undefined') {
      if (links.next.searchParams.has('page')) {
        const a = parseInt(links.next.searchParams.get('page'));
        if (a == 2 && typeof links.last !== 'undefined') {
          const b = parseInt(links.last.searchParams.get('page'));
          for (let i = a; i <= b; i++) {
            links.next.searchParams.set('page', i);
            urls.push(links.next.toString());
          }
        }
      } else {
        urls.push(links.next.toString());
      }
    }
    return urls;
  }

  function displayLimits(res, url) {
    if (debug) {
      const rate = res.headers.get('X-Rate-Limit-Remaining');
      const runtime = res.headers.get('X-Runtime');
      console.log(`${rate}\t${runtime}\t${res.status}\t${url}`);
    }
    return Promise.resolve(res);
  }
})();
