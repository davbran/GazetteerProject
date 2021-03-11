<?php

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://api.opentripmap.com/0.1/en/places/xid/" . $_REQUEST['xid'] ."?apikey={apiKey}",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",

]);

$xidResult = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

$decode = json_decode($xidResult, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>

