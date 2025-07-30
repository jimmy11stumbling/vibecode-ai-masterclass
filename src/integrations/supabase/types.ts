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
      a2a_messages: {
        Row: {
          attachments: Json | null
          checksum: string | null
          content: string
          content_type: string | null
          is_encrypted: boolean | null
          message_id: string
          message_type: string
          metadata: Json | null
          processed_at: string | null
          receiver_agent_id: string | null
          response_to: string | null
          role: string
          sender_agent_id: string
          sequence_number: number
          task_id: string
          timestamp: string
        }
        Insert: {
          attachments?: Json | null
          checksum?: string | null
          content: string
          content_type?: string | null
          is_encrypted?: boolean | null
          message_id?: string
          message_type?: string
          metadata?: Json | null
          processed_at?: string | null
          receiver_agent_id?: string | null
          response_to?: string | null
          role: string
          sender_agent_id: string
          sequence_number?: number
          task_id: string
          timestamp?: string
        }
        Update: {
          attachments?: Json | null
          checksum?: string | null
          content?: string
          content_type?: string | null
          is_encrypted?: boolean | null
          message_id?: string
          message_type?: string
          metadata?: Json | null
          processed_at?: string | null
          receiver_agent_id?: string | null
          response_to?: string | null
          role?: string
          sender_agent_id?: string
          sequence_number?: number
          task_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_messages_receiver_fkey"
            columns: ["receiver_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "a2a_messages_response_fkey"
            columns: ["response_to"]
            isOneToOne: false
            referencedRelation: "a2a_messages"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "a2a_messages_sender_fkey"
            columns: ["sender_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "a2a_messages_task_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "a2a_tasks"
            referencedColumns: ["task_id"]
          },
        ]
      }
      a2a_tasks: {
        Row: {
          client_agent_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion: string | null
          input_data: Json | null
          max_retries: number | null
          metadata: Json | null
          output_data: Json | null
          priority: string | null
          progress_percentage: number | null
          remote_agent_id: string | null
          retry_count: number | null
          started_at: string | null
          status: string
          task_description: string | null
          task_id: string
          task_type: string
          timeout_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_agent_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          input_data?: Json | null
          max_retries?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: string | null
          progress_percentage?: number | null
          remote_agent_id?: string | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
          task_description?: string | null
          task_id?: string
          task_type: string
          timeout_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_agent_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          input_data?: Json | null
          max_retries?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: string | null
          progress_percentage?: number | null
          remote_agent_id?: string | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
          task_description?: string | null
          task_id?: string
          task_type?: string
          timeout_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_tasks_client_agent_fkey"
            columns: ["client_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "a2a_tasks_remote_agent_fkey"
            columns: ["remote_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
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
      agent_capability_assignments: {
        Row: {
          agent_id: string
          assigned_at: string
          assigned_by: string | null
          assignment_id: string
          capability_id: string
          configuration_override: Json | null
          expires_at: string | null
          is_enabled: boolean | null
          permission_level: string | null
          usage_count: number | null
          usage_quota: number | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string
          assigned_by?: string | null
          assignment_id?: string
          capability_id: string
          configuration_override?: Json | null
          expires_at?: string | null
          is_enabled?: boolean | null
          permission_level?: string | null
          usage_count?: number | null
          usage_quota?: number | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string
          assigned_by?: string | null
          assignment_id?: string
          capability_id?: string
          configuration_override?: Json | null
          expires_at?: string | null
          is_enabled?: boolean | null
          permission_level?: string | null
          usage_count?: number | null
          usage_quota?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_capability_assignments_agent_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_capability_assignments_capability_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "mcp_capabilities"
            referencedColumns: ["capability_id"]
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
      mcp_capabilities: {
        Row: {
          capability_id: string
          capability_name: string
          capability_type: string
          created_at: string
          dependencies: string[] | null
          description: string | null
          is_active: boolean | null
          provider: string | null
          rate_limits: Json | null
          schema_definition: Json
          security_level: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          capability_id?: string
          capability_name: string
          capability_type: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          is_active?: boolean | null
          provider?: string | null
          rate_limits?: Json | null
          schema_definition?: Json
          security_level?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          capability_id?: string
          capability_name?: string
          capability_type?: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          is_active?: boolean | null
          provider?: string | null
          rate_limits?: Json | null
          schema_definition?: Json
          security_level?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      mcp_execution_logs: {
        Row: {
          agent_id: string
          capability_id: string
          completed_at: string | null
          cpu_usage_percent: number | null
          error_details: string | null
          execution_id: string
          execution_status: string
          execution_time_ms: number | null
          input_parameters: Json | null
          log_id: string
          memory_usage_mb: number | null
          output_result: Json | null
          performance_metrics: Json | null
          started_at: string
          task_id: string | null
          user_id: string
          warning_details: string | null
        }
        Insert: {
          agent_id: string
          capability_id: string
          completed_at?: string | null
          cpu_usage_percent?: number | null
          error_details?: string | null
          execution_id: string
          execution_status?: string
          execution_time_ms?: number | null
          input_parameters?: Json | null
          log_id?: string
          memory_usage_mb?: number | null
          output_result?: Json | null
          performance_metrics?: Json | null
          started_at?: string
          task_id?: string | null
          user_id: string
          warning_details?: string | null
        }
        Update: {
          agent_id?: string
          capability_id?: string
          completed_at?: string | null
          cpu_usage_percent?: number | null
          error_details?: string | null
          execution_id?: string
          execution_status?: string
          execution_time_ms?: number | null
          input_parameters?: Json | null
          log_id?: string
          memory_usage_mb?: number | null
          output_result?: Json | null
          performance_metrics?: Json | null
          started_at?: string
          task_id?: string | null
          user_id?: string
          warning_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_execution_logs_agent_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_execution_logs_capability_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "mcp_capabilities"
            referencedColumns: ["capability_id"]
          },
          {
            foreignKeyName: "mcp_execution_logs_task_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "a2a_tasks"
            referencedColumns: ["task_id"]
          },
        ]
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
      project_generations: {
        Row: {
          config: Json
          created_at: string | null
          error_message: string | null
          generated_code: string | null
          id: string
          project_name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          error_message?: string | null
          generated_code?: string | null
          id?: string
          project_name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          error_message?: string | null
          generated_code?: string | null
          id?: string
          project_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
      rag_chunk_to_entity_links: {
        Row: {
          chunk_id: string
          context_window: string | null
          created_at: string
          entity_id: string
          link_id: string
          relevance_score: number | null
        }
        Insert: {
          chunk_id: string
          context_window?: string | null
          created_at?: string
          entity_id: string
          link_id?: string
          relevance_score?: number | null
        }
        Update: {
          chunk_id?: string
          context_window?: string | null
          created_at?: string
          entity_id?: string
          link_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunk_entity_links_chunk_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "rag_chunks"
            referencedColumns: ["chunk_id"]
          },
          {
            foreignKeyName: "rag_chunk_entity_links_entity_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "rag_kg_entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      rag_chunks: {
        Row: {
          char_count: number | null
          chunk_id: string
          chunk_index: number
          chunk_text: string
          chunk_type: string | null
          created_at: string
          document_id: string
          hierarchy_level: number | null
          metadata: Json | null
          parent_chunk_id: string | null
          word_count: number | null
        }
        Insert: {
          char_count?: number | null
          chunk_id?: string
          chunk_index: number
          chunk_text: string
          chunk_type?: string | null
          created_at?: string
          document_id: string
          hierarchy_level?: number | null
          metadata?: Json | null
          parent_chunk_id?: string | null
          word_count?: number | null
        }
        Update: {
          char_count?: number | null
          chunk_id?: string
          chunk_index?: number
          chunk_text?: string
          chunk_type?: string | null
          created_at?: string
          document_id?: string
          hierarchy_level?: number | null
          metadata?: Json | null
          parent_chunk_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "rag_chunks_parent_chunk_id_fkey"
            columns: ["parent_chunk_id"]
            isOneToOne: false
            referencedRelation: "rag_chunks"
            referencedColumns: ["chunk_id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          checksum: string | null
          document_id: string
          document_type: string | null
          file_size: number | null
          ingested_at: string
          metadata: Json | null
          mime_type: string | null
          source_uri: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checksum?: string | null
          document_id?: string
          document_type?: string | null
          file_size?: number | null
          ingested_at?: string
          metadata?: Json | null
          mime_type?: string | null
          source_uri: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checksum?: string | null
          document_id?: string
          document_type?: string | null
          file_size?: number | null
          ingested_at?: string
          metadata?: Json | null
          mime_type?: string | null
          source_uri?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rag_embeddings: {
        Row: {
          chunk_id: string
          created_at: string
          dense_embedding: string | null
          embedding_id: string
          embedding_metadata: Json | null
          embedding_model: string | null
        }
        Insert: {
          chunk_id: string
          created_at?: string
          dense_embedding?: string | null
          embedding_id?: string
          embedding_metadata?: Json | null
          embedding_model?: string | null
        }
        Update: {
          chunk_id?: string
          created_at?: string
          dense_embedding?: string | null
          embedding_id?: string
          embedding_metadata?: Json | null
          embedding_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_embeddings_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "rag_chunks"
            referencedColumns: ["chunk_id"]
          },
        ]
      }
      rag_kg_entities: {
        Row: {
          confidence_score: number | null
          created_at: string
          entity_description: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          properties: Json | null
          source_count: number | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          entity_description?: string | null
          entity_id?: string
          entity_name: string
          entity_type: string
          properties?: Json | null
          source_count?: number | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          entity_description?: string | null
          entity_id?: string
          entity_name?: string
          entity_type?: string
          properties?: Json | null
          source_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rag_kg_relationships: {
        Row: {
          confidence_score: number | null
          created_at: string
          properties: Json | null
          relationship_description: string | null
          relationship_id: string
          relationship_type: string
          source_count: number | null
          source_entity_id: string
          target_entity_id: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          properties?: Json | null
          relationship_description?: string | null
          relationship_id?: string
          relationship_type: string
          source_count?: number | null
          source_entity_id: string
          target_entity_id: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          properties?: Json | null
          relationship_description?: string | null
          relationship_id?: string
          relationship_type?: string
          source_count?: number | null
          source_entity_id?: string
          target_entity_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_kg_relationships_source_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "rag_kg_entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "rag_kg_relationships_target_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "rag_kg_entities"
            referencedColumns: ["entity_id"]
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
      user_documents: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_size: number
          filename: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string
          original_filename: string
          processing_status: string | null
          storage_path: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_size: number
          filename: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type: string
          original_filename: string
          processing_status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_size?: number
          filename?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string
          original_filename?: string
          processing_status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prompts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          rating: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          rating?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          rating?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
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
      ai_access_all_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          document_id: string
          title: string
          content: string
          document_type: string
          metadata: Json
        }[]
      }
      ai_search_documents: {
        Args: { search_query: string; limit_results?: number }
        Returns: {
          document_id: string
          title: string
          chunk_text: string
          chunk_index: number
          relevance: number
        }[]
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_prompt_usage: {
        Args: { prompt_id: string }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
