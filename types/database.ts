export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          location: string | null;
          project_type: string | null;
          status: string;
          risk_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          location?: string | null;
          project_type?: string | null;
          status?: string;
          risk_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          location?: string | null;
          project_type?: string | null;
          status?: string;
          risk_level?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      uploaded_documents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          file_type: string | null;
          file_size: number | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          file_type?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          file_type?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          created_at?: string;
        };
      };

      ai_reviews: {
        Row: {
          id: string;
          project_id: string;
          design_change: string;
          impact_summary: string;
          affected_documents: Json;
          risks: Json;
          checklist: Json;
          model_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          design_change: string;
          impact_summary: string;
          affected_documents?: Json;
          risks?: Json;
          checklist?: Json;
          model_used?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          design_change?: string;
          impact_summary?: string;
          affected_documents?: Json;
          risks?: Json;
          checklist?: Json;
          model_used?: string | null;
          created_at?: string;
        };
      };
    };
  };
};