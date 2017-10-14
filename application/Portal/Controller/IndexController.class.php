<?php

/*
 *      _______ _     _       _     _____ __  __ ______
 *     |__   __| |   (_)     | |   / ____|  \/  |  ____|
 *        | |  | |__  _ _ __ | | _| |    | \  / | |__
 *        | |  | '_ \| | '_ \| |/ / |    | |\/| |  __|
 *        | |  | | | | | | | |   <| |____| |  | | |
 *        |_|  |_| |_|_|_| |_|_|\_\\_____|_|  |_|_|
 */
/*
 *     _________  ___  ___  ___  ________   ___  __    ________  _____ ______   ________
 *    |\___   ___\\  \|\  \|\  \|\   ___  \|\  \|\  \ |\   ____\|\   _ \  _   \|\  _____\
 *    \|___ \  \_\ \  \\\  \ \  \ \  \\ \  \ \  \/  /|\ \  \___|\ \  \\\__\ \  \ \  \__/
 *         \ \  \ \ \   __  \ \  \ \  \\ \  \ \   ___  \ \  \    \ \  \\|__| \  \ \   __\
 *          \ \  \ \ \  \ \  \ \  \ \  \\ \  \ \  \\ \  \ \  \____\ \  \    \ \  \ \  \_|
 *           \ \__\ \ \__\ \__\ \__\ \__\\ \__\ \__\\ \__\ \_______\ \__\    \ \__\ \__\
 *            \|__|  \|__|\|__|\|__|\|__| \|__|\|__| \|__|\|_______|\|__|     \|__|\|__|
 */
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2014 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Dean <zxxjjforever@163.com>
// +----------------------------------------------------------------------

namespace Portal\Controller;

use Common\Controller\HomebaseController;

/**
 * 首页
 */
header('content-type:text/html;charset=utf-8');
class IndexController extends HomebaseController {
//    public function login($redirect_uri)
//    {
//        //微信授权登录
//        $appid = 'wx77c6f288c5ed2764';
//        $secret = 'bf7b510d94c0ada1d5fcdbfddfc49e43';
//        $state = 'jiufu';
//        $scope = 'snsapi_userinfo';
//        // $redirect_uri = 'http://jsgx.ibenhong.com/index.php/home/index/get_unionid';
//        $oauth_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $appid . '&redirect_uri=' . $redirect_uri . '&response_type=code&scope=' . $scope . '&state=' . $state . '#wechat_redirect';
////        $oauth_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx77c6f288c5ed2764&redirect_uri=http://test.jiufu.com&response_type=code&scope=snsapi_userinfo&state=jiufu#wechat_redirect';
////        header("Location: $oauth_url");
//
//
//        //$this->redirect('index/main');
//    }
//
//    public function get_unionid()
//    {
//        //微信用户信息
//        //echo "123";exit;
//        $appid ='wx77c6f288c5ed2764';
//        $secret = 'bf7b510d94c0ada1d5fcdbfddfc49e43';
//        $code = $_GET['code'];
//        $state = $_GET['state'];
//        $access_token_url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=$appid&secret=$secret&code=$code&grant_type=authorization_code";
//        $token = json_decode(file_get_contents($access_token_url));
//        $openid = $token->openid;
//        //print_r($openid);
//        session('openid', $openid);
//        //echo "<br>";
//        $access_token = $token->access_token;
//        //print_r($access_token);
//        //header("Location: $access_token_url");
//        $info_url = "https://api.weixin.qq.com/sns/userinfo?access_token=$access_token&openid=$openid&lang=zh_CN";
//        $info = json_decode(file_get_contents($info_url));
//        $data['wxname'] = $info->nickname;
//        $data['picture_url'] = $info->headimgurl;
//        $data['openid'] = $info->openid;
//        $data['sex'] = $info->sex;
//        $data['language'] = $info->language;
//        $data['city'] = $info->city;
//        $data['province'] = $info->province;
//        $data['country'] = $info->country;
//        $id = $data['openid'];
//        if ($id == '') {
//            $this->redirect('index/index');
//        }
//        session('openid', $id);
//        $consumer = M('jz_wx');
//        $res = $consumer->where("openid='$id'")->find();
//        if ($res == '') {
//            $data['new_vip'] = "1";
//        }
//    }

