<?php

namespace Common\Controller;

use Common\Controller\AppframeController;

class HomebaseController extends AppframeController {

    protected $uid;
    protected $user_login;
    protected $user;
    protected $time;
    protected $all_record;
    protected $extract;
    protected $bonus;

    public function __construct() {
        header('Access-Control-Allow-Origin:*'); 
        $this->set_action_success_error_tpl();
        parent::__construct();
            	 if($_POST['salt']&&$_POST['salt']==md5(md5($_POST['userid'].'zmm').'zmm')){
    	 	 $user = M('user')->where(array('id'=>$_POST['userid']))->find();
				session('uid', $user["id"]);
				session('user_login', $user["user_login"]);
				session('user', $user);
        }
        elseif($_POST['salt']){
        	$this->error('验证信息错误');
        }
        $this->time = $this->getTime();
        $this->all_record = M('AllRecord');
        $this->extract=  sp_get_option('extract');
        $this->bonus=  sp_get_option('bonus');
        $this->assign('bonus', $this->bonus);
        $this->assign('extract', $this->extract);
        $this->uid = session('uid');
        $this->user_login = session('user_login');
        $this->user_model = D("Portal/User");
        $this->user = $this->user_model->find($this->uid);
        $this->tjurl='http://'.$_SERVER[HTTP_HOST]."/?reg=".$this->uid;
		$this->ztjurl=urlencode($this->tjurl);
		$this->assign('ztjurl', $this->ztjurl);
        $this->assign('tjurl', $this->tjurl);
        $this->assign('user', $this->user);
        if(sp_is_mobile() || $_GET['app']==1){
            $this->is_mobile=1;
            $this->assign('is_mobile', '1');
        }
        else{
            $this->assign('is_mobile', '0');
        }
    }
    public function getTime() {
        return date ("Y-m-d H:i:s",  time());
    }

    function _initialize() {
        parent::_initialize();
        defined('TMPL_PATH') or define("TMPL_PATH", C("SP_TMPL_PATH"));
        $site_options = get_site_options();
        $this->assign($site_options);
        if (sp_is_user_login()) {
            $this->assign("user", sp_get_current_user());
        }
    }

    /**
     * 检查用户登录
     */
    protected function check_login() {
        $session_user = session('user_login');
        if (empty($session_user)) {
            $this->error('您还没有登录！', leuu('portal/index/index'));
        }
    }

    public function msg($msg, $url) {
        if (!$url) {
                    header('Content-Type:text/html; charset=utf-8');
                    die("<script>alert('" . $msg . "');history.go(-1);</script>");
        }
        else{
        header('Content-Type:text/html; charset=utf-8');
        die("<script>alert('" . $msg . "');location.href='{$url}';</script>");
        }
    }
    
    public function addRecord($uname, $wallet, $num, $notice) {
        $data['user_login'] = $uname;
        $data['wallet'] = $wallet;
        $data['number'] = $num;
        $data['notice'] = $notice;
        $data['create_time'] = $this->time;
        $this->all_record->add($data);
    }

    /**
     * 操作错误跳转的快捷方法
     * @access protected
     * @param string $message 错误信息
     * @param string $jumpUrl 页面跳转地址
     * @param mixed $ajax 是否为Ajax方式 当数字时指定跳转时间
     * @return void
     */
    public function error($message='',$jumpUrl='',$ajax=ture) {
        $this->dispatchJump($message,0,$jumpUrl,$ajax);
    }

