# Meu Controle Financeiro

Controle financeiro pessoal e familiar, em Reais (BRL), sem integrações externas por ora.
Backend em Node (API REST) e front-end em Next.js. No futuro, também mobile (a mesma API serve web e mobile).
Responder sempre em português do Brasil.

## Objetivo do produto

1. Orçamento anual e mensal por categoria, de despesas e de receitas.
2. Acompanhamento durante o mês: quanto já foi gasto e quanto ainda pode ser gasto por categoria.
3. Cadastro de períodos (faturas) do cartão de crédito.
4. Importação da fatura do cartão (xlsx do Itaú), primeiro com categorização manual e depois semi-automática: transação conhecida é categorizada sozinha; desconhecida fica na fila de revisão até o ajuste manual.
5. Página de Resultado: despesas de trabalho, receita, despesas básicas e lucro/prejuízo.

Multiusuário só para separar os dados de cada login (uso pessoal e familiar). Não é o foco do projeto.

## Regra de negócio: despesas do cartão são regime de caixa, não competência

- As despesas do cartão de crédito seguem o **regime de caixa**. Uma despesa pesa no mês em que a fatura é **paga** (mês do vencimento da fatura), e **não** no mês em que a compra foi feita. Competência (mês da compra) não é usada para o cartão.
- A data da compra na fatura é só informativa. Compras parceladas vêm com a data da compra original; o mês de caixa é sempre o do período (fatura) importado.
- Cada parcela pesa na fatura em que aparece, pelo valor da parcela (nunca o total da compra no mês da compra).
- Estorno ou crédito abate a categoria na fatura em que aparece.
- O "pagamento da fatura anterior" que aparece na fatura é ignorado: contá-lo seria contar a mesma despesa duas vezes.
- Conta corrente: o lançamento pesa no mês da sua data (a data em que o dinheiro entra ou sai).
- Todo comparativo (orçado × realizado, Resultado) é feito por **mês de caixa**.
- Padrão: o mês de caixa de uma fatura é o mês do vencimento (a fatura de exemplo vence em 16/11/2026, logo pesa em novembro/2026). Confirmado na planilha original: a aba "Totais por Categoria" compara a fatura de cada mês com o orçamento do mesmo mês. O campo é editável por período. Confirmar com o usuário se algum caso fugir disso.

## Stack e comandos

- Backend: Node 22 (ESM, `"type": "module"`), Express 4, PostgreSQL (Neon, banco de teste), Drizzle ORM, JWT (Bearer), `zod` v3 para validação.
- `npm run dev` sobe a API com nodemon; `npm start` sobe sem nodemon.
- `npm run generate` gera migration a partir de `src/infra/db/schemas.js`; `npm run migrate` aplica no banco.
- `npm run set-password -- <login>` troca a senha de um usuário pelo terminal (entrada oculta; só funciona em terminal interativo).
- Variáveis de ambiente (ver `.env.example`): `DATABASE_URL`, `SEGREDO_JWT`, `PORT`, `LOG_PATH`; opcionais `CORS_ORIGINS` e `TRUST_PROXY`. O `server.js` falha na partida se faltar `DATABASE_URL` ou `SEGREDO_JWT`.
- Não existem testes automatizados ainda. Ao criar lógica de negócio nova (importador, normalização, relatórios), criar testes junto.
- Documentação da API em `/docs` (Swagger), a partir de `src/swagger.json`, mantido à mão: atualizar sempre que uma rota mudar.
- Front-end em `web/`: Next.js 16 (App Router, JavaScript, `cacheComponents` ligado), Tailwind CSS 4 sem biblioteca de componentes. Comandos dentro de `web/`: `npm run dev` (porta 3002), `npm run build`, `npm run lint`, `npm test` (`node --test`). Config em `web/.env.local` (ver `web/.env.example`): `API_URL` (backend, porta 3001 no `.env` local).
- O Next 16 mudou APIs (ex.: `middleware` agora é `proxy.js`). Antes de escrever código do front, ler o guia em `web/node_modules/next/dist/docs/` (ver `web/AGENTS.md`). Com `cacheComponents`, componente que lê `cookies()` ou `searchParams` fica dentro de `<Suspense>`.

## Arquitetura e convenções (backend)

- Estrutura por módulo em `src/modules/<modulo>/`: `routes` → `controllers` → `services` → `repositories`, mais `<modulo>-schemas.js` com os schemas `zod`. Módulos atuais: accounts, budget, categories, periods, transactions, users.
- Indentação com **tabs** nos arquivos existentes; manter o estilo do arquivo que estiver editando.
- Respostas sempre via `res.success(data, msg)` e `res.error(status, error, title)`. O status e a mensagem finais vêm do tipo do erro:
  - `AppError(status, mensagem)` (`src/utils/app-error.js`) expõe a mensagem ao cliente;
  - erros conhecidos do Postgres e de JWT viram 409/400/401 controlados;
  - qualquer outro erro vira 500 "Internal error." (o detalhe fica só no log).
