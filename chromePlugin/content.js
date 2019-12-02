
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
