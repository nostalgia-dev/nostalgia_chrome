(function() {
  'use strict';
  getLogger('content').debug('Content script loaded');
  // "Global" values, scoped to this IIFE
  var serverUrl = 'http://localhost:21487';

  chrome.storage.onChanged.addListener(onStorageChanged);
  chrome.runtime.onMessage.addListener(onWebsiteVisited);

  // video listening / sending
  chrome.runtime.onMessage.addListener(function() {
    'use strict';
    // TODO: Check, whether this isn't registered multiple times
    window.addEventListener('beforeunload', onWebsiteLeave);
    registerVideoEvents();
  });

  /**
   * Updating XHR based on preferences.
   * 
   * @param {{}}     changes  - Changed key with old and new value
   * @param {string} areaName - Either "sync", "local" or "managed"
   */
  function onStorageChanged(changes, areaName) {
    'use strict';
    var logger = getLogger('onStorageChanged');
    logger.debug('Change received', changes, areaName);
    serverUrl = changes['nostalgia-server'].newValue;
  }

  /**
   * Register event listeners for a HTMLCollection of videos.
   */
  function registerVideoEvents() {
    'use strict';
    var pageLoadTime = new Date() / 1000;
    var vids = document.getElementsByTagName('video');

    // vids is an HTMLCollection
    for (var i = 0; i < vids.length; i++) {
      var vid = vids.item(i);
      // TODO: Add comment on what this is doing.
      if (vid.chromed === undefined) {
        registerVideoEvent(vid, pageLoadTime);
      }
    }
  }

  /**
   * Register event listeners for a single video.
   *
   * @param {HTMLVideoElement} video
   * @param {number}           pageLoadTime
   */
  function registerVideoEvent(video, pageLoadTime) {
    'use strict';
    video.chromed = true;
    video.seekTime = video.currentTime;

    video.addEventListener('playing', function(evt) {
      startEvent(evt.currentTarget);
    });

    video.addEventListener('pause', function(evt) {
      stopEvent(evt.currentTarget, pageLoadTime);
    });

    video.addEventListener('seeking', function(evt) {
      stopEvent(evt.currentTarget, pageLoadTime);
    });

    // Seeking event
    video.addEventListener('volumechange', onVolumeChanged);
  }

  /**
   * Callback for changes in volume of a video.
   *
   * @param {{}}               event
   * @param {HTMLVideoElement} event.currentTarget - The video with changed volume
   */
  function onVolumeChanged(event) {
    'use strict';
    var logger = getLogger('onVolumeChanged');
    var video = event.currentTarget;
    nowAudible = ((video.volume * !video.muted) > 0);

    // if is playing and was audible then a segment now finished
    if (video.playingSince && video.isAudible && !nowAudible) {
      videoWatched(video);
    }

    video.isAudible = nowAudible;
    logger.debug(`Video is ${video.isAudible ? '' : 'not '} audible and playing since ${video.playingSince}`);
  }

  /**
   * Save a visited website in Nostalgia.
   *
   * @param {{}}      request
   * @param {string}  request.event_url - The URL triggering this request
   * @param {boolean} request.save
   * @param {string}  request.tabId     - The tabId to update the icon for
   * @param {{}}      sender
   * @param {{}}      [sender.tab]
   * @param {string}  sender.tab.url    - Contains the content script URL if present
   */
  function onWebsiteVisited(request, sender) {
    var logger = getLogger('onWebsiteVisited');
    logger.debug(sender.tab ? 'from a content script: ' + sender.tab.url : 'from the extension');

    if (request.save && request.event_url === window.location.href) {
      var payload = {
        html: document.documentElement.innerHTML,
        url: window.location.href
      };

      logger.debug('Saving website ' + request.event_url);
      chrome.runtime.sendMessage({
        action: 'xhttp',
        method: 'POST',
        data: JSON.stringify(payload),
        url: serverUrl + '/post_json',
        tabId: request.tabId
      });
    }
  }

  /**
   * Register stop video events before leaving.
   */
  function onWebsiteLeave() {
    'use strict';
    var vids = document.getElementsByTagName('video');
    var pageLoadTime = new Date() / 1000;

    // vids is an HTMLCollection
    for (var i = 0; i < vids.length; i++) {
      stopEvent(vids.item(i), pageLoadTime);
    }
  }

  /**
   * Start Video recording.
   *
   * @param {HTMLVideoElement} ele
   */
  function startEvent(ele) {
    'use strict';
    var logger = getLogger('startEvent');
    logger.debug(`Playing for ${ele.duration}!`);

    ele.playingSince = new Date() / 1000;
    ele.seekTime = ele.currentTime;
    ele.isAudible = ((ele.volume * !ele.muted) > 0);
    logger.debug(`Video is ${ele.isAudible ? '' : 'not '} audible and playing since ${ele.playingSince}`);
  }

  /**
   * Stop video and submit as watched.
   *
   * @param {HTMLVideoElement} ele
   * @param {number} pageLoadTime
   */
  function stopEvent(ele, pageLoadTime) {
    'use strict';
    var logger = getLogger('stopEvent');
    logger.debug('Stopping');

    if (ele.playingSince == undefined) {
      ele.playingSince = pageLoadTime;
      ele.isAudible = ((ele.volume * !ele.muted) > 0);
    }

    if (ele.playingSince && ele.isAudible) {
      videoWatched(ele);
    }

    ele.playingSince = false;
    ele.isAudible = false;
    ele.seekTime = ele.currentTime;
    logger.debug(`Video is ${ele.isAudible ? '' : 'not '} audible and played since ${ele.playingSince}`);
  }

  /**
   * Register a YouTube video as watched.
   *
   * @param {HTMLVideoElement} ele
   */
  function videoWatched(ele) {
    'use strict';
    var logger = getLogger('videoWatched');
    var now = new Date() / 1000;
    // TODO: Check, whether there's a more robust way to read this
    // TODO: Check YouTube API on this numbers
    var ytSentimentSelector = 'paper-tooltip.style-scope.ytd-sentiment-bar-renderer > #tooltip';
    var ytLikeDislikeElement = document.querySelector(ytSentimentSelector);
    var ytLikeDislike = [null, null];

    if (ytLikeDislikeElement) {
      ytLikeDislike = ytLikeDislikeElement
        .innerText  // TODO: Perhaps textContent?
        .trim()
        .split(" / ")
        .map(function(likeAndDislike) {
          // Parse as Number without thousands-sepeators
          return parseInt(likeAndDislike.replace('.', '').replace(',', ''), 10);
        });
    }

    var payload = {
      playingSince: ele.playingSince,
      seekTime: ele.seekTime,
      playingUntil: now,
      duration: now - ele.playingSince,
      totalClipDuration: ele.duration,
      pageLoadTime: pageLoadTime,
      loc: window.location.href,
      title: document.title,
      likes: ytLikeDislike[0],
      dislikes: ytLikeDislike[1]
    };

    logger.debug('Submitting watched video to backend', payload);
    chrome.runtime.sendMessage({
      action: 'xhttp',
      method: 'POST',
      data: JSON.stringify(payload),
      url: serverUrl + '/video_watched'
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
    // Heads up! Get logged to the console of the page you're looking at!
    return {
      debug: function(...args) { console.debug(    `${name} [DEBUG]: `, ...args) },
      error: function(...args) { console.error(    `${name} [ERROR]: `, ...args) },
      fatal: function(...args) { console.exception(`${name} [FATAL]: `, ...args) },
      info:  function(...args) { console.info(    ` ${name} [INFO]: `,  ...args) },
      log:   function(...args) { console.log(    `  ${name} [LOG]: `,   ...args) },
      warn:  function(...args) { console.warn(    ` ${name} [WARN]: `,  ...args) }
    };
  }
})();