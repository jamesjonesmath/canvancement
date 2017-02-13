// ==UserScript==
// @name        Rubric Importer
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Create a rubric by copying from a spreadsheet and pasting into Canvas
// @include     https://*.instructure.com/courses/*/rubrics
// @include     https://*.instructure.com/accounts/*/rubrics
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var assocRegex = new RegExp('^/(course|account)s/([0-9]+)/rubrics$');
  if (assocRegex.test(window.location.pathname)) {
    add_button();
  }

  function processRubric(txt, title, association) {
    var errors = [];
    var F = {};
    try {
      if (typeof title === 'undefined') {
        title = 'New Rubric';
      }
      if (typeof association === 'undefined') {
        errors.push('No association specified, refusing to create rubric object');
      }
      var lines = txt.split(/\r?\n/);
      var pointRegex = new RegExp('^([0-9]+|[0-9]+[.][0-9]+|0?[.][0-9]+)$');
      var criteria = [];
      var pointsPossible = 0;
      for (var i = 0; i < lines.length; i++) {
        var words = lines[i].trim().split(/\t/);
        if (words.length < 3) {
          // There must be at least 3 entries to make a valid rubric entry
          continue;
        }
        var validLine = true;
        var longDesc = words.length % 2 === 0 ? words[1] : '';
        var ratings = [];
        var prevPoints = undefined;
        var maxPoints = undefined;
        var k = 1;
        var j = words.length % 2 === 0 ? 2 : 1;
        while (validLine && j < words.length) {
          var description = words[j];
          var points = words[j + 1];
          var matches = pointRegex.test(points);
          if (matches) {
            // We have a valid point value, make sure it's in order
            var thisPoints = Number(points);
            if (typeof prevPoints !== 'undefined' && thisPoints > prevPoints) {
              errors.push('Point values not in descending order on line ' + i);
              validLine = false;
            } else {
              ratings.push({
                'description' : description,
                'points' : points,
                'id' : 'blank' + ((k > 1) ? '_' + k : '')
              });
            }
            if (typeof maxPoints === 'undefined') {
              maxPoints = points;
            }
            prevPoints = thisPoints;
          } else if (i > 0) {
            errors.push('Line ' + i + ' is not recognized as valid rubric entry.');
            validLine = false;
          } else {
            // Skipping first line as headings;
            validLine = false;
          }
          j += 2;
          k++;
        }
        if (validLine) {
          if (!words[0]) {
            errors.push('No description for criterion in line ' + i);
            validLine = false;
          }
          if (ratings.length === 0) {
            errors.push('No ratings found in line ' + i);
            validLine = false;
          }
        }
        if (validLine) {
          pointsPossible += Number(maxPoints);
          var criterion = {
            'description' : words[0],
            'long_description' : longDesc,
            'learning_outcome_id' : '',
            'id' : '',
            'points' : maxPoints,
            'ratings' : ratings,
          };
          criteria.push(criterion);
        }
      }
      if (errors.length === 0) {
        if (criteria.length > 0) {
          F = {
            'rubric' : {
              'title' : title,
              'points_possible' : pointsPossible,
              'free_form_criterion_comments' : false,
              'criteria' : criteria,
            },
            'rubric_association' : {
              'id' : '',
              'use_for_grading' : false,
              'hide_score_total' : false,
              'association_type' : association.type,
              'association_id' : association.id,
              'purpose' : 'bookmark'
            },
            'title' : title,
            'points_possible' : pointsPossible,
            'rubric_id' : 'new',
            'rubric_association_id' : '',
            'skip_updating_points_possible' : false,
          };
        } else {
          errors.push('No valid criteria were found');
        }
      }
    } catch (e) {
      console.log(e);
      return;
    }
    if (errors.length > 0) {
      F.errors = errors;
    }
    return F;
  }

  function getCsrfToken() {
    var csrfRegex = new RegExp('^_csrf_token=(.*)$');
    var csrf;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      var match = csrfRegex.exec(cookie);
      if (match) {
        csrf = decodeURIComponent(match[1]);
        break;
      }
    }
    return csrf;
  }

  function add_button() {
    var parent = document.querySelector('aside#right-side');
    if (parent) {
      var el = parent.querySelector('#jj_rubric');
      if (!el) {
        el = document.createElement('a');
        el.classList.add('btn', 'button-sidebar-wide');
        el.id = 'jj_rubric';
        var icon = document.createElement('i');
        icon.classList.add('icon-import');
        el.appendChild(icon);
        var txt = document.createTextNode(' Import Rubric');
        el.appendChild(txt);
        el.addEventListener('click', openDialog);
        parent.appendChild(el);
      }
    }
  }

  function createDialog() {
    var el = document.querySelector('#jj_rubric_dialog');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jj_rubric_dialog';
      el.classList.add('ic-Form-control');
      var label = document.createElement('label');
      label.htmlFor = 'jj_rubric_title';
      label.textContent = 'Rubric Title: ';
      label.classList.add('ic-Label');
      el.appendChild(label);
      var input = document.createElement('input');
      input.id = 'jj_rubric_title';
      input.classList.add('ic-Input');
      input.type = 'text';
      input.placeholder = 'Enter name of rubric';
      el.appendChild(input);
      label = document.createElement('label');
      label.htmlFor = 'jj_rubric_text';
      label.textContent = 'Rubric Contents';
      label.classList.add('ic-Label');
      el.appendChild(label);
      var textarea = document.createElement('textarea');
      textarea.id = 'jj_rubric_text';
      textarea.classList.add('ic-Input');
      textarea.placeholder = 'Paste a tab-delimited rubric into this textbox.';
      el.appendChild(textarea);
      var msg = document.createElement('div');
      msg.id = 'jj_rubric_msg';
      msg.classList.add('ic-flash-warning');
      msg.style.display = 'none';
      el.appendChild(msg);
      var parent = document.querySelector('body');
      parent.appendChild(el);
    }
  }

  function openDialog() {
    try {
      createDialog();
      $('#jj_rubric_dialog').dialog({
        'title' : 'Import Rubric',
        'autoOpen' : false,
        'buttons' : [
          {
            'text' : 'Create',
            'click' : processDialog
          }, {
            'text' : 'Cancel',
            'click' : function() {
              $(this).dialog('close');
            }
          }
        ],
        'modal' : true,
        'height' : 'auto',
        'width' : '80%'
      });
      if (!$('#jj_rubric_dialog').dialog('isOpen')) {
        $('#jj_rubric_dialog').dialog('open');
      }
    } catch (e) {
      console.log(e);
    }
  }

  function processDialog() {
    var errors = [];
    var title, txt, assocMatch, association;
    var el = document.getElementById('jj_rubric_title');
    if (el.value && el.value.trim() !== '') {
      title = el.value;
    } else {
      errors.push('You must provide a title');
    }
    el = document.getElementById('jj_rubric_text');
    if (el.value && el.value.trim() !== '') {
      txt = el.value;
    } else {
      errors.push('You must paste your rubric into the textbox.');
    }
    assocMatch = assocRegex.exec(window.location.pathname);
    if (assocMatch) {
      var associationType = assocMatch[1].charAt(0).toUpperCase() + assocMatch[1].slice(1);
      association = {
        'type' : associationType,
        'id' : assocMatch[2],
      };
    } else {
      errors.push('Unable to determine where to place this rubric.');
    }
    if (errors.length === 0) {
      var f = processRubric(txt, title, association);
      if (typeof f !== 'undefined') {
        if (typeof f.errors !== 'undefined') {
          errors = f.errors;
        } else {
          f.authenticity_token = getCsrfToken();
          var url = window.location.pathname;
          $.ajax({
            'cache' : false,
            'url' : url,
            'type' : 'POST',
            'data' : f,
          }).done(function() {
            updateMsgs();
            $('#jj_rubric_dialog').dialog('close');
            window.location.reload(true);
          }).fail(function() {
            errors.push('All the information was supplied correctly, but there was an error saving rubric to Canvas.');
            updateMsgs(errors);
          });
        }
      }
    }
    updateMsgs(errors);
  }

  function updateMsgs(errors) {
    var msg = document.getElementById('jj_rubric_msg');
    if (!msg) {
      return;
    }
    if (msg.hasChildNodes()) {
      msg.removeChild(msg.childNodes[0]);
    }
    if (typeof errors === 'undefined' || errors.length === 0) {
      msg.style.display = 'none';
    } else {
      var ul = document.createElement('ul');
      var li;
      for (var i = 0; i < errors.length; i++) {
        li = document.createElement('li');
        li.textContent = errors[i];
        ul.appendChild(li);
      }
      msg.appendChild(ul);
      msg.style.display = 'inline-block';
    }
  }

})();
