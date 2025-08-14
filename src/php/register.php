<?php
require_once 'config.php';

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método não permitido', 405);
}

// Obter dados do formulário
$firstName = sanitize($_POST['firstName'] ?? '');
$lastName = sanitize($_POST['lastName'] ?? '');
$email = sanitize($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';
$university = sanitize($_POST['university'] ?? '');
$semester = sanitize($_POST['semester'] ?? '');
$terms = isset($_POST['terms']);
$newsletter = isset($_POST['newsletter']);

// Validações
$errors = [];

if (empty($firstName)) {
    $errors[] = 'Nome é obrigatório';
}

if (empty($lastName)) {
    $errors[] = 'Sobrenome é obrigatório';
}

if (empty($email)) {
    $errors[] = 'Email é obrigatório';
} elseif (!validateEmail($email)) {
    $errors[] = 'Email inválido';
}

if (empty($password)) {
    $errors[] = 'Senha é obrigatória';
} elseif (strlen($password) < PASSWORD_MIN_LENGTH) {
    $errors[] = 'Senha deve ter pelo menos ' . PASSWORD_MIN_LENGTH . ' caracteres';
}

if ($password !== $confirmPassword) {
    $errors[] = 'Senhas não conferem';
}

if (!$terms) {
    $errors[] = 'Você deve aceitar os termos de uso';
}

// Se há erros, retornar
if (!empty($errors)) {
    errorResponse(implode(', ', $errors));
}

try {
    $pdo = getDBConnection();
    
    // Verificar se email já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        errorResponse('Este email já está cadastrado');
    }
    
    // Hash da senha
    $hashedPassword = hashPassword($password);
    
    // Token de verificação de email
    $emailToken = generateToken();
    
    // Definir período de teste (7 dias)
    $trialExpires = date('Y-m-d H:i:s', strtotime('+7 days'));
    
    // Inserir usuário
    $stmt = $pdo->prepare("
        INSERT INTO users (
            first_name, last_name, email, password, university, semester,
            email_verification_token, trial_expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $firstName, $lastName, $email, $hashedPassword,
        $university, $semester, $emailToken, $trialExpires
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Criar configurações padrão para o usuário
    $stmt = $pdo->prepare("INSERT INTO user_settings (user_id) VALUES (?)");
    $stmt->execute([$userId]);
    
    // Iniciar sessão
    startSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $firstName . ' ' . $lastName;
    $_SESSION['user_type'] = 'user';
    $_SESSION['is_premium'] = false;
    $_SESSION['trial_expires'] = $trialExpires;
    
    // Log da ação
    error_log("Novo usuário registrado: $email (ID: $userId)");
    
    // Enviar email de verificação (implementar posteriormente)
    // sendVerificationEmail($email, $emailToken);
    
    // Resposta de sucesso
    successResponse([
        'user_id' => $userId,
        'redirect' => '/dashboard.html',
        'trial_expires' => $trialExpires
    ], 'Conta criada com sucesso! Bem-vindo ao MedFlash!');
    
} catch (PDOException $e) {
    error_log("Erro no registro: " . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
} catch (Exception $e) {
    error_log("Erro no registro: " . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
}
?>

