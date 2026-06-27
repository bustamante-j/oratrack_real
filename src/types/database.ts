import type { AppRole } from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Enums: {
      app_role: AppRole;
      account_status: "active" | "inactive";
    };
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string | null;
          full_name: string | null;
          role: AppRole;
          status: "active" | "inactive";
          avatar_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
          status?: "active" | "inactive";
          avatar_path?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
          status?: "active" | "inactive";
          avatar_path?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
