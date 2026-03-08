# Discord Clone - Uma Plataforma de Comunicação em Tempo Real

Este projeto foi desenvolvido para recriar a experiência principal do Discord, focando em comunicações privadas, sistema de amizades e interações por voz e texto em tempo real, proporcionando um ambiente dinâmico para conexões entre usuários.

## 🧪 Testes

Este projeto utiliza um conjunto robusto de testes para garantir a integridade do código e a experiência do usuário, cobrindo testes unitários, de componentes e de interface.

## 🚀 Tecnologias Utilizadas

### Frontend

- **Next.js (App Router)**: Framework React para renderização híbrida e rotas otimizadas.
- **React 19**: Utilização das funcionalidades mais recentes da biblioteca.
- **TailwindCSS 4**: Estilização moderna e utilitária para uma interface rápida e responsiva.
- **Zustand**: Gerenciamento de estado global simples e performático.
- **Lucide React**: Biblioteca de ícones elegantes para a interface.
- **Sonner**: Sistema de notificações (toasts) leves e bonitos.
- **Pusher JS**: Cliente para atualizações e chat em tempo real.
- **Livekit Client**: Integração para chamadas de voz e vídeo de baixa latência.
- **React Zoom Pan Pinch**: Funcionalidade de zoom e navegação em imagens.

### Backend & Banco de Dados

- **Prisma ORM**: Modelagem de dados e consultas seguras ao banco de dados PostgreSQL.
- **PostgreSQL**: Banco de dados relacional para persistência de usuários, amizades e mensagens.
- **Pusher SDK**: Gerenciamento de eventos em tempo real no servidor.
- **Livekit Server SDK**: Controle e autenticação de salas de voz.
- **Cloudinary**: Armazenamento e gerenciamento de imagens na nuvem.
- **BcryptJS**: Criptografia de senhas para segurança dos usuários.
- **Jose / JWT**: Autenticação e proteção de rotas via tokens.

## ⚙️ Funcionalidades

- **Autenticação Segura**: Cadastro e login de usuários com senhas criptografadas e tokens JWT.
- **Sistema de Amizades**: Envio, aceitação e bloqueio de pedidos de amizade.
- **Status Online em Tempo Real**: Visualização do estado atual dos amigos (Online, Ausente ou Offline).
- **Chat Privado em Tempo Real**: Troca de mensagens instantâneas com suporte a texto e envio de imagens.
- **Chamadas de Voz**: Comunicação por voz integrada utilizando a infraestrutura da Livekit.
- **Visualização de Mídia**: Galeria de imagens com suporte a zoom e navegação.
- **Rastreador de Atividade**: Monitoramento de presença e atividades dos usuários.
- **Interface Responsiva**: Design adaptado para proporcionar uma excelente experiência em diversos dispositivos.
- **Rotas Protegidas**: Garantia de que apenas usuários autenticados acessem as funcionalidades privadas.

### Testes Unitários e de Componentes (Vitest)

Para executar os testes com Vitest, utilize o seguinte comando:

```bash
npm run test
```

Para visualizar a interface do Vitest:

```bash
npm run test:ui
```

### Testes End-to-End (Playwright)

O projeto também está configurado para testes E2E utilizando o Playwright (verifique os scripts em `package.json` para comandos adicionais).

**OBS:**

- Este projeto foi desenvolvido com fins educacionais e para demonstração de habilidades em desenvolvimento web fullstack utilizando as tecnologias mais modernas do ecossistema JavaScript/TypeScript.
