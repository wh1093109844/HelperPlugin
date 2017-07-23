$(function () {
    var customerIds = ['A1GYFH9F80WX3E']
    var userInfo = {"from": "FILTER_ORDER", "ids": customerIds}
    $('#start_search').click(function () {
        chrome.extension.getBackgroundPage().sendMsg(userInfo);
    });
});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((info) => {
        var orderList = info.orderList;
        var str = "";
        orderList.forEach((order) => {
            str += order.orderId + "=" + order.url + "\n";
        })
        if (info.from == "FROM_CONTENT") {
            $("#contents").append(buildNodes(orderList));
        }
    })
});

function buildNodes(orderList) {
    var list = $('<ul>');
    var i;
    for (i = 0; i < orderList.length; i++) {
        list.append(buildNode(orderList[i]));
    }
    return list;
}

function buildNode(orderInfo) {
    var anchor = $('<a>');
    anchor.attr('href', orderInfo.url);
    anchor.text(orderInfo.oderId);
    /*
     * When clicking on a bookmark in the extension, a new tab is fired with
     * the bookmark url.
     */
    anchor.click(function () {
        chrome.tabs.create({url: orderInfo.url});
    });


    var li = $('<li>');
    li.append(anchor);
    return li;
}