- Validação de entrada com `validate({ body, query, params })` (`src/utils/validate.js`). Campos desconhecidos são descartados. PUT recebe só os campos a alterar e exige ao menos um.
- Isolamento por usuário: o `userId` vem do token e fica no AsyncLocalStorage. Todo acesso a tabela de domínio passa por `applyUserFilter`, e o `insert` do `_base-repository.js` grava o `userId`. Nunca aceitar `userId` vindo do cliente.
- Ao receber ids de conta, categoria ou período, chamar `assertReferences` (`src/infra/repositories/ownership-repository.js`): confirma que existem, pertencem ao usuário e que o período é da conta informada. A mensagem é a mesma para "não existe" e "é de outro usuário".
- Recurso inexistente retorna 404 (get, update e delete).

## Segurança (regras)

- Nunca gravar senha, token ou `Authorization` em log. O `logger-middleware` mascara campos sensíveis do body e o `logger` remove `params` de queries que falharam. Manter assim em qualquer log novo.
- Nunca imprimir `DATABASE_URL`, `SEGREDO_JWT` ou o conteúdo do `.env`.
- Login com mensagem genérica ("Invalid login or password"), com limite de 10 falhas por IP a cada 15 minutos. JWT com HS256 e validade de 1h.
- A fatura do cartão e a planilha de planejamento têm dados pessoais: ficam fora do git.
- No front, nunca guardar token em `localStorage`. O token fica em cookie `httpOnly`, e o navegador não deve chamar a API do backend com o token exposto ao JavaScript da página.

## Estado atual

- Entrega 0 (base segura) aplicada: validação com zod, checagem de dono nas referências, PUT e filtros nas listagens, tratamento de erros sem vazar SQL, rate limit no login, CORS opcional, `/health`, índice único em `Users.login`, swagger reescrito.
- Valores monetários ainda estão como `numeric(10,2)` (o Drizzle devolve texto). A validação normaliza para texto com 2 casas ("10.50"). Isso muda na Entrega 1.
- O `budget` atual está preso a conta + período e tem `amount` em `numeric`. Ele será **substituído** na Entrega 1 (ver abaixo); os dados do banco são só de teste.
- Fundação do front (Entrega 1.0) feita em `web/`: login por Server Action, sessão em cookie `httpOnly` `fin_session` (vence junto com o JWT, 1h; sem refresh token), `src/proxy.js` redireciona para `/login` sem sessão válida, "Sair" apaga o cookie, layout base, `src/lib/money.js` (texto pt-BR ↔ centavos, com testes) e `MoneyInput`. A página inicial tem uma conferência temporária da entrada de valores, a retirar na Entrega 1.
- Como o front fala com a API: Server Components e Server Actions usam `api()` de `web/src/lib/api.js`; Client Components usam `apiClient()` de `web/src/lib/api-client.js`, que chama `/api/<caminho>` (route handler `web/src/app/api/[...path]/route.js`), e esse repassa ao backend com o token. Requisição que altera dados exige `Origin` do próprio site (CSRF).

## Modelo de dados alvo

- **Valores em centavos, inteiro.** Conversão para R$ só na borda (tela). Evitar soma de texto/ponto flutuante. A API recebe e devolve inteiros em centavos, com o sufixo `Cents` no nome do campo (ex.: `amountCents`) para não haver ambiguidade (proposta; confirmar na Entrega 1).
- **Categoria tem grupo.** `category_groups` (nome, `kind`, classificação de resultado) e `categories` (grupo, nome). O `kind` é `RECEITA` ou `DESPESA`. Em grupos de despesa a classificação é `TRABALHO`, `BASICO` ou `INVESTIMENTO` e define como a categoria entra no Resultado. A identidade da categoria é o **id**, nunca o nome ("Outros" existe em mais de um grupo).
- **Forma de pagamento vem da conta**, não da categoria. `accounts.type` hoje: 1 = conta corrente, 2 = cartão de crédito.
- **`budget_items`**: categoria + ano + mês (calendário) + valor em centavos, único por usuário, categoria, ano e mês. Vale para receitas e despesas. Não depende de conta nem de período. Ação de "replicar para os meses seguintes" (o valor de uma categoria muda ao longo do ano).
- **`periods`** (fatura do cartão): conta, início, fim, **vencimento** e **mês de caixa** (ano e mês em que a fatura pesa no orçamento; padrão = mês do vencimento).
- **`transactions`**: data, descrição original, descrição normalizada, valor em centavos, conta, categoria **anulável**, período (para cartão), parcela atual e total, final do cartão (`card_last4`), lote de importação e hash de deduplicação. Sem categoria = pendente de revisão.
- **`import_batches`**: arquivo, período e totais, para reimportar sem duplicar.
- **`categorization_rules`** (Entrega 3): descrição normalizada → categoria, com confiança. Categorizar manualmente cria ou atualiza a regra.
- **Receita**: orçada por categoria e mês em `budget_items`, e realizada em lançamentos (`transactions`) de categorias de grupos `RECEITA`.

