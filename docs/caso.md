# Projeto do caso — L'affaire du Rossignol

> ⚠️ **Contém a solução.** Documento para autores e manutenção. A fonte da verdade executável é `src/server/case/glycines.ts`.

## Premissa

Hôtel des Glycines, Port-Lunel (Normandia, cidade fictícia). O jogador é assistente do antiquário Delorme e veio buscar o **Rossignol**, uma caixa de música suíça de 1890 que a dona, Odile, aceitou vender. Ao chegar, a vitrine do salão está vazia.

## Verdade

**Odile escondeu a caixa ela mesma**, embrulhada no seu lenço verde, na casinha de ferramentas do jardim. A mãe dela tinha pedido: "garde-la toujours". O filho Julien insiste em vender para pagar o telhado. Odile não teve coragem de dizer não, então simulou um roubo e acusou Lambert.

## Cronologia real

| Hora | Acontecimento |
|---|---|
| 22:30 | Odile dá boa-noite e sobe. |
| 22:45 | Ronda de Karim: a caixa está na vitrine. |
| 22:50 | Odile desce e manda Karim ver o fim do jogo ("ça reste entre nous"). |
| 23:00 | Karim vai ao Café du Port. A chuva começa. |
| 23:05 | Odile pega a chave no quadro, abre a vitrine (sem quebrar) e pega a caixa. |
| 23:15 | Lambert desce ao jardim para telefonar (sem sinal no quarto). |
| 23:20 | Odile leva a caixa à casinha com uma lanterna. Lambert vê a luz. |
| 23:30 | Odile volta de pantufas (marcas de terra), devolve a chave e sobe. Lambert entra correndo e esquece os óculos. |
| 23:45 | Karim volta, fecha a porta-janela e escreve "RAS" no registro. |
| 07:00 | Odile "descobre" o roubo e acusa Lambert. |

## Personagens: o que sabem, acreditam, escondem e podem revelar

| | Afirma no início | Esconde | Por quê | Revela quando |
|---|---|---|---|---|
| **Karim** (recepcionista) | Ficou na recepção a noite toda. | Saiu das 23:00 às 23:45. | Medo de perder o emprego. | Ao ver o **ticket** do café. Depois, se perguntado, conta que **Odile** o mandou sair e disse que vigiaria a recepção, e o que viu ao voltar. |
| **Lambert** (hóspede) | Ficou no quarto. | Foi ao jardim às 23:15. | Vergonha: ligava para um colecionador de Genebra. | Ao ver os **óculos**. Depois, se perguntado, conta da **lanterna** indo até a casinha e descreve a silhueta (baixa, roupão claro). |
| **Odile** (dona) | Dormiu das 22:30 às 7:00 (sonífero). Acusa Lambert. | Desceu, pegou e escondeu a caixa. | Não quer vender a lembrança da mãe. | Admite ter descido quando confrontada com o **depoimento de Karim**. Diante da **caixa no lenço**, se cala. Confessa no desfecho. |

## Pistas (8)

| Pista | Local | Mostra |
|---|---|---|
| Vitrine intacta | Salão | Foi aberta com a chave. |
| Registro da noite | Recepção | "RAS" (versão de Karim). |
| Ticket do Café du Port (23:12) | Recepção, lixeira | Contradiz Karim. |
| Marcas de terra pequenas | Salão, porta-janela | Pantufas, não sapatos 45 (os de Lambert). |
| Foto de 1971 | Salão, piano | Motivo: "Garde-la toujours". |
| Carta de Julien | Recepção, escaninho | Motivo: pressão do filho. |
| Óculos molhados "R.L." | Jardim, banco | Contradiz Lambert. |
| O Rossignol no lenço "O.F." | Jardim, casinha | Só aparece depois do depoimento da lanterna. |

## Contradições centrais

1. Registro "RAS" × ticket → Karim confessa → **Odile estava lá embaixo às 22:50**.
2. "Fiquei no quarto" × óculos no banco → Lambert confessa → **lanterna até a casinha às 23:20**.
3. "Dormi a noite toda" × depoimento de Karim → Odile admite ter descido.

## Acusação (regras no código)

- O suspeito certo é Odile. As provas valem por categoria:
  - **mentira:** `k_odile_sent`, `o_admits`;
  - **ligação:** fortes são `boite`, `k_scarf`, `l_scarf`, `o_cornered`; fracas são `terre`, `l_light`, `l_silhouette`, `l_shoes`, e duas fracas valem uma forte;
  - **motivo:** fortes são `photo`, `o_photo`, `lettre`, `o_family_letter`; fracas são `l_offer`, `o_lambert_offer`.
- Com **ligação + (mentira ou motivo)**, o caso está resolvido. Com as três categorias, o desfecho é "perfeito".
- Suspeito certo sem provas suficientes: Odile recusa, o jogo indica a categoria que falta e a partida continua.
- Suspeito errado: desfecho "pista falsa", com a explicação completa.
