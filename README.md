## nostalgia [alpha]

Cross-platform Chrome History Analysis

[![PyPI](https://img.shields.io/pypi/v/nostalgia.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia/)
[![PyPI](https://img.shields.io/pypi/pyversions/nostalgia.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia/)

### Self tracking

There is a movement of self tracking. Monitoring pulse, heartbeat, even etc. But the most important is not being tracked: our online behavior.

Making sure we can self document, we need the following things.

1. Chrome only keeps its history for a max of 90 days, so we need to **start saving history**.

2. We need to **collect** HTML data from the pages we visit and keep them cached.

3. (Cleaning up) We need to **extract and analyze** data from the HTML, such as code snippets, links, microdata, images, events.. anything really.

4. (Not started) Allow **plugins** per website for example. Extract trip date from airbnb page to connect to photos for example.

### Usage examples

To come

### Installation

1. For now, go to Extensions in Chrome, and "load unpacked". Open the `chromePlugin` in this folder.

2. `pip install nostalgia`

3. To test it out, run `nostalgia serve`. Look at the `boot_as_service` on how to run `nostalgia` as a service on boot.

4. Make sure you do not lose history, ensure ``

### Data overview

Chrome history:
- Referral data
- Visit counts

HTML (after adding analyzer)
- DOM
- code snippets
- text
- publication date
- links
- microdata
- images
- events
