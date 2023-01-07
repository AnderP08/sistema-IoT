<?php
// URL de la API de ThingSpeak
$url = 'https://api.thingspeak.com/channels/1999874/feeds.json';
// Hacer una solicitud HTTP GET a la URL de la API de ThingSpeak
$data = file_get_contents($url);
// Decodificar la respuesta JSON
$data = json_decode($data, true);
// Codificar y eviar los datos
echo json_encode($data['feeds']);