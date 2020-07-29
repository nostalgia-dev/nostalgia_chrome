getLogger('background').debug('Nostalgia background script loaded');
chrome.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated);
chrome.webNavigation.onCompleted.addListener(onCompleted);
chrome.runtime.onMessage.addListener(onMessage);

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

  if (event.url !== 'about:blank') {
    // console.log(event);
    setTimeout(function() {
      'use strict';
      logger.debug('Querying for current tab');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        'use strict';
        if (tabs.length) {
          var tabId = tabs[0].id;
          logger.debug(`Submitting ${event.url} to tab #${tabId} for saving`);
          chrome.tabs.sendMessage(tabId, {save: true, tabId: tabId, event_url: event.url});
        }
        logger.debug('No active tabs');
      });
    }, 1000);
  }
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

  if (event.url !== 'about:blank') {
    setTimeout(function() {
      'use strict';
      logger.debug('Querying for current tab');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        'use strict';
        if (tabs.length) {
          var tabId = tabs[0].id;
          logger.debug(`Submitting ${event.url} to tab #${tabId} for saving`);
          chrome.tabs.sendMessage(tabId, {save: true, tabId: tabId, event_url: event.url});
        }
        logger.debug('No active tabs');
      });
    }, 1000);
  }
}

/**
 * Received information from content script to store.
 *
 * @param {{}}       request
 * @param {string}   request.action       - 'xhttp' to trigger request
 * @param {*}        [request.data]       - POST payload
 * @param {string}   [request.method=GET] - Method to use for fetch
 * @param {string}   request.url          - The site to fetch
 * @param {string}   [request.tabId]      - The tab for which to update the icon
 * @param {*}        sender
 * @param {callback} callback             - Called upon request completion
 */
function onMessage(request, sender, callback) {
  'use strict';
  var logger = getLogger('onMessage');
  logger.debug('received and sending externally');
  logger.debug(JSON.stringify(request));

  if (request.action === 'xhttp') {
    var xhttp = new XMLHttpRequest();
    var method = request.method ? request.method.toUpperCase() : 'GET';

    xhttp.onload = function() {
      'use strict';
      logger.debug('Received', xhttp.responseText);
      setSuccessIcon(request.tabId);
      callback(xhttp.responseText);
    };

    xhttp.onerror = function(exception) {
      'use strict';
      logger.error('Failed to submit', exception);
      // Do whatever you want on error. Don't forget to invoke the
      // callback to clean up the communication port.
      // TODO: Show different icon in browser!
      // Perhaps via browser.extension.getURL('Nostalgia-C_128x128.png') ?
      setFailureIcon(request.tabId);
      callback(null);
    };

    xhttp.ontimeout = function(exception) {
      'use strict';
      logger.error('Connection timed out', exception);
      setFailureIcon(request.tabId);
      callback(null);
    }

    // Trigger submission
    logger.debug(`Fetching ${request.url} via ${method}`);
    xhttp.open(method, request.url, true);
    if (method == 'POST') {
      xhttp.setRequestHeader('Content-Type', 'application/json');
    }
    logger.debug('Payload', request.data);
    xhttp.send(request.data);
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
  const iconPath = chrome.runtime.getURL('Nostalgia-C-success_48x48.png');
  logger.debug('Setting icon to ', iconPath);
  return chrome.browserAction.setIcon({
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
  const iconPath = chrome.runtime.getURL('Nostalgia-C-error_48x48.png');
  logger.debug('Setting icon to ', iconPath);
  return chrome.browserAction.setIcon({
    path: iconPath,
    tabId: tabId
  });
}

/**
 * @typedef Logger
 * @type {{}}
 * @property {callback} debug
 * @property {callback} error
 * @property {callback} fatal
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
    debug: function(...args) { console.debug(    `${name} [DEBUG]: `, ...args) },
    error: function(...args) { console.error(    `${name} [ERROR]: `, ...args) },
    fatal: function(...args) { console.exception(`${name} [FATAL]: `, ...args) },
    info:  function(...args) { console.info(    ` ${name} [INFO]: `,  ...args) },
    log:   function(...args) { console.log(    `  ${name} [LOG]: `,   ...args) },
    warn:  function(...args) { console.warn(    ` ${name} [WARN]: `,  ...args) }
  };
}