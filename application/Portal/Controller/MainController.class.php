<?php

namespace Admin\Controller;

use Common\Controller\AdminbaseController;

class MainController extends AdminbaseController {

    public function index() {

        $mysql = M()->query("select VERSION() as version");
        $mysql = $mysql[0]['version'];
        $mysql = empty($mysql) ? L('UNKNOWN') : $mysql;

        //server infomaions
        $info = array(
            L('OPERATING_SYSTEM') => PHP_OS,
            L('OPERATING_ENVIRONMENT') => $_SERVER["SERVER_SOFTWARE"],
            L('PHP_VERSION') => PHP_VERSION,
            L('PHP_RUN_MODE') => php_sapi_name(),
            L('PHP_VERSION') => phpversion(),
            L('MYSQL_VERSION') => $mysql,
            L('PROGRAM_VERSION') => THINKCMF_VERSION,
            L('UPLOAD_MAX_FILESIZE') => ini_get('upload_max_filesize'),
            L('MAX_EXECUTION_TIME') => ini_get('max_execution_time') . "s",
            L('DISK_FREE_SPACE') => round((@disk_free_space(".") / (1024 * 1024)), 2) . 'M',
        );
        $this->assign('server_info', $info);
        if(!I('post.start_time')){
        $_POST[start_time]=date('Y-m-d 00:00:00',strtotime('-5 days'));
        }
        if(!I('post.end_time')){
        $_POST[end_time]=date('Y-m-d 00:00:00',strtotime('-4 days'));
        }
        if(!I('post.fhyts')){
        $_POST[fhyts]='7';
        }
        $this->assign('formget', $_POST);
        $start_time = I('post.start_time');
        $end_time = I('post.end_time');
        $fhyts=I('post.fhyts');


        $regnum=M('user')->count();
        $jhnum=M('user')->where(array('user_status'=>'0'))->count();
        $fhnum=M('user')->where(array('user_status'=>'1'))->count();
         $this->assign('regnum', $regnum+0);
        $this->assign('jhnum', $jhnum+0);
        $this->assign('fhnum', $fhnum+0);
        $where[status]=0;
        $tgbzmoney=M('provide_help')->where($where)->sum('money');
        $tgbznum=M('provide_help')->where($where)->group('old_id')->count();
        $jsbzmoney=M('get_help')->where($where)->sum('money');
        $jsbznum=M('get_help')->where($where)->group('old_id')->count();

        $this->assign('tgbzmoney', $tgbzmoney+0);
        $this->assign('tgbznum', $tgbznum+0);
        $this->assign('jsbzmoney', $jsbzmoney+0);
        $this->assign('jsbznum', $jsbznum+0);

        $djmoney=M('provide_order')->where($where)->sum('money');
        $djnum=M('provide_order')->where($where)->count();

        $this->assign('djnum', $djnum+0);
        $this->assign('djmoney', $djmoney+0);

        $where2[status]=0;
        $where2[create_time]=array('between',array($start_time,$end_time));
        $tgbzmoney2=M('provide_help')->where($where2)->sum('money');
        $jsbzmoney2=M('get_help')->where($where2)->sum('money');
        $this->assign('tgbzmoney2', $tgbzmoney2+0);
        $this->assign('jsbzmoney2', $jsbzmoney2+0);
        $user=M('user')->select();
        print_r($user);
        $where3['tgbztime']=array('lt',date('Y-m-d 00:00:00',strtotime('-'.$fhyts.' days')));
        $fhynum=M('user')->where($where3)->count();
        $this->assign('fhynum', $fhynum+0);
        $this->display();
    }

}
