<?php
return array( // 添加下面一行定义即可
    'app_init' => array(
        'Common\Behavior\InitHookBehavior',
    ),
    'app_begin' => array(
        'Behavior\CheckLangBehavior',
        'Common\Behavior\UrldecodeGetBehavior'
    ),
    'view_filter' => array(
        'Common\Behavior\TmplStripSpaceBehavior'
    ),
    'admin_begin' => array(
        'Common\Behavior\AdminDefaultLangBehavior'
    ),



//    微信
    'WEIXINPAY_CONFIG' =>array (
      'APPID' => 'wx77c6f288c5ed2764',
      'MCHID' => '',
      'KEY' => '',
      'APPSECRET' => 'bf7b510d94c0ada1d5fcdbfddfc49e43',
      'NOTIFY_URL' => '',
      'redirect_uri' => 'http://test.jiufu.com',
      'template_id' => '',
  ),
)
;