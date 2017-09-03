<?php
use Workerman\Worker;
require_once __DIR__ .'/workman/Autoloader.php';
error_reporting(E_ALL & ~E_NOTICE);
ini_set('date.timezone','Asia/Shanghai');
//包含数据库操作类文件
include 'mysql.class.php';
$hostname='localhost';
$username='root';
$password='';
$dbname='jiufu';
$charset = 'utf8';
$url="http://test.jiufu.com/";
$db = new Mysql($hostname,$username,$password,$dbname); 
ouput("读取配置");
$worker = new Worker('websocket://0.0.0.0:8181');
$worker->onWorkerStart = function($worker)
{	
	ouput('程序开始运行');
};
$worker->onConnect = function($connection)
{
    ouput("新的链接ip为 " .$connection->getRemoteIp());
};
$worker->onMessage = function($connection, $data)
{	
    print_r($data);
	try {
        global $db;
        global $url;
        $bonussql=$db->getOne("select * from jz_options where option_name='bonus'");
        $bonus=json_decode($bonussql['option_value'],true);
        $bonus['url']=$url;
        $extractsql=$db->getOne("select * from jz_options where option_name='extract'");
        $extract=json_decode($extractsql['option_value'],true);
        $data2=json_decode($data,true);
        $fyzym=array('login.html');
        if(!in_array($data2['act'], $fyzym)){
            if(!$bonus['wz_status']==0){
                loginout($bonus['yuanyin']);
            }
            if(time()<strtotime(date('Y-m-d '.$bonus['begin_time'].':00',time())) && time()>strtotime(date('Y-m-d '.$bonus['end_time'].':59',time()))){
                loginout('网站每日开启是时间为'.$bonus['begin_time'].'到'.$bonus['end_time']);
            }
            if($data2['salt']!=md5(md5($data2['userid'].'zmm').'zmm')){
                loginout('你还未登录，请登录后操作');
            }
            else{
                $user=$db->getOne("select * from jz_user where id='".$data2['userid']."' order by id desc limit 1");
                $money=$db->getOne("select sum(money+locked) as total,sum(lx+tq) as fertilize,sum(fm) as fengmi from jz_tree where user_login='".$user['user_login']."' order by id desc");
                $cmjl=$db->getOne("select sum(number) as total from jz_all_record where type='flyBee' and user_login='".$user['user_login']."' order by id desc");
                $tjrs=$db->getOne("select count(id) as total from jz_user where parent_user='".$user['user_login']."' order by id desc");
                $friend=$db->getOne("select count(id) as total from jz_friend where  zt=2 and user_login='".$user['user_login']."' order by id desc");
                $user['friend']=$friend['total'];
                $user['tjrs']=$tjrs['total'];
                $user['unreadNotice']=1;
                $user['unreadMsg']=1;
                $user['seed']=sprintf("%.2f",($money['total']+0));
                $user['total']= sprintf("%.2f",($money['total']+$user['money']));
                $user['fertilize']=sprintf("%.2f",($money['fertilize']+0));
                $user['fengmi']=sprintf("%.2f",($cmjl['total']+0));
                if(strtotime($user['waterauto'])>time()){
                    $user['onewater']=1;
                }
                if(strtotime($user['zzauto'])>time()){
                    $user['onezz']=1;
                }
                if(strtotime($user['cmauto'])>time()){
                    $user['onecm']=1;
                }
                if(strtotime($user['sfauto'])>time()){
                    $user['onesf']=1;
                }
                if(strtotime($user['shauto'])>time()){
                    $user['onesh']=1;
                }
            }
        }
        if($data2['act']=='yjcm'){
            //一键采蜜
            if(strtotime($user['cmauto'])<time()){
                    act('displayMessage',"一键采蜜到期，请联系客服续费");
            }
            $list=$db->getAll("select * from jz_user where parent_user='".$user['user_login']."' order by id desc");
            $count=0;
            foreach ($list as $key => $value) {
                    $user=$db->getOne("select * from jz_user where id='".$user['id']."' order by id desc limit 1");
                    $tree=$db->getAll("select * from jz_tree where user_login='".$value['user_login']."' order by id desc");
                    foreach ($tree as $key2 => $value2) {
                        if($value2['fengmi']!=0){
                            $map2['money']=$user['money']+$value2['fengmi'];
                            $count=$count+$value2['fengmi'];
                            $map['fengmi']=0;
                            $db->update('jz_tree',$map,'id='.$value2['id']);
                            $db->update('jz_user',$map2,'id='.$user['id']);
                            add_record($value['user_login'],'flyBee','采集'.$value['user_login'].$value2['num'].'号地','+'.($value2['fengmi']));
                        }
                    }
            }
             if($count==0){
                act('displayMessage',"一键采蜜完毕,不能再采蜜了");
            }
            else{
                act('displayMessage',"一键采蜜,共计采蜜".$count);
            }
        }
        if($data2['act']=='yjzz'){
            //一键增种
            if(strtotime($user['zzauto'])<time()){
                    act('displayMessage',"一键增种到期，请联系客服续费");
            }
            $tree=$db->getAll("select * from jz_tree where user_login='".$user['user_login']."' order by id desc");
            $treelist=array();
            foreach ($tree as $key => $value) {
                $treelist[$value[num]]=$value;
            }
            $money=$user['money'];
            $count=0;
            for($i=30;$i>0 && $money>0;$i--){
                if($treelist[$i]){
                    $map['money']=$treelist[$i]['money']+$money;
                    if($map['money']>$bonus['tree_kd'.$i]*$bonus['max_dividend_days']){
                        $map['money']=$bonus['tree_kd'.$i]*$bonus['max_dividend_days'];
                    }
                    $money=$money-($map['money']-$treelist[$i]['money']);
                    $count=$count+($map['money']-$treelist[$i]['money']);
                    $db->update('jz_tree',$map,'id='.$treelist[$i]['id']); 
                }
            }
            if($count==0){
                act('displayMessage',"一键增种完毕,不能再增种了");
            }
            else{
                $map2['money']=$user['money']-$count;
                $db->update('jz_user',$map2,'id='.$user['id']);
                act('displayMessage',"一键增种数量".$count);
            }
        }
        if($data2['act']=='yjsf'){
            //一键施肥
            if(strtotime($user['sfauto'])<time()){
                    act('displayMessage',"一键施肥到期，请联系客服续费");
            }
            $tree=$db->getAll("select * from jz_tree where user_login='".$user['user_login']."' order by id desc");
            $count=0;
            foreach ($tree as $key => $value) {
                if($value['lx']!=0 && $value['money']<$bonus['tree_kd'.$value['num']]*$bonus['max_dividend_days']){
                $map['money']=$value['money']+$value['lx']+$value['tq'];
                $count=$count+$value['lx']+$value['tq'];
                if($value['locked']+$map['money']>$bonus['tree_kd'.$value['num']]*$bonus['max_dividend_days']){
                    $map['money']=$bonus['tree_kd'.$value['num']]*$bonus['max_dividend_days']-$value['locked'];
                    if($map['money']-$value['money']>$map['lx']){
                        $map['lx']=0;
                        $map['tq']=$value['tq']-($map['money']-$value['money']-$map['lx']);
                    }
                    else{
                        $map['lx']=$value['lx']-($map['money']-$value['money']);
                    }
                }
                else{
                $map['lx']=0;
                $map['tq']=0;
                }
                $db->update('jz_tree',$map,'id='.$value['id']);
                add_record($user['user_login'],'fertilize',$value['num'].'号地','+'.($map['money']-$value['money']));
                }
            }
             if($count==0){
                act('displayMessage',"一键施肥完毕,不能再施肥了");
            }
            else{
            act('displayMessage',"一键施肥,总计施肥".$count);
            }
        }
        if($data2['act']=='yjsh'){
            //一键收获
            if(strtotime($user['shauto'])<time()){
                    act('displayMessage',"一键收获到期，请联系客服续费");
            }
            $tree=$db->getAll("select * from jz_tree where user_login='".$user['user_login']."' order by id desc");
            $count=0;
            foreach ($tree as $key => $value) {
                $user=$db->getOne("select * from jz_user where id='".$user['id']."' order by id desc limit 1");
                $map['money']=$bonus['tree_kd'.$value['num']];
                if($value['money']-$map['money']>0){
                $db->update('jz_tree',$map,'id='.$value['id']);
                $map2['money']=$user['money']+($value['money']-$map['money']);
                $count=$count+($value['money']-$map['money']);
                $db->update('jz_user',$map2,'id='.$user['id']);
                add_record($user['user_login'],'reap',$value['num'].'号地','+'.($value['money']-$map['money']));
                }
            }
            if($count==0){
                act('displayMessage',"一键收获完毕,不能获取更多金币了");
            }
            else{
            act('displayMessage',"一键收获,得到金币".$count);
            }
        }
        if($data2['act']=='SearchUserInfo'){
            //获取用户信息
            if($data2['selfid']){
                $userxx=$db->getOne("select * from jz_user where id='".$data2['selfid']."' order by id desc limit 1");
                $money=$db->getOne("select sum(money+locked) as total,sum(lx+tq) as fertilize,sum(fm) as fengmi from jz_tree where user_login='".$userxx['user_login']."' order by id desc");
                 $cmjl=$db->getOne("select sum(number) as total from jz_all_record where type='flyBee' and user_login='".$userxx['user_login']."' order by id desc");
                $tjrs=$db->getOne("select count(id) as total from jz_user where parent_user='".$userxx['user_login']."' order by id desc");
                $friend=$db->getOne("select count(id) as total from jz_friend where  zt=2 and user_login='".$userxx['user_login']."' order by id desc");
                $userxx['friend']=$friend['total'];
                $userxx['tjrs']=$tjrs['total'];
                $userxx['unreadNotice']=0;
                $userxx['unreadMsg']=0;
                $userxx['seed']=sprintf("%.2f",($money['total']+0));
                $userxx['total']= sprintf("%.2f",($money['total']+$userxx['money']));
                $userxx['fertilize']=sprintf("%.2f",($money['fertilize']+0));
                $userxx['fengmi']=sprintf("%.2f",($cmjl['total']+0));
                if(strtotime($userxx['waterauto'])>time()){
                    $userxx['onewater']=1;
                }
                if(strtotime($userxx['zzauto'])>time()){
                    $userxx['onezz']=1;
                }
                if(strtotime($userxx['cmauto'])>time()){
                    $userxx['onecm']=1;
                }
                if(strtotime($userxx['sfauto'])>time()){
                    $userxx['onesf']=1;
                }
                if(strtotime($userxx['shauto'])>time()){
                    $userxx['onesh']=1;
                }
            }
            else{
                $userxx=$user;
            }

            act('displayUserInfo',$userxx);
        }
        if($data2['act']=='SearchGround'){
            //获取农场地块信息
            $userxx=$db->getOne("select * from jz_user where id='".$data2['selfid']."' order by id desc limit 1");
            $tree=$db->getAll("select * from jz_tree where user_login='".$userxx['user_login']."' order by id desc");
            $ground=array();
            $treelist=array();
            foreach ($tree as $key => $value) {
                $treelist[$value[num]]=$value;
            }
            $grouth=0;
            for($i=0;$i<30;$i++){
                $user=$db->getOne("select * from jz_user where id='".$data2['selfid']."' order by id desc limit 1");
                $data=array();
                $data['UserId']=$user['id'];
                $data['GroundNumber']=$i+1;
                $data['GroundType']=0;
                $data['SeededAppleNumber']=0;
                $data['LockedAppleNumber']=0;
                $data['SeedMaxNumber']=0;
                $data['ReclaimSeedNumber']=0;
                $data['IsWater']=0;
                $data['IsReclaim']=0;
                if($treelist[$i+1]){
                    $data['IsReclaim']=1;
                    $data['GroundType']=$treelist[$i+1]['type'];
                    $data['SeededAppleNumber']=$treelist[$i+1]['money'];
                    $data['LockedAppleNumber']=$treelist[$i+1]['locked'];
                    $data['SeedMaxNumber']=$bonus['tree_kd'.($i+1)]*$bonus['max_dividend_days'];
                    $data['ReclaimSeedNumber']=$treelist[$i+1]['money']-$bonus['tree_kd'.($i+1)];
                    if($treelist[$i+1]['water_time']>date('Y-m-d 00:00:00',time())){
                        $data['IsWater']=1;
                    }
                    if(strtotime($userxx['waterauto'])>time()){
                            $data['IsWater']=1;
                    }
                    if(strtotime($treelist[$i+1]['lx_time'])<strtotime(date('Y-m-d 00:00:00',time()))){
                        $dogcount=0;
                        if($user['ishavewolfdog']){
                            $dogcount=$dogcount+1;
                        }
                        if($user['ishavetibetandog']){
                            $dogcount=$dogcount+1;
                        }
                        $lx=$treelist[$i+1]['money']*$user['lx']/100;
                        $grouth=$grouth+$lx;
                        $map['lx']=(80+$dogcount*$bonus[ggfdbl])/100*$lx;
                        $map['fm']=$bonus['fhbl']*$lx/100;
                        $map['tq']=(20-$dogcount*$bonus[ggfdbl])/100*$lx;
                        $map['lx_time']=date('Y-m-d H:i:s',time());
                        $map['tqlist']='';
                        $db->update('jz_tree',$map,'id='.$treelist[$i+1]['id']);
                    }
                }
                $ground[]=$data;
            }
            if($grouth){
                            $map3['zlx']=$user['zlx']+$grouth;
                            $db->update('jz_user',$map3,'id='.$user['id']);
                            $map2['user_login']=$userxx['user_login'];
                            $map2['money']=$grouth;
                            $map2['grouth']=$userxx['lx'];
                            $map2['create_time']=date('Y-m-d H:i:s',time());
                            $db->insert('jz_grouth',$map2);
                    }
            act('displayGround',$ground);
        }
        if($data2['act']=='SearchScarerow'){
            //获取稻草人信息
            $user=$db->getOne("select * from jz_user where id='".$data2['selfid']."' order by id desc limit 1");
            $result['userId']=$user['id'];
            if($user['locationoneplugin']){
                $result['IsLocationOnePlugin']='1';
            }
            else{
                $result['IsLocationOnePlugin']='0';
            }
            if($user['locationtwoplugin']){
                $result['IsLocationTwoPlugin']='1';
            }
            else{
                $result['IsLocationTwoPlugin']='0';
            }
            if($user['locationthreeplugin']){
                $result['IsLocationThreePlugin']='1';
            }
            else{
                $result['IsLocationThreePlugin']='0';
            }
            if($user['locationfourplugin']){
                $result['IsLocationFourPlugin']='1';
            }
            else{
                $result['IsLocationFourPlugin']='0';
            }
            act('displayScarecrow',$result);
        }
        if($data2['act']=='pluginScarecrow'){
            //插入稻草人
            $location=array('','one','two','three','four');
            if($user[recommend_money]<1){
                act('displayMessage',"仓库稻草人不足");
            }
            if($user['location'.$location[$data2['location']].'plugin']!='1')
            {
            $map['location'.$location[$data2['location']].'plugin']='1';
            $map[recommend_money]=$user[recommend_money]-1;
            }
            else{
                act('displayMessage',"这个位置已经插入稻草人，无需重复插入");
            }
            $db->update('jz_user',$map,'id='.$user['id']);
        }
        if($data2['act']=='reclaimCrop'){
            //开垦土地
            $map['num']=$data2['groundnumber'];
            $treelast=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($map['num']-1));
            $tree=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($map['num']));
            if($map['num']>1 &&!$treelast){
                act('displayMessage',"上一块地还未开垦 不能开垦此地");
            }
            if($tree){
                act('displayMessage',"地块已经开垦");
            }
            if($user['money']<$bonus['tree_kd'.$map['num']]){
                act('displayMessage',"仓库余额不足");
            }
            $map['type']=ceil($map['num']/5);
            $map['user_login']=$user['user_login'];
            $map['create_time']=date('Y-m-d H:i:s',time());
            $map['water_time']=date('Y-m-d H:i:s',time());
            $map['lx_time']=date('Y-m-d H:i:s',time());
            $map['level']=0;
            $map['money']=$bonus['tree_kd'.$map['num']];
            $map['locked']=0;
            $db->insert('jz_tree',$map);
            $map3['money']=$user['money']-$bonus['tree_kd'.$map['num']];
            $map3['lx']=$user['lx']+$bonus['tree_lx'.$map['num']];
            if($map['num']%5==0){
                $i=ceil($map['num']/5);
                $map3['lx']=$map3['lx']+$bonus['tree_cjlx'.$i];
                if($bonus['tree_jljb'.$i]){
                $map3['money']=$map3['money']+$bonus['tree_jljb'.$i];
                action('displayMessage',"奖励金币+".$bonus['tree_jljb'.$i],$connection);
                }
                //  if($i==1){
                //      $map3['recommend_money']=$user['recommend_money']+1;
                //     action('displayMessage',"奖励稻草人+1",$connection);
                //      //add_record($user['user_login'],'jljl','奖励稻草人+1','0');
                //  }
                // if($i==2){
                //     $map3['recommend_money']=$user['recommend_money']+1;
                //      action('displayMessage',"奖励稻草人+1",$connection);
                //     //add_record($user['user_login'],'jljl','奖励稻草人+1','0');
                //  }
                if($i==3){
                    $map3['recommend_money']=$user['recommend_money']+2;
                    action('displayMessage',"奖励稻草人+2",$connection);
                    //add_record($user['user_login'],'jljl','奖励稻草人+2','0');
                }
                if($i==4){
                    $map3['recommend_money']=$user['recommend_money']+2;
                    action('displayMessage',"奖励稻草人+2",$connection);
                    add_record($user['user_login'],'jljl','奖励稻草人+2','0');
                }
                if($i==5){
                    $map3['ishavewolfdog']=1;
                    action('displayMessage',"奖励哈士奇+1",$connection);
                    add_record($user['user_login'],'jljl','奖励哈士奇+1','0');
                }
                if($i==6){
                    $map3['ishavetibetandog']=1;
                    $map3['allzt']=1;            
                    action('displayMessage',"奖励藏獒+1",$connection);
                    add_record($user['user_login'],'jljl','奖励藏獒+1','0');
                }
            }
            $db->update('jz_user',$map3,'id='.$user['id']);
        }
        if($data2['act']=='water'){
            //浇水
            $tree=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($data2['groundnumber']));
            if($tree['water_time']>date('Y-m-d 00:00:00',time())){
                act('displayMessage',"已经浇过水了");
            }
            $map['water_time']=date('Y-m-d H:i:s',time());
            $map['money']=$tree['locked']+$tree['money'];
            $map['locked']=0;
            $db->update('jz_tree',$map,'id='.$tree['id']);
        }
        if($data2['act']=='flyBee'){
            $userxx=$db->getOne("select * from jz_user where id='".$data2['frienduserid']."' order by id desc limit 1");
            $tree=$db->getOne("select * from jz_tree where user_login='".$userxx['user_login']."' and num=".($data2['groundnumber']));
            if($tree['fm']==0){
                act('displayMessage',"已经采过蜜了");
            }
            $map2['money']=$user['money']+$tree['fm'];
            $map['fm']=0;
            $db->update('jz_tree',$map,'id='.$tree['id']);
            $db->update('jz_user',$map2,'id='.$user['id']);
            //采蜜
            add_record($user['user_login'],'flyBee','采集'.$userxx['user_login'].$data2['groundnumber'].'号地','+'.($tree['fm']));
        }
        if($data2['act']=='fertilize'){
            //施肥
            $tree=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($data2['groundnumber']));
            if($tree['lx']==0){
                act('displayMessage',"已经施过肥了");
            }
            if($tree['locked']+$tree['money']>=$bonus['tree_kd'.$data2['groundnumber']]*$bonus['max_dividend_days']){
                act('displayMessage',"本地已经满额");
            }
            $map['money']=$tree['money']+$tree['lx']+$tree['tq'];
            if($tree['locked']+$map['money']>$bonus['tree_kd'.$data2['groundnumber']]*$bonus['max_dividend_days']){
                $map['money']=$bonus['tree_kd'.$data2['groundnumber']]*$bonus['max_dividend_days']-$tree['locked'];
                if($map['money']-$value['money']>$map['lx']){
                        $map['lx']=0;
                        $map['tq']=$value['tq']-($map['money']-$value['money']-$map['lx']);
                    }
                    else{
                        $map['lx']=$value['lx']-($map['money']-$value['money']);
                    }
            }
            else{
            $map['lx']=0;
            $map['tq']=0;
            }
            $db->update('jz_tree',$map,'id='.$tree['id']);
            add_record($user['user_login'],'fertilize',$data2['groundnumber'].'号地','+'.($map['money']-$tree['money']));
        }
        if($data2['act']=='reap'){
            //收获
            $tree=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($data2['groundnumber']));
            $map['money']=$bonus['tree_kd'.$data2['groundnumber']];
            if($tree['money']-$map['money']>0){
                    $db->update('jz_tree',$map,'id='.$tree['id']);
                    $map2['money']=$user['money']+($tree['money']-$map['money']);
                    $db->update('jz_user',$map2,'id='.$user['id']);
                    add_record($user['user_login'],'reap',$data2['groundnumber'].'号地','+'.($tree['money']-$map['money']));
                    act('displayMessage',"获取金币:".($tree['money']-$map['money']));
            }
            else{
                act('displayMessage',"不能收获更多的金币，请明天再试");
            }
        }
        if($data2['act']=='reap2'){
            //偷窃
            $userxx=$db->getOne("select * from jz_user where id='".$data2['frienduserid']."' order by id desc limit 1");
            $tree=$db->getOne("select * from jz_tree where user_login='".$userxx['user_login']."' and num=".($data2['groundnumber']));
            if($bonus[tq_status]==0){
                act('displayMessage',"偷窃功能暂未开发");
            }
            if($tree['tq']==0){
                act('displayMessage',"您来晚了已经被偷完了");
            }
            $tqlist=explode(",",$tree[tqlist]);
            if(in_array($user['id'],$tqlist)){
                act('displayMessage',"请给你朋友剩一点吧");
            }
            $sjbl=rand(10);
            $map2['money']=$user['money']+$tree['tq']/$sjbl;
            $map['tq']=$tree['tq']-$tree['tq']/$sjbl;
            $map['tqlist']=implode(",",$tree[tqlist]);
            $db->update('jz_tree',$map,'id='.$tree['id']);
            $db->update('jz_user',$map2,'id='.$user['id']);
            //偷窃
            add_record($user['user_login'],'reap2','偷窃'.$userxx['user_login'].$data2['groundnumber'].'号地','+'.($tree['fengmi']));
        }
        if($data2['act']=='seed'){
            //增种
            $tree=$db->getOne("select * from jz_tree where user_login='".$user['user_login']."' and num=".($data2['groundnumber']));
            if($data2['seednumber']>$user['money']){
                act('displayMessage',"仓库余额不足");
            }
            if($tree['locked']+$tree['money']+$data2['seednumber']>$bonus['tree_kd'.$data2['groundnumber']]*$bonus['max_dividend_days']){
                act('displayMessage',"此地补种不能超过上限");
            }
            if($tree['water_time']<date('Y-m-d 00:00:00',time())){
                act('displayMessage',"请浇水后在补种");
            }
            $map['money']=$data2['seednumber']+$tree['money'];
            $db->update('jz_tree',$map,'id='.$tree['id']);
            $map2['money']=$user['money']-$data2['seednumber'];
            $db->update('jz_user',$map2,'id='.$user['id']);
            add_record($user['user_login'],'seed',$data2['groundnumber'].'号地','+'.$data2['seednumber']);
        }
        if($data2['act']=='music'){
            //音效
            $map['music']=$data2['status'].'|'.$data2['music'];
            $db->update('jz_user',$map2,'id='.$user['id']);
        }
        if($data2['act']=='init'){
            //初始化
            $result[userinfo]=$user;
            act('inituserxx',$result);
        }    
    }
   catch (Exception $e) {
        $result=json_decode($e->getMessage(),true);    
    	$connection->send(json_encode($result));   
	}   
};
// 运行worker
Worker::runAll();
function ouput($str){
		$zmm= mb_convert_encoding($str, "GB2312","UTF-8");
		echo $zmm."\r\n";
	}
