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
    var url = "sellercentral.amazon.com/gp/orders-v2/list";
    if (tab.url.toLowerCase().indexOf(url) != -1) {
        chrome.pageAction.show(tabId);
        currentTabId = tabId;
        return;
    }
    // chrome.pageAction.show(tabId);
    // currentTabId = tabId;
};
var currentTabId;
chrome.tabs.onUpdated.addListener(checkForValidUrl);
// var port = chrome.tabs.connect(tabId, {"name": "handler"});
var MAX_PAGE = 10;
var currentPage = 1;
var orderList;
var isStarted = false;
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
    currentPage = 1;
    orderList = userInfo.ids;
    isStarted = true;
    // chrome.runtime.connect().postMessage(userInfo);
    chrome.tabs.connect(currentTabId, {"name": "handler"}).postMessage(userInfo);
}

var isNeedQuery = true;
class NeedQueryResponse {
    constructor(isNeedQuery, orderInfoList) {
        this.isNeedQuery = isNeedQuery;
        this.orderInfoList = orderInfoList;
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.from == "isNeedQuery") {
            let isNeed = checkNeedSearch();
            sendResponse(new NeedQueryResponse(isNeed, orderList));
            currentPage++;
        }

    });

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((info) => {
        var orderInfoList = info.orderList;
        let pop = chrome.extension.getViews({type: 'popup'});
        if (orderInfoList == null || orderInfoList == undefined || orderInfoList.length == 0) {
            return;
        }
        for (let orderInfo of orderInfoList) {
            let o = getOrderInfoById(orderInfo.id);
            if (o != null) {
                o.orderId = orderInfo.orderId;
                o.url = orderInfo.url;

            }
        }
        pop[0].updateInfo(orderInfoList);
    })
});

function getOrderInfoById(id) {
    for (let orderInfo of orderList) {
        if (orderInfo.id == id) {
            return orderInfo;
        }
    }
    return null;
}

function checkNeedSearch() {
    if (!isStarted) {
        return false;
    }
    if (currentPage >= MAX_PAGE) {
        return false;
    }
    for (let orderInfo of orderList) {
        if (orderInfo.orderId == undefined && orderInfo.url == undefined) {
            return true;
        }
    }
    return false;
}
