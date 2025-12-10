"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useMenuAccess(initialItems: any[]) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const loadedRef = useRef(false);

  const loadUser = useCallback(async () => {
    if (loadedRef.current) return; // Prevent multiple loads

    try {
      const {
        data: { user },
      } = await supabaseRef.current.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        loadedRef.current = true;
        return;
      }

      // Tentar buscar o perfil do usuário
      // Se falhar (RLS policy), assume que não é admin
      try {
        const { data: profile, error } = await supabaseRef.current
          .from("profiles")
          .select("cargo")
          .eq("id", user.id)
          .single();

        // Filter menu items based on user role
        if (error) {
          console.warn("Não foi possível verificar perfil:", error.message);
          // Se não conseguiu buscar, assume funcionario
          setItems((prev) => prev.filter((i) => i.title !== "Admin"));
        } else if (profile?.cargo !== "admin") {
          setItems((prev) => prev.filter((i) => i.title !== "Admin"));
        }
      } catch (err) {
        console.warn("Erro ao buscar profile:", err);
        setItems((prev) => prev.filter((i) => i.title !== "Admin"));
      }

      setLoading(false);
      loadedRef.current = true;
    } catch (err) {
      console.error("Erro em loadUser:", err);
      setLoading(false);
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({ user, items, loading }), [user, items, loading]);
}

