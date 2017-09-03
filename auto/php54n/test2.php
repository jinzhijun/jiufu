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
$worker = new Worker('websocket://0.0.0.0:8282');
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
            if($data2['salt']!=md5(md5($data2['userid'].'zmm').'zmm')){
                loginout('你还未登录，请登录后操作');
            }
            else{
                $user=$db->getOne("select * from jz_user where id='".$data2['userid']."' order by id desc limit 1");
                $user['unreadNotice']=1;
                $user['unreadMsg']=1;
            }
        }
        if($data2['act']=='yjhy'){
            $friend=$db->getOne("select * from jz_user where user_login='".$data2['user_login']."' order by id desc limit 1");
            if(!$friend){
                error('你要添加的用户不存在');
            }
            $gx=$db->getOne("select * from jz_friend where user_login='".$data2['user_login']."' and friend='".$data2['user_login']."' order by id desc limit 1");
            if($gx){
                error('你已经添加过该好友或者已经发送请求');
            }
            $map['user_login']=$user['user_login'];
            $map['friend']=$friend['user_login'];
            $map['zt']=1;
            $map['true_name']=$friend['true_name'];
            $map['mobile']=$friend['mobile'];
            $map['msg']=0;
            $db->insert('jz_friend',$map);
            $map2['user_login']=$friend['user_login'];
            $map2['friend']=$user['user_login'];
            $map2['zt']=0;
            $map2['true_name']=$user['true_name'];
            $map2['mobile']=$user['mobile'];
            $map2['msg']=0;
            $db->insert('jz_friend',$map2);
            success('发送请求成功');
        }
        if($data2['act']=='qdtj'){
            $gx=$db->getOne("select * from jz_friend where id='".$data2['id']."' order by id desc limit 1");
            $gx2=$db->getOne("select * from jz_friend where user_login='".$gx['friend']."' and friend='".$gx['user_login']."' order by id desc limit 1");
            $map['zt']=2;
            $db->update('jz_friend',$map,'id='.$gx[id]);
            $db->update('jz_friend',$map,'id='.$gx2[id]);
            success('通过成功');
        }
        if($data2['act']=='friend'){
             $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_friend where user_login="'.$user[user_login].'" order by zt asc,id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($value[zt]==0){
                $friend=$db->getOne("select * from jz_user where user_login='".$value['friend']."' order by id desc limit 1");
                $act='<a href="javascript:void(0)" onclick="qdtj('.$value[id].')">确定添加</a>';
            }
            if($value[zt]==1){
                $act='等待通过';
            }
            if($value[zt]==2){
                $friend=$db->getOne("select * from jz_user where user_login='".$value['friend']."' order by id desc limit 1");
                $act='<a href="javascript:void(0);" onclick="window.parent.frames.jrhy('.$friend[id].')">进入</a>';
            }
            $html=$html.'<tr class="">
                    <td>'.$value[friend].'</td>
                    <td>'.$value[true_name].'</td>
                    <td>'.$value[mobile].'</td>
                    <td>'.$act.'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_friend where user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='notice'){
             $notice=$db->getAll('select b.* from jz_term_relationships as a left join jz_posts as b on b.id=a.object_id where a.term_id=1 and b.post_status=1');
             $html='';
             foreach ($notice as $key => $value) {
            $html=$html.'<div class="message-body-2" data-id="35">
            <span class="message-body-head-date-2">'.date('Y-m-d',strtotime($value[post_date])).'</span>
            <span class="message-body-head-content-2"><a href="noticeinfo.html?page='.$value[id].'">'.$value[post_title].'</a></span>
            <img src="../images/common_select.png" class="message-body-select-2">
            </div>';
            }
            addhtml($html,$connection);
        }
        if($data2['act']=='newfarm'){
            $act='addval';
            $msg['id']='parent_user';
            $msg['html']=$user['user_login'];
            action($act,$msg,$connection);
            $act='addhtml';
            $msg['id']='sjxy';
            $msg['html']=$bonus['reg_money']+$bonus['cs_money'];
            action($act,$msg,$connection);
            if($user[allzt]!=1){
            $act='readonly';
            $msg['id']='parent_user';
            $msg['html']='1';
            action($act,$msg,$connection);
            }
        }
        if($data2['act']=='noticeinfo'){
            $notice=$db->getOne('select * from jz_term_relationships as a left join jz_posts as b on b.id=a.object_id where b.id='.$data2['page']);
            $html=$notice['post_content'];
            addhtml($html,$connection);
            $act='addhtml';
            $msg['id']='title';
            $msg['html']=$notice['post_title'];
            action($act,$msg,$connection);
        }
        if($data2['act']=='messages'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_guestbook where user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            $type=array('未回复','已回复');
            foreach ($list as $key => $value) {
            $html=$html.'<tr class="">
                    <td>'.$value[title].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td>'.$value[MA_replyTime].'</td>
                    <td>'.$type[$value[status]].'</td>
                    <td>'.$value[reply].'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_guestbook where user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='bee'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_all_record where type="flyBee" and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[number].'</td>
                    <td>'.$value[notice].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_all_record where type="flyBee" and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }

        if($data2['act']=='growth'){
            $sfjl=$db->getOne("select sum(number) as total from jz_all_record where type='fertilize' and user_login='".$user['user_login']."' order by id desc");
           
            $act='addhtml';
            $msg['id']='zjl';
            $msg['html']=sprintf("%.2f",($cmjl['total']+$sfjl['total']+0));;
            action($act,$msg,$connection);
            $act='addhtml';
            $msg['id']='cmjl';
            $msg['html']=sprintf("%.2f",($cmjl['total']+0));
            action($act,$msg,$connection);
            $act='addhtml';
            $msg['id']='sfjl';
            $msg['html']=sprintf("%.2f",($sfjl['total']+0));
            action($act,$msg,$connection);

            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_grouth where user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[money].'</td>
                    <td>'.$value[grouth].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_grouth where user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='fertilize'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_all_record where type="fertilize" and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[number].'</td>
                    <td>'.$value[notice].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_all_record where type="fertilize" and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
         if($data2['act']=='dog'){
            $html='<tr class="">
                    <td>12</td>
                    <td>xxx</td>
                    <td>xxxxxx</td>
                </tr>';
            addhtml($html,$connection);
                        $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='reap'){//收割记录
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_all_record where type="reap" and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[number].'</td>
                    <td>'.$value[notice].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_all_record where type="reap" and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='sale'){
            $act='addhtml';
            $msg['id']='CurrentAppleNumber';
            $msg['html']=sprintf("%.2f",($user['money']+0));
            action($act,$msg,$connection);
            $msg['id']='LbAppleNumber';
            action($act,$msg,$connection);
            $msg['id']='LbCanSaleNumber';
            action($act,$msg,$connection);
            $msg['id']='jysm';
            $msg['html']='此交易由公司帮助卖主寻找买主（公司收取'.$bonus['zbbl'].'%的手续费），一旦撮合交易（帮卖家找到买主），便不能取消交易.';
            action($act,$msg,$connection);
            $msg['id']='jysm2';
            $jmsxf=0;
        if($user['locationoneplugin']){
                $jmsxf=$jmsxf+$bonus['jmsxf'];
        }
        if($user['locationtwoplugin']){
                $jmsxf=$jmsxf+$bonus['jmsxf'];
        }
        if($user['locationthreeplugin']){
                $jmsxf=$jmsxf+$bonus['jmsxf'];
        }
        if($user['locationfourplugin']){
                $jmsxf=$jmsxf+$bonus['jmsxf'];
        }
            $bonus['kdfy']=$bonus['kdfy']-$jmsxf;
            if($user[allzt]==1){
                $bonus['kdfy']=0;
            }
            $msg['html']='公司收取'.$bonus['kdfy'].'%手续费，如果出售100枚金币，则实际交易的只有'.(100-$bonus['kdfy']).'枚（地开垦满后免收手续费），
                        本次将锁定出售的金币，无法再让其他人购买；请确认您已经与接收方联系并达成买卖意愿,否则由此造成的交易失败后果自己承担。';
            action($act,$msg,$connection);
            $act='addval';
            $msg['id']='feeRatioI';
            $msg['html']=$bonus['zbbl']/100;
            action($act,$msg,$connection);
            $msg['id']='feeRatio';
            $msg['html']=$bonus['kdfy']/100;
            action($act,$msg,$connection);
            $msg['id']='isFreeFee';
            $msg['html']='0';
            action($act,$msg,$connection);
        }
         if($data2['act']=='sales'){
            $spage=($data2['page']-1)*15;
            $epage=15;
    $list=$db->getAll('select * from jz_get_help where line_type=1 and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            $match=$db->getOne('select * from jz_match where gid="'.$value[id].'" order by id desc ');
            $puser=$db->getOne('select * from jz_user where user_login="'.$match[provide_user].'" order by id desc ');
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $sxf[0]=$bonus['zbbl'];
            $sxf[1]=$bonus['kdfy'];
                        if(!$match){
                $act='等待撮合';
            }
            if($match[status]==0){
                $act='等待付款';
            }
            if($match[status]==1){
                $act='<a href="javascript:void(0)" onclick="qrsk('.$value[id].')">确认收款</a>';
            }
            if($match[status]==2){
                $act='完成';
            }
            $type=array("等待付款","等待确认","交易完成");
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[money].'</td>
                    <td>'.($value[money]*$sxf[$value[line_type]]/100).'</td>
                    <td>'.$match[provide_user].'</td>
                    <td>'.$puser[mobile].'</td>
                    <td>'.$type[$value[status]].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td>'.date('Y-m-d',strtotime($match[create_time])).'</td>
                    <td>'.$act.'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_get_help where line_type=1 and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='seed'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_all_record where type="jljl" and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[notice].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_all_record where type="jljl" and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='seeding'){
             $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_all_record where type="seed" and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[number].'</td>
                    <td>'.$value[notice].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_all_record where type="seed" and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='purchase'){
            $spage=($data2['page']-1)*15;
            $epage=15;
    $list=$db->getAll('select * from jz_provide_help where user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            $match=$db->getOne('select * from jz_match where pid="'.$value[id].'" order by id desc ');
            $guser=$db->getOne('select * from jz_user where user_login="'.$match[get_user].'" order by id desc ');
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            if(!$match){
                $act='等待撮合';
            }
            if($match[status]==0){
                $act='<a href="javascript:void(0)" onclick="qrfk('.$value[id].')">确认付款</a>';
            }
            if($match[status]==1){
                $act='等待确认';
            }
            if($match[status]==2){
                $act='完成';
            }
            $type=array("等待付款","等待确认","交易完成");
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[money].'</td>
                    <td>'.$match[get_user].'</td>
                    <td>'.$guser[mobile].'</td>
                    <td>'.$type[$match[status]].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td>'.date('Y-m-d',strtotime($match[create_time])).'</td>
                    <td>'.$act.'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_provide_help where user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='exchange'){
            $spage=($data2['page']-1)*15;
            $epage=15;
    $list=$db->getAll('select * from jz_get_help where status=0  and user_login!="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            $user=$db->getOne('select * from jz_user where user_login="'.$value[user_login].'" order by id desc ');
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$user[user_login].'</td>
                    <td>'.$user[mobile].'</td>
                     <td>'.$value[money].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td><a href="javascript:void(0)" onclick="gm('.$value[id].')">购买</a></td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_get_help where status=0  and user_login!="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='entrust'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_get_help where line_type=0 and user_login="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
            $match=$db->getOne('select * from jz_match where gid="'.$value[id].'" order by id desc ');
            $puser=$db->getOne('select * from jz_user where user_login="'.$match[provide_user].'" order by id desc ');
            if($key%2==0){
                $class='';
            }
            else{
                $class='odd';
            }
            $sxf[0]=$bonus['zbbl'];
            $sxf[1]=$bonus['kdfy'];
            if(!$match){
                $act='等待撮合';
            }
            if($match[status]==0){
                $act='等待付款';
            }
            if($match[status]==1){
                $act='<a href="javascript:void(0)" onclick="qrsk('.$value[id].')">确认收款</a>';
            }
            if($match[status]==2){
                $act='完成';
            }
            $type=array("等待付款","等待确认","交易完成");
            $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[money].'</td>
                    <td>'.($value[money]*$sxf[$value[line_type]]/100).'</td>
                    <td>'.$match[provide_user].'</td>
                    <td>'.$puser[mobile].'</td>
                    <td>'.$type[$value[status]].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td>'.date('Y-m-d',strtotime($match[create_time])).'</td>
                    <td>'.$act.'</td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_get_help where line_type=0 and user_login="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if ($data2['act']=='kt') {
            if($user[money]<$bonus[$data2[id]]){
                act('error',"仓库余额不足");
            }
            $map[money]=$user[money]-$bonus[$data2[id]];
            if(strtotime($user[$data2[auto]])>time()){
                $map[$data2[auto]]=date('Y-m-d H:i:s',strtotime($user[$data2[auto]])+3600*30*24);
            }
            else{
                $map[$data2[auto]]=date('Y-m-d H:i:s',time()+3600*30*24);
            }
            $db->update('jz_user',$map,'id='.$user['id']);
            act('success',"开通成功");
        }
        if($data2['act']=='translate'){
            $act='addhtml';
            $msg['id']='yjjsjg';
            if(strtotime($user['waterauto'])>time()){
                $msg['html']='到期时间:'.$user['waterauto'].'<input type="button"  value="'.$bonus['yjjsjg'].'金币续费一月"   class="btn" onclick="kt(\'waterauto\',\'yjjsjg\')">';
            }
            else{
                $msg['html']='<input type="button"  value="'.$bonus['yjjsjg'].'金币开通一月"   class="btn" onclick="kt(\'waterauto\',\'yjjsjg\')">';
            }
            action($act,$msg,$connection);

            $act='addhtml';
            $msg['id']='yjcmjg';
            if(strtotime($user['cmauto'])>time()){
                $msg['html']='到期时间:'.$user['cmauto'].'<input type="button"  value="'.$bonus['yjcmjg'].'金币续费一月"   class="btn" onclick="kt(\'cmauto\',\'yjcmjg\')">';
            }
            else{
                $msg['html']='<input type="button"  value="'.$bonus['yjcmjg'].'金币开通一月"   class="btn" onclick="kt(\'cmauto\',\'yjcmjg\')">';
            }
            action($act,$msg,$connection);


            $act='addhtml';
            $msg['id']='yjsfjg';
            if(strtotime($user['sfauto'])>time()){
                $msg['html']='到期时间:'.$user['sfauto'].'<input type="button"  value="'.$bonus['yjsfjg'].'金币续费一月"   class="btn" onclick="kt(\'sfauto\',\'yjsfjg\')">';
            }
            else{
                $msg['html']='<input type="button"  value="'.$bonus['yjsfjg'].'金币开通一月"   class="btn" onclick="kt(\'sfauto\',\'yjsfjg\')">';
            }
            action($act,$msg,$connection);

            $act='addhtml';
            $msg['id']='yjshjg';
            if(strtotime($user['shauto'])>time()){
                $msg['html']='到期时间:'.$user['shauto'].'<input type="button"  value="'.$bonus['yjshjg'].'金币续费一月"   class="btn" onclick="kt(\'shauto\',\'yjshjg\')">';
            }
            else{
                $msg['html']='<input type="button"  value="'.$bonus['yjshjg'].'金币开通一月"   class="btn" onclick="kt(\'shauto\',\'yjshjg\')">';
            }
            action($act,$msg,$connection);

            $act='addhtml';
            $msg['id']='yjzzjg';
            if(strtotime($user['zzauto'])>time()){
                $msg['html']='到期时间:'.$user['zzauto'].'<input type="button"  value="'.$bonus['yjzzjg'].'金币续费一月"   class="btn" onclick="kt(\'zzauto\',\'yjzzjg\')">';
            }
            else{
                $msg['html']='<input type="button"  value="'.$bonus['yjzzjg'].'金币开通一月"   class="btn" onclick="kt(\'zzauto\',\'yjzzjg\')">';
            }
            action($act,$msg,$connection);
        }
        if($data2['act']=='translates'){
            $html='<tr class="">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>';
            addhtml($html,$connection);
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='seedppg'){
            $html='<tr class="">
                    <td>190</td>
                    <td>19</td>
                    <td>jjh0130</td>
                    <td>贾静欢</td>
                </tr>';
            addhtml($html,$connection);
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='created'){
            $spage=($data2['page']-1)*15;
            $epage=15;
            $list=$db->getAll('select * from jz_user where parent_user="'.$user[user_login].'" order by id desc limit '.$spage.','.$epage);
            $html='';
            foreach ($list as $key => $value) {
                    if($key%2==0){
                    $class='';
                    }
                    else{
                    $class='odd';
                    }
                 $html=$html.'<tr class="'.$class.'">
                    <td>'.$value[user_login].'</td>
                    <td>'.$value[true_name].'</td>
                    <td>'.$value[mobile].'</td>
                    <td>'.$value[sex].'</td>
                    <td>'.$value[alipay].'</td>
                    <td>'.$value[weixin].'</td>
                    <td>'.date('Y-m-d',strtotime($value[create_time])).'</td>
                    <td><a href="javascript:void(0);" onclick="window.parent.frames.jrfriend('.$value[id].')">进入</a></td>
                </tr>';
            }
            addhtml($html,$connection);
            $count=$db->getOne('select count(*) as sl from jz_user where parent_user="'.$user[user_login].'" order by id desc');
            $page=$data2['page'];
            $sl=ceil(($count['sl']+0)/15);
            addpage($sl,$page,$connection);
        }
        if($data2['act']=='changepwd'){
            $act='addhtml';
            $msg['id']='true_name';
            $msg['html']=$user['true_name'];
            action($act,$msg,$connection);
        }
        if($data2['act']=='personal'){
            $act='addhtml';
            $msg['id']='user_login';
            $msg['html']=$user['user_login'];
            action($act,$msg,$connection);
            $act='addval';
            $msg['id']='sex';
            $msg['html']=$user['sex'];
            action($act,$msg,$connection);
            $msg['id']='mobile';
            $msg['html']=$user['mobile'];
            action($act,$msg,$connection);
            $msg['id']='weixin';
            $msg['html']=$user['weixin'];
            action($act,$msg,$connection);
            $msg['id']='alipay';
            $msg['html']=$user['alipay'];
            action($act,$msg,$connection);
        }
        if($data2['act']=='instruction'){
            $notice=$db->getOne('select b.* from jz_term_relationships as a left join jz_posts as b on b.id=a.object_id where term_id=2');
            $html=$notice['post_content'];
            addhtml($html,$connection);
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
function action($act,$msg,$connection){
    $data['msg']=$msg;
    $data['act']=$act;
    $connection->send(json_encode($data));
}
function addhtml($html,$connection){
    $data['act']='addhtml';
    $msg['html']=$html;
    $msg['id']='content';
    $data['msg']=$msg;
    $connection->send(json_encode($data));
}
function addpage($sl,$page,$connection){
    if($sl==0){
      $sl=1;
    }
    $data['act']='addhtml';
    if($page>3){
        $ks=$page-3;
    }
    else{
        $ks=1;
    }
    $html='';
    for($i=$ks;$i<=$sl && $i<$page+3;$i++){
        if($i==$page){
            $html=$html.'<li>
                <span class="active" style="tabView" onclick="page('.$i.')">'.$i.'</span>
            </li>';
        }
        else{ 
            $html=$html.'<li>
                <span  style="tabView" onclick="pagexx('.$i.')">'.$i.'</span>
            </li>';
        }
    }
    $last=$page-1;
    if($last==0){ 
        $last=1;
    }
    $next=$page+1;
    if($next>$sl){ 
        $next=$sl;
    }
    $msg['html']='<div class="pull-right">
            <ul id="page" class="pagination" style="width:100%;"><li>
                    <a onclick="pagexx(1)">&lt;&lt;</a>
                </li>
                <li>
                    <a onclick="pagexx('.$last.')">&lt;</a>
                </li>'.$html.'<li>
                    <a onclick="pagexx('.$next.')">&gt;</a>
                </li>
                <li>
                    <a onclick="pagexx('.$sl.')">&gt;&gt;</a>
                </li> </ul>
        </div><div class="pagin">
            <div class="message">
                共
                <i class="blue">
                    <span id="totalPage" style="display:inline-block;height:16px;width:32px;">'.$sl.'</span>
                </i>
                页
            </div>
        </div>';
    $msg['id']='page';
    $data['msg']=$msg;
    $connection->send(json_encode($data));
}
function act($act,$msg){
    $data['msg']=$msg;
    $data['act']=$act;
    throw new Exception(json_encode($data));
}
function error($msg){
    $data['msg']=$msg;
    $data['act']='error';
    throw new Exception(json_encode($data));
}
function success($msg){
    $data['msg']=$msg;
    $data['act']='success';
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
?>