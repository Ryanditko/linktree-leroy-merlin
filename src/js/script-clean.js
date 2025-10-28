// Leroy Merlin Portal das Equipes - Sistema
// Sistema de acesso por email corporativo

class LeroyPortal {
    constructor() {
        // Emails especiais autorizados, fora do scopo da empresa.
        this.specialUsers = [
            'ryangame2005@gmail.com',
            'yryurodriguess@gmail.com', 
        ];
        
        this.currentUser = null;
        this.currentTeam = null;
        this.favorites = {};
        this.allSystems = [];
        this.teams = this.getTeamsData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllSystems();
        this.checkSession();
        this.hideLoadingScreen();
    }

    checkSession() {
        const savedUser = localStorage.getItem('leroyPortalUser');
        if (savedUser) {
            this.currentUser = savedUser;
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            if (this.currentUser) {
                this.showTeamSelection();
            } else {
                document.getElementById('loginScreen').classList.remove('hidden');
            }
        }, 2000);
    }

    // Carregar todos os sistemas para busca global
    loadAllSystems() {
        this.allSystems = [];
        Object.values(this.teams).forEach(team => {
            if (team.systems) {
                team.systems.forEach(system => {
                    this.allSystems.push({
                        ...system,
                        teamName: team.name,
                        teamKey: team.key
                    });
                });
            }
        });
    }

    // Carregar favoritos específicos do usuário
    loadUserFavorites() {
        if (!this.currentUser) return;
        const userFavorites = localStorage.getItem(`favorites_${this.currentUser}`);
        this.favorites = userFavorites ? JSON.parse(userFavorites) : {};
        this.updateFavoritesDisplay();
    }

    // Salvar favoritos específicos do usuário
    saveFavorites() {
        if (!this.currentUser) return;
        localStorage.setItem(`favorites_${this.currentUser}`, JSON.stringify(this.favorites));
        this.updateFavoritesDisplay();
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

        // Favorites button
        document.getElementById('favoritesBtn').addEventListener('click', () => {
            this.toggleFavorites();
        });

        // Toggle favorites visibility
        document.getElementById('toggleFavorites').addEventListener('click', () => {
            this.toggleFavorites();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.performGlobalSearch(e.target.value);
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

        // Search functionality
        document.getElementById('teamSearch')?.addEventListener('input', (e) => {
            this.filterTeams(e.target.value);
        });

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
        // Criar notificação toast simples
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600' : 'bg-blue-600'} text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    logout() {
        localStorage.removeItem('leroyPortalUser');
        this.currentUser = null;
        this.currentTeam = null;
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('email').value = '';
    }

    showTeamSelection() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('teamLinks').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('teamSelection').classList.remove('hidden');
        document.getElementById('breadcrumbPath').classList.add('hidden');
        
        // Update user email in header
        document.getElementById('userEmail').textContent = this.currentUser;
        
        this.loadUserFavorites();
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
        if (!teamData) return;
        
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
        const isFav = this.isFavorite(link.url);
        
        card.className = 'link-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer slide-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="${link.color} w-12 h-12 rounded-lg flex items-center justify-center">
                        <i class="${link.icon} text-white text-xl"></i>
                    </div>
                    <button class="favorite-btn ${isFav ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors" data-url="${link.url}" data-system='${JSON.stringify(link)}'>
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2 text-sm">${link.name}</h3>
                <p class="text-gray-600 text-xs mb-4">${link.description}</p>
                <div class="flex items-center justify-center">
                    <span class="inline-flex items-center text-xs text-gray-500 hover:text-green-600 transition-colors">
                        <i class="fas fa-external-link-alt mr-1"></i>
                        Acessar Sistema
                    </span>
                </div>
            </div>
        `;

        // Card click event
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                window.open(link.url, '_blank');
            }
        });

        // Favorite button event
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const system = JSON.parse(e.target.closest('.favorite-btn').dataset.system);
            const teamData = this.getTeamData(this.currentTeam);
            
            if (this.isFavorite(link.url)) {
                this.removeFavorite(link.url);
                e.target.closest('.favorite-btn').classList.remove('text-yellow-500');
                e.target.closest('.favorite-btn').classList.add('text-gray-400');
            } else {
                this.addToFavorites(system, teamData.name);
                e.target.closest('.favorite-btn').classList.remove('text-gray-400');
                e.target.closest('.favorite-btn').classList.add('text-yellow-500');
            }
        });

        return card;
    }

    getTeamData(teamId) {
        const teamInfo = this.teams[teamId];
        if (!teamInfo) return null;
        
        return {
            name: teamInfo.name,
            description: teamInfo.description,
            color: teamInfo.color,
            links: teamInfo.systems || []
        };
    }

    // Funções de favoritos
    isFavorite(url) {
        return this.favorites[url] !== undefined;
    }

    addToFavorites(system, teamName) {
        this.favorites[system.url] = {
            ...system,
            teamName: teamName,
            addedAt: new Date().toISOString()
        };
        this.saveFavorites();
    }

    removeFavorite(url) {
        delete this.favorites[url];
        this.saveFavorites();
    }

    updateFavoritesDisplay() {
        const favoritesList = document.getElementById('favoritesList');
        const noFavorites = document.getElementById('noFavorites');
        
        const favoritesArray = Object.values(this.favorites);
        
        if (favoritesArray.length === 0) {
            favoritesList.innerHTML = '';
            noFavorites.classList.remove('hidden');
            return;
        }
        
        noFavorites.classList.add('hidden');
        favoritesList.innerHTML = '';
        
        favoritesArray.forEach((fav, index) => {
            const card = this.createFavoriteCard(fav, index);
            favoritesList.appendChild(card);
        });
    }

    createFavoriteCard(favorite, index) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="${favorite.color} w-10 h-10 rounded-lg flex items-center justify-center">
                    <i class="${favorite.icon} text-white"></i>
                </div>
                <button class="remove-favorite text-red-400 hover:text-red-600 transition-colors" data-url="${favorite.url}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <h4 class="font-medium text-gray-800 text-sm mb-1">${favorite.name}</h4>
            <p class="text-xs text-gray-500 mb-2">${favorite.teamName}</p>
            <p class="text-xs text-gray-600">${favorite.description}</p>
        `;
        
        // Click para abrir
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                window.open(favorite.url, '_blank');
            }
        });
        
        // Remover favorito
        card.querySelector('.remove-favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFavorite(favorite.url);
        });
        
        return card;
    }

    toggleFavorites() {
        const favoritesSection = document.getElementById('favoritesSection');
        const isHidden = favoritesSection.classList.contains('hidden');
        
        if (isHidden) {
            favoritesSection.classList.remove('hidden');
            this.updateFavoritesDisplay();
        } else {
            favoritesSection.classList.add('hidden');
        }
    }

    animateTeamCards() {
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    performGlobalSearch(query) {
        if (!query.trim()) return;
        
        const results = this.allSystems.filter(system =>
            system.name.toLowerCase().includes(query.toLowerCase()) ||
            system.description.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log('Resultados da busca global:', results);
        // Implementar exibição dos resultados
    }

    filterTeams(query) {
        const teamCards = document.querySelectorAll('[data-team]');
        teamCards.forEach(card => {
            const teamName = card.querySelector('h3').textContent.toLowerCase();
            const teamDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (teamName.includes(query.toLowerCase()) || teamDesc.includes(query.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterLinks(query) {
        const linkCards = document.querySelectorAll('.link-card');
        linkCards.forEach(card => {
            const linkName = card.querySelector('h3').textContent.toLowerCase();
            const linkDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (linkName.includes(query.toLowerCase()) || linkDesc.includes(query.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    getTeamsData() {
        return {
            'marketplace': {
                name: 'Marketplace',
                key: 'marketplace',
                description: 'Gestão de Marketplace e E-commerce',
                color: '#FF6B35',
                systems: [
                    {
                        name: 'Salesforce',
                        description: 'Dashboard Marketplace',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001DgGZEA0/view',
                        icon: 'fas fa-cloud',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'V.A',
                        description: 'Virtual Assistant - Consulta Pedidos',
                        url: 'https://va.leroymerlin.com.br/va/LMOrder/consult-sales-order-filter?referer=pedido&lastAtend=true',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Correios',
                        description: 'Rastreamento de Encomendas',
                        url: 'https://rastreamento.correios.com.br/app/index.php#',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Mirakl',
                        description: 'Gestão de Pedidos Marketplace',
                        url: 'https://leroymerlin.mirakl.net/mmp/operator/order/0031351181-A',
                        icon: 'fas fa-store',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Mercado Livre',
                        description: 'Plataforma de Vendas',
                        url: 'https://www.mercadolivre.com.br/',
                        icon: 'fas fa-shopping-cart',
                        color: 'bg-yellow-500'
                    },
                    {
                        name: 'Backoffice Marketplace',
                        description: 'Dashboard Backoffice',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001DgGZEA0/view',
                        icon: 'fas fa-chart-line',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Autogestão',
                        description: 'Dashboard Autogestão',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001ATH9EAO/view?queryScope=userFolders',
                        icon: 'fas fa-cogs',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'Produtividade',
                        description: 'Relatórios de Produtividade',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00O6e000008peEUEAY/view?queryScope=userFolders&ws=%2Flightning%2Fr%2FReport%2F00O3i0000035vHREAY%2Fview',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'Relatório Tarefas',
                        description: 'Relatórios de Tarefas',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00O6e000008jFI5EAM/view',
                        icon: 'fas fa-tasks',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Tarefas',
                        description: 'Planilha de Controle de Tarefas',
                        url: 'https://docs.google.com/spreadsheets/d/1LEPP-cGJNb1pXUaiJjJBj8NVX6_qwapTbvaFAhA4bYs/edit?gid=1412456799#gid=1412456799',
                        icon: 'fas fa-list-check',
                        color: 'bg-teal-600'
                    }
                ]
            },
            'calm-n1': {
                name: 'CALM N1',
                key: 'calm-n1',
                description: 'Central de Atendimento - Nível 1',
                color: '#4F46E5',
                systems: [
                    {
                        name: 'Google Calendar',
                        description: 'Agenda e Calendário',
                        url: 'https://calendar.google.com/calendar/u/0/r',
                        icon: 'fas fa-calendar',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'SAP SuccessFactors',
                        description: 'Sistema de RH',
                        url: 'https://hcm19.sapsf.com/sf/start?_s.crb=upMvJlWM78xabBxhUX9qGEZ%252fidtq9uRS9N5GNHsa6%252bA%253d',
                        icon: 'fas fa-users',
                        color: 'bg-blue-700'
                    },
                    {
                        name: 'ServiceNow',
                        description: 'Portal de Serviços',
                        url: 'https://lmb.service-now.com/sp?id=index',
                        icon: 'fas fa-ticket-alt',
                        color: 'bg-green-700'
                    },
                    {
                        name: 'Salesforce',
                        description: 'CRM e Dashboard',
                        url: 'https://leroy.lightning.force.com/lightning',
                        icon: 'fas fa-cloud',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'VA - Venda assistida',
                        description: 'Venda assistida',
                        url: 'https://va.leroymerlin.com.br/va/lmbr/pt/BRL/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Portal do Transportador',
                        description: 'Sistema de Logística',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Central de Monitoramento',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-observation',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Safe',
                        description: 'Sistema de Segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-red-700'
                    },
                    {
                        name: 'Instala',
                        description: 'Sistema de Instalação',
                        url: 'https://instala.leroymerlin.com.br/cockpit',
                        icon: 'fas fa-tools',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Mirakl',
                        description: 'Marketplace Management',
                        url: 'https://leroymerlin.mirakl.net/login/fail/login_failed',
                        icon: 'fas fa-store',
                        color: 'bg-purple-600'
                    }
                ]
            },
            'backoffice': {
                name: 'Backoffice',
                key: 'backoffice',
                description: 'Operações de Backoffice e Suporte',
                color: '#059669',
                systems: [
                    {
                        name: 'Planilha de Controle',
                        description: 'Controle Principal de Operações',
                        url: 'https://docs.google.com/spreadsheets/d/1UZsIYMFNaiNIriescb1dW2NJESEsCTLdCmKyyutPWf4/edit?gid=0#gid=0',
                        icon: 'fas fa-table',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Salesforce Home',
                        description: 'Página Principal do Salesforce',
                        url: 'https://leroy.lightning.force.com/lightning/page/home',
                        icon: 'fas fa-home',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'VA Home',
                        description: 'Venda assistida - Home',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Instala - Detalhes',
                        description: 'Sistema de Instalação - Detalhes',
                        url: 'https://instala.leroymerlin.com.br/serviceOrder/detail/1956509/service',
                        icon: 'fas fa-wrench',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Mirakl - Pedidos',
                        description: 'Gestão de Pedidos Mirakl',
                        url: 'https://leroymerlin.mirakl.net/mmp/operator/order/all?period=%7B%22startDate%22%3A1747882800000%2C%22endDate%22%3A1755745200000%2C%22presetId%22%3A%22roma-range-calendar-filter-last-day-90%22%2C%22presetLabel%22%3A%22%C3%9Altimos+90+dias%22%7D&periodAuto=true&select-search=orderId&sort=order-list-date-created-id%2CDESC&limit=25',
                        icon: 'fas fa-shopping-bag',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'OneTrust',
                        description: 'Gestão de Privacidade',
                        url: 'https://app-eu.onetrust.com/welcome',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-blue-700'
                    },
                    {
                        name: 'ServiceNow Dashboard',
                        description: 'Dashboard de Serviços',
                        url: 'https://lmb.service-now.com/sp?id=ec_dashboard',
                        icon: 'fas fa-chart-pie',
                        color: 'bg-green-700'
                    },
                    {
                        name: 'Safe System',
                        description: 'Sistema de Segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-lock',
                        color: 'bg-red-700'
                    },
                    {
                        name: 'Equals',
                        description: 'Conciliador Financeiro',
                        url: 'https://app.equals.com.br/conciliador/empresa/home/show',
                        icon: 'fas fa-calculator',
                        color: 'bg-teal-600'
                    },
                    {
                        name: 'Fidelidade Backoffice',
                        description: 'Sistema de Fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/',
                        icon: 'fas fa-star',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Pagar.me',
                        description: 'Gateway de Pagamento',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-800'
                    },
                    {
                        name: 'Payment Portal',
                        description: 'Portal de Pagamentos',
                        url: 'https://payment.leroymerlin.com.br/',
                        icon: 'fas fa-money-bill',
                        color: 'bg-green-800'
                    },
                    {
                        name: 'Big Retail Portal',
                        description: 'Portal de Transações',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/consulta-generica-transacoes',
                        icon: 'fas fa-exchange-alt',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Sitef',
                        description: 'Sistema de TEF',
                        url: 'https://oauth.softwareexpress.com.br/auth/realms/sitefhospedado/protocol/openid-connect/auth?response_type=code&client_id=sitefweb&scope=openid&state=6EIMAYNUGIfxQc_soemVXz2wuUkAPjERTqsNorFnp88%3D&redirect_uri=https://sitef2.softwareexpress.com.br/sitefweb/login/oauth2/callback/keycloak&nonce=-glVozCUQ7-8ENB8rwI7PB3J7haNFHxLmNKIOo8nQqE',
                        icon: 'fas fa-terminal',
                        color: 'bg-gray-700'
                    },
                    {
                        name: 'Sistema Interno',
                        description: 'Sistema Interno de Gestão',
                        url: 'http://10.56.61.68/index.php?jscr=1',
                        icon: 'fas fa-desktop',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'Sprinklr',
                        description: 'Plataforma de Atendimento',
                        url: 'https://space.sprinklr.com/care/console',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-700'
                    },
                    {
                        name: 'Projuris',
                        description: 'Sistema Jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris/LoginAction.do?METHOD=login&session=false&LANG=1',
                        icon: 'fas fa-gavel',
                        color: 'bg-red-800'
                    },
                    {
                        name: 'Boitata',
                        description: 'Portal Boitata',
                        url: 'https://leroymerlin.com.br/boitata',
                        icon: 'fas fa-fire',
                        color: 'bg-orange-700'
                    }
                ]
            },
            'qualidade': {
                name: 'Qualidade',
                key: 'qualidade',
                description: 'Controle de Qualidade e Melhorias Contínuas',
                color: '#7C3AED',
                systems: [
                    {
                        name: 'Genesys',
                        description: 'Analytics e conversas',
                        url: 'https://apps.mypurecloud.com/directory/#/analytics',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'Proa',
                        description: 'Portal de conversação',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'VA',
                        description: 'Venda assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    }
                ]
            }
        };
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new LeroyPortal();
});
