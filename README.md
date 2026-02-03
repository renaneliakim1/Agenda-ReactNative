# Sistema de Gerenciamento de Contatos 📱

Um aplicativo React Native desenvolvido com Expo para gerenciar contatos pessoais de forma simples e segura, com autenticação e armazenamento em nuvem usando Firebase.


![Texto Alternativo](/meuprimeiroapp/assets/images/Screenshot_20260202_224113.png)

![Texto Alternativo](/meuprimeiroapp/assets/images/Screenshot_20260202_224327.png)


![Texto Alternativo](/meuprimeiroapp/assets/images/Screenshot_20260202_224337.png)

## ✨ Funcionalidades

- 🔐 **Autenticação de usuários** (Login/Registro) com Firebase Auth
- 👤 **Gerenciamento de contatos** (Adicionar, Editar, Excluir)
- 🔍 **Busca em tempo real** por nome, email ou telefone
- ☁️ **Sincronização automática** com Firebase Firestore
- 📊 **Interface moderna** e responsiva
- 🌐 **Suporte multiplataforma** (Android, iOS, Web)

## 🚀 Como executar o projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

#### 2.1. Criar projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Digite o nome do projeto (ex: "meu-app-contatos")
4. Aceite os termos e clique em **"Continuar"**
5. Desabilite o Google Analytics (opcional) e clique em **"Criar projeto"**
6. Aguarde a criação e clique em **"Continuar"**

#### 2.2. Adicionar app Web ao projeto

1. No painel do projeto, clique no ícone **"Web"** (`</>`)
2. Digite um apelido para o app (ex: "Meu App Web")
3. **Não** marque "Firebase Hosting" por enquanto
4. Clique em **"Registrar app"**
5. **Copie as credenciais de configuração** que aparecerem

#### 2.3. Configurar Authentication

1. No menu lateral, vá em **"Authentication"** (Autenticação)
2. Clique em **"Get started"** ou **"Vamos começar"**
3. Na aba **"Sign-in method"**, clique em **"Email/Password"**
4. **Ative** a opção "Email/Password"
5. Clique em **"Salvar"**

#### 2.4. Configurar Firestore Database

1. No menu lateral, vá em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Selecione o modo **"Produção"** (Production mode)
4. Escolha a localização (recomendado: `southamerica-east1` para Brasil)
5. Clique em **"Ativar"** ou **"Enable"**

#### 2.5. Configurar regras de segurança do Firestore

