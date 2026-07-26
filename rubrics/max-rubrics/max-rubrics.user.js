// ==UserScript==
// @name         Max Rubrics
// @description  Enhancements to maximize rubric efficiency in Canvas SpeedGrader
// @namespace    https://github.com/jamesjonesmath/canvancement
// @version      0.11
// @match        https://*.instructure.com/courses/*/gradebook/speed_grader?*
// @supportURL   https://community.instructure.com/en/discussion/518278/autofill-maximum-rubric-ratings
// @grant        none
// ==/UserScript==
/* global ENV */
(function () {
  'use strict';

  // This is BETA software. Make sure you understand it first.

  // User configurable options.
  // Documentation follow the configuration section

  const buttons = [
    { label: 'Max ∅', actions: ['max'] },
    { label: 'Max 🗨', actions: ['max', 'save', 'comment'] },
    // { label: 'Max A ↓', actions: ['max:1-3', 'comment'] },
    // { label: 'Max B ↓', actions: ['max~5-7', 'comment'] },
    { label: 'Max ▶', actions: ['max', 'save', 'advance'] },
    { label: 'Min', actions: ['min', 'save', 'comment'] },
    // { label: 'Min ▶', actions: ['min', 'save', 'advance'] },
    // { label: 'Copy', actions: ['copy'] },
    // { label: 'Paste', actions: ['paste'] },
    // {label: 'Paste', actions: ['paste', 'save']},
    // {label: 'Paste ▶', actions: ['paste','save','advance']},
    // {label: 'Paste+ ▶', actions: ['paste+','save','advance']},
    { label: '🗨', actions: ['comment'] },
    { label: 'Save', actions: ['save'] },
    { label: 'Save ▶', actions: ['save', 'advance'] },
    { label: 'Clear', actions: ['clear'] },
  ];

  const options = {
    suppressSuccessAlert: true,
    hideCriterionCommentToggle: true,
    hideRubricPointsLabel: true,
    hideRubricUnits: ' pts', // language dependent
    hideRatingLongText: true,
    hideRubricComments: true,
    criteriaMaxHeight: '75px',
    hideLongDescriptions: true,
    cellShading: true,
    hideCommentLibrary: true,
  };

  // End of configurable options

  /**
   * Configuration Documentation
   * Allowed actions:
   *   clear: clears all criteria ratings and comments.
   *   max: applies maximum points to unfilled criteria.
   *   min: applies minimum points to unfilled criteria.
   *   copy: makes a copy of the rubric, including submission comments
   *   paste: paste the copied rubric, including submission comments
   *   save: saves the rubric.
   *   comment: jumps to the assignment comment box.
   *   advance: advances to the next student. Implies save; will not advance if save fails.
   *
   * Parameters:
   *   clear, max, and min accept an optional criteria row list.
   *     use a : (colon) to specify the rows to include. e.g., max:1-3,5,7-8
   *     or a ~ (tilde) to specify the rows to exclude e.g. max~4-6,10
   * The actions are applied in the order listed above
   *   max and min are mutually exclusive. max wins if both are present.
   *   comment and advance are mutually exclusive. comment wins if both are present.
   *   if either copy or paste is present, both are required.
   *
   */

  const allowedActions = [
    'max',
    'min',
    'clear',
    'copy',
    'paste',
    'save',
    'comment',
    'advance',
  ];

  const idPrefix = 'jj_max_rubrics';

  const rubricAssessmentSelector =
    'section div[data-testid="enhanced-rubric-assessment-container"]';

  const compactRowList = (list = []) => {
    if (list.length === 0) {
      return '';
    }
    const rows = [];
    let row = [];
    for (const a of list) {
      if (row.length === 0) {
        row.push(a);
        continue;
      }
      if (a === row.at(-1) + 1) {
        row.push(a);
      } else {
        rows.push(row);
        row = [a];
      }
    }
    if (row.length > 0) {
      rows.push(row);
    }
    const items = rows.map(e => (e.length > 1 ? `${e.at(0)}-${e.at(-1)}` : e));
    return items.join(',');
  };

  const expandRowList = (txt = '') => {
    const rangeRegex = /^(\d+)-(\d+)$/;
    const numberRegex = /^(\d+)$/;
    const rows = new Set();
    const parts = txt.split(',');
    for (const part of parts) {
      if (numberRegex.test(part)) {
        const row = Number.parseInt(part, 10);
        rows.add(row);
      } else if (rangeRegex.test(part)) {
        const range = part.split('-');
        const a = Number.parseInt(range[0], 10);
        const b = Number.parseInt(range[1], 10);
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        for (let i = start; i <= end; i++) {
          rows.add(i);
        }
      }
    }
    const items = [...rows];
    items.sort((a, b) => a - b);
    return items;
  };

  const parseAction = (txt = null) => {
    const regex = new RegExp(String.raw`^(max|min|clear)([:~])?([0-9,-]+)$`);
    const item = {
      action: null,
    };
    txt = (txt ?? '').replaceAll(' ', '');
    if (regex.test(txt)) {
      const match = regex.exec(txt);
      const act = match[1];
      const operand = match[2] ?? ':';
      const rows = expandRowList(match[3]);
      if (rows.length > 0) {
        item.action = act;
        item.rows = rows;
        item.operand = operand;
      }
    } else if (allowedActions.includes(txt)) {
      item.action = txt;
    }
    return item;
  };

  const sanitizeActions = actions => {
    const cmdRegex = /^([a-z]+)/;
    const sanitized = new Set();
    const extraInfo = {};
    for (const act of actions) {
      const parsed = parseAction(act);
      const match = cmdRegex.exec(parsed.action);
      if (!match) {
        continue;
      }
      const action = match[1];
      if (action === 'null') {
        throw new Error(`Invalid action: ${act}`);
      }
      if (allowedActions.includes(action)) {
        if (action === 'advance' && !sanitized.has('save')) {
          sanitized.add('save');
        }
        if (!sanitized.has(action)) {
          sanitized.add(action);
        }
        sanitized.add(action);
        if (parsed.rows && parsed.operand) {
          extraInfo[action] = parsed;
        }
      }
    }
    if (sanitized.has('max') && sanitized.has('min')) {
      sanitized.delete('min');
    }
    if (sanitized.has('comment') && sanitized.has('advance')) {
      sanitized.delete('advance');
    }
    const items = [];
    for (const action of allowedActions) {
      if (sanitized.has(action)) {
        if (extraInfo[action]) {
          const rowStr = compactRowList(extraInfo[action].rows);
          const operand = extraInfo[action].operand;
          items.push(`${action}${operand}${rowStr}`);
        } else {
          items.push(action);
        }
      }
    }
    return items;
  };

  const determineLayout = () => {
    const layoutStyles = {
      traditional: 'rubric-assessment-traditional-view',
      vertical: 'rubric-assessment-vertical-display',
      horizontal: 'rubric-assessment-horizontal-display',
    };
    const container = document.querySelector(
      `${rubricAssessmentSelector} main`,
    );
    if (!container) {
      console.log('Unable to find rubric container');
      return;
    }
    let layout = null;
    let criteria = null;
    for (const [key, value] of Object.entries(layoutStyles)) {
      const elements = container.querySelectorAll(
        `div[data-testid="${value}"]`,
      );
      if (elements.length > 0) {
        layout = key;
        criteria = elements;
        break;
      }
    }
    const info = {
      layout: layout,
      criteria: criteria,
    };
    return info;
  };

  const getCriteria = () => {
    const info = determineLayout();
    if (!info.layout) {
      return;
    }
    let criteria = info.criteria;
    if (info.layout === 'traditional') {
      const container = info.criteria[0];
      criteria = container.querySelectorAll('table > tbody > tr');
    }

    const item = {
      criteria: criteria,
      layout: info.layout,
    };
    return item;
  };

  const getButton = el => {
    let button = null;
    if (el) {
      button = el.tagName === 'BUTTON' ? el : el.querySelector('button');
    }
    return button ?? null;
  };

  const clickEvent = () =>
    new Event('click', {
      bubbles: true,
      cancelable: true,
    });

  const selectRating = el => {
    if (!el) {
      return;
    }
    return new Promise(resolve => {
      const observer = new MutationObserver((mutations, obs) => {
        obs.disconnect();
        resolve();
      });
      observer.observe(el, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
      el.dispatchEvent(clickEvent());
    });
  };

  const ratingsHasSelected = (ratings = []) =>
    ratings.some(e => e.querySelector('div[data-testid$="-selected"]'));

  const ratingsSelected = (ratings = []) =>
    ratings.find(e => e.querySelector('div[data-testid$="-selected"]'));

  const getRubric = () => {
    const criteria = getCriteria();
    if (!criteria) {
      return;
    }
    const rubric = {
      layout: criteria.layout,
      ratings: [],
      comments: [],
    };
    const isTraditional = criteria.layout === 'traditional';
    if (isTraditional) {
      const criteriaRows = [...criteria.criteria].filter(
        e => e.cells.length === 3,
      );
      for (const row of criteriaRows) {
        if (features.comments) {
          const comment = row.querySelector('td:nth-child(2) textarea');
          rubric.ratings.push(comment);
        } else {
          const ratings = [...row.querySelectorAll('td:nth-child(2) button')];
          rubric.ratings.push(ratings);
        }
        const nextEl = row.nextElementSibling;
        let comment = null;
        if (
          nextEl &&
          nextEl.tagName === 'TR' &&
          nextEl.cells.length === 1 &&
          nextEl.cells[0].colSpan === 3
        ) {
          comment = nextEl.querySelector('textarea') ?? null;
        }
        rubric.comments.push(comment);
      }
    } else {
      for (const criterion of criteria.criteria) {
        const buttons = [...criterion.querySelectorAll('button')];
        const ratings = buttons.map(e => e.parentElement.parentElement);
        rubric.ratings.push(ratings);
        const el = criterion.parentElement.nextElementSibling;
        let comment = null;
        if (el && el.tagName === 'DIV') {
          comment = el.querySelector('textarea');
        }
        rubric.comments.push(comment);
      }
    }
    return rubric;
  };

  const sendChangeEvent = el => {
    if (!el) {
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement) {
      el.focus({ preventScroll: true });
      el.dispatchEvent(new Event('change', { bubbles: true }));
      activeElement.focus();
    }
  };

  const changeText = (el, txt) => {
    if (el.value === txt) {
      return;
    }
    nativeTextAreaValueSetter.call(el, txt);
    sendChangeEvent(el);
  };

  const changeInput = (el, txt) => {
    if (el.value === txt) {
      return;
    }
    nativeInputValueSetter.call(el, txt);
    sendChangeEvent(el);
  };

  // const changeText = (items = []) => {
  //   const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  //     window.HTMLInputElement.prototype,
  //     'value',
  //   ).set;
  //   let i = 0;
  //   items.forEach(e => {
  //     if (!e.value || e.value === '--') {
  //       const points = ENV.rubric.criteria[i].points || 0;
  //       nativeInputValueSetter.call(e, points);
  //       e.dispatchEvent(new Event('change', { bubbles: true }));
  //     }
  //     i++;
  //   });
  // };

  const prepareCriteriaFilter = parsed => {
    const action = parsed.action;
    let operand = null;
    let rows = null;
    const hasFilter = Array.isArray(parsed.rows) && parsed.rows.length > 0;
    if (hasFilter) {
      operand = parsed.operand ?? ':';
      rows = new Set(parsed.rows);
    }
    const info = {
      action: action,
      isFiltered: hasFilter,
      operand: operand,
      rows: rows,
    };
    return info;
  };

  const isRowFiltered = (filter, rowNumber) => {
    let filtered = false;
    if (
      filter.isFiltered &&
      ((filter.operand === ':' && !filter.rows.has(rowNumber)) ||
        (filter.operand === '~' && filter.rows.has(rowNumber)))
    ) {
      filtered = true;
    }
    return filtered;
  };

  const changeRatings = async info => {
    const action = info.action;
    const filter = prepareCriteriaFilter(info);
    const criteria = getCriteria();
    console.log(criteria);
    if (!criteria) {
      return;
    }
    const isTraditional = criteria.layout === 'traditional';
    let rowNumber = 0;
    for (const criterion of criteria.criteria) {
      rowNumber++;
      if (isRowFiltered(filter, rowNumber)) {
        continue;
      }
      let ratings = null;
      if (isTraditional) {
        ratings = [...criterion.querySelectorAll('td:nth-child(2) button')];
      } else {
        const buttons = [...criterion.querySelectorAll('button')];
        ratings = buttons.map(e => e.parentElement.parentElement);
      }
      if (ratingsHasSelected(ratings)) {
        continue;
      }
      const rating = action === 'max' ? ratings.at(0) : ratings.at(-1);
      const button = getButton(rating);
      await selectRating(button);
    }
  };

  const rubricAction = async info => {
    const action = info.action;
    const rubric = getRubric();
    if (!rubric || rubric.ratings.length === 0) {
      return;
    }
    switch (action) {
      case 'clear':
        for (const rating of rubric.ratings) {
          const el = ratingsSelected(rating);
          const button = getButton(el);
          await selectRating(button);
        }
        for (const comment of rubric.comments) {
          if (comment) {
            changeText(comment, '');
            // comment.value = '';
          }
        }
        break;
      case 'copy':
        const ratings = [];
        const comments = [];
        for (const rating of rubric.ratings) {
          const el = ratingsSelected(rating);
          if (!el) {
            ratings.push(null);
            continue;
          }
          let testid = el.dataset?.testid;
          if (!testid) {
            const parent = el.closest('span');
            testid = parent.dataset?.testid;
          }
          ratings.push(testid ?? null);
        }
        for (const comment of rubric.comments) {
          if (!comment) {
            comments.push(null);
            continue;
          }
          comments.push(comment.value);
        }
        storedRubric.ratings = ratings;
        storedRubric.comments = comments;
        storedRubric.ready = true;
        console.log(storedRubric);
        break;
      case 'paste':
        break;
      default:
        console.log(`Unknown action: ${action}`);
        break;
    }
  };

  const traditionalRubricCriteriaAdjustments = (ratings = []) => {
    for (const row of ratings) {
      if (row.length === 0) {
        console.log('Empty row');
        console.log(ratings);
        continue;
      }
      const firstButton = row[0];
      const tr = firstButton.closest('tr');
      const pointsEl = tr.querySelector('td:last-child');
      if (!pointsEl) {
        continue;
      }
      if (options?.hideCriterionCommentToggle) {
        const commentButton = pointsEl.querySelector(
          'button[data-testid^="toggle-comment"]',
        );
        if (commentButton) {
          commentButton.parentElement.style.display = 'none';
        }
      }
      if (options?.hideRubricPointsLabel) {
        const labelEl = pointsEl.querySelector(
          'label[data-cid="TextInput"] > span',
        );
        if (labelEl) {
          labelEl.style.display = 'none';
        }
      }
      if (options?.hideRubricUnits) {
        const labelEl = pointsEl.querySelector('label[data-cid="TextInput"]');
        if (labelEl) {
          const unitsEl = labelEl.parentElement.nextElementSibling;
          if (unitsEl) {
            const unitSpan = unitsEl.querySelector('span');
            if (
              unitSpan &&
              unitSpan.textContent.includes(options.hideRubricUnits)
            ) {
              unitSpan.textContent = unitSpan.textContent.replace(
                options.hideRubricUnits,
                '',
              );
            }
          }
        }
      }
      if (options?.hideRatingLongText) {
        for (const button of row) {
          const longTextEl = button.querySelector(
            ':scope > span > span:nth-child(2)',
          );
          if (longTextEl) {
            if (typeof options.hideRatingLongText === 'string') {
              longTextEl.textContent = options.hideRatingLongText;
            } else {
              longTextEl.style.display = 'none';
            }
          }
        }
      }
      if (options?.criteriaMaxHeight) {
        const els = [
          tr.querySelector('td:first-child > div > div'),
          ...row.map(e => e.closest('td').querySelector('div > div')),
        ];
        console.log(els);
        const height = options.criteriaMaxHeight;
        for (const el of els) {
          if (el) {
            el.style.maxHeight = height;
            el.style.overflow = 'ellipsis';
          }
        }
      }
    }
  };

  const hideObnoxiousContent = () => {
    const rubric = getRubric();
    if (!rubric) {
      return;
    }
    const isTraditional = rubric.layout === 'traditional';
    if (isTraditional) {
      traditionalRubricCriteriaAdjustments([...rubric.ratings]);
    }
  };

  const saveClassicRubricFinished = async el => {
    const button = document.querySelector(
      'button[data-testid="view-rubric-button"]',
    );
    if (!button) {
      return;
    }
    return new Promise(resolve => {
      const observer = new MutationObserver((mutations, obs) => {
        const state = button.getAttribute('aria-expanded');
        const success = state === 'false';
        obs.disconnect();
        resolve(success);
      });
      observer.observe(button, {
        attributes: true,
        attributeFilter: ['aria-expanded'],
      });
      if (el) {
        el.dispatchEvent(clickEvent());
      }
    });
  };

  const saveEnhancedRubricFinished = async (el = null) => {
    const alertElement = document.body.querySelector(
      '#react-router-portals > div:not(#liveRegion)',
    );
    if (!alertElement) {
      return;
    }
    if (
      alertElement.style.display === 'none' &&
      options?.suppressSuccessAlert
    ) {
      alertElement.style.removeProperty('display');
    }
    return new Promise(resolve => {
      const observer = new MutationObserver((mutations, obs) => {
        const svg = alertElement.querySelector('div[data-testid="alert"] svg');
        if (svg) {
          const svgName = svg.getAttribute('name');
          const success = svgName === 'IconCheckMark';
          obs.disconnect();
          if (success && options?.suppressSuccessAlert) {
            console.log('Suppressing success alert');
            alertElement.style.display = 'none';
          }
          resolve(success);
        }
      });
      observer.observe(alertElement, { childList: true });
      if (el) {
        el.dispatchEvent(clickEvent());
      }
    });
  };

  const saveRubric = async () => {
    const el = document.querySelector(
      `${rubricAssessmentSelector} footer button[data-testid="save-rubric-assessment-button"]`,
    );
    if (!el || el.disabled) {
      return true;
    }
    const success = await (features.enhancedRubrics
      ? saveEnhancedRubricFinished(el)
      : saveClassicRubricFinished(el));
    return success;
  };

  const saveRubricAdvance = async () => {
    if (!alertElement) {
      return;
    }
    await saveEnhancedRubricFinished();
  };

  const advanceStudent = async () => {
    const studentIndex = document.querySelector(
      '#top-menu span[data-testid="current-student-index"]',
    );
    const nextStudentButton = document.getElementById('next-student-button');
    if (!studentIndex || !nextStudentButton) {
      return;
    }
    return new Promise(resolve => {
      const observer = new MutationObserver((mutations, obs) => {
        obs.disconnect();
        resolve();
      });
      observer.observe(studentIndex, { childList: true, subtree: true });
      nextStudentButton.dispatchEvent(clickEvent());
    });
  };

  const submissionCommentElement = () => {
    const iframe = document.querySelector(
      'aside section iframe.tox-edit-area__iframe',
    );
    const contentWindow = iframe?.contentWindow;
    if (!contentWindow) {
      return null;
    }
    const el = contentWindow.document.querySelector('body');
    return el;
  };

  const commentFocus = () => {
    const el = submissionCommentElement();
    if (el) {
      el.focus();
    }
  };

  const addButton = (toolbar, options, callback = buttonHandler) => {
    const button = document.createElement('button');
    button.id = options.id;
    button.textContent = options.label ?? 'Unnamed';
    button.style.margin = '0px 5px 0px 0px';
    button.title = options.title;
    button.disabled = options.disabled;
    button.addEventListener('click', callback);
    toolbar.appendChild(button);
  };

  const buttonHandler = async event => {
    const buttonRegex = new RegExp(String.raw`^${idPrefix}-btn_(\d+)$`);
    const match = buttonRegex.exec(event.target.id);
    if (!match) {
      return;
    }
    const id = Number.parseInt(match[1], 10);
    const button = buttons.at(id - 1);
    const actions = sanitizeActions(button.actions);
    let validSave = false;
    for (const act of actions) {
      const parsed = parseAction(act);
      const action = parsed.action;
      switch (action) {
        case 'max':
        case 'min':
          await changeRatings(parsed);
          break;
        case 'clear':
        case 'copy':
        case 'paste':
          await rubricAction(parsed);
          break;
        case 'save':
          validSave = await saveRubric();
          break;
        case 'comment':
          commentFocus();
          break;
        case 'advance':
          if (validSave) {
            await advanceStudent();
          }
          break;
        default:
          console.log(`Unknown button: ${id}`);
          break;
      }
    }
  };

  const addToolbar = () => {
    const toolbarExists = document.getElementById(idPrefix);
    const header = document.querySelector(`${rubricAssessmentSelector} header`);
    if (toolbarExists || !header) {
      return false;
    }
    const toolbar = document.createElement('span');
    toolbar.id = idPrefix;
    toolbar.dir = 'ltr';
    toolbar.style.flexDirection = 'row';
    toolbar.style.display = 'flex';
    let i = 1;
    for (const button of buttons) {
      const actions = sanitizeActions(button.actions);
      const disabled = actions.includes('paste') && !storedRubric.ready;
      const label = button.label;
      const title = actions.join(', ');
      const id = `${idPrefix}-btn_${i++}`;
      const buttonOptions = { label, id, title, disabled };
      addButton(toolbar, buttonOptions, buttonHandler);
    }
    const horizontalLine = header.querySelector('hr');
    horizontalLine.before(toolbar);
    return true;
  };

  /**
   * Watch the aside for changes, which happens when you move through students
   * Toolbar must be created each time
   */
  const asideObserver = (_mutations = null, observer = null) => {
    const aside = document.querySelector(
      'aside span[data-testid="speedgrader-feedback"]',
    );
    if (observer === null) {
      const obs = new MutationObserver(asideObserver);
      obs.observe(aside, { childList: true, subtree: true });
    } else if (addToolbar()) {
      hideObnoxiousContent();
    }
  };

  const hasRubricObserver = (_mutations = null, observer = null) => {
    const enhancedRubric = document.getElementById('rubric-feedback-tab');
    const classicRubric = document.querySelector('div.rubric_container');
    const hasRubric = !!(enhancedRubric || classicRubric);
    if (hasRubric) {
      if (observer) {
        observer.disconnect();
      }
      asideObserver();
    } else if (observer === null) {
      const el = document.getElementById('react-router-portals');
      const obs = new MutationObserver(hasRubricObserver);
      obs.observe(el, {
        childList: true,
        subtree: true,
      });
    }
  };

  const determineFeatures = () => {
    const features = {
      hasRubric: false,
      oldSpeedGrader: false,
      enhancedRubrics: false,
    };
    const fullRubric = document.getElementById('rubric_full');
    const rubricFeedback = document.getElementById('rubric-feedback-tab');
    const crumbs = document.querySelector('div.ic-app-crumbs');
    const viewButton = document.querySelector(
      'button[data-testid="view-rubric-button"]',
    );
    // Use ENV variables if available
    if (ENV?.ENHANCED_RUBRICS_ENABLED !== undefined) {
      features.oldSpeedGrader = false;
      features.enhancedRubrics = ENV.ENHANCED_RUBRICS_ENABLED;
    } else if (ENV?.enhanced_rubrics_enabled !== undefined) {
      features.oldSpeedGrader = true;
      features.enhancedRubrics = ENV.enhanced_rubrics_enabled;
    } else if (crumbs) {
      features.oldSpeedGrader = true;
      features.enhancedRubrics = crumbs.classList.contains(
        'ic-app-crumbs-enhanced-rubrics',
      );
    } else {
      features.enhancedRubrics = !viewButton;
    }
    features.hasRubric = !!fullRubric || !!rubricFeedback || !!viewButton;
    return features;
  };

  const getCookie = name => {
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
  };

  const sendGraphQl = async request => {
    const csrfToken = getCookie('_csrf_token');
    const body =
      typeof request === 'object' ? JSON.stringify(request) : request;
    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: body,
    };
    const url = `${window.location.origin}/api/graphql`;
    const response = await fetch(url, options);
    let data = null;
    if (response.ok) {
      data = await response.json();
    }
    return data;
  };

  const assignmentHasRubric = async assignmentId => {
    const query =
      'query hasRubric($assignmentId:ID!){assignment(id:$assignmentId){hasRubric rubric{freeFormCriterionComments criteria{points}}}}';
    const variables = { assignmentId: assignmentId };
    const request = {
      query: query,
      variables: variables,
    };
    const data = await sendGraphQl(request);
    let hasRubric = false;
    const assignment = data?.data?.assignment ?? null;
    if (assignment) {
      hasRubric = assignment.hasRubric ?? false;
      features.hasRubric = hasRubric;
    }
    if (hasRubric) {
      features.comments = assignment.rubric.freeFormCriterionComments ?? false;
      const criteria = assignment.rubric.criteria ?? [];
      const points = criteria.map(e => e.points ?? 0);
      features.points = points;
    }
    console.log(features);
    return hasRubric;
  };

  const initializeRubric = async () => {
    if (features.oldSpeedGrader) {
      // Old SpeedGrader
      // The rubric is available in the body
      if (features.hasRubric) {
        // Old Speed Grader with Rubric
      }
    } else {
      // SpeedGrader with Usability and Performance Enhancements
      // The rubric is dynamically loaded so we do not know if there is one or not
      const match = /assignment_id=(\d+)/.exec(window.location.search);
      if (match) {
        const assignmentId = Number.parseInt(match[1], 10);
        const hasRubric = await assignmentHasRubric(assignmentId);
        if (hasRubric) {
          hasRubricObserver();
        }
      }
    }
  };

  const storedRubric = {
    ready: false,
    ratings: [],
    comments: [],
    submissionComment: null,
  };

  let alertElement = null;

  const features = determineFeatures();
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  ).set;
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value',
  ).set;

  const speedGraderRegex = /^\/courses\/[^\/]+\/gradebook\/speed_grader$/;
  if (speedGraderRegex.test(window.location.pathname)) {
    initializeRubric();
  }
})();
