//var url='test.jiufu.com';
var url='test.jiufu.com';
$(function () {
    $('#vcode-2').click(function (e) {
        e.preventDefault();
        var obj_img = $(this);
        obj_img.attr('src', obj_img.attr('src')+'/' + Math.random())
    });

    $('#vcode').focus(function () {
//            $('#vcode-2').trigger('click');
    });

    $('.loginbtn').click(function () {
        document.loginForm.submit();
    });

    $('#loginForm').keydown(function (e) {
        if (e.keyCode == 13) {
            $("#btnSave").trigger('click');
        }
    });

    $("#btnSave").click(function () {
        var username = $("#UserId").val();
        var userpass = $("#Password").val();
        var authcode = $("#vcode").val();

        if (username == "") {
            alert("请输入用户名！");
            $("#UserId").focus();
            return false;
        }
        if (userpass == "") {
            alert("请输入用户密码！");
            $("#Password").focus();
            return false;
        }
        if (authcode == "") {
            alert("请输入验证码！");
            $("#vcode").focus();
            return false;
        }

        var action = "http://"+url+$("#loginForm").attr('action');

        $.ajax({
            type: "POST",
            url: action,
            data: $("#loginForm").serialize(),
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    window.location.href=data.referer;
                }
            }
        });
    });

    $('#UserId').focus();

    initModalWin();

    $("#getAuthcode").click(function () {
        var phone = $("#phone").val();

        if (phone == "")
        {
            alert('请输入要重置密码的账号手机号码！');
            $("#phone").focus();
            return false;
        }

        if (!checkTelNum(phone))
        {
            alert('请输入正确的手机号码！');
            $("#phone").focus();
            return false;
        }
        var action = "http://"+url+'/index.php/portal/index/sendphonecode';
        $.post(action,{phone:phone,fs:'forget'},function(data){
        if(data.ok == 0){
           alert(data.msg);
           countDown($(this), 60, '获取短信验证码', '秒后重新获取');
        }else{
           alert(data.msg);
        }
        },'json');
    });

       $("#js_reset_submit").click(function () {
        var acc = $("#username").val();
        var phone = $("#phone").val();
        var pwd = $("#user_pass").val();
        var authcode = $("#phonecode").val();

        if (phone == "")
        {
            alert('请输入要重置密码的账号手机号码！');
            $("#phone").focus();
            return false;
        }
        if (!checkTelNum(phone))
        {
            alert('请输入正确的手机号码！');
            $("#phone").focus();
            return false;
        }
        if (pwd == "")
        {
            alert('请输入要重置的新密码！');
            $("#user_pass").focus();
            return false;
        }
        if (!checkPasswordStrong(pwd))
        {
            alert('新密码为6~16位的数字字母组合！');
            $("#user_pass").focus();
            return false;
        }
        if (authcode == "")
        {
            alert('请输入短信验证码！');
            $("#phonecode").focus();
            return false;
        }

        var action = "http://"+url+$("#forgetForm").attr('action');
        $.ajax({
            type: "POST",
            url: action,
            data: $("#forgetForm").serialize(),
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    window.location.href=data.referer;
                }
            }
        });
    });
});

//初始化模态框
function initModalWin() {
    $('#pwdModal').modal({
        keyboard: false,
        backdrop: 'static',
        show: false
    });

    $("a[rel='getPwd']").click(function(){
        $('#pwdModal').modal('show');

        return false;
    });
}

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

function requestAuthcode(obj, acc, tel) {
    $.post("/login/sendSms", {'acc': acc, 'tel': tel}, function(data){
        if (!data)
            return;

        if (data.ret == 0)
            alert(data.msg);
        else
            countDown(obj, 60, '获取短信验证码', '秒后重新获取');
    }, "json");
}

function requestResetPwd(acc, tel, pwd, authcode) {
    $.post("/login/forget", {'acc': acc, 'tel': tel, 'pwd': pwd, 'code': authcode}, function(data){
        if (!data)
            return;

        alert(data.msg);

        if (data.ret == 1) //成功
        {
            window.location.reload();
        }
    }, "json");
}

/**
 * 检查密码强度是否符合规则:字母+数字
 * @param pwd
 * @returns {boolean}
 */
function checkPasswordStrong(pwd)
{
    //字母+数字组合
    var t1 = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]+$/.test(pwd);
    var t2 = pwd.length >= 6 && pwd.length <= 16;

    return t1 && t2;
}

/**
 * 检查手机号码
 * @param num
 * @returns {boolean}
 */
function checkTelNum(num)
{
    return /^1\d{10}$/.test(num);
}