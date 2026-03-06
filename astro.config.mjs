import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://mbcpredictive.com',
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    icon({
      include: {
        lucide: ['*'],
        'simple-icons': ['whatsapp', 'linkedin', 'youtube']
      }
    })
  ]
});
