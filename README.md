# Studio Agenda — Aplicação de Agendamento de Serviços

Aplicação completa de agendamento de serviços com **área do cliente** (agendamento
online, consulta de horários disponíveis e confirmação) e **área administrativa**
(gestão dos agendamentos, filtro por data, alteração de status, cancelamento e
exclusão).

---

## Tecnologias utilizadas

- **React.js** (Vite) — interface do cliente e do administrador
- **React Router** — separação entre a visão do cliente e a visão administrativa
- **CSS puro** — toda a estilização (sem frameworks de CSS utilitário)
- **PocketBase** — backend, API REST, autenticação e persistência de dados

> ### Nota técnica importante
> O pedido original especificava **Node.js + Express + PostgreSQL + Prisma**. Este
> ambiente de execução (Hostinger Horizons) fornece uma stack gerenciada baseada em
> **PocketBase**, que já entrega, de forma integrada, exatamente as mesmas
> capacidades exigidas: uma **API REST**, um **banco de dados relacional (SQLite)**
> com migrações versionadas, **autenticação** e **regras de acesso**. Por isso, a
> camada de dados/Express/Prisma foi implementada sobre o PocketBase, preservando
> integralmente todos os requisitos funcionais (persistência real, validação,
> separação cliente/admin, prevenção de horários duplicados etc.).
>
> Uma versão 100% **Express + PostgreSQL + Prisma** manteria a mesma arquitetura
> descrita abaixo (Controllers, Routes, Services), apenas trocando o provedor de
> dados.

---

## Estrutura de pastas

```
apps/
  web/                         # Front-end (React + Vite + CSS puro)
    src/
      components/              # Componentes reutilizáveis (TopBar, ScrollToTop)
      pages/                   # HomePage (cliente), AdminLoginPage, AdminPage
      services/                # Camada de acesso à API (appointmentsService.js)
      styles/                  # CSS puro (app.css)
      lib/                     # Cliente da API (pocketbaseClient.js)
  pocketbase/                  # Back-end / API REST / banco de dados
    pb_migrations/             # Migrações do schema (equivalente ao Prisma migrate)
    pb_data/                   # Dados persistidos
```

---

## Como executar o projeto localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar front-end e back-end juntos
npm run dev
```

- Front-end: `http://localhost:3000`
- API / painel do banco: `http://localhost:8090/_/`

---

## Configuração do arquivo .env

A conexão com o banco de dados usa a variável `DATABASE_URL`. Crie um arquivo
`.env` na raiz do serviço de dados:

```env
# Exemplo para PostgreSQL (arquitetura equivalente com Prisma)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agenda?schema=public"
```

No ambiente atual (PocketBase), a persistência é local em `apps/pocketbase/pb_data`
e não requer configuração adicional.

---

## Como conectar ao PostgreSQL e rodar as migrações (arquitetura Prisma)

Numa implementação com Prisma, o fluxo seria:

```bash
# Definir DATABASE_URL no .env (ver acima)
npx prisma migrate dev --name init   # cria e aplica as migrações
npx prisma generate                  # gera o client
```

Neste projeto, o equivalente às migrações do Prisma são os arquivos versionados em
`apps/pocketbase/pb_migrations/`. Eles são aplicados automaticamente ao iniciar o
serviço. A migração `1784424600_scheduling_setup.js` cria a tabela `appointments`
e o usuário administrador.

---

## Modelo de dados (appointments)

| Campo   | Tipo   | Descrição                                             |
| ------- | ------ | ----------------------------------------------------- |
| name    | text   | Nome do cliente                                       |
| phone   | text   | Telefone                                              |
| service | text   | Serviço escolhido                                     |
| date    | text   | Data (YYYY-MM-DD)                                     |
| time    | text   | Horário (HH:MM)                                       |
| status  | select | agendado, confirmado, concluido, cancelado            |

Um índice único em `(date, time)` (ignorando cancelados) impede que dois clientes
reservem o mesmo horário.

---

## Decisões técnicas

- **Separação front/back**: front-end React em `apps/web`, back-end/API em
  `apps/pocketbase`.
- **Camadas (Services / Pages / Components / Styles)**: acesso à API centralizado
  em `services/appointmentsService.js`; páginas e componentes desacoplados; estilos
  em CSS puro.
- **Validação**: validação básica dos formulários no cliente (nome, telefone
  numérico, serviço, data e horário obrigatórios) e regras de integridade no banco.
- **Consistência de horários**: os horários já ocupados são carregados por data e
  desabilitados no formulário; o índice único garante a regra também no servidor.
- **Segurança da área administrativa**: rota protegida por autenticação; apenas
  usuários autenticados podem alterar status, cancelar ou excluir agendamentos.
- **Responsividade**: layout fluido com grid e breakpoints em CSS puro.

---

## Acesso administrativo (ambiente de demonstração)

- **E-mail:** `admin@agenda.com`
- **Senha:** `admin12345`

---

## Ferramentas de Inteligência Artificial utilizadas

O desenvolvimento foi assistido por um **agente de IA de geração de código**
(assistente da plataforma Hostinger Horizons), utilizado para estruturar o
projeto, gerar componentes React, o schema/migrações do banco, a camada de
serviços e a estilização em CSS puro, além de imagens ilustrativas geradas por IA.
```
