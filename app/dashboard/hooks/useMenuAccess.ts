"use client";

import { useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useMenuAccess(initialItems: any[]) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("cargo")
        .eq("id", user.id)
        .single();

      //Filtro
      if (profile?.cargo !== "admin") {
        setItems((prev) => prev.filter((i) => i.title !== "Admin"));
      }

      setLoading(false);
    };

    loadUser();
  }, [supabase]);

  return { user, items, loading };
}
