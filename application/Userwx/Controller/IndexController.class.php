<?php
namespace Userwx\Controller;
use Think\Controller;

header('content-type:text/html;charset=utf-8');
class IndexController extends Controller {

	public function error(){
		$this->display();
	}

    public function index(){
    	$t_id = I('t');
		session('tid',$t_id);
    	$config = C('WEIXINPAY_CONFIG');
    	$oauth = load_wechat('Oauth');
		$result = $oauth->getOauthRedirect($config['redirect_uri']);
		//$result = "http://car.com/Home/Index/redirect_url";
     	header("location:" . $result);
	}
	public function testIndex(){
        $result['openid']='oMZYmxEKvxktFsiEPuCjjXoWhZ30';
        $result['scope']=  'snsapi_userinfo';
    }

	public function redirect_url(){
		$config = C('WEIXINPAY_CONFIG');
		$oauth = load_wechat('Oauth');
		$result = $oauth->getOauthAccessToken();
//        $result['access_token']= 'oQGNt1fYA54wgL6BOG2FskjSmTwap1D4pdhjl2l-Yn98bpgvnEzzqOEUvXR2KzCdVXQP-7bwSgo5WFeN_TIEQg';
//        $result['expires_in']= 7200;
//        $result['refresh_token']= 'BYhLjz3YtaG4L1FiW55uUPnMlmR4APmTuHidhXxSyXd_d1FFngk8zGPJp_TOQ304YN0vePcCBw7kE4E6Frcafw';
//        $result['openid']='oMZYmxEKvxktFsiEPuCjjXoWhZ30';
//        $result['scope']=  'snsapi_userinfo';
		$userinfo = $oauth->getOauthUserinfo($result['access_token'], $result['openid']);
		//判断是否第一次登陆
		$wx = D('jz_wx');
		$user = M('jz_user');
		$res = $wx->where("openid = '{$result['openid']}'")->find();
		if($res){
			//是否过期
			if($res['expires_in']<time()){
				$wx->where("openid = '{$result['openid']}'")->setField('access_token',$result['access_token']);
			}
			//查找会员数据
			$info = $user->where("id = {$res['userid']}")->find();
			session('user',$info);


			//是否推荐
			$t_id = session('tid');
			if($t_id){
				$data['t_id'] = $t_id;
			}
			//自动注册
			$data['nickname'] = $userinfo['nickname'];
			$headimgurl = substr($userinfo['headimgurl'], 0,-2);
			$data['headimgurl'] = $headimgurl.'/46';
			$data['country'] = $userinfo['country'];
			$data['province'] = $userinfo['province'];
			$data['sex'] = $userinfo['sex'];
			$data['user_agent'] = serialize(get__browser());
			$data['city'] = $userinfo['city'];
			$data['reg_ip'] = get_client_ip();
//			$data['points'] = 10;
			$data['last_ip'] = get_client_ip();
			$data['reg_time'] = time();
			$data['last_time'] = time();
			$data['logins'] = 1;
			$userid = $user->add($data);
			if($userid){
				if($t_id){
					//推荐码（二维码）
					$siteurl = $_SERVER['SERVER_NAME'];
					$url = 'http://'.$siteurl;
					$img = qrcode($url);
				}else{
					$siteurl = $_SERVER['SERVER_NAME'];
					$url = 'http://'.$siteurl.'?t='.$userid;
					$img = qrcode($url);
				}
				$user->where("id = $userid")->setField('qrcode','http://'.$siteurl.'/'.$img);

				$data1['userid'] = $userid;
				$data1['openid'] = $result['openid'];
				$data1['access_token'] = $result['access_token'];
				$data1['expires_in'] = time()+$result['expires_in'];
				$res2 = $wx->add($data1);
				if($res2){
					$data['id'] = $userid;
					session('user',$data);
					$this->redirect('Home/Select/index');
				}
			}
		}
	}
	
}