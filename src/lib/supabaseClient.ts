/**
 * Wrapper de Supabase Client — Agnosticismo de Dependencias
 *
 * Centraliza la inicialización del cliente Supabase.
 * Si en el futuro se cambia el proveedor de Auth (Firebase, Auth0, etc.),
 * solo se modifica este archivo y authSession.ts.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabaseClient] PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY no configurados. ' +
    'La autenticación no funcionará hasta que se definan en .env'
  );
}

/** Singleton — un solo cliente por sesión del navegador */
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return clientInstance;
}
