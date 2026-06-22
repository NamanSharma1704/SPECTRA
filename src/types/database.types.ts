export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          difficulty: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          difficulty?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          difficulty?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      attributes: {
        Row: {
          icon_url: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          icon_url?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          icon_url?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      base_weapons: {
        Row: {
          id: string
          name: string
          weapon_class: string
        }
        Insert: {
          id?: string
          name: string
          weapon_class: string
        }
        Update: {
          id?: string
          name?: string
          weapon_class?: string
        }
        Relationships: []
      }
      brand_set_patch_states: {
        Row: {
          bonus_1_attr_id: string | null
          bonus_1_value: string | null
          bonus_2_attr_id: string | null
          bonus_2_value: string | null
          bonus_3_attr_id: string | null
          bonus_3_value: string | null
          brand_set_id: string | null
          id: string
          patch_id: string | null
        }
        Insert: {
          bonus_1_attr_id?: string | null
          bonus_1_value?: string | null
          bonus_2_attr_id?: string | null
          bonus_2_value?: string | null
          bonus_3_attr_id?: string | null
          bonus_3_value?: string | null
          brand_set_id?: string | null
          id?: string
          patch_id?: string | null
        }
        Update: {
          bonus_1_attr_id?: string | null
          bonus_1_value?: string | null
          bonus_2_attr_id?: string | null
          bonus_2_value?: string | null
          bonus_3_attr_id?: string | null
          bonus_3_value?: string | null
          brand_set_id?: string | null
          id?: string
          patch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_set_patch_states_bonus_1_attr_id_fkey"
            columns: ["bonus_1_attr_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_set_patch_states_bonus_2_attr_id_fkey"
            columns: ["bonus_2_attr_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_set_patch_states_bonus_3_attr_id_fkey"
            columns: ["bonus_3_attr_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_set_patch_states_brand_set_id_fkey"
            columns: ["brand_set_id"]
            isOneToOne: false
            referencedRelation: "brand_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_set_patch_states_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_sets: {
        Row: {
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      build_activity_scores: {
        Row: {
          activity_id: string | null
          build_id: string | null
          confidence_score: number | null
          id: string
          last_updated: string | null
          meta_score: number | null
          popularity_index: number | null
          success_rate: number | null
          threat_level: string | null
        }
        Insert: {
          activity_id?: string | null
          build_id?: string | null
          confidence_score?: number | null
          id?: string
          last_updated?: string | null
          meta_score?: number | null
          popularity_index?: number | null
          success_rate?: number | null
          threat_level?: string | null
        }
        Update: {
          activity_id?: string | null
          build_id?: string | null
          confidence_score?: number | null
          id?: string
          last_updated?: string | null
          meta_score?: number | null
          popularity_index?: number | null
          success_rate?: number | null
          threat_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_activity_scores_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_activity_scores_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      build_sources: {
        Row: {
          build_id: string | null
          confidence_score: number | null
          creator_id: string | null
          creator_name: string | null
          creator_reliability_snapshot: number | null
          extracted_at: string | null
          id: string
          published_at: string | null
          source_role: string | null
          source_title: string | null
          source_type: string
          source_url: string
        }
        Insert: {
          build_id?: string | null
          confidence_score?: number | null
          creator_id?: string | null
          creator_name?: string | null
          creator_reliability_snapshot?: number | null
          extracted_at?: string | null
          id?: string
          published_at?: string | null
          source_role?: string | null
          source_title?: string | null
          source_type: string
          source_url: string
        }
        Update: {
          build_id?: string | null
          confidence_score?: number | null
          creator_id?: string | null
          creator_name?: string | null
          creator_reliability_snapshot?: number | null
          extracted_at?: string | null
          id?: string
          published_at?: string | null
          source_role?: string | null
          source_title?: string | null
          source_type?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_sources_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_sources_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      build_validation_results: {
        Row: {
          build_version_id: string | null
          id: string
          is_valid: boolean
          validation_timestamp: string | null
        }
        Insert: {
          build_version_id?: string | null
          id?: string
          is_valid: boolean
          validation_timestamp?: string | null
        }
        Update: {
          build_version_id?: string | null
          id?: string
          is_valid?: boolean
          validation_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_validation_results_build_version_id_fkey"
            columns: ["build_version_id"]
            isOneToOne: false
            referencedRelation: "build_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      build_validation_rules: {
        Row: {
          description: string
          id: string
          is_active: boolean | null
          rule_name: string
        }
        Insert: {
          description: string
          id?: string
          is_active?: boolean | null
          rule_name: string
        }
        Update: {
          description?: string
          id?: string
          is_active?: boolean | null
          rule_name?: string
        }
        Relationships: []
      }
      build_version_gear_slots: {
        Row: {
          build_version_id: string | null
          core_attribute_id: string | null
          exotic_id: string | null
          gear_piece_id: string | null
          id: string
          item_category: string
          minor_attribute_1_id: string | null
          minor_attribute_2_id: string | null
          mod_attribute_id: string | null
          named_item_id: string | null
          slot: string
          talent_id: string | null
        }
        Insert: {
          build_version_id?: string | null
          core_attribute_id?: string | null
          exotic_id?: string | null
          gear_piece_id?: string | null
          id?: string
          item_category: string
          minor_attribute_1_id?: string | null
          minor_attribute_2_id?: string | null
          mod_attribute_id?: string | null
          named_item_id?: string | null
          slot: string
          talent_id?: string | null
        }
        Update: {
          build_version_id?: string | null
          core_attribute_id?: string | null
          exotic_id?: string | null
          gear_piece_id?: string | null
          id?: string
          item_category?: string
          minor_attribute_1_id?: string | null
          minor_attribute_2_id?: string | null
          mod_attribute_id?: string | null
          named_item_id?: string | null
          slot?: string
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_version_gear_slots_build_version_id_fkey"
            columns: ["build_version_id"]
            isOneToOne: false
            referencedRelation: "build_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_core_attribute_id_fkey"
            columns: ["core_attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_exotic_id_fkey"
            columns: ["exotic_id"]
            isOneToOne: false
            referencedRelation: "exotics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_gear_piece_id_fkey"
            columns: ["gear_piece_id"]
            isOneToOne: false
            referencedRelation: "gear_pieces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_minor_attribute_1_id_fkey"
            columns: ["minor_attribute_1_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_minor_attribute_2_id_fkey"
            columns: ["minor_attribute_2_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_mod_attribute_id_fkey"
            columns: ["mod_attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_named_item_id_fkey"
            columns: ["named_item_id"]
            isOneToOne: false
            referencedRelation: "named_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_gear_slots_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      build_version_weapon_slots: {
        Row: {
          base_weapon_id: string | null
          build_version_id: string | null
          exotic_id: string | null
          id: string
          item_category: string
          named_item_id: string | null
          slot: string
          talent_id: string | null
        }
        Insert: {
          base_weapon_id?: string | null
          build_version_id?: string | null
          exotic_id?: string | null
          id?: string
          item_category: string
          named_item_id?: string | null
          slot: string
          talent_id?: string | null
        }
        Update: {
          base_weapon_id?: string | null
          build_version_id?: string | null
          exotic_id?: string | null
          id?: string
          item_category?: string
          named_item_id?: string | null
          slot?: string
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_version_weapon_slots_base_weapon_id_fkey"
            columns: ["base_weapon_id"]
            isOneToOne: false
            referencedRelation: "base_weapons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_weapon_slots_build_version_id_fkey"
            columns: ["build_version_id"]
            isOneToOne: false
            referencedRelation: "build_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_weapon_slots_exotic_id_fkey"
            columns: ["exotic_id"]
            isOneToOne: false
            referencedRelation: "exotics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_weapon_slots_named_item_id_fkey"
            columns: ["named_item_id"]
            isOneToOne: false
            referencedRelation: "named_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_version_weapon_slots_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      build_versions: {
        Row: {
          activity_id: string | null
          build_id: string | null
          content_source_id: string | null
          guide_url: string | null
          id: string
          meta_score: number | null
          patch_id: string
          role: string | null
          specialization_id: string | null
          version_number: number
        }
        Insert: {
          activity_id?: string | null
          build_id?: string | null
          content_source_id?: string | null
          guide_url?: string | null
          id?: string
          meta_score?: number | null
          patch_id: string
          role?: string | null
          specialization_id?: string | null
          version_number: number
        }
        Update: {
          activity_id?: string | null
          build_id?: string | null
          content_source_id?: string | null
          guide_url?: string | null
          id?: string
          meta_score?: number | null
          patch_id?: string
          role?: string | null
          specialization_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "build_versions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_versions_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_versions_content_source_id_fkey"
            columns: ["content_source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_versions_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_versions_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          archetype: string | null
          author_user_id: string | null
          consensus_score: number | null
          created_at: string | null
          creator_id: string | null
          fingerprint: string | null
          first_introduced_patch_id: string | null
          id: string
          integrity_status: string | null
          is_public: boolean | null
          last_verified_at: string | null
          name: string
          stability_score: number | null
          status: string | null
        }
        Insert: {
          archetype?: string | null
          author_user_id?: string | null
          consensus_score?: number | null
          created_at?: string | null
          creator_id?: string | null
          fingerprint?: string | null
          first_introduced_patch_id?: string | null
          id?: string
          integrity_status?: string | null
          is_public?: boolean | null
          last_verified_at?: string | null
          name: string
          stability_score?: number | null
          status?: string | null
        }
        Update: {
          archetype?: string | null
          author_user_id?: string | null
          consensus_score?: number | null
          created_at?: string | null
          creator_id?: string | null
          fingerprint?: string | null
          first_introduced_patch_id?: string | null
          id?: string
          integrity_status?: string | null
          is_public?: boolean | null
          last_verified_at?: string | null
          name?: string
          stability_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builds_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_first_introduced_patch_id_fkey"
            columns: ["first_introduced_patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string | null
          id: string
          ip_hash: string
          target_id: string
          target_type: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_hash: string
          target_id: string
          target_type: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_hash?: string
          target_id?: string
          target_type?: string
          vote_type?: string
        }
        Relationships: []
      }
      content_sources: {
        Row: {
          id: string
          name: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      creator_trust_scores: {
        Row: {
          accuracy_90d: number | null
          accuracy_lifetime: number | null
          average_lead_time_days: number | null
          created_at: string | null
          creator_id: string
          emerging_calls_90d: number | null
          emerging_calls_lifetime: number | null
          hybrid_accuracy: number | null
          id: string
          last_calculated_at: string | null
          successful_calls_90d: number | null
          successful_calls_lifetime: number | null
          trust_score: number | null
          trust_tier: string | null
        }
        Insert: {
          accuracy_90d?: number | null
          accuracy_lifetime?: number | null
          average_lead_time_days?: number | null
          created_at?: string | null
          creator_id: string
          emerging_calls_90d?: number | null
          emerging_calls_lifetime?: number | null
          hybrid_accuracy?: number | null
          id?: string
          last_calculated_at?: string | null
          successful_calls_90d?: number | null
          successful_calls_lifetime?: number | null
          trust_score?: number | null
          trust_tier?: string | null
        }
        Update: {
          accuracy_90d?: number | null
          accuracy_lifetime?: number | null
          average_lead_time_days?: number | null
          created_at?: string | null
          creator_id?: string
          emerging_calls_90d?: number | null
          emerging_calls_lifetime?: number | null
          hybrid_accuracy?: number | null
          id?: string
          last_calculated_at?: string | null
          successful_calls_90d?: number | null
          successful_calls_lifetime?: number | null
          trust_score?: number | null
          trust_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_trust_scores_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_videos: {
        Row: {
          channel_id: string
          content_tags: Json | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          primary_category: string | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          video_id: string
          youtube_url: string | null
        }
        Insert: {
          channel_id: string
          content_tags?: Json | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          primary_category?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          video_id: string
          youtube_url?: string | null
        }
        Update: {
          channel_id?: string
          content_tags?: Json | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          primary_category?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          video_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          channel_id: string | null
          id: string
          is_verified: boolean | null
          latest_processed_published_at: string | null
          name: string
          uploads_playlist_id: string | null
          youtube_url: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          is_verified?: boolean | null
          latest_processed_published_at?: string | null
          name: string
          uploads_playlist_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          is_verified?: boolean | null
          latest_processed_published_at?: string | null
          name?: string
          uploads_playlist_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      exotics: {
        Row: {
          id: string
          loot_source_id: string | null
          name: string
          slot: string
          talent_id: string | null
          type: string
        }
        Insert: {
          id?: string
          loot_source_id?: string | null
          name: string
          slot: string
          talent_id?: string | null
          type: string
        }
        Update: {
          id?: string
          loot_source_id?: string | null
          name?: string
          slot?: string
          talent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exotics_loot_source_id_fkey"
            columns: ["loot_source_id"]
            isOneToOne: false
            referencedRelation: "loot_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exotics_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_events: {
        Row: {
          created_at: string
          creator_id: string
          entity_slug: string
          forecast_type: string
          id: string
          predicted_confidence: number
          predicted_direction: string
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          entity_slug: string
          forecast_type: string
          id?: string
          predicted_confidence: number
          predicted_direction: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          entity_slug?: string
          forecast_type?: string
          id?: string
          predicted_confidence?: number
          predicted_direction?: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecast_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "build_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_resolutions: {
        Row: {
          forecast_id: string
          id: string
          outcome: string
          resolution_confidence: number | null
          resolution_reason: string | null
          resolved_at: string
          trust_delta: number | null
        }
        Insert: {
          forecast_id: string
          id?: string
          outcome?: string
          resolution_confidence?: number | null
          resolution_reason?: string | null
          resolved_at?: string
          trust_delta?: number | null
        }
        Update: {
          forecast_id?: string
          id?: string
          outcome?: string
          resolution_confidence?: number | null
          resolution_reason?: string | null
          resolved_at?: string
          trust_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_resolutions_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "forecast_events"
            referencedColumns: ["id"]
          },
        ]
      }
      game_patches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          release_date: string
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          release_date: string
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          release_date?: string
          summary?: string | null
        }
        Relationships: []
      }
      gear_pieces: {
        Row: {
          brand_set_id: string | null
          gear_set_id: string | null
          id: string
          loot_source_id: string | null
          name: string
          slot: string
        }
        Insert: {
          brand_set_id?: string | null
          gear_set_id?: string | null
          id?: string
          loot_source_id?: string | null
          name: string
          slot: string
        }
        Update: {
          brand_set_id?: string | null
          gear_set_id?: string | null
          id?: string
          loot_source_id?: string | null
          name?: string
          slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_pieces_brand_set_id_fkey"
            columns: ["brand_set_id"]
            isOneToOne: false
            referencedRelation: "brand_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_pieces_gear_set_id_fkey"
            columns: ["gear_set_id"]
            isOneToOne: false
            referencedRelation: "gear_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_pieces_loot_source_id_fkey"
            columns: ["loot_source_id"]
            isOneToOne: false
            referencedRelation: "loot_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_set_patch_states: {
        Row: {
          backpack_talent_id: string | null
          bonus_2: string | null
          bonus_3: string | null
          bonus_4: string | null
          chest_talent_id: string | null
          gear_set_id: string | null
          id: string
          patch_id: string | null
        }
        Insert: {
          backpack_talent_id?: string | null
          bonus_2?: string | null
          bonus_3?: string | null
          bonus_4?: string | null
          chest_talent_id?: string | null
          gear_set_id?: string | null
          id?: string
          patch_id?: string | null
        }
        Update: {
          backpack_talent_id?: string | null
          bonus_2?: string | null
          bonus_3?: string | null
          bonus_4?: string | null
          chest_talent_id?: string | null
          gear_set_id?: string | null
          id?: string
          patch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_set_patch_states_backpack_talent_id_fkey"
            columns: ["backpack_talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_set_patch_states_chest_talent_id_fkey"
            columns: ["chest_talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_set_patch_states_gear_set_id_fkey"
            columns: ["gear_set_id"]
            isOneToOne: false
            referencedRelation: "gear_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_set_patch_states_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_sets: {
        Row: {
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      ingestion_jobs: {
        Row: {
          id: string
          source_type: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          source_type: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          source_type?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      item_aliases: {
        Row: {
          alias: string
          id: string
          item_category: string
          reference_id: string
        }
        Insert: {
          alias: string
          id?: string
          item_category: string
          reference_id: string
        }
        Update: {
          alias?: string
          id?: string
          item_category?: string
          reference_id?: string
        }
        Relationships: []
      }
      loot_source_patch_states: {
        Row: {
          drop_pool: Json | null
          id: string
          loot_source_id: string | null
          patch_id: string | null
        }
        Insert: {
          drop_pool?: Json | null
          id?: string
          loot_source_id?: string | null
          patch_id?: string | null
        }
        Update: {
          drop_pool?: Json | null
          id?: string
          loot_source_id?: string | null
          patch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loot_source_patch_states_loot_source_id_fkey"
            columns: ["loot_source_id"]
            isOneToOne: false
            referencedRelation: "loot_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_source_patch_states_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      loot_sources: {
        Row: {
          id: string
          name: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      meta_consensus_snapshots: {
        Row: {
          confidence_score: number
          created_at: string
          creator_count: number
          id: string
          meta_score: number
          slug: string
          snapshot_date: string
          stage: string | null
          video_count: number
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          creator_count?: number
          id?: string
          meta_score?: number
          slug: string
          snapshot_date?: string
          stage?: string | null
          video_count?: number
        }
        Update: {
          confidence_score?: number
          created_at?: string
          creator_count?: number
          id?: string
          meta_score?: number
          slug?: string
          snapshot_date?: string
          stage?: string | null
          video_count?: number
        }
        Relationships: []
      }
      meta_forecasts: {
        Row: {
          calculated_at: string | null
          confidence_score: number | null
          domain_type: string
          elite_analyst_count: number | null
          forecast_direction: string | null
          growth_metric: number | null
          id: string
          slug: string
          stage: string
          supporting_creators: Json | null
          supporting_creators_count: number | null
        }
        Insert: {
          calculated_at?: string | null
          confidence_score?: number | null
          domain_type: string
          elite_analyst_count?: number | null
          forecast_direction?: string | null
          growth_metric?: number | null
          id?: string
          slug: string
          stage: string
          supporting_creators?: Json | null
          supporting_creators_count?: number | null
        }
        Update: {
          calculated_at?: string | null
          confidence_score?: number | null
          domain_type?: string
          elite_analyst_count?: number | null
          forecast_direction?: string | null
          growth_metric?: number | null
          id?: string
          slug?: string
          stage?: string
          supporting_creators?: Json | null
          supporting_creators_count?: number | null
        }
        Relationships: []
      }
      meta_reports: {
        Row: {
          generated_at: string | null
          id: string
          patch_id: string | null
          report_data: Json | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          patch_id?: string | null
          report_data?: Json | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          patch_id?: string | null
          report_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_reports_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      named_items: {
        Row: {
          base_gear_piece_id: string | null
          base_weapon_id: string | null
          brand_set_id: string | null
          fixed_attribute_id: string | null
          id: string
          loot_source_id: string | null
          name: string
          perfect_talent_id: string | null
          slot: string
          type: string
        }
        Insert: {
          base_gear_piece_id?: string | null
          base_weapon_id?: string | null
          brand_set_id?: string | null
          fixed_attribute_id?: string | null
          id?: string
          loot_source_id?: string | null
          name: string
          perfect_talent_id?: string | null
          slot: string
          type: string
        }
        Update: {
          base_gear_piece_id?: string | null
          base_weapon_id?: string | null
          brand_set_id?: string | null
          fixed_attribute_id?: string | null
          id?: string
          loot_source_id?: string | null
          name?: string
          perfect_talent_id?: string | null
          slot?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "named_items_base_gear_piece_id_fkey"
            columns: ["base_gear_piece_id"]
            isOneToOne: false
            referencedRelation: "gear_pieces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "named_items_base_weapon_id_fkey"
            columns: ["base_weapon_id"]
            isOneToOne: false
            referencedRelation: "base_weapons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "named_items_brand_set_id_fkey"
            columns: ["brand_set_id"]
            isOneToOne: false
            referencedRelation: "brand_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "named_items_fixed_attribute_id_fkey"
            columns: ["fixed_attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "named_items_loot_source_id_fkey"
            columns: ["loot_source_id"]
            isOneToOne: false
            referencedRelation: "loot_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "named_items_perfect_talent_id_fkey"
            columns: ["perfect_talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      patch_changes: {
        Row: {
          change_type: string
          created_at: string | null
          description: string
          id: string
          patch_id: string | null
          target_slug: string
          target_type: string
        }
        Insert: {
          change_type: string
          created_at?: string | null
          description: string
          id?: string
          patch_id?: string | null
          target_slug: string
          target_type: string
        }
        Update: {
          change_type?: string
          created_at?: string | null
          description?: string
          id?: string
          patch_id?: string | null
          target_slug?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patch_changes_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "game_patches"
            referencedColumns: ["id"]
          },
        ]
      }
      patches: {
        Row: {
          id: string
          is_active: boolean | null
          release_date: string | null
          season_id: string | null
          version: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          release_date?: string | null
          season_id?: string | null
          version: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          release_date?: string | null
          season_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "patches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      search_entities: {
        Row: {
          entity_type: string
          id: string
          indexed_text: string
          last_indexed_at: string | null
          reference_id: string
        }
        Insert: {
          entity_type: string
          id?: string
          indexed_text: string
          last_indexed_at?: string | null
          reference_id: string
        }
        Update: {
          entity_type?: string
          id?: string
          indexed_text?: string
          last_indexed_at?: string | null
          reference_id?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          end_date: string | null
          id: string
          name: string
          season_number: number
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          name: string
          season_number: number
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          name?: string
          season_number?: number
          start_date?: string | null
        }
        Relationships: []
      }
      skill_variants: {
        Row: {
          id: string
          name: string
          skill_id: string | null
        }
        Insert: {
          id?: string
          name: string
          skill_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_variants_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      specializations: {
        Row: {
          icon_url: string | null
          id: string
          name: string
          signature_weapon: string | null
        }
        Insert: {
          icon_url?: string | null
          id?: string
          name: string
          signature_weapon?: string | null
        }
        Update: {
          icon_url?: string | null
          id?: string
          name?: string
          signature_weapon?: string | null
        }
        Relationships: []
      }
      talent_patch_states: {
        Row: {
          description: string | null
          id: string
          patch_id: string | null
          talent_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          patch_id?: string | null
          talent_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          patch_id?: string | null
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_patch_states_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_patch_states_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          id: string
          is_perfect: boolean | null
          name: string
          slot: string | null
        }
        Insert: {
          id?: string
          is_perfect?: boolean | null
          name: string
          slot?: string | null
        }
        Update: {
          id?: string
          is_perfect?: boolean | null
          name?: string
          slot?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          role: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          username?: string
        }
        Relationships: []
      }
      weapon_patch_states: {
        Row: {
          accuracy: number | null
          base_weapon_id: string | null
          critical_range: number | null
          id: string
          mag_size: number
          optimal_range: number | null
          patch_id: string | null
          reload_speed: number | null
          rpm: number
          stability: number | null
          weapon_damage: number
        }
        Insert: {
          accuracy?: number | null
          base_weapon_id?: string | null
          critical_range?: number | null
          id?: string
          mag_size: number
          optimal_range?: number | null
          patch_id?: string | null
          reload_speed?: number | null
          rpm: number
          stability?: number | null
          weapon_damage: number
        }
        Update: {
          accuracy?: number | null
          base_weapon_id?: string | null
          critical_range?: number | null
          id?: string
          mag_size?: number
          optimal_range?: number | null
          patch_id?: string | null
          reload_speed?: number | null
          rpm?: number
          stability?: number | null
          weapon_damage?: number
        }
        Relationships: [
          {
            foreignKeyName: "weapon_patch_states_base_weapon_id_fkey"
            columns: ["base_weapon_id"]
            isOneToOne: false
            referencedRelation: "base_weapons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapon_patch_states_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
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
      forecast_status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "EXPIRED"
      forecast_direction: "BUFF" | "NERF" | "META" | "OBSOLETE" | "EMERGING"
      forecast_outcome: "SUCCESS" | "FAILURE" | "PARTIAL" | "UNRESOLVED" | "EXPIRED"
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
    Enums: {},
  },
} as const
