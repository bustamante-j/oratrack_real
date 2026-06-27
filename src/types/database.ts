import type { AppRole } from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Enums: {
      app_role: AppRole;
      account_status: "active" | "inactive";
      school_year_status: "draft" | "active" | "closed";
    };
    Tables: {
      profiles: Table<
        Timestamped & {
          user_id: string;
          email: string | null;
          full_name: string | null;
          role: AppRole;
          status: "active" | "inactive";
          phone: string | null;
          avatar_path: string | null;
          last_login_at: string | null;
        },
        {
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
          status?: "active" | "inactive";
          phone?: string | null;
          avatar_path?: string | null;
        }
      >;
      teacher_profiles: Table<
        Timestamped & {
          profile_id: string;
          employee_number: string | null;
          position_title: string | null;
          grade_specialization: string | null;
        },
        {
          profile_id: string;
          employee_number?: string | null;
          position_title?: string | null;
          grade_specialization?: string | null;
        }
      >;
      school_years: Table<
        Timestamped & {
          id: string;
          name: string;
          starts_on: string;
          ends_on: string;
          status: "draft" | "active" | "closed";
          created_by: string | null;
        },
        {
          id?: string;
          name: string;
          starts_on: string;
          ends_on: string;
          status?: "draft" | "active" | "closed";
          created_by?: string | null;
        }
      >;
      grade_levels: Table<
        {
          id: number;
          grade_number: number;
          label: string;
          sort_order: number;
        },
        never,
        never
      >;
      sections: Table<
        Timestamped & {
          id: string;
          school_year_id: string;
          grade_level_id: number;
          name: string;
          adviser_id: string | null;
          room: string | null;
        },
        {
          id?: string;
          school_year_id: string;
          grade_level_id: number;
          name: string;
          adviser_id?: string | null;
          room?: string | null;
        }
      >;
      subjects: Table<
        Timestamped & {
          id: string;
          grade_level_id: number | null;
          code: string;
          name: string;
          is_active: boolean;
        },
        {
          id?: string;
          grade_level_id?: number | null;
          code: string;
          name: string;
          is_active?: boolean;
        }
      >;
      section_subjects: Table<
        Timestamped & {
          id: string;
          section_id: string;
          subject_id: string;
          teacher_id: string | null;
        },
        {
          id?: string;
          section_id: string;
          subject_id: string;
          teacher_id?: string | null;
        }
      >;
      teacher_assignments: Table<
        Timestamped & {
          id: string;
          teacher_id: string;
          school_year_id: string;
          role: AppRole;
          grade_level_id: number | null;
          section_id: string | null;
          subject_id: string | null;
          starts_on: string | null;
          ends_on: string | null;
          created_by: string | null;
        },
        {
          id?: string;
          teacher_id: string;
          school_year_id: string;
          role: AppRole;
          grade_level_id?: number | null;
          section_id?: string | null;
          subject_id?: string | null;
          starts_on?: string | null;
          ends_on?: string | null;
          created_by?: string | null;
        }
      >;
      audit_logs: Table<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity_table: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_table: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
