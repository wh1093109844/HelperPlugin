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
        ids = ids.filter((orderInfo) => {
            if (orderInfo.custId == "" || orderInfo.custId == undefined) {
                return false;
            }
            return true;
        });
        var userInfo = {"from": "FILTER_ORDER", "ids": ids}
        if (ids.length == 0) {
            alert("请输入用户ID");
        } else {
            chrome.extension.getBackgroundPage().sendMsg(userInfo);
        }
    })
    $("table").on("click", "a.order_url", (event) => {
        chrome.tabs.create({"url": event.target.href});
    });
    $("table").on("click", "a.del_cust", (event) => {
        var tr = $(event.target).parents("tr");
        deleteTR(tr[0]);
    });
    $("#clean_all").on("click", () =>{
        var trList = $("tr");
        for (var i = 1; i < trList.length - 1; i++) {
            var tr = trList[i];
            deleteTR(tr);
        }
    })
    init();
});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((info) => {
        var orderList = info.orderList;
        if (orderList == null || orderList == undefined || orderList.length == 0) {
            alert("没有找到符合条件的数据！");
            return;
        }
        for (var orderInfo of orderList) {
            setLocalData(orderInfo.id, orderInfo.custId, orderInfo.orderId, orderInfo.url);
            updatOrderInfo(orderInfo);
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
    var opearTD = $("<td>");
    tr.append(custIdTD).append(orderIdTD).append(opearTD);
    var custInput = $("<input>");
    custInput.attr("type", "text");
    custInput.attr("id", id);
    custInput.addClass("cust_id_input");
    custInput.val(custId);
    custIdTD.append(custInput);
    var orderALink = $("<a>");
    orderALink.text(orderId);
    orderALink.attr("href", orderUrl);
    orderALink.addClass("order_url")
    orderIdTD.append(orderALink);
    var delteButton = $("<a>");
    delteButton.text("删除");
    delteButton.addClass("del_cust");
    delteButton.attr("href", "#")
    opearTD.append(delteButton);
    $("table").append(tr);
    showDeleteButton();
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
    saveLocalData(data);
}

function saveLocalData(datas) {
    localStorage.setItem("local_value", JSON.stringify(datas));
}

function removeLocalData(id) {
    let datas = getLocalData();
    datas = datas.filter((orderInfo) => {
        return orderInfo.id != id
    })
    saveLocalData(datas);
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

function updatOrderInfo(orderInfo) {
    var element = $(`#${orderInfo.id}`).parent().next().find("a")[0];
    element.text = orderInfo.orderId;
    element.href = orderInfo.url;
}

function deleteTR(tr) {
    var id = $(tr).find("input")[0].id;
    removeLocalData(id);
    tr.remove();
}

function showDeleteButton() {
    let deleteButtons = $("a.del_cust");
    let length = deleteButtons.length;
    for (var i = 0; i < length; i++) {
        if (i < length -1) {
            $(deleteButtons[i]).show();
        } else {
            $(deleteButtons[i]).hide();
        }
    }
}