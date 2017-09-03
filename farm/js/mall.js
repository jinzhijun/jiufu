
var search = false;

function checkSearch() {
    var userId = $("#txtMallUserId").val();
    var password = $("#txtMallUserPassword").val();
    if (userId == '') {
        alert("请输入商城手机号");
        $("#txtMallUserId").focus();
        return false;
    }
    if (password == '') {
        alert("请输入商城密码");
        $("#txtMallUserPassword").focus();
        return false;
    }
    $.ajax({
        'url': '/farm/mallsearch',
        'type': 'post',
        'data': {
            'uname': userId,
            'upwd': password
        },
        'dataType': 'json',
        'success': function (data) {
            if (data.StatusCode == 0) {
                $('#lbMallNumber').text(data.Balance);
                search = true;
            }
            else {
                alert(data.Message);
            }
        }
    });

    return false;
}

function checkTrans1() {
    var userId = $("#txtMallUserId").val();
    var password = $("#txtMallUserPassword").val();
    if (!search) {
        alert("请先查询余额");
        return false;
    }
    if (userId == '') {
        alert("请输入商城手机号");
        $("#txtMallUserId").focus();
        return false;
    }
    if (password == '') {
        alert("请输入商城密码");
        $("#txtMallUserPassword").focus();
        return false;
    }
    var txtToMallNumber = $("#txtToMallNumber").val();
    if (txtToMallNumber == '') {
        alert("请输入转账数量");
        $("#txtToMallNumber").focus();
        return false;
    }
    if (!checkNumber(txtToMallNumber)) {
        $("#txtToGameNumber").focus();
        alert("转账数量必须为大于0的整数");
        return false;
    }

    if (confirm("确认转账吗？") == true) {
        $.ajax ({
            'url': '/farm/malltransfer',
            'type': 'post',
            'data': {
                'uname': userId,
                'upwd': password,
                'c': txtToMallNumber
            },
            'dataType': 'json',
            'success': function (data) {
                if (data.StatusCode == 0) {
                    var lbStoreNumber = $('#lbStoreNumber').text();
                    var surplusNumber = (lbStoreNumber - data.Balance).toFixed(2);
                    $('#lbStoreNumber').text(surplusNumber);
                    checkSearch();
                }
                alert(data.Message);
            }
        });
    }
    return false;
}


function checkTrans2() {
    if (checkSearch()) {
        var txtToMallNumber = $("#txtToGameNumber").val();
        if (txtToMallNumber == '') {
            alert("请输入转账数量");
            $("#txtToGameNumber").focus();
            return false;
        }
        if (!checkNumber(txtToMallNumber)) {
            $("#txtToGameNumber").focus();
            alert("转账数量必须为大于0的整数");
            return false;
        }
        return confirm("确认转账吗？");
    }
    return false;
}



function checkNumber(input) {
    var re = /^[0-9]*$/;
    return re.test(input);
}