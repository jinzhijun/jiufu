<?php
use Workerman\Worker;
require_once __DIR__ .'/workman/Autoloader.php';
error_reporting(E_ALL & ~E_NOTICE);
ini_set('date.timezone','Asia/Shanghai');
//包含数据库操作类文件
include 'mysql.class.php';
$hostname='localhost';
$username='root';
$password='root';
$dbname='jiufu';
$charset = 'utf8';
$url="http://test.jiufu.com/";
$db = new Mysql($hostname,$username,$password,$dbname);
ouput("读取配置");
$worker = new Worker('websocket://0.0.0.0:8484');
$worker->onWorkerStart = function($worker)
{
    ouput('程序开始运行');
};
$worker->onConnect = function($connection)
{
    ouput("新的链接ip为 " .$connection->getRemoteIp());
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