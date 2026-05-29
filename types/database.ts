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
          extracted_text: string | null;
          extracted_text_preview: string | null;
          extraction_status: string;
          extracted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          file_type?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          extracted_text?: string | null;
          extracted_text_preview?: string | null;
          extraction_status?: string;
          extracted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          file_type?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          extracted_text?: string | null;
          extracted_text_preview?: string | null;
          extraction_status?: string;
          extracted_at?: string | null;
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
          evidence_notes: Json;
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
          evidence_notes: Json;
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
          evidence_notes: Json;
          model_used?: string | null;
          created_at?: string;
        };
      };

      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          project_id: string;
          chunk_index: number;
          content: string;
          content_preview: string | null;
          token_estimate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          project_id: string;
          chunk_index: number;
          content: string;
          content_preview?: string | null;
          token_estimate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          project_id?: string;
          chunk_index?: number;
          content?: string;
          content_preview?: string | null;
          token_estimate?: number | null;
          created_at?: string;
        };
      };

    };
  };
};