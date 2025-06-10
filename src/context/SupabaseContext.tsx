import { createContext, useContext, ReactNode } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseContextType {
  client: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  client: SupabaseClient;
  children: ReactNode;
}

export function SupabaseProvider({ client, children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={{ client }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context.client;
}
