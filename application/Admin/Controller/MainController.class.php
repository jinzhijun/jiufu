<?php

namespace Admin\Controller;

use Common\Controller\AdminbaseController;

class MainController extends AdminbaseController {
    function _initialize() {
        parent::_initialize();
        $this->user_model = D("Portal/User");
        $this->provide_help = M('provide_help');
        $this->get_help = M('get_help');
        $this->match = M('match'); //订单匹配
    }
    public function zdpp() {
        @ini_set('memory_limit', '512M');
        @set_time_limit(0);
        $start_time=$_SESSION['start_time'];
        $end_time=$_SESSION['end_time'];
        $start_time2=$_SESSION['start_time2'];
        $end_time2=$_SESSION['end_time2'];
        $where['provide_help'][status]=0;
        $where['provide_help'][create_time]=array('between',array($start_time,$end_time));
        $where['get_help'][status]=0;
        $where['get_help'][create_time]=array('between',array($start_time2,$end_time2));
        $tgbzmoney=M('provide_help')->where($where['provide_help'])->sum('money');
        $jsbzmoney=M('get_help')->where($where['get_help'])->sum('money');
        $order['provide_help']=M('provide_help')->where($where['provide_help'])->order('id asc')->find();
        $lx='provide_help';
        $type='get_help';
        if($order['provide_help']){
        for($i=1;$i>0;$i){
            $where2['user_login']=array('neq',$order[$lx]['user_login']);
            $order[$type]=M($type)->where($where[$type])->order('id asc')->find();
            if(!$order[$type]){
                $i=-1;
            }
            else{
            $norder=$this->match($order['provide_help']['id'],$order['get_help']['id']);
                if($norder[type]){
                    $order[$norder[lx]]=$norder[order];
                    $lx=$norder[lx];
                    $type=$norder[type];
                }
                else{
                    unset($where2['user_login']);
                    $order['provide_help']=M('provide_help')->where($where['provide_help'])->order('id asc')->find();
                    if(!$order['provide_help']){
                        $i=-2;
                    }
                    $type='get_help';
                    $lx='provide_help';
                }
            }
        }
        }
        $this->success('匹配成功'.$i);
    }
    private function match($pid, $gid) {
        $provide_order = $this->provide_help->find($pid);
        $get_order = $this->get_help->find($gid);
        if($provide_order[money]>$get_order[money]){
            $pidlist=$this->tgbzcf($pid,$get_order[money]);
            $this->__orderMatch($pidlist[0], $gid);
            $result['type']='get_help';
            $result['lx']='provide_help';
            $result['order']=$this->provide_help->find($pidlist[1]);
        }
        elseif($provide_order[money]<$get_order[money]){
            $gidlist=$this->jsbzcf($gid,$provide_order[money]);
            $this->__orderMatch($pid, $gidlist[0]);
            $result['type']='provide_help';
            $result['lx']='get_help';
            $result['order']=$this->get_help->find($gidlist[1]);;
        }
        else{
            $this->__orderMatch($pid, $gid);
            $result['type']='0';
        }
        return $result;
    }
    private function tgbzcf($pid, $money){
        $provide_order = $this->provide_help->find($pid);
        $old_id = $provide_order['id'];
        $old_money = $provide_order['money'];
        if ($provide_order['old_id'] > 0) {
                    $old_id = $provide_order['old_id'];
                }
                if ($provide_order['old_money'] > 0) {
                    $old_money = $provide_order['old_money'];
                }
        $data = $provide_order;
        unset($data[id]);
        $data['money'] = $money;
        $data['old_id'] = $old_id;
        $data['old_money'] = $old_money;
        $res[]= $this->provide_help->add($data);
        $data['money'] = $provide_order['money']-$money;
        $res[]= $this->provide_help->add($data);
        $this->provide_help->delete($provide_order['id']);
        return $res;
    }
    private function jsbzcf($gid, $money){
        $order = $this->get_help->find($gid);
        $old_id = $order['id'];
        $old_money = $order['money'];
        if ($order['old_id'] > 0) {
                    $old_id = $order['old_id'];
                }
                if ($order['old_money'] > 0) {
                    $old_money = $order['old_money'];
                }
        $data = $order;
        unset($data[id]);
        $data['money'] = $money;
        $data['old_id'] = $old_id;
        $data['old_money'] = $old_money;
        $res[]= $this->get_help->add($data);
        $data['money'] = $order['money']-$money;
        $res[]= $this->get_help->add($data);
        $this->get_help->delete($order['id']);
        return $res;
    }
    /**
     * 订单匹配
     * @param type $pid 提供帮助订单ID
     * @param type $gid 接受帮助订单ID
     */
    private function __orderMatch($pid, $gid) {
        $provide_order = $this->provide_help->find($pid);
        $get_order = $this->get_help->find($gid);
        if ($provide_order['status'] == 1 || $get_order['status'] == 1) {
            $this->error('匹配失败：订单状态异常。');
        }
        if ($provide_order['money'] != $get_order['money']) {
            $this->error('匹配失败：金额不相等。');
        } else {
            $data['pid'] = $pid;
            $data['gid'] = $gid;
            $data['provide_user'] = $provide_order['user_login'];
            $data['get_user'] = $get_order['user_login'];
            $data['create_time'] = $this->time;
            $data['money'] = $provide_order['money'];
            if ($this->match->add($data)) {
                $this->provide_help->where(array('id' => $pid))->save(array('status' => 1));
                $this->get_help->where(array('id' => $gid))->save(array('status' => 1));
                $provide_user = $this->user_model->where(array('user_login' => $provide_order['user_login']))->find();
                $get_user = $this->user_model->where(array('user_login' => $get_order['user_login']))->find();
                if(!$this->provide_help->where(array('status'=>'0','old_id'=>$provide_order['old_id']))->find()){
                $content = "尊敬的用户,您的订单".$provide_order['old_id']."已匹配成功";
                sendsmg($provide_user['mobile'], $content);
                }
                if(!$this->get_help->where(array('status'=>'0','old_id'=>$get_order['old_id']))->find()){
                $content = "尊敬的用户,您的订单".$get_order['old_id']."已匹配成功";
                sendsmg($get_user['mobile'], $content);
                }
                return TRUE;
            } else {
                $this->error('匹配失败：系统超时。');
            }
        }
        return FALSE;
    }
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
        if(!I('post.start_time2')){
        $_POST[start_time2]=date('Y-m-d 00:00:00',strtotime('-2 days'));
        }
        if(!I('post.end_time2')){
        $_POST[end_time2]=date('Y-m-d 00:00:00',strtotime('-1 days'));
        }
        if(!I('post.fhyts')){
        $_POST[fhyts]='7';
        }
        $this->assign('formget', $_POST);
        $start_time = I('post.start_time');
        $end_time = I('post.end_time');
        $start_time2 = I('post.start_time2');
        $end_time2 = I('post.end_time2');
        $fhyts=I('post.fhyts');
        $_SESSION['fhyts']=$fhyts;
        $_SESSION['start_time']=$start_time;
        $_SESSION['end_time']=$end_time;
        $_SESSION['start_time2']=$start_time2;
        $_SESSION['end_time2']=$end_time2;


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
        $where4[status]=0;
        $where4[create_time]=array('between',array($start_time2,$end_time2));
        $jsbzmoney2=M('get_help')->where($where4)->sum('money');
        $this->assign('tgbzmoney2', $tgbzmoney2+0);
        $this->assign('jsbzmoney2', $jsbzmoney2+0);
        $where3['tgbztime']=array('lt',date('Y-m-d 00:00:00',strtotime('-'.$fhyts.' days')));
        $fhynum=M('user')->where($where3)->count();
        $this->assign('fhynum', $fhynum+0);
        $this->display();
    }

}
