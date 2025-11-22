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
        
        // Configurar funcionalidades do header com delay para garantir que DOM esteja pronto
        setTimeout(() => {
            this.setupEnhancedHeader();
        }, 500);
        
        // Adicionar atalho para busca global (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const globalSearch = document.getElementById('globalSearch');
                if (globalSearch) {
                    globalSearch.focus();
                }
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
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Setup header buttons with proper error handling
        this.setupHeaderButtons();

        // Logo click to go home
        const headerImg = document.querySelector('header img');
        if (headerImg) {
            headerImg.addEventListener('click', () => {
                this.showTeamSelection();
            });
        }

        // Back button
        const backToTeamsBtn = document.getElementById('backToTeamsBtn');
        if (backToTeamsBtn) {
            backToTeamsBtn.addEventListener('click', () => {
                this.showTeamSelection();
            });
        }

        // Toggle favorites visibility
        const toggleFavorites = document.getElementById('toggleFavorites');
        if (toggleFavorites) {
            toggleFavorites.addEventListener('click', () => {
                this.toggleFavorites();
            });
        }

        // Toggle recently used visibility
        const toggleRecentlyUsed = document.getElementById('toggleRecentlyUsed');
        if (toggleRecentlyUsed) {
            toggleRecentlyUsed.addEventListener('click', () => {
                this.toggleRecentlyUsed();
            });
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.performGlobalSearch(e.target.value);
            });
        }

        // Keyboard shortcut for global search (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('globalSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });

        // Esconder resultados da busca quando clicar fora
        document.addEventListener('click', (e) => {
            const globalSearchEl = document.querySelector('#globalSearch');
            if (globalSearchEl && globalSearchEl.parentElement) {
                const searchContainer = globalSearchEl.parentElement;
                if (!searchContainer.contains(e.target)) {
                    this.hideSearchResults();
                }
            }
        });

        // Navigation buttons
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.showTeamSelection();
            });
        }

        const backToTeamsBtnNav = document.getElementById('backToTeamsBtn');
        if (backToTeamsBtnNav) {
            backToTeamsBtnNav.addEventListener('click', () => {
                this.showTeamSelection();
            });
        }

        // Team cards
        document.querySelectorAll('[data-team]').forEach(card => {
            card.addEventListener('click', () => {
                const teamId = card.getAttribute('data-team');
                this.showTeamLinks(teamId);
            });
        });

        // Search functionality
        const teamSearch = document.getElementById('teamSearch');
        if (teamSearch) {
            teamSearch.addEventListener('input', (e) => {
                this.filterTeams(e.target.value);
            });
        }

        const linkSearch = document.getElementById('linkSearch');
        if (linkSearch) {
            linkSearch.addEventListener('input', (e) => {
                this.filterLinks(e.target.value);
            });
        }
    }

    // Configurar botões do header com tratamento de erros
    setupHeaderButtons() {
        console.log('Setting up header buttons...');
        
        // Favorites button
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            console.log('Favorites button found, adding event listener');
            favoritesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Favorites button clicked');
                this.toggleFavorites();
            });
        } else {
            console.error('Favorites button not found');
        }

        // Recently Used button  
        const recentlyUsedBtn = document.getElementById('recentlyUsedBtn');
        if (recentlyUsedBtn) {
            console.log('Recently used button found, adding event listener');
            recentlyUsedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Recently used button clicked');
                this.toggleRecentlyUsed();
            });
        } else {
            console.error('Recently used button not found');
        }

        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            console.log('Theme toggle button found, adding event listener');
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked');
                this.toggleTheme();
            });
        } else {
            console.error('Theme toggle button not found');
        }

        // Force button functionality as backup
        setTimeout(() => {
            this.forceButtonFunctionality();
        }, 1000);
    }

    // Função de backup para garantir que os botões funcionem
    forceButtonFunctionality() {
        console.log('Forcing button functionality...');
        
        // Favorites button backup
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            favoritesBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Favorites clicked via onclick');
                this.toggleFavorites();
            };
        }

        // Recently used button backup
        const recentlyUsedBtn = document.getElementById('recentlyUsedBtn');
        if (recentlyUsedBtn) {
            recentlyUsedBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Recently used clicked via onclick');
                this.toggleRecentlyUsed();
            };
        }

        // Theme toggle backup
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.onclick = (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked via onclick');
                this.toggleTheme();
            };
        }
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
        console.log('toggleFavorites called');
        const favoritesSection = document.getElementById('favoritesSection');
        
        if (!favoritesSection) {
            console.error('Favorites section not found!');
            return;
        }
        
        const isHidden = favoritesSection.classList.contains('hidden');
        console.log('Favorites section hidden status:', isHidden);
        
        if (isHidden) {
            favoritesSection.classList.remove('hidden');
            this.updateFavoritesDisplay();
            this.showNotification('Favoritos exibidos!', 'success');
        } else {
            favoritesSection.classList.add('hidden');
            this.showNotification('Favoritos ocultados!', 'info');
        }
    }

    toggleRecentlyUsed() {
        console.log('toggleRecentlyUsed called');
        const recentlyUsedSection = document.getElementById('recentlyUsedSection');
        
        if (!recentlyUsedSection) {
            console.error('Recently used section not found!');
            return;
        }
        
        const isHidden = recentlyUsedSection.classList.contains('hidden');
        console.log('Recently used section hidden status:', isHidden);
        
        if (isHidden) {
            recentlyUsedSection.classList.remove('hidden');
            this.updateRecentlyUsedDisplay();
            this.showNotification('Sistemas recentes exibidos!', 'success');
        } else {
            recentlyUsedSection.classList.add('hidden');
            this.showNotification('Sistemas recentes ocultados!', 'info');
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
        console.log('toggleTheme called');
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (!themeIcon) {
            console.error('Theme icon not found!');
            this.showNotification('Erro: Ícone do tema não encontrado!', 'error');
            return;
        }
        
        const isDark = body.classList.contains('dark-mode');
        console.log('Current theme is dark:', isDark);
        
        if (isDark) {
            body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
            this.showNotification('Modo claro ativado!', 'success');
            console.log('Switched to light mode');
        } else {
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
            this.showNotification('Modo escuro ativado!', 'success');
            console.log('Switched to dark mode');
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
        console.log('showQuickActions called');
        
        // Remover painel existente se houver
        const existingPanel = document.querySelector('.quick-actions-panel');
        if (existingPanel) {
            console.log('Removing existing quick actions panel');
            existingPanel.remove();
            return;
        }

        console.log('Creating new quick actions panel');
        const quickActions = [
            { name: 'Busca Rápida', icon: 'fas fa-search', action: () => document.getElementById('globalSearch').focus() },
            { name: 'Meus Favoritos', icon: 'fas fa-star', action: () => this.toggleFavorites() },
            { name: 'Sistemas Recentes', icon: 'fas fa-clock', action: () => this.toggleRecentlyUsed() },
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
                console.log('Quick action clicked:', quickActions[index].name);
                panel.remove();
                quickActions[index].action();
            });
        });
        
        document.body.appendChild(panel);
        console.log('Quick actions panel added to body');
        this.showNotification('Ações rápidas abertas!', 'info');
        
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
            'knowledge': {
                name: 'Knowledge',
                key: 'knowledge',
                description: 'Base de Conhecimento',
                color: '#8B5CF6',
                systems: [
                    {
                        name: 'INTRODUÇÃO LM INSTALA',
                        description: 'Introdução ao LM Instala',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IgnIAE/view',
                        icon: 'fas fa-play-circle',
                        color: 'bg-cyan-600'
                    },
                    {
                        name: 'N1 - Alteração de Cadastro',
                        description: 'Alteração e Exclusão de Cadastro',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IwvIAE/view',
                        icon: 'fas fa-user-edit',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'N1 - Clique e Retire',
                        description: 'Procedimentos Clique e Retire',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IfBIAU/view',
                        icon: 'fas fa-mouse-pointer',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'N1 - Cupom e Nota Fiscal',
                        description: 'Segunda Via NF',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002ISHIA2/view',
                        icon: 'fas fa-receipt',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'N1 - Estornos de Pedidos',
                        description: 'Processo de Estornos',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IthIAE/view',
                        icon: 'fas fa-undo',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'N1 - Fluxo de falta de estoque / Ruptura',
                        description: 'Procedimentos para Falta de Estoque',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002J09IAE/view',
                        icon: 'fas fa-exclamation-triangle',
                        color: 'bg-amber-600'
                    },
                    {
                        name: 'N1 - Formas de Pagamento',
                        description: 'Vale Troca e Estorno',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IaLIAU/view',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'N1 - LMVC',
                        description: 'Programa de Fidelidade',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IVVIA2/view',
                        icon: 'fas fa-star',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'N1 - Loja Naterial',
                        description: 'Procedimentos Loja Naterial',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IQfIAM/view',
                        icon: 'fas fa-building',
                        color: 'bg-green-700'
                    },
                    {
                        name: 'N1 - Marketplace Mercado Livre',
                        description: 'Clientes Mercado Livre',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002BvRIAU/view',
                        icon: 'fas fa-shopping-cart',
                        color: 'bg-yellow-700'
                    },
                    {
                        name: 'N1 - Mirakl (Acesso Individual)',
                        description: 'Acesso Individual ao Mirakl',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002LGTIA2/view',
                        icon: 'fas fa-user-circle',
                        color: 'bg-indigo-700'
                    },
                    {
                        name: 'N1 - PROGRAMA DE FIDELIDADE LEROY MERLIN COM VOCÊ (LMVC PRO)',
                        description: 'Programa de Fidelidade LMVC Pro',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IyXIAU/view',
                        icon: 'fas fa-crown',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'N1 - PASSO A PASSO REENTREGA - CD',
                        description: 'Passo a Passo Reentrega - CD',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002PrxIAE/view',
                        icon: 'fas fa-redo-alt',
                        color: 'bg-orange-700'
                    },
                    {
                        name: 'N1 - PASSO A PASSO TROCA, DEVOLUÇÃO E REENTREGA - MARKETPLACE',
                        description: 'Passo a Passo Troca, Devolução e Reentrega - Marketplace',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002PtZIAU/view',
                        icon: 'fas fa-exchange-alt',
                        color: 'bg-purple-800'
                    },
                    {
                        name: 'N1 - PASSO A PASSO TROCA, DEVOLUÇÃO E REENTREGA - SAÍDA LOJA',
                        description: 'Passo a Passo Troca, Devolução e Reentrega - Saída Loja',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002PvBIAU/view',
                        icon: 'fas fa-store-alt',
                        color: 'bg-teal-800'
                    },
                    {
                        name: 'N1 - POLÍTICA DE TROCA E GARANTIA PARA PRODUTOS LM',
                        description: 'Política de Troca e Garantia para Produtos LM',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002QEXIA2/view',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-blue-800'
                    },
                    {
                        name: 'N1 - POLÍTICA DE TROCAS E DEVOLUÇÕES MARKETPLACE',
                        description: 'Política de Trocas e Devoluções Marketplace',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002QHlIAM/view',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-800'
                    },
                    {
                        name: 'N1 - VALIDAÇÃO POSITIVA',
                        description: 'Processo de Validação Positiva',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IvJIAU/view',
                        icon: 'fas fa-check-circle',
                        color: 'bg-emerald-600'
                    },
                    {
                        name: 'N1 GE - Contato com Lojas',
                        description: 'Gestão de Contatos com Lojas',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002JszIAE/view',
                        icon: 'fas fa-store',
                        color: 'bg-teal-600'
                    },
                    {
                        name: 'N1 GE - COLETA',
                        description: 'N1 GE - Coleta',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002KAjIAM/view',
                        icon: 'fas fa-clipboard-list',
                        color: 'bg-cyan-700'
                    },
                    {
                        name: 'N1 GE - ENTREGA (ATENDIMENTO LOJISTA)',
                        description: 'N1 GE - Entrega (Atendimento Lojista)',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002K7VIAU/view',
                        icon: 'fas fa-store-alt',
                        color: 'bg-emerald-700'
                    },
                    {
                        name: 'N1 GE - ENTREGA (ATENDIMENTO TRANSPORTADOR)',
                        description: 'N1 GE - Entrega (Atendimento Transportador)',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002K2fIAE/view',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-800'
                    },
                    {
                        name: 'N1 GE - REENTREGA',
                        description: 'N1 GE - Reentrega',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002Q4rIAE/view',
                        icon: 'fas fa-redo',
                        color: 'bg-orange-800'
                    },
                    {
                        name: 'N2 BKO - Cancelamento LIA',
                        description: 'Fluxo de Cancelamento LIA',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002J3NIAU/view',
                        icon: 'fas fa-times-circle',
                        color: 'bg-red-700'
                    },
                    {
                        name: 'N2 BKO - Fluxo 2ª Via NF',
                        description: 'Tratativa 2ª Via NF/Cupom Fiscal',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002J1lIAE/view',
                        icon: 'fas fa-file-invoice',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'N2 GE - Processo de coleta',
                        description: 'Processo de Coleta - Gestão de Entrega',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002LRlIAM/view',
                        icon: 'fas fa-clipboard-list',
                        color: 'bg-teal-700'
                    },
                    {
                        name: 'N2 GE - Processos de Reentrega',
                        description: 'Fluxo de Reentrega',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002Kp3IAE/view',
                        icon: 'fas fa-truck',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'N2 Marketplace - Tarefas',
                        description: 'Processo Tratativa de Tarefas Marketplace',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002Ik1IAE/view',
                        icon: 'fas fa-tasks',
                        color: 'bg-purple-700'
                    },
                    {
                        name: 'ORIENTAÇÃO DE CONSULTA AO PORTAL DE SERVIÇOS - LM INSTALA',
                        description: 'Consulta ao Portal de Serviços LM Instala',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002IiPIAU/view',
                        icon: 'fas fa-question-circle',
                        color: 'bg-sky-600'
                    },
                    {
                        name: 'Ouvidoria N3 - Estorno Boleto',
                        description: 'Pedidos Leroy Merlin RA (Reclame Aqui)',
                        url: 'https://leroy.lightning.force.com/lightning/r/Knowledge__kav/ka0N50000002Is5IAE/view',
                        icon: 'fas fa-microphone',
                        color: 'bg-red-800'
                    }
                ]
            },
            'bko': {
                name: 'BKO',
                key: 'bko',
                description: 'Backoffice Operacional',
                color: '#6B7280',
                systems: [
                    // Big Retail Portal
                    {
                        name: 'Big Retail Portal',
                        description: 'Portal de Transações',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/consulta-generica-transacoes',
                        icon: 'fas fa-exchange-alt',
                        color: 'bg-indigo-600'
                    },
                    // Boitata
                    {
                        name: 'Boitata',
                        description: 'Portal Boitata',
                        url: 'https://leroymerlin.com.br/boitata',
                        icon: 'fas fa-fire',
                        color: 'bg-orange-700'
                    },
                    // Equals
                    {
                        name: 'Equals',
                        description: 'Conciliador Financeiro',
                        url: 'https://app.equals.com.br/conciliador/empresa/home/show',
                        icon: 'fas fa-calculator',
                        color: 'bg-teal-600'
                    },
                    // Fidelidade Backoffice
                    {
                        name: 'Fidelidade Backoffice',
                        description: 'Sistema de Fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/',
                        icon: 'fas fa-star',
                        color: 'bg-yellow-600'
                    },
                    // Genesys Cloud
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Instala - Detalhes
                    {
                        name: 'Instala - Detalhes',
                        description: 'Sistema de Instalação - Detalhes',
                        url: 'https://instala.leroymerlin.com.br/serviceOrder/detail/1956509/service',
                        icon: 'fas fa-wrench',
                        color: 'bg-orange-600'
                    },
                    // Mirakl - Pedidos
                    {
                        name: 'Mirakl - Pedidos',
                        description: 'Gestão de Pedidos Mirakl',
                        url: 'https://leroymerlin.mirakl.net/mmp/operator/order/all?period=%7B%22startDate%22%3A1747882800000%2C%22endDate%22%3A1755745200000%2C%22presetId%22%3A%22roma-range-calendar-filter-last-day-90%22%2C%22presetLabel%22%3A%22%C3%9Altimos+90+dias%22%7D&periodAuto=true&select-search=orderId&sort=order-list-date-created-id%2CDESC&limit=25',
                        icon: 'fas fa-shopping-bag',
                        color: 'bg-purple-600'
                    },
                    // OneTrust
                    {
                        name: 'OneTrust',
                        description: 'Gestão de Privacidade',
                        url: 'https://app-eu.onetrust.com/welcome',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-blue-700'
                    },
                    // Pagar.me
                    {
                        name: 'Pagar.me',
                        description: 'Gateway de Pagamento',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-800'
                    },
                    // Payment Portal
                    {
                        name: 'Payment Portal',
                        description: 'Portal de Pagamentos',
                        url: 'https://payment.leroymerlin.com.br/',
                        icon: 'fas fa-money-bill',
                        color: 'bg-green-800'
                    },
                    // Planilha de Controle
                    {
                        name: 'Planilha de Controle',
                        description: 'Controle Principal de Operações',
                        url: 'https://docs.google.com/spreadsheets/d/1UZsIYMFNaiNIriescb1dW2NJESEsCTLdCmKyyutPWf4/edit?gid=0#gid=0',
                        icon: 'fas fa-table',
                        color: 'bg-green-600'
                    },
                    // Projuris
                    {
                        name: 'Projuris',
                        description: 'Sistema Jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris/LoginAction.do?METHOD=login&session=false&LANG=1',
                        icon: 'fas fa-gavel',
                        color: 'bg-red-800'
                    },
                    // Safe System
                    {
                        name: 'Safe System',
                        description: 'Sistema de Segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-lock',
                        color: 'bg-red-700'
                    },
                    // Salesforce Home
                    {
                        name: 'Salesforce Home',
                        description: 'Página Principal do Salesforce',
                        url: 'https://leroy.lightning.force.com/lightning/page/home',
                        icon: 'fas fa-home',
                        color: 'bg-blue-600'
                    },
                    // ServiceNow Dashboard
                    {
                        name: 'ServiceNow Dashboard',
                        description: 'Dashboard de Serviços',
                        url: 'https://lmb.service-now.com/sp?id=ec_dashboard',
                        icon: 'fas fa-chart-pie',
                        color: 'bg-green-700'
                    },
                    // Sistema Interno
                    {
                        name: 'Sistema Interno',
                        description: 'Sistema Interno de Gestão',
                        url: 'http://10.56.61.68/index.php?jscr=1',
                        icon: 'fas fa-desktop',
                        color: 'bg-gray-600'
                    },
                    // Sitef
                    {
                        name: 'Sitef',
                        description: 'Sistema de TEF',
                        url: 'https://oauth.softwareexpress.com.br/auth/realms/sitefhospedado/protocol/openid-connect/auth?response_type=code&client_id=sitefweb&scope=openid&state=6EIMAYNUGIfxQc_soemVXz2wuUkAPjERTqsNorFnp88%3D&redirect_uri=https://sitef2.softwareexpress.com.br/sitefweb/login/oauth2/callback/keycloak&nonce=-glVozCUQ7-8ENB8rwI7PB3J7haNFHxLmNKIOo8nQqE',
                        icon: 'fas fa-terminal',
                        color: 'bg-gray-700'
                    },
                    // Sprinklr
                    {
                        name: 'Sprinklr',
                        description: 'Plataforma de Atendimento',
                        url: 'https://space.sprinklr.com/care/console',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-700'
                    },
                    // Venda Assistida
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    }
                ]
            },
            'mkt': {
                name: 'MKT',
                key: 'mkt',
                description: 'Marketplace e E-commerce',
                color: '#F59E0B',
                systems: [
                    // Autogestão
                    {
                        name: 'Autogestão',
                        description: 'Dashboard Autogestão',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001ATH9EAO/view?queryScope=userFolders',
                        icon: 'fas fa-cogs',
                        color: 'bg-gray-600'
                    },
                    // Correios
                    {
                        name: 'Correios',
                        description: 'Rastreamento de Encomendas',
                        url: 'https://rastreamento.correios.com.br/app/index.php#',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-600'
                    },
                    // Genesys Cloud
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Mercado Livre
                    {
                        name: 'Mercado Livre',
                        description: 'Plataforma de Vendas',
                        url: 'https://www.mercadolivre.com.br/',
                        icon: 'fas fa-shopping-cart',
                        color: 'bg-yellow-500'
                    },
                    // Mirakl
                    {
                        name: 'Mirakl',
                        description: 'Gestão de Pedidos Marketplace',
                        url: 'https://leroymerlin.mirakl.net/mmp/operator/order/0031351181-A',
                        icon: 'fas fa-store',
                        color: 'bg-purple-600'
                    },
                    // Produtividade
                    {
                        name: 'Produtividade',
                        description: 'Relatórios de Produtividade',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00O6e000008peEUEAY/view?queryScope=userFolders&ws=%2Flightning%2Fr%2FReport%2F00O3i0000035vHREAY%2Fview',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-red-600'
                    },
                    // Relatório Tarefas
                    {
                        name: 'Relatório Tarefas',
                        description: 'Relatórios de Tarefas',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00O6e000008jFI5EAM/view',
                        icon: 'fas fa-tasks',
                        color: 'bg-orange-600'
                    },
                    // Salesforce Dashboard
                    {
                        name: 'Salesforce Dashboard',
                        description: 'Dashboard Marketplace',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001DgGZEA0/view',
                        icon: 'fas fa-cloud',
                        color: 'bg-blue-600'
                    },
                    // Tarefas
                    {
                        name: 'Tarefas',
                        description: 'Planilha de Controle de Tarefas',
                        url: 'https://docs.google.com/spreadsheets/d/1LEPP-cGJNb1pXUaiJjJBj8NVX6_qwapTbvaFAhA4bYs/edit?gid=1412456799#gid=1412456799',
                        icon: 'fas fa-list-check',
                        color: 'bg-teal-600'
                    },
                    // Venda Assistida
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-700'
                    },
                    // Venda Assistida - Consulta Pedidos
                    {
                        name: 'Venda Assistida - Consulta Pedidos',
                        description: 'Venda assistida - Consulta Pedidos',
                        url: 'https://va.leroymerlin.com.br/va/LMOrder/consult-sales-order-filter?referer=pedido&lastAtend=true',
                        icon: 'fas fa-search',
                        color: 'bg-green-600'
                    }
                ]
            },
            'ouvidoria': {
                name: 'Ouvidoria',
                key: 'ouvidoria',
                description: 'Canal de Comunicação com Clientes',
                color: '#DC2626',
                systems: [
                    // Venda Assistida e Plataformas
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Portais e Sistemas Principais
                    {
                        name: 'Portal do Consumidor',
                        description: 'Sistema de Ouvidoria',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-comments',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'Hugme',
                        description: 'Plataforma de Engajamento',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-rose-600'
                    },
                    // Sistemas Jurídicos
                    {
                        name: 'Projuris',
                        description: 'Sistema Jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-gavel',
                        color: 'bg-blue-800'
                    },
                    // Sistemas Internos
                    {
                        name: 'Sistema Linx',
                        description: 'Portal Retail Big',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/login',
                        icon: 'fas fa-desktop',
                        color: 'bg-indigo-600'
                    },
                    {
                        name: 'Safe',
                        description: 'Sistema de Segurança',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/login',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-green-600'
                    },
                    // Sistemas de Pagamento
                    {
                        name: 'Sitef',
                        description: 'Sistema de Pagamento TEF',
                        url: 'https://oauth.softwareexpress.com.br/auth/realms/sitefhospedado/protocol/openid-connect/auth?response_type=code&client_id=sitefweb&scope=openid&state=ETaYcicMoK32kEs986MSSHMwoZh60oP-5I0yODHcI6U%3D&redirect_uri=https://sitef2.softwareexpress.com.br/sitefweb/login/oauth2/callback/keycloak&nonce=j4O3QA3VJjnC09Npq9LHIg_Y_vAR7KSmiMZCeR5gvGo',
                        icon: 'fas fa-credit-card',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Payment',
                        description: 'Sistema de Estorno',
                        url: 'https://payment.leroymerlin.com.br/web/refund',
                        icon: 'fas fa-money-bill-wave',
                        color: 'bg-yellow-600'
                    }
                ]
            },
            'eficiencia': {
                name: 'Eficiência Operacional',
                key: 'eficiencia',
                description: 'Otimização de Processos e Indicadores',
                color: '#3B82F6',
                systems: [
                    // Base de Indicadores
                    {
                        name: 'Base de Indicadores',
                        description: 'Planilha de Indicadores Operacionais',
                        url: 'https://docs.google.com/spreadsheets/d/18ihQWMlhcQjI5G454ln7SPQGbd8NMp45lzAbKLua8fk/edit?gid=460561304#gid=460561304',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-600'
                    },
                    // Base Home Office
                    {
                        name: 'Base Home Office',
                        description: 'Controle de Trabalho Remoto',
                        url: 'https://docs.google.com/spreadsheets/d/1X1turo2FE0o6Li0AGk9ErfvZewUszkkOM1nkF1yDlLE/edit?usp=sharing',
                        icon: 'fas fa-home',
                        color: 'bg-purple-600'
                    },
                    // Cais
                    {
                        name: 'Cais',
                        description: 'Portal de Conversação Cais',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-comments',
                        color: 'bg-blue-700'
                    },
                    // Chamado Operacional
                    {
                        name: 'Chamado Operacional',
                        description: 'Portal de Chamados Operacionais',
                        url: 'https://kainos.atlassian.net/servicedesk/customer/portals',
                        icon: 'fas fa-ticket-alt',
                        color: 'bg-indigo-700'
                    },
                    // Genesys Cloud
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Power BI
                    {
                        name: 'Power BI',
                        description: 'Dashboard de Business Intelligence',
                        url: 'https://lookerstudio.google.com/u/2/reporting/e03854ee-3ab0-4846-b55c-0a7d6e67c2a5/page/BGNTF',
                        icon: 'fas fa-chart-pie',
                        color: 'bg-yellow-600'
                    },
                    // Power BI Geral PROA
                    {
                        name: 'Power BI Geral PROA',
                        description: 'Dashboard Geral PROA',
                        url: 'https://youbpotech.reportload.com/3caf10b8-24b8-4750-bcd0-c7a849e8c1a3/reports/view',
                        icon: 'fas fa-chart-area',
                        color: 'bg-indigo-600'
                    },
                    // Power BI Eficiência Operacional - Primeiro Semestre
                    {
                        name: 'Power BI Eficiência Operacional - Primeiro Semestre',
                        description: 'Dashboard Eficiência Operacional - 1º Semestre',
                        url: 'https://lookerstudio.google.com/reporting/e03854ee-3ab0-4846-b55c-0a7d6e67c2a5',
                        icon: 'fas fa-chart-line',
                        color: 'bg-emerald-600'
                    },
                    // Power BI Eficiência Operacional - Segundo Semestre
                    {
                        name: 'Power BI Eficiência Operacional - Segundo Semestre',
                        description: 'Dashboard Eficiência Operacional - 2º Semestre',
                        url: 'https://lookerstudio.google.com/reporting/7a737b98-a1e8-49ed-8109-9aad11f2c258',
                        icon: 'fas fa-chart-column',
                        color: 'bg-cyan-600'
                    },
                    // Salesforce
                    {
                        name: 'Salesforce',
                        description: 'CRM Salesforce',
                        url: 'https://leroy.lightning.force.com/lightning/page/home',
                        icon: 'fas fa-cloud',
                        color: 'bg-blue-600'
                    },
                    // ClickUp
                    {
                        name: 'ClickUp (Tarefas Diárias)',
                        description: 'Gerenciador de Tarefas Diárias',
                        url: 'https://app.clickup.com/90132546971/v/l/6-901320656433-1',
                        icon: 'fas fa-tasks',
                        color: 'bg-green-700'
                    },
                    // Venda Assistida
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    }
                ]
            },
            'n1': {
                name: 'N1',
                key: 'n1',
                description: 'Nível 1 - Atendimento',
                color: '#059669',
                systems: [
                    // Salesforce
                    {
                        name: 'Salesforce',
                        description: 'CRM e Dashboard',
                        url: 'https://leroy.lightning.force.com/lightning',
                        icon: 'fas fa-cloud',
                        color: 'bg-blue-600'
                    },
                    // Venda Assistida e Plataformas
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-700'
                    },
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Sistemas de Logística
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
                        icon: 'fas fa-broadcast-tower',
                        color: 'bg-purple-600'
                    },
                    // Sistemas de Instalação e Marketplace
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
                    },
                    // Sistemas de Segurança
                    {
                        name: 'Safe',
                        description: 'Sistema de Segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-red-700'
                    },
                    // Sistemas Corporativos
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
                    }
                ]
            },
            'qualidade': {
                name: 'Qualidade',
                key: 'qualidade',
                description: 'Controle de Qualidade e Melhorias Contínuas',
                color: '#7C3AED',
                systems: [
                    // Cais
                    {
                        name: 'Cais',
                        description: 'Portal de Conversação Cais',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-comments',
                        color: 'bg-blue-700'
                    },
                    // Fidelidade
                    {
                        name: 'Fidelidade',
                        description: 'Programa de fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/home-login',
                        icon: 'fas fa-star',
                        color: 'bg-amber-600'
                    },
                    // Venda Assistida e Plataformas
                    {
                        name: 'Genesys Analytics',
                        description: 'Analytics e Relatórios',
                        url: 'https://apps.mypurecloud.com/directory/#/analytics',
                        icon: 'fas fa-chart-area',
                        color: 'bg-blue-700'
                    },
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Gov',
                        description: 'Portal do consumidor',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-landmark',
                        color: 'bg-green-800'
                    },
                    {
                        name: 'Hugme',
                        description: 'Plataforma de engajamento',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-rose-600'
                    },
                    {
                        name: 'Mirakl',
                        description: 'Marketplace platform',
                        url: 'https://leroymerlin.mirakl.net/login',
                        icon: 'fas fa-store',
                        color: 'bg-pink-600'
                    },
                    {
                        name: 'P2K',
                        description: 'Portal big retail',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/home',
                        icon: 'fas fa-chart-line',
                        color: 'bg-teal-600'
                    },
                    // Sistemas de Pagamento
                    {
                        name: 'Pagar.me',
                        description: 'Sistema de pagamentos',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-500'
                    },
                    {
                        name: 'Portal de Serviços (Instala)',
                        description: 'Gestão de instalação',
                        url: 'https://instala.leroymerlin.com.br/cockpit',
                        icon: 'fas fa-tools',
                        color: 'bg-yellow-600'
                    },
                    // Sistemas de Logística
                    {
                        name: 'Portal do Transportador',
                        description: 'Gestão de transportadores',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Projuris',
                        description: 'Sistema jurídico',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-gavel',
                        color: 'bg-blue-800'
                    },
                    // Sistemas de Segurança
                    {
                        name: 'SAFE',
                        description: 'Sistema de segurança',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'Sitef',
                        description: 'Sistema de pagamento',
                        url: 'https://sitef2.softwareexpress.com.br/sitefweb/pages/inicial.zeus',
                        icon: 'fas fa-money-bill',
                        color: 'bg-emerald-600'
                    },
                    {
                        name: 'Torre de Controle',
                        description: 'Monitoramento operacional',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-broadcast-tower',
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
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    }
                ]
            },
            'n1-ge': {
                name: 'N1 GE',
                key: 'n1-ge',
                description: 'Gestão de Entrega N1',
                color: '#0D9488',
                systems: [
                    // Carteira e CALM
                    {
                        name: 'Carteira e CALM',
                        description: 'Carteira e CALM',
                        url: 'https://docs.google.com/forms/d/e/1FAIpQLSdMJKdQtAniNAJJSh5cXiE_Bv4PMSdlC4Y4rw_ZHoZiR8r4uQ/viewform',
                        icon: 'fas fa-folder',
                        color: 'bg-purple-600'
                    },
                    // Contatos GE
                    {
                        name: 'Contatos GE',
                        description: 'Planilha de Contatos da Gestão de Entrega',
                        url: 'https://docs.google.com/spreadsheets/d/1t8i8MEYyHUptEtUbg6P6nb0wcpt7c4Kcct-N-zTlEjs/edit?gid=970218786#gid=970218786',
                        icon: 'fas fa-address-book',
                        color: 'bg-blue-600'
                    },
                    // DELIVERY 512 - Crise
                    {
                        name: 'DELIVERY 512 - Crise',
                        description: 'Planilha de Gestão de Crises na Entrega',
                        url: 'https://docs.google.com/spreadsheets/d/13Gh6ZSvScA-Y0n7REen6eDYdiO74014MiCY-s8j3wBc/edit?pli=1&gid=1738534885#gid=1738534885',
                        icon: 'fas fa-exclamation-triangle',
                        color: 'bg-red-600'
                    },
                    // EXPEDIÇÃO CD SP - ED
                    {
                        name: 'EXPEDIÇÃO CD SP - ED',
                        description: 'Centro de Distribuição São Paulo - Expedição',
                        url: 'https://docs.google.com/spreadsheets/d/1OfKWtBcPY-aAO9mO4l2AGlhX5GTwUvTWXQnKd8FTMtA/edit?gid=83846714#gid=83846714',
                        icon: 'fas fa-warehouse',
                        color: 'bg-orange-600'
                    },
                    // Genesys Cloud
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Home Salesforce
                    {
                        name: 'Home Salesforce',
                        description: 'Página Principal do Salesforce',
                        url: 'https://leroy.lightning.force.com/lightning/page/home',
                        icon: 'fas fa-home',
                        color: 'bg-blue-600'
                    },
                    // Monitoramento de Demandas
                    {
                        name: 'Monitoramento de Demandas',
                        description: 'Monitoramento de Demandas',
                        url: 'https://docs.google.com/spreadsheets/d/1pNwY_jo4BPKmYu1Bq5rc0kD8lMGvl8m9OOP1670i4FQ/edit?gid=2101346139#gid=2101346139',
                        icon: 'fas fa-chart-line',
                        color: 'bg-green-600'
                    },
                    // Portal do Transportador
                    {
                        name: 'Portal do Transportador',
                        description: 'Sistema de Logística',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-600'
                    },
                    // Retorno QLIK
                    {
                        name: 'Retorno QLIK',
                        description: 'Sistema de Análise de Dados QLIK',
                        url: 'https://docs.google.com/spreadsheets/d/1u5J8GYXgFNqL-eukeotdCRwJeW9PwNH0PkNjgxZIWR4/edit?gid=784854874#gid=784854874',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-green-600'
                    },
                    // Torre de Controle
                    {
                        name: 'Torre de Controle',
                        description: 'Central de Monitoramento',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-broadcast-tower',
                        color: 'bg-purple-600'
                    },
                    // UNIGIS
                    {
                        name: 'UNIGIS',
                        description: 'Sistema logístico',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-boxes',
                        color: 'bg-indigo-600'
                    },
                    // Venda Assistida
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
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
                        name: 'Base da Reentrega',
                        description: 'Relatório de Reentrgas',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00O6e000008pULzEAM/view?queryScope=userFolders',
                        icon: 'fas fa-redo',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Acompanhamento do Caso',
                        description: 'Relatório de Acompanhamento',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00ON50000046H78MAE/view?queryScope=userFolders',
                        icon: 'fas fa-clipboard-check',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Produtividade Individual',
                        description: 'Fechamento de Casos',
                        url: 'https://leroy.lightning.force.com/lightning/r/Report/00ON5000003uGDJMA2/view?queryScope=userFolders',
                        icon: 'fas fa-chart-line',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'Painel da Gestão da Entrega',
                        description: 'Dashboard de Gestão',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01Z6e000001APHPEA4/view?queryScope=userFolders',
                        icon: 'fas fa-tachometer-alt',
                        color: 'bg-indigo-600'
                    },
                    // Venda Assistida e Plataformas
                    {
                        name: 'Venda Assistida',
                        description: 'Portal de Venda Assistida',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    // Sistemas de Logística
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
                        icon: 'fas fa-broadcast-tower',
                        color: 'bg-purple-600'
                    },
                    // Sistemas de Serviços
                    {
                        name: 'Portal de Chamados',
                        description: 'Sistema de Tickets',
                        url: 'https://idpb2e.adeo.com/idp/SSO.saml2?SAMLRequest=jVJBTsMwEPxK5HsSx7SltZpKoRWiEpSIFA7cHGdTLCV28Dot%2FJ7gFgEHKo5ez87Mzu4cRduwjme9e9EP8NoDuuCtbTTy409Kequ5EaiQa9ECcid5kd3dchZR3lnjjDQNCTJEsE4ZvTQa%2BxZsAXavJDw%2B3KbkxbkOeRw3bRnhsR5qc4ikaWMt9p3YQVQZEqwGdaXFJ813k6q6kkEkKjC%2BYXjHRXEfeX8kuDZWgrefklo0CCRYr1JSbJYVFXSSyPHFuJQzeslqJgWl5YROphISSgcg5gJR7eG7FbGHtUYntEsJo2wc0mnI2DaZ8dGYjy6iZMKeSZCfBr9SulJ6dz6l8ghCfrPd5mF%2BX2w9wV5VYDcD%2Bv8BPYFFH85ASxZzHwH3nu3PrZ23I75WRRZndOfxT%2FaTVsc%2F%2Fa5XuWmUfA%2BypjGHpQXhhhmc7cGvoxXubwNJlPiKqsLaQ3mvsQOpagUViRcn2d8XufgA&RelayState=https%3A%2F%2Flmb.service-now.com%2Fsp%3Fid%3Dhome',
                        icon: 'fas fa-ticket-alt',
                        color: 'bg-purple-700'
                    },
                    {
                        name: 'Consulta de Vale',
                        description: 'Sistema SAFE',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-search-dollar',
                        color: 'bg-green-700'
                    },
                    // Planilhas
                    {
                        name: 'E-mail do Transporte',
                        description: 'Planilha de Contatos do Transporte',
                        url: 'https://docs.google.com/spreadsheets/d/1t8i8MEYyHUptEtUbg6P6nb0wcpt7c4Kcct-N-zTlEjs/edit?gid=318003163#gid=318003163',
                        icon: 'fas fa-envelope',
                        color: 'bg-red-600'
                    },
                    {
                        name: 'Insucessos CD',
                        description: 'Planilha de Insucessos do CD',
                        url: 'https://docs.google.com/spreadsheets/d/1pNwY_jo4BPKmYu1Bq5rc0kD8lMGvl8m9OOP1670i4FQ/edit?gid=1290316018#gid=1290316018',
                        icon: 'fas fa-exclamation-circle',
                        color: 'bg-red-700'
                    },
                    {
                        name: 'Planilha de Crise',
                        description: 'Gestão de Crises',
                        url: 'https://docs.google.com/spreadsheets/d/13Gh6ZSvScA-Y0n7REen6eDYdiO74014MiCY-s8j3wBc/edit?gid=600854731#gid=600854731',
                        icon: 'fas fa-fire-extinguisher',
                        color: 'bg-orange-700'
                    },
                    {
                        name: 'Insucessos Loja',
                        description: 'Planilha de Insucessos das Lojas',
                        url: 'https://docs.google.com/spreadsheets/d/1mvR4b-8152wu3NsKA3uWpA9UY3Pmfws8W2zlwA_zPLE/edit?gid=318816945#gid=318816945',
                        icon: 'fas fa-store-slash',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'Expedição CD',
                        description: 'Centro de Distribuição - Expedição',
                        url: 'https://docs.google.com/spreadsheets/d/1OfKWtBcPY-aAO9mO4l2AGlhX5GTwUvTWXQnKd8FTMtA/edit?gid=83846714#gid=83846714',
                        icon: 'fas fa-shipping-fast',
                        color: 'bg-blue-700'
                    }
                ]
            },
            'links-gerais': {
                name: 'Links Gerais',
                key: 'links-gerais',
                description: 'Sistemas Comuns a Todas as Equipes',
                color: '#10B981',
                systems: [
                    {
                        name: 'Equals Conciliador',
                        description: 'Conciliador Financeiro',
                        url: 'https://app.equals.com.br/conciliador/empresa/home/show',
                        icon: 'fas fa-calculator',
                        color: 'bg-teal-600'
                    },
                    {
                        name: 'Genesys Cloud',
                        description: 'Plataforma de Atendimento',
                        url: 'https://apps.mypurecloud.com/',
                        icon: 'fas fa-phone-alt',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'Instala',
                        description: 'Sistema de Instalação',
                        url: 'https://instala.leroymerlin.com.br/',
                        icon: 'fas fa-wrench',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Knowledge Base',
                        description: 'Base de Conhecimento Salesforce',
                        url: 'https://leroy.lightning.force.com/lightning/o/Knowledge__kav/list?filterName=All_Articles',
                        icon: 'fas fa-book',
                        color: 'bg-violet-600'
                    },
                    {
                        name: 'Mirakl Marketplace',
                        description: 'Gestão de Marketplace',
                        url: 'https://leroymerlin.mirakl.net/',
                        icon: 'fas fa-store',
                        color: 'bg-orange-600'
                    },
                    {
                        name: 'Portal do Transportador',
                        description: 'Gestão de Transportes',
                        url: 'https://portaldotransportador.leroymerlin.com.br/',
                        icon: 'fas fa-truck',
                        color: 'bg-gray-600'
                    },
                    {
                        name: 'Sprinklr',
                        description: 'Plataforma de Atendimento Social',
                        url: 'https://space.sprinklr.com/care/console',
                        icon: 'fas fa-comments',
                        color: 'bg-purple-700'
                    },
                    {
                        name: 'Venda Assistida',
                        description: 'Sistema de Venda Assistida',
                        url: 'https://vendaassistida.leroymerlin.com.br/',
                        icon: 'fas fa-handshake',
                        color: 'bg-green-600'
                    }
                ]
            },
            'supervisao': {
                name: 'Supervisão',
                key: 'supervisao',
                description: 'Painéis e Ferramentas de Supervisão',
                color: '#F59E0B',
                systems: [
                    {
                        name: 'Dashboard Supervisão',
                        description: 'Painel Principal de Supervisão',
                        url: 'https://leroy.lightning.force.com/lightning/r/Dashboard/01ZN5000006tQeLMAU/view?queryScope=userFolders',
                        icon: 'fas fa-chart-pie',
                        color: 'bg-yellow-600'
                    },
                    {
                        name: 'Relatórios de Performance',
                        description: 'Relatórios de Performance das Equipes',
                        url: 'https://leroy.lightning.force.com/lightning/o/Report/list',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-600'
                    },
                    {
                        name: 'Genesys Administração',
                        description: 'Administração Genesys',
                        url: 'https://apps.mypurecloud.com/directory/#/admin/welcomeV2',
                        icon: 'fas fa-users-cog',
                        color: 'bg-purple-600'
                    },
                    {
                        name: 'PAINEIS',
                        description: 'Painéis de Controle',
                        url: 'https://leroy.lightning.force.com/lightning/o/Dashboard/home?queryScope=everything',
                        icon: 'fas fa-tachometer-alt',
                        color: 'bg-green-600'
                    },
                    {
                        name: 'Painel Ocorrências de Ponto',
                        description: 'Relatório de Ocorrências de Ponto dos Funcionários',
                        url: 'https://lookerstudio.google.com/reporting/a2d4d5f9-cb3c-4882-b96e-cbedfd228c2b',
                        icon: 'fas fa-clock',
                        color: 'bg-orange-600'
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

    // === FUNCIONALIDADES DO HEADER APRIMORADO ===

    setupEnhancedHeader() {
        console.log('Configurando enhanced header...');
        
        // Busca móvel
        const mobileSearchBtn = document.getElementById('mobileSearchBtn');
        const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
        const closeMobileSearch = document.getElementById('closeMobileSearch');
        const mobileGlobalSearch = document.getElementById('mobileGlobalSearch');

        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', () => {
                mobileSearchOverlay.classList.remove('hidden');
                setTimeout(() => mobileGlobalSearch.focus(), 100);
            });
        }

        if (closeMobileSearch) {
            closeMobileSearch.addEventListener('click', () => {
                mobileSearchOverlay.classList.add('hidden');
            });
        }

        if (mobileSearchOverlay) {
            mobileSearchOverlay.addEventListener('click', (e) => {
                if (e.target === mobileSearchOverlay) {
                    mobileSearchOverlay.classList.add('hidden');
                }
            });
        }

        // Sincronizar busca móvel com busca principal
        if (mobileGlobalSearch) {
            mobileGlobalSearch.addEventListener('input', (e) => {
                document.getElementById('globalSearch').value = e.target.value;
                this.performGlobalSearch(e.target.value);
            });
        }

        // Configurar botão de tema
        this.setupThemeToggle();

        // Sugestões de busca
        this.setupSearchSuggestions();

        // Animações de botões do header
        this.setupHeaderAnimations();

        // Status do usuário em tempo real
        this.updateUserStatus();

        // Auto-save da busca
        this.setupSearchAutosave();
    }

    setupThemeToggle() {
        console.log('Configurando botão de tema...');
        
        const themeToggleBtn = document.querySelector('[data-action="toggle-theme"]');
        if (themeToggleBtn) {
            console.log('Botão de tema encontrado:', themeToggleBtn);
            
            // Remover listeners antigos
            themeToggleBtn.removeEventListener('click', this.toggleTheme);
            
            // Adicionar novo listener
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clique no botão de tema detectado');
                this.toggleTheme();
            });
        } else {
            console.warn('Botão de tema não encontrado');
        }
    }

    setupSearchSuggestions() {
        const searchInput = document.getElementById('globalSearch');
        const suggestionsDiv = document.getElementById('searchSuggestions');

        if (!searchInput || !suggestionsDiv) return;

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length === 0) {
                suggestionsDiv.classList.add('active');
                suggestionsDiv.classList.remove('hidden');
            }
        });

        searchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
                suggestionsDiv.classList.remove('active');
                suggestionsDiv.classList.add('hidden');
            } else {
                suggestionsDiv.classList.add('active');
                suggestionsDiv.classList.remove('hidden');
            }
        });

        searchInput.addEventListener('blur', () => {
            // Delay para permitir cliques nas sugestões
            setTimeout(() => {
                suggestionsDiv.classList.remove('active');
                suggestionsDiv.classList.add('hidden');
            }, 200);
        });

        // Sugestões populares clicáveis
        const suggestions = suggestionsDiv.querySelectorAll('span');
        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                searchInput.value = suggestion.textContent;
                this.performGlobalSearch(suggestion.textContent);
                suggestionsDiv.classList.remove('active');
                suggestionsDiv.classList.add('hidden');
            });
        });
    }

    setupHeaderAnimations() {
        // Adicionar classe para animações de hover aos botões
        const headerButtons = document.querySelectorAll('header button');
        headerButtons.forEach(btn => {
            btn.classList.add('header-btn');
            
            // Efeito ripple ao clicar
            btn.addEventListener('click', (e) => {
                this.createRippleEffect(e, btn);
            });
        });

        // Animação de entrada do logo
        const logo = document.querySelector('header img[alt="Leroy Merlin"]');
        if (logo) {
            logo.style.transform = 'scale(0) rotate(180deg)';
            logo.style.opacity = '0';
            
            setTimeout(() => {
                logo.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
                logo.style.transform = 'scale(1) rotate(0deg)';
                logo.style.opacity = '1';
            }, 500);
        }
    }

    createRippleEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        // Adicionar keyframes se não existirem
        if (!document.querySelector('#rippleKeyframes')) {
            const style = document.createElement('style');
            style.id = 'rippleKeyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    updateUserStatus() {
        const userEmail = document.getElementById('userEmail');
        if (userEmail && this.currentUser) {
            userEmail.textContent = this.currentUser;
            
            // Adicionar indicador de status online
            const statusIndicators = document.querySelectorAll('.status-pulse');
            statusIndicators.forEach(indicator => {
                indicator.classList.add('status-pulse');
            });
        }

        // Atualizar a cada 30 segundos
        setTimeout(() => this.updateUserStatus(), 30000);
    }

    setupSearchAutosave() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;

        // Carregar último termo de busca
        const lastSearch = localStorage.getItem(`lastSearch_${this.currentUser}`);
        if (lastSearch) {
            searchInput.value = lastSearch;
        }

        // Salvar automaticamente
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                localStorage.setItem(`lastSearch_${this.currentUser}`, searchInput.value);
            }, 1000);
        });
    }

    // Melhorar as notificações do header
    showHeaderNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium transform translate-x-full transition-all duration-500 border-l-4`;
        
        const colors = {
            success: 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300',
            error: 'bg-gradient-to-r from-red-500 to-red-600 border-red-300',
            warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-300',
            info: 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-300'
        };

        notification.className += ` ${colors[type]}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="${icons[type]} text-lg"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animação de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Remover automaticamente
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Leroy Portal...');
    window.leroyPortalInstance = new LeroyPortal();
});
