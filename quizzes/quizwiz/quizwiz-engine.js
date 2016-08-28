/*
 * QuizWiz is a package that adds regrading and speed enhancements to Canvas quizzes
 * 
 * It was co-developed by Avi Naiman and James Jones
 * 
 * This is the engine that does all of the work, but it will not work in a standalone capacity.
 * It needs to be called as a user script with a script manager such as Greasemonkey or Tampermonkey.
 * 
 * You should install one of the configuration files and it will automatically load this file.
 * RequireJS is used to make sure that any changes in this engine are used without forcing you
 * to lose your configuration settings.
 * 
 */
var QuizWiz =
  function(config) {
    'use strict';

    if (typeof config === 'undefined') {
      config = {
        'autoExpandComments' : true,
        'duplicateQuestionHeader' : true,
        'showButtonCounts' : true,
        'methods' : {
          'unanswered' : true,
          'full_points' : false,
          'ma_allnone' : false,
          'ma_correct' : true,
          'ma_difference' : false,
          'fill_in_blanks' : false,
          'dropdowns' : false
        },
        'autoRun' : [
        // 'unanswered',
        // 'full_points'
        ]
      };
    }

    var namespace = 'quizwiz';
    // var isSG = document.body.classList.contains('quizzes-speedgrader');
    var QT;

    try {
      if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/history$/.test(window.location.pathname)) {
        // navigationObserver();
        // checkAutoAdvance();
        setupInterface();
        autoExpandComments();
        duplicateQuestionHeader();
        checkAutoRun();
      }
    } catch (e) {
      console.log(e);
    }

    // function navigationObserver() {
    // // This is tricky
    // // Students without submissions don't trigger this page
    // // Students with submissions re-run this script, so the observer is no
    // // longer valid
    // // But the class we add remains either way
    // if (!isSG || typeof config.autoAdvance === 'undefined' ||
    // !config.autoAdvance) {
    // return;
    // }
    // var src =
    // window.parent.document.getElementById('this_student_does_not_have_a_submission');
    // if (!src || src.classList.contains(namespace + '_navwatcher')) {
    // return;
    // }
    // src.classList.add(namespace + '_navwatcher');
    // var observer = new MutationObserver(function() {
    // src.classList.remove(namespace + '_navwatcher');
    // observer.disconnect();
    // checkAutoAdvance();
    // });
    // observer.observe(src, {
    // 'attributes' : true
    // });
    // }

    function checkAutoRun() {
      if (typeof config.autoRun !== 'object' || !Array.isArray(config.autoRun)) {
        return;
      }
      var j = document.querySelectorAll('#questions .enhanced');
      if (j.length > 0) {
        autoRun();
      } else {
        var observer = new MutationObserver(function() {
          j = document.querySelectorAll('#questions .enhanced');
          if (j.length > 0) {
            observer.disconnect();
            autoRun();
          }
        });
        observer.observe(document.getElementById('questions'), {
          'attributes' : true,
          'subtree' : true
        });
      }
    }

    function autoRun() {
      if (typeof config.autoRun === 'object' && Array.isArray(config.autoRun)) {
        for (var i = 0; i < config.autoRun.length; i++) {
          var key = config.autoRun[i];
          var e = document.getElementById(namespace + '_' + key);
          if (e) {
            e.dispatchEvent(new Event('click', {
              'bubbles' : true
            }));
          }
        }
      }
    }

    function autoExpandComments() {
      if (typeof config.autoExpandComments !== 'undefined' && !config.autoExpandComments) {
        return;
      }
      var nodes = document.querySelectorAll('div#questions > div.question_holder > div.display_question > div.quiz_comment');
      for (var i = 0; i < nodes.length; i++) {
        var t = nodes[i].querySelector('textarea');
        if (t.value.length > 0) {
          resizeComment(t);
        }
        t.addEventListener('input', watchComment, false);
      }
    }

    function watchComment(e) {
      if (e.target.value.length <= 1) {
        resizeComment(e.target);
      }
    }

    function resizeComment(e) {
      var divElement = e.parentNode;
      if (e.value.length > 0) {
        divElement.style.display = 'block';
        e.style.width = '98%';
      } else {
        divElement.style.display = 'inline-block';
        e.style.width = 'auto';
      }
    }
    function duplicateQuestionHeader() {
      if (typeof config.duplicateQuestionHeader !== 'undefined' && !config.duplicateQuestionHeader) {
        return;
      }
      var nodes = document.querySelectorAll('div#questions > div.question_holder > div.display_question > div.header');
      for (var i = 0; i < nodes.length; i++) {
        var original = nodes[i];
        var parent = original.parentNode;
        var commentNode = false;
        for (var j = parent.children.length - 1; j >= 0; j--) {
          if (parent.children[j].classList.contains('quiz_comment')) {
            commentNode = parent.children[j + 1];
          }
        }
        if (commentNode === false) {
          // Unable to find the quiz_comment class
          continue;
        }
        var duplicate = original.cloneNode(true);
        var existingStyles = window.getComputedStyle(original);
        var styles = [ 'Color', 'Style', 'Width' ];
        for (var k = 0; k < styles.length; k++) {
          var topStyle = 'borderTop' + styles[k];
          var bottomStyle = 'borderBottom' + styles[k];
          duplicate.style[topStyle] = existingStyles[bottomStyle];
          duplicate.style[bottomStyle] = existingStyles[topStyle];
        }
        var userPoints = duplicate.querySelector('div.user_points');
        userPoints.removeAttribute('class');
        var input = userPoints.querySelector('input.question_input');
        var originalInput = original.querySelector('div.user_points > input.question_input');
        input.addEventListener('change', userPointsUpdate, true);
        originalInput.addEventListener('change', userPointsUpdate, false);
        parent.insertBefore(duplicate, commentNode);
      }
    }

    function userPointsUpdate(e) {
      // e.preventDefault();
      var name = e.target.name;
      var value = e.target.value;
      var parent = e.target.parentNode;
      var isPrimary = parent.classList.contains('user_points');
      if (isPrimary) {
        // This is a change to the primary value.
        // Change secondaries but don't propagate events
        var dsts = document.querySelectorAll('div.header div:not(.user_points) > input.question_input[name="' + name + '"]');
        for (var i = 0; i < dsts.length; i++) {
          if (dsts[i].value !== value) {
            dsts[i].value = value;
          }
        }
      } else {
        // This is a change to the secondary point.
        // Update the main one and trigger its events
        var dst = document.querySelector('div.header div.user_points > input.question_input[name="' + name + '"]');
        if (dst.value !== value) {
          dst.value = value;
          dst.dispatchEvent(new Event('change', {
            'bubbles' : true
          }));
        }
      }
    }

    function setupInterface() {
      var submission = document.getElementsByClassName('quiz-submission')[0];
      // if (submission.classList.contains('headless')) {
      // var prevAction =
      // window.parent.document.querySelector('#jj_previous_action');
      // if (prevAction) {
      // }
      // }
      var ic = document.createElement('div');
      var icp = document.createElement('div');
      var ics = document.createElement('div');
      ic.classList.add('header-bar');
      icp.classList.add('header-bar-left');
      ics.classList.add('header-bar-right');
      var summaryNodes = submission.children;
      var nodelist = [];
      for ( var node in summaryNodes) {
        if (summaryNodes.hasOwnProperty(node)) {
          if (summaryNodes[node].classList.length > 0 && summaryNodes[node].classList.contains('alert')) {
            continue;
          }
          if (summaryNodes[node].id && summaryNodes[node].id == 'questions') {
            break;
          }
          nodelist.push(node);
        }
      }
      if (nodelist.length > 0) {
        var inserted = 0;
        for (var j = 0; j < nodelist.length; j++) {
          icp.appendChild(summaryNodes[nodelist[j] - inserted]);
          inserted++;
        }
      }
      ic.appendChild(icp);
      ic.appendChild(ics);
      var qdiv = document.getElementById('questions');
      submission.insertBefore(ic, qdiv);
      QT = new Question();
      var methods = QT.methods;
      var qtypes = scanQuiz();
      var wrapper, row, div, el, k;
      wrapper = document.createElement('div');
      wrapper.classList.add('header-group-right');
      var gbqCheck = document.getElementById('speed_update_scores_container');
      if (!gbqCheck) {
        row = document.createElement('div');
        row.classList.add('pull-right');
        row.style.display = 'block';
        row.style.verticalAlign = 'middle';
        // Duplicate Final Score Block
        div = document.createElement('div');
        div.style.display = 'inline-block';
        div.style.margin = '0px 2px 5px 5px';
        el = document.createElement('strong');
        el.textContent = 'Final Score:';
        div.appendChild(el);
        var finalScoreOriginal = document.getElementById('after_fudge_points_total');
        var finalScore = finalScoreOriginal.cloneNode(true);
        finalScore.id = namespace + '_' + finalScore.id;
        finalScore.style.fontSize = '1em';
        finalScore.style.marginRight = '10px';
        div.appendChild(finalScore);
        row.appendChild(div);
        duplicateText(finalScoreOriginal);
        // Duplicate Fudge Points
        var fudgeOriginal = document.getElementById('fudge_points_entry');
        var fudge = fudgeOriginal.cloneNode(true);
        fudge.id = namespace + '_' + fudge.id;
        fudge.name = namespace + '_' + fudge.name;
        fudge.setAttribute('placeholder', '--');
        fudge.size = 3;
        fudge.style.width = '3em';
        fudge.style.padding = '2px';
        fudge.style.margin = '0px';
        fudge.addEventListener('change', function(e) {
          var target = document.getElementById('fudge_points_entry');
          target.value = e.target.value;
          target.dispatchEvent(new Event('change', {
            'bubbles' : false
          }));
        });
        fudgeOriginal.addEventListener('change', function(e) {
          var target = document.getElementById(namespace + '_fudge_points_entry');
          target.value = e.target.value;
        });
        var fudgeLabel = document.createElement('label');
        fudgeLabel.htmlFor = fudge.id;
        fudgeLabel.textContent = 'Fudge Points';
        fudgeLabel.style.marginRight = '2px';
        row.appendChild(fudgeLabel);
        row.appendChild(fudge);
        // Duplicate Update Scores button
        var updateScore = document.querySelector('button.update-scores').cloneNode(true);
        updateScore.classList.add('btn-small');
        updateScore.type = 'button';
        updateScore.addEventListener('click', updateAdvance);
        row.appendChild(updateScore);
        for (k = 1; k < row.children.length; k++) {
          row.children[k].style.marginLeft = '5px';
        }
        wrapper.appendChild(row);
      }
      row = document.createElement('div');
      row.classList.add('content-box-micro', 'pull-right');
      for ( var key in qtypes) {
        if (qtypes.hasOwnProperty(key) && qtypes[key] > 0) {
          row.appendChild(addFeatureButton(methods[key], qtypes[key]));
        }
      }
      if (row.children.length > 0) {
        wrapper.appendChild(row);
      }
      ics.appendChild(wrapper);
    }

    function updateAdvance(e) {
      e.preventDefault();
      // if (isSG && typeof config.autoAdvance !== 'undefined' &&
      // config.autoAdvance) {
      // var slist =
      // window.parent.document.getElementById('students_selectmenu');
      // if (slist) {
      // var cuser = document.getElementById('submission_details');
      // if (cuser) {
      // var currentUserId =
      // cuser.querySelector('div.user_id').textContent;
      // for (var i = 0; i < slist.length; i++) {
      // if (slist[i].value == currentUserId) {
      // slist[i].classList.add(namespace + '_next_user');
      // }
      // }
      // }
      // }
      // }
      document.getElementById('update_history_form').submit();
    }

    // function checkAutoAdvance() {
    // var next = false;
    // if (isSG && typeof config.autoAdvance !== 'undefined' &&
    // config.autoAdvance) {
    // var slist =
    // window.parent.document.getElementById('students_selectmenu');
    // if (slist) {
    // var cuser = document.getElementById('submission_details');
    // if (cuser) {
    // var currentUserId = cuser.querySelector('div.user_id').textContent;
    // for (var i = 0; i < slist.length; i++) {
    // if (slist[i].value == currentUserId) {
    // if (slist[i].classList.contains(namespace + '_next_user')) {
    // slist[i].classList.remove(namespace + '_next_user');
    // next =
    // window.parent.document.getElementById('next-student-button');
    // break;
    // }
    // }
    // }
    // }
    // }
    // }
    // if (next) {
    // console.log('AutoAdvancing');
    // next.dispatchEvent(new Event('click', {
    // 'bubbles' : true
    // }));
    // }
    // }

    function scanQuiz() {
      if (typeof QT === 'undefined') {
        QT = new Question();
      }
      var qdiv = document.getElementById('questions');
      var qtypes = {};
      var methods = QT.methods;
      for ( var key in methods) {
        if (methods.hasOwnProperty(key)) {
          if (typeof config.methods[key] !== 'undefined' && config.methods[key]) {
            var isConflict = false;
            if (methods[key].conflicts !== false) {
              for (var k = 0; k < methods[key].conflicts.length; k++) {
                var conflict = methods[key].conflicts[k];
                if (typeof qtypes[conflict] !== 'undefined') {
                  if (!isConflict) {
                    console.log('You have conflicting entries in your configuration.');
                  }
                  console.log('Method ' + key + ' conflicts with ' + conflict);
                  isConflict = true;
                }
              }
            }
            if (!isConflict) {
              qtypes[key] = 0;
            }
          }
        }
      }
      var questions = qdiv.querySelectorAll('div.question_holder > div.question');
      for (key in qtypes) {
        if (qtypes.hasOwnProperty(key)) {
          var Q = new Question(key);
          if (typeof Q.check === 'function') {
            for (var i = 0; i < questions.length; i++) {
              if (Q.check(questions[i])) {
                qtypes[key]++;
              }
            }
          }
        }
      }
      return qtypes;
    }

    function addFeatureButton(method, n) {
      var el = document.createElement('button');
      el.type = 'button';
      el.id = namespace + '_' + method.method;
      el.classList.add('btn', 'btn-small');
      if (typeof config.showButtonCounts !== 'undefined' && config.showButtonCounts && typeof n !== 'undefined') {
        var badge = document.createElement('span');
        badge.classList.add('ic-badge');
        badge.textContent = n;
        badge.style.marginRight = '3px';
        el.appendChild(badge);
      }
      var txt = document.createTextNode(method.button ? method.button : method.text);
      el.appendChild(txt);
      if (typeof method.desc !== 'undefined' && method.desc) {
        el.title = method.desc;
      }
      el.style.marginLeft = '5px';
      el.addEventListener('click', process, false);
      return el;
    }

    function duplicateText(src) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length > 0) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              var dest = namespace + '_' + mutation.target.id;
              document.getElementById(dest).textContent = node.textContent;
            }
          }
        });
      });
      observer.observe(src, {
        'childList' : true
      });
    }

    function process(e) {
      var regex = new RegExp('^' + namespace + '_(.*)$');
      var match = regex.exec(e.target.id);
      if (!match) {
        return;
      }
      var key = match[1];
      var Q = new Question(key);
      var questions = document.querySelectorAll('div#questions > div.question_holder > div.question');
      for (var i = 0; i < questions.length; i++) {
        if (Q.check(questions[i])) {
          Q.apply(questions[i]);
        }
      }
      e.target.disabled = true;
    }

    function Question(method) {
      var methods =
        {
          'unanswered' : {
            'desc' : 'Assign 0 points to unanswered Essay questions and File Upload questions.',
            'text' : 'Unanswered',
            'enabled' : true,
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains('file_upload_question') && e.classList.contains('unanswered') && this.score(e).value === '') {
                valid = true;
              }
              if (!valid && e.classList.contains('essay_question') && this.score(e).value === '') {
                var response = e.querySelector('div.quiz_response_text');
                if (response && response.innerHTML === '') {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var possible = this.possible(e);
                if (typeof possible !== 'undefined') {
                  this.update(e, 0);
                }
              }
            }
          },
          'full_points' : {
            'desc' : 'Assign full points to Essay questions and File Upload questions that were answered but have not yet been graded.',
            'text' : 'Full Points',
            'type' : 'essay_question',
            'allowUpdate' : false,
            'enabled' : true,
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains('file_upload_question') && !e.classList.contains('unanswered') && this.score(e).value === '') {
                valid = true;
              }
              if (e.classList.contains(this.type) && this.score(e).value === '') {
                var response = e.querySelector('div.quiz_response_text');
                if (response && response.innerHTML !== '') {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var possible = this.possible(e);
                if (typeof possible !== 'undefined') {
                  this.update(e, possible);
                }
              }
            }
          },
          'ma_allnone' : {
            'desc' : 'All or nothing: Regrade Multiple Answers questions without partial credit; all items must be correctly answered to get any points.',
            'text' : 'MA All/None',
            'type' : 'multiple_answers_question',
            'allowUpdate' : true,
            'enabled' : true,
            'conflicts' : [ 'ma_correct', 'ma_difference', 'ma_bestdiff', 'ma_canvas' ],
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.full - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.full);
              }
            }
          },
          'ma_correct' : {
            'desc' : 'Partial credit: Regrade Multiple Answers questions by making each item worth the same amount of points. The points are assigned based on the percentage of items that are correctly answered.',
            'text' : 'MA Correct',
            'type' : 'multiple_answers_question',
            'allowUpdate' : true,
            'enabled' : true,
            'conflicts' : [ 'ma_allnone', 'ma_difference', 'ma_bestdiff', 'ma_canvas' ],
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.partial - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.partial);
              }
            }
          },
          'ma_difference' : {
            'desc' : 'Right minus wrong: Regrade Multiple Answers questions by taking the percentage of items that are correctly answered and subtracting the percentage of items that are incorrectly answered.',
            'text' : 'MA Difference',
            'type' : 'multiple_answers_question',
            'allowUpdate' : true,
            'enabled' : true,
            'conflicts' : [ 'ma_allnone', 'ma_correct', 'ma_bestdiff', 'ma_canvas' ],
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.diff - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.diff);
              }
            }
          },
          'ma_canvas' : {
            'desc' : 'Canvas: Restore the original score assigned by Canvas for Multiple Answers questions.',
            'text' : 'MS Canvas',
            'type' : 'multiple_answers_question',
            'allowUpdate' : true,
            'enabled' : false,
            'conflicts' : [ 'ma_allnone', 'ma_correct', 'ma_difference', 'ma_bestdiff' ],
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.canvas - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.canvas);
              }
            }
          },
          'ma_bestdiff' : {
            'desc' : 'Best difference: Regrade Multiple Answers questions by comparing the Canvas method to the Difference method and choosing the one that is greater on a question-by-question basis.',
            'text' : 'MA Best Diff',
            'type' : 'multiple_answers_question',
            'allowUpdate' : true,
            'enabled' : true,
            'conflicts' : [ 'ma_allnone', 'ma_correct', 'ma_difference', 'ma_canvas' ],
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.bestdiff - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.best);
              }
            }
          },
          'fill_in_blanks' : {
            'desc' : 'All or nothing: Regrade Fill in Multiple Blanks questions without awarding partial credit; all items must be correctly answered to get any points.',
            'text' : 'Fill in Blanks',
            'type' : 'fill_in_multiple_blanks_question',
            'allowUpdate' : true,
            'enabled' : true,
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.full - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.full);
              }
            }
          },
          'dropdowns' : {
            'desc' : 'All or nothing: Regrade Multiple Dropdowns questions without awarding partial credit; all items must be correctly answered to get any points.',
            'text' : 'Dropdowns',
            'type' : 'multiple_dropdowns_question',
            'allowUpdate' : true,
            'enabled' : true,
            'check' : function(e) {
              var valid = false;
              if (e.classList.contains(this.type)) {
                var calc = this.rightwrong(e);
                if (Math.abs(calc.full - calc.current) > 0.005) {
                  valid = true;
                }
              }
              if (valid) {
                this.contains = true;
              }
              return valid;
            },
            'apply' : function(e) {
              if (this.check(e)) {
                var calc = this.rightwrong(e);
                this.update(e, calc.full);
              }
            }
          }
        };
      if (typeof method !== 'undefined') {
        if (typeof methods[method] !== 'undefined') {
          for ( var p in methods[method]) {
            if (methods[method].hasOwnProperty(p)) {
              this[p] = methods[method][p];
            }
          }
          if (typeof (methods[method].type) !== 'undefined') {
            switch (methods[method].type) {
              case 'multiple_answers_question':
                this.rightwrong = function(e) {
                  var total = e.querySelectorAll('div.answers div.answer').length;
                  var totalCorrect = e.querySelectorAll('div.answers div.answer.correct_answer').length;
                  var totalIncorrect = total - totalCorrect;
                  var selectedCorrect = e.querySelectorAll('div.answers div.answer.selected_answer.correct_answer').length;
                  var selectedIncorrect = e.querySelectorAll('div.answers div.answer.selected_answer.wrong_answer').length;
                  var unselectedCorrect = totalCorrect - selectedCorrect;
                  var unselectedIncorrect = totalIncorrect - selectedIncorrect;
                  // var totalSelected = selectedCorrect + selectedIncorrect;
                  var right = selectedCorrect + unselectedIncorrect;
                  var wrong = unselectedCorrect + selectedIncorrect;
                  var possible = +this.possible(e);
                  var curscore = +this.score(e).value || 0;
                  var diff = (right > wrong ? right - wrong : 0) * possible / total;
                  var calc = {
                    'n' : total,
                    'right' : right,
                    'wrong' : wrong,
                    'full' : unselectedCorrect + selectedIncorrect > 0 ? 0 : possible,
                    'partial' : possible * right / total,
                    'canvas' : (selectedCorrect > selectedIncorrect ? selectedCorrect - selectedIncorrect : 0) * possible / totalCorrect,
                    'diff' : diff,
                    'current' : curscore
                  };
                  calc.bestdiff = Math.max(calc.canvas, calc.diff);
                  calc.best = Math.max(calc.full, calc.partial, calc.canvas, calc.diff);
                  return calc;
                };
                break;
              case 'fill_in_multiple_blanks_question':
              case 'multiple_dropdowns_question':
                this.rightwrong = function(e) {
                  var total = e.querySelectorAll('div.answers > div.answer_group').length;
                  var selectedCorrect = e.querySelectorAll('div.answers > div.answer_group > div.answer.selected_answer.correct_answer:not(.skipped)').length;
                  var selectedIncorrect = e.querySelectorAll('div.answers > div.answer_group > div.answer.selected_answer.wrong_answer:not(.skipped)').length;                  var right = selectedCorrect;
                  var wrong = total - selectedCorrect;
                  var possible = +this.possible(e);
                  var curscore = +this.score(e).value || 0;
                  var calc = {
                    'n' : total,
                    'right' : right,
                    'wrong' : wrong,
                    'full' : wrong > 0 ? 0 : possible,
                    'partial' : possible * right / total,
                    'canvas' : possible * right / total,
                    'diff' : (right > wrong ? right - wrong : 0) * possible / total,
                    'current' : curscore,
                    'unanswered' : total - selectedCorrect - selectedIncorrect
                  };
                  calc.best = Math.max(calc.full, calc.partial, calc.canvas, calc.diff);
                  return calc;
                };
                break;
            }
          }
        }
      } else {
        var methodlist = {};
        for ( var m in methods) {
          if (methods.hasOwnProperty(m)) {
            methodlist[m] = {
              'method' : m,
              'type' : methods[m].type,
              'enabled' : methods[m].enabled,
              'text' : methods[m].text,
              'desc' : methods[m].desc,
              'conflicts' : typeof methods[m].conflicts !== 'undefined' ? methods[m].conflicts : false
            };
          }
        }
        this.methods = methodlist;
      }
      this.score = function(e) {
        return e.querySelector('div.user_points input.question_input');
      };
      this.answers = function(e) {
        return e.querySelector('div#answers div.answer');
      };
      this.possible = function(e) {
        var points;
        var pts = e.querySelector('div.user_points span.points.question_points').textContent;
        if (pts) {
          var match = /\/ ([0-9.]+)$/.exec(pts);
          if (match) {
            points = match[1];
          }
        }
        return points;
      };
      this.update = function(e, pts) {
        var score = this.score(e);
        if (pts !== score.value) {
          score.value = pts;
          this.updated = true;
          score.dispatchEvent(new Event('change', {
            'bubbles' : true
          }));
        }
      };
      this.contains = false;
      this.updated = false;
    }
  };

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.returnExports = factory();
  }
}(this, function() {
  return QuizWiz;
}));
