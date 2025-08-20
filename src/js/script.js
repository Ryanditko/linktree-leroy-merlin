// Leroy Merlin Portal das Equipes - Sistema Profissional
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
        this.favorites = {};
        this.allSystems = [];
        this.teams = this.getTeamsData(); // Carregar dados das equipes
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
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full max-w-sm`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        
        notification.classList.add(...colors[type].split(' '));
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    checkSession() {
        const savedUser = localStorage.getItem('leroyPortalUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.loadUserFavorites();
            this.showTeamSelection();
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            
            // Se não há usuário logado, mostrar login
            if (!this.currentUser) {
                document.getElementById('loginScreen').classList.remove('hidden');
            } else {
                // Se há usuário logado, mostrar a aplicação principal
                document.getElementById('mainApp').classList.remove('hidden');
                document.getElementById('teamSelection').classList.remove('hidden');
                this.loadUserFavorites();
                this.updateUserInfo();
            }
        }, 1500);
    }

    // Atualizar informações do usuário no header
    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser;
        }
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

    // Toggle favorites section
    toggleFavorites() {
        const favoritesSection = document.getElementById('favoritesSection');
        const toggleBtn = document.getElementById('toggleFavorites');
        
        if (favoritesSection.classList.contains('hidden')) {
            favoritesSection.classList.remove('hidden');
            toggleBtn.textContent = 'Ocultar';
            this.updateFavoritesDisplay();
        } else {
            favoritesSection.classList.add('hidden');
            toggleBtn.textContent = 'Mostrar';
        }
    }

    // Update favorites display
    updateFavoritesDisplay() {
        const favoritesList = document.getElementById('favoritesList');
        const noFavorites = document.getElementById('noFavorites');
        
        favoritesList.innerHTML = '';
        
        const favoriteItems = Object.values(this.favorites);
        
        if (favoriteItems.length === 0) {
            noFavorites.classList.remove('hidden');
            return;
        }
        
        noFavorites.classList.add('hidden');
        
        favoriteItems.forEach(item => {
            const card = this.createFavoriteCard(item);
            favoritesList.appendChild(card);
        });
    }

    // Create favorite card
    createFavoriteCard(item) {;
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer';
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="${item.icon} text-green-600"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800 text-sm">${item.name}</h4>
                        <p class="text-xs text-gray-500">${item.teamName}</p>
                    </div>
                </div>
                <button class="remove-favorite text-red-500 hover:text-red-700" data-url="${item.url}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add click to open
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                window.open(item.url, '_blank');
            }
        });
        
        // Add remove functionality
        card.querySelector('.remove-favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFavorite(item.url);
        });
        
        return card;
    }

    // Add to favorites
    addToFavorites(system, teamName) {
        if (!this.currentUser) return;
        
        this.favorites[system.url] = {
            ...system,
            teamName,
            addedAt: new Date().toISOString()
        };
        
        this.saveFavorites();
        this.showNotification('Adicionado aos favoritos!', 'success');
    }

    // Remove from favorites
    removeFavorite(url) {
        if (!this.currentUser) return;
        
        delete this.favorites[url];
        this.saveFavorites();
        this.showNotification('Removido dos favoritos!', 'success');
    }

    // Check if system is favorite
    isFavorite(url) {
        return this.favorites.hasOwnProperty(url);
    }

    // Perform global search
    performGlobalSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        const results = this.allSystems.filter(system => 
            system.name.toLowerCase().includes(query.toLowerCase()) ||
            system.description.toLowerCase().includes(query.toLowerCase()) ||
            system.teamName.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displaySearchResults(results, query);
    }

    // Display search results
    displaySearchResults(results, query) {
        // Create search results overlay
        let overlay = document.getElementById('searchOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'searchOverlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            
            const container = document.createElement('div');
            container.className = 'bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto';
            
            const header = document.createElement('div');
            header.className = 'flex items-center justify-between p-4 border-b';
            header.innerHTML = `
                <h3 class="text-lg font-semibold">Resultados da Busca</h3>
                <button id="closeSearch" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const content = document.createElement('div');
            content.id = 'searchResults';
            content.className = 'p-4';
            
            container.appendChild(header);
            container.appendChild(content);
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            
            // Close search
            document.getElementById('closeSearch').addEventListener('click', () => {
                this.clearSearchResults();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.clearSearchResults();
                }
            });
        }
        
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-3xl mb-4"></i>
                    <p>Nenhum resultado encontrado para "${query}"</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = `
                <p class="text-sm text-gray-600 mb-4">${results.length} resultado(s) encontrado(s) para "${query}"</p>
                <div class="space-y-2">
                    ${results.map(system => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer search-item" data-url="${system.url}">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <i class="${system.icon} text-green-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-800">${system.name}</h4>
                                    <p class="text-xs text-gray-500">${system.teamName} • ${system.description}</p>
                                </div>
                            </div>
                            <button class="favorite-btn ${this.isFavorite(system.url) ? 'text-yellow-500' : 'text-gray-400'}" data-system='${JSON.stringify(system)}'>
                                <i class="fas fa-star"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Add click events
            searchResults.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.favorite-btn')) {
                        window.open(item.dataset.url, '_blank');
                    }
                });
            });
            
            // Add favorite events
            searchResults.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const system = JSON.parse(btn.dataset.system);
                    if (this.isFavorite(system.url)) {
                        this.removeFavorite(system.url);
                        btn.classList.remove('text-yellow-500');
                        btn.classList.add('text-gray-400');
                    } else {
                        this.addToFavorites(system, system.teamName);
                        btn.classList.remove('text-gray-400');
                        btn.classList.add('text-yellow-500');
                    }
                });
            });
        }
        
        overlay.classList.remove('hidden');
    }

    // Clear search results
    clearSearchResults() {
        const overlay = document.getElementById('searchOverlay');
        if (overlay) {
            overlay.remove();
        }
        document.getElementById('globalSearch').value = '';
    }

    showTeamSelection() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('teamLinks').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('teamSelection').classList.remove('hidden');
        document.getElementById('breadcrumbPath').classList.add('hidden');
        
        // Restaurar fundo padrão
        document.body.className = document.body.className.replace(/team-background-\w+/g, '');
        
        // Update user email in header
        document.getElementById('userEmail').textContent = this.currentUser;
        
        this.animateTeamCards();
    }

    showTeamLinks(teamId) {
        this.currentTeam = teamId;
        document.getElementById('teamSelection').classList.add('hidden');
        document.getElementById('teamLinks').classList.remove('hidden');
        document.getElementById('breadcrumbPath').classList.remove('hidden');
        
        // Aplicar cor de fundo específica da equipe
        document.body.className = document.body.className.replace(/team-background-\w+/g, '');
        document.body.classList.add(`team-background-${teamId}`);
        
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
        const isFav = this.isFavorite(link.url);
        
        card.className = 'link-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer';
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

        // Click no card para abrir link
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                this.openLink(link.url, link.name);
            }
        });

        // Favoritar/desfavoritar
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(link.url, favoriteBtn);
        });

        return card;
    }

    toggleFavorite(url, button) {
        const icon = button.querySelector('i');
        const isFavorite = this.favorites.includes(url);
        
        if (isFavorite) {
            this.favorites = this.favorites.filter(fav => fav !== url);
            icon.classList.remove('text-yellow-500');
            this.showNotification('Removido dos favoritos', 'info');
        } else {
            this.favorites.push(url);
            icon.classList.add('text-yellow-500');
            this.showNotification('Adicionado aos favoritos', 'success');
        }
        
        localStorage.setItem('leroyPortalFavorites', JSON.stringify(this.favorites));
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
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
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
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }

    globalSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        // Implementar busca global aqui
        console.log('Busca global:', searchTerm);
    }

    getTeamData(teamId) {
        const teams = {
            'qualidade': {
                name: 'Qualidade',
                description: 'Controle de Qualidade e Melhorias Contínuas',
                links: [
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
                        description: 'Virtual Assistant',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Portal do Transportador',
                        description: 'Gestão de transportadores',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Monitoramento operacional',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-broadcast',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'UNIGIS',
                        description: 'Sistema logístico',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-boxes',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Portal de Serviços (Instala)',
                        description: 'Gestão de instalação',
                        url: 'https://instala.leroymerlin.com.br/cockpit',
                        icon: 'fas fa-tools',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Mirakl',
                        description: 'Marketplace platform',
                        url: 'https://leroymerlin.mirakl.net/login',
                        icon: 'fas fa-store',
                        color: 'bg-pink-600'
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
                        description: 'Portal big retail',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/home',
                        icon: 'fas fa-chart-line',
                        color: 'bg-teal-600'
                    },
                    {
                        name: 'Projuris',
                        description: 'Sistema jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-gavel',
                        color: 'bg-blue-800'
                    },
                    {
                        name: 'Hugme',
                        description: 'Plataforma de engajamento',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-rose-600'
                    },
                    {
                        name: 'Gov',
                        description: 'Portal do consumidor',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-landmark',
                        color: 'bg-green-800'
                    },
                    {
                        name: 'Pagar.me',
                        description: 'Sistema de pagamentos',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-500'
                    },
                    {
                        name: 'Fidelidade',
                        description: 'Programa de fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/home-login',
                        icon: 'fas fa-star',
                        color: 'bg-amber-600'
                    },
                    {
                        name: 'Sitef',
                        description: 'Sistema de pagamento',
                        url: 'https://sitef2.softwareexpress.com.br/sitefweb/pages/inicial.zeus',
                        icon: 'fas fa-money-bill',
                        color: 'bg-emerald-600'
                    }
                ]
            },
            'calm-n1': {
                name: 'CALM N1',
                description: 'Central de Atendimento - Nível 1',
                links: [
                    {
                        name: 'Sistema de Atendimento',
                        description: 'Plataforma principal de atendimento',
                        url: '#',
                        icon: 'fas fa-headset',
                        color: 'bg-blue-600'
                    }
                ]
            },
            'gestao-entrega-n1': {
                name: 'Gestão da Entrega N1',
                description: 'Logística e Entregas - Nível 1',
                links: [
                    {
                        name: 'Portal de Entregas',
                        description: 'Gestão de entregas nível 1',
                        url: '#',
                        icon: 'fas fa-truck',
                        color: 'bg-orange-600'
                    }
                ]
            },
            'marketplace': {
                name: 'Marketplace',
                description: 'Gestão de Marketplace',
                links: [
                    {
                        name: 'Mirakl',
                        description: 'Plataforma de marketplace',
                        url: 'https://leroymerlin.mirakl.net/login',
                        icon: 'fas fa-store',
                        color: 'bg-purple-600'
                    }
                ]
            },
            'backoffice': {
                name: 'Backoffice Operacional',
                description: 'Operações de Suporte',
                links: [
                    {
                        name: 'Sistema Backoffice',
                        description: 'Operações internas',
                        url: '#',
                        icon: 'fas fa-cogs',
                        color: 'bg-indigo-600'
                    }
                ]
            },
            'gestao-entrega-n2': {
                name: 'Gestão da Entrega N2',
                description: 'Logística e Entregas - Nível 2',
                links: [
                    {
                        name: 'UNIGIS',
                        description: 'Sistema logístico avançado',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-shipping-fast',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Monitoramento de entregas',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-broadcast',
                        color: 'bg-red-600'
                    }
                ]
            },
            'eficiencia': {
                name: 'Eficiência Operacional',
                description: 'Otimização de Processos',
                links: [
                    {
                        name: 'Dashboard de Eficiência',
                        description: 'Métricas operacionais',
                        url: '#',
                        icon: 'fas fa-chart-line',
                        color: 'bg-teal-600'
                    }
                ]
            },
            'ouvidoria': {
                name: 'Ouvidoria',
                description: 'Canal de Comunicação com Clientes',
                links: [
                    {
                        name: 'Portal Ouvidoria',
                        description: 'Gestão de demandas',
                        url: '#',
                        icon: 'fas fa-comments',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'Gov',
                        description: 'Portal do consumidor',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-landmark',
                        color: 'bg-green-800'
                    }
                ]
            }
        };

        return teams[teamId] || { name: 'Equipe', description: 'Descrição não disponível', links: [] };
    }

    // Retornar dados de todas as equipes
    getTeamsData() {
        return {
            'qualidade': {
                name: 'Qualidade',
                key: 'qualidade',
                description: 'Controle de Qualidade e Melhorias Contínuas',
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
                        description: 'Virtual Assistant',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-robot',
                        color: 'bg-green-600'
                    }
                ]
            },
            'calm-n1': {
                name: 'CALM N1',
                key: 'calm-n1',
                description: 'Central de Atendimento - Nível 1',
                systems: []
            },
            'marketplace': {
                name: 'Marketplace',
                key: 'marketplace',
                description: 'Gestão de Marketplace',
                systems: []
            }
        };
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new LeroyPortal();
});

// CSS limpo e suave sem animações excessivas
const style = document.createElement('style');
style.textContent = `
    .slide-in {
        animation: slideInClean 0.5s ease-out forwards;
    }
    
    @keyframes slideInClean {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Inicialização simples e limpa
