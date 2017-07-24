
chrome.extension.onConnect.addListener((port) => {
    port.onMessage.addListener((userInfo) => {
        var orderList = filterOrder(userInfo.ids)
        var info = {"from": "FROM_CONTENT", "orderList": orderList};
        chrome.runtime.connect().postMessage(info);
    })
})
// chrome.runtime.connect().postMessage(info);
chrome.extension.sendMessage({"from": "isNeedQuery"}, function(response) {
    console.info(response.farewell);
    if (response.farewell) {
        window.location.reload();
    }
});

function getOrderInfoByCustId(custId, orderInfoList) {
    for (var orderInfo of orderInfoList) {
        if (custId == orderInfo.custId) {
            return orderInfo;
        }
    }
    return null;
}

function filterOrder(orderInfoList) {
    var orderList = new Array();
    var custIdInputList = $("input.cust-id");
    for (var i = 0; i < custIdInputList.length; i++) {
        var element = custIdInputList[i];
        var custId = element.value;
        var orderInfo = getOrderInfoByCustId(custId, orderInfoList);
        if (orderInfo == null) {
            continue;
        }
        orderList.push(getOrderInfo(element, orderInfo));
    }
    return orderList;
}

function getOrderInfo(input, orderInfo) {
    var tagA = $(input).parent().next().children("a")[0];
    orderInfo.orderId = tagA.text;
    orderInfo.url = tagA.href;
    return orderInfo;
}