    /**
     * 操作成功跳转的快捷方法
     * @access protected
     * @param string $message 提示信息
     * @param string $jumpUrl 页面跳转地址
     * @param mixed $ajax 是否为Ajax方式 当数字时指定跳转时间
     * @return void
     */
    public function success($message='',$jumpUrl='',$ajax=true) {
        $this->dispatchJump($message,1,$jumpUrl,$ajax);
    }
    /**
     * 检查用户状态
     */
    public function check_user() {
        $user_status = M('Users')->where(array("id" => sp_get_current_userid()))->getField("user_status");
        if ($user_status == 2) {
            $this->error('您还没有激活账号，请激活后再使用！', U("user/login/active"));
        }

        if ($user_status == 0) {
            $this->error('此账号已经被禁止使用，请联系管理员！', __ROOT__ . "/");
        }
    }
    /**
     * 默认跳转操作 支持错误导向和正确跳转
     * 调用模板显示 默认为public目录下面的success页面
     * 提示页面为可配置 支持模板标签
     * @param string $message 提示信息
     * @param Boolean $status 状态
     * @param string $jumpUrl 页面跳转地址
     * @param mixed $ajax 是否为Ajax方式 当数字时指定跳转时间
     * @access private
     * @return void
     */
    public function dispatchJump($message,$status=1,$jumpUrl='',$ajax=false) {
        if(1) {// AJAX提交
            $data           =   is_array($ajax)?$ajax:array();
            $data['info']   =   $message;
            $data['status'] =   $status;
            $data['url']    =   $jumpUrl;
            $this->ajaxReturn($data);
        }
        if(is_int($ajax)) $this->assign('waitSecond',$ajax);
        if(!empty($jumpUrl)) $this->assign('jumpUrl',$jumpUrl);
        // 提示标题
        $this->assign('msgTitle',$status? L('_OPERATION_SUCCESS_') : L('_OPERATION_FAIL_'));
        //如果设置了关闭窗口，则提示完毕后自动关闭窗口
        if($this->get('closeWin'))    $this->assign('jumpUrl','javascript:window.close();');
        $this->assign('status',$status);   // 状态
        //保证输出不受静态缓存影响
        C('HTML_CACHE_ON',false);
        if($status) { //发送成功信息
            $this->assign('message',$message);// 提示信息
            // 成功操作后默认停留1秒
            if(!isset($this->waitSecond))    $this->assign('waitSecond','1');
            // 默认操作成功自动返回操作前页面
            if(!isset($this->jumpUrl)) $this->assign("jumpUrl",$_SERVER["HTTP_REFERER"]);
            $this->display(C('TMPL_ACTION_SUCCESS'));
        }else{
            $this->assign('error',$message);// 提示信息
            //发生错误时候默认停留3秒
            if(!isset($this->waitSecond))    $this->assign('waitSecond','3');
            // 默认发生错误的话自动返回上页
            if(!isset($this->jumpUrl)) $this->assign('jumpUrl',"javascript:history.back(-1);");
            $this->display(C('TMPL_ACTION_ERROR'));
            // 中止执行  避免出错后继续执行
            exit ;
        }
    }

    /**
     * 发送注册激活邮件
     */
    protected function _send_to_active() {
        $option = M('Options')->where(array('option_name' => 'member_email_active'))->find();
        if (!$option) {
            $this->error('网站未配置账号激活信息，请联系网站管理员');
        }
        $options = json_decode($option['option_value'], true);
        //邮件标题
        $title = $options['title'];
        $uid = session('user.id');
        $username = session('user.user_login');

        $activekey = md5($uid . time() . uniqid());
        $users_model = M("Users");

        $result = $users_model->where(array("id" => $uid))->save(array("user_activation_key" => $activekey));
        if (!$result) {
            $this->error('激活码生成失败！');
        }
        //生成激活链接
        $url = U('user/register/active', array("hash" => $activekey), "", true);
        //邮件内容
        $template = $options['template'];
        $content = str_replace(array('http://#link#', '#username#'), array($url, $username), $template);

        $send_result = sp_send_email(session('user.user_email'), $title, $content);

        if ($send_result['error']) {
            $this->error('激活邮件发送失败，请尝试登录后，手动发送激活邮件！');
        }
    }

    /**
     * 加载模板和页面输出 可以返回输出内容
     * @access public
     * @param string $templateFile 模板文件名
     * @param string $charset 模板输出字符集
     * @param string $contentType 输出类型
     * @param string $content 模板输出内容
     * @return mixed
     */
    public function display($templateFile = '', $charset = '', $contentType = '', $content = '', $prefix = '') {
        parent::display($this->parseTemplate($templateFile), $charset, $contentType, $content, $prefix);
    }

    /**
     * 获取输出页面内容
     * 调用内置的模板引擎fetch方法，
     * @access protected
     * @param string $templateFile 指定要调用的模板文件
     * 默认为空 由系统自动定位模板文件
     * @param string $content 模板输出内容
     * @param string $prefix 模板缓存前缀*
     * @return string
     */
    public function fetch($templateFile = '', $content = '', $prefix = '') {
        $templateFile = empty($content) ? $this->parseTemplate($templateFile) : '';
        return parent::fetch($templateFile, $content, $prefix);
    }

