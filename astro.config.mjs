// @ts-check
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
        lucide: ['*'] // This tells astro-icon to include all icons from the 'lucide' set
      }
    })
  ]
});