(function() {
  'use strict';
  /**
   * @typedef NostalgiaOptions
   * @type {{}}
   * @property {string} [nostalgia-server="http://localhost:21487/"]
   * @property {number} [downtime-ms=1000]
   */

  /** @type {NostalgiaOptions} */
  var initialData = {
    'nostalgia-server': 'http://localhost:21487/',
    'downtime-ms': 1000
  };

  run();

  /**
   * Set up the event listeners and populate the form from storage.
   *
   * @async
   * @returns {Promise}
   */
  function run() {
    'use strict';
    var form = document.querySelector('form');
    form.addEventListener('submit', onSubmit);

    var reset = document.getElementById('reset-defaults');
    reset.addEventListener('click', onResetDefaults);

    return readStorage(Object.keys(initialData)).then(function(data) {
      if (Object.keys(data).length > 0) {
        return updateForm(data);
      }
      return updateForm(initialData);
    });
  }

  /**
   * Updates the Web Extension storage with the entered values.
   *
   * @async
   * @param {{}} event
   * @returns {Promise}
   */
  function onSubmit(event) {
    'use strict';
    event.preventDefault();
    var form = event.target;
    var formData = new FormData(form);

    var maybeUrl = formData.get('nostalgia-server');
    if (maybeUrl) {
      // Ensure URL is properly formatted
      var url = new URL(maybeUrl);
      formData.set('nostalgia-server', url.toString());
    }

    var data = {};
    for (var pair of formData.entries()) {
      if (Boolean(pair[1])) {
        // Do not allow for blank values.
        data[pair[0]] = pair[1];
      }
    }
    return updateStorage(data);
  }

  /**
   * Returns the form and Web Extension storage the initial values.
   *
   * @async
   * @returns {Promise}
   */
  function onResetDefaults() {
    'use strict';
    updateForm(initialData);
    return chrome.storage.local.set(initialData);
  }

  /**
   * Updates the Web Extension storage with new values.
   *
   * @async
   * @param {{}}
   * @returns {Promise}
   */
  function updateStorage(data) {
    'use strict';
    return chrome.storage.local.set(data);
  }

  /**
   * Reads the latest options from Web Extension storage.
   *
   * @async
   * @param {Array<'nostalgia-server' | 'downtime-ms'>} keys
   * @returns {Promise}
   */
  function readStorage(keys) {
    'use strict';
    return chrome.storage.local.get(keys);
  }

  /**
   * Synchronises the form element with the data.
   *
   * @param {{}} data
   */
  function updateForm(data) {
    'use strict';
    Object.keys(data).forEach((key) => {
      var el = document.getElementById(key);
      el.value = data[key];
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
      debug: console.debug.bind(console, name + ' [DEBUG]: %s'),
      error: console.error.bind(console, name + ' [ERROR]: %s'),
      info:  console.info.bind(console, name + ' [INFO]: %s'),
      log:   console.log.bind(console, name + ' [LOG]: %s'),
      warn:  console.warn.bind(console, name + ' [WARN]: %s')
    };
  }
})();
