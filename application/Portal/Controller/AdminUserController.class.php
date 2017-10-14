<?php

// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2014 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tuolaji <479923197@qq.com>
// +----------------------------------------------------------------------

namespace Portal\Controller;

use Common\Controller\AdminbaseController;

class AdminUserController extends AdminbaseController {

    protected $user_model;
//    protected $money_record;
    protected $activation_code;
    protected $all_record;
    public $parent_arr = array();
    protected $pdb; //排单币
    protected $award;


    public function sjtgbz() {
        $user=$this->user_model->select();
        $usernum=$this->user_model->count();
        $i=rand(0,$usernum-1);
        $money=rand(1,50)*100;
        $data['money']=$money;
        $data['user_login'] = $user[$i][user_login];
        $data['create_time'] = date('Y-m-d h:i:s',time());
        $res=M('provide_help')->add($data);
        if ($res) {
            M('provide_help')->where(array('id'=>$res))->save(array('old_id'=>$res,'old_money'=>$money));
            $this->user_model->where(array('id' => $user[$i][id]))->save(array('tgbztime'=>$this->time));
            echo '添加成功';
        }
    }

    public function sjjsbz() {
        $user=$this->user_model->select();
        $usernum=$this->user_model->count();
        $i=rand(0,$usernum-1);
        $money=rand(1,50)*100;
        $data['money']=$money;
        $data['user_login'] = $user[$i][user_login];
        $data['create_time'] = date('Y-m-d h:i:s',time());
        $res=M('get_help')->add($data);
        if ($res) {
            M('get_help')->where(array('id'=>$res))->save(array('old_id'=>$res,'old_money'=>$money));
            echo '添加成功';
        }
    }


    public function _initialize() {
        parent::_initialize();
        $this->user_model = D("Portal/User");
//        $this->money_record = M('MoneyRecord');
        $this->activation_code = M('ActivationCode');
        $this->all_record = M('AllRecord');
        $this->pdb = M('pdb');
        $this->award = M('Award');
        $this->assign("taxonomys", $this->taxonomys);
    }

    /**
     * 得到父节点
     * @param type $username
     */
    public function getParent1($username) {
        $where['user_login'] = $username;
        $res = $this->user_model->where($where)->field('parent_user')->find();
        if($res){
        $this->parent_arr[]=$res['parent_user'];
            $this->getParent1($res['parent_user']);
        }
    }
    public function getParentId($parrent_arr) {
        $j = count($parrent_arr) - 1;
        foreach ($parrent_arr as $key => $value) {
            $p = $this->getUserDetailByUname($parrent_arr[$j]);
            if ($p) {
                $arr[] = $p['id'];
            }
            $j--;
        }
        $ids_str = implode('-', $arr);
        return $ids_str;
    }
    
    public function insertPath() {
        $users = $this->user_model->select();
        foreach ($users as $key => $value) {
            $this->getParent1($value['user_login']);
            $ids = $this->getParentId($this->parent_arr);
            $this->parent_arr = array();
            if ($ids) {
                $path = "0-{$ids}-{$value['id']}";
                $p = $this->getUserDetailByUname($value['parent_user']);
                $parent = $p['id'];
            } else {
                $path = "0-{$value['id']}";
                $parent = 0;
            }
//            dump($path);分两次导入path parent
            $this->user_model->where(array('id' => $value['id']))->save(array('parent' => $parent));
        }
    }

    /**
     * 得到所有父节点 通过$this->rule->parent_arr接收返回值
     * @param type $user
     * @param type $level
     * @return type
     */
//    public function getAllParent($user) {
//        $user_arr = $this->getParent1($user);
//        dump($user_arr);
//        if (!empty($user_arr)) {
//           $aa= $this->getAllParent($user_arr['parent_user']);
//           dump($aa);
//           
//        }
//    }

//    public function getAllParentUsername($user) {
//        $this->getAllParent($user, 0);
//        $res = $this->parent_arr;
//        foreach ($res as $key => $value) {
//            foreach ($value as $k => $v) {
//                if($v[0]['ue_accname']){
//                $arr[$k] = $v[0]['ue_accname'];
//                }
//            }
//        }
//        return $arr;
//    }
    
    

