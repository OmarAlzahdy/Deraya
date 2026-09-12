/**
 * Database types — introspected from the migrations in supabase/migrations/
 * after applying them to Postgres 17 and exercising the policies.
 *
 * Regenerate rather than edit. With a project linked:
 *
 *     npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * Without one (what produced this file), apply the migrations to any Postgres
 * and introspect it — the shape is the same.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          id: string;
          question_id: string;
          author_id: string;
          body: string;
          authored_as: Database["public"]["Enums"]["member_role"];
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          author_id: string;
          body: string;
          authored_as?: Database["public"]["Enums"]["member_role"];
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          author_id?: string;
          body?: string;
          authored_as?: Database["public"]["Enums"]["member_role"];
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_results: {
        Row: {
          id: string;
          assessment_id: string;
          level: string;
          recommended_track_id: string | null;
          summary_ar: string | null;
          summary_en: string | null;
          share_slug: string | null;
          graded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          level: string;
          recommended_track_id?: string | null;
          summary_ar?: string | null;
          summary_en?: string | null;
          share_slug?: string | null;
          graded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          level?: string;
          recommended_track_id?: string | null;
          summary_ar?: string | null;
          summary_en?: string | null;
          share_slug?: string | null;
          graded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: true;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_results_graded_by_fkey";
            columns: ["graded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_results_recommended_track_id_fkey";
            columns: ["recommended_track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      assessments: {
        Row: {
          id: string;
          profile_id: string | null;
          locale: Database["public"]["Enums"]["app_locale"];
          grading: Database["public"]["Enums"]["grading_mode"];
          status: Database["public"]["Enums"]["assessment_status"];
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          locale: Database["public"]["Enums"]["app_locale"];
          grading: Database["public"]["Enums"]["grading_mode"];
          status?: Database["public"]["Enums"]["assessment_status"];
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          locale?: Database["public"]["Enums"]["app_locale"];
          grading?: Database["public"]["Enums"]["grading_mode"];
          status?: Database["public"]["Enums"]["assessment_status"];
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          id: string;
          profile_id: string;
          track_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          track_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          track_id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          headline_ar: string | null;
          headline_en: string | null;
          bio_ar: string | null;
          bio_en: string | null;
          avatar_url: string | null;
          github_handle: string | null;
          locale: Database["public"]["Enums"]["app_locale"];
          role: Database["public"]["Enums"]["member_role"];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          display_name: string;
          headline_ar?: string | null;
          headline_en?: string | null;
          bio_ar?: string | null;
          bio_en?: string | null;
          avatar_url?: string | null;
          github_handle?: string | null;
          locale?: Database["public"]["Enums"]["app_locale"];
          role?: Database["public"]["Enums"]["member_role"];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          handle?: string;
          display_name?: string;
          headline_ar?: string | null;
          headline_en?: string | null;
          bio_ar?: string | null;
          bio_en?: string | null;
          avatar_url?: string | null;
          github_handle?: string | null;
          locale?: Database["public"]["Enums"]["app_locale"];
          role?: Database["public"]["Enums"]["member_role"];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };
      question_tags: {
        Row: {
          question_id: string;
          tag_slug: string;
        };
        Insert: {
          question_id: string;
          tag_slug: string;
        };
        Update: {
          question_id?: string;
          tag_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_tags_tag_slug_fkey";
            columns: ["tag_slug"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["slug"];
          },
        ];
      };
      questions: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          body: string;
          locale: Database["public"]["Enums"]["app_locale"];
          answered_by_engineer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          body: string;
          locale?: Database["public"]["Enums"]["app_locale"];
          answered_by_engineer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          body?: string;
          locale?: Database["public"]["Enums"]["app_locale"];
          answered_by_engineer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      review_comments: {
        Row: {
          id: string;
          review_id: string;
          parent_id: string | null;
          author_id: string;
          file_path: string | null;
          line_start: number | null;
          line_end: number | null;
          body: string;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          parent_id?: string | null;
          author_id: string;
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          body: string;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          parent_id?: string | null;
          author_id?: string;
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          body?: string;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "review_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_comments_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          submission_id: string;
          reviewer_id: string;
          summary: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          reviewer_id: string;
          summary?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          reviewer_id?: string;
          summary?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          title_ar: string;
          title_en: string;
          scope_ar: string;
          scope_en: string;
          deliverable_ar: string;
          deliverable_en: string;
          turnaround_days: number | null;
          price_band_min_minor: number | null;
          price_band_max_minor: number | null;
          currency: string;
          status: Database["public"]["Enums"]["content_status"];
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_ar: string;
          title_en: string;
          scope_ar: string;
          scope_en: string;
          deliverable_ar: string;
          deliverable_en: string;
          turnaround_days?: number | null;
          price_band_min_minor?: number | null;
          price_band_max_minor?: number | null;
          currency?: string;
          status?: Database["public"]["Enums"]["content_status"];
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_ar?: string;
          title_en?: string;
          scope_ar?: string;
          scope_en?: string;
          deliverable_ar?: string;
          deliverable_en?: string;
          turnaround_days?: number | null;
          price_band_min_minor?: number | null;
          price_band_max_minor?: number | null;
          currency?: string;
          status?: Database["public"]["Enums"]["content_status"];
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          profile_id: string;
          enrollment_id: string | null;
          week_number: number | null;
          repo_url: string;
          branch: string | null;
          commit_sha: string | null;
          notes: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          reviewer_id: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          enrollment_id?: string | null;
          week_number?: number | null;
          repo_url: string;
          branch?: string | null;
          commit_sha?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          reviewer_id?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          enrollment_id?: string | null;
          week_number?: number | null;
          repo_url?: string;
          branch?: string | null;
          commit_sha?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          reviewer_id?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          slug: string;
          label_ar: string;
          label_en: string;
          track_id: string | null;
        };
        Insert: {
          slug: string;
          label_ar: string;
          label_en: string;
          track_id?: string | null;
        };
        Update: {
          slug?: string;
          label_ar?: string;
          label_en?: string;
          track_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tags_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      track_instructors: {
        Row: {
          track_id: string;
          profile_id: string;
          position: number;
        };
        Insert: {
          track_id: string;
          profile_id: string;
          position?: number;
        };
        Update: {
          track_id?: string;
          profile_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "track_instructors_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "track_instructors_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      track_weeks: {
        Row: {
          id: string;
          track_id: string;
          week_number: number;
          title_ar: string;
          title_en: string;
          outline_ar: string | null;
          outline_en: string | null;
          project_ar: string | null;
          project_en: string | null;
          reviewed: boolean;
        };
        Insert: {
          id?: string;
          track_id: string;
          week_number: number;
          title_ar: string;
          title_en: string;
          outline_ar?: string | null;
          outline_en?: string | null;
          project_ar?: string | null;
          project_en?: string | null;
          reviewed?: boolean;
        };
        Update: {
          id?: string;
          track_id?: string;
          week_number?: number;
          title_ar?: string;
          title_en?: string;
          outline_ar?: string | null;
          outline_en?: string | null;
          project_ar?: string | null;
          project_en?: string | null;
          reviewed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "track_weeks_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      tracks: {
        Row: {
          id: string;
          slug: string;
          title_ar: string;
          title_en: string;
          summary_ar: string;
          summary_en: string;
          outcome_ar: string;
          outcome_en: string;
          prerequisites_ar: string | null;
          prerequisites_en: string | null;
          week_count: number;
          price_minor: number | null;
          currency: string;
          status: Database["public"]["Enums"]["content_status"];
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_ar: string;
          title_en: string;
          summary_ar: string;
          summary_en: string;
          outcome_ar: string;
          outcome_en: string;
          prerequisites_ar?: string | null;
          prerequisites_en?: string | null;
          week_count: number;
          price_minor?: number | null;
          currency?: string;
          status?: Database["public"]["Enums"]["content_status"];
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_ar?: string;
          title_en?: string;
          summary_ar?: string;
          summary_en?: string;
          outcome_ar?: string;
          outcome_en?: string;
          prerequisites_ar?: string | null;
          prerequisites_en?: string | null;
          week_count?: number;
          price_minor?: number | null;
          currency?: string;
          status?: Database["public"]["Enums"]["content_status"];
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      week_progress: {
        Row: {
          enrollment_id: string;
          week_number: number;
          completed_at: string | null;
        };
        Insert: {
          enrollment_id: string;
          week_number: number;
          completed_at?: string | null;
        };
        Update: {
          enrollment_id?: string;
          week_number?: number;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "week_progress_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [key: string]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      app_locale: "ar" | "en";
      assessment_status: "started" | "submitted" | "grading" | "complete";
      content_status: "draft" | "published" | "archived";
      enrollment_status: "active" | "paused" | "completed" | "withdrawn";
      grading_mode: "ai" | "human";
      member_role: "member" | "engineer" | "instructor" | "admin";
      submission_status: "submitted" | "in_review" | "commented" | "resolved";
    };
    CompositeTypes: { [key: string]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
