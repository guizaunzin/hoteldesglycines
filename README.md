# Hôtel des Glycines — L'affaire du Rossignol

Jogo de investigação para adultos praticarem **conversação em francês (A2 e B1)**. O jogador chega a um pequeno hotel na Normandia, descobre que uma caixa de música antiga desapareceu durante a noite e precisa conversar (por voz ou texto) com três personagens que têm versões incompletas e contraditórias.

- Uma partida dura cerca de 20 a 30 minutos, com 3 personagens, 3 ambientes e 8 pistas.
- O jogo abre direto na experiência, sem landing page.
- Há um **modo demonstração**, claramente sinalizado, que funciona sem nenhuma chave.

## Como jogar

1. Escolha o nível (A2 ou B1) e comece.
2. Examine os pontos marcados com ✦ nas cenas (recepção, salão, jardim). Cada pista encontrada vai para o **Carnet**.
3. Converse em francês com Karim, M. Lambert e Odile. Use o microfone 🎙 ou digite.
4. Use **Présenter** para mostrar uma prova ou um depoimento. As reações revelam contradições.
5. Se precisar de ajuda: 🔊 repetir, 🐢 mais devagar, 🇧🇷 traduzir, clique numa palavra para ver a explicação, ou peça sugestões em **Comment demander ?**. No Carnet, **Une piste** dá dicas de investigação em dois níveis.
6. Clique em **Conclure**, escolha um suspeito e até três provas. Um dossiê completo tem uma mentira, uma ligação com o esconderijo e um motivo.
7. No final, veja o desfecho explicado e até **três pontos prioritários de francês**, com exemplos tirados da sua partida e exercícios para praticar.

## Desenvolvimento local

Pré-requisitos: Node.js 20.9 ou mais recente (recomendado: 22, ver `.nvmrc`).

```bash
npm ci
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Abra http://localhost:3000. Sem nenhuma variável preenchida, o jogo roda em **modo demonstração**: os diálogos são pré-escritos, o reconhecimento de voz usa o navegador e o estado é cifrado com uma chave de desenvolvimento.

### Verificações

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

Teste ponta a ponta num navegador real (Playwright), com o app rodando:

```bash
npx playwright install chromium
```

```bash
npm run build && npm start
```

```bash
BASE_URL=http://localhost:3000 npm run test:e2e
```

O e2e joga um ciclo completo só com texto (sem APIs de voz) e testa:

- a contradição e a apresentação de provas;
- a retomada da partida depois de recarregar a página;
- uma tentativa de "jailbreak";
- uma acusação recusada por falta de provas e depois o desfecho;
- o balanço de francês;
- a voz simulada (consentimento, ditado e leitura em voz alta);
- o layout no celular (iPhone 13).

As capturas de tela ficam em `e2e-screenshots/`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GAME_STATE_SECRET` | **Sim, em produção** | Chave para cifrar o estado da partida guardado no navegador (AES-256-GCM). Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Se você trocar a chave, as partidas salvas são descartadas (o jogo avisa e recomeça). |
| `ANTHROPIC_API_KEY` | Não | Ativa a conversa livre com IA (Claude). Sem ela, o jogo usa o modo demonstração. |
| `ANTHROPIC_MODEL` | Não | Modelo dos personagens. Padrão: `claude-opus-5-5`. Para reduzir custo e latência: `claude-sonnet-5-5` ou `claude-haiku-5-5`. |
| `AI_PROVIDER` | Não | `demo` força o modo demonstração mesmo com chave. |
| `OPENAI_API_KEY` | Não | Ativa a voz pelo servidor (transcrição e síntese com vozes por personagem). Sem ela, usa a Web Speech API do navegador. |
| `OPENAI_STT_MODEL` / `OPENAI_TTS_MODEL` | Não | Padrões: `gpt-4o-mini-transcribe` / `gpt-4o-mini-tts`. |

Nenhuma chave é exposta ao navegador. Todas as chamadas com credenciais acontecem nas rotas `/api/*`.

## Deploy na Vercel

