// Leroy Merlin Portal das Equipes
// Sistema de autenticação e navegação

class LeroyPortal {
    constructor() {
        this.allowedEmails = [
            'ryangame2005@gmail.com',
            'yryurodriguess@gmail.com'
        ];
        this.currentUser = null;
        this.currentTeam = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupHeaderFunctionality();
        this.checkSession();
        this.loadTheme();
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

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showTeamSelection();
        });

        // Back to teams button
        document.getElementById('backToTeamsBtn').addEventListener('click', () => {
            this.showTeamSelection();
        });

        // Team cards
        document.querySelectorAll('[data-team]').forEach(card => {
            card.addEventListener('click', () => {
                const teamId = card.getAttribute('data-team');
                this.addTeamClickEffect(card);
                setTimeout(() => {
                    this.showTeamLinks(teamId);
                }, 300);
            });
        });

        // Search functionality
        document.getElementById('teamSearch').addEventListener('input', (e) => {
            this.filterTeams(e.target.value);
        });

        // Link search functionality
        document.getElementById('linkSearch').addEventListener('input', (e) => {
            this.filterLinks(e.target.value);
        });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1500);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('leroyTheme') || 'light';
        this.applyTheme(savedTheme);
    }

    checkSession() {
        const savedUser = localStorage.getItem('leroyPortalUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
            
            // Verificar se há parâmetro de equipe na URL
            const urlParams = new URLSearchParams(window.location.search);
            const teamParam = urlParams.get('team');
            if (teamParam) {
                setTimeout(() => {
                    this.showTeamLinks(teamParam);
                }, 500);
            }
        } else {
            this.showLogin();
        }
    }

    isValidEmail(email) {
        // Verificar emails especiais
        if (this.allowedEmails.includes(email.toLowerCase())) {
            return true;
        }
        
        // Verificar domínio da Leroy Merlin
        return email.toLowerCase().endsWith('@leroymerlin.com.br');
    }

    handleLogin() {
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            this.showError('Por favor, insira um email válido.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Acesso restrito a funcionários da Leroy Merlin ou usuários autorizados.');
            return;
        }

        // Salvar usuário na sessão
        this.currentUser = { email };
        localStorage.setItem('leroyPortalUser', JSON.stringify(this.currentUser));
        
        this.hideError();
        this.showMainApp();
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Animar o erro
        errorDiv.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            errorDiv.style.animation = '';
        }, 500);
    }

    hideError() {
        document.getElementById('loginError').classList.add('hidden');
    }

    logout() {
        localStorage.removeItem('leroyPortalUser');
        this.currentUser = null;
        this.currentTeam = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('email').focus();
    }

    showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userEmail').textContent = this.currentUser.email;
        this.showNotification(`Bem-vindo, ${this.currentUser.email}!`, 'success');
        this.createConfettiEffect();
        this.showTeamSelection();
    }

    createConfettiEffect() {
        const colors = ['#78BE20', '#CEDC00', '#FFA300', '#B9DCD2', '#99D6EA'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
    }

    showTeamSelection() {
        document.getElementById('teamSelection').classList.remove('hidden');
        document.getElementById('teamLinks').classList.add('hidden');
        document.getElementById('breadcrumbPath').classList.add('hidden');
        this.currentTeam = null;
        
        // Animar cards
        this.animateTeamCards();
    }

    showTeamLinks(teamId) {
        this.currentTeam = teamId;
        const teamData = this.getTeamData(teamId);
        
        if (!teamData) {
            console.error('Team data not found:', teamId);
            return;
        }

        // Atualizar breadcrumb
        document.getElementById('currentTeam').textContent = teamData.name;
        document.getElementById('breadcrumbPath').classList.remove('hidden');
        
        // Atualizar título e descrição
        document.getElementById('teamTitle').textContent = teamData.name;
        document.getElementById('teamDescription').textContent = teamData.description;
        
        // Mostrar tela de links
        document.getElementById('teamSelection').classList.add('hidden');
        document.getElementById('teamLinks').classList.remove('hidden');
        
        // Carregar links
        this.loadTeamLinks(teamData.links);
    }

    getTeamData(teamId) {
        const teams = {
            'qualidade': {
                name: 'QUALIDADE',
                description: 'Acesso rápido aos sistemas de controle de qualidade e monitoramento',
                links: [
                    {
                        name: 'Genesys',
                        url: 'https://apps.mypurecloud.com/directory/#/analytics',
                        icon: 'fas fa-chart-bar',
                        color: 'bg-blue-500',
                        description: 'Analytics e relatórios'
                    },
                    {
                        name: 'Proa',
                        url: 'https://portal.proa.ai/conversation/',
                        icon: 'fas fa-robot',
                        color: 'bg-purple-500',
                        description: 'Portal de conversas'
                    },
                    {
                        name: 'VA',
                        url: 'https://va.leroymerlin.com.br/va/home',
                        icon: 'fas fa-home',
                        color: 'bg-green-500',
                        description: 'Virtual Assistant'
                    },
                    {
                        name: 'Portal do Transportador',
                        url: 'https://prd.portaldotransportador.com/user/login.php',
                        icon: 'fas fa-truck',
                        color: 'bg-yellow-500',
                        description: 'Gestão de transportadores'
                    },
                    {
                        name: 'Torre de Controle',
                        url: 'https://torre.leroymerlin.com.br/',
                        icon: 'fas fa-tower-broadcast',
                        color: 'bg-red-500',
                        description: 'Central de monitoramento'
                    },
                    {
                        name: 'UNIGIS',
                        url: 'https://leroy-merlin.unigis.com/Login.aspx',
                        icon: 'fas fa-map-marked-alt',
                        color: 'bg-indigo-500',
                        description: 'Sistema de logística'
                    },
                    {
                        name: 'Portal de Serviços (Instala)',
                        url: 'https://instala.leroymerlin.com.br/cockpit',
                        icon: 'fas fa-tools',
                        color: 'bg-orange-500',
                        description: 'Gerenciamento de instalações'
                    },
                    {
                        name: 'Mirakl',
                        url: 'https://leroymerlin.mirakl.net/login',
                        icon: 'fas fa-store',
                        color: 'bg-pink-500',
                        description: 'Plataforma de marketplace'
                    },
                    {
                        name: 'SAFE',
                        url: 'http://10.56.61.23/safe/asp/default.asp',
                        icon: 'fas fa-shield-alt',
                        color: 'bg-gray-500',
                        description: 'Sistema de segurança'
                    },
                    {
                        name: 'P2K',
                        url: 'http://10.56.61.57:8090/portal-big-retail-v2/#/home',
                        icon: 'fas fa-database',
                        color: 'bg-cyan-500',
                        description: 'Portal Big Retail'
                    },
                    {
                        name: 'Projuris',
                        url: 'https://leroymerlin.projuris.com.br/projuris',
                        icon: 'fas fa-balance-scale',
                        color: 'bg-blue-700',
                        description: 'Sistema jurídico'
                    },
                    {
                        name: 'Hugme',
                        url: 'https://app.hugme.com.br/',
                        icon: 'fas fa-heart',
                        color: 'bg-rose-500',
                        description: 'Plataforma de relacionamento'
                    },
                    {
                        name: 'Gov',
                        url: 'https://www.consumidor.gov.br/',
                        icon: 'fas fa-landmark',
                        color: 'bg-green-700',
                        description: 'Portal do consumidor'
                    },
                    {
                        name: 'Pagar.me',
                        url: 'https://id.pagar.me/signin',
                        icon: 'fas fa-credit-card',
                        color: 'bg-blue-600',
                        description: 'Sistema de pagamentos'
                    },
                    {
                        name: 'Fidelidade',
                        url: 'https://fidelidade-backoffice.leroymerlin.com.br/#/home-login',
                        icon: 'fas fa-medal',
                        color: 'bg-yellow-600',
                        description: 'Programa de fidelidade'
                    },
                    {
                        name: 'Sitef',
                        url: 'https://sitef2.softwareexpress.com.br/sitefweb/pages/inicial.zeus',
                        icon: 'fas fa-terminal',
                        color: 'bg-gray-600',
                        description: 'Sistema de transações'
                    }
                ]
            },
            'calm-n1': {
                name: 'CALM N1',
                description: 'Central de Atendimento - Primeiro Nível',
                links: []
            },
            'gestao-entrega-n1': {
                name: 'GESTÃO DA ENTREGA N1',
                description: 'Gerenciamento de Entregas - Primeiro Nível',
                links: []
            },
            'marketplace': {
                name: 'MARKETPLACE',
                description: 'Gestão de Marketplace e Vendedores',
                links: []
            },
            'backoffice': {
                name: 'BACKOFFICE OPERACIONAL',
                description: 'Operações Internas e Suporte',
                links: []
            },
            'gestao-entrega-n2': {
                name: 'GESTÃO DA ENTREGA N2',
                description: 'Gerenciamento Avançado de Entregas',
                links: []
            },
            'eficiencia': {
                name: 'EFICIÊNCIA OPERACIONAL',
                description: 'Otimização de Processos e Performance',
                links: []
            },
            'ouvidoria': {
                name: 'OUVIDORIA',
                description: 'Atendimento ao Cliente e Reclamações',
                links: []
            }
        };

        return teams[teamId] || null;
    }

    loadTeamLinks(links) {
        const linksGrid = document.getElementById('linksGrid');
        const linkCount = document.getElementById('linkCount');
        linksGrid.innerHTML = '';

        if (!links || links.length === 0) {
            linkCount.textContent = 'Em desenvolvimento';
            linkCount.className = 'inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium';
            
            linksGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-link text-6xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Em Desenvolvimento</h3>
                    <p class="text-gray-500">Os links desta equipe serão adicionados em breve.</p>
                </div>
            `;
            return;
        }

        // Atualizar contador de links
        linkCount.textContent = `${links.length} ${links.length === 1 ? 'link disponível' : 'links disponíveis'}`;
        linkCount.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';

        links.forEach((link, index) => {
            const linkCard = this.createLinkCard(link, index);
            linksGrid.appendChild(linkCard);
        });
    }

    createLinkCard(link, index) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer relative overflow-hidden';
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('card-bounce-in');

        // Adicionar elemento de onda de fundo
        const waveElement = document.createElement('div');
        waveElement.className = 'wave-bg opacity-0 hover:opacity-100 transition-opacity duration-500';
        card.appendChild(waveElement);

        const content = document.createElement('div');
        content.className = 'relative z-10 p-6';
        content.innerHTML = `
            <div class="absolute top-2 right-2 z-20">
                <button onclick="event.stopPropagation(); leroyPortal.addToFavorites('${link.name}', '${link.url}', '${this.getTeamName(this.currentTeam)}')" 
                        class="text-gray-400 hover:text-yellow-500 transition-colors p-1 rounded hover:bg-gray-100" 
                        title="Adicionar aos favoritos">
                    <i class="fas fa-star text-sm"></i>
                </button>
            </div>
            <div class="${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                <i class="${link.icon} text-white text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-800 text-center mb-2 text-sm">${link.name}</h3>
            <p class="text-gray-600 text-xs text-center mb-4">${link.description}</p>
            <div class="flex items-center justify-center">
                <span class="inline-flex items-center text-xs text-gray-500 transform transition-all duration-300 hover:text-green-600">
                    <i class="fas fa-external-link-alt mr-1"></i>
                    Acessar
                </span>
            </div>
        `;

        card.appendChild(content);

        // Adicionar efeito de partículas no hover
        card.addEventListener('mouseenter', () => {
            this.createParticleEffect(card);
        });

        card.addEventListener('click', () => {
            this.addClickEffect(card);
            setTimeout(() => {
                this.openLink(link.url, link.name);
            }, 200);
        });

        return card;
    }

    createParticleEffect(element) {
        const particles = 3;
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-current rounded-full pointer-events-none';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `particle-float 2s ease-out forwards`;
            particle.style.animationDelay = (i * 0.2) + 's';
            
            element.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 2200);
        }
    }

    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    addTeamClickEffect(card) {
        // Efeito de ripple
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(120, 190, 32, 0.4)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-effect 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        ripple.style.pointerEvents = 'none';
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);

        // Efeito de escala no card
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }

    openLink(url, name) {
        // Adicionar animação de clique
        const event = new CustomEvent('linkClick', { detail: { url, name } });
        document.dispatchEvent(event);

        // Rastrear acesso no histórico
        this.trackLinkAccess(name, url, this.getTeamName(this.currentTeam));

        // Mostrar notificação de sucesso
        this.showNotification(`Abrindo ${name}...`, 'success');

        // Adicionar analytics/tracking aqui se necessário
        console.log(`Acessando: ${name} - ${url}`);

        // Abrir link em nova aba
        window.open(url, '_blank', 'noopener,noreferrer');
    }

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

    showNotification(message, type = 'success') {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover notificação após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    filterTeams(searchTerm) {
        const teams = document.querySelectorAll('[data-team]');
        const term = searchTerm.toLowerCase();

        teams.forEach(team => {
            const teamName = team.querySelector('h3').textContent.toLowerCase();
            const teamDescription = team.querySelector('p').textContent.toLowerCase();
            
            if (teamName.includes(term) || teamDescription.includes(term)) {
                team.style.display = 'block';
                team.classList.add('slide-in');
            } else {
                team.style.display = 'none';
            }
        });
    }

    filterLinks(searchTerm) {
        const links = document.querySelectorAll('#linksGrid > div');
        const term = searchTerm.toLowerCase();

        links.forEach(link => {
            const linkName = link.querySelector('h3').textContent.toLowerCase();
            const linkDescription = link.querySelector('p').textContent.toLowerCase();
            
            if (linkName.includes(term) || linkDescription.includes(term)) {
                link.style.display = 'block';
                link.classList.add('slide-in');
            } else {
                link.style.display = 'none';
            }
        });

        // Atualizar contador de links visíveis
        const visibleLinks = Array.from(links).filter(link => link.style.display !== 'none');
        const linkCount = document.getElementById('linkCount');
        
        if (searchTerm && visibleLinks.length === 0) {
            linkCount.textContent = 'Nenhum resultado encontrado';
            linkCount.className = 'inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium';
        } else if (searchTerm) {
            linkCount.textContent = `${visibleLinks.length} ${visibleLinks.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
            linkCount.className = 'inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium';
        } else {
            const totalLinks = this.getTeamData(this.currentTeam).links.length;
            linkCount.textContent = `${totalLinks} ${totalLinks === 1 ? 'link disponível' : 'links disponíveis'}`;
            linkCount.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
        }
    }

    animateTeamCards() {
        const cards = document.querySelectorAll('[data-team]');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.remove('slide-in');
            // Force reflow
            card.offsetHeight;
            card.classList.add('slide-in');
        });
    }

    // Enhanced header functionality
    setupHeaderFunctionality() {
        this.setupMobileMenu();
        this.setupSearch();
        this.setupHeaderButtons();
    }

    // Mobile menu functionality
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const isOpen = !mobileMenu.classList.contains('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // Enhanced search functionality
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const quickSearch = document.getElementById('quickSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filterTeams(query);
            });
        }
        
        if (quickSearch) {
            quickSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filterTeams(query);
            });
        }
    }

    // Filter teams based on search query
    filterTeams(query) {
        const teams = document.querySelectorAll('[data-team]');
        
        teams.forEach(team => {
            const teamName = team.textContent.toLowerCase();
            const shouldShow = teamName.includes(query) || query === '';
            team.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow && query !== '') {
                team.style.animation = 'professional-bounce 0.5s ease-out';
            }
        });
    }

    // Setup header buttons
    setupHeaderButtons() {
        // Favorites functionality
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            favoritesBtn.addEventListener('click', () => {
                this.showFavorites();
            });
        }

        // History functionality
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showHistory();
            });
        }

        // Settings functionality
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Notifications functionality
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // Theme toggle
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // Show favorites modal
    showFavorites() {
        const favorites = JSON.parse(localStorage.getItem('leroyFavorites') || '[]');
        let content = '<h3 class="text-xl font-bold mb-4 text-gray-800">⭐ Favoritos</h3>';
        
        if (favorites.length === 0) {
            content += '<p class="text-gray-600">Nenhum favorito adicionado ainda.</p>';
            content += '<p class="text-sm text-gray-500 mt-2">Clique no ⭐ ao lado dos links para adicioná-los aos favoritos.</p>';
        } else {
            content += '<div class="space-y-2 max-h-96 overflow-y-auto">';
            favorites.forEach((fav, index) => {
                content += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                            <div class="text-gray-800 font-medium">${fav.name}</div>
                            <div class="text-xs text-gray-500">${fav.team}</div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="window.open('${fav.url}', '_blank')" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button onclick="leroyPortal.removeFavorite(${index})" class="text-red-600 hover:text-red-800 px-2 py-1 rounded">
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

    // Show history modal
    showHistory() {
        const history = JSON.parse(localStorage.getItem('leroyHistory') || '[]').slice(-20);
        let content = '<h3 class="text-xl font-bold mb-4 text-gray-800">📋 Histórico Recente</h3>';
        
        if (history.length === 0) {
            content += '<p class="text-gray-600">Nenhum link acessado recentemente.</p>';
        } else {
            content += '<div class="space-y-2 max-h-96 overflow-y-auto">';
            history.reverse().forEach(item => {
                const date = new Date(item.timestamp);
                content += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                            <div class="text-gray-800 font-medium">${item.name}</div>
                            <div class="text-xs text-gray-500">${item.team} • ${date.toLocaleString()}</div>
                        </div>
                        <button onclick="window.open('${item.url}', '_blank')" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                `;
            });
            content += '</div>';
            content += '<div class="mt-4 pt-4 border-t border-gray-200">';
            content += '<button onclick="leroyPortal.clearHistory()" class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">';
            content += '<i class="fas fa-trash mr-2"></i>Limpar Histórico</button></div>';
        }
        
        this.showModal(content);
    }

    // Show settings modal
    showSettings() {
        const theme = localStorage.getItem('leroyTheme') || 'light';
        const notifications = localStorage.getItem('leroyNotifications') !== 'false';
        
        const content = `
            <h3 class="text-xl font-bold mb-4 text-gray-800">⚙️ Configurações</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span class="text-gray-700 font-medium">Tema</span>
                        <div class="text-sm text-gray-500">Escolha entre claro e escuro</div>
                    </div>
                    <select id="themeSelect" class="bg-white border border-gray-300 rounded px-3 py-1">
                        <option value="light" ${theme === 'light' ? 'selected' : ''}>Claro</option>
                        <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Escuro</option>
                        <option value="auto" ${theme === 'auto' ? 'selected' : ''}>Automático</option>
                    </select>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span class="text-gray-700 font-medium">Notificações</span>
                        <div class="text-sm text-gray-500">Receber alertas do sistema</div>
                    </div>
                    <button id="notificationToggle" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-green-600' : 'bg-gray-200'}">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}"></span>
                    </button>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span class="text-gray-700 font-medium">Cache</span>
                        <div class="text-sm text-gray-500">Limpar dados armazenados</div>
                    </div>
                    <button onclick="leroyPortal.clearCache()" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
                        <i class="fas fa-broom mr-1"></i>Limpar
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(content, () => {
            // Setup theme selector
            document.getElementById('themeSelect').addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
            
            // Setup notification toggle
            document.getElementById('notificationToggle').addEventListener('click', () => {
                this.toggleNotifications();
            });
        });
    }

    // Show notifications modal
    showNotifications() {
        const content = `
            <h3 class="text-xl font-bold mb-4 text-gray-800">🔔 Notificações</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
                <div class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-600 mt-1 mr-2"></i>
                        <div>
                            <div class="text-blue-800 font-medium">Portal Atualizado</div>
                            <div class="text-blue-600 text-sm">Novo design profissional implementado com funcionalidades avançadas</div>
                            <div class="text-xs text-blue-500 mt-1">Hoje às ${new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>
                <div class="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                        <div>
                            <div class="text-green-800 font-medium">Sistemas Online</div>
                            <div class="text-green-600 text-sm">Todos os sistemas da Diretoria de Experiência do Cliente estão funcionando</div>
                            <div class="text-xs text-green-500 mt-1">2 horas atrás</div>
                        </div>
                    </div>
                </div>
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-2"></i>
                        <div>
                            <div class="text-yellow-800 font-medium">Manutenção Programada</div>
                            <div class="text-yellow-600 text-sm">Alguns sistemas serão atualizados na madrugada</div>
                            <div class="text-xs text-yellow-500 mt-1">Amanhã às 02:00</div>
                        </div>
                    </div>
                </div>
                <div class="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-star text-purple-600 mt-1 mr-2"></i>
                        <div>
                            <div class="text-purple-800 font-medium">Nova Funcionalidade</div>
                            <div class="text-purple-600 text-sm">Sistema de favoritos e histórico agora disponível</div>
                            <div class="text-xs text-purple-500 mt-1">Ontem</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
                <button onclick="leroyPortal.markAllAsRead()" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    <i class="fas fa-check-double mr-2"></i>Marcar Todas como Lidas
                </button>
            </div>
        `;
        
        this.showModal(content);
    }

    // Generic modal display
    showModal(content, onShow = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-professional';
        modal.innerHTML = `
            <div class="modal-content-professional professional-fade-in">
                ${content}
                <div class="flex justify-end mt-6 space-x-2">
                    <button onclick="this.closest('.modal-professional').remove()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
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

    // Theme management
    setTheme(theme) {
        localStorage.setItem('leroyTheme', theme);
        this.applyTheme(theme);
        this.showNotification(`Tema ${theme === 'light' ? 'claro' : theme === 'dark' ? 'escuro' : 'automático'} ativado`, 'success');
    }

    applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    }

    // Toggle notifications
    toggleNotifications() {
        const enabled = localStorage.getItem('leroyNotifications') !== 'false';
        localStorage.setItem('leroyNotifications', !enabled);
        this.showNotification(`Notificações ${!enabled ? 'ativadas' : 'desativadas'}`, 'success');
        setTimeout(() => {
            document.querySelector('.modal-professional')?.remove();
            this.showSettings();
        }, 1000);
    }

    // Clear cache
    clearCache() {
        localStorage.removeItem('leroyFavorites');
        localStorage.removeItem('leroyHistory');
        this.showNotification('Cache limpo com sucesso', 'success');
        document.querySelector('.modal-professional')?.remove();
    }

    // Clear history
    clearHistory() {
        localStorage.removeItem('leroyHistory');
        this.showNotification('Histórico limpo com sucesso', 'success');
        document.querySelector('.modal-professional')?.remove();
    }

    // Add to favorites
    addToFavorites(name, url, team) {
        const favorites = JSON.parse(localStorage.getItem('leroyFavorites') || '[]');
        const exists = favorites.some(fav => fav.url === url);
        
        if (!exists) {
            favorites.push({ name, url, team, timestamp: Date.now() });
            localStorage.setItem('leroyFavorites', JSON.stringify(favorites));
            this.showNotification('⭐ Adicionado aos favoritos', 'success');
            return true;
        } else {
            this.showNotification('Este link já está nos favoritos', 'warning');
            return false;
        }
    }

    // Remove favorite
    removeFavorite(index) {
        const favorites = JSON.parse(localStorage.getItem('leroyFavorites') || '[]');
        favorites.splice(index, 1);
        localStorage.setItem('leroyFavorites', JSON.stringify(favorites));
        this.showNotification('Removido dos favoritos', 'success');
        document.querySelector('.modal-professional')?.remove();
        this.showFavorites();
    }

    // Track link access for history
    trackLinkAccess(name, url, team) {
        const history = JSON.parse(localStorage.getItem('leroyHistory') || '[]');
        history.push({
            name,
            url,
            team,
            timestamp: Date.now()
        });
        
        // Keep only last 100 items
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem('leroyHistory', JSON.stringify(history));
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.showNotification('Todas as notificações marcadas como lidas', 'success');
        document.querySelector('.modal-professional')?.remove();
    }

    // Enhanced notification system
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
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.leroyPortal = new LeroyPortal();
});

// Adicionar estilos para animação de shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Service Worker para cache (opcional)
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