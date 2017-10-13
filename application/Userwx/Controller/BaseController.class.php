<?php

namespace Userwx\Controller;
use Think\Controller;
header('content-type:text/html;charset=utf-8');
class BaseController extends Controller{

	public function _initialize(){
		//检测登录状态
		$userid = session('user');
		if(CONTROLLER_NAME!='Index'){
			if(empty($userid['id'])){
				$this->redirect('Index/index');
			}
		}
		$userinfo = M('jz_user')->where("id = {$userid['id']}")->find();
        $datasssssssss = $_SERVER["SERVER_NAME"] ;
        $this->assign('severname',$datasssssssss);
		$this->assign('userinfo',$userinfo);
	}

}


?>