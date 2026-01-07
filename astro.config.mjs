import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite';
// https://astro.build/config

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    icon({
      include: {
        lucide: ['*'], // This tells astro-icon to include all icons from the 'lucide' set
        // tabler: ['brand-*'] // This tells astro-icon to include only the 'brand-whatsapp' icon from the 'tabler' set
        'simple-icons': ['whatsapp', 'linkedin', 'youtube'] // This tells astro-icon to include only the 'whatsapp' icon from the 'simple-icons' set
      }
    })
  ]
});
