/**
 * Created by huangweihao on 2016/12/3.
 */
jQuery.validator.addMethod("check_password", function (value, element) {
    return this.optional(element) || checkStrong(value);
}, $.validator.messages['check_password']);


jQuery.validator.addMethod("notEqual", function(value, element, param) {
    return this.optional(element) || value != $(param).val();
}, "一级密码不能和二级密码一样");

jQuery.validator.addMethod("notInit", function(value, element, param) {
    return this.optional(element) || value != param;
}, "不能设置为初始密码");

$("#cform").validate(
    {
        rules: {
            referringsales: { required: false, notEqual: "#salesperson" }
        }
    })

//////////////////////////////////////////////////////////////////////
//密码检测密码强度
//////////////////////////////////////////////////////////////////////
function checkStrong(sValue) {
    if (sValue == '') return true;
    var modes = 0;
    //正则表达式验证符合要求的
    if (sValue.length < 1) return modes;
    if (/\d/.test(sValue)) modes++; //数字
    if (/[a-zA-Z]/.test(sValue)) modes++; //小写
    //if (/[A-Z]/.test(sValue)) modes++; //大写
    //if (/\W/.test(sValue)) modes++; //特殊字符
    if (modes == 2) {
        return true;
    }
    return false;
}


$("#Personal").validate(
    {
        rules:
        {

            Pwd11: { required: true, minlength: 6, maxlength: 20,check_password:true, notInit: "a111111" },
            Pwd12: { required: true, minlength: 6, maxlength: 20, equalTo: "#Pwd11" },


            Pwd21: {minlength: 6, maxlength: 20,check_password:true, notEqual: "#Pwd11", notInit: "a111111" },
            Pwd22: {minlength: 6, maxlength: 20, equalTo: "#Pwd21"}
        }
    }
);