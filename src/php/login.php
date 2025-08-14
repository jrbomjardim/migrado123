<?php
require_once 'config.php';

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método não permitido', 405);
}

// Obter dados do formulário
$email = sanitize($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']);

// Validações
$errors = [];

if (empty($email)) {
    $errors[] = 'Email é obrigatório';
} elseif (!validateEmail($email)) {
    $errors[] = 'Email inválido';
}

if (empty($password)) {
    $errors[] = 'Senha é obrigatória';
}

// Se há erros, retornar
if (!empty($errors)) {
    errorResponse(implode(', ', $errors));
}

try {
    $pdo = getDBConnection();
    
    // Buscar usuário pelo email
    $stmt = $pdo->prepare("
        SELECT id, first_name, last_name, email, password, user_type, 
               is_premium, premium_expires_at, trial_expires_at, trial_used,
               email_verified, last_login
        FROM users 
        WHERE email = ? AND is_active = 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !verifyPassword($password, $user['password'])) {
        errorResponse('Email ou senha incorretos');
    }
    
    // Verificar se email foi verificado (opcional - pode ser implementado depois)
    // if (!$user['email_verified']) {
    //     errorResponse('Por favor, verifique seu email antes de fazer login');
    // }
    
    // Atualizar último login
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Verificar status premium/trial
    $isPremium = false;
    $trialActive = false;
    $premiumExpires = null;
    $trialExpires = null;
    
    if ($user['is_premium'] && $user['premium_expires_at'] > date('Y-m-d H:i:s')) {
        $isPremium = true;
        $premiumExpires = $user['premium_expires_at'];
    } elseif (!$user['trial_used'] && $user['trial_expires_at'] > date('Y-m-d H:i:s')) {
        $trialActive = true;
        $trialExpires = $user['trial_expires_at'];
    }
    
    // Iniciar sessão
    startSession();
    
    // Configurar tempo de vida da sessão
    if ($remember) {
        // Lembrar por 30 dias
        ini_set('session.gc_maxlifetime', 30 * 24 * 3600);
        session_set_cookie_params(30 * 24 * 3600);
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_first_name'] = $user['first_name'];
    $_SESSION['user_last_name'] = $user['last_name'];
    $_SESSION['user_type'] = $user['user_type'];
    $_SESSION['is_premium'] = $isPremium;
    $_SESSION['trial_active'] = $trialActive;
    $_SESSION['premium_expires'] = $premiumExpires;
    $_SESSION['trial_expires'] = $trialExpires;
    $_SESSION['login_time'] = time();
    
    // Log da ação
    error_log("Login realizado: {$user['email']} (ID: {$user['id']})");
    
    // Determinar redirecionamento baseado no tipo de usuário
    $redirect = '/dashboard.html';
    if ($user['user_type'] === 'admin') {
        $redirect = '/admin/dashboard.html';
    }
    
    // Resposta de sucesso
    successResponse([
        'user_id' => $user['id'],
        'user_name' => $user['first_name'] . ' ' . $user['last_name'],
        'user_type' => $user['user_type'],
        'is_premium' => $isPremium,
        'trial_active' => $trialActive,
        'redirect' => $redirect
    ], 'Login realizado com sucesso!');
    
} catch (PDOException $e) {
    error_log("Erro no login: " . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
}
?>

