# Portal das Equipes - Leroy Merlin

Sistema de links centralizados para a Diretoria de Experiência do Cliente da Leroy Merlin.

## 🎯 Objetivo

Facilitar o acesso aos sistemas e ferramentas utilizados pelas diferentes equipes da Diretoria de Experiência do Cliente, centralizando todos os links em uma interface única e intuitiva.

## 🚀 Funcionalidades

- **Autenticação por Email**: Acesso restrito a funcionários da Leroy Merlin (@leroymerlin.com.br)
- **Usuários Especiais**: Suporte para usuários específicos fora do domínio corporativo
- **Interface Responsiva**: Compatível com desktop, tablet e mobile
- **Animações Suaves**: Interface moderna com transições e efeitos visuais
- **Busca por Equipes**: Filtro para encontrar rapidamente a equipe desejada
- **Cache Offline**: Service Worker para melhor performance
- **Design System**: Baseado na identidade visual oficial da Leroy Merlin

## 🎨 Paleta de Cores (Oficial Leroy Merlin)

### Cores Principais
- **Verde Principal**: `#78BE20` (Pantone 368 C)
- **Amarelo Principal**: `#CEDC00` (Pantone 381 C)
- **Cinza Principal**: `#515151` (Cool Gray 11 C)
- **Preto**: `#000000`
- **Branco**: `#FFFFFF`

### Cores Adicionais
- **Laranja**: `#FFA300` (Pantone 137C)
- **Verde Claro**: `#B9DCD2` (Pantone 566C)
- **Azul Claro**: `#99D6EA` (Pantone 2975C)
- **Azul Escuro**: `#00263A` (Pantone 539C)
- **Vermelho**: `#DA291C` (Pantone 485C)

## 🏗️ Estrutura do Projeto

```
linktree-leroy-merlin/
├── index.html              # Página principal
├── src/
│   ├── js/
│   │   └── script.js       # Lógica da aplicação
│   ├── styles/
│   │   └── custom.css      # Estilos customizados
│   └── img/
│       └── Leroy-Merlin-logo.png
├── sw.js                   # Service Worker
└── README.md              # Documentação
```

## 📋 Equipes Disponíveis

### Nível 1
- **CALM N1**: Central de Atendimento
- **GESTÃO DA ENTREGA N1**: Gerenciamento de Entregas

### Nível 2
- **MARKETPLACE**: Gestão de Marketplace
- **BACKOFFICE OPERACIONAL**: Operações Internas
- **GESTÃO DA ENTREGA N2**: Gerenciamento Avançado
- **QUALIDADE**: Controle de Qualidade ✅ *Implementado*
- **EFICIÊNCIA OPERACIONAL**: Otimização de Processos

### Nível 3
- **OUVIDORIA**: Atendimento ao Cliente

## 🔗 Links da Equipe de Qualidade

A equipe de Qualidade possui acesso aos seguintes sistemas:

1. **Genesys** - Analytics e relatórios
2. **Proa** - Portal de conversas com IA
3. **VA** - Virtual Assistant Leroy Merlin
4. **Portal do Transportador** - Gestão de transportadores
5. **Torre de Controle** - Central de monitoramento
6. **UNIGIS** - Sistema de logística
7. **Portal de Serviços (Instala)** - Gerenciamento de instalações
8. **Mirakl** - Plataforma de marketplace
9. **SAFE** - Sistema de segurança
10. **P2K** - Portal Big Retail
11. **Projuris** - Sistema jurídico
12. **Hugme** - Plataforma de relacionamento
13. **Gov** - Portal do consumidor
14. **Pagar.me** - Sistema de pagamentos
15. **Fidelidade** - Programa de fidelidade
16. **Sitef** - Sistema de transações

## 🔐 Autenticação

### Usuários Autorizados
- Funcionários com email `@leroymerlin.com.br`
( ressalto que o modelo está em formato open source pois não estou o utilizando ainda, eventualmente este repositório será privado )
### Funcionalidades de Segurança
- Validação de domínio de email ( falso ainda )
- Sessão persistente (localStorage)
- Logout seguro
- Validação no frontend

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos e animações
- **JavaScript (ES6+)**: Lógica da aplicação
- **Tailwind CSS**: Framework CSS utilitário
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)
- **Service Worker**: Cache offline

## 📱 Responsividade

O portal é totalmente responsivo e otimizado para:
- 📱 **Mobile**: 320px - 768px
- 📱 **Tablet**: 768px - 1024px
- 🖥️ **Desktop**: 1024px+

## 🚀 Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em um servidor local ou navegador
3. Para desenvolvimento, recomenda-se usar um servidor local:
   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Usando Node.js (live-server)
   npx live-server
   
   # Usando PHP
   php -S localhost:8000
   ```

## 🔧 Personalização

### Adicionando Nova Equipe
1. Edite o método `getTeamData()` no arquivo `script.js`
2. Adicione um novo card na seção de equipes no `index.html`
3. Configure os links específicos da equipe

### Adicionando Novos Links
```javascript
{
    name: 'Nome do Sistema',
    url: 'https://exemplo.com',
    icon: 'fas fa-icone',
    color: 'bg-cor-500',
    description: 'Descrição do sistema'
}
```

## 🎯 Roadmap

- [ ] Adicionar links para todas as equipes
- [ ] Implementar analytics de uso
- [ ] Sistema de favoritos
- [ ] Modo escuro
- [ ] Notificações push
- [ ] Integração com SSO corporativo
- [ ] Dashboard administrativo
- [ ] Histórico de acessos

## 📞 Suporte

Para suporte técnico ou sugestões:
- **Email**: rycordeiro@leroymerlin.com.br
- **Desenvolvedor**: Ryan Rodrigues

## 📄 Licença

Este projeto é propriedade da Leroy Merlin Brasil e destina-se exclusivamente ao uso interno da empresa.

---

**Leroy Merlin Brasil** - Diretoria de Experiência do Cliente
*Facilitando o acesso às ferramentas de trabalho de nossas equipes*