function uncode($str){
	$data=array();
	$list=explode('&',$str);
	foreach($list as $one){
		$sj=explode('=',$one);
		$data[$sj['0']]=urldecode($sj['1']);
	}
	return $data;
}
function loginout($msg)
{
	$data['msg']=$msg;
	$data['act']='outlogin';
	throw new Exception(json_encode($data));
}
function act($act,$msg){
    $data['msg']=$msg;
    $data['act']=$act;
    throw new Exception(json_encode($data));
}
function action($act,$msg,$connection){
    $data['msg']=$msg;
    $data['act']=$act;
    $connection->send(json_encode($data));
}
function error($msg){
    $data['msg']=$msg;
    $data['act']='error';
    throw new Exception(json_encode($data));
}
function add($db,$uname,$money, $notice){
        $data['user_login'] = $uname;
        $data['wallet'] = 'money';
        $data['number'] = $money;
        $data['notice'] = $notice;
        $data['create_time'] = date ("Y-m-d H:i:s",  time());
        $db->insert('jz_all_record',$data);
    }
function update($var=0){
    global $url;
    if(!$var){
	$data['url']=$url.'hykj.apk';
    }
    else{
    $data['url']=$url.$var;
    }
    $data['act']='update';
    throw new Exception(json_encode($data));
}
function sendsmg($telphone, $content) {
    if ($telphone) {//
        $post_data = array();
        $post_data['u'] = '337016115';
        $post_data['p'] = md5('ccy940624.');
        //post_data['password'] = '80808080';
        $post_data['c'] = urlencode("【招财树】".$content); //短信内容需要用urlencode编码下urlencode(
        $post_data['m'] = $telphone;
        $url ='http://api.smsbao.com/sms?u='.$post_data['u'].'&p='.$post_data['p'].'&m='.$post_data['m'].'&c='.$post_data['c'];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $output = curl_exec($ch);
        curl_close($ch);
//        var_dump ($arr['message']);
        if ($output == '0') {
            return '1';
            //echo "发送成功! 发送时间".date("Y-m-d H:i:s");
        } else {
            return '0';
            //echo "发送失败, 错误提示代码: ".$result;
        }
    }
    return '0';
}
function objectsIntoArray($arrObjData, $arrSkipIndices = array())
{
    $arrData = array();
   
    // if input is object, convert into array
    if (is_object($arrObjData)) {
        $arrObjData = get_object_vars($arrObjData);
    }
   
    if (is_array($arrObjData)) {
        foreach ($arrObjData as $index => $value) {
            if (is_object($value) || is_array($value)) {
                $value = objectsIntoArray($value, $arrSkipIndices); // recursive call
            }
            if (in_array($index, $arrSkipIndices)) {
                continue;
            }
            $arrData[$index] = $value;
        }
    }
    return $arrData;
}
function add_record($user_login,$type,$notice,$number){
    global $db;
    $map['user_login']=$user_login;
    $map['type']=$type;
    $map['notice']=$notice;
    $map['number']=$number;
    $map['create_time']=date('Y-m-d H:i:s',time());
    $db->insert('jz_all_record',$map);
}
?>