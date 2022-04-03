// ==UserScript==
// @name         Rubric Max Ratings
// @description  Autofill rubric with maximum points
// @namespace    https://github.com/jamesjonesmath/canvancement
// @version      1
// @include      https://*.instructure.com/courses/*/gradebook/speed_grader?*
// @supportURL   https://community.canvaslms.com/t5/Higher-Ed-Canvas-Users/Autofill-Maximum-Rubric-Ratings/ba-p/518278
// @grant        none
// ==/UserScript==
/* global ENV */
(function () {
  'use strict';

  const speedGraderRegex = /^\/courses\/\d+\/gradebook\/speed_grader$/;
  if (!speedGraderRegex.test(window.location.pathname)) {
    return;
  }

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;

  rubricObserver();

  function rubricObserver(mutations = null, observer = null) {
    const rubric = document.getElementById('rubric_full');
    if (observer === null) {
      const obs = new MutationObserver(rubricObserver);
      obs.observe(rubric, { childList: true, subtree: true });
    } else {
      const heading = rubric.querySelector(
        'div.rubric_container.rubric.assessing div.react-rubric table thead'
      );
      if (heading) {
        observer.disconnect();
        addButton();
      }
    }
  }

  function addButton() {
    const th = document.querySelector(
      '#rubric_full div.rubric_container.rubric.assessing div.react-rubric table thead > tr:last-child th:last-child'
    );
    if (!th) {
      return;
    }
    const button = document.createElement('button');
    button.id = 'jj_rubric-max_points';
    button.style.marginLeft = '1em';
    button.textContent = 'Max';
    button.classList.add('Button', 'Button--success', 'Button--small');
    button.addEventListener('click', maxRatings);
    th.appendChild(button);
  }

  function maxRatings(event) {
    let i = 0;
    event.target.style.pointerEvents = 'none';
    document
      .getElementById('rubric_full')
      .querySelectorAll('tbody input[type=text]')
      .forEach(e => {
        if (!e.value) {
          const points = ENV.rubric.criteria[i].points || 0;
          nativeInputValueSetter.call(e, points);
          e.dispatchEvent(new Event('change', { bubbles: true }));
        }
        i++;
      });
    event.target.style.pointerEvents = null;
  }
})();
