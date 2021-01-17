<?php

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => 'https://api.opentripmap.com/0.1/en/places/bbox?lon_min='.$_REQUEST['west'].'&lon_max='.$_REQUEST['east'].'&lat_min='.$_REQUEST['south'].'&lat_max='.$_REQUEST['north'].'&kinds='.$_REQUEST['kind'].'&rate=3&format=json&limit=500&apikey=5ae2e3f221c38a28845f05b650a26f99f2ef0bb05b92e586d15fd31a',
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",

]);

$result = curl_exec($curl);
$err = curl_error($curl);


curl_close($curl);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>