/**
 * authSession — Capa de Sesión de Autenticación
 *
 * Funciones puras de alto nivel para login, logout y consulta de sesión.
 * Desacopla la UI de los detalles de implementación de Supabase.
 *
 * Roles de usuario:
 *   Se almacenan en user_metadata.role ("admin" | "viewer").
 *   Al crear usuarios en el dashboard de Supabase, agregar:
 *     { "role": "admin" }  o  { "role": "viewer" }
 *   en el campo "User Metadata".
 */

import { getSupabaseClient } from './supabaseClient';

/* ─── Tipos ─────────────────────────────────────────────── */

export interface MbcSession {
  user: string;
  email: string;
  role: string;
  accessToken: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  session?: MbcSession;
  error?: string;
}

/* ─── Login ─────────────────────────────────────────────── */

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return {
      success: false,
      error: error?.message ?? 'No se pudo iniciar sesión',
    };
  }

  const userMeta = data.user.user_metadata ?? {};
  const session: MbcSession = {
    user: userMeta.nombre ?? userMeta.name ?? email.split('@')[0],
    email: data.user.email ?? email,
    role: userMeta.role ?? 'viewer',
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at ?? 0,
  };

  return { success: true, session };
}

/* ─── Logout ────────────────────────────────────────────── */

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

/* ─── Consulta de sesión activa ──────────────────────────── */

export async function getCurrentSession(): Promise<MbcSession | null> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  const userMeta = session.user.user_metadata ?? {};

  return {
    user: userMeta.nombre ?? userMeta.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
    email: session.user.email ?? '',
    role: userMeta.role ?? 'viewer',
    accessToken: session.access_token,
    expiresAt: session.expires_at ?? 0,
  };
}

/* ─── Listener de cambios de sesión ──────────────────────── */

export function onAuthStateChange(
  callback: (session: MbcSession | null) => void,
): () => void {
  const supabase = getSupabaseClient();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!session) {
        callback(null);
        return;
      }
      const userMeta = session.user.user_metadata ?? {};
      callback({
        user: userMeta.nombre ?? userMeta.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
        email: session.user.email ?? '',
        role: userMeta.role ?? 'viewer',
        accessToken: session.access_token,
        expiresAt: session.expires_at ?? 0,
      });
    },
  );

  return () => subscription.unsubscribe();
}
