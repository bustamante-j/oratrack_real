import type { AppRole } from "@/types/domain";
import type { AttendanceStatus } from "@/types/domain";
import type {
  CertificateType,
  InterventionStatus,
  LessonPlanStatus,
  RatingLevel,
} from "@/types/domain";

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
      learner_status: "active" | "inactive" | "archived" | "transferred";
      attendance_status: AttendanceStatus;
      rating_level: RatingLevel;
      intervention_status: InterventionStatus;
      risk_type: "attendance" | "academic" | "literacy" | "numeracy" | "manual";
      risk_severity: "low" | "moderate" | "high" | "critical";
      certificate_type: CertificateType;
      lesson_plan_status: LessonPlanStatus;
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
      learners: Table<
        Timestamped & {
          id: string;
          lrn: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          extension_name: string | null;
          sex: "female" | "male";
          birth_date: string;
          address: string | null;
          status: "active" | "inactive" | "archived" | "transferred";
          archived_at: string | null;
          created_by: string | null;
        },
        {
          id?: string;
          lrn: string;
          first_name: string;
          middle_name?: string | null;
          last_name: string;
          extension_name?: string | null;
          sex: "female" | "male";
          birth_date: string;
          address?: string | null;
          status?: "active" | "inactive" | "archived" | "transferred";
          archived_at?: string | null;
          created_by?: string | null;
        }
      >;
      learner_guardians: Table<
        Timestamped & {
          id: string;
          learner_id: string;
          full_name: string;
          relationship: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          is_primary: boolean;
        },
        {
          id?: string;
          learner_id: string;
          full_name: string;
          relationship: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_primary?: boolean;
        }
      >;
      learner_enrollments: Table<
        Timestamped & {
          id: string;
          learner_id: string;
          school_year_id: string;
          grade_level_id: number;
          section_id: string | null;
          enrollment_status: string;
          promoted_from_enrollment_id: string | null;
          enrolled_on: string;
          created_by: string | null;
        },
        {
          id?: string;
          learner_id: string;
          school_year_id: string;
          grade_level_id: number;
          section_id?: string | null;
          enrollment_status?: string;
          promoted_from_enrollment_id?: string | null;
          enrolled_on?: string;
          created_by?: string | null;
        }
      >;
      attendance_dates: Table<
        Timestamped & {
          id: string;
          school_year_id: string;
          section_id: string;
          attendance_on: string;
          created_by: string | null;
        },
        {
          id?: string;
          school_year_id: string;
          section_id: string;
          attendance_on: string;
          created_by?: string | null;
        }
      >;
      attendance_records: Table<
        Timestamped & {
          id: string;
          attendance_date_id: string;
          enrollment_id: string;
          am_status: AttendanceStatus;
          pm_status: AttendanceStatus;
          remarks: string | null;
          recorded_by: string | null;
        },
        {
          id?: string;
          attendance_date_id: string;
          enrollment_id: string;
          am_status?: AttendanceStatus;
          pm_status?: AttendanceStatus;
          remarks?: string | null;
          recorded_by?: string | null;
        }
      >;
      grade_periods: Table<
        {
          id: string;
          school_year_id: string | null;
          code: string;
          name: string;
          sort_order: number;
          starts_on: string | null;
          ends_on: string | null;
        },
        {
          id?: string;
          school_year_id?: string | null;
          code: string;
          name: string;
          sort_order: number;
          starts_on?: string | null;
          ends_on?: string | null;
        }
      >;
      grade_import_batches: Table<
        {
          id: string;
          school_year_id: string;
          section_id: string;
          subject_id: string;
          imported_by: string;
          source_file_path: string | null;
          status: string;
          row_count: number;
          error_count: number;
          created_at: string;
        },
        {
          id?: string;
          school_year_id: string;
          section_id: string;
          subject_id: string;
          imported_by: string;
          source_file_path?: string | null;
          status?: string;
          row_count?: number;
          error_count?: number;
        }
      >;
      grades: Table<
        Timestamped & {
          id: string;
          enrollment_id: string;
          subject_id: string;
          grade_period_id: string;
          numeric_grade: number;
          remarks: string | null;
          encoded_by: string | null;
          batch_id: string | null;
        },
        {
          id?: string;
          enrollment_id: string;
          subject_id: string;
          grade_period_id: string;
          numeric_grade: number;
          remarks?: string | null;
          encoded_by?: string | null;
          batch_id?: string | null;
        }
      >;
      grade_import_errors: Table<
        {
          id: string;
          batch_id: string;
          row_number: number;
          field_name: string | null;
          message: string;
          raw_value: Json;
          created_at: string;
        },
        {
          id?: string;
          batch_id: string;
          row_number: number;
          field_name?: string | null;
          message: string;
          raw_value?: Json;
        }
      >;
      literacy_numeracy_records: Table<
        {
          id: string;
          enrollment_id: string;
          school_year_id: string;
          literacy_rating: RatingLevel;
          numeracy_rating: RatingLevel;
          remarks: string | null;
          encoded_by: string | null;
          encoded_at: string;
          updated_at: string;
        },
        {
          id?: string;
          enrollment_id: string;
          school_year_id: string;
          literacy_rating: RatingLevel;
          numeracy_rating: RatingLevel;
          remarks?: string | null;
          encoded_by?: string | null;
        }
      >;
      risk_flags: Table<
        {
          id: string;
          learner_id: string;
          enrollment_id: string | null;
          risk_type:
            | "attendance"
            | "academic"
            | "literacy"
            | "numeracy"
            | "manual";
          severity: "low" | "moderate" | "high" | "critical";
          reason: string;
          detected_at: string;
          resolved_at: string | null;
          created_by: string | null;
        },
        {
          id?: string;
          learner_id: string;
          enrollment_id?: string | null;
          risk_type:
            | "attendance"
            | "academic"
            | "literacy"
            | "numeracy"
            | "manual";
          severity?: "low" | "moderate" | "high" | "critical";
          reason: string;
          resolved_at?: string | null;
          created_by?: string | null;
        }
      >;
      interventions: Table<
        Timestamped & {
          id: string;
          learner_id: string;
          enrollment_id: string | null;
          teacher_id: string;
          category: string;
          status: InterventionStatus;
          started_on: string;
          follow_up_on: string | null;
          notes: string;
        },
        {
          id?: string;
          learner_id: string;
          enrollment_id?: string | null;
          teacher_id: string;
          category: string;
          status?: InterventionStatus;
          started_on?: string;
          follow_up_on?: string | null;
          notes: string;
        }
      >;
      intervention_updates: Table<
        {
          id: string;
          intervention_id: string;
          status: InterventionStatus | null;
          notes: string;
          follow_up_on: string | null;
          created_by: string;
          created_at: string;
        },
        {
          id?: string;
          intervention_id: string;
          status?: InterventionStatus | null;
          notes: string;
          follow_up_on?: string | null;
          created_by: string;
        }
      >;
      certificate_templates: Table<
        Timestamped & {
          id: string;
          name: string;
          certificate_type: CertificateType;
          template_payload: Json;
          is_active: boolean;
          created_by: string | null;
        },
        {
          id?: string;
          name: string;
          certificate_type: CertificateType;
          template_payload?: Json;
          is_active?: boolean;
          created_by?: string | null;
        }
      >;
      generated_certificates: Table<
        {
          id: string;
          certificate_template_id: string | null;
          enrollment_id: string;
          certificate_type: CertificateType;
          file_path: string | null;
          generated_by: string;
          generated_at: string;
        },
        {
          id?: string;
          certificate_template_id?: string | null;
          enrollment_id: string;
          certificate_type: CertificateType;
          file_path?: string | null;
          generated_by: string;
        }
      >;
      uploaded_files: Table<
        {
          id: string;
          bucket_id: string;
          object_path: string;
          original_filename: string;
          mime_type: string;
          byte_size: number;
          uploaded_by: string;
          created_at: string;
        },
        {
          id?: string;
          bucket_id: string;
          object_path: string;
          original_filename: string;
          mime_type: string;
          byte_size: number;
          uploaded_by: string;
        }
      >;
      lesson_plans: Table<
        Timestamped & {
          id: string;
          school_year_id: string;
          grade_level_id: number | null;
          subject_id: string | null;
          teacher_id: string;
          title: string;
          file_id: string | null;
          status: LessonPlanStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
        },
        {
          id?: string;
          school_year_id: string;
          grade_level_id?: number | null;
          subject_id?: string | null;
          teacher_id: string;
          title: string;
          file_id?: string | null;
          status?: LessonPlanStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        }
      >;
      report_exports: Table<
        {
          id: string;
          report_type: string;
          scope: Json;
          file_path: string | null;
          exported_by: string;
          exported_at: string;
        },
        {
          id?: string;
          report_type: string;
          scope?: Json;
          file_path?: string | null;
          exported_by: string;
        }
      >;
      ai_activity_logs: Table<
        {
          id: string;
          actor_id: string;
          intent: string;
          scope: Json;
          prompt_excerpt: string | null;
          output_excerpt: string | null;
          proposed_action: Json;
          created_at: string;
        },
        {
          id?: string;
          actor_id: string;
          intent: string;
          scope?: Json;
          prompt_excerpt?: string | null;
          output_excerpt?: string | null;
          proposed_action?: Json;
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
