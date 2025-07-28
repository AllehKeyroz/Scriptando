'use server';
/**
 * @fileOverview Fluxo de IA para gerar scripts GHL.
 *
 * - generateScript: Função que gera um script JS com base no DOM e em um comando.
 * - GenerateScriptInput: O tipo de entrada para a função.
 * - GenerateScriptOutput: O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateScriptInputSchema = z.object({
  dom: z.string().describe('O conteúdo HTML completo do corpo (body) da página Go High Level onde o script será executado.'),
  command: z.string().describe('O comando em linguagem natural descrevendo a funcionalidade que o script deve implementar.'),
});
export type GenerateScriptInput = z.infer<typeof GenerateScriptInputSchema>;

export const GenerateScriptOutputSchema = z.object({
  script: z.string().describe('O código JavaScript gerado. O código não deve incluir as tags <script></script>, apenas o JS puro.'),
});
export type GenerateScriptOutput = z.infer<typeof GenerateScriptOutputSchema>;

// Função wrapper exportada que será chamada pelo componente do frontend.
export async function generateScript(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  return generateScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptPrompt',
  input: { schema: GenerateScriptInputSchema },
  output: { schema: GenerateScriptOutputSchema },
  prompt: `Você é um engenheiro de software especialista em automação para a plataforma Go High Level (GHL).
Sua tarefa é criar um script JavaScript puro, sem as tags <script>, que será injetado em uma página GHL.

Analise o CONTEXTO DO DOM fornecido para entender a estrutura da página.
Use o COMANDO para entender a funcionalidade que você precisa implementar.

REGRAS IMPORTANTES:
1.  **Segurança:** Use seletores de elementos robustos e específicos para evitar que o script quebre com atualizações da interface do GHL. Evite IDs dinâmicos. Use classes, atributos de dados (data-cy, data-test-id) ou a estrutura do DOM para selecionar elementos.
2.  **Idempotência:** O script pode ser executado várias vezes. Garanta que ele não crie elementos duplicados. Verifique se um elemento já existe antes de criá-lo.
3.  **Clareza:** O código deve ser limpo, bem comentado e fácil de entender.
4.  **Não use jQuery:** Escreva o script usando apenas JavaScript moderno (ES6+).
5.  **Aguarde o Carregamento:** Muitas vezes, os elementos do GHL são carregados dinamicamente. Use 'MutationObserver' ou 'setInterval' com verificações para garantir que os elementos-alvo existam antes de tentar manipulá-los.

CONTEXTO DO DOM:
\`\`\`html
{{{dom}}}
\`\`\`

COMANDO: "{{command}}"

Gere apenas o código JavaScript para o campo 'script'.`,
});

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: GenerateScriptInputSchema,
    outputSchema: GenerateScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar um script. Tente refinar seu comando.');
    }
    return output;
  }
);
