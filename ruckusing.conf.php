<?php
$local = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'ruckusing.conf.local.php';
if (file_exists($local)) {
    return require_once $local;
}
defined('WPT_DB_PREFIX')                or define('WPT_DB_PREFIX',                 'wp_t_');
defined('RUCKUSING_SCHEMA_TBL_NAME')    or define('RUCKUSING_SCHEMA_TBL_NAME',      WPT_DB_PREFIX . 'schema_info');
defined('RUCKUSING_TS_SCHEMA_TBL_NAME') or define('RUCKUSING_TS_SCHEMA_TBL_NAME',   WPT_DB_PREFIX . 'schema_migrations');
$databaseDirectory = RUCKUSING_WORKING_BASE . DIRECTORY_SEPARATOR . 'db';
return array(
    'db' => array(
        'development' => array(
            'type'     => 'mysql',
            'host'     => 'localhost',
            'port'     => 3306,
            'database' => 'wordpress',
            'user'     => 'root',
            'password' => '',
            'charset'  => 'utf8',
        ),
    ),
    'db_dir'          => $databaseDirectory,
    'migrations_dir'  => array('default' => $databaseDirectory . DIRECTORY_SEPARATOR . 'migrations'),
    'log_dir'         => $databaseDirectory . DIRECTORY_SEPARATOR . 'log',
);