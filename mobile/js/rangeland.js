/**
 * Created by Administrator on 2017/9/21.
 */
$(function(){

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
            $(this).next().css("height","551px");
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

        return false;
        $(".modal-text").text("商城");
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




//        点击开启系统设置框
    $(".system").click(function(){
        $(".bg-music-set").css("display","block");
    });
//        点击关闭系统设置框
    $("#bg-music-close").click(function(){
        $(this).parent().css("display","none");
    });
//        背景音乐是否开启
//        关闭
    var music_status=2;
    var music=document.getElementById("bg-music");
    $("#bg-music-but1").click(function(){
        if(music_status==2){
            $(this).css("display","none");
            $("#bg-music-but3").css("display","block");
            music.pause();
            music_status=1;
        }
    });
//        开启
    $("#bg-music-but3").click(function(){
        if(music_status==1){
            $(this).css("display","none");
            $("#bg-music-but1").css("display","block");
            $("#bg-music").css("animation","music 2s linear infinite");
            music.play();
            music_status=2;
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
            $(".hint").css("display","block");
            $(".hint").text("没有动物哦，快去购买吧！")
            $(".hint").fadeOut(2500);
        }else{
            //            每20秒添加一个便便
            var bian_top2 = Math.floor(200 * Math.random());
            var bian_left2 = Math.floor(500 * Math.random());
            $(".medaw-farm").append("<div class='bianbian' style='left:" + bian_left2 + "px;top:" + bian_top2 + "px;'> <img src='images/app/muchang-photo/bianbian.png' class='wenzimove'> </div>")

//      便便点击提示
            if(clear_stau==0){
                $(".bianbian").click(function(){
                    $(".hint").css("display","block");
                    $(".hint").text("点击“打扫”才能清理哦！")
                    $(".hint").fadeOut(2500);
                });
                $(".wenzi").click(function(){
                    $(".hint").css("display","block");
                    $(".hint").text("用上“除蚊虫”才能打虫哦！")
                    $(".hint").fadeOut(2500);
                });
            }
        }

    }


    setInterval(bian_appear_time,20000);

    //每隔1分钟出现一只蚊子
    function wenzi_turn(){
        var wenzi_top = Math.floor(300*Math.random());
        var wenzi_left = Math.floor(500*Math.random());
        $(".medaw-farm").append("<div class='wenzi' style='left:" + wenzi_left + "px;top:" + wenzi_top + "px;'> <img src='images/app/muchang-photo/wenzi.gif' class='bianmove'> </div>")
    }
    setInterval(wenzi_turn,60000);



//        动物随机出现
//        猪
//        var pig_zhong_number=$(".pig").length;
//        for(i=0;i<pig_zhong_number;i++){


//            var pig_address=document.getElementsById("pig");
//            s=10;
//             h=10;
//            function move(){
//            pig_address.style.left=pig_address.offsetLeft+s*Math.random()+"px";
//            pig_address.style.top=pig_address.offsetTop+h*Math.random()+"px";
//            }
//        setInterval(move,500);
//        }
//            var pig_move_left=pig_left/2;
//            var pig_move_top=pig_top/2;
//            $(".pig").animate({left:"20px"});
//            $(".pig")
//
// .animate({top:"30px"});

//            console.log($(".pig").css('left'));
//            console.log($(".pig").attr(left));
//            if($(".pig").attr(left)==600){
//
//            }
////随机移动
//            function pigmove(){
//                var pig_move=document.getElementById("pig");
//                var pig_move_left=parseInt(pig_move.style.left);
////                var pig_move_left=pig_left;
////                var pig_distance=200;
////                if(pig_move_left-pig_distance>0){
////                    var zhi=1;
//                     pig_move_left+=5;
//                pig_move.style.left=pig_move_left+'px';
////                alert(pig_move_left);
////                    if(parseInt(pig_move_left)>="300"){
////                        zhi=-1;
////                    }
////                }
//            }
//          setInterval(pigmove(),1000);
////            pigmove();


//            function pigmove2(){
//                var pig_move=document.getElementById("pig");
//                var pig_move_left=parseInt(pig_move.style.left);
////                var pig_move_left=pig_left;
//                var pig_distance=20;
//                if(pig_move_left+pig_distance<700){
//                    var zhi2=pig_move_left+pig_distance;
//                    pig_move.style.left=zhi2+"px";
//                    window.setInterval(pigmove2(),1000);
//                }
//            }
//            pigmove2();
//
//            var pig_move_left=pig_left/2;
//            var pig_move_top=pig_top/2;
//            $(".pig").each(function(){
//                $(this).animate({left:pig_move_left+"px"});
//                $(this).css("transition","left 10s ease-in");
//            });


//                $(".pig").transition({
//                    left:pig_move_left,top:pig_move_top,
//                    duration: 500,
//                    easing: 'linear',
//                    complete: function(){}
//                });
//            $(".pig").css({left:'"+pig_move_left+"px'});


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



        setInterval(left_top, delay);

    }



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


//        点击功能栏  quanxian:1为普通用户，2位开通一键功能用户
//        打扫
    var quanxian=1;
    $(".clear").click(function(){
        var bian_number=$(".bianbian").length;
        if(!bian_number){
            $(".hint").css("display","block");
            $(".hint").text("牧场很干净，无需清理哦！")
            $(".hint").fadeOut(2500);
        }else{
            if(quanxian==1){
                $(".bianbian").click(function(){
                    $(this).css("display","none");
                    $(this).remove();
                });
            }else{
                $(".hint").css("display","block");
                $(".hint").text("一键清理完毕！")
                $(".hint").fadeOut(2500);
                $(".bianbian").remove();
            }
        }

    });

    //除蚊虫
    $(".qucong").click(function(){
        var wenzi_number=$(".wenzi").length;
        if(!wenzi_number){
            $(".hint").css("display","block");
            $(".hint").text("没有蚊子哦，无需清虫哦！")
            $(".hint").fadeOut(2500);
        }else{
            if(quanxian==1){
                $(".wenzi").click(function(){
                    $(this).css("display","none");
                    $(this).remove();
                });
            }else{
                $(".hint").css("display","block");
                $(".hint").text("一键除虫完毕！")
                $(".hint").fadeOut(2500);
                $(".wenzi").remove();
            }
        }
    });




//        宠物成长至初级函数
    function chuji(){
        $(".hint").css("display","block");
        $(".hint").text("宠物成长至初级！");
        $(".hint").fadeOut(2500);
    }
//        宠物成长至中级函数
    function zhongji(){
        $(".hint").css("display","block");
        $(".hint").text("宠物成长至中级！");
        $(".hint").fadeOut(2500);
    }
//        宠物成长至初级函数
    function gaoji(){
        $(".hint").css("display","block");
        $(".hint").text("宠物成长至高级！");
        $(".hint").fadeOut(2500);
    }
//      宠物已是最高级提示函数
    function gradetishi(){
        $(".hint").css("display","block");
        $(".hint").text("宠物成长已最高级！")
        $(".hint").fadeOut(2500);
    }
//        喂养
    var feed=0;//一键选择时，判断宠物在哪级
    $(".feed").click(function(){
        if(quanxian==1){
            $(".pig").unbind('click').click(function(){
                alert(123)
                var pig_dengji=$(this).attr("pig_dengji");
                if(pig_dengji==1){
                    $(this).removeAttr("pig_dengji");
                    $(this).css("transform","scale(0.8)");
                    chuji();
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
                }else if(pig_dengji==2){
                    $(this).removeAttr("pig_dengji");
                    $(this).css("transform","scale(0.9)");
                    zhongji();
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
                }else if(pig_dengji==3){
                    $(this).removeAttr("pig_dengji");
                    $(this).css("transform","scale(1)");
                    gaoji();
                    pig_dengji=parseInt(pig_dengji)+1;
                    $(this).attr("pig_dengji",pig_dengji);
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
                $(".hint").css("display","block");
                $(".hint").text("所有种类宠物已达到最高级！")
                $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("猪类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("羊类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("牛类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("猫类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("羊驼类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("黑猫类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("猫鼬类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
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
                        $(".hint").css("display","block");
                        $(".hint").text("蜜蜂类所有宠物已达到最高级！")
                        $(".hint").fadeOut(2500);
                    }
                }

            }

        }


    });

    //        点击收获按钮收获最高等级为4的宠物
    $(".shouhuo_but").click(function(){
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
                $(".hint").css("display","block");
                $(".hint").text("没有可以获取的哦！")
                $(".hint").fadeOut(2500);
            }else{
                //                //猪收获
                $(".pig").each(function(){
                    if((this).getAttribute("pig_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //羊收获
                $(".sheep").each(function(){
                    if((this).getAttribute("sheep_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //牛收获
                $(".cow").each(function(){
                    if((this).getAttribute("cow_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //猫收获
                $(".cat").each(function(){
                    if((this).getAttribute("cat_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //羊驼收获
                $(".alpaca").each(function(){
                    if((this).getAttribute("alpaca_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //黑猫收获
                $(".blackcat").each(function(){
                    if((this).getAttribute("blackcat_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //猫鼬收获
                $(".maoyou").each(function(){
                    if((this).getAttribute("maoyou_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);
                //蜜蜂收获
                $(".bee").each(function(){
                    if((this).getAttribute("bee_dengji")==4){
                        $(this).remove();
                    }
                });
                $(".hint").css("display","block");
                $(".hint").text("一键收获完成！")
                $(".hint").fadeOut(2500);

            }

//                pig_number=document.getElementsByClassName("pig");
//                for(var i=0;i<pig_number.length;i++){
//                    if(pig_number[i].getAttribute("pig_dengji")==4){
//                        pig_number[i].style.display="none";
//                    }
//                }





        }
    });


//        一键刷新
    $(".shuaxin").click(function(){
        window.location.reload();
//            $(".hint").css("display","block");
//            $(".hint").text("页面刷新成功！")
//            $(".hint").fadeOut(2500);
    });

});