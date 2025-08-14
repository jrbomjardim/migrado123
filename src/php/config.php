<?php
// Configurações do banco de dados
define('DB_HOST', '193.203.175.155');
define('DB_NAME', 'u577937778_migrado');
define('DB_USER', 'u577937778_usuariomigrado');
define('DB_PASS', 'W4nmjohq12@');
define('DB_CHARSET', 'utf8mb4');

// Configurações da aplicação
define('APP_NAME', 'MedFlash');
define('APP_URL', 'http://localhost');
define('SESSION_TIMEOUT', 3600); // 1 hora

// Configurações de segurança
define('JWT_SECRET', 'medflash_secret_key_2024');
define('PASSWORD_MIN_LENGTH', 8);

// Configurações do Mercado Pago
define('MP_ACCESS_TOKEN', ''); // Será configurado posteriormente
define('MP_PUBLIC_KEY', ''); // Será configurado posteriormente

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Função para conectar ao banco de dados
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erro de conexão com o banco: " . $e->getMessage());
        die("Erro de conexão com o banco de dados");
    }
}

// Função para iniciar sessão
function startSession() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    startSession();
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Função para verificar se usuário é admin
function isAdmin() {
    startSession();
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';
}

// Função para logout
function logout() {
    startSession();
    session_destroy();
    header('Location: /login.html');
    exit;
}

// Função para sanitizar dados
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Função para validar email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Função para hash de senha
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Função para verificar senha
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Função para gerar token aleatório
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Headers para API JSON
function setJSONHeaders() {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Função para resposta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    setJSONHeaders();
    echo json_encode($data);
    exit;
}

// Função para resposta de erro
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message, 'success' => false], $status);
}

// Função para resposta de sucesso
function successResponse($data = [], $message = 'Sucesso') {
    jsonResponse(['data' => $data, 'message' => $message, 'success' => true]);
}
?>

