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

class AdminOrderController extends AdminbaseController {

    protected $user_model;
    protected $activation_code;
    protected $all_record;
    protected $provide_help;
    protected $get_help;
    protected $match;

    function _initialize() {
        parent::_initialize();
        $this->user_model = D("Portal/User");
        $this->activation_code = M('ActivationCode');
        $this->all_record = M('AllRecord');
        $this->provide_help = M('ProvideHelp');
        $this->get_help = M('GetHelp');
        $this->match = M('match'); //订单匹配
    }

    /*
     * 提供帮助 
     */

    public function provideHelp() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $status = I('post.status');
            $user_login = I('post.user_login');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " money >0 ";
            if ($status == 1 || $status == 0) {
                $where.=" and status={$status}";
            }
            if ($user_login) {
                $where.=" and user_login='{$user_login}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            session('pwhere', $where);
            session('pFormget', $_POST);
            $count = $this->provide_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        }
         elseif (I('get.p')&&  session('pwhere')) {
            $where=  session('pwhere');
            $this->assign('formget', session('pFormget'));
            $count = $this->provide_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where($where)
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
            
        } else {
            session('pwhere', NULL);
            session('pFormget', NULL);
            $where['status']=0;
            $count = $this->provide_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        }
        $sum = $this->getAllProvide();
        $this->assign('sum', $sum);
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function getAllProvide() {
        $all = $this->provide_help->sum('money');
        $no = $this->provide_help->where(array('confirm_status' => 0))->sum('money');
        $yes = $this->provide_help->where(array('confirm_status' => 1))->sum('money');
        $wait = $this->provide_help->where(array('status' => 0))->sum('money');
        $sum['all'] = $all;
        $sum['yes'] = $yes;
        $sum['no'] = $no;
        $sum['wait'] = $wait;
        foreach ($sum as $key => $value) {
            if (!$value) {
                $sum[$key] = 0;
            }
        }
        return $sum;
    }

    public function provideDelete() {
        $id = I('get.id');
        $res = $this->provide_help->delete($id);
        if ($res) {
            $this->success('操作成功。');
        } else {
            $this->error('操作失败');
        }
    }