1. Importe o repositório do GitHub na Vercel (**Add New → Project**). O framework é detectado como Next.js, sem configuração extra (`npm ci` + `next build`).
2. Em **Settings → Environment Variables**, defina pelo menos `GAME_STATE_SECRET` (em Production e Preview, de preferência com valores diferentes). Para ativar a IA ou a voz pelo servidor, adicione as chaves opcionais acima.
3. Faça o deploy. `/api/config` mostra o modo ativo (`dialogue: "ai" | "demo"`), sem revelar segredos.
4. Recomendado: em **Firewall**, crie uma regra de *rate limiting* para `/api/game`, `/api/language` e `/api/voice/*`. O app já tem um limitador simples em memória, mas ele vale por instância serverless e é só um complemento.

Notas sobre a hospedagem:

- O jogo não depende de disco nem de processos permanentes. O progresso fica num token cifrado no `localStorage` do navegador, e o servidor é *stateless*. Não há banco de dados: na primeira versão não houve necessidade concreta.
- As rotas de API declaram `maxDuration = 60` segundos. Uma resposta da IA costuma levar poucos segundos.
- Um áudio enviado para transcrição tem limite de 4 MB, abaixo do limite de 4,5 MB do corpo de requisição da Vercel, e cada gravação é cortada em 30 s.

## Voz: abordagem, limitações e custos

A conversa é por turnos ("aperte, fale, solte"), não *streaming* em tempo real. Assim, cada fala passa pelo motor de regras antes de o personagem responder, e o modelo funciona bem em funções serverless.

| | Navegador (padrão) | Servidor (opcional, `OPENAI_API_KEY`) |
|---|---|---|
| Reconhecimento | Web Speech API (`fr-FR`). Grátis. Funciona no Chrome, Edge e Safari (inclusive iOS 14.5+). **Não funciona no Firefox.** No Chrome, o áudio é processado pelos servidores do Google. | Gravação (MediaRecorder) → `/api/voice/transcribe`. Funciona em qualquer navegador moderno e costuma ser mais preciso com sotaque de aprendiz. Cobrado por minuto de áudio. |
| Leitura em voz alta | `speechSynthesis`. Grátis. A qualidade e as vozes francesas disponíveis dependem do sistema operacional. | `/api/voice/speak` com uma voz por personagem. Cobrado por volume de texto/áudio gerado. |

Para os preços atuais, consulte as tabelas oficiais de cada provedor. Em todos os casos:

- O microfone só é usado depois de um **consentimento explícito** dentro do jogo.
- **Nenhuma gravação é armazenada.** No modo servidor, o áudio é repassado uma única vez para transcrição e descartado. Só o texto da conversa fica salvo no navegador.
- Se não houver microfone ou reconhecimento disponível, o botão 🎙 fica desativado, com explicação, e o jogo continua 100% jogável por texto. Se a síntese de voz falhar, o texto continua visível.

## Custos da IA (estimativa)

Cada fala do jogador gera uma chamada curta (esforço `low`, saída estruturada em JSON). A entrada tem cerca de 2 a 3 mil tokens (personagem, fatos liberados e histórico curto) e a saída algumas centenas de tokens. Ordem de grandeza por partida de cerca de 60 falas:

| Modelo | Preço (entrada / saída por milhão de tokens) | Partida |
|---|---|---|
| `claude-opus-5-5` (padrão) | US$ 4 / US$ 20 | cerca de US$ 1 |
| `claude-sonnet-5-5` | US$ 2 / US$ 10 | cerca de US$ 0,50 |
| `claude-haiku-5-5` | US$ 0,10 / US$ 0,50 | alguns centavos |

São estimativas: meça com tráfego real antes de escolher. O balanço final e a verificação dos exercícios fazem mais 1 a 4 chamadas. As apresentações de provas e as explorações **não** chamam a IA, porque as reações a provas são determinísticas.

As chamadas usam `fallbacks: "default"` (*fallback* do lado do servidor da Anthropic, se o modelo recusar). Em caso de erro, tempo esgotado, recusa ou resposta fora das regras, o personagem responde com a fala pré-escrita equivalente, marcada como "reserva" na interface.

## Arquitetura