### Regras do Resultado

> Receita bruta − Despesas de trabalho = Receita antes de investimentos − Investimentos = Receita líquida − Despesas pessoais = **Resultado líquido**

Receita bruta = soma das categorias de grupos `RECEITA`. Despesas de trabalho, investimentos e despesas pessoais = soma das categorias de despesa conforme a classificação do grupo (`TRABALHO`, `INVESTIMENTO`, `BASICO`).

Mês com realizado usa o realizado; mês sem realizado usa o orçado (mesma regra da aba "Renda" da planilha original: `realizado` se for número, senão `orçado`). Na Entrega 1 só existe orçado.

Nem tudo vem do cartão (imposto, provisão de férias, aluguel, pensão): precisa de lançamento manual e, depois, de recorrentes.

## Importação da fatura (Itaú, xlsx)

Formato observado na fatura de exemplo:

- O cabeçalho do arquivo traz nome, agência e conta: **ignorar** esses campos.
- Campo de parcela próprio (`Parcela 2 de 12`): não extrair da descrição. As parcelas vêm com a **data da compra original**; o período da fatura **não** pode ser deduzido pela data (ver regime de caixa acima): vem do arquivo importado (vencimento).
- Tipos de linha: compra normal; pagamento da fatura anterior (não é despesa nem receita: ignorar); estorno ou crédito (valor negativo, abate a categoria); tarifas do cartão (`Mensalidade - Plano Do Cartão`, `Itaú Avisa`); parcelas.
- Vários cartões virtuais (finais diferentes): guardar só `card_last4` na transação, sem criar uma conta por cartão.
- Conferência automática: o total do cabeçalho é a soma das linhas **sem** o pagamento da fatura anterior. Avisar se não bater.
- A fatura pode estar aberta (`Valor (parcial)`): a importação precisa ser **idempotente**. Hash de deduplicação = data + descrição normalizada + valor + parcela + final do cartão.

### Normalização da descrição (chave das regras)

Minúsculas, sem acento, sem sufixo de parcela (`NN/NN`), sem cidade e `BRA` coladas no fim, espaços colapsados. Exemplos de variação real: `SEMPRE DE SAMSUNG 06/21SAO PAULO BRA`, `Sempre De Samsung Sao Paulo Bra` e `Leiturinha S.a 07/12`. Há comerciantes com sufixo variável (`amazonmktplc*qualquer-vendedor`): resolver com regra por prefixo.

Guardar a descrição normalizada em cada transação **desde a Entrega 2**, mesmo antes das regras existirem: assim as categorizações manuais já alimentam o histórico.

Categorizar sozinho só quando o histórico aponta para uma categoria dominante; se a descrição aparece em mais de uma categoria, sugerir e pedir confirmação. Um teste rápido com o histórico da planilha deu match exato em cerca de 80% das linhas da fatura de exemplo (estimativa). O histórico categorizado da planilha original (aba "Realizado - Credito") serve para popular as regras iniciais.

## Plano de entregas

Trabalho por funcionalidade (fatia vertical): cada entrega muda **backend e front-end juntos** e só começa a próxima depois da anterior validada pelo usuário.

### Pré-requisitos gerais (antes da Entrega 1)

1. **Entrega 0 rodando:** `npm install`, `npm run generate`, `npm run migrate` e `npm run dev` funcionando, e a senha do admin trocada.
2. **Fundação do front (Entrega 1.0):** projeto Next.js, login e sessão por cookie `httpOnly`, cliente da API, layout base, formatação e entrada de valores em BRL (digitou "1.234,56" → 123456 centavos). Feita (ver "Estado atual"): login a cada hora, sem refresh token; logout só no Next (apaga o cookie).
3. **Lista inicial de grupos e categorias** (com `kind` e classificação do Resultado): feita e confirmada em `dados/categorias-iniciais.json` (fora do git: tem nomes pessoais). 6 grupos e 49 categorias. Decisões: "Gastos Débito" e "Gastos Crédito" da planilha viraram "Despesas fixas" e "Dia a dia"; "Compras Parceladas" é uma categoria só, no "Dia a dia"; tarifas do cartão vão para "Banco". Imposto, Provisão Férias e a renda orçada são fórmulas na planilha (percentual da receita, valor-hora); na Entrega 1 são valores digitados, e uma regra automática fica para depois.

