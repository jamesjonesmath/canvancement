// ==UserScript==
// @name        Dashboard Card Sorter
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Sort dashboard course cards using drag and drop
// @include     https://oconee.beta.instructure.com/
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  if (window.location.pathname !== '/') {
    return;
  }
  var scope = '/dashboard/order';
  var namespace = 'canvancement';
  var cardOrder;
  var hasLoaded = false;

  try {
    loadCardOrder();
    checkCards();
  } catch (e) {
    console.log(e);
  }

  function makeSortable() {
    hasLoaded = true;
    if (typeof cardOrder !== 'undefined' && cardOrder.length > 0) {
      sortCards();
    }
    var box = document.querySelector('div#DashboardCard_Container > div.ic-DashboardCard__box');
    var cards = box.childNodes;
    if (cards.length < 2) {
      return;
    }
    $('div.ic-DashboardCard__box').sortable({
      'containment' : 'parent',
      'items' : '> div',
      'update' : saveCardOrder
    });
    return;
  }

  function checkCards() {
    var el = document.querySelector('div#DashboardCard_Container > div.ic-DashboardCard__box a.ic-DashboardCard__link');
    if (el) {
      makeSortable();
    } else {
      var src = document.querySelector('div#DashboardCard_Container');
      var observer = new MutationObserver(function(mutations) {
        observer.disconnect();
        makeSortable();
      });
      var config = {
        childList : true,
      };
      observer.observe(src, config);
    }
  }

  function getCardOrder() {
    var order = [];
    var links = document.querySelectorAll('div#DashboardCard_Container > div.ic-DashboardCard__box a.ic-DashboardCard__link');
    if (links.length === 0) {
      return;
    }
    var courseRegex = new RegExp('/courses/([0-9]+)$');
    for (var i = 0; i < links.length; i++) {
      var matches = courseRegex.exec(links[i].href);
      if (matches) {
        order.push(matches[1]);
      }
    }
    return order;
  }

  function sortCards() {
    var box = document.querySelector('div#DashboardCard_Container > div.ic-DashboardCard__box');
    var cards = box.childNodes;
    if (cards.length < 2) {
      deleteCardOrder();
      return;
    }
    var order = getCardOrder();
    // New cards
    var pos = 0;
    var needsUpdated = false;
    var j;
    var k;
    var id;
    var el;
    for (k = 0; k < order.length; k++) {
      id = cardOrder[k];
      j = cardOrder.indexOf(id);
      if (j === -1) {
        el = cards[k];
        box.insertBefore(el, cards[pos]);
        order.splice(k, 1);
        order.splice(pos, 0, id);
        pos++;
      }
    }
    // Existing cards
    for (j = 0; j < cardOrder.length; j++) {
      id = cardOrder[j];
      k = order.indexOf(id);
      if (k === -1) {
        needsUpdated = true;
        continue;
      }
      if (k === pos) {
        pos++;
        continue;
      }
      el = cards[k];
      box.insertBefore(el, cards[pos]);
      order.splice(k, 1);
      order.splice(pos, 0, id);
      pos++;
    }
    if (needsUpdated) {
      saveCardOrder();
    }
    return;
  }

  function saveCardOrder(event, ui) {
    var currentOrder = getCardOrder();
    var url = '/api/v1/users/self/custom_data' + scope;
    var parms = {
      'ns' : namespace,
      'data' : currentOrder.join(',')
    };
    $.ajax({
      'url' : url,
      'type' : 'PUT',
      'data' : parms
    });
  }

  function loadCardOrder() {
    var url = '/api/v1/users/self/custom_data' + scope;
    var parms = {
      'ns' : namespace
    };
    $.getJSON(url, parms, function(data) {
      cardOrder = data.data.split(',');
      if (hasLoaded) {
        sortCards();
      }
    });
    return;
  }

  function deleteCardOrder() {
    var url = '/api/v1/users/self/custom_data' + scope;
    var parms = {
      'ns' : namespace
    };
    $.ajax({
      'url' : url,
      'type' : 'DELETE',
      'data' : parms
    });
    cardOrder = undefined;
    return;
  }

})();
