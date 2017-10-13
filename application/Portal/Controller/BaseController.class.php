<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/10/12
 * Time: 14:33
 */

namespace Portal\Controller;


use Common\Controller\HomebaseController;
use Think\Controller;

header('content-type:text/html;charset=utf-8');
class BaseController extends Controller
{

    public function login($redirect_uri)
    {
        //微信授权登录
        $appid = 'wx77c6f288c5ed2764';
        $secret = 'bf7b510d94c0ada1d5fcdbfddfc49e43';
        $state = 'jiufu';
        $scope = 'snsapi_userinfo';
        // $redirect_uri = 'http://jsgx.ibenhong.com/index.php/home/index/get_unionid';
        $oauth_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $appid . '&redirect_uri=' . $redirect_uri . '&response_type=code&scope=' . $scope . '&state=' . $state . '#wechat_redirect';
//        $oauth_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx77c6f288c5ed2764&redirect_uri=http://test.jiufu.com&response_type=code&scope=snsapi_userinfo&state=jiufu#wechat_redirect';
//        header("Location: $oauth_url");


        //$this->redirect('index/main');
    }

    public function get_unionid()
    {
        //微信用户信息
        //echo "123";exit;
        $appid ='wx77c6f288c5ed2764';
        $secret = 'bf7b510d94c0ada1d5fcdbfddfc49e43';
        $code = $_GET['code'];
        $state = $_GET['state'];
        $access_token_url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=$appid&secret=$secret&code=$code&grant_type=authorization_code";
        $token = json_decode(file_get_contents($access_token_url));
        $openid = $token->openid;
        //print_r($openid);
        session('openid', $openid);
        //echo "<br>";
        $access_token = $token->access_token;
        //print_r($access_token);
        //header("Location: $access_token_url");
        $info_url = "https://api.weixin.qq.com/sns/userinfo?access_token=$access_token&openid=$openid&lang=zh_CN";
        $info = json_decode(file_get_contents($info_url));
        $data['wxname'] = $info->nickname;
        $data['picture_url'] = $info->headimgurl;
        $data['openid'] = $info->openid;
        $data['sex'] = $info->sex;
        $data['language'] = $info->language;
        $data['city'] = $info->city;
        $data['province'] = $info->province;
        $data['country'] = $info->country;
        $id = $data['openid'];
        if ($id == '') {
            $this->redirect('index/index');
        }
        session('openid', $id);
        $consumer = M('jz_wx');
        $res = $consumer->where("openid='$id'")->find();
        if ($res == '') {
            $data['new_vip'] = "1";
        }
    }
}
