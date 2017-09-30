/**
 * Created by Administrator on 2017/9/21.
 */
$(function(){
//端口连接
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
        storage.setItem("userId",uid);//作为 Storage 接口的方法，接受一个键名和值作为参数，将会把键名添加到存储中，如果键名已存在，则更新其对应的值。
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
    detectPhone();


    websocket.onopen = function(event) {
        $('body').css('overflow','hidden');
        $('body').css('position','fixed');

        /*******登录界面背景图 自适应********/
        $('#login-bg').height($(window).height());
        $('#login-bg').width($(window).width());
        //$('#subWinFrame').height($(window).height() - 200);
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


    function oneds(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjds';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    }
    function onetq(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjtq';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    }
    function oneqc(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjqc';
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
    }
    function onews(){
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        fs.act='yjws';
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
        //初始化系统设置  ok
        initSystemSettingDialog();

        //初始化增种框
        initSeedDialogEvent();

        //初始化农场
        initFarmDisplay();
        //请求农场地块信息
        initFarmGround(userId);
        //请求稻草人信息
        initFarmScarecrow(userId);

        //初始化引导--新手设置（没弄） ok
        //initGuide();

        userMusic();

        //是否从好友农场回来，是则打开好友列表  ok
        checkGoFriend();

        //记录最后用户 ok
        recordLastUid();

        //检查初始密码 ok
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
//是否从好友牧场回来
    function checkGoFriend() {
        var luid = Cookies.get('lUid');
        console.log(luid);

        var referrer = document.referrer;//返回当前页面的url
        console.log(referrer);
        if (referrer) {
            var matchs = referrer.match(/userid=([^&]+)/);//match() 方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。该方法类似 indexOf() 和 lastIndexOf()，但是它返回指定的值，而不是字符串的位置。
            //判断现在登录的用户id 与 记录的最后用户id 是否与  之前存储的用户selfid相同
            if (matchs && luid != selfId) {
                $("#muchang-friend").trigger('click');
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
        //请求牧场动物信息
        initmuchangGround(selfId);
        //请求稻草人信息
        initFarmScarecrow(selfId);
        apiCalling = 0;
    }
//显示提示信息
    function displayMessage(msg) {

        $(".hint").text(msg);
        $(".hint").show();
        $(".hint").css({opacity: '1'});
        $(".hint").fadeOut(6000);
        apiCalling = 0;
        refreshGameData();
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
    //点击模态框消失
    $(".anniu").click(function(){
        $(".sidebar").css("width","0px");
        $(".sidebar").css("transition","width 0.1s ease-in");
        $(".btn").click();
    });


//        jQuery写法 侧边栏主栏点击副栏显示隐藏
    $(".main_list").click(function(){
        $(".part_list").css("height","0px");
        $(".part_list").css("transition","height 0.3s ease-in");
        var b=$(this).next().height();
        if(b==0){
            $(this).next().css("height","642px");
            $(this).next().css("transition","height 0.3s ease-in");
        }


    });
//        侧边栏隐藏显示
    $(".hide2").click(function(){
        $(".sidebar").css("width","0px");
        $(".sidebar").css("transition","width 0.1s ease-in");
    });
    $(".show2").click(function(){
        $(".sidebar").css("display","block");
        $(".sidebar").css("width","650px");
        $(".sidebar").css("transition","width 0.1s ease-in");
    });
    $(".part_list").click(function(){
        $(".sidebar").css("width","0px");
        $(".sidebar").css("transition","width 0.1s ease-in");
    });
//点击侧边栏分按钮，拟态框加载相应页面
    $(".part_list>ul>li>a").click(function(){
        var pa_href=$(this).attr("href");
        openModalWin(pa_href);
        //alert(c);

        var c=$(this).text();
        //alert(c);
        $(".modal-text").text(c);
        return false;
    });
    //打开模态框
    function openModalWin(url) {
        $("#subWinFrame").attr('src', url);
        $('#winModal').modal('show');

    }
    $("#backpack2").click(function(){
        var pa_href=$(this).attr("href");
        openModalWin(pa_href);
        $(".modal-text").text("背包");
        return false;

    });


//背景音乐
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

//音乐设置
    function initSystemSettingDialog() {
//        点击开启系统设置框
        $(".system").click(function () {
            $(".bg-music-set").css("display", "block");
        });
//        点击关闭系统设置框
        $("#bg-music-close").click(function () {
            $(this).parent().css("display", "none");
        });
//        背景音乐是否开启
//        关闭
        var music_status = 2;
        var music = document.getElementById("bg-music");
        $("#bg-music-but1").click(function () {
            if (music_status == 2) {
                $(this).css("display", "none");
                $("#bg-music-but3").css("display", "block");
                music.pause();
                music_status = 1;
            }
        });
//        开启
        $("#bg-music-but3").click(function () {
            if (music_status == 1) {
                $(this).css("display", "none");
                $("#bg-music-but1").css("display", "block");
                $("#bg-music").css("animation", "music 2s linear infinite");
                music.play();
                music_status = 2;
            }
        });

//        游戏音效
//        关闭
        $("#bg-music-but2").click(function(){
            $(this).css("display","none");
            $("#bg-music-but4").css("display","block")
        });
//        开启
        $("#bg-music-but4").click(function(){
            $(this).css("display","none");
            $("#bg-music-but2").css("display","block")
        });


    }
    initSystemSettingDialog();

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
//进入朋友的id
    function jrfriend(id){
        $('#winModal').modal('hide');
        selfId=id;
        jrtype=1;
        initUserInfo(id);
        initFarmGround(id);
        initFarmScarecrow(id);
    }
//进入的会员（？）id
    function jrhy(id){
        $('#winModal').modal('hide');
        selfId=id;
        jrtype=2;
        initUserInfo(id);
        initFarmGround(id);
        initFarmScarecrow(id);
    }
//显示用户统计数据
    function displayUserInfo(UserInfo) {
        $('#userMusic').val(UserInfo.music);
        $("#unreadNotice").val(UserInfo.unreadNotice);
        $("#unreadMsg").val(UserInfo.unreadMsg);



        $("#muchang_total").text(UserInfo.total);
        $("#muchang_seed").text(UserInfo.seed);
        $("#muchang_unseed").text(UserInfo.money);
        $("#muchang_totalGrowth").text(UserInfo.fertilize);


        //显示tip
        //if (UserInfo.NotSeededAppleNumber > 0)
        //    $('#farm-tool-6').addClass('tip');
        //else
        //    $('#farm-tool-6').removeClass('tip');
        //
        //if (UserInfo.FertilizerWeight > 0)
        //    $("#farm-tool-4").addClass('tip');
        //else
        //    $("#farm-tool-4").removeClass('tip');
        //
        //if (userId == selfId)
        //    $("#farm-tool-3").addClass('unable');
        //else
        //    $("#farm-tool-3").removeClass('unable');

        //用户名
        $(".username").text(UserInfo.user_login);
        $(".username_id").text(UserInfo.true_name);

        //if (selfId != userId)
        //{
        //    //隐藏工具
        //    $("#farm-tool-1").hide();
        //    $("#farm-tool-2").hide();
        //    $("#farm-tool-4").hide();
        //    $("#farm-tool-5").hide();
        //    $("#farm-tool-6").hide();
        //    $("#farm-tool-7").hide();
        //
        //    if(jrtype==1){
        //        $("#farm-tool-3").show();
        //    }
        //    if(jrtype==2){
        //        $("#farm-tool-8").show();
        //    }
        //    $("#farm-back").show().click(function(){
        //        fh();
        //    });
        //    $("#onecm").hide();
        //    //隐藏菜单
        //    $("#farm-game-wrap").hide();
        //    $("#farm-back").show();
        //    $(".mail-message").hide();
        //    $(".notice-message").hide();
        //}
        //else
        //{
        //    if(UserInfo.onecm==1){
        //        $("#onecm").show().click(function(){
        //            onecm();
        //        });
        //    }
        //    $("#farm-tool-1").show();
        //    $("#farm-tool-2").show();
        //    if(UserInfo.onesf==1){
        //        $("#farm-tool-4").addClass('auto');
        //    }
        //    else{
        //        $("#farm-tool-4").removeClass('auto');
        //    }
        //    $("#farm-tool-4").show();
        //    if(UserInfo.onesh==1){
        //        $("#farm-tool-5").addClass('auto');
        //    }
        //    else{
        //        $("#farm-tool-5").removeClass('auto');
        //    }
        //    $("#farm-tool-5").show();
        //    if(UserInfo.onezz==1){
        //        $("#farm-tool-6").addClass('auto');
        //    }
        //    else{
        //        $("#farm-tool-6").removeClass('auto');
        //    }
        //    $("#farm-tool-6").show();
        //    $("#farm-tool-7").show();
        //    $("#farm-tool-8").hide();
        //    $("#farm-tool-3").hide();
        //    $("#farm-back").hide();
        //    //显示菜单
        //    $("#farm-game-wrap").show();
        //    initMsgTip();
        //}
    }





    var clear_stau=0
//        动物便便随机出现
    function bian_appear_time() {


        var a=$(".pig").length;
        var b=$(".sheep").length;
        var c=$(".cow").length;
        var d=$(".cat").length;
        var e=$(".alpaca").length;
        var f=$(".blackcat").length;
        var g=$(".maoyou").length;
        var h=$(".bee").length;

        if(a==0&&b==0&&c==0&&d==0&&e==0&&f==0&&g==0&&h==0){
            displayMessage("没有动物哦，快去购买吧！")
        }else{
            //            每20秒添加一个便便
            var bian_top2 = Math.floor(400 * Math.random());
            var bian_left2 = Math.floor(900 * Math.random());
            $(".medaw-farm").append("<div class='bianbian' style='left:" + bian_left2 + "px;top:" + bian_top2 + "px;'> <img src='images/app/muchang-photo/bianbian.png' class='bianbianmove'> </div>")

//      便便点击提示
//      蚊子点击提示
                $(".bianbian").on("click",function(){
                    displayMessage("点击“打扫”才能清理哦！")
                });
                $(".wenzi").click(function(){
                    displayMessage("用上“除蚊虫”才能打虫哦！")
                });
        }

    }
    setInterval(bian_appear_time,20000);


    //每隔1分钟出现一只蚊子
    function wenzi_turn() {
        var bianbian_number = $(".bianbian").length;
        if (bianbian_number=0) {
            function wenzi_appear(){
            var wenzi_top = Math.floor(400 * Math.random());
            var wenzi_left = Math.floor(900 * Math.random());
            $(".medaw-farm").append("<div class='wenzi' style='left:" + wenzi_left + "px;top:" + wenzi_top + "px;'> <img src='images/app/muchang-photo/wenzi.gif' class='bianmove'> </div>")
            }
            setInterval(wenzi_appear,1000);

        }
    }
    setInterval(wenzi_turn,1000);



//        动物随机出现
//        猪


    var pig_zhong_number=$(".pig").length;
    for(i=0;i<pig_zhong_number;i++){
        var pig_top=Math.floor(200*Math.random());
        var pig_left=Math.floor(100*Math.random());
        pig_address=document.getElementsByClassName("pig");
        pig_address[i].style.left=pig_left+"px";
        pig_address[i].style.top=pig_top+"px";

        var i = 10;
        var j = 0;
        var e = pig;
        var win = document.documentElement || document.body;

        function intern() {
            var width = e.clientWidth;
            var height = e.clientHeight;
            var left = parseFloat(e.style.left);
            var top = parseFloat(e.style.top);
            var windowWidth = win.clientWidth;
            var windowHeight = win.clientHeight;
            if (windowWidth - width < (left + i)) {
                i = -i;
            } else if ((left + i) < 0) {
                i = -i;
            }
            if (windowHeight - height < (top + j)) {
                j = -j;
            } else if ((top + j) < 0) {
                j = -j;
            }
            e.style.left = left + i + "px";
            e.style.top = top + j + "px";
        }
        setInterval(intern, 30);
    }

//            var pig_number=document.getElementsByClassName("pig").length;
////            for(n=0;n<pig_number;n++){
//            pig_move=document.querySelector("#pig");
////                pig_move2=document.getElementsByClassName("pig");
////                console.log(pig_move2)
//                s=6;
//                h=3;
//                function move(){
//                    pig_move.style.left=pig_move.offsetLeft+s*Math.random()+"px";
//                    pig_move.style.top=pig_move.offsetTop+h*Math.random()+"px";
//                    if(parseInt(pig_move.style.left)>="375"){
//                        s=-3;
//                    }else if(parseInt(pig_move.style.left)<="10"){
//                        s=6;
//                    }else if(parseInt(pig_move.style.top)>="390"){
//                        h=-3;
//                    }else if(parseInt(pig_move.style.top)<="10"){
//                        h=6;
//                    }
//                }
//                setInterval(move,200)






//        羊
    var sheep_zhong_number=$(".sheep").length;
    for(i=0;i<sheep_zhong_number;i++){
        var sheep_top=Math.floor(150*Math.random());
        var sheep_left=Math.floor(300*Math.random());
        sheep_address=document.getElementsByClassName("sheep");
        sheep_address[i].style.left=sheep_left+"px";
        sheep_address[i].style.top=sheep_top+"px";
        sheep_move=document.querySelector("#sheep");
        s=12;
        h=9;
        function move(){
            sheep_move.style.left=sheep_move.offsetLeft+s*Math.random()+"px";
            sheep_move.style.top=sheep_move.offsetTop+h*Math.random()+"px";
            if(parseInt(sheep_move.style.left)>="450"){
                s=4;
            }else if(parseInt(sheep_move.style.left)<="50"){
                s=-9;
            }else if(parseInt(sheep_move.style.top)>="150"){
                h=3;

            }else if(parseInt(sheep_move.style.top)<="50"){
                h=-6;
            }
        }
        setInterval(move,200)
    }
    //        牛
    var cow_zhong_number=$(".cow").length;
    for(i=0;i<cow_zhong_number;i++){
        var cow_top=Math.floor(300*Math.random());
        var cow_left=Math.floor(200*Math.random());
        cow_address=document.getElementsByClassName("cow");
        cow_address[i].style.left=cow_left+"px";
        cow_address[i].style.top=cow_top+"px";

        var x = 0, y = 0 , x1 = 0 , y1 = 0;
        var xin = true, yin = true;
        var step = 1,step2 = 2;
        var delay = 100;
        //var ii="cow"+(parseInt(i)+1);
        var obj = document.getElementById("cow1");

        function left_top() {
            var L = 0+cow_left;
            var R = 300+cow_left;
           obj.style.left = x + document.documentElement.scrollLeft + "px";
            x = x + step * (xin ? 5 : -5);
            //xin是一个变量，  (xin?1:-1) 的意思就是 当 xin 为 true 或者 非0， 括号里的表达式值为 1， xin为 false，表达式的值为 -1.
            if (x < L) {
                xin = true;
                x = L;
                //左连接点
            }
            if (x > R) {
                xin = false;
                x = R;
                //右连接点
            }
        };
        //
        //
        //
        setInterval(left_top, delay);

    }


    //function animation_move(obj){
    //    var cow_top=Math.floor(300*Math.random());
    //    var cow_left=Math.floor(200*Math.random());
    //    cow_address=document.getElementById("obj");
    //    cow_address.style.left=cow_left+"px";
    //    cow_address.style.top=cow_top+"px";
    //
    //    var x = 0, y = 0 , x1 = 0 , y1 = 0;
    //        var xin = true, yin = true;
    //        var step = 1,step2 = 2;
    //        var delay = 100;
    //        //var ii="cow"+(parseInt(i)+1);
    //
    //
    //        function left_top() {
    //            var L = 0+cow_left;
    //            var R = 300+cow_left;
    //           obj.style.left = x + document.documentElement.scrollLeft + "px";
    //            x = x + step * (xin ? 5 : -5);
    //            //xin是一个变量，  (xin?1:-1) 的意思就是 当 xin 为 true 或者 非0， 括号里的表达式值为 1， xin为 false，表达式的值为 -1.
    //            if (x < L) {
    //                xin = true;
    //                x = L;
    //                //左连接点
    //            }
    //            if (x > R) {
    //                xin = false;
    //                x = R;
    //                //右连接点
    //            }
    //        };
    //
    //
    //
    //        setInterval(left_top, delay);
    //}
    //animation_move(cow1);



    //        猫
    var cat_zhong_number=$(".cat").length;
    for(i=0;i<cat_zhong_number;i++){
        var cat_top=Math.floor(300*Math.random());
        var cat_left=Math.floor(200*Math.random());
        cat_address=document.getElementsByClassName("cat");
        cat_address[i].style.left=cat_left+"px";
        cat_address[i].style.top=cat_top+"px";
    }
    //        羊驼
    var alpaca_zhong_number=$(".alpaca").length;
    for(i=0;i<alpaca_zhong_number;i++){
        var alpaca_top=Math.floor(300*Math.random());
        var alpaca_left=Math.floor(200*Math.random());
        alpaca_address=document.getElementsByClassName("alpaca");
        alpaca_address[i].style.left=alpaca_left+"px";
        alpaca_address[i].style.top=alpaca_top+"px";
    }
    //        黑猫
    var blackcat_zhong_number=$(".blackcat").length;
    for(i=0;i<blackcat_zhong_number;i++){
        var blackcat_top=Math.floor(300*Math.random());
        var blackcat_left=Math.floor(200*Math.random());
        blackcat_address=document.getElementsByClassName("blackcat");
        blackcat_address[i].style.left=blackcat_left+"px";
        blackcat_address[i].style.top=blackcat_top+"px";
    }
    //        猫鼬
    var maoyou_zhong_number=$(".maoyou").length;
    for(i=0;i<maoyou_zhong_number;i++){
        var maoyou_top=Math.floor(300*Math.random());
        var maoyou_left=Math.floor(200*Math.random());
        maoyou_address=document.getElementsByClassName("maoyou");
        maoyou_address[i].style.left=maoyou_left+"px";
        maoyou_address[i].style.top=maoyou_top+"px";
    }
    //        蜜蜂
    var bee_zhong_number=$(".bee").length;
    for(i=0;i<bee_zhong_number;i++){
        var bee_top=Math.floor(300*Math.random());
        var bee_left=Math.floor(200*Math.random());
        bee_address=document.getElementsByClassName("bee");
        bee_address[i].style.left=bee_left+"px";
        bee_address[i].style.top=bee_top+"px";
    }


//        动物随机移动



//        如果便便数大于6，最早养殖的动物死亡;
//        function panduan_biannumber(){
//            var bian_number=$(".bianbian").length;
//            var n=1;n++;n<100;
//            if(bian_number==6*n){
//                $(".medaw-farm").children().get(1).remove();
//            }
//        }
//          setInterval(panduan_biannumber,30000);


//       function panduan_size(){
//           var pig_zhong_number=$(".pig").length;
//           for(i=0;i<pig_zhong_number;i++) {
//               pig_str = $(".pig")[i].getAttribute("pig_dengji");
//               if(pig_str==2){
//                   document.getElementsByClassName("pig").style.transform="scale(0.7)";
//               }else if(pig_str==3){
//                   document.getElementsByClassName("pig").style.transform="scale(0.8)";
//               }else if(pig_str==4){
//                   document.getElementsByClassName("pig").style.transform="scale(0.9)";
//               }
//           }
//       }
//        setInterval(panduan_size(),1000);


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

//        点击功能栏  quanxian:1为普通用户，2位开通一键功能用户
//        打扫
    var quanxian=1;
    $(".clear").click(function(){
        updateToolStatus(1);
        var bian_number=$(".bianbian").length;
        if(!bian_number){

            displayMessage("牧场很干净，无需清理哦！")

        }else
    {
            //alert(456)
            if(quanxian==1){
                //alert(123);
                $(".bianbian").unbind();
                $(".bianbian").on("click",function(){
                    //alert(789);
                    $(this).css("display","none");
                    $(this).remove();
                });
            }else{
                displayMessage("一键清理完毕！")
                $(".bianbian").remove();
            }

        }

    });

    //除蚊虫
    $(".qucong").click(function(){
        updateToolStatus(3);
        var wenzi_number=$(".wenzi").length;
        if(!wenzi_number){
            displayMessage("没有蚊子哦，无需清虫哦！")
        }else{
            if(quanxian==1){
                $(".wenzi").unbind();
                $(".wenzi").click(function(){
                    $(this).css("display","none");
                    $(this).remove();
                });
            }else{
                displayMessage("一键除虫完毕！")
                $(".wenzi").remove();
            }
        }
    });




//        宠物成长至初级函数
    function chuji(){
        displayMessage("宠物成长至初级！");
    }
//        宠物成长至中级函数
    function zhongji(){
        displayMessage("宠物成长至中级！");
    }
//        宠物成长至初级函数
    function gaoji(){
        displayMessage("宠物成长至高级！");
    }
//      宠物已是最高级提示函数
    function gradetishi(){
        displayMessage("宠物成长已最高级！")
    }
    //
    //function wei_animation(obj){
    //    //var obj_dengji=$("."+obj).attr(obj+"_dengji");
    //    //var obj_zhong_number=$("."+obj).length;
    //    ////for(i=0;i<obj_zhong_number;i++){
    //    //    obj_dengji=parseInt(obj_dengji)+1;
    //    //    alert(obj_dengji);
    //    //    $("."+obj)[i].setAttribute(obj+"_dengji",obj_dengji);
    //    //}
    //    alert(456)
    //    var obj_dengji=$("."+obj).attr("pig_dengji");
    //    alert(obj_dengji);
    //    new_obj_dengji=parseInt(obj_dengji)+1;
    //    alert(new_obj_dengji);
    //    $(this).attr("pig_dengji","new_obj_dengji");
    //    //alert(obj_dengji)
    //    //var c=obj_dengji.substr(6,3)
    //    //obj_dengji=parseInt(obj_dengji)+1;
    //    //alert(obj_dengji);
    //    //$(obj).setAttribute(obj+"_dengji",obj_dengji);
    //}
    //function  check_size(pig,sheep,cow,alpaca,cat,blackcat,maoyou,bee){
    //    var c=$(".obj").length;
    //    for(i=0;i<c;i++){
    //        obj_str=$(".obj")[i].getAttribute("obj_dengji");
    //        if(obj_str==1){
    //            document.getElementsByClassName("obj")[i].style.transform="scale(0.7)";
    //        }else if(obj_str==2){
    //            document.getElementsByClassName("obj")[i].style.transform="scale(0.8)";
    //        }else if(obj_str==3){
    //            document.getElementsByClassName("obj")[i].style.transform="scale(0.9)";
    //        }else{
    //            document.getElementsByClassName("obj")[i].style.transform="scale(1)";
    //        }
    //    }
    //}
    //setInterval(check_size,1000);


//        喂养
    var feed=0;//一键选择时，判断宠物在哪级
    $(".feed").click(function(){
        updateToolStatus(4);
        if(quanxian==1){
            $(".pig").unbind('click').click(function(){
                var pig_dengji=$(this).attr("pig_dengji");
                if(pig_dengji==1){
                    $(this).css("transform","scale(0.8)");
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
                    chuji();
                }else if(pig_dengji==2){
                    $(this).css("transform","scale(0.9)");
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
                    zhongji();
                }else if(pig_dengji==3){
                    $(this).css("transform","scale(1)");
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
                    gaoji();
                    return false;
                }else{
                    gradetishi();
                }
            });
            $(".sheep").unbind('click').click(function(){
                var sheep_dengji=$(this).attr("sheep_dengji");
                if(sheep_dengji==1){
                    $(this).removeAttr("sheep_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    sheep_dengji=parseInt(sheep_dengji)+1;
                    $(this).attr("sheep_dengji",sheep_dengji);
                }else if(sheep_dengji==2){
                    $(this).removeAttr("sheep_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    sheep_dengji=parseInt(sheep_dengji)+1;
                    $(this).attr("sheep_dengji",sheep_dengji);
                }else if(sheep_dengji==3){
                    $(this).removeAttr("sheep_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    sheep_dengji=parseInt(sheep_dengji)+1;
                    $(this).attr("sheep_dengji",sheep_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".cow").unbind('click').click(function(){
                var cow_dengji=$(this).attr("cow_dengji");
                if(cow_dengji==1){
                    $(this).removeAttr("cow_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    cow_dengji=parseInt(cow_dengji)+1;
                    $(this).attr("cow_dengji",cow_dengji);
                }else if(cow_dengji==2){
                    $(this).removeAttr("cow_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    cow_dengji=parseInt(cow_dengji)+1;
                    $(this).attr("cow_dengji",cow_dengji);
                }else if(cow_dengji==3){
                    $(this).removeAttr("cow_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    cow_dengji=parseInt(cow_dengji)+1;
                    $(this).attr("cow_dengji",cow_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".cat").unbind('click').click(function(){
                var cat_dengji=$(this).attr("cat_dengji");
                if(cat_dengji==1){
                    $(this).removeAttr("cat_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    cat_dengji=parseInt(cat_dengji)+1;
                    $(this).attr("cat_dengji",cat_dengji);
                }else if(cat_dengji==2){
                    $(this).removeAttr("cat_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    cat_dengji=parseInt(cat_dengji)+1;
                    $(this).attr("cat_dengji",cat_dengji);
                }else if(cat_dengji==3){
                    $(this).removeAttr("cat_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    cat_dengji=parseInt(cat_dengji)+1;
                    $(this).attr("cat_dengji",cat_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".alpaca").unbind('click').click(function(){
                var alpaca_dengji=$(this).attr("alpaca_dengji");
                if(alpaca_dengji==1){
                    $(this).removeAttr("alpaca_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    alpaca_dengji=parseInt(alpaca_dengji)+1;
                    $(this).attr("alpaca_dengji",alpaca_dengji);
                }else if(alpaca_dengji==2){
                    $(this).removeAttr("alpaca_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    alpaca_dengji=parseInt(alpaca_dengji)+1;
                    $(this).attr("alpaca_dengji",alpaca_dengji);
                }else if(alpaca_dengji==3){
                    $(this).removeAttr("alpaca_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    alpaca_dengji=parseInt(alpaca_dengji)+1;
                    $(this).attr("alpaca_dengji",alpaca_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".blackcat").unbind('click').click(function(){
                var blackcat_dengji=$(this).attr("blackcat_dengji");
                if(blackcat_dengji==1){
                    $(this).removeAttr("blackcat_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    blackcat_dengji=parseInt(blackcat_dengji)+1;
                    $(this).attr("blackcat_dengji",blackcat_dengji);
                }else if(blackcat_dengji==2){
                    $(this).removeAttr("blackcat_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    blackcat_dengji=parseInt(blackcat_dengji)+1;
                    $(this).attr("blackcat_dengji",blackcat_dengji);
                }else if(blackcat_dengji==3){
                    $(this).removeAttr("blackcat_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    blackcat_dengji=parseInt(blackcat_dengji)+1;
                    $(this).attr("blackcat_dengji",blackcat_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".maoyou").unbind('click').click(function(){
                var maoyou_dengji=$(this).attr("maoyou_dengji");
                if(maoyou_dengji==1){
                    $(this).removeAttr("maoyou_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    maoyou_dengji=parseInt(maoyou_dengji)+1;
                    $(this).attr("maoyou_dengji",maoyou_dengji);
                }else if(maoyou_dengji==2){
                    $(this).removeAttr("maoyou_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    maoyou_dengji=parseInt(maoyou_dengji)+1;
                    $(this).attr("maoyou_dengji",maoyou_dengji);
                }else if(maoyou_dengji==3){
                    $(this).removeAttr("maoyou_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    maoyou_dengji=parseInt(maoyou_dengji)+1;
                    $(this).attr("maoyou_dengji",maoyou_dengji);
                }else{
                    gradetishi();
                }
            });
            $(".bee").unbind('click').click(function(){
                var bee_dengji=$(this).attr("bee_dengji");
                if(bee_dengji==1){
                    $(this).removeAttr("bee_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    bee_dengji=parseInt(bee_dengji)+1;
                    $(this).attr("bee_dengji",bee_dengji);
                }else if(bee_dengji==2){
                    $(this).removeAttr("bee_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    bee_dengji=parseInt(bee_dengji)+1;
                    $(this).attr("bee_dengji",bee_dengji);
                }else if(bee_dengji==3){
                    $(this).removeAttr("bee_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    bee_dengji=parseInt(bee_dengji)+1;
                    $(this).attr("bee_dengji",bee_dengji);
                }else{
                    gradetishi();
                }
            });
        }else{
            pig_str=$(".pig").attr("pig_dengji");
            sheep_str=$(".sheep").attr("sheep_dengji");
            cow_str=$(".cow").attr("cow_dengji");
            cat_str=$(".cat").attr("cat_dengji");
            alpaca_str=$(".alpaca").attr("alpaca_dengji");
            blackcat_str=$(".blackcat").attr("blackcat_dengji");
            maoyou_str=$(".maoyou").attr("maoyou_dengji");
            bee_str=$(".bee").attr("bee_dengji");

            if(pig_str==4&&sheep_str==4&&cow_str==4&&cat_str==4&&alpaca_str==4&&blackcat_str==4&&maoyou_str==4&&bee_str==4){
                displayMessage("所有种类宠物已达到最高级！")
            }else{
                //猪类宠物
                var pig_zhong_number=$(".pig").length;
                for(i=0;i<pig_zhong_number;i++){
                    pig_str=$(".pig")[i].getAttribute("pig_dengji");
                    pig_size=$(".pig")[i].style.transform;
                    pig_size_xuanzhe=pig_size.substr(6,3);
                    if(pig_str<4&&pig_size_xuanzhe<1){
                        pig_str1=parseInt(pig_str)+1;
                        pig_size_xuanzhe1=parseFloat(pig_size_xuanzhe)+0.1;
                        var pig_cishu=document.getElementsByClassName("pig");
                        pig_cishu[i].style.transform="scale("+pig_size_xuanzhe1+")";
                        $(".pig")[i].setAttribute("pig_dengji",pig_str1);
                    }else{
                        displayMessage("猪类所有宠物已达到最高级！")
                    }
                }

                //羊类宠物
                var sheep_zhong_number=$(".sheep").length;
                for(i=0;i<sheep_zhong_number;i++){
                    sheep_str=$(".sheep")[i].getAttribute("sheep_dengji");
                    sheep_size=$(".sheep")[i].style.transform;
                    sheep_size_xuanzhe=sheep_size.substr(6,3);
                    if(sheep_str<4&&sheep_size_xuanzhe<1){
                        sheep_str1=parseInt(sheep_str)+1;
                        sheep_size_xuanzhe1=parseFloat(sheep_size_xuanzhe)+0.1;
                        var sheep_cishu=document.getElementsByClassName("sheep");
                        sheep_cishu[i].style.transform="scale("+sheep_size_xuanzhe1+")";
                        $(".sheep")[i].setAttribute("sheep_dengji",sheep_str1);
                    }else{
                        displayMessage("羊类所有宠物已达到最高级！")
                    }
                }

                //牛类宠物
                var cow_zhong_number=$(".cow").length;
                for(i=0;i<cow_zhong_number;i++){
                    cow_str=$(".cow")[i].getAttribute("cow_dengji");
                    cow_size=$(".cow")[i].style.transform;
                    cow_size_xuanzhe=cow_size.substr(6,3);
                    if(cow_str<4&&cow_size_xuanzhe<1){
                        cow_str1=parseInt(cow_str)+1;
                        cow_size_xuanzhe1=parseFloat(cow_size_xuanzhe)+0.1;
                        var cow_cishu=document.getElementsByClassName("cow");
                        cow_cishu[i].style.transform="scale("+cow_size_xuanzhe1+")";
                        $(".cow")[i].setAttribute("cow_dengji",cow_str1);
                    }else{
                        displayMessage("牛类所有宠物已达到最高级！")
                    }
                }

                //猫类宠物
                var cat_zhong_number=$(".cat").length;
                for(i=0;i<cat_zhong_number;i++){
                    cat_str=$(".cat")[i].getAttribute("cat_dengji");
                    cat_size=$(".cat")[i].style.transform;
                    cat_size_xuanzhe=cat_size.substr(6,3);
                    if(cat_str<4&&cat_size_xuanzhe<1){
                        cat_str1=parseInt(cat_str)+1;
                        cat_size_xuanzhe1=parseFloat(cat_size_xuanzhe)+0.1;
                        var cat_cishu=document.getElementsByClassName("cat");
                        cat_cishu[i].style.transform="scale("+cat_size_xuanzhe1+")";
                        $(".cat")[i].setAttribute("cat_dengji",cat_str1);
                    }else{
                        displayMessage("猫类所有宠物已达到最高级！")
                    }
                }


                //羊驼类宠物
                var alpaca_zhong_number=$(".alpaca").length;
                for(i=0;i<alpaca_zhong_number;i++){
                    alpaca_str=$(".alpaca")[i].getAttribute("alpaca_dengji");
                    alpaca_size=$(".alpaca")[i].style.transform;
                    alpaca_size_xuanzhe=alpaca_size.substr(6,3);
                    if(alpaca_str<4&&alpaca_size_xuanzhe<1){
                        alpaca_str1=parseInt(alpaca_str)+1;
                        alpaca_size_xuanzhe1=parseFloat(alpaca_size_xuanzhe)+0.1;
                        var alpaca_cishu=document.getElementsByClassName("alpaca");
                        alpaca_cishu[i].style.transform="scale("+alpaca_size_xuanzhe1+")";
                        $(".alpaca")[i].setAttribute("alpaca_dengji",alpaca_str1);
                    }else{
                        displayMessage("羊驼类所有宠物已达到最高级！")
                    }
                }

                //黑猫类宠物
                var blackcat_zhong_number=$(".blackcat").length;
                for(i=0;i<blackcat_zhong_number;i++){
                    blackcat_str=$(".blackcat")[i].getAttribute("blackcat_dengji");
                    blackcat_size=$(".blackcat")[i].style.transform;
                    blackcat_size_xuanzhe=blackcat_size.substr(6,3);
                    if(blackcat_str<4&&blackcat_size_xuanzhe<1){
                        blackcat_str1=parseInt(blackcat_str)+1;
                        blackcat_size_xuanzhe1=parseFloat(blackcat_size_xuanzhe)+0.1;
                        var blackcat_cishu=document.getElementsByClassName("blackcat");
                        blackcat_cishu[i].style.transform="scale("+blackcat_size_xuanzhe1+")";
                        $(".blackcat")[i].setAttribute("blackcat_dengji",blackcat_str1);
                    }else{
                        displayMessage("黑猫类所有宠物已达到最高级！")

                    }
                }

                //猫鼬类宠物
                var maoyou_zhong_number=$(".maoyou").length;
                for(i=0;i<maoyou_zhong_number;i++){
                    maoyou_str=$(".maoyou")[i].getAttribute("maoyou_dengji");
                    maoyou_size=$(".maoyou")[i].style.transform;
                    maoyou_size_xuanzhe=maoyou_size.substr(6,3);
                    if(maoyou_str<4&&maoyou_size_xuanzhe<1){
                        maoyou_str1=parseInt(maoyou_str)+1;
                        maoyou_size_xuanzhe1=parseFloat(maoyou_size_xuanzhe)+0.1;
                        var maoyou_cishu=document.getElementsByClassName("maoyou");
                        maoyou_cishu[i].style.transform="scale("+maoyou_size_xuanzhe1+")";
                        $(".maoyou")[i].setAttribute("maoyou_dengji",maoyou_str1);
                    }else{
                        displayMessage("猫鼬类所有宠物已达到最高级！")
                    }
                }

                //蜜蜂类宠物
                var bee_zhong_number=$(".bee").length;
                for(i=0;i<bee_zhong_number;i++){
                    bee_str=$(".bee")[i].getAttribute("bee_dengji");
                    bee_size=$(".bee")[i].style.transform;
                    bee_size_xuanzhe=bee_size.substr(6,3);
                    if(bee_str<4&&bee_size_xuanzhe<1){
                        bee_str1=parseInt(bee_str)+1;
                        bee_size_xuanzhe1=parseFloat(bee_size_xuanzhe)+0.1;
                        var bee_cishu=document.getElementsByClassName("bee");
                        bee_cishu[i].style.transform="scale("+bee_size_xuanzhe1+")";
                        $(".bee")[i].setAttribute("bee_dengji",bee_str1);
                    }else{
                        displayMessage("蜜蜂类所有宠物已达到最高级！")
                    }
                }

            }

        }


    });

    //        点击收获按钮收获最高等级为4的宠物
    $(".shouhuo_but").click(function(){
        updateToolStatus(5);
        if(quanxian==1){
            //猪
            $(".pig").unbind('click').click(function(){
                a=$(this).attr("pig_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //羊
            $(".sheep").unbind('click').click(function(){
                a=$(this).attr("sheep_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //牛
            $(".cow").unbind('click').click(function(){
                a=$(this).attr("cow_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //猫
            $(".cat").unbind('click').click(function(){
                a=$(this).attr("cat_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //羊驼
            $(".alpaca").unbind('click').click(function(){
                a=$(this).attr("alpaca_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //黑猫
            $(".blackcat").unbind('click').click(function(){
                a=$(this).attr("blackcat_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //猫鼬
            $(".maoyou").unbind('click').click(function(){
                a=$(this).attr("maoyou_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
            //蜜蜂
            $(".bee").unbind('click').click(function(){
                a=$(this).attr("bee_dengji");
                if(a==4){
                    $(this).remove();
                }
            });
        }else{
            var a=$(".pig").length;
            var b=$(".sheep").length;
            var c=$(".cow").length;
            var d=$(".cat").length;
            var e=$(".alpaca").length;
            var f=$(".blackcat").length;
            var g=$(".maoyou").length;
            var h=$(".bee").length;

            if(a==0&&b==0&&c==0&&d==0&&e==0&&f==0&&g==0&&h==0){
                displayMessage("没有可以获取的哦！")
            }else{
                //猪收获
                $(".pig").each(function(){
                    if((this).getAttribute("pig_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //羊收获
                $(".sheep").each(function(){
                    if((this).getAttribute("sheep_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //牛收获
                $(".cow").each(function(){
                    if((this).getAttribute("cow_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //猫收获
                $(".cat").each(function(){
                    if((this).getAttribute("cat_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //羊驼收获
                $(".alpaca").each(function(){
                    if((this).getAttribute("alpaca_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //黑猫收获
                $(".blackcat").each(function(){
                    if((this).getAttribute("blackcat_dengji")==4){
                        $(this).remove();
                    }
                });

                displayMessage("一键收获完成！")
                //猫鼬收获
                $(".maoyou").each(function(){
                    if((this).getAttribute("maoyou_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")
                //蜜蜂收获
                $(".bee").each(function(){
                    if((this).getAttribute("bee_dengji")==4){
                        $(this).remove();
                    }
                });
                displayMessage("一键收获完成！")

            }

//                pig_number=document.getElementsByClassName("pig");
//                for(var i=0;i<pig_number.length;i++){
//                    if(pig_number[i].getAttribute("pig_dengji")==4){
//                        pig_number[i].style.display="none";
//                    }
//                }





        }
    });
//背包点击宠物生成一直宠物
//    function animation_birth(pig){
//        var pig_top2 = Math.floor(200 * Math.random());
//        var pig_left2 = Math.floor(500 * Math.random());
//        $(".medaw-farm").append("<div class='pig' id='pig' pig_dengji='1' style='left:" + pig_left2 + "px;top:" + pig_top2 + "px;transform: scale(0.7);'><img src='images/app/muchang-photo/pig.png' class='pigmove'></div>");
//    }

    $(".dianji_animation").click(function(){
        var pig_top2 = Math.floor(200 * Math.random());
        var pig_left2 = Math.floor(500 * Math.random());
        $(".medaw-farm").append("<div class='pig' id='pig' pig_dengji='1' style='left:" + pig_left2 + "px;top:" + pig_top2 + "px;transform: scale(0.7);'><img src='images/app/muchang-photo/pig.png' class='pigmove'></div>");
    });

////购买猪宝宝
//    $(".buy_pig").click(function(){
//        var zhuanshi=$(this).text();
//        pig_backpack_number=parseInt(zhuanshi)+1;
//        $(this).text(pig_backpack_number);
//    });
//        一键刷新
    $(".shuaxin").click(function(){
        updateToolStatus(6);
        refreshGameData();
        displayMessage('刷新成功');
    });

});