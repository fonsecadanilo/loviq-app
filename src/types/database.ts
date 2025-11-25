/**
 * Tipos TypeScript gerados automaticamente a partir do schema do Supabase
 * Projeto: loviq-app (gxqzlxsbpcqqckeccvtl)
 * 
 * Para regenerar esses tipos, use o Supabase CLI:
 * npx supabase gen types typescript --project-id gxqzlxsbpcqqckeccvtl > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brand_wallet: {
        Row: {
          balance: number
          brand_id: number
          created_at: string
          currency: string
          id: number
          updated_at: string
        }
        Insert: {
          balance?: number
          brand_id: number
          created_at?: string
          currency?: string
          id?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          brand_id?: number
          created_at?: string
          currency?: string
          id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_wallet_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string
          phone_number: string | null
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name: string
          phone_number?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          phone_number?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaign_influencers: {
        Row: {
          campaign_id: number
          created_at: string
          influencer_id: number
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          influencer_id: number
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          influencer_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_products: {
        Row: {
          campaign_id: number
          created_at: string
          product_id: number
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          product_id: number
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          product_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          commission_value: number
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          name: string
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          brand_id: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          commission_value: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          brand_id?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          commission_value?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_wallet: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: number
          influencer_id: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: number
          influencer_id: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: number
          influencer_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_wallet_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: true
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string
          phone_number: string | null
          social_media_handle: string | null
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name: string
          phone_number?: string | null
          social_media_handle?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          phone_number?: string | null
          social_media_handle?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      live_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["live_event_type"]
          id: number
          live_id: number
          product_id: number | null
          session_id: string | null
          updated_at: string
          user_id: number | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["live_event_type"]
          id?: number
          live_id: number
          product_id?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["live_event_type"]
          id?: number
          live_id?: number
          product_id?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_events_live_id_fkey"
            columns: ["live_id"]
            isOneToOne: false
            referencedRelation: "lives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lives: {
        Row: {
          campaign_id: number
          created_at: string
          description: string | null
          end_time: string | null
          id: number
          influencer_id: number
          live_url: string | null
          start_time: string
          status: Database["public"]["Enums"]["live_status"]
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          influencer_id: number
          live_url?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["live_status"]
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          influencer_id?: number
          live_url?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["live_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lives_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          order_id: number
          product_id: number
          quantity: number
          subtotal: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          order_id: number
          product_id: number
          quantity: number
          subtotal: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          subtotal?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          brand_id: number
          campaign_id: number
          commission_amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          external_order_id: string | null
          id: number
          influencer_id: number
          order_date: string
          order_source: Database["public"]["Enums"]["order_source"]
          status: Database["public"]["Enums"]["order_status"]
          store_id: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          brand_id: number
          campaign_id: number
          commission_amount: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          external_order_id?: string | null
          id?: number
          influencer_id: number
          order_date: string
          order_source: Database["public"]["Enums"]["order_source"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          brand_id?: number
          campaign_id?: number
          commission_amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          external_order_id?: string | null
          id?: number
          influencer_id?: number
          order_date?: string
          order_source?: Database["public"]["Enums"]["order_source"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: number
          influencer_id: number
          payout_date: string | null
          status: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: number
          influencer_id: number
          payout_date?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: number
          influencer_id?: number
          payout_date?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          external_product_id: string | null
          id: number
          image_url: string | null
          name: string
          price: number
          product_source_type: Database["public"]["Enums"]["product_source_type"]
          store_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          external_product_id?: string | null
          id?: number
          image_url?: string | null
          name: string
          price: number
          product_source_type: Database["public"]["Enums"]["product_source_type"]
          store_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          external_product_id?: string | null
          id?: number
          image_url?: string | null
          name?: string
          price?: number
          product_source_type?: Database["public"]["Enums"]["product_source_type"]
          store_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_products: {
        Row: {
          created_at: string
          id: number
          last_sync_at: string | null
          product_id: number
          shopify_variant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_sync_at?: string | null
          product_id: number
          shopify_variant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          last_sync_at?: string | null
          product_id?: number
          shopify_variant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_sync_logs: {
        Row: {
          created_at: string
          finished_at: string | null
          id: number
          message: string | null
          started_at: string
          status: Database["public"]["Enums"]["sync_status"]
          store_id: number
          sync_type: Database["public"]["Enums"]["sync_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: number
          message?: string | null
          started_at: string
          status: Database["public"]["Enums"]["sync_status"]
          store_id: number
          sync_type: Database["public"]["Enums"]["sync_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: number
          message?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
          store_id?: number
          sync_type?: Database["public"]["Enums"]["sync_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_sync_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          api_credentials: Json | null
          brand_id: number
          created_at: string
          external_store_id: string | null
          id: number
          name: string
          store_type: Database["public"]["Enums"]["store_type"]
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          brand_id: number
          created_at?: string
          external_store_id?: string | null
          id?: number
          name: string
          store_type: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          brand_id?: number
          created_at?: string
          external_store_id?: string | null
          id?: number
          name?: string
          store_type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_clicks: {
        Row: {
          campaign_id: number
          click_timestamp: string
          created_at: string
          id: number
          influencer_id: number
          ip_address: string | null
          product_id: number | null
          referrer_url: string | null
          target_url: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          campaign_id: number
          click_timestamp: string
          created_at?: string
          id?: number
          influencer_id: number
          ip_address?: string | null
          product_id?: number | null
          referrer_url?: string | null
          target_url: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: number
          click_timestamp?: string
          created_at?: string
          id?: number
          influencer_id?: number
          ip_address?: string | null
          product_id?: number | null
          referrer_url?: string | null
          target_url?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracked_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_clicks_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          campaign_id: number
          created_at: string
          description: string | null
          id: number
          influencer_id: number
          status: Database["public"]["Enums"]["video_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          upload_date: string
          video_url: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          description?: string | null
          id?: number
          influencer_id: number
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          upload_date: string
          video_url: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          description?: string | null
          id?: number
          influencer_id?: number
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          upload_date?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
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
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      commission_type: "percentage" | "fixed"
      live_event_type: "view" | "click" | "chat_message" | "share" | "purchase_intent"
      live_status: "scheduled" | "live" | "ended" | "cancelled"
      order_source: "shopify" | "manual"
      order_status: "pending" | "completed" | "cancelled" | "refunded"
      payout_status: "pending" | "paid" | "failed" | "cancelled"
      product_source_type: "shopify" | "manual"
      store_type: "shopify" | "woocommerce" | "internal"
      sync_status: "success" | "failed" | "in_progress"
      sync_type: "products" | "orders" | "inventory"
      video_status: "uploaded" | "approved" | "rejected" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Tipos específicos exportados para uso direto
export type Brand = Tables<'brands'>
export type Store = Tables<'stores'>
export type Product = Tables<'products'>
export type ShopifyProduct = Tables<'shopify_products'>
export type ShopifySyncLog = Tables<'shopify_sync_logs'>
export type Campaign = Tables<'campaigns'>
export type Influencer = Tables<'influencers'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>

// Enums exportados
export type StoreType = Enums<'store_type'>
export type ProductSourceType = Enums<'product_source_type'>
export type SyncStatus = Enums<'sync_status'>
export type SyncType = Enums<'sync_type'>
export type CampaignStatus = Enums<'campaign_status'>
export type OrderStatus = Enums<'order_status'>
export type OrderSource = Enums<'order_source'>
