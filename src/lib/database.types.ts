export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      actions: {
        Row: {
          id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      hints: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      learns: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          survey_id: string
          text: string
          order_position: number
          yes_leads_to: string | null
          no_leads_to: string | null
          hint_id: string | null
          learn_id: string | null
          action_id: string | null
          terminate_id: string | null
          created_at: string
          action_trigger: string | null
          terminate_trigger: string | null
          hint_title_id: string | null
          hint_content_id: string | null
          learn_title_id: string | null
          learn_content_id: string | null
          hasupload: boolean
        }
        Insert: {
          id?: string
          survey_id: string
          text: string
          order_position: number
          yes_leads_to?: string | null
          no_leads_to?: string | null
          hint_id?: string | null
          learn_id?: string | null
          action_id?: string | null
          terminate_id?: string | null
          created_at?: string
          action_trigger?: string | null
          terminate_trigger?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          text?: string
          order_position?: number
          yes_leads_to?: string | null
          no_leads_to?: string | null
          hint_id?: string | null
          learn_id?: string | null
          action_id?: string | null
          terminate_id?: string | null
          created_at?: string
          action_trigger?: string | null
          terminate_trigger?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_yes_leads_to_fkey"
            columns: ["yes_leads_to"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_no_leads_to_fkey"
            columns: ["no_leads_to"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      responses: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          survey_id: string
          user_id: string
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          user_id: string
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_survey_id_fkey"
            columns: ["survey_id"]
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      surveys: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      terminates: {
        Row: {
          id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      survey_notes: {
        Row: {
          id: string
          survey_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_notes_survey_id_fkey"
            columns: ["survey_id"]
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}