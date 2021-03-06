
chrome.extension.onConnect.addListener((port) => {
    port.onMessage.addListener((userInfo) => {
        // var orderList = filterOrder(userInfo.ids)
        // var info = {"from": "FROM_CONTENT", "orderList": orderList};
        // chrome.runtime.connect().postMessage(info);
        requestNeddQuery();
    })
})
// chrome.runtime.connect().postMessage(info);
requestNeddQuery();

function requestNeddQuery() {
    chrome.extension.sendMessage({"from": "isNeedQuery"}, (response) => {
        if (response.isNeedQuery) {
            let orderList = filterOrder(response.orderInfoList);
            let info = {"from": "FROM_CONTENT", "orderList": orderList};
            chrome.runtime.connect().postMessage(info);
            goNextPage();
            setTimeout(requestNeddQuery(), 5000);
        }
    });
}

function goNextPage() {
    $("span a.myo_list_orders_link").last()[0].click();
}

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

var timeout = true; //启动及关闭按钮
function time()
{
    if(timeout) return;
    requestNeddQuery();
    setTimeout(time,100); //time是指本身,延时递归调用自己,100为间隔调用时间,单位毫秒
}