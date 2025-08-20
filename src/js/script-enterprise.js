// Leroy Merlin Portal das Equipes - Enterprise Version
// Sistema de autenticação seguro e navegação profissional

class LeroyPortalEnterprise {
    constructor() {
        // Usuários autorizados com senhas (em produção, usar hash)
        this.authorizedUsers = {
            'ryangame2005@gmail.com': 'leroy2024',
            'yryurodriguess@gmail.com': 'leroy2024',
            'admin@leroymerlin.com.br': 'admin123'
        };
        
        this.currentUser = null;
        this.currentTeam = null;
        this.favorites = this.loadFavorites();
        this.history = this.loadHistory();
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

        // Header functionality
        document.getElementById('favoritesBtn')?.addEventListener('click', () => {
            this.showFavorites();
        });

        document.getElementById('historyBtn')?.addEventListener('click', () => {
            this.showHistory();
        });

        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.showSearch();
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Team cards
        document.querySelectorAll('[data-team]').forEach(card => {
            card.addEventListener('click', () => {
                const teamId = card.getAttribute('data-team');
                this.showTeamLinks(teamId);
            });
        });
    }

    handleLogin() {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!email || !password) {
            this.showError('Por favor, preencha email e senha.');
            return;
        }

        // Check authorized users
        if (this.authorizedUsers[email] === password) {
            this.currentUser = email;
            localStorage.setItem('leroyPortalUser', email);
            this.showTeamSelection();
            this.showNotification('Login realizado com sucesso!', 'success');
        } else if (email.endsWith('@leroymerlin.com.br')) {
            // Domain users with default password
            if (password === 'leroy2024') {
                this.currentUser = email;
                localStorage.setItem('leroyPortalUser', email);
                this.showTeamSelection();
                this.showNotification('Login realizado com sucesso!', 'success');
            } else {
                this.showError('Senha incorreta. Use: leroy2024');
            }
        } else {
            this.showError('Email não autorizado ou senha incorreta.');
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
        document.getElementById('password').value = '';
        this.showNotification('Logout realizado com sucesso!', 'success');
    }

    showTeamSelection() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('teamLinks').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('teamSelection').classList.remove('hidden');
        document.getElementById('homeBtn').classList.add('hidden');
        document.getElementById('backToTeamsBtn').classList.add('hidden');
        
        // Update user email in header
        document.getElementById('userEmail').textContent = this.currentUser;
        
