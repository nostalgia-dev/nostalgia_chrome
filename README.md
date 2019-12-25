## nostalgia_chrome

Cross-platform Chrome History Analysis

[![PyPI](https://img.shields.io/pypi/v/nostalgia_chrome.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia_chrome/)
[![PyPI](https://img.shields.io/pypi/pyversions/nostalgia_chrome.svg?style=flat-square)](https://pypi.python.org/pypi/nostalgia_chrome/)

### Self tracking

There is a movement of self tracking. Monitoring pulse, heartbeat and so on. But the most important is not being tracked: our online behavior.

Making sure we can self document, we need the following things.

1. Chrome only keeps its history for [a max of 90 days](https://support.google.com/chrome/answer/95589), so we need to **start saving history**.

1. We need to **collect** HTML data from the pages we visit.

1. We need to **extract and analyze** data from the HTML, such as code snippets, links, microdata, images, events.. anything really. This is done in [Nostalgia Core](https://github.com/nostalgia-dev/nostalgia).

4. Allow **plugins** (and make them configurable, please [contribute](https://github.com/nostalgia-dev/nostalgia_chrome/issues/3)). The first example is that it will additionally track which videos you watch.

### What can you expect (Data overview)

In `~/nostalgia_data/meta.jsonl` an index will be saved per visit:

    {
      "path":"/home/pascal/nostalgia_data/html/1576317113.7_httpsgithubcomnostalgiadevnostalgia_chrome.html.gz",
      "url": "https://github.com/nostalgia-dev/nostalgia_chrome",
      "time":"1576317113.75019"
    }


In `~/nostalgia_data/html` the source HTML will be stored as `.html.gz` (reaching about 8x compression).

In `~/nostalgia_data/videos_watched.jsonl` the data for events on HTML5 video elements will be stored (on stop playing/close tab):

    {
      "playingSince": 1576273573.08,
      "seekTime": 0,
      "playingUntil": 1576273599.977,
      "duration": 26.8970000744,
      "totalClipDuration": 3510.301,
      "pageLoadTime": 1576266470.316,
      "loc": "https://www.youtube.com/watch?v=Zz-bhLjVS5o",
      "title": "Lost Frequencies | Tomorrowland Mainstage 2019 (Full Set) - YouTube",
      "likes": 24137,
      "dislikes": 946
    }

### Installation

1. Clone this repository: `git clone git@github.com:nostalgia-dev/nostalgia_chrome.git`

1. In Chrome click the settings button and click "More tools" and navigate to "Extensions". Click "Load unpacked". Navigate to the `chromePlugin` folder and click "Open".

1. `pip install nostalgia_chrome`

1. To test it out, run `nostalgia_chrome serve`. This will run the web server in the foreground so you can see that it works.

1. Visit a (non-file / localhost) URL so that you can verify it works. The data will be stored in `~/nostalgia_data/meta.jsonl`, `~/nostalgia_data/html`.

1. To make sure `nostalgia_chrome` gets automatically run on boot:

On Linux (systemctl based):

    pip install sysdm
    sysdm create "nostalgia_chrome run_server" --extensions ""

On Windows awaiting contribution for how to do this https://github.com/nostalgia-dev/nostalgia_chrome/issues/2

On OSX awaiting contribution for how to do this https://github.com/nostalgia-dev/nostalgia_chrome/issues/1
