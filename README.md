# 🚀 Jitterbit Orders API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-7+-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Swagger-UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"/>
</p>

API REST para gerenciamento de pedidos, desenvolvida como Desafio Técnico Jitterbit — Professional Services.

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Autenticação JWT](#-autenticação-jwt)
- [Endpoints](#-endpoints)
- [Exemplos de uso](#-exemplos-de-uso)
- [Mapeamento de Campos](#-mapeamento-de-campos)
- [Documentação Swagger](#-documentação-swagger)
- [Códigos HTTP](#-códigos-http)

---

## ✅ Funcionalidades

- **CRUD completo** de pedidos (criar, ler, listar, atualizar, deletar)
- **Autenticação JWT** — todas as rotas de pedido são protegidas
- **Mapeamento de dados** — transforma campos PT-BR → EN antes de salvar
- **Validação de dados** — campos obrigatórios e tipos verificados
- **Documentação Swagger** — interface interativa em `/api-docs`
- **Tratamento de erros** com mensagens claras e status HTTP corretos

---

## 🛠 Tecnologias

| Pacote | Versão | Função |
|--------|--------|--------|
| `express` | ^4.18 | Framework HTTP |
| `mongoose` | ^8.0 | ODM para MongoDB |
| `jsonwebtoken` | ^9.0 | Geração e verificação de tokens JWT |
| `bcryptjs` | ^2.4 | Hash seguro de senhas |
| `swagger-jsdoc` | ^6.2 | Geração da spec OpenAPI a partir dos comentários |
| `swagger-ui-express` | ^5.0 | Interface visual da documentação |
| `dotenv` | ^16.3 | Leitura de variáveis de ambiente |
| `nodemon` | ^3.0 | Reinício automático em desenvolvimento |

---

## 📁 Estrutura do Projeto

```
jitterbit-orders-api/
├── src/
│   ├── middleware/
│   │   └── auth.js          # Middleware de verificação do token JWT
│   ├── models/
│   │   ├── Order.js         # Schema Mongoose da collection 'orders'
│   │   └── User.js          # Schema Mongoose da collection 'users'
│   ├── routes/
│   │   ├── authRoutes.js    # POST /auth/register  |  POST /auth/login
│   │   └── orderRoutes.js   # CRUD /order (protegido)
│   ├── database.js          # Conexão com o MongoDB
│   ├── mapper.js            # Transformação de campos PT-BR ↔ EN
│   ├── server.js            # Arquivo principal da aplicação
│   └── swagger.js           # Configuração do Swagger UI
├── .env.example             # Modelo das variáveis de ambiente
├── .gitignore
└── package.json
```

---

## 📦 Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org) v18 ou superior
- [MongoDB Community](https://www.mongodb.com/try/download/community) rodando localmente na porta `27017`

---

## ⚡ Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/germanomp/jitterbit-orders-api.git
cd jitterbit-orders-api

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seu editor e ajuste os valores se necessário

# 4. Inicie o servidor em modo desenvolvimento
npm run dev

# Ou em modo produção:
npm start
```

Acesse:
- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api-docs

---

## 🔐 Autenticação JWT

Todas as rotas de `/order` exigem autenticação. O fluxo é:

### 1. Registrar usuário

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "senha123"
}
```

### 2. Fazer login e obter o token

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 3. Usar o token nas requisições

Adicione o token no header de todas as chamadas a `/order`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 Endpoints

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/register` | Cria um novo usuário | ❌ Não |
| `POST` | `/auth/login` | Retorna token JWT | ❌ Não |

### Pedidos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/order` | Cria um novo pedido | ✅ Sim |
| `GET` | `/order/:orderId` | Retorna pedido por ID | ✅ Sim |
| `GET` | `/order/list` | Lista todos os pedidos | ✅ Sim |
| `PUT` | `/order/:orderId` | Atualiza um pedido | ✅ Sim |
| `DELETE` | `/order/:orderId` | Remove um pedido | ✅ Sim |

---

## 💡 Exemplos de uso

### Criar pedido

```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }'
```

**Resposta `201 Created`:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

### Buscar pedido por ID

```bash
curl http://localhost:3000/order/v10089015vdb-01 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Listar todos os pedidos

```bash
curl http://localhost:3000/order/list \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar pedido

```bash
curl -X PUT http://localhost:3000/order/v10089015vdb-01 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 15000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      { "idItem": "2434", "quantidadeItem": 2, "valorItem": 1500 }
    ]
  }'
```

### Deletar pedido

```bash
curl -X DELETE http://localhost:3000/order/v10089015vdb-01 \
  -H "Authorization: Bearer SEU_TOKEN"
# Retorna 204 No Content
```

---

## 🔄 Mapeamento de Campos

A API recebe os dados no formato PT-BR e os transforma antes de salvar no MongoDB:

| Campo recebido (requisição) | Campo salvo (banco) |
|-----------------------------|---------------------|
| `numeroPedido` | `orderId` |
| `valorTotal` | `value` |
| `dataCriacao` | `creationDate` |
| `items[].idItem` | `items[].productId` |
| `items[].quantidadeItem` | `items[].quantity` |
| `items[].valorItem` | `items[].price` |

**Documento no MongoDB:**
```json
{
  "_id": "ObjectId(...)",
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "ISODate(2023-07-19T12:24:11.529Z)",
  "items": [
    { "productId": 2434, "quantity": 1, "price": 1000 }
  ]
}
```

---

## 📄 Documentação Swagger

Com o servidor rodando, acesse:

**http://localhost:3000/api-docs**

Para testar diretamente pelo Swagger:
1. Use `POST /auth/login` para obter o token
2. Clique no botão **Authorize 🔒** no topo da página
3. Cole o token no campo e clique em **Authorize**
4. Todos os endpoints passam a funcionar com autenticação

A spec OpenAPI em JSON também está disponível em: `GET /api-docs.json`  
(útil para importar no Postman: *Import → Link → http://localhost:3000/api-docs.json*)

---

## 📊 Códigos HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| `200` | OK | Pedido encontrado / atualizado |
| `201` | Created | Pedido criado com sucesso |
| `204` | No Content | Pedido deletado com sucesso |
| `400` | Bad Request | Campos inválidos ou ausentes |
| `401` | Unauthorized | Token ausente, inválido ou expirado |
| `404` | Not Found | Pedido não encontrado |
| `409` | Conflict | Pedido com mesmo ID já existe |
| `500` | Internal Server Error | Erro inesperado no servidor |
