import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite'

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://mbcpredictive.com',
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    // image(),
    icon({
      include: {
        lucide: ['*'], // This tells astro-icon to include all icons from the 'lucide' set
        // tabler: ['brand-*'] // This tells astro-icon to include only the 'brand-whatsapp' icon from the 'tabler' set
        'simple-icons': ['whatsapp', 'linkedin'] // This tells astro-icon to include only the 'whatsapp' and 'linkedin' icons from the 'simple-icons' set
      }
    })
  ]
});
