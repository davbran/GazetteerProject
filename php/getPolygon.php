<?php

$url = 'countryBorders.geo.json';

$countries = json_decode(file_get_contents($url), true);

$output = $countries['features'];

if($_REQUEST['type'] == 'code'){
    $selector = 'iso_a3';
}else{
    $selector = 'name';
}

foreach($output as $key => $val ){
    if($val['properties'][$selector] == $_REQUEST['country']){
        echo json_encode($val);
        break;
    }
    
}

?>