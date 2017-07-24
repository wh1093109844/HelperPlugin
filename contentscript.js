
chrome.extension.onConnect.addListener((port) => {
    port.onMessage.addListener((userInfo) => {
        alert("true")
        var orderList = filterOrder(userInfo.ids)
        var info = {"from": "FROM_CONTENT", "orderList": orderList};
        chrome.runtime.connect().postMessage(info);
        window.reload()
    })
})
// chrome.runtime.connect().postMessage(info);
chrome.extension.sendMessage({"from": "isNeedQuery"}, function(response) {
    console.info(response.farewell);
    if (response.farewell) {
        window.location.reload();
    }
});

function hasId(id, ids) {
    for (str of ids) {
        if (id == str) {
            return true;
        }
    }
    return false;
}

function filterOrder(ids) {
    var orderList = new Array();
    var orderIndex = 0;
    $("input.cust-id").filter((_, element) => {
        var custId = element.value;
        if (hasId(custId, ids)) {
            orderList[orderIndex] = getOrderInfo(element, custId);
            orderIndex++;
        }
    });
    return orderList;
}

function getOrderInfo(input, custId) {
    var tagA = $(input).parent().next().children("a")[0];
    var orderInfo = {"oderId": tagA.text, "url": tagA.href, "custId": custId};
    return orderInfo;
}