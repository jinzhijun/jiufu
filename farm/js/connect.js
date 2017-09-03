function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
} 
var url = 'test.jiufu.com';
var storage=window.localStorage;
var websocket = new WebSocket("ws://"+url+":8282");
var page=getQueryString('page');
var userId = storage['userId'];
var token = storage['token'];
websocket.onopen = function(event) {
        var fs = {};
        fs.userid=userId;
        fs.salt=token;
        if(!page){
            page=1;
        }
        fs.page=page;
        fs.act=act;
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
websocket.onmessage = function(event){
        zdata=JSON.parse(event.data);
        console.log(zdata);
        window[zdata.act](zdata.msg);
};
function pagexx(id){ 
    var fs = {};
        fs.userid=userId;
        fs.salt=token;
        if(!page){
            page=1;
        }
        fs.page=id;
        fs.act=act;
        var jsonStr = JSON.stringify(fs);
        websocket.send(jsonStr);
}
function tjhy(){
    var fs = {};
    fs.userid=userId;
    fs.salt=token;
    fs.act='yjhy';
    fs.user_login=$("#user_login").val();
    var jsonStr = JSON.stringify(fs);
    websocket.send(jsonStr);
}
function qdtj(id){
    var fs = {};
    fs.userid=userId;
    fs.salt=token;
    fs.act='qdtj';
    fs.id=id;
    var jsonStr = JSON.stringify(fs);
    websocket.send(jsonStr);
}
function kt(auto,id){
    var fs = {};
    fs.userid=userId;
    fs.salt=token;
    fs.act='kt';
    fs.id=id;
    fs.auto=auto;
    var jsonStr = JSON.stringify(fs);
        if(confirm('确认开通此功能')){
    websocket.send(jsonStr);
            }
}
function addhtml(data){
        $("#"+data.id).html(data.html)
}
function addappend(data){
        $("#"+data.id).html(data.html)
}
function addval(data){
        $("#"+data.id).val(data.html)
}
function readonly(data){
    if(data.html==1){
    $("#"+data.id).attr('readonly',true);
    }
    else{
    $("#"+data.id).attr('readonly',false);
    }
}
function outlogin(msg){
    displayMessage(msg);
    storage.removeItem("token");
    storage.removeItem("uid");
    location.href='login.html';
}
function error(msg){
    alert(msg);
}
function success(msg){
    alert(msg);
    location.reload();
}
function gm(id){
    var storage=window.localStorage;
    $.ajax({
            type: "POST",
            url:  "http://"+url+"/index.php/Portal/Home/gm",
            data: 
            {
                userid:storage['userId'],
                salt:storage['token'],
                gid:id
            },
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    alert(data.info);
                    window.parent.frames.refreshGameData();
                    window.location.href=data.referer;
                }
            }
        });
}
function qrsk(id){
    var storage=window.localStorage;
    $.ajax({
            type: "POST",
            url:  "http://"+url+"/index.php/Portal/Home/qrsk",
            data: 
            {
                userid:storage['userId'],
                salt:storage['token'],
                gid:id
            },
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    alert(data.info);
                    window.parent.frames.refreshGameData();
                    window.location.href=data.referer;
                }
            }
        });
}
function qrfk(id){
    var storage=window.localStorage;
    $.ajax({
            type: "POST",
            url:  "http://"+url+"/index.php/Portal/Home/qrfk",
            data: 
            {
                userid:storage['userId'],
                salt:storage['token'],
                gid:id
            },
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    alert(data.info);
                    window.parent.frames.refreshGameData();
                    window.location.href=data.referer;
                }
            }
        });
}
function tj(id){
        var action = "http://"+url+$("#"+id).attr('action');
        console.log($("#"+id).serialize());
        $.ajax({
            type: "POST",
            url: action,
            data:$("#"+id).serialize(),
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data.status==0){
                        alert(data.info);
                }
                if(data.status==1){
                    alert(data.info);
                    window.parent.frames.refreshGameData();
                    window.location.href=data.referer;
                }
            }
        });
}