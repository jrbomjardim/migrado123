// JavaScript principal do MedFlash
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initNavbar();
    initHero();
    initScrollAnimations();
    initFlashcardDemo();
});

// Inicializar navbar
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Efeito de scroll no navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Menu mobile
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Inicializar seção hero
function initHero() {
    // Scroll suave para âncoras
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Altura do navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicializar animações de scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem ser animados
    const animatedElements = document.querySelectorAll('.feature-card, .about-text, .about-image');
    animatedElements.forEach(el => observer.observe(el));
}

// Inicializar demo do flashcard
function initFlashcardDemo() {
    const flashcardDemo = document.querySelector('.flashcard-demo');
    const card = document.querySelector('.card');
    
    if (!flashcardDemo || !card) return;
    
    let isFlipped = false;
    
    // Dados dos flashcards para demo
    const demoCards = [
        {
            question: "Qual é a função do coração?",
            answer: "Bombear sangue para todo o corpo, fornecendo oxigênio e nutrientes aos tecidos."
        },
        {
            question: "O que é a pressão arterial?",
            answer: "A força exercida pelo sangue contra as paredes das artérias durante a circulação."
        },
        {
            question: "Quantas câmaras tem o coração humano?",
            answer: "Quatro câmaras: dois átrios (direito e esquerdo) e dois ventrículos (direito e esquerdo)."
        }
    ];
    
    let currentCardIndex = 0;
    
    // Função para virar o card
    function flipCard() {
        if (isFlipped) {
            // Mostrar pergunta
            card.innerHTML = `
                <h3>${demoCards[currentCardIndex].question}</h3>
                <div class="card-flip-hint">
                    <i class="fas fa-sync-alt"></i>
                    Clique para ver a resposta
                </div>
            `;
            card.style.background = 'white';
            card.style.color = '#1f2937';
        } else {
            // Mostrar resposta
            card.innerHTML = `
                <h3>Resposta:</h3>
                <p>${demoCards[currentCardIndex].answer}</p>
                <div class="card-flip-hint">
                    <i class="fas fa-sync-alt"></i>
                    Clique para próxima pergunta
                </div>
            `;
            card.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
            card.style.color = 'white';
        }
        
        isFlipped = !isFlipped;
        
        // Se voltou para pergunta, avançar para próximo card
        if (isFlipped === false) {
            currentCardIndex = (currentCardIndex + 1) % demoCards.length;
        }
    }
    
    // Adicionar evento de clique
    card.addEventListener('click', flipCard);
    
    // Auto-flip a cada 4 segundos
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            flipCard();
        }
    }, 4000);
}

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Função para formatar números
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// Função para animar contadores
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(start));
        }
    }, 16);
}

// Função para lazy loading de imagens
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Função para mostrar toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover após duração especificada
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Função para obter ícone do toast
function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Função para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Adicionar CSS para animações
const animationCSS = `
.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.toast.show {
    transform: translateX(0);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toast-success { border-left: 4px solid #22c55e; }
.toast-error { border-left: 4px solid #ef4444; }
.toast-warning { border-left: 4px solid #f59e0b; }
.toast-info { border-left: 4px solid #3b82f6; }

.toast-success i { color: #22c55e; }
.toast-error i { color: #ef4444; }
.toast-warning i { color: #f59e0b; }
.toast-info i { color: #3b82f6; }

.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazy.loaded {
    opacity: 1;
}

/* Menu mobile */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 70px;
        left: -100%;
        width: 100%;
        height: calc(100vh - 70px);
        background: white;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-top: 2rem;
        transition: left 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .nav-link {
        font-size: 1.2rem;
        margin: 1rem 0;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
}
`;

// Injetar CSS das animações
const style = document.createElement('style');
style.textContent = animationCSS;
document.head.appendChild(style);

// Exportar funções para uso global
window.MedFlash = {
    showToast,
    formatNumber,
    animateCounter,
    debounce,
    throttle,
    isMobile
};

