<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['message']) || !isset($input['apiKey'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing message or apiKey']);
    exit;
}

$apiKey = $input['apiKey'];
$message = $input['message'];
$history = $input['history'] ?? [];

// Tạo prompt với lịch sử
$systemPrompt = $input['systemPrompt'] ?? '';
$fullPrompt = $systemPrompt . "\n\n";

if (!empty($history)) {
    $fullPrompt .= "Lịch sử hội thoại:\n";
    foreach ($history as $msg) {
        if ($msg['role'] === 'user') {
            $fullPrompt .= "Người dùng: " . $msg['parts'][0]['text'] . "\n";
        } else {
            $fullPrompt .= "CareerMate: " . $msg['parts'][0]['text'] . "\n";
        }
    }
    $fullPrompt .= "\n";
}

$fullPrompt .= "Người dùng: " . $message . "\nCareerMate:";

// Sử dụng gemini-2.5-flash (stable version, hỗ trợ generateContent và thinking mode)
// Các model khác có thể dùng: gemini-2.0-flash-001, gemini-flash-latest, gemini-2.5-pro
$model = 'gemini-2.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

$requestBody = [
    'contents' => [[
        'parts' => [['text' => $fullPrompt]]
    ]]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'CURL error', 'details' => $curlError]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    $errorData = json_decode($response, true);
    $errorMessage = 'API request failed';
    
    // Xử lý các loại lỗi khác nhau
    if (isset($errorData['error']['message'])) {
        $errorMessage = $errorData['error']['message'];
    } elseif (isset($errorData['error'])) {
        if (is_string($errorData['error'])) {
            $errorMessage = $errorData['error'];
        } elseif (is_array($errorData['error']) && isset($errorData['error']['message'])) {
            $errorMessage = $errorData['error']['message'];
        } else {
            $errorMessage = json_encode($errorData['error']);
        }
    }
    
    // Thêm thông tin chi tiết về lỗi
    $errorDetails = [
        'error' => $errorMessage,
        'httpCode' => $httpCode,
        'details' => $response
    ];
    
    // Thêm gợi ý khắc phục dựa trên mã lỗi
    if ($httpCode === 400) {
        $errorDetails['suggestion'] = 'API key không hợp lệ hoặc request format sai. Kiểm tra API key và format request.';
    } elseif ($httpCode === 401 || $httpCode === 403) {
        $errorDetails['suggestion'] = 'API key không có quyền truy cập hoặc đã bị vô hiệu hóa. Lấy API key mới tại: https://aistudio.google.com/apikey';
    } elseif ($httpCode === 429) {
        $errorDetails['suggestion'] = 'Đã vượt quá giới hạn sử dụng (rate limit). Vui lòng thử lại sau hoặc nâng cấp gói.';
    } elseif ($httpCode === 500 || $httpCode === 503) {
        $errorDetails['suggestion'] = 'Lỗi từ phía Google API. Vui lòng thử lại sau.';
    }
    
    echo json_encode($errorDetails, JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($response, true);

// Xử lý response với nhiều trường hợp
if (!$data) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to decode API response',
        'details' => $response
    ]);
    exit;
}

// Kiểm tra có lỗi từ API
if (isset($data['error'])) {
    http_response_code(500);
    $errorMsg = isset($data['error']['message']) ? $data['error']['message'] : json_encode($data['error']);
    echo json_encode([
        'error' => 'Gemini API error: ' . $errorMsg,
        'details' => $data
    ]);
    exit;
}

// Lấy text từ response - xử lý nhiều format khác nhau
$responseText = null;

// Format chuẩn: candidates[0].content.parts[0].text
if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
    $responseText = $data['candidates'][0]['content']['parts'][0]['text'];
}
// Fallback: candidates[0].content.parts.text (nếu không phải array)
elseif (isset($data['candidates'][0]['content']['parts']['text'])) {
    $responseText = $data['candidates'][0]['content']['parts']['text'];
}
// Fallback: response.candidates
elseif (isset($data['response']['candidates'][0]['content']['parts'][0]['text'])) {
    $responseText = $data['response']['candidates'][0]['content']['parts'][0]['text'];
}

if (!$responseText) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid API response format - không tìm thấy text trong response',
        'details' => $data,
        'debug' => [
            'has_candidates' => isset($data['candidates']),
            'candidates_count' => isset($data['candidates']) ? count($data['candidates']) : 0,
            'response_keys' => array_keys($data)
        ]
    ]);
    exit;
}

echo json_encode([
    'response' => $responseText
]);
?>


