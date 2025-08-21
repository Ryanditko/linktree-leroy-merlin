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
        this.userStats = {};
        this.recentlyUsed = [];
        
        // Inicializar dados das equipes primeiro
        this.teams = this.getTeamsData();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllSystems();
        this.checkSession();
        this.hideLoadingScreen();
        this.loadTheme();
        
        // Adicionar atalho para ações rápidas (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showQuickActions();
            }
            // Atalho para busca global (Ctrl+K)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch').focus();
            }
        });
    }

    checkSession() {
        const savedUser = localStorage.getItem('leroyPortalUser');
        if (savedUser) {
            this.currentUser = savedUser;
        }
    }

    hideLoadingScreen() {
        // Simular progresso de carregamento
        const progressBar = document.getElementById('loadingProgress');
        const steps = [
            { id: 'loadingStep1', text: '✓ Inicializando sistema', delay: 500 },
            { id: 'loadingStep2', text: '✓ Carregando equipes', delay: 1000 },
            { id: 'loadingStep3', text: '✓ Preparando favoritos', delay: 1500 },
            { id: 'loadingStep4', text: '✓ Configurando busca', delay: 2000 }
        ];
        
        let currentStep = 0;
        const totalSteps = steps.length;
        
        const updateProgress = () => {
            if (currentStep < totalSteps) {
                const step = steps[currentStep];
                const stepElement = document.getElementById(step.id);
                stepElement.innerHTML = step.text;
                stepElement.classList.remove('opacity-50');
                stepElement.classList.add('text-green-400');
                
                const progress = ((currentStep + 1) / totalSteps) * 100;
                progressBar.style.width = `${progress}%`;
                
                currentStep++;
                setTimeout(updateProgress, step.delay);
            } else {
                // Carregamento completo
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            if (this.currentUser) {
                this.showTeamSelection();
            } else {
                document.getElementById('loginScreen').classList.remove('hidden');
            }
                }, 500);
            }
        };
        
        updateProgress();
    }

    // Carregar todos os sistemas para busca global
    loadAllSystems() {
        this.allSystems = [];
        console.log('Loading all systems...');
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
        console.log('Total systems loaded:', this.allSystems.length);
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

    // Rastrear uso de sistema
    trackSystemUsage(systemName, teamName) {
        if (!this.currentUser) return;
        
        const usageKey = `usage_${this.currentUser}`;
        const recentKey = `recent_${this.currentUser}`;
        
        // Atualizar estatísticas
        const stats = JSON.parse(localStorage.getItem(usageKey) || '{}');
        stats[systemName] = (stats[systemName] || 0) + 1;
        localStorage.setItem(usageKey, JSON.stringify(stats));
        
        // Atualizar recentemente usados
        let recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
        recent = recent.filter(item => item.name !== systemName);
        recent.unshift({ name: systemName, team: teamName, timestamp: Date.now() });
        recent = recent.slice(0, 10); // Manter apenas os 10 mais recentes
        localStorage.setItem(recentKey, JSON.stringify(recent));
        
        this.showNotification(`Sistema ${systemName} acessado!`, 'success');
    }

    // Obter sistemas mais usados
    getMostUsedSystems() {
        if (!this.currentUser) return [];
        const stats = JSON.parse(localStorage.getItem(`usage_${this.currentUser}`) || '{}');
        return Object.entries(stats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name]) => name);
    }

    // Obter sistemas recentemente usados
    getRecentlyUsedSystems() {
        if (!this.currentUser) return [];
        return JSON.parse(localStorage.getItem(`recent_${this.currentUser}`) || '[]');
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

        // Theme toggle button
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick actions button
        document.getElementById('quickActionsBtn').addEventListener('click', () => {
            this.showQuickActions();
        });

        // Logo click to go home
        document.querySelector('header img').addEventListener('click', () => {
            this.showTeamSelection();
        });

        // Back button
        document.getElementById('backToTeamsBtn')?.addEventListener('click', () => {
            this.showTeamSelection();
        });

        // Toggle favorites visibility
        document.getElementById('toggleFavorites').addEventListener('click', () => {
            this.toggleFavorites();
        });

        // Toggle recently used visibility
        document.getElementById('toggleRecentlyUsed').addEventListener('click', () => {
            this.toggleRecentlyUsed();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.performGlobalSearch(e.target.value);
        });

        // Keyboard shortcut for global search (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('globalSearch');
                searchInput.focus();
                searchInput.select();
            }
        });

        // Esconder resultados da busca quando clicar fora
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('#globalSearch').parentElement;
            if (!searchContainer.contains(e.target)) {
                this.hideSearchResults();
            }
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
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
            notification.remove();
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || icons.info;
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
        
        // Atualizar email do usuário no header
        if (this.currentUser) {
            const userEmailDisplay = document.getElementById('userEmailDisplay');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = this.currentUser;
            }
        }
        
        // Carregar favoritos específicos do usuário
        this.loadUserFavorites();
        
        // Mostrar estatísticas do usuário
        this.showUserStats();
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
            <div class="p-3 sm:p-4 lg:p-6">
                <div class="flex justify-between items-start mb-3 sm:mb-4">
                    <div class="${link.color} w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center">
                        <i class="${link.icon} text-white text-sm sm:text-lg lg:text-xl"></i>
                    </div>
                    <button class="favorite-btn ${isFav ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors" data-url="${link.url}" data-system='${JSON.stringify(link)}'>
                        <i class="fas fa-star text-xs sm:text-sm"></i>
                    </button>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2 text-xs sm:text-sm lg:text-base">${link.name}</h3>
                <p class="text-gray-600 text-xs mb-3 sm:mb-4 leading-relaxed">${link.description}</p>
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
                // Rastrear uso do sistema
                this.trackSystemUsage(link.name, this.currentTeam);
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

    toggleRecentlyUsed() {
        const recentlyUsedSection = document.getElementById('recentlyUsedSection');
        const toggleBtn = document.getElementById('toggleRecentlyUsed');
        
        if (recentlyUsedSection.classList.contains('hidden')) {
            recentlyUsedSection.classList.remove('hidden');
            toggleBtn.textContent = 'Ocultar';
            this.updateRecentlyUsedDisplay();
        } else {
            recentlyUsedSection.classList.add('hidden');
            toggleBtn.textContent = 'Mostrar';
        }
    }

    updateRecentlyUsedDisplay() {
        const recentlyUsedList = document.getElementById('recentlyUsedList');
        const noRecentlyUsed = document.getElementById('noRecentlyUsed');
        
        const recentlyUsed = this.getRecentlyUsedSystems();
        
        if (recentlyUsed.length === 0) {
            recentlyUsedList.innerHTML = '';
            noRecentlyUsed.classList.remove('hidden');
            return;
        }
        
        noRecentlyUsed.classList.add('hidden');
        recentlyUsedList.innerHTML = '';
        
        recentlyUsed.forEach((item, index) => {
            const card = this.createRecentlyUsedCard(item, index);
            recentlyUsedList.appendChild(card);
        });
    }

    createRecentlyUsedCard(item, index) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm border border-blue-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const timeAgo = this.getTimeAgo(item.timestamp);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                    <i class="fas fa-clock text-white"></i>
                </div>
                <span class="text-xs text-gray-400">${timeAgo}</span>
            </div>
            <h4 class="font-medium text-gray-800 text-sm mb-1">${item.name}</h4>
            <p class="text-xs text-gray-500 mb-2">${item.team}</p>
            <button class="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors">
                Acessar Novamente
            </button>
        `;
        
        // Card click event
        card.addEventListener('click', () => {
            // Encontrar o sistema no allSystems
            const system = this.allSystems.find(s => s.name === item.name);
            if (system) {
                this.trackSystemUsage(system.name, item.team);
                window.open(system.url, '_blank');
            }
        });
        
        return card;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m atrás`;
        if (hours < 24) return `${hours}h atrás`;
        return `${days}d atrás`;
    }

    showUserStats() {
        if (!this.currentUser) return;
        
        const stats = JSON.parse(localStorage.getItem(`usage_${this.currentUser}`) || '{}');
        const totalAccesses = Object.values(stats).reduce((sum, count) => sum + count, 0);
        const mostUsedSystem = Object.entries(stats).sort(([,a], [,b]) => b - a)[0];
        
        if (totalAccesses > 0) {
            const message = mostUsedSystem ? 
                `Você já acessou ${totalAccesses} sistemas. Sistema mais usado: ${mostUsedSystem[0]} (${mostUsedSystem[1]} vezes)` :
                `Você já acessou ${totalAccesses} sistemas!`;
            
            this.showNotification(message, 'info');
        }
    }

    // Theme management
    toggleTheme() {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        const isDark = body.classList.contains('dark-mode');
        
        if (isDark) {
            body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
            this.showNotification('Modo claro ativado!', 'success');
        } else {
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
            this.showNotification('Modo escuro ativado!', 'success');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
        }
    }

    // Quick actions panel
    showQuickActions() {
        // Remover painel existente se houver
        const existingPanel = document.querySelector('.quick-actions-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const quickActions = [
            { name: 'Busca Rápida', icon: 'fas fa-search', action: () => document.getElementById('globalSearch').focus() },
            { name: 'Meus Favoritos', icon: 'fas fa-star', action: () => this.toggleFavorites() },
            { name: 'Alternar Tema', icon: 'fas fa-moon', action: () => this.toggleTheme() },
            { name: 'Estatísticas', icon: 'fas fa-chart-bar', action: () => this.showDetailedStats() },
            { name: 'Limpar Cache', icon: 'fas fa-trash', action: () => this.clearUserData() }
        ];

        const isDarkMode = document.body.classList.contains('dark-mode');
        const panel = document.createElement('div');
        panel.className = `quick-actions-panel fixed top-20 right-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl shadow-2xl border p-4 z-50 min-w-64 animate-slideIn`;
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}">Ações Rápidas</h3>
                <button class="${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-2">
                ${quickActions.map((action, index) => `
                    <button class="quick-action-btn w-full text-left p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center space-x-3" data-action="${index}">
                        <i class="${action.icon} text-green-500"></i>
                        <span class="${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${action.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Adicionar event listeners
        panel.querySelectorAll('.quick-action-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                panel.remove();
                quickActions[index].action();
            });
        });
        
        document.body.appendChild(panel);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (panel.parentElement) {
                panel.remove();
            }
        }, 10000);
    }

    showDetailedStats() {
        if (!this.currentUser) return;
        
        const stats = JSON.parse(localStorage.getItem(`usage_${this.currentUser}`) || '{}');
        const totalAccesses = Object.values(stats).reduce((sum, count) => sum + count, 0);
        const topSystems = Object.entries(stats).sort(([,a], [,b]) => b - a).slice(0, 5);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Suas Estatísticas</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-3xl font-bold text-green-600">${totalAccesses}</div>
                        <div class="text-green-700">Total de Acessos</div>
                    </div>
                    ${topSystems.length > 0 ? `
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-2">Sistemas Mais Usados:</h4>
                            <div class="space-y-2">
                                ${topSystems.map(([name, count], index) => `
                                    <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span class="text-gray-700">${index + 1}. ${name}</span>
                                        <span class="text-green-600 font-semibold">${count}x</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<p class="text-gray-500 text-center">Nenhum sistema usado ainda.</p>'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showMostUsedSystems() {
        const mostUsed = this.getMostUsedSystems();
        if (mostUsed.length === 0) {
            this.showNotification('Nenhum sistema usado ainda!', 'info');
            return;
        }
        
        const systems = mostUsed.map(name => this.allSystems.find(s => s.name === name)).filter(Boolean);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Sistemas Mais Usados</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${systems.map((system, index) => `
                        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onclick="window.open('${system.url}', '_blank'); this.parentElement.parentElement.parentElement.remove();">
                            <div class="flex items-center space-x-3">
                                <div class="${system.color} w-10 h-10 rounded-lg flex items-center justify-center">
                                    <i class="${system.icon} text-white"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800">${system.name}</h4>
                                    <p class="text-sm text-gray-500">${system.teamName}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
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
        if (!query.trim()) {
            // Se a busca estiver vazia, esconder os resultados
            this.hideSearchResults();
            return;
        }
        
        console.log('Performing search for:', query);
        console.log('Available systems:', this.allSystems.length);
        
        const results = this.allSystems.filter(system =>
            system.name.toLowerCase().includes(query.toLowerCase()) ||
            system.description.toLowerCase().includes(query.toLowerCase()) ||
            system.teamName.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log('Search results:', results.length);
        this.showSearchResults(results, query);
    }

    showSearchResults(results, query) {
        // Criar ou atualizar a seção de resultados de busca
        let searchResultsSection = document.getElementById('searchResults');
        
        if (!searchResultsSection) {
            searchResultsSection = document.createElement('div');
            searchResultsSection.id = 'searchResults';
            searchResultsSection.className = 'bg-white border border-gray-200 rounded-lg shadow-lg absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50';
            
            const searchContainer = document.querySelector('#globalSearch').parentElement;
            searchContainer.appendChild(searchResultsSection);
        }

        if (results.length === 0) {
            searchResultsSection.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>Nenhum resultado encontrado para "${query}"</p>
                </div>
            `;
        } else {
            searchResultsSection.innerHTML = `
                <div class="p-3 border-b border-gray-200 bg-gray-50">
                    <p class="text-sm font-medium text-gray-700">${results.length} resultado(s) encontrado(s)</p>
                </div>
                ${results.map(result => `
                    <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 search-result-item" 
                         data-url="${result.url}" data-name="${result.name}">
                        <div class="flex items-center space-x-3">
                            <div class="${result.color} w-8 h-8 rounded-lg flex items-center justify-center">
                                <i class="${result.icon} text-white text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-800">${result.name}</h4>
                                <p class="text-sm text-gray-500">${result.description}</p>
                                <p class="text-xs text-gray-400">${result.teamName}</p>
                            </div>
                            <i class="fas fa-external-link-alt text-gray-400"></i>
                        </div>
                    </div>
                `).join('')}
            `;

            // Adicionar event listeners aos resultados
            searchResultsSection.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    const name = item.dataset.name;
                    window.open(url, '_blank');
                    this.hideSearchResults();
                });
            });
        }

        searchResultsSection.classList.remove('hidden');
    }

    hideSearchResults() {
        const searchResultsSection = document.getElementById('searchResults');
        if (searchResultsSection) {
            searchResultsSection.classList.add('hidden');
        }
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
            'bko': {
                name: 'BKO',
                key: 'bko',
                description: 'Backoffice Operacional',
                color: '#6B7280',
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
                        description: 'Virtual Assistant - Home',
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
            'mkt': {
                name: 'MKT',
                key: 'mkt',
                description: 'Marketplace e E-commerce',
                color: '#F59E0B',
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
            'ouvidoria': {
                name: 'Ouvidoria',
                key: 'ouvidoria',
                description: 'Canal de Comunicação com Clientes',
                color: '#DC2626',
                systems: [
                    {
                        name: 'Portal do Consumidor',
                        description: 'Sistema de Ouvidoria',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-comments',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'Sistema de Ouvidoria',
                        description: 'Gestão de Reclamações',
                        url: 'https://ouvidoria.leroymerlin.com.br/',
                        icon: 'fas fa-microphone',
                        color: 'bg-red-700'
                    },
                    {
                        name: 'Projuris',
                        description: 'Sistema Jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-gavel',
                        color: 'bg-blue-800'
                    },
                    {
                        name: 'Hugme',
                        description: 'Plataforma de Engajamento',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-rose-600'
                    }
                ]
            },
            'eficiencia': {
                name: 'Eficiência Operacional',
                key: 'eficiencia',
                description: 'Otimização de Processos e Indicadores',
                color: '#3B82F6',
                systems: [
                    {
                        name: 'Power BI',
                        description: 'Dashboard de Business Intelligence',
                        url: 'https://lookerstudio.google.com/u/2/reporting/e03854ee-3ab0-4846-b55c-0a7d6e67c2a5/page/BGNTF',
                        icon: 'fas fa-chart-pie',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Base Home Office',
                        description: 'Controle de Trabalho Remoto',
                        url: 'https://docs.google.com/spreadsheets/d/1X1turo2FE0o6Li0AGk9ErfvZewUszkkOM1nkF1yDlLE/edit?usp=sharing',
                        icon: 'fas fa-home',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Base de Indicadores',
                        description: 'Planilha de Indicadores Operacionais',
                        url: 'https://docs.google.com/spreadsheets/d/18ihQWMlhcQjI5G454ln7SPQGbd8NMp45lzAbKLua8fk/edit?gid=460561304#gid=460561304',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-600'
                    }
                ]
            },
            'n1': {
                name: 'N1',
                key: 'n1',
                description: 'Nível 1 - Atendimento',
                color: '#059669',
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
                        name: 'VA - Virtual Assistant',
                        description: 'Assistente Virtual Principal',
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
            'qualidade': {
                name: 'Qualidade',
                key: 'qualidade',
                description: 'Controle de Qualidade',
                color: '#3B82F6',
                systems: [
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
                    },
                    {
                        name: 'Genesys',
                        description: 'Analytics e Relatórios',
                        url: 'https://apps.mypurecloud.com/directory/#/analytics',
                        icon: 'fas fa-chart-area',
                        color: 'bg-blue-700'
                    },
                    {
                        name: 'Proa',
                        description: 'Portal de Conversação',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-600'
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
            'n1-ge': {
                name: 'N1 GE',
                key: 'n1-ge',
                description: 'Gestão de Entrega N1',
                color: '#0D9488',
                systems: [
                    {
                        name: 'Portal do Transportador',
                        description: 'Sistema de Logística',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'UNIGIS',
                        description: 'Sistema logístico',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-boxes',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Central de Monitoramento',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-observation',
                        color: 'bg-purple-600'
                    }
                ]
            },
            'n2-ge': {
                name: 'N2 GE',
                key: 'n2-ge',
                description: 'Gestão de Entrega N2',
                color: '#3730A3',
                systems: [
                    {
                        name: 'Portal do Transportador',
                        description: 'Sistema de Logística Avançada',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck-loading',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'UNIGIS',
                        description: 'Sistema logístico avançado',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-route',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Central de Monitoramento Avançada',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-observation',
                        color: 'bg-purple-600'
                    }
                ]
            },

            'knowledge': {
                name: 'Knowledge',
                key: 'knowledge',
                description: 'Base de Conhecimento',
                color: '#8B5CF6',
                systems: [
                    {
                        name: 'Base de Conhecimento',
                        description: 'Artigos no Knowledge',
                        url: 'https://knowledge.leroymerlin.com.br/',
                        icon: 'fas fa-book',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Documentação',
                        description: 'Documentos e Procedimentos',
                        url: 'https://docs.leroymerlin.com.br/',
                        icon: 'fas fa-file-alt',
                        color: 'bg-blue-600'
                    }
                ]
            }
        };
    }

    clearUserData() {
        if (confirm('Tem certeza que deseja limpar todos os seus dados? Isso removerá favoritos, histórico e estatísticas.')) {
            localStorage.removeItem(`favorites_${this.currentUser}`);
            localStorage.removeItem(`usage_${this.currentUser}`);
            localStorage.removeItem(`recentlyUsed_${this.currentUser}`);
            this.favorites = {};
            this.recentlyUsed = [];
            this.showNotification('Dados limpos com sucesso!', 'success');
        }
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new LeroyPortal();
});