### Entrega 1: preenchimento do orçamento e resultado líquido

Objetivo: preencher o orçamento de despesas e receitas por categoria, mês e ano, e ver o resultado líquido orçado.

- Backend:
  - migration do novo modelo (centavos, `category_groups`, `categories` com grupo, `budget_items`; substitui o `budget` antigo);
  - CRUD de grupos e categorias (incluindo editar, e arquivar em vez de apagar categoria em uso);
  - endpoints da grade de orçamento por ano (categoria × 12 meses), gravação de um valor e "replicar para os meses seguintes";
  - endpoint do Resultado orçado por mês e por ano.
- Front: fundação (1.0), cadastro de grupos e categorias, grade de orçamento anual editável com subtotais por grupo e visão do mês, painel do Resultado líquido (mensal e anual).
- Pré-requisitos próprios: os gerais acima.

### Entrega 2: realizado, comparativo com o orçamento e importação da fatura (categorização manual)

Objetivo: lançar o realizado, comparar com o orçado ("quanto já gastei e quanto ainda posso gastar por categoria") e importar a fatura categorizando à mão.

- Backend:
  - cadastro de contas (corrente e cartão) e de períodos/faturas com vencimento e mês de caixa;
  - novo modelo de `transactions` e `import_batches`, importador do xlsx do Itaú (tipos de linha, conferência de total, idempotência por hash, descrição normalizada);
  - lançamentos manuais (receitas realizadas e despesas fora do cartão);
  - categorização manual de transação (uma ou várias);
  - endpoints de orçado × realizado × saldo por categoria e mês de caixa, e Resultado com a regra "realizado, senão orçado".
- Front: telas de contas e faturas, upload da fatura com resumo da conferência, lista das transações importadas com escolha de categoria, lançamentos manuais, comparativo orçado × realizado por categoria, Resultado com realizado.
- Pré-requisitos: Entrega 1 concluída (categorias, grupos e orçamento); biblioteca de leitura de xlsx e recebimento de arquivo (multipart) no backend, com limite de tamanho (o limite do JSON hoje é 100kb); ao menos uma conta corrente e uma conta de cartão cadastradas; a regra de regime de caixa acima.
- Fora do escopo: lançamentos recorrentes e projeção de parcelas futuras.

### Entrega 3: categorização semi-automática e fila de revisão

Objetivo: transação conhecida é categorizada sozinha na importação; as demais ficam numa fila de revisão.

- Backend: `categorization_rules`, função de normalização (testada com as variações reais), regras por prefixo, confiança (só aplica sozinho com categoria dominante), carga inicial das regras a partir do histórico da planilha, aplicar regra nova às pendentes, endpoint da fila de revisão.
- Front: fila de revisão com sugestões, "aplicar a todas iguais", gestão de regras.
- Pré-requisitos: Entrega 2 concluída, com a descrição normalizada já guardada nas transações; o histórico categorizado da planilha original exportado em arquivo para a carga inicial (dados pessoais: fora do git).

## Decisões pendentes

- **Limite de login atrás do Next:** o backend vê todas as tentativas vindas do IP do servidor Next, então o limite de 10 falhas vale para todos juntos. O Next repassa o IP do navegador em `X-Forwarded-For`, mas o backend só o usa com `TRUST_PROXY`, e isso só é seguro com um proxy reverso confiável na frente do Next sobrescrevendo esse cabeçalho. Decidir na hospedagem.
- **`household`:** se a família for compartilhar o mesmo orçamento, adicionar esse conceito (hoje todo dado pertence a um usuário). Decidir antes de ter dados reais.

Decisões mantidas: Drizzle e JavaScript no backend (sem migrar para TypeScript agora). Front em `web/` no mesmo repositório, em JavaScript, falando com a API pelo servidor do Next (cookie `httpOnly`, sem CORS), com novo login a cada hora (sem refresh token por ora).

## Como trabalhar neste projeto

- Mudanças pequenas e por funcionalidade; mostrar o plano antes de alterar o schema do banco.
- Pedir confirmação antes de `npm run migrate`, de apagar dados (`npm run clear-db` apaga as tabelas de domínio) e de qualquer commit. O banco do Neon hoje é só de teste.
- Depois de alterar rotas: atualizar `src/swagger.json` e rodar a API para conferir. Depois de alterar telas: abrir no navegador e conferir o fluxo.
- Ao mexer em valores monetários, em datas e fusos (usar `America/Sao_Paulo`), na regra de regime de caixa ou no isolamento por usuário, escrever teste.