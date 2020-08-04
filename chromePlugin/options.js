(function() {
    'use strict';
    function updateStorage(data) {
        'use strict';
        return new Promise((resolve) => chrome.storage.local.set(data, resolve));
    }

    function readStorage(keys) {
        'use strict';
        return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    }

    const data = {
        "nostalgia-server": "http://localhost:21487/",
        "downtime-ms": 1000
    };

    async function run () {
        'use strict';
        var logger = getLogger('run');
        var unknown = await readStorage(['unknown']);
        logger.debug('What about', unknown);
        await updateStorage(data);
        logger.debug('Updated storage');
        var read = await readStorage(['nostalgia-server']);
        logger.debug('Read', read);
    }

    run();

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
})();