        this.animateTeamCards();
    }

    showTeamLinks(teamId) {
        this.currentTeam = teamId;
        document.getElementById('teamSelection').classList.add('hidden');
        document.getElementById('teamLinks').classList.remove('hidden');
        document.getElementById('homeBtn').classList.remove('hidden');
        document.getElementById('backToTeamsBtn').classList.remove('hidden');
        
        this.renderTeamLinks(teamId);
    }

    renderTeamLinks(teamId) {
        const teamData = this.getTeamData(teamId);
        const container = document.getElementById('linksContainer');
        const teamTitle = document.getElementById('teamTitle');
        const teamDescription = document.getElementById('teamDescription');
        
        teamTitle.textContent = teamData.name;
        teamDescription.textContent = teamData.description;
        
        container.innerHTML = '';
        
        teamData.links.forEach((link, index) => {
            const card = this.createLinkCard(link, index);
            container.appendChild(card);
        });
    }

    createLinkCard(link, index) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative';
        
        const isFavorite = this.favorites.some(fav => fav.url === link.url);
        
        card.innerHTML = `
            <div class="p-6">
                <div class="absolute top-2 right-2">
                    <button onclick="leroyPortal.toggleFavorite('${link.name}', '${link.url}', '${this.getTeamName(this.currentTeam)}')" 
                            class="text-${isFavorite ? 'yellow' : 'gray'}-400 hover:text-yellow-500 transition-colors p-1 rounded"
                            title="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <i class="${link.icon} text-white text-xl"></i>
                </div>
                <h3 class="font-semibold text-gray-800 text-center mb-2 text-sm">${link.name}</h3>
                <p class="text-gray-600 text-xs text-center mb-4">${link.description}</p>
                <div class="flex items-center justify-center">
                    <span class="inline-flex items-center text-xs text-gray-500 hover:text-green-600">
                        <i class="fas fa-external-link-alt mr-1"></i>
                        Acessar
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.openLink(link.url, link.name);
            }
        });

        return card;
    }

    openLink(url, name) {
        this.addToHistory(name, url, this.getTeamName(this.currentTeam));
        this.showNotification(`Abrindo ${name}...`, 'success');
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Favorites System
    toggleFavorite(name, url, team) {
        const existingIndex = this.favorites.findIndex(fav => fav.url === url);
        
        if (existingIndex !== -1) {
            this.favorites.splice(existingIndex, 1);
            this.showNotification('Removido dos favoritos', 'warning');
        } else {
            this.favorites.push({
                name,
                url,
                team,
                timestamp: Date.now()
            });
            this.showNotification('Adicionado aos favoritos', 'success');
        }
        
        this.saveFavorites();
        // Refresh current view
        if (this.currentTeam) {
            this.renderTeamLinks(this.currentTeam);
        }
    }

    loadFavorites() {
        return JSON.parse(localStorage.getItem('leroyFavorites') || '[]');
    }

    saveFavorites() {
        localStorage.setItem('leroyFavorites', JSON.stringify(this.favorites));
    }

    showFavorites() {
        let content = '<h3 class="text-xl font-bold mb-4 text-gray-800">⭐ Favoritos</h3>';
        
        if (this.favorites.length === 0) {
            content += '<p class="text-gray-600">Nenhum favorito adicionado ainda.</p>';
        } else {
            content += '<div class="space-y-3 max-h-96 overflow-y-auto">';
            this.favorites.forEach((fav, index) => {
                content += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div>
                            <div class="text-gray-800 font-medium">${fav.name}</div>
                            <div class="text-xs text-gray-500">${fav.team}</div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="window.open('${fav.url}', '_blank')" 
                                    class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button onclick="leroyPortal.removeFavorite(${index})" 
                                    class="text-red-600 hover:text-red-800 px-2 py-1 rounded">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            content += '</div>';
        }
        
        this.showModal(content);
    }

    removeFavorite(index) {
        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.showNotification('Favorito removido', 'success');
        // Refresh favorites modal
        document.querySelector('.modal-professional')?.remove();
        this.showFavorites();
        // Refresh current view if needed
        if (this.currentTeam) {
            this.renderTeamLinks(this.currentTeam);
        }
    }

    // History System
    addToHistory(name, url, team) {
        this.history.unshift({
            name,
            url,
            team,
            timestamp: Date.now()
        });
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
    }

    loadHistory() {
        return JSON.parse(localStorage.getItem('leroyHistory') || '[]');
    }

    saveHistory() {
        localStorage.setItem('leroyHistory', JSON.stringify(this.history));
    }

    showHistory() {
        let content = '<h3 class="text-xl font-bold mb-4 text-gray-800">📋 Histórico</h3>';
        
        if (this.history.length === 0) {
            content += '<p class="text-gray-600">Nenhum link acessado ainda.</p>';
        } else {
            content += '<div class="space-y-3 max-h-96 overflow-y-auto">';
            this.history.slice(0, 20).forEach(item => {
                const date = new Date(item.timestamp);
                content += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div>
                            <div class="text-gray-800 font-medium">${item.name}</div>
                            <div class="text-xs text-gray-500">${item.team} • ${date.toLocaleString()}</div>
                        </div>
                        <button onclick="window.open('${item.url}', '_blank')" 
                                class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                `;
            });
            content += '</div>';
            content += `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <button onclick="leroyPortal.clearHistory()" 
                            class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        <i class="fas fa-trash mr-2"></i>Limpar Histórico
                    </button>
                </div>
            `;
        }
        
        this.showModal(content);
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.showNotification('Histórico limpo', 'success');
        document.querySelector('.modal-professional')?.remove();
    }

    // Search System
    showSearch() {
        const content = `
            <h3 class="text-xl font-bold mb-4 text-gray-800">🔍 Busca Global</h3>
            <div class="mb-4">
                <input type="text" id="globalSearch" placeholder="Digite para buscar..." 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
            <div id="searchResults" class="space-y-2 max-h-96 overflow-y-auto">
                <p class="text-gray-600">Digite algo para buscar...</p>
            </div>
        `;
        
        this.showModal(content, () => {
            const searchInput = document.getElementById('globalSearch');
            const resultsDiv = document.getElementById('searchResults');
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query.length < 2) {
                    resultsDiv.innerHTML = '<p class="text-gray-600">Digite pelo menos 2 caracteres...</p>';
                    return;
                }
                
                const results = this.searchAllLinks(query);
                if (results.length === 0) {
                    resultsDiv.innerHTML = '<p class="text-gray-600">Nenhum resultado encontrado.</p>';
                } else {
                    resultsDiv.innerHTML = results.map(result => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div>
                                <div class="text-gray-800 font-medium">${result.name}</div>
                                <div class="text-xs text-gray-500">${result.team} • ${result.description}</div>
                            </div>
                            <button onclick="window.open('${result.url}', '_blank')" 
                                    class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                    `).join('');
                }
            });
            
            searchInput.focus();
        });
    }

    searchAllLinks(query) {
        const results = [];
        const teams = this.getAllTeams();
        
        teams.forEach(team => {
            team.links.forEach(link => {
                if (link.name.toLowerCase().includes(query) || 
                    link.description.toLowerCase().includes(query)) {
                    results.push({
                        ...link,
                        team: team.name
                    });
                }
            });
        });
        
        return results;
    }

    showSettings() {
        const content = `
            <h3 class="text-xl font-bold mb-4 text-gray-800">⚙️ Configurações</h3>
            <div class="space-y-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="font-medium text-gray-700">Usuário</div>
                    <div class="text-sm text-gray-600">${this.currentUser}</div>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="font-medium text-gray-700">Estatísticas</div>
                    <div class="text-sm text-gray-600">
                        Favoritos: ${this.favorites.length}<br>
                        Histórico: ${this.history.length} acessos
                    </div>
                </div>
                <div class="space-y-2">
                    <button onclick="leroyPortal.exportData()" 
                            class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        <i class="fas fa-download mr-2"></i>Exportar Dados
                    </button>
                    <button onclick="leroyPortal.clearAllData()" 
                            class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        <i class="fas fa-trash mr-2"></i>Limpar Todos os Dados
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    exportData() {
        const data = {
            user: this.currentUser,
            favorites: this.favorites,
            history: this.history,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leroy-portal-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso', 'success');
    }

    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.favorites = [];
            this.history = [];
            this.saveFavorites();
            this.saveHistory();
            this.showNotification('Todos os dados foram limpos', 'success');
            document.querySelector('.modal-professional')?.remove();
        }
    }

    // Modal System
    showModal(content, onShow = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-professional';
        modal.innerHTML = `
            <div class="modal-content-professional">
                ${content}
                <div class="flex justify-end mt-6">
                    <button onclick="this.closest('.modal-professional').remove()" 
                            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Execute callback after modal is shown
        if (onShow) {
            setTimeout(onShow, 100);
        }
    }

    // Notification System
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${icon} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility Functions
    getTeamName(teamId) {
        const teams = {
            'calm-n1': 'Calm N1',
            'entrega-n1': 'Entrega N1',
            'entrega-n2': 'Entrega N2',
            'marketplace': 'Marketplace',
            'backoffice': 'Backoffice',
            'qualidade': 'Qualidade',
            'eficiencia': 'Eficiência Operacional',
            'ouvidoria': 'Ouvidoria'
        };
        return teams[teamId] || teamId;
    }

    animateTeamCards() {
        const cards = document.querySelectorAll('[data-team]');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    getAllTeams() {
        return [
            this.getTeamData('calm-n1'),
            this.getTeamData('entrega-n1'),
            this.getTeamData('entrega-n2'),
            this.getTeamData('marketplace'),
            this.getTeamData('backoffice'),
            this.getTeamData('qualidade'),
            this.getTeamData('eficiencia'),
            this.getTeamData('ouvidoria')
        ];
    }

    getTeamData(teamId) {
        const teams = {
            'qualidade': {
                name: 'Qualidade',
                description: 'Sistemas de gestão e controle de qualidade',
                links: [
                    {
                        name: 'Service Desk',
                        description: 'Central de atendimento técnico',
                        url: 'https://servicedesk.example.com',
                        icon: 'fas fa-headset',
                        color: 'bg-blue-500'
                    },
                    {
                        name: 'Quality Dashboard',
                        description: 'Painel de indicadores de qualidade',
                        url: 'https://quality.example.com',
                        icon: 'fas fa-chart-line',
                        color: 'bg-green-500'
                    },
                    {
                        name: 'Audit System',
                        description: 'Sistema de auditoria interna',
                        url: 'https://audit.example.com',
                        icon: 'fas fa-search',
                        color: 'bg-orange-500'
                    },
                    {
                        name: 'Training Portal',
                        description: 'Portal de treinamentos',
                        url: 'https://training.example.com',
                        icon: 'fas fa-graduation-cap',
                        color: 'bg-purple-500'
                    }
                ]
            },
            'calm-n1': {
                name: 'Calm N1',
                description: 'Atendimento de primeiro nível',
                links: [
                    {
                        name: 'Sistema de Tickets',
                        description: 'Gestão de chamados N1',
                        url: 'https://tickets.example.com',
                        icon: 'fas fa-ticket-alt',
                        color: 'bg-red-500'
                    }
                ]
            },
            'entrega-n1': {
                name: 'Entrega N1',
                description: 'Logística e entregas nível 1',
                links: [
                    {
                        name: 'Sistema de Entregas',
                        description: 'Controle de entregas N1',
                        url: 'https://delivery.example.com',
                        icon: 'fas fa-truck',
                        color: 'bg-blue-500'
                    }
                ]
            },
            'entrega-n2': {
                name: 'Entrega N2',
                description: 'Logística e entregas nível 2',
                links: [
                    {
                        name: 'Sistema Avançado de Entregas',
                        description: 'Controle avançado de entregas',
                        url: 'https://delivery-advanced.example.com',
                        icon: 'fas fa-shipping-fast',
                        color: 'bg-green-500'
                    }
                ]
            },
            'marketplace': {
                name: 'Marketplace',
                description: 'Gestão de marketplace',
                links: [
                    {
                        name: 'Portal Marketplace',
                        description: 'Gestão de vendas online',
                        url: 'https://marketplace.example.com',
                        icon: 'fas fa-store',
                        color: 'bg-purple-500'
                    }
                ]
            },
            'backoffice': {
                name: 'Backoffice',
                description: 'Sistemas administrativos',
                links: [
                    {
                        name: 'Sistema Administrativo',
                        description: 'Gestão interna',
                        url: 'https://admin.example.com',
                        icon: 'fas fa-cogs',
                        color: 'bg-gray-500'
                    }
                ]
            },
            'eficiencia': {
                name: 'Eficiência Operacional',
                description: 'Otimização de processos',
                links: [
                    {
                        name: 'Dashboard Operacional',
                        description: 'Métricas de eficiência',
                        url: 'https://efficiency.example.com',
                        icon: 'fas fa-tachometer-alt',
                        color: 'bg-indigo-500'
                    }
                ]
            },
            'ouvidoria': {
                name: 'Ouvidoria',
                description: 'Canal de comunicação com clientes',
                links: [
                    {
                        name: 'Portal Ouvidoria',
                        description: 'Gestão de reclamações',
                        url: 'https://ouvidoria.example.com',
                        icon: 'fas fa-comment-alt',
                        color: 'bg-teal-500'
                    }
                ]
            }
        };

        return teams[teamId] || { name: 'Equipe', description: 'Descrição não disponível', links: [] };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.leroyPortal = new LeroyPortalEnterprise();
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
