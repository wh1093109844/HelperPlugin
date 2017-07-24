$(function () {

    $('#start_search').click(function () {
        // chrome.extension.getBackgroundPage().sendMsg(userInfo);
    });

    $("table").on("input paste", "td input", (event) => {
        handleOnInput(event);
    });

    $("table").on("change", "td input", (event) => {
        handleOnChange(event.target);
    });

    $("#search_btn").on("click", () => {
        var ids = getLocalData();
        var userInfo = {"from": "FILTER_ORDER", "ids": ids}
        if (ids.length == 0) {
            alert("请输入用户ID");
        } else {
            chrome.extension.getBackgroundPage().sendMsg(userInfo);
        }
    })

    init();
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

function addRow(id, custId, orderId, orderUrl) {
    var tr = $("<tr>");
    var custIdTD = $("<td>");
    var orderIdTD = $("<td>");
    tr.append(custIdTD).append(orderIdTD);
    var custInput = $("<input>");
    custInput.attr("type", "text");
    custInput.attr("id", id);
    custInput.addClass("cust_id_input");
    custInput.val(custId);
    custIdTD.append(custInput);
    var orderALink = $("<a>");
    orderALink.text(orderId);
    orderALink.attr("href", orderUrl);
    orderIdTD.append(orderALink);
    $("table").append(tr);
}

class OrderInfo {
    constructor(id, custId, orderId, url) {
        this.id = id;
        this.custId = custId;
        this.orderId = orderId;
        this.url = url;
    }
}

function handleOnInput(event) {
    var input = $(event.target);
    var parents = input.parents("tr");
    var val = input.val();
    var length = $("table").find("tr").length;
    if ((event.type == "paste" || (val != "" && val != undefined)) && parents.index() == length - 1) {
        addRow(createId())
    }
}

function handleOnChange(element) {
    let custID = element.value.trim();
    let id = element.id;
    setLocalData(id, custID)
}

function getInputCustIds() {
    var inputList = $(".cust_id_input");
    var ids = new Array();
    for (var i = 0; i < inputList.length; i++) {
        var input = inputList[i];
        let value = input.value.trim();
        if (value == "" || value == undefined) {
            continue;
        }
        ids.push(value);
    }
    return ids;
}

function getLocalData() {
    let localStr = localStorage.getItem("local_value");
    if (localStr == null) {
        return new Array();
    }
    return JSON.parse(localStr);
}

function setLocalData(id, custId, orderId, url) {
    let data = getLocalData();
    var orderInfo = getOrderInfoByCustId(id, data);
    if (orderInfo == null) {
        orderInfo = new OrderInfo(id, custId, orderId, url);
        data.push(orderInfo);
    } else {
        orderInfo.custId = custId;
        orderInfo.orderId = orderId;
        orderInfo.url = url;
    }
    localStorage.setItem("local_value", JSON.stringify(data));
}

function getOrderInfoByCustId(id, orderList) {
    for (var order of orderList) {
        if (order != null && order.id == id) {
            return order;
        }
    }
    return null;
}

function createId() {
    return Math.random().toString(36).substr(2);
}

function init() {
    let data = getLocalData();
    for (var orderInfo of data) {
        addRow(orderInfo.id, orderInfo.custId, orderInfo.orderId, orderInfo.url)
    }
    addRow(createId())
}