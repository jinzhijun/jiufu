//global

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
} 

var storage=window.localStorage;
var uid=getQueryString('uid');
var token=getQueryString('token');
var url = 'test.jiufu.com';
var websocket = new WebSocket("ws://"+url+":8181");
if(uid>0){
    var userId = uid;
    var token = token;
    var selfId = userId;
    storage.setItem("userId",uid);
    storage.setItem("token",token);
}
else{
    var userId = storage['userId'];
    var selfId = userId;
    var token = storage['token'];
}

var firstLogin = $("#userFirstlogin").val();
var firstClick = true;

var apiCalling = 0;
var menuAnimate = 0;

var shownFunc = null;
var hidenFunc = null;

/*******背景音乐 和 音效 控制********/
var bgMusic = document.getElementById("bg-music");
var anniu = document.getElementById("anniu-music");
var anniuclick= document.getElementById("anniu-click-music");
var beers = document.getElementById("beers-music");
var caimi = document.getElementById("caimi-music");
var chandi = document.getElementById("chandi-music");
var jiaoshui = document.getElementById("jiaoshui-music");
var shifei = document.getElementById("shifei-music");
var shouhuo = document.getElementById("shouhuo-music");
var zengzhong1 = document.getElementById("zengzhong1-music");
var zengzhong2 = document.getElementById("zengzhong2-music");
var husky = document.getElementById("husky-music");
var dog = document.getElementById("dog-music");
var newMessage = document.getElementById("new-message-music");
var musicEffect = true;
var jrtype=0;
detectPhone();
websocket.onopen = function(event) {
    $('body').css('overflow','hidden');
    $('body').css('position','fixed');

    /*******登录界面背景图 自适应********/
    $('#login-bg').height($(window).height());
    $('#login-bg').width($(window).width());
    $('#subWinFrame').height($(window).height() - 200);
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='init';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    };
websocket.onmessage = function(event) {
        zdata=JSON.parse(event.data);
        console.log(zdata);
        window[zdata.act](zdata.msg);
};
function onecm(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjcm';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
function onezz(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjzz';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
function onesf(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjsf';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
function onesh(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjsh';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
function outlogin(msg){
    displayMessage(msg);
    storage.removeItem("token");
    storage.removeItem("uid");
    location.href='login.html';
}
function inituserxx(data){
    //初始化模态框
    displayUserInfo(data.userinfo);
    initModalWin();
    initNewWin();

    //初始化菜单
    initMenu();

    //初始化音效
    initMusic();

    //初始化消息数量
    initMsgTip();
    //初始化系统设置
    initSystemSettingDialog();

    //初始化增种框
    initSeedDialogEvent();

   //初始化农场
    initFarmDisplay();
    //请求农场地块信息
    initFarmGround(userId);
    //请求稻草人信息
    initFarmScarecrow(userId);

    //初始化引导--新手指引（没弄）
    //initGuide();

    userMusic();

    //是否从好友农场回来，是则打开好友列表
    checkGoFriend();

    //记录最后用户
    recordLastUid();

    //检查初始密码
    checkIsInitPwd();

    initUserInfo(userId);
};
//密码检查
function checkIsInitPwd() {
    var isInitPwd = $('#isInitPwd').val();
    if (isInitPwd) {
        alert('请前往【个人信息】菜单修改初始密码，否则不能种地！');
    }
}
//记录最后用户
function recordLastUid() {
    Cookies.set('lUid', userId);
}

//是否从好友农场回来
function checkGoFriend() {

    var luid = Cookies.get('lUid');
    console.log(luid);

    var referrer = document.referrer;//返回当前页面的url
    console.log(referrer);
    if (referrer) {
        var matchs = referrer.match(/userid=([^&]+)/);
        if (matchs && luid != selfId) {
            $("#farm-friend a").trigger('click');
        }
    }
}

//初始化引导--新手设置（没弄）
function initGuide() {
    if (firstLogin == 0)
    {
        $("#xinshou-guide a").trigger('click');
    }
}

//初始化界面信息
function refreshGameData() {
    //请求用户信息
    initUserInfo(selfId);
    //请求农场地块信息
    initFarmGround(selfId);
    //请求稻草人信息
    initFarmScarecrow(selfId);
    apiCalling = 0;
}

//显示提示信息
function displayMessage(msg) {
    $("#request-msg").stop();

    $("#request-msg").text(msg);
    $("#request-msg").show();
    $("#request-msg").css({opacity: '1'});
    $("#request-msg").fadeOut(6000);
    apiCalling = 0;
    refreshGameData();
}
// 去牧场
function gomuchang(type) {
    var uid=getQueryString('uid');
    var token=getQueryString('token');
    window.location.href = '/mobile/rangeland.html?uid='+uid+'&token='+token;
}
//系统维护
function goMaintenance(type) {
    window.location.href = '/mobile/maintenance.html?t=' + type;
}

//远程请求接口
function requestAction(action, data, func) {
     var fs = data;
        fs.userid=userId;
        fs.salt=token;
        fs.func=func; 
        fs.act=action;
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
        refreshGameData();
    // $.ajax({
    //     url: api + action,
    //     dataType: "json",
    //     method: "get",
    //     data: data,
    //     success: function (result) {
    //         var code = result.StatusCode;
    //         var msg = result.Message;

    //         displayMessage(msg);

    //         if (code == 0) //refresh game data
    //         {
    //             refreshGameData();
    //         } else if (code == -999) {
    //             goMaintenance(result.Type);
    //         }
    //     },
    //     complete: function () {
    //         apiCalling = 0;

    //         if (func != undefined && typeof func == "function") {
    //             func();
    //         }
    //     }
    // });
}

//插稻草人
function pluginScarecrow(sIdx) {
    if (selfId != userId)
        return false;

    //check is ready reclaim
    if ($('#s_' + sIdx).data('isPlugin') == 1) {
        displayMessage("这个位置已经插入稻草人，无需重复插入");
        return false;
    }

    //request api
    requestAction('pluginScarecrow', {"userid": userId, "location": sIdx});
}

//开垦函数
function reclaimAction(groundIdx) {
    if (selfId != userId)
        return false;

    //check is ready reclaim
    //check is ready reclaim
    if (groundIdx>1 && $('.land[groundnumber=' + (groundIdx-1) + ']').data('isReclaim')!= 1) {
        displayMessage("上一块地还未开垦 不能开垦此地");
        return false;
    }
    if ( $('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 1) {
        displayMessage("地块已经开垦");
        return false;
    }

    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /***此时单击土地   铲子动画***/
    /*var Img = new Array("statics/images/final/chantu/effect_chantu_0001.png", "statics/images/final/chantu/effect_chantu_0002.png", "statics/images/final/chantu/effect_chantu_0003.png", "statics/images/final/chantu/effect_chantu_0004.png", "statics/images/final/chantu/effect_chantu_0005.png");
     var size = Img.length;*/

    var i = 0;
    var x = 0;
    var iTimer = null;

    function chImg(gid) {
        if ($('#chantu').length == 0) {
            $('.groundnumber' + gid).html('<div id="chantu"></div>');
            //$(".groundnumber" + gid).html('<img src="images/final/chantu/chantu.png" id="picID" width="90px" height="120px" style="display: block;z-index:200;position:absolute;left:70px;bottom:30px"></a>');
        }

        /*$('#picID').attr('src', Img[i]);*/
        $('#chantu').css('background-position-x', x + 'px');
        i++;
        x -= 90;
        if (i <= 5) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        }
        else {
            $('#chantu').remove();
            clearTimeout(iTimer);
            i = 0;

            apiCalling = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(chandi);



    //request api
    requestAction('reclaimCrop', {"userid": userId, "groundnumber": groundIdx});
}

//浇水函数
function waterAction(groundIdx) {
    if (selfId != userId)
        return false;

    //check is ready reclaim
   if ($('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 0) {
        displayMessage("请先开垦");
        return false;
    }
    if ($('.land[groundnumber=' + groundIdx + ']').data('isWater') == 1) {
        displayMessage("已经浇过水了");
        return false;
    }

    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /***此时单击土地   弹出提示信息***/
    /*var Img = new Array("images/final/jiaoshui/effect_jiaoshui_0001.png", "images/final/jiaoshui/effect_jiaoshui_0002.png", "images/final/jiaoshui/effect_jiaoshui_0003.png", "images/final/jiaoshui/effect_jiaoshui_0004.png", "images/final/jiaoshui/effect_jiaoshui_0005.png", "images/final/jiaoshui/effect_jiaoshui_0006.png", "images/final/jiaoshui/effect_jiaoshui_0007.png", "images/final/jiaoshui/effect_jiaoshui_0008.png", "images/final/jiaoshui/effect_jiaoshui_0009.png", "images/final/jiaoshui/effect_jiaoshui_0010.png", "images/final/jiaoshui/effect_jiaoshui_0011.png", "images/final/jiaoshui/effect_jiaoshui_0012.png", "images/final/jiaoshui/effect_jiaoshui_0013.png", "images/final/jiaoshui/effect_jiaoshui_0014.png", "images/final/jiaoshui/effect_jiaoshui_0015.png", "images/final/jiaoshui/effect_jiaoshui_0016.png", "images/final/jiaoshui/effect_jiaoshui_0017.png");

    var size = Img.length;*/

    var i = 0;
    var x = 0;
    var iTimer = null;

    function chImg(gid) {
        if ($('#jiaoshui').length == 0) {
            $('.groundnumber' + gid).html('<div id="jiaoshui"></div>');
            //$(".groundnumber" + gid).html('<img id="picID" width="90px" height="120px" style="display: block;z-index:200;position:absolute;left:50px;bottom:30px"></a>');
        }

        //$('#picID').attr('src', Img[i]);
        $('#jiaoshui').css('background-position-x', x + 'px');
        i++;
        x -= 225;
        if (i <= 15) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        } else {
            $('#jiaoshui').remove();
            clearTimeout(iTimer);
            i = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(jiaoshui);

    //request api
    requestAction('water', {"userid": userId, "groundnumber": groundIdx});
}

//采蜜函数
function beeAction(groundIdx) {
    if (userId == selfId)
        return false;

    //如果没蜜则不请求
    // var canBeeCount = parseFloat($("#canBeeCount").val());
    // if (canBeeCount <= 0) {
    //     displayMessage("没有蜜蜂");
    //     return false;
    // }

    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /***此时单击土地   弹出提示信息***/
    /*var Img = new Array("statics/images/final/caimi/effect_caimi_0001.png", "statics/images/final/caimi/effect_caimi_0002.png", "statics/images/final/caimi/effect_caimi_0003.png", "statics/images/final/caimi/effect_caimi_0004.png", "statics/images/final/caimi/effect_caimi_0005.png", "statics/images/final/caimi/effect_caimi_0006.png", "statics/images/final/caimi/effect_caimi_0007.png", "statics/images/final/caimi/effect_caimi_0008.png", "statics/images/final/caimi/effect_caimi_0009.png", "statics/images/final/caimi/effect_caimi_0010.png");

     var size = Img.length;*/
    var i = 0;

    var x = 0;

    var iTimer = null;

    function chImg(gid) {
        if ($('#caimi').length == 0) {
            $('.groundnumber' + gid).html('<div id="caimi"></div>');
            //$(".groundnumber" + gid).html('<img id="caimi" width="90px" height="120px" style="display: block;z-index:200;position:absolute;left:50px;bottom:30px"></a>');
        }

        //$('#caimi').attr('src', Img[i]);
        $('#caimi').css('background-position-x', x + 'px');

        i++;
        x -= 160;
        if (i <= 10) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        } else {
            $('#caimi').remove();
            i = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(caimi);

    //request api
    requestAction('flyBee', {"userid": userId, "frienduserid": selfId, "groundnumber": groundIdx});
}

//施肥函数
function fertilizeAction(groundIdx) {
    if (selfId != userId)
        return false;
    console.log(groundIdx);
    //check is ready reclaim
    if ($('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 0) {
        return false;
    }
    if ($('.land[groundnumber=' + groundIdx + ']').data('isWater') == 0) {
        displayMessage("请先浇水后施肥");
        return false;
    }
    //check warehouse count
    if (parseFloat($("#fertilizeCount").text()) == 0) {
        displayMessage("仓库里没有肥料了");
        return false;
    }

    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /*var Img = new Array("statics/images/final/shifei/effect_shifei_0001.png", "statics/images/final/shifei/effect_shifei_0002.png", "statics/images/final/shifei/effect_shifei_0003.png", "statics/images/final/shifei/effect_shifei_0004.png", "statics/images/final/shifei/effect_shifei_0005.png", "statics/images/final/shifei/effect_shifei_0006.png", "statics/images/final/shifei/effect_shifei_0007.png", "statics/images/final/shifei/effect_shifei_0008.png", "statics/images/final/shifei/effect_shifei_0009.png", "statics/images/final/shifei/effect_shifei_0010.png", "statics/images/final/shifei/effect_shifei_0011.png", "statics/images/final/shifei/effect_shifei_0012.png", "statics/images/final/shifei/effect_shifei_0013.png", "statics/images/final/shifei/effect_shifei_0014.png", "statics/images/final/shifei/effect_shifei_0015.png", "statics/images/final/shifei/effect_shifei_0016.png", "statics/images/final/shifei/effect_shifei_0017.png", "statics/images/final/shifei/effect_shifei_0018.png");
     var size = Img.length;*/
    var i = 0;
    var x = 0;
    var iTimer = null;

    function chImg(gid) {
        if ($('#shifei').length == 0) {
            $('.groundnumber' + gid).html('<div id="shifei"></div>');
            //$(".groundnumber" + gid).html('<img id="picID" width="90px" height="120px" style="display: block;z-index:200;position:absolute;left:60px;bottom:70px"></a>');
        }

        //$('#picID').attr('src', Img[i]);
        $('#shifei').css('background-position-x', x + 'px');
        i++;
        x -= 120;
        if (i <= 16) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        } else {
            $('#shifei').remove();
            clearTimeout(iTimer);
            i = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(shifei);



    //request api
    requestAction('fertilize', {"userid": userId, "groundnumber": groundIdx});
}

//收获函数
function reapAction(groundIdx) {
    if (selfId != userId)
        return false;

    //check is ready reclaim
    if ($('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 0) {
        return false;
    }
    if ($('.land[groundnumber=' + groundIdx + ']').data('isWater') == 0) {
        displayMessage("请先浇水后收获");
        return false;
    }

    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /*var Img = new Array("statics/images/final/shouhuo/effect_shouhuo_1.png", "statics/images/final/shouhuo/effect_shouhuo_2.png");
     var size = Img.length;*/
    var i = 0;
    var x = 0;
    var iTimer = null;

    function chImg(gid) {
        if ($('#shouhuo').length == 0) {
            $('.groundnumber' + gid).html('<div id="shouhuo"></div>');
            //$(".groundnumber" + gid).html('<img id="picID" width="40px" height="60px" style="display: block;z-index:200;position:absolute;left:70px;bottom:80px"></a>');
        }
        //$('#picID').attr('src', Img[i]);
        $('#shouhuo').css('background-position-x', x + 'px');
        i++;
        x -= 91;
        if (i <= 2) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        } else {
            $('#shouhuo').remove();
            clearTimeout(iTimer);
            i = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(shouhuo);

    //request api
    requestAction('reap', {"userid": userId, "groundnumber": groundIdx});
}
//收获函数
function reapAction2(groundIdx) {

    if (selfId == userId)
        return false;

    //check is ready reclaim
    if ($('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 0) {
        return false;
    }
    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /*var Img = new Array("statics/images/final/shouhuo/effect_shouhuo_1.png", "statics/images/final/shouhuo/effect_shouhuo_2.png");
     var size = Img.length;*/
    var i = 0;
    var x = 0;
    var iTimer = null;

    function chImg(gid) {
        if ($('#shouhuo').length == 0) {
            $('.groundnumber' + gid).html('<div id="shouhuo"></div>');
            //$(".groundnumber" + gid).html('<img id="picID" width="40px" height="60px" style="display: block;z-index:200;position:absolute;left:70px;bottom:80px"></a>');
        }
        //$('#picID').attr('src', Img[i]);
        $('#shouhuo').css('background-position-x', x + 'px');
        i++;
        x -= 91;
        if (i <= 2) {
            iTimer = setTimeout(function () {
                chImg(gid)
            }, 200);
        } else {
            $('#shouhuo').remove();
            clearTimeout(iTimer);
            i = 0;
        }
    }

    chImg(groundIdx);

    /***点击土地后    播放音效 ***/
    playEffect(shouhuo);

    //request api
    requestAction('reap2', {"userid": userId, "frienduserid": selfId,"groundnumber": groundIdx});
}

//增种函数
function seedAction(groundIdx) {
    if (selfId != userId)
        return false;

    //check is ready reclaim
    if ($('.land[groundnumber=' + groundIdx + ']').data('isReclaim') == 0) {
        displayMessage("请先开垦");
        return false;
    }

    if ($('.land[groundnumber=' + groundIdx + ']').data('isWater') == 0) {
        displayMessage("请浇水后补种");
        return false;
    }

    //检查地块是否已满
    var unseedFruit = parseFloat($('#unseedFruit').text()).toFixed(2);
    //计算合适的增种数量
    var lockNum = parseFloat($('.land[groundnumber=' + groundIdx + ']').data('lockedNum'));
    var seedNum = parseFloat($('.land[groundnumber=' + groundIdx + ']').data('seedNum'));
    var maxNum = parseFloat($('.land[groundnumber=' + groundIdx + ']').data('maxseedNum'));
    var maxSeedNum = maxNum - lockNum - seedNum;
    var willSeedNum = 0;
    if (unseedFruit > maxSeedNum)
        willSeedNum = maxSeedNum;
    else
        willSeedNum = unseedFruit;
    if (maxSeedNum == 0)
    {
        displayMessage("该果树已种满");
        return false;
    }
    if (apiCalling == 1) //已经在请求
        return false;
    else
        apiCalling = 1;

    /***点击土地后    播放音效 ***/
    playEffect(zengzhong2);

    openGrowDialog(groundIdx, willSeedNum);
}

//初始化对话框事件
function initSeedDialogEvent() {
    /***单击确认键 和 关闭键   关闭增种栏***/
    $("#farm-grow-close").on('click', function () {
        closeGrowDialog();
    });

    $("#farm-grow-confirm").on('click', function () {
        //check input number
        var number = $(".farm-grow-wrap #grownumber").val();
        if (!$.isNumeric(number) || number <= 0) {
            alert("请输入大于0的数字，支持两位小数点")
            return false;
        }

        //检查2位小数
        var tel = /^\d+(\.\d{2})?$/;
        var telOne = /^\d+(\.\d{1})?$/;
        if (!(tel.test(number) || telOne.test(number)))
        {
            alert("请输入大于0的数字，支持两位小数点")
            return false;
        }

        var gIdx = $(".farm-grow-wrap #groundnumber").val();
        if (gIdx < 1 || gIdx > 30) {
            alert("请选择要增种的地块");
            return false;
        }

        //check warehouse count
        if (parseFloat($("#unseedFruit").text()) < number) {
            displayMessage("没有足够的金币");
            closeGrowDialog();
            return false;
        }

        /***点击确认后    播放音效 ***/
        playEffect(zengzhong1);

        //request api
        requestAction('seed', {"userid": userId, "groundnumber": gIdx, "seednumber": number}, closeGrowDialog);
    });
}

//打开增种对话框
function openGrowDialog(groundIdx, willSeedNum) {




    $(".farm-grow-wrap #grownumber").val(parseFloat(willSeedNum).toFixed(2));
    $(".farm-grow-wrap #groundnumber").val(groundIdx);
    $(".farm-grow-wrap").show();
}

//关闭对话框
function closeGrowDialog() {
    $(".farm-grow-wrap #groundnumber").val(0);
    $(".farm-grow-wrap").hide();

    apiCalling = 0;
}


//初始化用户信息
function initUserInfo(id) {
     var fs = {};
         fs.userid=userId;
        fs.selfid=id;
        fs.salt=token;
        fs.act='SearchUserInfo'; 
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    // $.ajax({
    //     url: api + "SearchUserInfo",
    //     dataType: "json",
    //     method: "get",
    //     data: {
    //         "userid": userId
    //     },
    //     success: function (result) {
    //         if (result) {
    //             if (result.StatusCode == -999) {
    //                 goMaintenance(result.Type);
    //             }

    //             if (!$.isEmptyObject(result.UserInfo)) {
    //                 displayUserInfo(result.UserInfo);
    //             }
    //         }
    //     }
    // });
}
function jrfriend(id){
    $('#winModal').modal('hide');
    selfId=id;
    jrtype=1;
    initUserInfo(id);
    initFarmGround(id);
    initFarmScarecrow(id);
}
function jrhy(id){
    $('#winModal').modal('hide');
    selfId=id;
    jrtype=2;
    initUserInfo(id);
    initFarmGround(id);
    initFarmScarecrow(id);
}
function fh(){
     selfId=userId;
     jrtype=0;
    var fs = {};
    fs.selfid=userId;
    fs.userid=userId;
    fs.salt=token;
    fs.act='SearchUserInfo'; 
    var jsonStr = JSON.stringify(fs);
    websocket.send(jsonStr);
    initFarmGround(userId);
    initFarmScarecrow(userId);
}
//显示用户统计数据
function displayUserInfo(UserInfo) {
    var dogCount = 0;
     $('#userMusic').val(UserInfo.music);
    $("#unreadNotice").val(UserInfo.unreadNotice);
    $("#unreadMsg").val(UserInfo.unreadMsg);
    if (UserInfo.ishavewolfdog==1) {
        dogCount++;
        $(".husky").show();
    }
    if (UserInfo.ishavetibetandog==1) {
        dogCount++;
        $(".dog").show();
    }

    $("#totalFruit").text(UserInfo.total);
    $("#seedFruit").text(UserInfo.seed);
    $("#unseedFruit").text(UserInfo.money);
    $("#fertilizeCount").text(UserInfo.fertilize);
    $("#beeCount").text(UserInfo.fengmi);
    $("#dogCount").text(UserInfo.friend);
    $("#scarecrowCount").text(UserInfo.tjrs);
    $("#totalGrowth").text(UserInfo.zlx);

    //显示tip
    if (UserInfo.NotSeededAppleNumber > 0)
        $('#farm-tool-6').addClass('tip');
    else
        $('#farm-tool-6').removeClass('tip');

    if (UserInfo.FertilizerWeight > 0)
        $("#farm-tool-4").addClass('tip');
    else
        $("#farm-tool-4").removeClass('tip');

    if (userId == selfId)
        $("#farm-tool-3").addClass('unable');
    else
        $("#farm-tool-3").removeClass('unable');

    //用户名
    $("#farm-user-id").text(UserInfo.user_login);
    $("#farm-user-name").text(UserInfo.true_name);
    $("#farm-user-level").attr('lever', "user_lever_" + UserInfo.level);

    if (selfId != userId)
    {
        //隐藏工具
        $("#farm-tool-1").hide();
        $("#farm-tool-2").hide();
        $("#farm-tool-4").hide();
        $("#farm-tool-5").hide();
        $("#farm-tool-6").hide();
        $("#farm-tool-7").hide();

        if(jrtype==1){
        $("#farm-tool-3").show();
        }
        if(jrtype==2){
        $("#farm-tool-8").show();
        }
        $("#farm-back").show().click(function(){
            fh();
        });
        $("#onecm").hide();
         //隐藏菜单
        $("#farm-game-wrap").hide();
        $("#farm-back").show();
        $(".mail-message").hide();
        $(".notice-message").hide();
    }
    else
    {
        if(UserInfo.onecm==1){
            $("#onecm").show().click(function(){
                onecm();
            });
        }
        $("#farm-tool-1").show();
        $("#farm-tool-2").show();
        if(UserInfo.onesf==1){
            $("#farm-tool-4").addClass('auto');
        }
        else{
            $("#farm-tool-4").removeClass('auto');
        }
        $("#farm-tool-4").show();
        if(UserInfo.onesh==1){
            $("#farm-tool-5").addClass('auto');
        }
        else{
            $("#farm-tool-5").removeClass('auto');
        }
        $("#farm-tool-5").show();
        if(UserInfo.onezz==1){
            $("#farm-tool-6").addClass('auto');
        }
        else{
            $("#farm-tool-6").removeClass('auto');
        }
        $("#farm-tool-6").show();
        $("#farm-tool-7").show();
        $("#farm-tool-8").hide();
        $("#farm-tool-3").hide();
        $("#farm-back").hide();
        //显示菜单
        $("#farm-game-wrap").show();
                initMsgTip();
    }
}

//初始化农场地块信息
function initFarmGround(id) {
     var fs = {};
        fs.act='SearchGround'; 
        fs.userid=userId;
        fs.selfid=id; 
        fs.salt=token;
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    // $.ajax({
    //     url: api + "SearchGround",
    //     dataType: "json",
    //     method: "get",
    //     data: {
    //         "userid": userId
    //     },
    //     success: function (result) {
    //         if (result) {
    //             if (result.StatusCode == -999) {
    //                 goMaintenance(result.Type);
    //             }

    //             if ($.isArray(result.GroundInfos)) {
    //                 displayGround(result.GroundInfos);
    //             }
    //         }
    //     }
    // });
}

//显示地块
function displayGround(GroundInfos) {
    var waterTip = false;
    $.each(GroundInfos, function (idx, obj) {
        var gIdx = obj.GroundNumber;
        var gType = obj.GroundType;
        var lockedNum = parseFloat(obj.LockedAppleNumber);//锁定的苹果数
        var seedNum = parseFloat(obj.SeededAppleNumber);//苹果种子数
        var reclaimNum = parseFloat(obj.ReclaimSeedNumber);//回收种子数（收获的数量）
        var maxseedNum = parseFloat(obj.SeedMaxNumber);//最大种植
        var isWater = obj.IsWater;//是否浇水
        var isReclaim = obj.IsReclaim;//是否开垦

        var gLv = gType;   //地块等级
        var gTreelv = 0;
        if (isReclaim == 0) //未开垦
        {
            gTreelv = 0;
        }
        else {
            if (seedNum == 0) //已掉光
            {
                gTreelv = 10;
            }
            else if (isWater == 0) //未浇水
            {
                gTreelv = 9;
            }
            // else if (lockedNum < reclaimNum) //有掉落
            // {
            //     gTreelv = 9;
            // }
            else //正常状态 1~8
            {
                gTreelv = Math.ceil((lockedNum + reclaimNum) * 7 / (maxseedNum-seedNum+reclaimNum))+1;
            }
        }

        var gObj = $('.land[groundnumber=' + gIdx + ']');
        gObj.attr('lever', 'land_lever_' + gLv);
        gObj.data('lockedNum', lockedNum);
        gObj.data('maxseedNum', maxseedNum);
        gObj.data('reclaimNum', reclaimNum);
        gObj.data('seedNum', seedNum);
        gObj.data('isReclaim', isReclaim);
        gObj.data('isWater', isWater);
        var totalFruitNum = parseFloat(seedNum + lockedNum).toFixed(2);
        gObj.find('.beans').text(totalFruitNum);  //已种果子数

        var gTreeObj = gObj.find('.tree');  //果树对象
        gTreeObj.attr('lever', 'tree_lever_' + gTreelv);

        //未浇水
        if (!waterTip && isReclaim && isWater == 0)
            waterTip = true;
    });

    if (waterTip)
        $("#farm-tool-2").addClass('tip');
    else
        $("#farm-tool-2").removeClass('tip');
}

//初始化稻草人信息
function initFarmScarecrow(id) {
    var fs = {};
        fs.act='SearchScarerow';
        fs.selfid=id; 
        fs.userid=userId;
        fs.salt=token; 
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    // $.ajax({
    //     url: api + "SearchScarerow",
    //     dataType: "json",
    //     method: "get",
    //     data: {
    //         "userid": userId
    //     },
    //     success: function (result) {
    //         if (result) {
    //             if (result.StatusCode == -999) {
    //                 goMaintenance(result.Type);
    //             }

    //             displayScarecrow(result.ScarecrowInfo);
    //         }
    //     }
    // });
}

//显示稻草人
function displayScarecrow(ScarecrowInfo) {
    var onePlugin = ScarecrowInfo.IsLocationOnePlugin;
    var twoPlugin = ScarecrowInfo.IsLocationTwoPlugin;
    var threePlugin = ScarecrowInfo.IsLocationThreePlugin;
    var fourPlugin = ScarecrowInfo.IsLocationFourPlugin;

    var sObj1 = $('.scarecrow-socket[name="IsLocationOnePlugin"]');
    var sObj2 = $('.scarecrow-socket[name="IsLocationTwoPlugin"]');
    var sObj3 = $('.scarecrow-socket[name="IsLocationThreePlugin"]');
    var sObj4 = $('.scarecrow-socket[name="IsLocationFourPlugin"]');

    if (onePlugin==1) showScarecrow(sObj1);
    else hideScarecrow(sObj1);
    if (twoPlugin==1) showScarecrow(sObj2);
    else hideScarecrow(sObj2);
    if (threePlugin==1) showScarecrow(sObj3);
    else hideScarecrow(sObj3);
    if (fourPlugin==1) showScarecrow(sObj4);
    else hideScarecrow(sObj4);
}

//显示稻草人
function showScarecrow(obj) {
    obj.data('isPlugin', 1);
    obj.find('.scarecrow').show();
}
function hideScarecrow(obj) {
    obj.data('isPlugin', 0);
    obj.find('.scarecrow').hide();
}

//初始化新窗口
function initNewWin() {
    $("a[rel='newWin']").attr('target', '_blank');
}

//初始化模态框
function initModalWin() {
    $('#winModal').modal({
        keyboard: false,
        backdrop: 'static',
        show: false
    }).on('hidden.bs.modal', function(){
        // console.log('hide');
        $("#subWinFrame")[0].src = 'about:blank';

        if (hidenFunc != null && typeof hidenFunc == "function") {
            hidenFunc();

            hidenFunc = null;
        }
    }).on('shown.bs.modal', function(){
        // console.log('show');
        if (shownFunc != null && typeof shownFunc == "function") {
            shownFunc();
        }
    });

    $("a[rel='modalWin']").click(function(){
        var href = $(this).attr('href');

        openModalWin(href);

        return false;
    });

    $(".newFarm").click(function () {
        hidenFunc = function () {
            console.log('refresh');
            refreshGameData();
        }
    });

    $(".friendFarm").click(function () {
        hidenFunc = function () {
            console.log('refresh');
            refreshGameData();
        }
    });
}

function menuDisplay() {
    if (menuAnimate)
        return;

    if ($(".farm-game-wrap").css('display') == 'block')
        return;

    menuAnimate = 1;

    $(".farm-game-wrap").show();
    $(".farm-game-orchard-click").hide();
    $(".farm-game-info").animate({width:'toggle'}, 100, function () {
        $(".farm-game-orchard-click-2").show();
        menuAnimate = 0;
    });
}

function menuHide() {
    if (menuAnimate)
        return;

    if ($(".farm-game-wrap").css('display') == 'none')
        return;

    menuAnimate = 1;

    $(".farm-game-orchard-click-2").hide();
    $(".farm-game-info").animate({width:'toggle'}, 100, function() {
        $(".farm-game-wrap").hide();
        menuAnimate = 0;
    });
    $(".farm-game-orchard-click").show();
}

//初始化菜单
function initMenu() {
    //菜单滑动
    touch.on('body', 'swipeleft swiperight', function(ev){
        // console.log("you have done", ev.type);
        if (ev.type == 'swipeleft') {
            menuHide();
        } else {
            menuDisplay();
        }
    });

    /*******缩进*****/
    $('.farm-game-orchard-click').click(function () {
        menuDisplay();
    });

    /*******展开*****/
    $('.farm-game-orchard-click-2').click(function () {
        menuHide();
    });

    //===================菜单====================//
    /*******左下角   游戏信息框      下拉效果和折叠效果********/
    $('.title').click(function () {
        var $ul = $(this).next('ul');
        $('dd').find('.menuson').slideUp();
        if ($ul.is(':visible')) {
            $(this).next('.menuson').slideUp();
        } else {
            $(this).next('.menuson').slideDown();
        }
    });

    $(".title:first").trigger("click");
    /*******左下角 游戏信息框     点击隐藏按钮触发事件********/
}

//播放音效
function playEffect(obj) {
    if (!musicEffect)
        return false;
    if (obj == undefined)
        return false;

    if (obj.paused)
        obj.play();
}

//初始化音效
function initMusic() {
    bgMusic.volume = 0.5;   //音量减小

    //音效
    $(".farm-tool-list").mouseenter(function() {
        /***移动到工具播放音效 ***/
        playEffect(anniu);
    }).click(function(){
        /***点击工具后播放音效 ***/
        playEffect(anniuclick);
    });

    /*******小蜜蜂   经过div的特效********/
    $("#farm-info-ico3").mouseenter(function() {
        playEffect(beers);
        $(this).css({cursor:"pointer"});
    });

    /*******经过     哈士奇   div的特效********/
    $(".husky").mouseenter(function() {
        playEffect(husky);
        $(this).css({cursor:"pointer"});
    });

    /*******经过     藏獒   div的特效********/
    $(".dog").mouseenter(function() {
        playEffect(dog);
        $(this).css({cursor:"pointer"});
    });

    /*******经过     站内信 的音效********/
    $(".mail-message").click(function() {
        playEffect(newMessage);
    })
}
function initMsgTip() {
    var unreadNotice = $("#unreadNotice").val();
    var unreadMsg = $("#unreadMsg").val();
    if (unreadMsg > 0)
    {
        $("#mail-number").text(unreadMsg);
        $(".mail-message").show();
    }
    if (unreadNotice > 0)
    {
        $("#notice-number").text(unreadNotice);
        $(".notice-message").show();
    }
}

function userMusic() {

    var userMusic = $('#userMusic').val();

    var userMusicArray = userMusic.split('|');
    var playBgMusic = parseInt(userMusicArray[0]);
    var playEffect = parseInt(userMusicArray[1]);

    //音乐
    if (playBgMusic == 0)
    {
        $("#bg-music-but3").show();
        $("#bg-music-but1").hide();
        bgMusic.pause();
    }
    else
    {
        bgMusic.play();
        $("body").click(function () {
            if (firstClick) {
                bgMusic.play();
                firstClick = false;
            }
        });
    }

    //后台
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState == "hidden") {
            if (bgMusic.paused)
                return;

            bgMusic.pause();
        } else if (document.visibilityState == "visible") {
            if (playBgMusic) {
                bgMusic.play();
            }
        }
    });

    //ios
    // window.addEventListener("pagehide", function() {
    //     alert( "pagehide" );
    // });
    // window.addEventListener("pageshow", function() {
    //     alert( "pageshow" );
    // });
    // $(window).blur(function(){
    //     if (bgMusic.paused)
    //         return;
    //
    //     bgMusic.pause();
    // }).focus(function () {
    //     if (playBgMusic)
    //         bgMusic.play();
    // });


    //音效
    if (playEffect == 0)
    {
        musicEffect = false;
        $("#bg-music-but4").show();
        $("#bg-music-but2").hide();
    }
    else
    {
        musicEffect = true;
    }
}

function initSystemSettingDialog() {
    //音效系统设置
    $("a[rel='systemSetting']").click(function () {
        $(".bg-music-set").show();
    });

    $("#bg-music-close").click(function() {
        $(".bg-music-set").hide();
    });

    //背景音乐
    $("#bg-music-but1").click(function () { //关闭
        bgMusic.pause();
        $("#bg-music-but3").show();
        $(this).hide();
        requestAction('music', {"music": 0, 'status': 0});
    });
    $("#bg-music-but3").click(function () { //打开
            bgMusic.play();
        $("#bg-music-but1").show();
        $(this).hide();
        requestAction('music', {"music": 0, 'status': 1});
    });

    //游戏音效
    $("#bg-music-but2").click(function () { //关闭
            musicEffect = false;
        $("#bg-music-but4").show();
        $(this).hide();
        requestAction('music', {"music": 1, 'status': 0});
    });
    $("#bg-music-but4").click(function () { //打开
            musicEffect = true;
        $("#bg-music-but2").show();
        $(this).hide();
        requestAction('music', {"music": 1, 'status': 1});
    });
}

//初始化农场控制
function initFarmDisplay() {
    //地块果子树数量提示
    $(".land").mouseenter(function () {
        $(this).find('.beans').show();
    }).mouseleave(function () {
        $(this).find('.beans').hide();
    });

    /*******页面加载完毕时   将几个工具高亮全部还原********/
    var arrTools = ["farm-tool-1", "farm-tool-2", "farm-tool-3", "farm-tool-4", "farm-tool-5", "farm-tool-6"];
    $.each(arrTools, function (i, n) {
        $("#" + n).removeClass('selected');
    });

    /*******设置函数    点击其中一个工具 变成高亮状态  同时其他工具还原********/
    function updateToolStatus(id) {
        $.each(arrTools, function (i, n) {
            $("#" + n).removeClass('selected');
        });

        $("#farm-tool-" + id).addClass('selected');
    }

    //点击地块调用函数
    var actionFunc = null;

    /***点击第一个工具    铲地 ***/
    $("#farm-tool-1").click(function () {
        updateToolStatus(1);
        /***点击工具后     鼠标变更成工具  同时铲地图标高亮显示 ***/
        $(this).css({cursor: "url(images/final/main/chandi_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/chandi_but_down.ico),auto"});
        });

        actionFunc = reclaimAction;

        /***此时单击土地   弹出提示信息***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 开垦');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];

                actionFunc(gid);
            });
    });


    /***点击第三个工具     浇水***/
    $("#farm-tool-2").click(function () {
        updateToolStatus(2);
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/main/jiaoshui_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/jiaoshui_but_down.ico),auto"});
        });

        actionFunc = waterAction;

        /***此时单击土地   弹出提示信息***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 浇水');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];

                actionFunc(gid);
            });
    });


    /***点击第四个工具     采蜜***/
    $("#farm-tool-3").click(function () {
        //check function is able
        if ($(this).hasClass('unable'))
            return false;

        updateToolStatus(3);
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/main/caimi_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/caimi_but_down.ico),auto"});
        });

        actionFunc = beeAction;

        /***此时单击土地   弹出提示信息***/

        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 采蜜');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];

                actionFunc(gid);
            });
    });


    /***点击第五个工具     施肥***/
    $("#farm-tool-4").click(function () {
        updateToolStatus(4);
        if($(this).hasClass('auto')){
             console.log('land click: 一键施肥');
             onesf();
        }
        else{
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/main/shifei_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/shifei_but_down.ico),auto"});
        });

        actionFunc = fertilizeAction;

        /***此时单击土地   弹出提示信息***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 施肥');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];

                actionFunc(gid);
            });
        }
    });


    /***点击第六个工具     收获***/
    $("#farm-tool-5").click(function () {
        updateToolStatus(5);
        if($(this).hasClass('auto')){
             console.log('land click: 一键收获');
             onesh();
        }
        else{
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/main/shouhuo_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/shouhuo_but_down.ico),auto"});
        })

        actionFunc = reapAction;

        /***此时单击土地   弹出提示信息***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 收获');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];
                actionFunc(gid);
            });
        }
    });


    /***点击第二个工具     增种***/
    $("#farm-tool-6").click(function () {
        updateToolStatus(6);
        if($(this).hasClass('auto')){
             console.log('land click: 一键增种');
             onezz();
        }
        else{
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/login/zengzhong_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/login/zengzhong_but_down.ico),auto"});
        });

        actionFunc = seedAction;

        /***此时单击土地   跳出增种栏***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 增种');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];
                actionFunc(gid);
            });
        }
    });

    $("#farm-tool-7").click(function() {
        refreshGameData();

        displayMessage('刷新成功');
    });

    /***点击第六个工具     偷窃***/
    $("#farm-tool-8").click(function () {
        updateToolStatus(8);
        /***点击工具后     鼠标变更工具***/
        $(this).css({cursor: "url(images/final/main/touqie_but_down.ico),auto"});
        /***此时移动鼠标到土地上  鼠标变成工具图标***/
        $(".land").mouseenter(function () {
            $(this).css({cursor: "url(images/final/main/touqie_but_down.ico),auto"});
        })

        actionFunc = reapAction2;

        /***此时单击土地   弹出提示信息***/
        $(".land")
            .off('click')
            .on('click', function (e) {
                console.log('land click: 偷窃');
                var lid = e.currentTarget.id;
                var arr = lid.split('_');
                var gid = arr[1];
                actionFunc(gid);
            });
    });


    /*******稻草人点击插上稻草人********/
    $(".scarecrow-socket").on('click', function (e) {
        var lid = e.currentTarget.id;
        var arr = lid.split('_');
        var sid = arr[1];

        pluginScarecrow(sid);
    });
}

//打开模态框
function openModalWin(url) {
    $("#subWinFrame").attr('src', url);

    $('#winModal').modal('show');
}

//检查手机屏幕
function detectPhone() {
    var phoneWidth = parseInt(window.screen.width);
    var phoneHeight = parseInt(window.screen.height);

    if (phoneWidth > phoneHeight)
    {
        alert('为了更好的游戏，请保持屏幕竖屏');
    }

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    });
}
$(function(){
    //点击模态框消失
    $(".anniu").click(function(){
        //$(".sidebar").css("width","0px");
        //$(".sidebar").css("transition","width 0.1s ease-in");
        $(".btn").click();
    });
    $("#backpack2").click(function(){
        var pa_href=$(this).attr("href");
        openModalWin(pa_href);
        $(".modal-text").text("背包");
        return false;

    });
});
