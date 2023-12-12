(function() {
  'use strict';
  getLogger('background').debug('Nostalgia background script loaded');
  // "Global" values, scoped to this IIFE

  chrome.alarms.onAlarm.addListener(onAlarm);
  chrome.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated);
  chrome.webNavigation.onCompleted.addListener(onCompleted);
  chrome.runtime.onMessage.addListener(onMessage);

  function startAlarm(name, delayInMs) {
    chrome.alarms.create(name, { delayInMinutes: delayInMs / 1000 / 60 });
  }

  function onAlarm(event) {
    'use strict';
    var logger = getLogger('onAlarm');
    var name = event.name;

    if (name === 'onHistoryStateUpdated') {
      logger.debug('Querying for current tab');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        'use strict';
        if (tabs.length > 0) {
          var tabId = tabs[0].id;
          chrome.storage.local.get(name).then(function(stored_obj) {
            'use strict';
            var event_url = stored_obj[name];
            logger.debug(`Submitting ${event_url} to tab #${tabId} for saving`);
            chrome.tabs.sendMessage(tabId, {save: true, tabId: tabId, event_url: event_url});
          });
        }
        logger.debug('No active tabs');
      });
      chrome.alarms.clear(name);
    }

    if (name === 'onCompleted') {
      logger.debug('Querying for current tab');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        'use strict';
        if (tabs.length > 0) {
          var tabId = tabs[0].id;
          chrome.storage.local.get(name).then(function(stored_obj) {
            'use strict';
            var event_url = stored_obj[name];
            logger.debug(`Submitting ${event_url} to tab #${tabId} for saving`);
            chrome.tabs.sendMessage(tabId, {save: true, tabId: tabId, event_url: event_url});
          });
        }
        logger.debug('No active tabs');
      });
    }
  }

  /**
   * SPA-triggered page navigation.
   *
   * @param {{}}     event
   * @param {string} event.url - The URL of the new view.
   */
  function onHistoryStateUpdated(event) {
    'use strict';
    var logger = getLogger('onHistoryStateUpdated');
    logger.debug(`Called for ${event.url}`);

    if (event.url === 'about:blank') {
      return;
    }

    if (event.url.startsWith('moz-extension://')) {
      return;
    }

		chrome.storage.local.get('downtime-ms').then(function (stored_obj) {
			var downtime = stored_obj['downtime-ms'] || 1000
      startAlarm('onHistoryStateUpdated', downtime);
      chrome.storage.local.set({'onHistoryStateUpdated': event.url});
		})
  }

  /**
   * Navigated to a new website.
   *
   * @param {{}}     event
   * @param {string} event.url - The URL of the new tab.
   */
  function onCompleted(event) {
    'use strict';
    var logger = getLogger('onCompleted');
    logger.debug(`Called for ${event.url}`);

    if (event.url === 'about:blank') {
      return;
    }

    if (event.url.startsWith('moz-extension://')) {
      return;
    }

		chrome.storage.local.get('downtime-ms').then(function (stored_obj) {
			var downtime = stored_obj['downtime-ms'] || 1000
      startAlarm('onCompleted', downtime);
      chrome.storage.local.set({'onCompleted': event.url});
		})
  }

  /**
   * Received information from content script to store.
   *
   * @async
   * @param {{}}       request
   * @param {string}   request.action       - 'xhttp' to trigger request
   * @param {*}        [request.data]       - POST payload
   * @param {string}   [request.method=GET] - Method to use for fetch
   * @param {string}   request.url          - The site to fetch
   * @param {string}   [request.tabId]      - The tab for which to update the icon
   * @param {*}        sender
   * @param {callback} callback             - Called upon request completion
   */
  async function onMessage(request, sender, callback) {
    'use strict';
    var logger = getLogger('onMessage');
    logger.debug('received and sending externally');
    logger.debug(JSON.stringify(request));

    if (request.action === 'xhttp') {
      var method = request.method ? request.method.toUpperCase() : 'GET';
      var headers = {};
      var body = null;
      /* TODO: Define a timeout, then use AbortController
      var controller = new AbortController();
      var signal = controller.signal;
      */

      logger.debug(`Fetching ${request.url} via ${method}`);

      if (method == 'POST') {
        // Already JSON-stringified because of message passing
        body = request.data;
        headers['Content-Type'] = 'application/json';
      }

      logger.debug('Payload', request.data);

      try {
        const response = await fetch(
          request.url,
          { body, headers, method/*, signal*/ }
        );
        const text = await response.text();
        logger.debug('Received', text);
        setSuccessIcon(request.tabId);
        callback(text);
      } catch (exception) {
        logger.error('Failed to submit', exception);
        setFailureIcon(request.tabId);
        callback(null);
      }
    }
  }

  /**
   * Updates the icon to indicate a success on submission.
   *
   * @param {string} [tabId] - Update the icon for this tab only
   * @returns {Promise<void>}
   */
  function setSuccessIcon(tabId) {
    'use strict';
    var logger = getLogger('setSuccessIcon');
    const iconPath = chrome.runtime.getURL('Nostalgia-C-success_128x128.png');
    logger.debug('Setting icon to ', iconPath);
    return chrome.action.setIcon({
      path: iconPath,
      tabId: tabId
    });
  }

  /**
   * Updates the icon to indicate a failure on submission.
   * @returns {Promise<void>}
   */
  function setFailureIcon(tabId) {
    'use strict';
    var logger = getLogger('setFailureIcon');
    const iconPath = chrome.runtime.getURL('Nostalgia-C-error_128x128.png');
    logger.debug('Setting icon to ', iconPath);
    return chrome.action.setIcon({
      path: iconPath,
      tabId: tabId
    });
  }

  /**
   * @typedef Logger
   * @type {{}}
   * @property {callback} debug
   * @property {callback} error
   * @property {callback} info
   * @property {callback} log
   * @property {callback} warn
   */

  /**
   * Small factory method to generate Python-like loggers.
   *
   * @param {string} name
   * @returns {Logger}
   */
  function getLogger(name) {
    'use strict';
    return {
      debug: console.debug.bind(console, name + ' [DEBUG]: %s'),
      error: console.error.bind(console, name + ' [ERROR]: %s'),
      info:  console.info.bind(console, name + ' [INFO]: %s'),
      log:   console.log.bind(console, name + ' [LOG]: %s'),
      warn:  console.warn.bind(console, name + ' [WARN]: %s')
    };
  }
})();