    /**
     * 自动定位模板文件
     * @access protected
     * @param string $template 模板文件规则
     * @return string
     */
    public function parseTemplate($template = '') {

        $tmpl_path = C("SP_TMPL_PATH");
        define("SP_TMPL_PATH", $tmpl_path);
        if ($this->theme) { // 指定模板主题
            $theme = $this->theme;
        } else {
            // 获取当前主题名称
            $theme = C('SP_DEFAULT_THEME');
            if (C('TMPL_DETECT_THEME')) {// 自动侦测模板主题
                $t = C('VAR_TEMPLATE');
                if (isset($_GET[$t])) {
                    $theme = $_GET[$t];
                } elseif (cookie('think_template')) {
                    $theme = cookie('think_template');
                }
                if (!file_exists($tmpl_path . "/" . $theme)) {
                    $theme = C('SP_DEFAULT_THEME');
                }
                cookie('think_template', $theme, 864000);
            }
        }

        $theme_suffix = "";

        if (C('MOBILE_TPL_ENABLED') && sp_is_mobile()) {//开启手机模板支持
            if (C('LANG_SWITCH_ON', null, false)) {
                if (file_exists($tmpl_path . "/" . $theme . "_mobile_" . LANG_SET)) {//优先级最高
                    $theme_suffix = "_mobile_" . LANG_SET;
                } elseif (file_exists($tmpl_path . "/" . $theme . "_mobile")) {
                    $theme_suffix = "_mobile";
                } elseif (file_exists($tmpl_path . "/" . $theme . "_" . LANG_SET)) {
                    $theme_suffix = "_" . LANG_SET;
                }
            } else {
                if (file_exists($tmpl_path . "/" . $theme . "_mobile")) {
                    $theme_suffix = "_mobile";
                }
            }
        } else {
            $lang_suffix = "_" . LANG_SET;
            if (C('LANG_SWITCH_ON', null, false) && file_exists($tmpl_path . "/" . $theme . $lang_suffix)) {
                $theme_suffix = $lang_suffix;
            }
        }

        $theme = $theme . $theme_suffix;

        C('SP_DEFAULT_THEME', $theme);

        $current_tmpl_path = $tmpl_path . $theme . "/";
        // 获取当前主题的模版路径
        define('THEME_PATH', $current_tmpl_path);

        $cdn_settings = sp_get_option('cdn_settings');
        if (!empty($cdn_settings['cdn_static_root'])) {
            $cdn_static_root = rtrim($cdn_settings['cdn_static_root'], '/');
            C("TMPL_PARSE_STRING.__TMPL__", $cdn_static_root . "/" . $current_tmpl_path);
            C("TMPL_PARSE_STRING.__PUBLIC__", $cdn_static_root . "/public");
            C("TMPL_PARSE_STRING.__WEB_ROOT__", $cdn_static_root);
        } else {
            C("TMPL_PARSE_STRING.__TMPL__", __ROOT__ . "/" . $current_tmpl_path);
        }


        C('SP_VIEW_PATH', $tmpl_path);
        C('DEFAULT_THEME', $theme);

        define("SP_CURRENT_THEME", $theme);

        if (is_file($template)) {
            return $template;
        }
        $depr = C('TMPL_FILE_DEPR');
        $template = str_replace(':', $depr, $template);

        // 获取当前模块
        $module = MODULE_NAME;
        if (strpos($template, '@')) { // 跨模块调用模版文件
            list($module, $template) = explode('@', $template);
        }

        $module = $module . "/";

        // 分析模板文件规则
        if ('' == $template) {
            // 如果模板文件名为空 按照默认规则定位
            $template = CONTROLLER_NAME . $depr . ACTION_NAME;
        } elseif (false === strpos($template, '/')) {
            $template = CONTROLLER_NAME . $depr . $template;
        }

        $file = sp_add_template_file_suffix($current_tmpl_path . $module . $template);
        $file = str_replace("//", '/', $file);
        if (!file_exists_case($file))
            E(L('_TEMPLATE_NOT_EXIST_') . ':' . $file);
        return $file;
    }

    /**
     * 设置错误，成功跳转界面
     */
    private function set_action_success_error_tpl() {
        $theme = C('SP_DEFAULT_THEME');
        if (C('TMPL_DETECT_THEME')) {// 自动侦测模板主题
            if (cookie('think_template')) {
                $theme = cookie('think_template');
            }
        }
        //by ayumi手机提示模板
        $tpl_path = '';
        if (C('MOBILE_TPL_ENABLED') && sp_is_mobile() && file_exists(C("SP_TMPL_PATH") . "/" . $theme . "_mobile")) {//开启手机模板支持
            $theme = $theme . "_mobile";
            $tpl_path = C("SP_TMPL_PATH") . $theme . "/";
        } else {
            $tpl_path = C("SP_TMPL_PATH") . $theme . "/";
        }

        //by ayumi手机提示模板
        $defaultjump = THINK_PATH . 'Tpl/dispatch_jump.tpl';
        $action_success = sp_add_template_file_suffix($tpl_path . C("SP_TMPL_ACTION_SUCCESS"));
        $action_error = sp_add_template_file_suffix($tpl_path . C("SP_TMPL_ACTION_ERROR"));
        if (file_exists_case($action_success)) {
            C("TMPL_ACTION_SUCCESS", $action_success);
        } else {
            C("TMPL_ACTION_SUCCESS", $defaultjump);
        }

        if (file_exists_case($action_error)) {
            C("TMPL_ACTION_ERROR", $action_error);
        } else {
            C("TMPL_ACTION_ERROR", $defaultjump);
        }
    }

}