    public function index() {
       if($this->uid){
            header('Location:/farm/farm.html');
       }
        header('Location: /farm/login.html');
    }
    public function erweima(){
    	$this->display(":erweima");
    }
    public function reg(){
    	if(I('get.id')){
    		$map['id']=I('get.id');
        	$user = $this->user_model->where($map)->find();
        	$this->assign('user', $this->user);
    	}
        $this->display(":reg");
    }
    public function forget(){
        $this->display(":forget");
    }
    public function checkreg(){
        $map['user_login']=$_POST['param'];
        $user = $this->user_model->where($map)->find();
        if($user){
            echo '用户名已存在';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }
    public function checkuser(){
        $map['user_login']=$_POST['param'];
        $user = $this->user_model->where($map)->find();
        if(!$user){
            echo '用户不存在';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
        //print_r($_POST);
        //echo 00000;
    }
    public function checkerpwd(){
        $mm=$_POST['param'];
        if($this->user['user_two_pass']!=md5($mm)){
            echo '二级密码错误';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }
    public function checkmoney(){
        $money=$_POST['param'];
        if($money>$this->user['pdmoney']){
            echo '额度不足';
            exit;
        }
         $data[status]='y';
        print_r(json_encode($data));

    }
        public function upload() {
        $pic=json_decode($_POST['pic'],true);
        $img = base64_decode($pic[0]);
        $name='Uploads/photo/'.md5(time()).".jpg";
		$a = file_put_contents($name, $img);//返回的是字节数
        if (!$a) {//  上传错误提示错误信息
            $data['data'] = '上传错误'.$name;
            $this->ajaxReturn($data, 'JSON');
        } else {//  上传成功 获取上传文件信息
        	$data['error']=0;
            $data['img'] = "/".$name;
            $this->ajaxReturn($data, 'JSON');
        }
    }
    public function checkqiuzhujine(){
        $money=$_POST['param'];
        if($money>$this->user['money']){
            echo '余额不足';
            exit;
        }
         $data[status]='y';
        print_r(json_encode($data));

    }
    public function checkcardnum(){
        $map['cardnum']=$_POST['param'];
         $user = $this->user_model->where($map)->find();
        if($user){
            echo '身份证号码已注册';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }
    public function checkphone(){
        $map['mobile']=$_POST['param'];
         $user = $this->user_model->where($map)->find();
        if($user){
            echo '手机号码已注册';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }
    public function checkcode(){
        $code=$_POST['param'];
        if(!sp_check_verify_code($code,0)){
            echo '验证码错误';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }
    public function checkphonecode(){
    	$code=$_POST['param'];
        if(	$code!=$_SESSION[code]||!$_SESSION[code]){
            echo '验证码错误';
            exit;
        }
        $data[status]='y';
        print_r(json_encode($data));
    }

    public function regpost(){
        if(I('post.code')!=$_SESSION[code]||!$_SESSION[code] || $_SESSION[codefs]!='reg'){
        $this->error('验证码错误','');
        }
        $url = '';
        $post = I('post.post');
        if (!$post['parent_user']) {
            $this->error('注册失败：推荐人不存在', $url);
        }
        $post['user_login'] = trim($post['user_login']);
        $user = $this->user_model->where(array('user_login' => $post['user_login']))->find();
        if ($user) {
            $this->error('用户名已存在', $url);
        }
        $post['mobile'] = trim($post['mobile']);
        $mobile = $this->user_model->where(array('mobile' => $post['mobile']))->find();
        if ($mobile) {
            $this->error('手机号已被注册', $url);
        }
        $post['user_pass'] = trim($post['user_pass']);
        $post['re_user_pass'] = trim($post['re_user_pass']);
        if ($post['user_pass'] != $post['re_user_pass']) {
            $this->error('两次登录密码不相同', $url);
        }
        $post['user_two_pass'] = trim($post['user_two_pass']);
        $post['re_user_two_pass'] = trim($post['re_user_two_pass']);
        if ($post['user_two_pass'] != $post['re_user_two_pass']) {
            $this->error('两次二级密码不相同', $url);
        }
        $post['parent_user'] = trim($post['parent_user']);

        $parent = $this->user_model->where(array('user_login' => $post['parent_user']))->find();
        if($post['true_name2'] && $post['true_name2']!=$post['true_name']){
            $this->error('户名必须与姓名一致', $url);
        }
        if (empty($parent)) {
            $this->error('推荐人不存在', $url);
        }
        $post['user_pass'] = md5($post['user_pass']);
        $post['user_two_pass'] = md5($post['user_two_pass']);
        $post['parent'] = $parent['id'];
        $post['register_ip'] = get_client_ip(0, true);
        $post['create_time'] = $this->time;
        $post['tgbztime'] = $this->time;

        $res = $this->user_model->add($post);
        if ($res) {
            $map2['parent_user']=$post['parent_user'];
            $sl=M('user')->where($map2)->count();
            if($sl%$this->bonus['tjrs']==0){
                 $map3['money']=$parent['money']+$this->bonus['tjjl'];
                 M('user')->where(array('user_login'=>$map2['parent_user']))->save($map3);
            }
            $this->success('注册成功',U('/Portal/User/register'));
        } else {
            $this->error('注册失败', $url);
        }


    }
    public function forgetPost(){
    if(I('post.phonecode')!=$_SESSION[code]||!$_SESSION[code] || $_SESSION[codefs]!='forget'){
        $this->error('验证码错误','');
    }
    if(I('post.user_pass')!=I('post.re_user_pass')){
        $this->error('请验证两次输入密码一致','');
    }
    $map[mobile]=I('post.mobile');
    $data[user_pass]=md5(I('post.user_pass'));
    M('user')->where($map)->save($data);
    $this->success('密码找回成功,请登录');
}
    public function logout() {
        session('uid', null);
        session('user_login', null);
        redirect(__ROOT__ . "/");
    }
    public function checkname(){
        $map[user_login]=$_POST[user_login];
        if(M('user')->where($map)->find()){
            $res[ok]=1;
        }
        else{
            $res[ok]=0;
        }
        echo json_encode($res);
        exit;
    }
        public function sendphonecode(){
        $_SESSION[code]= rand(1000,9999);
        $_SESSION[time]=time();
        $mobile=I('post.phone');
        if(I('post.fs')==forget){
            $map[mobile]=$mobile;
            if(!M('user')->where($map)->find()){
                    $res[ok]=1;
                    $res[msg]='找回密码请输入注册手机号码';
                    echo json_encode($res);
                    exit;
            }
            $_SESSION[codefs]='forget';
        }
        if(I('post.fs')==reg){
            $_SESSION[codefs]='reg';

        }
        sendsmg($mobile, '您的验证码是:'.$_SESSION[code]);
        $res[ok]=0;
        $res[msg]='发送成功';
        echo json_encode($res);
    }


//    登录页面传输的数据
    public function dologin() {

        header('Access-Control-Allow-Origin:*');
        $name = I("post.user_login");
        if (empty($name)) {
            $this->error(L('USERNAME_OR_EMAIL_EMPTY'));
        }
        $pass = I("post.user_pass");
        if (empty($pass)) {
            $this->error(L('PASSWORD_REQUIRED'));
        }
        if(0){//$this->is_mobile!=1
        $verrify = I("post.verify");
        if (empty($verrify)) {
            $this->error(L('CAPTCHA_REQUIRED'));
        }
        }
        //验证码
        if (0) {
            //!sp_check_verify_code() && $this->is_mobile!=1

            $this->error(L('CAPTCHA_NOT_RIGHT'));
        } else {
            $user = D("Protal/User");
            $where['user_login'] = $name;
            $result = $user->where($where)->find();
            if (!empty($result)) {
                if($result['user_status']==1){
                    $this->error('账号被封');
                }
//                if($result['user_status']==2){
//                    $this->error('账号未激活');
//                }
                if (md5($pass) == $result['user_pass']) {
                    //登入成功页面跳转
                    session('uid', $result["id"]);
                    session('user_login', $result["user_login"]);
                    session('user', $result);
                    $result['last_login_ip'] = get_client_ip(0, true);
                    $result['last_login_time'] = date("Y-m-d H:i:s");
                    $user->save($result);
                    cookie("user_login", $name, 3600 * 24 * 30);
                    $this->success(L('LOGIN_SUCCESS'), "farm.html?uid=".$result["id"]."&token=".md5(md5($result["id"].'zmm').'zmm'));
                } else {
                    $this->error(L('PASSWORD_NOT_RIGHT'));
                }
            } else {
                $this->error(L('USERNAME_NOT_EXIST'));
            }
        }
    }

}
