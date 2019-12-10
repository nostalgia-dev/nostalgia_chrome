
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender);
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (request.save && request.event_url == window.location.href)
      chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://localhost:21487/post_json',
        data: JSON.stringify({"html": document.documentElement.innerHTML,
                              "url": window.location.href})
      })
  }
);

// video listening / sending
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    window.addEventListener('beforeunload', function(event) {
      var vids = document.getElementsByTagName('video')
      var pageLoadTime = new Date() / 1000;
      // vids is an HTMLCollection
      for (var i = 0; i < vids.length; i++ ) {
        stopEvent(vids.item(i));
      }
    });
    //console.log("msg " + JSON.stringify(request));
    function videoWatched(ele) {
      now = new Date() / 1000
      var ytLikeDislike = document.querySelector("paper-tooltip.style-scope.ytd-sentiment-bar-renderer > #tooltip");
      if (ytLikeDislike) {
        ytLikeDislike = ytLikeDislike.innerText.trim().split(" / ").map(function(x) { return parseInt(x.replace(".", "").replace(",", "")); })
      } else {
        ytLikeDislike = [null, null]
      }
      data = {"playingSince": ele.playingSince, "seekTime": ele.seekTime, "playingUntil": now, "duration": now - ele.playingSince, "totalClipDuration": ele.duration, "pageLoadTime": pageLoadTime, "loc": window.location.href, "title": document.title, "likes": ytLikeDislike[0], "dislikes": ytLikeDislike[1]}
      console.log(data);
      chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://localhost:21487/video_watched',
        data: JSON.stringify(data)
      })

    }

    function startEvent(ele) {
      console.log("playing!")
      console.log(ele.duration)
      ele.playingSince = new Date() / 1000;
      ele.seekTime = ele.currentTime;
      ele.isAudible = ((ele.volume * !ele.muted) > 0);
      // console.log(ele.playingSince, ele.isAudible)
    }
    function stopEvent(ele) {
      console.log("stopping");
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
      // console.log(ele.playingSince, ele.isAudible)
    }

    var vids = document.getElementsByTagName('video')
    var pageLoadTime = new Date() / 1000;
    // vids is an HTMLCollection
    for (var i = 0; i < vids.length; i++ ) {
      if (vids.item(i).chromed === undefined) {
        vids.item(i).chromed = true;
        // Playing event
        vids.item(i).seekTime = vids.item(i).currentTime;

        vids.item(i).addEventListener("playing", function(evt) {
          startEvent(evt.currentTarget)
        });

        // Pause event
        vids.item(i).addEventListener("pause", function(evt) {
          stopEvent(evt.currentTarget);
        });

        vids.item(i).addEventListener("seeking", function (evt) {
          stopEvent(evt.currentTarget);
        });

        // Seeking event
        vids.item(i).addEventListener("volumechange", function(evt) {
          // if is playing and was audible then a segment now finished
          nowAudible = ((evt.currentTarget.volume * !evt.currentTarget.muted) > 0);
          if (evt.currentTarget.playingSince && evt.currentTarget.isAudible && !nowAudible) {
            videoWatched(evt.currentTarget);
          }
          evt.currentTarget.isAudible = nowAudible;
          evt.currentTarget.isAudible
          // console.log(evt.currentTarget.playingSince, evt.currentTarget.isAudible)
        });
      }
    }
  }
);
