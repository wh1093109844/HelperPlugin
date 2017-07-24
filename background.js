// JavaScript source code
function getDomainFromUrl(url) {
    var host = "null";
    if (typeof url == "undefined" || null == url)
        url = window.location.href;
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if (typeof match != "undefined" && null != match)
        host = match[1];
    return host;
}

function checkForValidUrl(tabId, changeInfo, tab) {
    // if (getDomainFromUrl(tab.url).toLowerCase() == "www.amazon.com") {
    //     chrome.pageAction.show(tabId);
    // }
    chrome.pageAction.show(tabId);
    currentTabId = tabId;
};
var currentTabId;
chrome.tabs.onUpdated.addListener(checkForValidUrl);
// var port = chrome.tabs.connect(tabId, {"name": "handler"});
var orderList = new Array();
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((info) => {
        var orderList = info.orderList;
        var str = "";
        orderList.forEach((order) => {
            str += order.orderId + "=" + order.url + "\n";
        })
        if (info.from == "FROM_CONTENT") {
            orderList.concat(info.orderList);
        }
        if (orderList.length > 10) {
            sendMsg({"from": "STOP"})
        }
    })
});
function sendMsg(userInfo) {
    orderList.concat(userInfo);
    // chrome.runtime.connect().postMessage(userInfo);
    chrome.tabs.connect(currentTabId, {"name": "handler"}).postMessage(userInfo);
}

var isNeedQuery = true;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.from == "isNeedQuery") {
            sendResponse({farewell: isNeedQuery});
            isNeedQuery = !isNeedQuery;
        }

    });

// chrome.pageAction.onClicked.addListener(function(info) {
//
//     if (info.from == "FROM_CONTENT") {
//         alertUrls(info.urls);
//     } else {
//         chrome.tabs.executeScript(null, {file: "contentscript.js"});
//     }
//
// });
//
// chrome.runtime.onConnect.addListener(function (prot) {
//     prot.onMessage.addListener(function (info) {
//         alertUrls(info.urls);
//     })
//
// });
//
// function alertUrls(urls) {
//     var str = ""
//     var length = urls.length;
//     for (var i = 0; i < length; i++) {
//         str += urls[i] + "\n";
//     }
//     alert(str);
// }
