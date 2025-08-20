// Leroy Merlin Portal das Equipes - Sistema Simples
// Sistema de acesso por email corporativo

class LeroyPortal {
    constructor() {
        // Emails especiais autorizados
        this.specialUsers = [
            'ryangame2005@gmail.com',
            'yryurodriguess@gmail.com'
        ];
        
        this.currentUser = null;
        this.currentTeam = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSession();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation buttons
        document.getElementById('homeBtn')?.addEventListener('click', () => {
            this.showTeamSelection();
        });

        document.getElementById('backToTeamsBtn')?.addEventListener('click', () => {
            this.showTeamSelection();
        });

        // Team cards
        document.querySelectorAll('[data-team]').forEach(card => {
            card.addEventListener('click', () => {
                const teamId = card.getAttribute('data-team');
                this.showTeamLinks(teamId);
            });
        });

        // Team search
        document.getElementById('teamSearch')?.addEventListener('input', (e) => {
            this.filterTeams(e.target.value);
        });

        // Link search
        document.getElementById('linkSearch')?.addEventListener('input', (e) => {
            this.filterLinks(e.target.value);
        });
    }

    handleLogin() {
        const email = document.getElementById('email').value.trim().toLowerCase();
        
        if (!email) {
            this.showError('Por favor, digite seu email.');
            return;
        }

        // Verificar se é um dos emails especiais ou email corporativo
        if (this.specialUsers.includes(email) || email.endsWith('@leroymerlin.com.br')) {
            this.currentUser = email;
            localStorage.setItem('leroyPortalUser', email);
            this.showTeamSelection();
            this.showNotification('Login realizado com sucesso!', 'success');
        } else {
            this.showError('Acesso restrito a funcionários da Leroy Merlin.');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        if (type === 'success') {
            notification.classList.add('bg-green-500', 'text-white');
        } else if (type === 'warning') {
            notification.classList.add('bg-yellow-500', 'text-white');
        } else {
            notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}-circle mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    checkSession() {
        const savedUser = localStorage.getItem('leroyPortalUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.showTeamSelection();
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1000);
    }

    logout() {
        localStorage.removeItem('leroyPortalUser');
        this.currentUser = null;
        this.currentTeam = null;
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('email').value = '';
        this.showNotification('Logout realizado com sucesso!', 'success');
    }

    showTeamSelection() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('teamLinks').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('teamSelection').classList.remove('hidden');
        document.getElementById('breadcrumbPath').classList.add('hidden');
        
        // Update user email in header
        document.getElementById('userEmail').textContent = this.currentUser;
        
        this.animateTeamCards();
    }

    showTeamLinks(teamId) {
        this.currentTeam = teamId;
        document.getElementById('teamSelection').classList.add('hidden');
        document.getElementById('teamLinks').classList.remove('hidden');
        document.getElementById('breadcrumbPath').classList.remove('hidden');
        
        this.renderTeamLinks(teamId);
    }

    renderTeamLinks(teamId) {
        const teamData = this.getTeamData(teamId);
        const container = document.getElementById('linksGrid');
        const teamTitle = document.getElementById('teamTitle');
        const teamDescription = document.getElementById('teamDescription');
        const linkCount = document.getElementById('linkCount');
        const currentTeam = document.getElementById('currentTeam');
        
        teamTitle.textContent = teamData.name;
        teamDescription.textContent = teamData.description;
        linkCount.textContent = `${teamData.links.length} sistemas disponíveis`;
        currentTeam.textContent = teamData.name;
        
        container.innerHTML = '';
        
        teamData.links.forEach((link, index) => {
            const card = this.createLinkCard(link, index);
            container.appendChild(card);
        });
    }

    createLinkCard(link, index) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer link-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="p-6">
                <div class="${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <i class="${link.icon} text-white text-xl"></i>
                </div>
                <h3 class="font-semibold text-gray-800 text-center mb-2 text-sm">${link.name}</h3>
                <p class="text-gray-600 text-xs text-center mb-4">${link.description}</p>
                <div class="flex items-center justify-center">
                    <span class="inline-flex items-center text-xs text-gray-500 hover:text-green-600 transition-colors">
                        <i class="fas fa-external-link-alt mr-1"></i>
                        Acessar
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.openLink(link.url, link.name);
        });

        return card;
    }

    openLink(url, name) {
        if (url === '#') {
            this.showNotification('Sistema em desenvolvimento', 'warning');
            return;
        }
        this.showNotification(`Abrindo ${name}...`, 'success');
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    animateTeamCards() {
        const cards = document.querySelectorAll('.team-card');
        cards.forEach((card, index) => {
            card.classList.remove('slide-in');
            setTimeout(() => {
                card.classList.add('slide-in');
            }, index * 100);
        });
    }

    filterTeams(searchTerm) {
        const cards = document.querySelectorAll('.team-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const teamName = card.querySelector('h3').textContent.toLowerCase();
            const teamDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (teamName.includes(term) || teamDesc.includes(term)) {
                card.style.display = 'block';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
    }

    filterLinks(searchTerm) {
        const cards = document.querySelectorAll('.link-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const linkName = card.querySelector('h3').textContent.toLowerCase();
            const linkDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (linkName.includes(term) || linkDesc.includes(term)) {
                card.style.display = 'block';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
    }

    getTeamData(teamId) {
        const teams = {
            'qualidade': {
                name: 'QUALIDADE',
                description: 'Controle de Qualidade e Monitoramento',
                links: [
                    {
                        name: 'Genesys',
                        description: 'Analytics e relatórios de conversas',
                        url: 'https://apps.mypurecloud.com/directory/#/analytics',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-500'
                    },
                    {
                        name: 'Proa',
                        description: 'Portal de conversas e atendimento',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-500'
                    },
                    {
                        name: 'VA Leroy Merlin',
                        description: 'Virtual Assistant da Leroy Merlin',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-500'
                    },
                    {
                        name: 'Portal do Transportador',
                        description: 'Gestão de transportadores',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-orange-500'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Monitoramento central de operações',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-broadcast',
                        color: 'bg-red-500'
                    },
                    {
                        name: 'UNIGIS',
                        description: 'Sistema de gestão logística',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-map-marked-alt',
                        color: 'bg-indigo-500'
                    },
                    {
                        name: 'Portal Instala',
                        description: 'Cockpit de serviços de instalação',
                        url: 'https://instala.leroymerlin.com.br/cockpit',
                        icon: 'fas fa-tools',
                        color: 'bg-yellow-500'
                    },
                    {
                        name: 'Mirakl',
                        description: 'Plataforma de marketplace',
                        url: 'https://leroymerlin.mirakl.net/login',
                        icon: 'fas fa-store',
                        color: 'bg-pink-500'
                    },
                    {
                        name: 'SAFE',
                        description: 'Sistema de segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'P2K',
                        description: 'Portal Big Retail',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/home',
                        icon: 'fas fa-shopping-cart',
                        color: 'bg-teal-500'
                    },
                    {
                        name: 'Projuris',
                        description: 'Sistema jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-gavel',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'Hugme',
                        description: 'Plataforma de engajamento',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-red-400'
                    },
                    {
                        name: 'Consumidor.gov',
                        description: 'Portal do consumidor',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-user-shield',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Pagar.me',
                        description: 'Sistema de pagamentos',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-400'
                    },
                    {
                        name: 'Fidelidade',
                        description: 'Backoffice do programa de fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/home-login',
                        icon: 'fas fa-star',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Sitef',
                        description: 'Sistema de transações eletrônicas',
                        url: 'https://sitef2.softwareexpress.com.br/sitefweb/pages/inicial.zeus',
                        icon: 'fas fa-receipt',
                        color: 'bg-purple-600'
                    }
                ]
            },
            'calm-n1': {
                name: 'CALM N1',
                description: 'Central de Atendimento Nível 1',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'gestao-entrega-n1': {
                name: 'GESTÃO DA ENTREGA N1',
                description: 'Gerenciamento de Entregas Nível 1',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'marketplace': {
                name: 'MARKETPLACE',
                description: 'Gestão de Marketplace',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'backoffice': {
                name: 'BACKOFFICE OPERACIONAL',
                description: 'Operações Internas',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'gestao-entrega-n2': {
                name: 'GESTÃO DA ENTREGA N2',
                description: 'Gerenciamento Avançado de Entregas',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'eficiencia': {
                name: 'EFICIÊNCIA OPERACIONAL',
                description: 'Otimização de Processos',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'ouvidoria': {
                name: 'OUVIDORIA',
                description: 'Atendimento ao Cliente Nível 3',
                links: [
                    {
                        name: 'Em construção',
                        description: 'Links em desenvolvimento',
                        url: '#',
                        icon: 'fas fa-hammer',
                        color: 'bg-gray-500'
                    }
                ]
            }
        };

        return teams[teamId] || {
            name: 'Equipe não encontrada',
            description: 'Esta equipe ainda não foi configurada',
            links: []
        };
    }
}

// Inicializar o portal quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.leroyPortal = new LeroyPortal();
});

// Adicionar estilos CSS dinâmicos
const style = document.createElement('style');
style.textContent = `
    .slide-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .link-card {
        animation: fadeInScale 0.6s ease-out forwards;
        opacity: 0;
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .team-card:hover {
        transform: translateY(-5px) scale(1.02);
    }
    
    .link-card:hover {
        transform: translateY(-3px) scale(1.05);
    }
    
    /* Animações para ícones no header */
    .rotate-slow {
        animation: rotate 10s linear infinite;
    }
    
    .float-up-down {
        animation: float 3s ease-in-out infinite;
    }
    
    .pulse-soft {
        animation: pulseSoft 2s ease-in-out infinite;
    }
    
    .bounce-gentle {
        animation: bounceGentle 2s ease-in-out infinite;
    }
    
    .logo-pulse {
        animation: logoPulse 3s ease-in-out infinite;
    }
    
    .pulse-dot {
        animation: pulseDot 1.5s ease-in-out infinite;
    }
    
    .animate-expand {
        animation: expand 1s ease-out;
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes pulseSoft {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    
    @keyframes bounceGentle {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes logoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes pulseDot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    
    @keyframes expand {
        from { width: 0; }
        to { width: 5rem; }
    }
    
    .ripple {
        position: relative;
        overflow: hidden;
    }
    
    .ripple:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .ripple:hover:before {
        width: 300px;
        height: 300px;
    }
`;
document.head.appendChild(style);
