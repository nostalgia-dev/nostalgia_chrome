/**
 * Possible parameters for request:
 *  action: "xhttp" for a cross-origin HTTP request
 *  method: Default "GET"
 *  url   : required, but not validated
 *  data  : data to send in a POST request
 *
 * The callback function is called upon completion of the request */

function onCompleted(event) {
  console.log("c1")
  if (event.url != "about:blank") {
    // console.log(event);
    setTimeout(function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length) {
          console.log("c11")
          chrome.tabs.sendMessage(tabs[0].id, {save: true, event_url: event.url});
        }
      });
    }, 1000);

  }
}

function onCompleted2(event) {
  console.log("c2")
  if (event.url != "about:blank") {
    // console.log(event);
    setTimeout(function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length) {
          console.log("c22")
          chrome.tabs.sendMessage(tabs[0].id, {save: true, event_url: event.url});
        }
      });
    }, 1000);
  }
}


chrome.webNavigation.onHistoryStateUpdated.addListener(onCompleted);

chrome.webNavigation.onCompleted.addListener(onCompleted2);

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  console.log("received and sending externally")
  console.log(request)
  if (request.action == "xhttp") {
    var xhttp = new XMLHttpRequest();
    var method = request.method ? request.method.toUpperCase() : 'GET';

    xhttp.onload = function() {
      callback(xhttp.responseText);
    };
    xhttp.onerror = function() {
      // Do whatever you want on error. Don't forget to invoke the
      // callback to clean up the communication port.
      callback();
    };
    xhttp.open(method, request.url, true);
    if (method == 'POST') {
      xhttp.setRequestHeader('Content-Type', 'application/json');
    }
    xhttp.send(request.data);
    return true; // prevents the callback from being called too early on return
  }
});
