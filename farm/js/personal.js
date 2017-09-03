/**
 * Created by huangweihao on 2016/12/3.
 */
$("#form1").validate(
    {
        rules:
        {

            Mobile: { minlength: 5, maxlength: 20 }

        }
    }
);