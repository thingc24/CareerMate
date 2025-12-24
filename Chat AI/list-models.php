<?php
// File để kiểm tra các model có sẵn
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>List Gemini Models</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .success { background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>📋 Danh sách Gemini Models có sẵn</h1>
    
    <form method="POST" style="margin: 20px 0;">
        <label>API Key:</label><br>
        <input type="text" name="api_key" style="width: 400px; padding: 5px;" 
               placeholder="Nhập API key" value="<?php echo isset($_POST['api_key']) ? htmlspecialchars($_POST['api_key']) : ''; ?>"><br><br>
        <button type="submit" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
            Lấy danh sách models
        </button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['api_key'])) {
        $apiKey = $_POST['api_key'];
        
        // Gọi API để lấy danh sách models
        $url = "https://generativelanguage.googleapis.com/v1beta/models?key=" . urlencode($apiKey);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo '<div class="success">';
        echo '<h3>Response (HTTP ' . $httpCode . '):</h3>';
        echo '<pre>' . htmlspecialchars($response) . '</pre>';
        
        $data = json_decode($response, true);
        if ($data && isset($data['models'])) {
            echo '<h3>📝 Models hỗ trợ generateContent:</h3>';
            echo '<ul>';
            foreach ($data['models'] as $model) {
                if (isset($model['supportedGenerationMethods']) && 
                    in_array('generateContent', $model['supportedGenerationMethods'])) {
                    echo '<li><strong>' . htmlspecialchars($model['name']) . '</strong>';
                    if (isset($model['displayName'])) {
                        echo ' - ' . htmlspecialchars($model['displayName']);
                    }
                    echo '</li>';
                }
            }
            echo '</ul>';
        }
        echo '</div>';
    }
    ?>
</body>
</html>

