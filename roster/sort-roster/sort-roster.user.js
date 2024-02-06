// ==UserScript==
// @name        Sort the Roster
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Allows sorting on any column of the Canvas Course Roster
// @match       https://*.instructure.com/courses/*/users
// @require     https://cdn.jsdelivr.net/combine/npm/jquery@3.6.0,npm/tablesorter@2.31.3
// @author      James Jones
// @version     11
// @grant       none
// ==/UserScript==
/* global ENV, jQuery */
(function () {
  'use strict';

  const pageRegex = /^\/courses\/\d+\/users\/?$/;
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  const months = generateMonths(ENV.LOCALE);
  const dateRegex = generateDatePatterns();

  let jq = jQuery().jquery === '1.7.2' ? jQuery : jQuery.noConflict();

  checkJQuery();

  function checkJQuery() {
    if (typeof jq.fn.tablesorter === 'undefined') {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/tablesorter@2.31.3/dist/js/jquery.tablesorter.combined.min.js';
      script.onload = function () {
        if (jQuery !== jq) {
          jq = jQuery;
        }
        waitForRoster();
      };
      document.head.appendChild(script);
    } else {
      waitForRoster();
    }
  }

  function waitForRoster(mutations, observer) {
    const roster = document.querySelector('table.roster tbody');
    if (!roster) {
      if (typeof observer === 'undefined') {
        const sel = document.getElementById('content');
        const obs = new MutationObserver(waitForRoster);
        obs.observe(sel, {
          childList: true,
          subtree: true,
        });
      }
      return;
    }
    if (typeof observer !== 'undefined') {
      observer.disconnect();
    }
    if (roster) {
      watchForUpdates();
    }
  }

  function watchForUpdates(mutations, observer) {
    if (typeof observer === 'undefined') {
      const sel = document.querySelector('#content div[data-view="users"]');
      const obs = new MutationObserver(watchForUpdates);
      obs.observe(sel, { childList: true });
      rosterSort();
    } else {
      if (
        mutations.length === 1 &&
        mutations[0].addedNodes.length > 0 &&
        mutations[0].removedNodes.length > 0
      ) {
        rosterSort();
      }
    }
  }

  function rosterSort() {
    const columns = scanColumns();
    const tableColumns = document.querySelectorAll('table.roster thead tr th');
    const sortHeaders = {};
    const styles = {};
    tableColumns.forEach((col, c) => {
      const nthchildSelector = `:nth-child(${1 + c})`;
      if (col.children.length > 0) {
        sortHeaders[c] = { sorter: false, parser: false };
      } else if (c === columns.lastActivity || c === columns.totalActivity) {
        sortHeaders[c] = {
          sorter: c === columns.lastActivity ? 'shortDateTime' : 'extendedTime',
          empty: 'bottom',
          sortInitialOrder: 'desc',
        };
        styles[`table.roster tr th${nthchildSelector}`] = `text-align: right;`;
        styles[`table.roster tr td${nthchildSelector}`] = `text-align: right;`;
        styles[`table.roster tr th${nthchildSelector}`] = `cursor: pointer;`;
      } else {
        styles[`table.roster tr th${nthchildSelector}`] = `cursor: pointer;`;
      }
    });
    addCSS(styles);
    if (columns.lastActivity) {
      jq.tablesorter.addParser({
        id: 'shortDateTime',
        format: shortDateTimeFormat,
        parsed: false,
        type: 'text',
      });
    }
    if (columns.totalActivity) {
      jq.tablesorter.addParser({
        id: 'extendedTime',
        format: extendedTimeFormat,
        parsed: false,
        type: 'numeric',
      });
    }
    watchForAdditionalRows();
    jq('table.roster').tablesorter({
      sortReset: true,
      headers: sortHeaders,
      cssIconAsc: 'icon-mini-arrow-up',
      cssIconDesc: 'icon-mini-arrow-down',
      cssIconNone: 'icon-mini-arrow-double',
      headerTemplate: '{content}{icon}'
    });
  }

  function scanColumns() {
    const cols = { lastActivity: null, totalActivity: null };
    const rows = document.querySelectorAll('table.roster tbody tr.rosterUser');
    if (rows.length === 0) {
      return false;
    }
    const cells = rows[0].children;
    for (let j = cells.length; j--; j > 0) {
      const cell = cells[j - 1];
      const div = cell.querySelector('div');
      if (!div || div.classList.contains('admin-links')) {
        continue;
      }
      if (div.classList.contains('section')) {
        break;
      }
      if (
        div.hasAttribute('data-tooltip') &&
        div.hasAttribute('data-html-tooltip-title')
      ) {
        cols.lastActivity = j - 1;
        cols.totalActivity = j;
        break;
      }
    }
    return cols;
  }

  function watchForAdditionalRows() {
    const sel = document.querySelector('table.roster tbody');
    const countLabel = document.querySelector('.ui-tabs-anchor');
    const countText = countLabel.textContent;
    let rowsInRosterTable = sel.rows.length;
    window.scrollTo(window.scrollX, window.scrollY - 1);
    window.scrollTo(window.scrollX, window.scrollY + 1);
    countLabel.textContent = `${countText} (${rowsInRosterTable})`;
    if (rowsInRosterTable >= 50) {
      const observer = new MutationObserver(function () {
        if (sel.rows.length !== rowsInRosterTable) {
          rowsInRosterTable = sel.rows.length;
          window.scrollTo(window.scrollX, window.scrollY - 1);
          window.scrollTo(window.scrollX, window.scrollY + 1);
          countLabel.textContent = `${countText} (${rowsInRosterTable})`;
          jq('table.roster.tablesorter').trigger('update', [true]);
        }
      });
      observer.observe(sel, {
        childList: true,
      });
    }
  }

  function extractDateTooltip(s, cell) {
    let txt = s;
    if (cell.children.length === 1) {
      const div = cell.children[0];
      if (
        div.hasAttribute('data-tooltip') &&
        div.hasAttribute('data-html-tooltip-title')
      ) {
        txt = div.getAttribute('data-html-tooltip-title').trim();
      }
    }
    return txt;
  }

  function shortDateTimeFormat(s, table, cell, cellIndex) {
    if (s.trim() === '') {
      return 0;
    }
    const timeRegex = /(?:(am|pm) )?(\d+)(?:[:.](\d{2}))*(am|pm)?$/i;
    let hour = 0;
    let min = 0;
    const t = extractDateTooltip(s, cell);
    const dt = parseDate(s, t);
    const timeMatch = timeRegex.exec(t);
    if (timeMatch) {
      const ampm = timeMatch[4] || timeMatch[1] || null;
      hour = parseHour(timeMatch[2], ampm);
      min = parseInt(timeMatch[3] || '00', 10);
    }
    return new Date(dt.y, dt.m, dt.d, hour, min, 0).toISOString();
  }

  function parseHour(hr = '0', ampm = null) {
    let hour = parseInt(hr, 10);
    if (ampm) {
      if (hour === 12) {
        hour = 0;
      }
      if (ampm.toLowerCase() === 'pm') {
        hour += 12;
      }
    }
    return hour;
  }

  function parseDate(dt = null, tooltip = null) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    const yearMatch = /\b(\d{4})\b/.exec(tooltip);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }
    for (const r of dateRegex) {
      if (!r[0].test(dt)) {
        continue;
      }
      const matches = r[0].exec(dt);
      const seq = [...r[1]];
      for (let i = 0; i < seq.length; i++) {
        switch (seq[i]) {
          case 'y':
            year = parseInt(matches[i + 1], 10);
            break;
          case 'm':
            month = lookupMonth(matches[i + 1]);
            break;
          case 'd':
            day = parseInt(matches[i + 1], 10);
            break;
        }
      }
      break;
    }
    return { y: year, m: month, d: day };
  }

  function extendedTimeFormat(s, table, cell, cellIndex) {
    const extendedTimeRegex = /^(?:(\d+):)?(\d{2}):(\d{2})$/im;
    let tm = '';
    const matches = extendedTimeRegex.exec(s);
    if (matches) {
      const hrs = parseInt(matches[1], 10) || 0;
      const mins = parseInt(matches[2], 10);
      const secs = parseInt(matches[3], 10);
      tm = 3600 * hrs + 60 * mins + secs;
    }
    return tm;
  }

  function addCSS(styles) {
    if (typeof styles !== 'undefined' && Object.keys(styles).length > 0) {
      const style = document.createElement('style');
      document.head.appendChild(style);
      const sheet = style.sheet;
      const keys = Object.keys(styles);
      for (const key of keys) {
        const rule = ` {${styles[key]}`;
        sheet.insertRule(key + rule, sheet.cssRules.length);
      }
    }
  }

  function generateMonths(l = 'en') {
    const locales = {
      'ar': 'يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر',
      'cy': 'Ion|Chwe|Maw|Ebr|Mai|Meh|Gor|Aws|Med|Hyd|Tach|Rhag',
      'da': 'Jan|Feb|Mar|Apr|Maj|Jun|Jul|Aug|Sep|Okt|Nov|Dec',
      'da-x-k12': 'Jan|Feb|Mar|Apr|Maj|Jun|Jul|Aug|Sep|Okt|Nov|Dec',
      'de': 'Jan|Feb|März|Apr|Mai|Jun|Jul|Aug|Sept|Okt|Nov|Dez',
      'el': 'Ιαν|Φεβ|Μαρ|Απρ|Μαϊ|Ιουν|Ιουλ|Αυγ|Σεπ|Οκτ|Νοε|Δεκ',
      'en': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
      'en-AU': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
      'en-CA': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
      'en-GB': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
      'es': 'ene|feb|mar|abr|mayo|jun|jul|ago|sep|oct|nov|dic',
      'fa': 'ژانویه|فوریه|مارس|آوریل|مه|ژوئن|ژوییه|آگوست|سپتامبر|اکتبر|نوامبر|دسامبر',
      'fi': 'tammi|helmi|maalis|huhti|touko|kesä|heinä|elo|syys|loka|marras|joulu',
      'fr': 'Janv|Févr|Mars|Avr|Mai|Juin|Juil|Août|Sept|Oct|Nov|Déc',
      'fr-CA': 'Jan|Fév|Mar|Avr|Mai|Jun|Jul|Aou|Sep|Oct|Nov|Déc',
      'he': 'ינו׳|פבר׳|מרץ|אפר׳|מאי|יונ|יול|אוג׳|ספט׳|אוק׳|נוב׳|דצמ׳',
      'ht': 'jan|fev|mas|avr|me|jen|jiy|out|sep|okt|nov|des',
      'hu': 'jan|feb|márc|ápr|máj|jún|júl|aug|szept|okt|nov|dec',
      'hy': 'Հնվ|Փտր|Մրտ|Ապր|Մյս|Հնս|Հլս|Օգս|Սպտ|Հկտ|Նմբ|Դկտ',
      'is': 'Jan|Feb|Mar|Apr|Maí|Jún|Júl|Ágú|Sep|Okt|Nóv|Des',
      'it': 'gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic',
      'ja': '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月',
      'ko': '1월|2월|3월|4월|5월|6월|7월|8월|9월|10월|11월|12월',
      'mi': 'Hān|Pēp|Māe|Āpe|Mei|Hun|Hūr|Āku|Hep|Oke|Noe|Tīh',
      'nb': 'jan.|feb.|mars|april|mai|juni|juli|aug.|sep.|okt.|nov.|des.',
      'nb-x-k12': 'jan.|feb.|mars|april|mai|juni|juli|aug.|sep.|okt.|nov.|des.',
      'nl': 'jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec',
      'nn': 'jan|feb|mars|april|mai|juni|juli|aug|sep|okt|nov|des',
      'pl': 'Sty|Lut|Mar|Kwi|Maj|Cze|Lip|Sie|Wrz|Paz|Lis|Gru',
      'pt': 'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez',
      'pt-BR': 'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez',
      'ru': 'Янв|Фев|Мар|Апр|Май|Июн|Июл|Авг|Сен|Окт|Ноя|Дек',
      'sl': 'jan|feb|mar|apr|maj|jun|jul|avg|sep|okt|nov|dec',
      'sv': 'jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec',
      'sv-x-k12': 'jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec',
      'tr': 'Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara',
      'uk': 'січ|лют|бер|квіт|трав|черв|лип|серп|вер|жовт|лист|груд',
      'zh-Hans': '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月',
      'zh-Hant': '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月',
    };
    const t = typeof locales[l] === 'string' ? locales[l] : locales.en;
    return t.replace('.', '');
  }

  function lookupMonth(t) {
    const mon = months.split('|').indexOf(t);
    return mon > -1 ? mon : 0;
  }

  function generateDatePatterns(l = 'en') {
    const datePatterns = ['M.*?D', 'D.*?M'];
    if (/^1/.test(months)) {
      datePatterns.push('m.*?D');
    }
    return datePatterns.map(e => {
      const pattern = e
        .replace(/([MDY])/gi, '!$1!')
        .replace('!M!', `\\b(${months})\\b`)
        .replace('!m!', `\\b(\\d+)\\b`)
        .replace('!D!', '\\b(\\d+)\\b')
        .replace('!Y!', '\\b(\\d{4})\\b');
      const regex = new RegExp(`^${pattern}`, 'im');
      const seq = e.replace(/[^MDY]/gi, '').toLowerCase();
      return [regex, seq];
    });
  }
})();