1. Ainda na seção Firestore Database, vá na aba **"Regras"** ou **"Rules"**
2. Substitua o conteúdo pelas seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contatos/{contactId} {
      // Permite leitura e escrita apenas se o usuário estiver autenticado
      // e o documento pertencer ao usuário (usuarioId == auth.uid)
      allow read, write: if request.auth != null && 
                          resource.data.usuarioId == request.auth.uid;
      // Permite criação de novos contatos se o usuário estiver autenticado
      allow create: if request.auth != null && 
                     request.resource.data.usuarioId == request.auth.uid;
    }
  }
}
```

3. Clique em **"Publicar"** ou **"Publish"**

#### 2.6. Adicionar configurações ao projeto

1. Abra o arquivo `src/config/firebaseConfig.ts`
2. Substitua as credenciais pelas que você copiou no passo 2.2:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

3. Salve o arquivo

### 3. Iniciar o app

```bash
npx expo start
```

No terminal, você terá opções para abrir o app em:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - app de desenvolvimento
- Web browser (pressione `w` no terminal)

## 📦 Gerar e Baixar APK para Android

### Pré-requisitos

- Conta no Expo (crie gratuitamente em [expo.dev/signup](https://expo.dev/signup))
- Node.js instalado

### Passo 1: Instalar EAS CLI

Instale o EAS CLI globalmente no seu computador:

```bash
npm install -g eas-cli
```

### Passo 2: Fazer login no Expo

```bash
eas login
```

Digite seu **email/username** e **senha** da conta Expo quando solicitado.

### Passo 3: Configurar o projeto para build

```bash
eas build:configure
```

- Quando perguntado **"Would you like to automatically create an EAS project?"**, digite `Y` (Yes)
- Um arquivo `eas.json` será criado automaticamente

### Passo 4: Gerar o APK

```bash
eas build --platform android --profile preview
```

Durante o processo:

1. Quando perguntado **"Generate a new Android Keystore?"**, digite `Y` (Yes)
   - O EAS vai gerar e armazenar o keystore automaticamente
   
2. O build será enviado para a nuvem do Expo
   - Você verá o progresso no terminal
   - O processo leva de **5 a 15 minutos**

3. Ao finalizar, você receberá:
   - ✅ Mensagem de sucesso: **"Build finished"**
   - 🔗 Link direto para download do APK
   - 📱 QR Code para escanear e instalar direto no celular

### Passo 5: Baixar e instalar o APK

#### Opção A: Pelo celular

1. **Abra o link** fornecido no celular Android
2. **Baixe o APK**
3. **Instale o app**
   - Se aparecer aviso de "Fonte desconhecida", vá em **Configurações > Segurança**
   - Ative **"Permitir instalação de apps de fontes desconhecidas"**
   - Volte e instale o APK

#### Opção B: Pelo computador

1. **Abra o link** no navegador do PC
2. **Baixe o arquivo APK** para o computador
3. **Transfira o APK** para o celular (via USB, email, WhatsApp, etc.)
4. No celular, abra o arquivo APK e instale

### Passo 6: Acompanhar builds anteriores

Você pode visualizar todos os seus builds em:

```
https://expo.dev/accounts/SEU_USERNAME/projects/meuprimeiroapp/builds
```

### Notas importantes

- ⚠️ O APK gerado com o perfil `preview` é para **testes** e não está otimizado para produção
- 📦 Para gerar um APK de **produção** otimizado, use: `eas build --platform android --profile production`
- 🔄 O keystore gerado é gerenciado automaticamente pelo EAS para builds futuros
- 💾 Builds ficam disponíveis para download por **30 dias** no painel do Expo

## 🌐 Deploy da Versão Web na Vercel

O app possui suporte para web e pode ser hospedado na Vercel gratuitamente.

### Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Repositório no GitHub com o código do projeto

### Método 1: Deploy via GitHub (Recomendado)

#### Passo 1: Fazer push para o GitHub

Se ainda não fez, envie o código para o GitHub:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

#### Passo 2: Conectar o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **"Add New Project"** ou **"Import Project"**
3. Selecione o repositório **"ReactNative"**
4. Clique em **"Import"**
5. Nas configurações do projeto:
   - **Framework Preset**: Deixe como "Other"
   - **Build Command**: `npx expo export:web`
   - **Output Directory**: `dist`
6. Clique em **"Deploy"**

#### Passo 3: Aguardar o deploy

- O processo leva de **2 a 5 minutos**
- Ao finalizar, você receberá uma URL (ex: `https://seu-projeto.vercel.app`)
- O app estará disponível na web! 🎉

### Método 2: Deploy via Vercel CLI

#### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 2: Fazer login

```bash
vercel login
```

#### Passo 3: Deploy

Na pasta do projeto, execute:

```bash
vercel
```

Siga as instruções no terminal e pronto!

### Atualizações automáticas

- Após conectar via GitHub, **cada push** na branch `main` fará um **deploy automático**
- Você pode visualizar todos os deploys no painel da Vercel

### Notas importantes

- ✅ A versão web usa as mesmas funcionalidades do Firebase (autenticação e banco de dados)
- 🌐 O domínio fornecido pela Vercel é gratuito e permanente
- 🔄 Você pode configurar um domínio personalizado no painel da Vercel
- 📱 A versão web é totalmente responsiva e funciona em mobile browsers

## 🛠️ Tecnologias utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **TypeScript** - Tipagem estática
- **Firebase Auth** - Autenticação de usuários
- **Firebase Firestore** - Banco de dados NoSQL em tempo real
- **React Navigation** - Navegação entre telas
- **Expo Vector Icons** - Ícones do Material Design

## 📂 Estrutura do projeto

```
meuprimeiroapp/
├── src/
│   ├── config/
│   │   └── firebaseConfig.ts    # Configuração do Firebase
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Configuração de rotas
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Tela de login
│   │   ├── RegisterScreen.tsx   # Tela de registro
│   │   ├── UserListScreen.tsx   # Tela principal (lista de contatos)
│   │   ├── AddContactScreen.tsx # Adicionar contato
│   │   └── EditContactScreen.tsx # Editar contato
│   └── utils/
│       └── alertHelper.ts       # Utilitários para alertas
├── app.json
├── App.tsx
└── package.json
```

## 📱 Recursos do App

### Tela de Login
- Validação de email e senha
- Mensagens de erro detalhadas
- Redirecionamento automático após autenticação

### Tela de Registro
- Criação de nova conta
- Validação de dados
- Confirmação de senha

### Lista de Contatos
- Visualização de todos os contatos do usuário
- Busca em tempo real
- Ações rápidas (Editar/Excluir)
- Botão flutuante para adicionar

### Adicionar/Editar Contato
- Campos: Nome, Email, Telefone, Idade
- Validação de dados
- Sincronização automática

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👨‍💻 Autor

Desenvolvido por [@renaneliakim1](https://github.com/renaneliakim1)