    public function getDelete() {
        $id = I('get.id');
        $res = $this->get_help->delete($id);
        if ($res) {
            $this->success('操作成功。');
        } else {
            $this->error('操作失败');
        }
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

    /*
      // 显示接受帮助列表
     * 
     */

    public function getHelpList() {
        if (IS_POST) {
            $gid = I('post.id'); //接受帮助订单ID
            $pid = session('pid');
            session('pid', '');
            session('provide_user', NULL);
            if (!$gid || !$pid) {
                $this->error('匹配失败,缺少数据');
            }
            //等额匹配
            $provide_order = $this->provide_help->find($pid);
            $get_order = $this->get_help->find($gid[0]);
            if (count($gid) == 1 && $provide_order['money'] == $get_order['money']) {
                $res = $this->__orderMatch($pid, $gid[0]);
                if ($res) {
                    $this->success('匹配成功', U('AdminOrder/provideHelp'));
                } else {
                    $this->error('匹配失败,金额不相等');
                }
            } else {//差额匹配 需要拆分订单
                $ids = implode(',', $gid);
                $where['id'] = array('in', $ids);
                $sum_money = $this->get_help->where($where)->sum('money');
                if ($sum_money != $provide_order['money']) {
                    $this->error('匹配失败,金额不相等');
                }
                $f = 0;
                foreach ($gid as $key => $value) {
                    $old_id = $provide_order['id'];
                    $old_money = $provide_order['money'];
                    if ($provide_order['old_id'] > 0) {
                        $old_id = $provide_order['old_id'];
                    }
                    if ($provide_order['old_money'] > 0) {
                        $old_money = $provide_order['old_money'];
                    }
                    $sub_order = $this->get_help->find($value);
                    $data = $provide_order;
                    array_splice($data, 0, 1);
                    $data['money'] = $sub_order['money'];
                    $data['old_id'] = $old_id;
                    $data['old_money'] = $old_money;
                    $res = $this->provide_help->add($data);
                    if ($res) {
                        $f++;
                    }
                    $this->__orderMatch($res, $value);
                }
                //删除旧订单
                $this->provide_help->delete($provide_order['id']);
                if ($f == count($gid)) {
                    $this->success("匹配成功，拆分成{$f}条订单", U('AdminOrder/provideHelp'));
                } else {
                    $this->error('匹配失败');
                }
            }
        } else {
            $pid = I('get.pid');
            session('pid', $pid); //提供帮助订单ID
            $provide_money = $this->provide_help->find($pid);
            $this->assign('money', $provide_money['money']);
            $where['money'] = array('elt', $provide_money['money']);
            $where['status'] = 0;
            $where['user_login'] = array('neq', $provide_money['user_login']);
            session('provide_user', $provide_money['user_login']);

            $count = $this->get_help
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename'] && !empty($user)) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
            $this->assign('posts', $posts);
            $this->assign("page", $page->show('Admin'));
            $this->display();
        }
    }

    /*
      // 显示提供帮助列表
     * 
     */

    public function provideHelpList() {
        if (IS_POST) {
            $pid = I('post.id'); //接受帮助订单ID
            $gid = session('gid');
            session('gid', '');
            if (!$gid || !$pid) {
                $this->error('匹配失败,缺少数据');
            }
            //等额匹配
            $get_order = $this->get_help->find($gid);
            $provide_order = $this->provide_help->find($gid[0]);
            if (count($pid) == 1 && $get_order['money'] == $provide_order['money']) {
                $res = $this->__orderMatch($pid[0], $gid);
                if ($res) {
                    $this->success('匹配成功', U('AdminOrder/provideHelp'));
                } else {
                    $this->error('匹配失败,金额不相等');
                }
            } else {//差额匹配 需要拆分订单
                $ids = implode(',', $pid);
                $where['id'] = array('in', $ids);
                $sum_money = $this->provide_help->where($where)->sum('money');
                if ($sum_money != $get_order['money']) {
                    $this->error('匹配失败,金额不相等');
                }
                $f = 0;
                foreach ($pid as $key => $value) {
                    $old_id = $get_order['id'];
                    $old_money = $get_order['money'];
                    if ($get_order['old_id'] > 0) {
                        $old_id = $get_order['old_id'];
                    }
                    if ($get_order['old_money'] > 0) {
                        $old_money = $get_order['old_money'];
                    }
                    $sub_order = $this->provide_help->find($value);
                    $data = $get_order;
                    array_splice($data, 0, 1);
                    $data['money'] = $sub_order['money'];
                    $data['old_id'] = $old_id;
                    $data['old_money'] = $old_money;
                    $res = $this->get_help->add($data);
                    if ($res) {
                        $f++;
                    }
                    $this->__orderMatch($value, $res);
                }
                //删除旧订单
                $this->get_help->delete($get_order['id']);
                if ($f == count($pid)) {
                    $this->success("匹配成功，拆分成{$f}条订单", U('AdminOrder/provideHelp'));
                } else {
                    $this->error('匹配失败');
                }
            }

        } else {
            $gid = I('get.gid');
            session('gid', $gid); //提供帮助订单ID
            $get_money = $this->get_help->find($gid);
            $this->assign('money', $get_money['money']);
            $where['money'] = array('elt', $get_money['money']);
            $where['status'] = 0;
            $where['user_login'] = array('neq', $get_money['user_login']);
            $count = $this->provide_help
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename'] && !empty($user)) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
            $this->assign('posts', $posts);
            $this->assign("page", $page->show('Admin'));
            $this->display();
        }
    }

    /*
     * 提供拆分
     */

    public function provideSplit() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $status = I('post.status');
            $user_login = I('post.user_login');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " money >0 and status=0 ";

            if ($user_login) {
                $where.=" and user_login='{$user_login}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            $count = $this->provide_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        } else {

            $count = $this->provide_help
                    ->where(array('status' => 0))
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->provide_help
                    ->where(array('status' => 0))
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        }
        $sum = $this->getAllProvide();
        $this->assign('sum', $sum);
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function provideSplitPost() {
        $split_money = I('post.split_money');
        $flag = 0;
        foreach ($split_money as $key => $value) {
            if ($value) {
                $split = explode('+', $value);
                $provide_order = $this->provide_help->find($key); //拆分前订单
                $old_id = $provide_order['id'];
                $old_money = $provide_order['money'];
                if ($provide_order['old_id'] > 0) {
                    $old_id = $provide_order['old_id'];
                }
                if ($provide_order['old_money'] > 0) {
                    $old_money = $provide_order['old_money'];
                }
                if (array_sum($split) == $provide_order['money']) {
                    foreach ($split as $kk => $vv) {
                        $f = 0;
//                        $data['user_login']=$provide_order['user_login'];
//                        $data['is_bank_pay']=$provide_order['is_bank_pay'];
//                        $data['is_alipay_pay']=$provide_order['is_alipay_pay'];
//                        $data['is_weixin_pay']=$provide_order['is_weixin_pay'];
//                        $data['create_time']=$provide_order['create_time'];
//                        $data['status']=$provide_order['status'];
//                        $data['confirm_status']=$provide_order['confirm_status'];
                        $data = $provide_order;
                        array_splice($data, 0, 1);
                        $data['money'] = $vv;
                        $data['old_id'] = $old_id;
                        $data['old_money'] = $old_money;
                        $res = $this->provide_help->add($data);
                        if (!$res) {
                            $f = 1;
                        }
                    }
                    if ($f == 0) {
                        $flag++;
                    }
                    $this->provide_help->delete($provide_order['id']);
                } else {
                    $this->error('拆分金额不相等', U('AdminOrder/provideSplit'));
                }
            }
        }
        if ($flag > 0) {
            $this->success("操作成功：拆分{$flag}条订单。");
        } else {
            $this->error('拆分失败。');
        }
    }

    /*
     * 接受拆分
     */

    public function getSplit() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $status = I('post.status');
            $user_login = I('post.user_login');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " money >0 and status=0 ";

            if ($user_login) {
                $where.=" and user_login='{$user_login}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            $count = $this->get_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        } else {

            $count = $this->get_help
                    ->where(array('status' => 0))
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where(array('status' => 0))
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename']) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        }
        $sum = $this->getAllProvide();
        $this->assign('sum', $sum);
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    /*
     * 接受帮助数据提交
     */

    public function getHelpSplitPost() {
        $split_money = I('post.split_money');
        $flag = 0;
        foreach ($split_money as $key => $value) {
            if ($value) {
                $split = explode('+', $value);
                $order = $this->get_help->find($key); //拆分前订单
                $old_id = $order['id'];
                $old_money = $order['money'];
                if ($order['old_id'] > 0) {
                    $old_id = $order['old_id'];
                }
                if ($order['old_money'] > 0) {
                    $old_money = $order['old_money'];
                }
                if (array_sum($split) == $order['money']) {
                    foreach ($split as $kk => $vv) {
                        $f = 0;
//                        $data['user_login']=$order['user_login'];
//                        $data['is_bank_pay']=$order['is_bank_pay'];
//                        $data['is_alipay_pay']=$order['is_alipay_pay'];
//                        $data['is_weixin_pay']=$order['is_weixin_pay'];
//                        $data['create_time']=$order['create_time'];
//                        $data['status']=$order['status'];
//                        $data['confirm_status']=$order['confirm_status'];
                        $data = $order;
                        array_splice($data, 0, 1);
                        $data['money'] = $vv;
                        $data['old_id'] = $old_id;
                        $data['old_money'] = $old_money;
                        $res = $this->get_help->add($data);
                        if (!$res) {
                            $f = 1;
                        }
                    }
                    if ($f == 0) {
                        $flag++;
                    }
                    $this->get_help->delete($order['id']);
                } else {
                    $this->error('拆分金额不相等', U('AdminOrder/getSplit'));
                }
            }
        }
        if ($flag > 0) {
            $this->success("操作成功：拆分{$flag}条订单。");
        } else {
            $this->error('拆分失败。');
        }
    }

    public function getHelpListSearch() {
        $this->assign('formget', $_POST);
        $user_login = I('post.user_login');
        $start_time = I('post.start_time');
        $end_time = I('post.end_time');
        $where = " money >0 and status=0 ";
        if ($user_login) {
            $where.=" and user_login='{$user_login}'";
        }
        if ($start_time) {
            $where.=" and create_time >= '{$start_time}'";
        }
        if ($end_time) {
            $where.=" and create_time <= '{$end_time}'";
        }
        $count = $this->get_help->where($where)->count();
        $page = $this->page($count, 20);
        $posts = $this->get_help
                ->where($where)
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();
        foreach ($posts as $key => $value) {
            $user = $this->getUserDetailByUname($value['user_login']);
            if ($user['user_nicename'] && !empty($user)) {
                $posts[$key]['user_nicename'] = $user['user_nicename'];
            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display('getHelpList');
    }

    public function provideHelpListSearch() {
        $this->assign('formget', $_POST);
        $user_login = I('post.user_login');
        $start_time = I('post.start_time');
        $end_time = I('post.end_time');
        $where = " money >0 and status=0 ";
        if ($user_login) {
            $where.=" and user_login='{$user_login}'";
        }
        if ($start_time) {
            $where.=" and create_time >= '{$start_time}'";
        }
        if ($end_time) {
            $where.=" and create_time <= '{$end_time}'";
        }
        $count = $this->provide_help->where($where)->count();
        $page = $this->page($count, 20);
        $posts = $this->provide_help
                ->where($where)
                ->order(array("id" => "desc"))
                ->limit($page->firstRow, $page->listRows)
                ->select();
        foreach ($posts as $key => $value) {
            $user = $this->getUserDetailByUname($value['user_login']);
            if ($user['user_nicename'] && !empty($user)) {
                $posts[$key]['user_nicename'] = $user['user_nicename'];
            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display('getHelpList');
    }

    /*
     * 接受帮助
     */

    public function getHelp() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $status = I('post.status');
            $user_login = I('post.user_login');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " money >0 ";
            if ($status == 1 || $status == 0) {
                $where.=" and status={$status}";
            }
            if ($user_login) {
                $where.=" and user_login='{$user_login}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            session('gwhere', $where);
            session('gFormget', $_POST);
            $count = $this->get_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where($where)
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename'] && !empty($user)) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        } elseif (I('get.p')&&  session('gwhere')) {
            $where=  session('gwhere');
            $this->assign('formget', session('gFormget'));
            $count = $this->get_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where($where)
                    ->order(array("id" => "asc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename'] && !empty($user)) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        } else {
            session('gwhere', NULL);
            session('gFormget', NULL);
            $where['status']=0;
            $count = $this->get_help->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->get_help
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
            foreach ($posts as $key => $value) {
                $user = $this->getUserDetailByUname($value['user_login']);
                if ($user['user_nicename'] && !empty($user)) {
                    $posts[$key]['user_nicename'] = $user['user_nicename'];
                }
            }
        }
        $sum = $this->getAllGet();
        $this->assign('sum', $sum);
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function getAllGet() {
        $all = $this->get_help->sum('money');
        $no = $this->get_help->where(array('confirm_status' => 0))->sum('money');
        $yes = $this->get_help->where(array('confirm_status' => 1))->sum('money');
        $wait= $this->get_help->where(array('status' => 0))->sum('money');
        $sum['all'] = $all;
        $sum['yes'] = $yes;
        $sum['no'] = $no;
        $sum['wait'] = $wait;
        foreach ($sum as $key => $value) {
            if (!$value) {
                $sum[$key] = 0;
            }
        }
        return $sum;
    }

    /*
     * 自动匹配
     */

    public function autoMatch() {
        $this->success('暂未开放');
    }

    public function getParent($pid) {
        $user = $this->user_model->where(array('id' => $pid))->find();
        return $user;
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

    /**
     * 交易中的订单
     */
    public function trading() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $provide_user = I('post.provide_user');
            $get_user = I('post.get_user');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " status < 2 ";

            if ($provide_user) {
                $where.=" and provide_user ='{$provide_user}'";
            }
            if ($get_user) {
                $where.=" and get_user ='{$get_user}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            $count = $this->match->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        } else {
            $where['status'] = array('neq', 2);
            $count = $this->match
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    /*
     * 删除交易中的订单
     */

    public function orderDelete() {
        $id = I('get.id');
        $res = $this->match->where(array('id' => $id))->delete();
        if ($res) {
            $this->success('删除成功');
        } else {
            $this->error('删除失败');
        }
    }

    /*
     * 交易完成的订单
     */

    public function tradeSuccess() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $provide_user = I('post.provide_user');
            $get_user = I('post.get_user');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " status = 2 ";

            if ($provide_user) {
                $where.=" and provide_user ='{$provide_user}'";
            }
            if ($get_user) {
                $where.=" and get_user ='{$get_user}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            $count = $this->match->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        } else {
            $where['status'] = array('eq', 2);
            $count = $this->match
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    /*
     * 重新匹配
     */

    public function anewMatch() {
        $order_id = I('get.id');
        $order = $this->match->where(array('id' => $order_id))->find(); //匹配订单
        $provide_order_id = $order['pid'];
        $get_help_order_id = $order['gid'];
        $data['status'] = 0; //恢复匹配
        $p_res = $this->provide_help->where(array('id' => $provide_order_id))->save($data);
        $g_res = $this->get_help->where(array('id' => $get_help_order_id))->save($data);
        if ($p_res == 1 && $g_res == 1) {
            $this->match->where(array('id' => $order_id))->delete();
            $this->success('重新匹配成功');
        } else {
            $provide_help_order = $this->provide_help->where(array('id' => $provide_order_id))->find();
            $get_help_order = $this->get_help->where(array('id' => $get_help_order_id))->find();
            $data1['status'] = $provide_help_order['status'];
            $data1['confirm_status'] = $provide_help_order['confirm_status'];
            $p_res = $this->provide_help->where(array('id' => $provide_order_id))->save($data1);
            $data2['status'] = $get_help_order['status'];
            $data2['confirm_status'] = $get_help_order['confirm_status'];
            $g_res = $this->get_help->where(array('id' => $get_help_order_id))->save($data2);
            $this->error('操作失败');
        }
    }

    /*
     * 超时未打款
     */

    public function timeoutPay() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $provide_user = I('post.provide_user');
            $get_user = I('post.get_user');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');

            $out_time = time() - ($this->bonus['pay_time'] * 3600);
            $time_out = date('Y-m-d H:i:s', $out_time);
            $where = " status =0 and create_time < '{$time_out}'";

            if ($provide_user) {
                $where.=" and provide_user ='{$provide_user}'";
            }
            if ($get_user) {
                $where.=" and get_user ='{$get_user}'";
            }
//            if ($start_time) {
//                $where.=" and create_time >= '{$start_time}'";
//            }
//            if ($end_time) {
//                $where.=" and create_time <= '{$end_time}'";
//            }
            $count = $this->match->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        } else {
//            $where['status'] = array('eq', 0);
            $out_time = time() - ($this->bonus['pay_time'] * 3600);
            $time_out = date('Y-m-d H:i:s', $out_time);
            $where = " status =0 and create_time < '{$time_out}'";
            $count = $this->match
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    /*
     * 未收到款 
     */

    public function timeoutGathering() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $provide_user = I('post.provide_user');
            $get_user = I('post.get_user');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $out_time = time() - ($this->bonus['income_time'] * 3600);
            $time_out = date('Y-m-d H:i:s', $out_time);
            $where = " status =1 and pay_time < '{$time_out}'";

            if ($provide_user) {
                $where.=" and provide_user ='{$provide_user}'";
            }
            if ($get_user) {
                $where.=" and get_user ='{$get_user}'";
            }
//            if ($start_time) {
//                $where.=" and create_time >= '{$start_time}'";
//            }
//            if ($end_time) {
//                $where.=" and create_time <= '{$end_time}'";
//            }
            $count = $this->match->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        } else {
//            $where['status'] = array('eq', 1);
            $out_time = time() - ($this->bonus['income_time'] * 3600);
            $time_out = date('Y-m-d H:i:s', $out_time);
            $where = " status =1 and pay_time < '{$time_out}'";
            $count = $this->match
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
//            foreach ($posts as $key => $value) {
//                $user = $this->getUserDetailByUname($value['user_login']);
//                if ($user['user_nicename'] && !empty($user)) {
//                    $posts[$key]['user_nicename'] = $user['user_nicename'];
//                }
//            }
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

    public function complainOrder() {
        if (IS_POST) {
            $this->assign('formget', $_POST);
            $provide_user = I('post.provide_user');
            $get_user = I('post.get_user');
            $start_time = I('post.start_time');
            $end_time = I('post.end_time');
            $where = " is_complain =1 ";

            if ($provide_user) {
                $where.=" and provide_user ='{$provide_user}'";
            }
            if ($get_user) {
                $where.=" and get_user ='{$get_user}'";
            }
            if ($start_time) {
                $where.=" and create_time >= '{$start_time}'";
            }
            if ($end_time) {
                $where.=" and create_time <= '{$end_time}'";
            }
            $count = $this->match->where($where)->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
        } else {
            $where['is_complain'] = array('eq', 1);
            $count = $this->match
                    ->where($where)
                    ->count();
            $page = $this->page($count, 20);
            $posts = $this->match
                    ->where($where)
                    ->order(array("id" => "desc"))
                    ->limit($page->firstRow, $page->listRows)
                    ->select();
        }
        $this->assign('posts', $posts);
        $this->assign("page", $page->show('Admin'));
        $this->display();
    }

}
