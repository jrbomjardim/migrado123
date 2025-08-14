// Funções de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Configurar formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Configurar formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Validação de senha em tempo real
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', validatePasswordStrength);
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
        }
    }
});

// Função para mostrar/ocultar loading
function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.toggle('active', show);
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Função para lidar com login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    showLoading(true);
    
    try {
        const response = await fetch('src/php/login.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('user_data', JSON.stringify(data.data));
            
            // Redirecionar após um pequeno delay
            setTimeout(() => {
                window.location.href = data.data.redirect;
            }, 1000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Função para lidar com registro
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validações do lado cliente
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('As senhas não conferem', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('A senha deve ter pelo menos 8 caracteres', 'error');
        return;
    }
    
    if (!formData.get('terms')) {
        showNotification('Você deve aceitar os termos de uso', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('src/php/register.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('user_data', JSON.stringify(data.data));
            
            // Redirecionar após um pequeno delay
            setTimeout(() => {
                window.location.href = data.data.redirect;
            }, 1500);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Função para alternar visibilidade da senha
function togglePassword(inputId = 'password') {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Função para validar força da senha
function validatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = 'Muito fraca';
    let color = '#ef4444';
    
    // Critérios de força
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    
    // Determinar label e cor
    if (strength >= 100) {
        strengthLabel = 'Muito forte';
        color = '#22c55e';
    } else if (strength >= 75) {
        strengthLabel = 'Forte';
        color = '#10b981';
    } else if (strength >= 50) {
        strengthLabel = 'Média';
        color = '#f59e0b';
    } else if (strength >= 25) {
        strengthLabel = 'Fraca';
        color = '#f97316';
    }
    
    // Aplicar estilos
    strengthBar.style.width = Math.min(strength, 100) + '%';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = strengthLabel;
    strengthText.style.color = color;
}

// Função para validar confirmação de senha
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#ef4444';
        confirmInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
        confirmInput.style.borderColor = '#e5e7eb';
        confirmInput.style.boxShadow = 'none';
    }
}

// Função para logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('user_data');
        window.location.href = '/login.html';
    }
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    const userData = localStorage.getItem('user_data');
    return userData !== null;
}

// Função para obter dados do usuário
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Função para proteger páginas que requerem login
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Função para proteger páginas de admin
function requireAdmin() {
    const userData = getUserData();
    if (!userData || userData.user_type !== 'admin') {
        window.location.href = '/dashboard.html';
        return false;
    }
    return true;
}

// CSS para notificações (injetado dinamicamente)
const notificationCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    border-left: 4px solid #22c55e;
}

.notification-error {
    border-left: 4px solid #ef4444;
}

.notification-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
}

.notification-success .notification-content i {
    color: #22c55e;
}

.notification-error .notification-content i {
    color: #ef4444;
}

.notification-content span {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
}

.notification-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
}

.notification-close:hover {
    background: #f3f4f6;
    color: #374151;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 640px) {
    .notification {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
`;

// Injetar CSS das notificações
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);

