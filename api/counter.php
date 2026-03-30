<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Разрешаем запросы со всех ваших поддоменов

$lang = $_GET['lang'] ?? 'ru';
$pageId = $_GET['page_id'] ?? 'home';

// Путь к папке с данными (убедитесь, что у PHP есть права на запись в эту папку)
$dataDir = __DIR__ . '/data/';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$totalFile = $dataDir . "total_{$lang}.txt";
$pageFile = $dataDir . "page_{$lang}_{$pageId}.txt";

// Функция инкремента
function increment($file) {
    $count = is_file($file) ? (int)file_get_contents($file) : 0;
    $count++;
    file_put_contents($file, $count);
    return $count;
}

$response = [
    'total' => increment($totalFile),
    'page' => increment($pageFile)
];

echo json_encode($response);