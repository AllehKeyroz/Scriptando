import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkitEval} from 'genkit/eval';
import {dotprompt} from 'genkit/dotprompt';
import 'dotenv/config';

configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    genkitEval(),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: false,
});

export const ai = genkit({
  model: 'googleai/gemini-pro',
});