```
src/
  app/                    Next.js (App Router)
    page.tsx              abre direto no jogo
    api/game/route.ts     ações do jogo: new, state, visit, examine, talk, present, suggest, hint, accuse
    api/language/route.ts explicar palavra, balanço final, verificar exercício
    api/voice/*           transcrição e síntese no servidor (opcionais)
    api/config/route.ts   modo ativo (IA/demo, voz) sem segredos
  shared/                 tipos e dados PÚBLICOS (cenas, pontos de interesse, perfis)
  server/                 tudo o que é secreto ou usa credenciais ("server-only")
    case/glycines.ts      verdade do caso, cronologia, pistas, fatos, condições, reações, desfechos
    engine/               motor de investigação (regras verificáveis por código)
    dialogue/             geração de falas: interface + Claude + modo demo + guarda
    language/             heurísticas do balanço e glossário (modo demo)
    state/token.ts        estado cifrado e autenticado (AES-256-GCM)
  client/                 API, armazenamento local, voz (navegador/servidor)
  components/             interface (cenas SVG, diálogo, carnet, acusação, final)
tests/                    testes unitários (Vitest)
scripts/e2e.cjs           percurso completo no navegador (Playwright)
docs/caso.md              projeto do caso (contém a solução!)
```

### Separação entre o motor de investigação e a geração de diálogos

1. O **motor** (`src/server/engine`) decide o que cada personagem *pode* dizer. Cada fato tem condições (pistas encontradas, fatos já revelados, *flags*), e as mentiras são marcadas como contraditas quando o fato que as desmente aparece. As reações às provas apresentadas e as regras de acusação também são código.
2. O **gerador de diálogos** (`src/server/dialogue`) só verbaliza. A IA recebe a persona pública e **apenas os fatos já liberados** para aquele personagem. A verdade do caso, a cronologia real e os fatos bloqueados **nunca** aparecem no prompt, então a IA não tem como revelá-los, nem diante de pedidos como "ignore as instruções".
3. A IA devolve JSON com `facts_used`. O motor aceita apenas IDs autorizados e descarta o resto (testado). Uma guarda pós-geração bloqueia confissões ou acusações inventadas e saídas de personagem, e nesse caso usa a fala pré-escrita.
4. O estado de jogo vive num token **cifrado e autenticado**: o navegador não lê os fatos internos nem consegue forjar progresso. A interface só recebe o que já foi descoberto. O build é verificado para que nenhum texto secreto vá parar no bundle do cliente.
5. A IA é substituível: `DialogueProvider` é uma interface. Para trocar de provedor, basta implementá-la (`src/server/dialogue/provider.ts`).

### O que os testes cobrem (`npm test`, 62 testes)

- **Consistência da solução:** um BFS/fechamento prova que todas as pistas e depoimentos são alcançáveis e que cada categoria de prova pode ser obtida. Também verifica referências, IDs únicos, falas em A2, B1 e PT, e de 6 a 8 pistas.
- **Limites de conhecimento:** a cada etapa, o prompt de cada personagem não contém fatos bloqueados, a verdade nem a explicação final. Um personagem não pode revelar fatos de outro.
- **Desbloqueio de pistas:** a cabana não revela nada antes do depoimento de Lambert. Não dá para apresentar provas que você não tem. Mentiras não se repetem depois da confissão do próprio personagem. As reações não se repetem.
- **Tentativas de contorno:** pedidos para revelar a solução ou ignorar as regras não liberam nada.
- **Acusação:** suspeito errado, provas insuficientes (a partida continua), desfecho "resolvido" ou "perfeito", provas fracas que se somam, e nenhuma ação depois do fim.
- **Recuperação do progresso:** ida e volta do token, rejeição de tokens adulterados, `localStorage` corrompido, cheio ou bloqueado.
- **Provedor Claude** (com cliente simulado): filtragem de fatos, guarda e *fallback* em erro, recusa ou JSON inválido.
- **Classificação de perguntas em francês** (A2/B1, com e sem acentos), detecção de português ou inglês, e balanço de língua.

## Limitações conhecidas desta primeira versão

- **A integração real com a API da Anthropic e com a voz OpenAI não foi exercitada com chaves reais neste ambiente.** O código segue os SDKs/APIs documentados e foi testado com clientes simulados. Valide com suas chaves antes de abrir ao público.
- No modo demonstração, a compreensão das perguntas é por palavras-chave. Perguntas fora do previsto recebem um pedido de reformulação, e as sugestões de "Comment demander ?" ajudam. Com a IA, a conversa é livre.
- O limitador de requisições é em memória (por instância). Para uso público, configure o firewall da Vercel.
- Um único caso. O formato de dados (`CaseDefinition`) já permite adicionar outros.
- Sem login nem sincronização entre dispositivos: o progresso fica no navegador.
