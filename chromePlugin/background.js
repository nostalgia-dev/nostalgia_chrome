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
          logger.debug(`Submitting ${event.url} to ${tabs[0].id} for saving`);
          chrome.tabs.sendMessage(tabs[0].id, {save: true, event_url: event.url});
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
          logger.debug(`Submitting ${event.url} to ${tabs[0].id} for saving`);
          chrome.tabs.sendMessage(tabs[0].id, {save: true, event_url: event.url});
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
 * @param {*}        sender
 * @param {callback} callback             - Called upon request completion
 */
function onMessage(request, sender, callback) {
  'use strict';
  var logger = getLogger('onMessage');
  logger.debug('received and sending externally');
  logger.debug(request);

  if (request.action === 'xhttp') {
    var xhttp = new XMLHttpRequest();
    var method = request.method ? request.method.toUpperCase() : 'GET';

    xhttp.onload = function() {
      'use strict';
      logger.debug('Received', xhttp.responseText);
      callback(xhttp.responseText);
    };
    xhttp.onerror = function() {
      'use strict';
      // Do whatever you want on error. Don't forget to invoke the
      // callback to clean up the communication port.
      callback();
    };

    // Trigger submission
    logger.debug(`Fetching ${request.url} via ${method}`);
    xhttp.open(method, request.url, true);
    if (method == 'POST') {
      xhttp.setRequestHeader('Content-Type', 'application/json');
    }
    logger.debug('Payload', request.data);
    xhttp.send(request.data);
    return true; // prevents the callback from being called too early on return
  }
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
    debug: function(args) { console.debug(    `${name} [DEBUG]: ${args}`) },
    error: function(args) { console.error(    `${name} [ERROR]: ${args}`) },
    fatal: function(args) { console.exception(`${name} [FATAL]: ${args}`) },
    info:  function(args) { console.info(    ` ${name} [INFO]: ${args}`)  },
    log:   function(args) { console.log(    `  ${name} [LOG]: ${args}`)   },
    warn:  function(args) { console.warn(    ` ${name} [WARN]: ${args}`)  }
  };
}