## nostalgia_chrome [alpha]

Cross-platform Chrome History Analysis

[![PyPI](https://img.shields.io/pypi/v/nostalgia_chrome.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia_chrome/)
[![PyPI](https://img.shields.io/pypi/pyversions/nostalgia_chrome.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia_chrome/)

### Self tracking

There is a movement of self tracking. Monitoring pulse, heartbeat and so on. But the most important is not being tracked: our online behavior.

Making sure we can self document, we need the following things.

1. Chrome only keeps its history for [a max of 90 days](https://support.google.com/chrome/answer/95589), so we need to **start saving history**.

2. We need to **collect** HTML data from the pages we visit and keep them cached.

3. (Cleaning up) We need to **extract and analyze** data from the HTML, such as code snippets, links, microdata, images, events.. anything really.

4. (Not started) Allow **plugins** per website for example. Extract trip date from airbnb page to connect to photos for example.

### Usage examples

To come

### Installation

1. For now, go to Extensions in Chrome, and "load unpacked". Open the `chromePlugin` in this folder.

2. `pip install nostalgia_chrome`

3. To test it out, run `nostalgia_chrome serve`. Look at the `boot_as_service` on how to run `nostalgia_chrome` as a service on boot.

4. Make sure you do not lose history, run `nostalgia_chrome backup_history` every (at most) 90 days.

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
