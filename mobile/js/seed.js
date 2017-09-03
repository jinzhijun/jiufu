jQuery.validator.addMethod("isHundred", function (value, elements) {
    value = parseInt(value);
    return value % 100 == 0;
}, "必须是100整数倍");

$("#form1").validate(
    {
        rules: {
            Number: {isHundred: true, required: true}
        },
        submitHandler: function (form) {
            if (confirm('提示：确认要兑换金币吗？本操作无法恢复！')) {
                form.submit();
            }
        }

    }
);