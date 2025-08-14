#!/bin/bash

# Script de Deploy para Hostinger
# Este script automatiza o deploy do projeto MedFlash no servidor Hostinger

echo "🚀 Iniciando deploy do MedFlash para Hostinger..."

# Configurações do servidor
SERVER_HOST="147.79.84.102"
SERVER_PORT="65002"
SERVER_USER="u577937778"
REMOTE_PATH="/home/u577937778/domains/snow-chinchilla-975794.hostingersite.com/public_html"
LOCAL_PATH="/home/ubuntu/migrado123"

# Cores para output
RED=\'\\033[0;31m\'
GREEN=\'\\033[0;32m\'
YELLOW=\'\\033[1;33m\'
BLUE=\'\\033[0;34m\'
NC=\'\\033[0m\' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +\'%Y-%m-%d %H:%M:%S\')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se o Git está limpo
if [[ -n $(git status --porcelain) ]]; then
    warning "Existem alterações não commitadas. Fazendo commit automático..."
    git add .
    git commit -m "Deploy automático - $(date +\'%Y-%m-%d %H:%M:%S\')"
fi

# Push para GitHub
log "Enviando alterações para GitHub..."
if git push origin main; then
    log "✅ Push para GitHub realizado com sucesso"
else
    error "❌ Falha no push para GitHub"
    exit 1
fi

# Conectar via SSH e fazer deploy
log "Conectando ao servidor Hostinger via SSH..."

# Criar script temporário para execução remota
cat > /tmp/deploy_commands.sh << \'EOF\'
#!/bin/bash

echo "🔄 Executando deploy no servidor..."

# Navegar para o diretório web
cd $REMOTE_PATH

# Fazer backup do site atual (se existir)
if [ -d "backup" ]; then
    rm -rf backup_old
    mv backup backup_old
fi
mkdir -p backup

# Fazer backup dos arquivos atuais
if [ -f "index.html" ]; then
    echo "📦 Fazendo backup dos arquivos atuais..."
    cp -r * backup/ 2>/dev/null || true
fi

# Clonar ou atualizar repositório
if [ -d ".git" ]; then
    echo "🔄 Atualizando repositório existente..."
    git fetch origin
    git reset --hard origin/main
else
    echo "📥 Clonando repositório..."
    # Limpar diretório (mantendo backup)
    find . -maxdepth 1 -not -name \'backup*\' -not -name \'.\' -not -name \'..\' -exec rm -rf {} \; 2>/dev/null || true
    
    # Clonar repositório
    git clone https://github.com/jrbomjardim/migrado123.git temp_repo
    
    # Mover arquivos do repositório para o diretório atual
    mv temp_repo/* . 2>/dev/null || true
    mv temp_repo/.* . 2>/dev/null || true
    rm -rf temp_repo
fi

# Configurar permissões
echo "🔐 Configurando permissões..."
find . -type f -name "*.php" -exec chmod 644 {} \;
find . -type f -name "*.html" -exec chmod 644 {} \;
find . -type f -name "*.css" -exec chmod 644 {} \;
find . -type f -name "*.js" -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Configurar arquivo de configuração específico para produção
if [ -f "src/php/config.php" ]; then
    echo "⚙️ Configurando ambiente de produção..."
    # Aqui você pode fazer ajustes específicos para produção
    # Por exemplo, alterar URLs, configurações de debug, etc.
fi

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site disponível em: https://seu-dominio.com"

# Mostrar status dos arquivos principais
echo "📋 Status dos arquivos principais:"
ls -la index.html src/php/config.php src/css/style.css 2>/dev/null || echo "Alguns arquivos podem não estar visíveis"

EOF

# Executar comandos no servidor via SSH
if ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST \'bash -s\' < /tmp/deploy_commands.sh; then
    log "✅ Deploy realizado com sucesso no servidor Hostinger!"
    info "🌐 Seu site está disponível no domínio configurado na Hostinger"
    info "📊 Não esqueça de executar o script SQL no phpMyAdmin para criar as tabelas"
else
    error "❌ Falha no deploy para o servidor"
    exit 1
fi

# Limpar arquivo temporário
rm -f /tmp/deploy_commands.sh

log "🎉 Deploy completo! Próximos passos:"
echo "1. ✅ Código enviado para GitHub"
echo "2. ✅ Arquivos sincronizados no servidor Hostinger"
echo "3. 🔄 Execute o arquivo database.sql no phpMyAdmin"
echo "4. ⚙️ Configure o domínio na Hostinger se necessário"
echo "5. 🧪 Teste todas as funcionalidades do site"

echo ""
info "📝 Para acessar o servidor SSH manualmente:"
echo "ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
echo ""
info "📊 Para acessar o phpMyAdmin:"
echo "https://193.203.175.155/phpmyadmin"
echo ""
info "🗂️ Arquivos do site estão em:"
echo "/home/u577937778/domains/snow-chinchilla-975794.hostingersite.com/public_html"