    function index() {
        $where3=array();
        if(I('get.fhy')==1){
            $fhyts=$_SESSION['fhyts'];
            $where3['tgbztime']=array('lt',date('Y-m-d 00:00:00',strtotime('-'.$fhyts.' days')));
        }  
        $count = $this->user_model->where($where3)->count();
        $page = $this->page($count, 20);
        $users = $this->user_model->where($where3)
                ->order(array("id" => "asc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();
        foreach ($users as $key => $value) {
            $parent = $this->getParent($value['parent']);
            if ($parent) {
                $users[$key]['parent_user'] = $parent['user_login'];
            }
        }
        $this->assign('users', $users);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function soUser() {
        if (I('post.user_status') != -1) {
            $where['user_status'] = I('post.user_status');
        }
        if (I('post.user_login')) {
            $where['user_login'] = I('post.user_login');
        }
        if (IS_POST) {
            session('swhere', $where);
        }
        $this->assign('user_status', I('post.user_status'));
        if (I('get.p')) {
            $where = session('swhere');
            $this->assign('user_status', $where['user_status']);
            $count = $this->user_model
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $users = $this->user_model
                    ->where($where)
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($users as $key => $value) {
                $parent = $this->getParent($value['parent']);
                if ($parent) {
                    $users[$key]['parent_user'] = $parent['user_login'];
                }
            }
        } else {
            $count = $this->user_model
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $users = $this->user_model
                    ->where($where)
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($users as $key => $value) {
                $parent = $this->getParent($value['parent']);
                if ($parent) {
                    $users[$key]['parent_user'] = $parent['user_login'];
                }
            }
        }
        $this->assign('users', $users);
        $this->assign("page", $page->show('Admin'));
        $this->display('index');
    }

    public function getParent($pid) {
        $user = $this->user_model->where(array('id' => $pid))->find();
        return $user;
    }

    /**
     * 金币赠送
     */
    public function editMoney() {
        $where['type']='systerm';
        $count = $this->all_record->where($where)->count();
        $page = $this->page($count, 20);
        $record = $this->all_record
                ->where($where)
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();

        $this->assign('record', $record);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function editMoneyPost() {
        $wallet = I('post.wallet');
        $user_login = I('post.user_login');
        $number = I('post.number');
        $data = I('post.');
        $data['create_time'] = $this->time;
        $data['type'] = 'systerm';
        $data['wallet'] = $wallet;
        $data['notice'] = '系统操作';
        if ($user_login && $number > 0) {
            $user = $this->getUserDetailByUname($user_login);
            if (empty($user)) {
                $this->error('用户名不存在。。');
            }
            $type = I('post.type');
            if ($type == 1) {//赠送
                $data['number'] = "+{$number}";
                $this->all_record->add($data);
                $res = $this->user_model->where(array('user_login' => $user_login))->setInc($wallet, $number);
            } elseif ($type == 2) {//扣除
                $data['number'] = "-{$number}";
                $this->all_record->add($data);
                $res = $this->user_model->where(array('user_login' => $user_login))->setDec($wallet, $number);
            }
            if ($res) {
                $this->success('操作成功');
            } else {
                $this->error('操作失败');
            }
        } else {
            $this->error('参数错误。。');
        }
    }

    public function addRecord($uname, $type, $num, $notice) {
        $data['user_login'] = $uname;
        $data['type'] = $type;
        $data['number'] = $num;
        $data['notice'] = $notice;
        $data['create_time'] = $this->time;
        $this->all_record->add($data);
    }

    public function getUserDetailByUname($uname) {
        $res = $this->user_model->where(array('user_login' => $uname))->find();
        return $res;
    }

    protected function getChild($uid) {

        $me = $this->user_model->where(array('id' => $uid))->find();
        $child = $this->user_model->where(array('path' => array('LIKE', "%-{$me['id']}-%")))
                ->select();
        $child[] = $me;
        return $child;
    }

    /**
     * 会员关系
     */
    public function relationship() {

        $user_login = I('get.user_login');
        if ($user_login) {
            $user = $this->getUserDetailByUname($user_login);
            $uid = $user['id'];
        }
        $user_id = I('get.id');
        if ($user_id) {
            $uid = $user_id;
        }
        $status[0]='正常';
        $status[1]='封号';
        if ($uid) {
            $res = $this->getChild($uid);
            foreach ($res as $key => $value) {
                $res[$key]['id'] = $value['id'];
                $res[$key]['pId'] = $value['parent'];
                $res[$key]['name'] = "{$value['user_login']} 状态：{$status[$value['user_status']]}  姓名：{$value['true_name']} 联系方式：{$value['mobile']}";
            }
            //        header('Content-Type:application/json; charset=utf-8');
            $res = json_encode($res);
            $this->assign('treeNodes', $res);
        }
        $this->display();
    }

    function edit() {
        $id = intval(I("get.id"));
        $user = $this->user_model->find($id);
        $parent = $this->user_model->find($user['parent']);
        $user['parent_user'] = $parent['user_login'];
        $this->assign('post', $user);
        $this->display();
    }

    function edit_post() {
        if (IS_POST) {
            $data = I('post.');
            $password = I('post.user_pass');
            $two_password = I('post.user_two_pass');
            $user_status = I('post.user_status');
            $user = $this->user_model->where(array('id' => I('post.id')))->find();
            if ($user_status == 0) {
                $data['disable_notice'] = "系统操作";
            }
            if ($password!=$user['user_pass']) {
                $data['user_pass'] = md5($data['user_pass']);
            }
            if ($two_password!=$user['user_two_pass']) {
                $data['user_two_pass'] = md5($data['user_two_pass']);
            }
            foreach($data as $key=>$one){
                if(!$one){
                    unset($data[$key]);
                }
            }
            $res = $this->user_model->where(array('id' => I('post.id')))->save($data);
            if ($res) {
                $this->success("修改成功！");
            } else {
                $this->error('修改失败');
            }
        }
    }

    //排序
    public function listorders() {
        $status = parent::_listorders($this->user_model);
        if ($status) {
            $this->success("排序更新成功！");
        } else {
            $this->error("排序更新失败！");
        }
    }

    /**
     *  删除
     */
    public function delete() {
        $id = intval(I("get.id"));
        $count = $this->user_model->where(array("parent" => $id))->count();

        if ($count > 0) {
            $this->error("该会员下还有子类，无法删除！");
        }

        if ($this->user_model->delete($id) !== false) {
            $this->success("删除成功！");
        } else {
            $this->error("删除失败！");
        }
    }

    /*
     * 激活码
     */

    public function activationCode() {
        $count = $this->activation_code->count();
        $page = $this->page($count, 20);
        $record = $this->activation_code
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();

        $this->assign('record', $record);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }
/*
 * 生成激活码
 */
    public function makeActivationCode() {
        if (IS_POST) {
            $user_login = I('post.user_login');
            $res = $this->getUserDetailByUname($user_login);
            if (empty($res)) {
                $this->error('用户不存在！');
            }
            $number = I('post.number');
            $ok = 0;
            for ($i = 0; $i < $number; $i++) {
                $pin = md5(sprintf("%0" . strlen(9) . "d", mt_rand(0, 99999999999)));
                //$pin=0;
                if (!$this->activation_code->where(array('activation_code' => $pin))->find()) {
                    $data['user_login'] = $user_login;
                    $data['activation_code'] = $pin;
                    $data['create_time'] = $this->time;
                    if ($this->activation_code->add($data)) {
                        $ok++;
                    }
                }
            }
            if ($ok > 0) {
                $this->success("操作成功,生成{$ok}个激活码。");
            } else {
                $this->error('操作失败');
            }
        } else {
            $this->display();
        }
    }
/**
 * 删除激活码
 */
    public function deleteCode() {
        $id = I('get.id');
        $res = $this->activation_code->delete($id);
        if ($res) {
            $this->success('操作成功');
        } else {
            $this->error('操作失败');
        }
    }
    
    /*
     * 排单币管理
     */

    public function pdb() {
        $count = $this->pdb->count();
        $page = $this->page($count, 20);
        $record = $this->pdb
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();

        $this->assign('record', $record);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }
    /*
     * 生成排单币
     */
    public function makePdb() {
        if (IS_POST) {
            $user_login = I('post.user_login');
            $res = $this->getUserDetailByUname($user_login);
            if (empty($res)) {
                $this->error('用户不存在！');
            }
            $number = I('post.number');
            $ok = 0;
            for ($i = 0; $i < $number; $i++) {
                $pin = md5(sprintf("%0" . strlen(9) . "d", mt_rand(0, 99999999999)));
                //$pin=0;
                if (!$this->pdb->where(array('activation_code' => $pin))->find()) {
                    $data['user_login'] = $user_login;
                    $data['activation_code'] = $pin;
                    $data['create_time'] = $this->time;
                    if ($this->pdb->add($data)) {
                        $ok++;
                    }
                }
            }
            if ($ok > 0) {
                $this->success("操作成功,生成{$ok}个排单币。");
            } else {
                $this->error('操作失败');
            }
        } else {
            $this->display();
        }
    }
    /*
     * 删除排单币
     */
    public function deletePdb() {
        $id = I('get.id');
        $res = $this->pdb->delete($id);
        if ($res) {
            $this->success('操作成功');
        } else {
            $this->error('操作失败');
        }
    }
    /*
     * 排单币查找
     */
    public function soPdb() {
        $user_login = I('post.user_login');
        $where['user_login'] = $user_login;
        $count = $this->pdb->where($where)->count();
        $page = $this->page($count, 20);
        $record = $this->pdb
                ->where($where)
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();

        $this->assign('record', $record);
        $this->assign("page", $page->show('Admin'));
        $this->display('pdb');
    }

    /*
     * 激活码查找
     */
    
    public function soCode() {
        $user_login = I('post.user_login');
        $where['user_login'] = $user_login;
        $count = $this->activation_code->where($where)->count();
        $page = $this->page($count, 20);
        $record = $this->activation_code
                ->where($where)
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();

        $this->assign('record', $record);
        $this->assign("page", $page->show('Admin'));
        $this->display('activationCode');
    }

    public function disable() {
        $id = I('get.id');
        $data['user_status'] = 1;
        $data['disable_notice'] = "系统操作";
        $res = $this->user_model->where(array('id' => $id))->save($data);
        if ($res) {
            $this->success('操作成功');
        } else {
            $this->error('操作失败');
        }
    }
    
    public function disableByDays() {
        $days = I('post.days');
        if (!$days) {
            $this->error('请输入天数');
        }
        $user = $this->user_model->where(array('user_status' => 0))->field('user_login')->select();
        $rule = new rule();
        $i = 0;
        foreach ($user as $key => $value) {
            $res = $this->provide_help->where(array('user_login' => $value['user_login']))->field('create_time,user_login')->order('id desc')->find();
            if ($res) {
                $diffDays = $rule->differenceDays($res['create_time'], $this->time);
                if ($days < $diffDays) {
                    $data['user_status'] = 1;
                    $data['disable_notice'] = "违反制度";
                    $res = $this->user_model->where(array('user_login' => $value['user_login']))->save($data);
                    $i++;
                }
            }
        }
        $this->success("停封账号{$i}个");
    }

    public function unDisable() {
        $id = I('get.id');
        $data['user_status'] = 0;
        $data['disable_notice'] = "";
        $res = $this->user_model->where(array('id' => $id))->save($data);
        if ($res) {
            $this->success('操作成功');
        } else {
            $this->error('操作失败');
        }
    }
    /*
     * 激活
     */
    public function activation() {
        $id = I('get.id');
        $data['user_status'] = 0;
        $res = $this->user_model->where(array('id' => $id))->save($data);
        if ($res) {
            $this->success('操作成功');
        } else {
            $this->error('操作失败');
        }
    }

    public function dologin() {

        $id=I('get.id');
        $result = $this->user_model->where(array('id'=>$id))->find();
        session('uid', $result["id"]);
        session('user_login', $result["user_login"]);
        session('user', $result);
        cookie("user_login", $name, 3600 * 24 * 30);
        header('Location: /farm/farm.html?uid='.$result["id"].'&token='.md5(md5($result["id"].'zmm').'zmm'));
 
    }
    /**
     * 大转盘
     */
    public function turntable() {
        if (IS_POST) {
            $user_login = I('post.user_login');
            $award_id = I('post.award_id');
            $this->assign('award_id', $award_id);
            if ($user_login) {
                $where['user_login'] = $user_login;
            }
            if ($award_id) {
                $where['award_id'] = $award_id;
            }
            session('awhere', $where);
            $count = $this->award->where($where)->count();
            $page = $this->page($count, 20);
            $record = $this->award
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            $this->assign('record', $record);
            $this->assign("page", $page->show('Admin'));
            $this->display();
        }elseif (session('awhere')) {
            $where = session('awhere');
            $count = $this->award->where($where)->count();
            $page = $this->page($count, 20);
            $record = $this->award
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            $this->assign('record', $record);
            $this->assign("page", $page->show('Admin'));
            $this->display();
        } else {
            $count = $this->award->count();
            $page = $this->page($count, 20);
            $res = $this->award
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            $this->assign('record', $res);
            $this->assign("page", $page->show('Admin'));
            $this->display();
        }
    }

    /*
     * 删除
     */
    public function deleteAward() {
        $id = I('get.id');
        $res=$this->award->where(array('id'=>$id))->delete();
        if($res){
            $this->success('删除成功');
        }
    }
    
    public function giveAward() {
        $id = I('get.id');
        $res = $this->award->where(array('id' => $id))->save(array('status'=>1));
        if ($res) {
            $this->success('已派发');
        }
    }

}
