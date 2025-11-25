# 🏋️ *ZenitApp*

Aplicativo acadêmico desenvolvido para frequentadores de academia que desejam *organizar e acompanhar seus treinos de forma simples, rápida e eficiente*.  
O *ZenitApp* permite cadastrar, visualizar e gerenciar exercícios, oferecendo uma experiência minimalista e intuitiva voltada para o dia a dia do treino.

---

## 📱 *Sobre o Projeto*

O *ZenitApp* foi criado como parte de um projeto acadêmico com o objetivo de *fornecer uma ferramenta acessível para controle e acompanhamento de treinos de musculação*.  
O foco principal está na *facilidade de uso, **organização* e *visualização clara das rotinas de treino*, atendendo tanto iniciantes quanto praticantes experientes.

---

## ⚙️ *Funcionalidades Implementadas*

### ✅ *Autenticação e Perfil*
- Sistema completo de cadastro e login com Firebase Authentication
- Perfil de usuário com informações pessoais e métricas
- Gerenciamento de dados biométricos (peso, altura, gordura corporal)
- Logout e navegação entre telas

### ✅ *Gerenciamento de Treinos*
- Listagem completa de exercícios organizados por grupo muscular
- 8 categorias de exercícios: Peito, Costas, Quadríceps, Ombros, Trapézio, Bíceps, Tríceps, Panturrilha e Abdominais
- Links para vídeos demonstrativos de cada exercício
- Sistema de seleção de dias da semana para organização de treinos
- Interface responsiva e adaptável a diferentes tamanhos de tela

### ✅ *Navegação e Interface*
- Tela de boas-vindas com design profissional
- Sistema de navegação por Stack e Tabs
- Cabeçalhos customizados com botões de navegação
- Design consistente com tema escuro e verde neon (#22C55E)
- Imagens de fundo com overlay para melhor legibilidade
- Botões e componentes interativos com feedback visual

### ✅ *Contextos Globais*
- RoutineContext para gerenciamento de rotinas de treino
- WorkoutContext para controle de sessões de treino
- Estado global compartilhado entre componentes

---

## 🧠 *Arquitetura do Projeto*

O *ZenitApp* utiliza a estrutura do *Expo Router* com File-based Routing:


📦 zenit-app
┣ 📁 app
┃ ┣ 📁 (tabs)
┃ ┃ ┣ 📄 _layout.tsx → Navegação por abas
┃ ┃ ┗ 📄 home.tsx → Tela principal pós-login
┃ ┣ 📄 _layout.tsx → Layout raiz com Stack Navigator
┃ ┣ 📄 index.tsx → Tela de boas-vindas
┃ ┣ 📄 login.tsx → Tela de login
┃ ┣ 📄 cadastro.tsx → Tela de cadastro
┃ ┣ 📄 exercise-list.tsx → Listagem de exercícios
┃ ┣ 📄 user-profile.tsx → Perfil do usuário
┃ ┗ 📄 firebase-config.ts → Configuração Firebase
┣ 📁 components → Componentes reutilizáveis
┃ ┣ 📄 AppLayout.tsx
┃ ┣ 📄 Collapsible.tsx
┃ ┣ 📄 ExternalLink.tsx
┃ ┗ 📄 HapticTab.tsx
┣ 📁 constants
┃ ┗ 📄 exercises.ts → Base de dados de exercícios
┣ 📁 context
┃ ┣ 📄 RoutineContext.tsx → Gerenciamento de rotinas
┃ ┗ 📄 WorkoutContext.tsx → Gerenciamento de treinos
┣ 📁 hooks → Custom hooks
┣ 📁 assets → Imagens, fontes e ícones
┗ 📄 package.json


---

## 🛠️ *Tecnologias Utilizadas*

- *React Native* → Framework principal para desenvolvimento mobile
- *Expo* (SDK 52) → Plataforma de desenvolvimento e build
- *TypeScript* → Tipagem estática e melhor experiência de desenvolvimento
- *Firebase* → Backend-as-a-Service
  - Firebase Authentication → Sistema de login/cadastro
  - Firebase Firestore → Banco de dados NoSQL
- *Expo Router* → Sistema de navegação file-based
- *React Navigation* → Navegação entre telas
- *Expo Vector Icons* → Ícones (Ionicons, Feather, MaterialIcons)
- *Context API* → Gerenciamento de estado global

---

## 🎯 *Fluxo de Navegação*

1. *Tela Inicial* (index.tsx) → Boas-vindas
2. *Login* (login.tsx) → Autenticação com e-mail/senha
3. *Cadastro* (cadastro.tsx) → Registro de novo usuário
4. *Home* ((tabs)/home.tsx) → Dashboard principal
5. *Exercícios* (exercise-list.tsx) → Listagem completa de exercícios
6. *Perfil* (user-profile.tsx) → Dados do usuário e configurações

---

## 👥 *Público-Alvo*

- 🏋️ *Alunos de academia* que desejam monitorar treinos e progresso
- 👨‍🏫 *Profissionais de Educação Física* que buscam uma ferramenta de acompanhamento rápido
- 💪 *Entusiastas de musculação* que valorizam praticidade no controle de seus exercícios

---

## 🧑‍💻 *Integrantes do Grupo*

| Função | Nome |
|:-------|:------|
| 🧭 Líder de Projeto | *Philip Escudero* |
| 💡 Desenvolvedor Frontend | *Alex Martins* |
| ⚙️ Desenvolvedor Backend | *Bruno Bianchi* |
| 📲 Designer / QA | *Lucas Alves* |

---

## 🚀 *Como Executar o Projeto*

### 1️⃣ Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI
- Conta no Firebase (para configurar Authentication e Firestore)

### 2️⃣ Clonar o repositório
bash
git clone https://github.com/seuusuario/zenitapp.git
cd zenit-app


### 3️⃣ Instalar dependências
bash
npm install


### 4️⃣ Configurar Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password)
3. Crie um banco Firestore
4. Configure as credenciais em app/firebase-config.ts

### 5️⃣ Executar o app
bash
npx expo start


### 6️⃣ Testar no dispositivo
- *Mobile: Instale o app **Expo Go* (Play Store / App Store) e escaneie o QR Code
- *Web*: Pressione w no terminal
- *Android*: Pressione a no terminal
- *iOS*: Pressione i no terminal

---

## 🧭 *Funcionalidades em Desenvolvimento*

- 📊 Sistema de histórico e estatísticas de desempenho detalhadas
- 🔔 Notificações e lembretes de treino diário
- 📈 Gráficos de evolução e progresso
- 🧑‍🤝‍🧑 Modo colaborativo (aluno e treinador)
- 🌓 Modo escuro completo e personalização de temas
- 💾 Sincronização offline com cache local
- 🎯 Sistema de metas e conquistas
- 📸 Upload de fotos de progresso

---

## 📄 *Licença*

©️ 2025 *ZenitApp*. Todos os direitos reservados.  
Projeto acadêmico desenvolvido para fins educacionais.

---

## 📞 *Contato*

Para dúvidas ou sugestões, entre em contato com a equipe:
- 📧 Email: contato@zenitapp.dev
- 🌐 Website: [www.zenitapp.dev](https://www.zenitapp.dev) (em construção)

---

*Desenvolvido com 💪 por estudantes apaixonados por tecnologia e fitness!*