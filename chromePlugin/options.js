(function() {
    'use strict';
    const initialData = {
        "nostalgia-server": "http://localhost:21487/",
        "downtime-ms": 1000
    };

    function updateForm(data) {
        'use strict';
        Object.keys(data).forEach((key) => {
            var el = document.getElementById(key);
            el.value = data[key];
        });

        var form = document.querySelector('form');
        form.addEventListener('submit', onSubmit);

        var reset = document.getElementById('reset-defaults');
        reset.addEventListener('click', onResetDefaults);
    }

    function onSubmit(event) {
        'use strict';
        event.preventDefault();
        var form = event.target;
        var formData = new FormData(form);

        // Ensure URL is properly formatted
        var url = new URL(formData.get('nostalgia-server'));
        formData.set('nostalgia-server', url.toString());

        var data = {};
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        return updateStorage(data);
    }

    async function onResetDefaults() {
        'use strict';
        updateForm(initialData);
        return new Promise((resolve) => chrome.storage.local.set(initialData, resolve));
    }
    
    function updateStorage(data) {
        'use strict';
        return new Promise((resolve) => chrome.storage.local.set(data, resolve));
    }

    function readStorage(keys) {
        'use strict';
        return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    }

    async function run () {
        'use strict';
        var data = await readStorage(Object.keys(initialData));
        return updateForm(data);
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