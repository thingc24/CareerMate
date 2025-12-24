<?php
// File test để kiểm tra proxy có hoạt động không
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Gemini Proxy</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .result { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; }
        pre { background: #fff; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 Test Gemini Proxy</h1>
    
    <div class="result">
        <h3>Bước 1: Kiểm tra file proxy tồn tại</h3>
        <?php
        $proxyPath = dirname(__DIR__) . '/Web/gemini-proxy.php';
        if (file_exists($proxyPath)) {
            echo '<p style="color: green;">✅ File gemini-proxy.php tồn tại trong Web/</p>';
        } else {
            echo '<p style="color: red;">❌ File gemini-proxy.php KHÔNG tồn tại trong thư mục Web/</p>';
        }
        ?>
    </div>

    <div class="result">
        <h3>Bước 2: Kiểm tra PHP có hỗ trợ cURL</h3>
        <?php
        if (function_exists('curl_init')) {
            echo '<p style="color: green;">✅ PHP cURL đã được cài đặt</p>';
        } else {
            echo '<p style="color: red;">❌ PHP cURL chưa được cài đặt</p>';
        }
        ?>
    </div>

    <div class="result">
        <h3>Bước 3: Test gọi proxy (cần API key)</h3>
        <form method="POST" style="margin-top: 10px;">
            <label>API Key của bạn:</label><br>
            <input type="text" name="api_key" style="width: 400px; padding: 5px;" 
                   placeholder="Nhập API key để test" value="<?php echo isset($_POST['api_key']) ? htmlspecialchars($_POST['api_key']) : ''; ?>"><br><br>
            <label>Model (để trống sẽ dùng gemini-2.5-flash):</label><br>
            <input type="text" name="model" style="width: 400px; padding: 5px;" 
                   placeholder="gemini-2.5-flash" value="<?php echo isset($_POST['model']) ? htmlspecialchars($_POST['model']) : 'gemini-2.5-flash'; ?>"><br><br>
            <button type="submit" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Test Proxy
            </button>
            <a href="list-models.php" style="margin-left: 10px; padding: 8px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 3px; display: inline-block;">
                Xem danh sách models
            </a>
        </form>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['api_key'])) {
            $apiKey = $_POST['api_key'];
            $testMessage = 'Xin chào';
            
            echo '<h4>Đang test...</h4>';
            
            // Gọi proxy từ thư mục Web
            $proxyUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/CareerMate/Web/gemini-proxy.php';
            
            $postData = json_encode([
                'message' => $testMessage,
                'apiKey' => $apiKey,
                'systemPrompt' => 'Bạn là một trợ lý hữu ích.',
                'history' => []
            ]);
            
            $ch = curl_init($proxyUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            echo '<div class="result ' . ($httpCode === 200 ? 'success' : 'error') . '">';
            echo '<h4>Response từ Proxy:</h4>';
            echo '<p>HTTP Code: <strong>' . $httpCode . '</strong></p>';
            
            if ($curlError) {
                echo '<p style="color: red;">CURL Error: ' . htmlspecialchars($curlError) . '</p>';
            }
            
            echo '<pre>' . htmlspecialchars($response) . '</pre>';
            
            $data = json_decode($response, true);
            if ($data && isset($data['response'])) {
                echo '<h4 style="color: green;">✅ Thành công! AI đã trả lời:</h4>';
                echo '<p style="background: white; padding: 10px; border-radius: 3px;">' . nl2br(htmlspecialchars($data['response'])) . '</p>';
            } elseif ($data && isset($data['error'])) {
                echo '<h4 style="color: red;">❌ Lỗi:</h4>';
                echo '<p style="color: red;">' . htmlspecialchars($data['error']) . '</p>';
                if (isset($data['details'])) {
                    echo '<pre>' . htmlspecialchars($data['details']) . '</pre>';
                }
            }
            
            echo '</div>';
        }
        ?>
    </div>

    <div class="result">
        <h3>Bước 4: Hướng dẫn</h3>
        <ul>
            <li>File proxy chính: <code>Web/gemini-proxy.php</code> (đang được sử dụng bởi các trang web)</li>
            <li>Nếu cURL chưa cài: Bật extension <code>php_curl</code> trong php.ini</li>
            <li>Nếu test proxy bị lỗi: Kiểm tra API key hoặc xem chi tiết lỗi ở trên</li>
            <li>Lấy API key mới tại: <a href="https://aistudio.google.com/apikey" target="_blank">https://aistudio.google.com/apikey</a></li>
            <li>Xem hướng dẫn chi tiết: <a href="HUONG_DAN_API_KEY.md" target="_blank">HUONG_DAN_API_KEY.md</a></li>
        </ul>
    </div>
</body>
</html>

