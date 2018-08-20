function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}



chrome.runtime.sendMessage({
    method: 'POST',
    action: 'xhttp',
    url: 'http://localhost:21487/post_json',
    data: JSON.stringify({"html": document.documentElement.innerHTML,
                          "url": window.location.href})
}, function(response) {
    // response = JSON.parse(response)
    // if (response.urls) {
    //     var t = response.urls.join('<br>')
    //     var fragment = create('<div style="position:fixed; top: 20%; left: 5%; z-index:100000">' + t + '</div>');
    //     document.body.insertBefore(fragment, document.body.childNodes[0]);
    // }
});


// document.onclick = function() {

//     chrome.runtime.sendMessage({
//         method: 'POST',
//         action: 'xhttp',
//         url: 'http://localhost:21487/post_json',
//         data: JSON.stringify({"html": document.documentElement.innerHTML,
//                               "url": window.location.href})
//     }, function(responseText) {

//         //alert(responseText);
//         /*Callback function to deal with the response*/
//     });

// };
