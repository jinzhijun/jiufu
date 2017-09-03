$(document).ready(function(){
   $(".getAuthcode").click(function () {
       requestAuthcode($(this));
   });

   $("#SaleNumberI").change(function () {
        var saleNum = parseInt($(this).val());
        var feeRatio = parseFloat($('#feeRatioI').val());

        var fee = (saleNum * feeRatio).toFixed(2);
        $("#FeeNumberI").text(fee);

        var totalNum = (saleNum * (1 + feeRatio)).toFixed(2);
        $("#totalNumberI").text(totalNum);
   });

    $("#SaleNumber").change(function () {
        var saleNum = parseInt($(this).val());
        var feeRatio = parseFloat($('#feeRatio').val());
        var isFreeFee = parseInt($("#isFreeFee").val());

        var fee = isFreeFee ? 0 : (saleNum * feeRatio).toFixed(2);
        $("#FeeNumber").text(fee);

        var totalNum = isFreeFee ? saleNum : (saleNum * (1 + feeRatio)).toFixed(2);
        $("#totalNumber").text(totalNum);
    });


    //mobile
    $('.tabs-item').on('click', function () {
        $(".tabs-item").removeClass("tabs-item-current");
        var $this = $(this);
        $this.addClass("tabs-item-current");
        $(".content-item").addClass("hide");
        $("#" + this.dataset.page).removeClass("hide");
    });

    $('body').on('keydown', function (e) {
        if (e.keyCode == 13)
            return false;
    });
});

function countDown(obj, sec, oritxt, info) {
    if (sec == 0)
    {
        obj.removeAttr('disabled');
        obj.val(oritxt);
    }
    else
    {
        obj.attr('disabled', true);
        obj.val(sec + info);
        sec--;
        setTimeout(function(){
            countDown(obj, sec, oritxt, info);
        }, 1000);
    }
}

function requestAuthcode(obj) {
    $.post("/trade/sendSms", function(data){
        if (!data)
            return;

        if (data.ret == 0)
            alert(data.msg);
        else
            countDown(obj, 60, '获取短信验证码', '秒后重新获取');
    }, "json");
}

$("#usual1 ul").idTabs({
    click: function (id, all, container, settings) {
        //var validate = $("#form1").validate();
        //if (validate)
        //{
        //validate.resetForm();
        //}
        return true;
    }
});
//$('#tab1').click(function () {
//    //$("form1").validate().resetForm();
//    document.getElementById("form1").reset();
//});
//$('#tab2').click(function () {
//    alert("a");
//    //$("form1").validate().resetForm();
//    document.getElementById("form1").reset();
//});

$('.tablelist tbody tr:odd').addClass('odd');

jQuery.validator.addMethod("isHundred", function (value, elements) {
    value = parseInt(value);
    return value % 100 == 0;
}, "必须是100整数倍");
jQuery.validator.addMethod("isTen", function (value, elements) {
    value = parseInt(value);
    return value % 10 == 0;
}, "必须是10整数倍");
jQuery.validator.addMethod("checkTotalNumI", function (value, elements) {
    total = parseInt($("#totalNumberI").text());
    current = parseFloat($("#CurrentAppleNumber").text());

    return current >= total;
}, "仓库数量不足");

jQuery.validator.addMethod("checkTotalNum", function (value, elements) {
    total = parseInt($("#totalNumber").text());
    current = parseFloat($("#LbAppleNumber").text());

    return current >= total;
}, "仓库数量不足");

function Tab1Validate() {
    var needAuthcode = ($("#needAuthcode").val() == 1);
    var validator1 = $("#form1").validate({
        rules: {
            SaleNumberI: {required: true, digits: true, isHundred: true, checkTotalNumI: true, max: 10000, min: 100},
            autoCode: {required: needAuthcode, digits: true, minlength: 4, maxlength: 4}
        },
        submitHandler: function (form) {
            $("#BtnSave1").attr('disabled', 'disabled');
            form.submit();
        }
    });
}

function Tab2Validate() {
    var needAuthcode = ($("#needAuthcode").val() == 1);
    var validator2 = $("#form2").validate({
        rules: {
            SaleNumber: {required: true, digits: true, isTen: true, checkTotalNum:true, min: 10},
            SaleUserId: {required: true},
            SaleUserName: {required: true},
            autoCode: {required: needAuthcode, digits: true, minlength: 4, maxlength: 4}
        },
        submitHandler: function (form) {
            $("#BtnSave2").attr('disabled', 'disabled');
            form.submit();
        }
    });
}

function submitBtn1() {
    Tab1Validate();
    $("#form1").submit();
}

function submitBtn2() {
    Tab2Validate();
    $("#form2").submit();
}