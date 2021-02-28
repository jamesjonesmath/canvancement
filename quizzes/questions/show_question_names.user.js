// ==UserScript==
// @name        Show Question Names
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Appends the name of the question to the Question number when viewing quiz results
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     4
// @grant none
// ==/UserScript==
/**
 * This script uses a request cache mode of force-cache.
 * This will fetch information from the cache to make things go much, much faster,
 * at the expense of possibly stale data.
 *
 * If you update the quiz question names after you have used this script,
 * then the changes will not be reflected. This is a naive approach designed
 * for speed. The delay with Canvas fetching the data for every student in SpeedGrader
 * was noticeable.
 *
 * If you need to refresh the page, then clear the browser's cache with Shift+Ctrl+Del.
 * Alternatively, you can set the forceCache variable to false to use the browser's default behavior.
 */
(function () {
  'use strict';

  const forceCache = true;

  fetchQuestionNames()
    .then(displayQuestionNames)
    .catch(e => console.log(e));

  function fetchQuestionNames() {
    return new Promise((resolve, reject) => {
      const form = document.getElementById('update_history_form');
      if (!form) {
        reject('No form on page');
      }
      const actionRegex = new RegExp(
        '/courses/([0-9]+)/quizzes/([0-9]+)/submissions/([0-9]+)$'
      );
      const match = actionRegex.exec(form.action);
      if (!match) {
        reject('Action has unexpected pattern');
      }
      const courseId = match[1];
      const quizId = match[2];
      const url = `/api/v1/courses/${courseId}/quizzes/${quizId}/questions?per_page=50`;
      resolve(getJson(url));
    });
  }

  function displayQuestionNames(data) {
    return new Promise((resolve, reject) => {
      if (!data) {
        reject('No data');
      }
      const titleRegEx = new RegExp('^Question [0-9]+$');
      for (let i = 0; i < data.length; i++) {
        const questionName = data[i].question_name;
        if (questionName && questionName !== 'Question') {
          const question = document.getElementById('question_' + data[i].id);
          if (!question) {
            continue;
          }
          const titles = question.querySelectorAll(
            'div.header span.name.question_name'
          );
          for (let k = 0; k < titles.length; k++) {
            const title = titles[k];
            for (let j = 0; j < title.childNodes.length; j++) {
              const existingText = title.childNodes[j].textContent;
              if (
                existingText &&
                titleRegEx.test(existingText) &&
                existingText !== data[i].question_name
              ) {
                title.childNodes[j].textContent += `: ${questionName}`;
              }
            }
          }
        }
      }
      resolve();
    });
  }

  function getJson(url) {
    const init = {
      credentials: 'same-origin',
      headers: new Headers({
        accept: 'application/json',
      }),
    };
    if (forceCache) {
      init.cache = 'force-cache';
    }
    return fetch(url, init)
      .then(response => {
        const links = checkLinkHeader(response.headers.get('link'));
        if (typeof links !== 'undefined' && links.length) {
          const promises = links.map(u => getJson(u));
          promises.unshift(response.json());
          return Promise.all(promises).then(values => {
            const data = [];
            values.map(v => Array.prototype.push.apply(data, v));
            return Promise.resolve(data);
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
})();
