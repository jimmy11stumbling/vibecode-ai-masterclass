export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_capabilities: {
        Row: {
          agent_id: string
          capability_name: string
          capability_type: string
          created_at: string
          id: string
          is_active: boolean | null
          parameters: Json | null
        }
        Insert: {
          agent_id: string
          capability_name: string
          capability_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
        }
        Update: {
          agent_id?: string
          capability_name?: string
          capability_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_capabilities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          agent_id: string
          conversation_id: string
          id: string
          joined_at: string | null
          last_active: string | null
          left_at: string | null
          message_count: number | null
        }
        Insert: {
          agent_id: string
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_active?: string | null
          left_at?: string | null
          message_count?: number | null
        }
        Update: {
          agent_id?: string
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_active?: string | null
          left_at?: string | null
          message_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          capabilities: string[] | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["agent_status"] | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["agent_status"] | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["agent_status"] | null
          type?: Database["public"]["Enums"]["agent_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          document_id: string | null
          error_details: string | null
          id: string
          input_data: Json | null
          job_type: string
          output_data: Json | null
          processing_time_ms: number | null
          progress: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          error_details?: string | null
          id?: string
          input_data?: Json | null
          job_type: string
          output_data?: Json | null
          processing_time_ms?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          error_details?: string | null
          id?: string
          input_data?: Json | null
          job_type?: string
          output_data?: Json | null
          processing_time_ms?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["conversation_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"] | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_instructions: {
        Row: {
          applies_to: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          instruction_text: string
          is_active: boolean | null
          is_global: boolean | null
          name: string
          priority: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applies_to?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instruction_text: string
          is_active?: boolean | null
          is_global?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applies_to?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instruction_text?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deepseek_configurations: {
        Row: {
          api_settings: Json | null
          config_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          model_name: string | null
          processing_rules: Json | null
          prompt_templates: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_settings?: Json | null
          config_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          processing_rules?: Json | null
          prompt_templates?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_settings?: Json | null
          config_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          processing_rules?: Json | null
          prompt_templates?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_formats: {
        Row: {
          created_at: string | null
          format_name: string
          id: string
          is_active: boolean | null
          mime_types: string[]
          processing_config: Json | null
          supported_operations: string[]
        }
        Insert: {
          created_at?: string | null
          format_name: string
          id?: string
          is_active?: boolean | null
          mime_types?: string[]
          processing_config?: Json | null
          supported_operations?: string[]
        }
        Update: {
          created_at?: string | null
          format_name?: string
          id?: string
          is_active?: boolean | null
          mime_types?: string[]
          processing_config?: Json | null
          supported_operations?: string[]
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          created_at: string | null
          deepseek_analysis: Json | null
          extracted_text: string | null
          file_size: number
          filename: string
          format_id: string | null
          id: string
          is_public: boolean | null
          mcp_tool_results: Json | null
          metadata: Json | null
          mime_type: string
          original_filename: string
          processed_at: string | null
          processing_progress: number | null
          processing_status: string | null
          storage_path: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          vector_embeddings: Json | null
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          deepseek_analysis?: Json | null
          extracted_text?: string | null
          file_size: number
          filename: string
          format_id?: string | null
          id?: string
          is_public?: boolean | null
          mcp_tool_results?: Json | null
          metadata?: Json | null
          mime_type: string
          original_filename: string
          processed_at?: string | null
          processing_progress?: number | null
          processing_status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          vector_embeddings?: Json | null
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          deepseek_analysis?: Json | null
          extracted_text?: string | null
          file_size?: number
          filename?: string
          format_id?: string | null
          id?: string
          is_public?: boolean | null
          mcp_tool_results?: Json | null
          metadata?: Json | null
          mime_type?: string
          original_filename?: string
          processed_at?: string | null
          processing_progress?: number | null
          processing_status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          vector_embeddings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "document_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_history: {
        Row: {
          agents_data: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          progress: number | null
          project_spec: Json
          result: string | null
          status: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agents_data?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_spec: Json
          result?: string | null
          status: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agents_data?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_spec?: Json
          result?: string | null
          status?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instruction_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_text: string
          updated_at: string | null
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_text: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_text?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          priority: number | null
          source_type: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          priority?: number | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          priority?: number | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      knowledge_base_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_category: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          parent_category?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_category?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_categories_parent_category_fkey"
            columns: ["parent_category"]
            isOneToOne: false
            referencedRelation: "knowledge_base_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          document_id: string | null
          embedding_model: string | null
          id: string
          metadata: Json | null
          vector_id: string | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          document_id?: string | null
          embedding_model?: string | null
          id?: string
          metadata?: Json | null
          vector_id?: string | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          document_id?: string | null
          embedding_model?: string | null
          id?: string
          metadata?: Json | null
          vector_id?: string | null
        }
        Relationships: []
      }
      mcp_tools: {
        Row: {
          capabilities: string[] | null
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          supported_formats: string[] | null
          tool_name: string
          tool_type: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          capabilities?: string[] | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          supported_formats?: string[] | null
          tool_name: string
          tool_type: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          capabilities?: string[] | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          supported_formats?: string[] | null
          tool_name?: string
          tool_type?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          attachments: string[] | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          processing: boolean | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          attachments?: string[] | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          processing?: boolean | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          attachments?: string[] | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          processing?: boolean | null
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_specs: {
        Row: {
          created_at: string
          description: string | null
          execution_id: string
          id: string
          name: string
          requirements: Json | null
          status: string
          tech_stack: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          execution_id: string
          id?: string
          name: string
          requirements?: Json | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          execution_id?: string
          id?: string
          name?: string
          requirements?: Json | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          author: string | null
          category: string | null
          complexity: string | null
          created_at: string | null
          description: string | null
          estimated_time: string | null
          id: string
          is_public: boolean | null
          project_name: string
          prompt: string
          rating: number | null
          tags: string[] | null
          tech_stack: string[] | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_public?: boolean | null
          project_name: string
          prompt: string
          rating?: number | null
          tags?: string[] | null
          tech_stack?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_public?: boolean | null
          project_name?: string
          prompt?: string
          rating?: number | null
          tags?: string[] | null
          tech_stack?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_project_specs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_template: boolean | null
          name: string
          spec_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          spec_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          spec_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_project_specs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sovereign_tasks: {
        Row: {
          assigned_agent: string | null
          created_at: string
          dependencies: string[] | null
          description: string
          estimated_duration: number | null
          execution_id: string
          id: string
          metadata: Json | null
          priority: string
          result: Json | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agent?: string | null
          created_at?: string
          dependencies?: string[] | null
          description: string
          estimated_duration?: number | null
          execution_id: string
          id?: string
          metadata?: Json | null
          priority?: string
          result?: Json | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agent?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string
          estimated_duration?: number | null
          execution_id?: string
          id?: string
          metadata?: Json | null
          priority?: string
          result?: Json | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sovereign_tasks_assigned_agent_fkey"
            columns: ["assigned_agent"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_seen: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          created_at: string
          definition: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          status: string | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string
          definition: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string
          definition?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string
          status: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string
          status: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string
          status?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_prompt_usage: {
        Args: { prompt_id: string }
        Returns: undefined
      }
    }
    Enums: {
      agent_status: "active" | "idle" | "processing" | "offline"
      agent_type: "conversation" | "document" | "rag" | "router"
      conversation_status: "active" | "archived" | "paused"
      document_status: "uploading" | "processing" | "completed" | "failed"
      message_sender_type: "user" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status: ["active", "idle", "processing", "offline"],
      agent_type: ["conversation", "document", "rag", "router"],
      conversation_status: ["active", "archived", "paused"],
      document_status: ["uploading", "processing", "completed", "failed"],
      message_sender_type: ["user", "agent"],
    },
  },
} as const
