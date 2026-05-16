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
      profiles: {
        Row: {
          id: string
          role: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          phone: string | null
          rating: number | null
          total_reviews: number | null
          total_trips: number | null
          total_orders: number | null
          push_token: string | null
          language: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          role?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          push_token?: string | null
          language?: string | null
        }
        Update: {
          role?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          push_token?: string | null
          language?: string | null
          updated_at?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          triper_id: string
          origin_country: string
          destination_country: string
          destination_city: string | null
          departure_date: string
          return_date: string
          capacity_kg: number | null
          capacity_items: number | null
          price_range_min: number | null
          price_range_max: number | null
          currency: string | null
          notes: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          triper_id: string
          origin_country: string
          destination_country: string
          destination_city?: string | null
          departure_date: string
          return_date: string
          capacity_kg?: number | null
          capacity_items?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          currency?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          status?: string | null
          notes?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          trip_id: string
          triper_id: string
          name: string
          description: string | null
          category: string | null
          price_min: number | null
          price_max: number | null
          currency: string | null
          image_urls: string[] | null
          is_available: boolean | null
          created_at: string | null
        }
        Insert: {
          trip_id: string
          triper_id: string
          name: string
          description?: string | null
          category?: string | null
          price_min?: number | null
          price_max?: number | null
          currency?: string | null
          image_urls?: string[] | null
          is_available?: boolean | null
        }
        Update: {
          is_available?: boolean | null
          name?: string
          description?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          tiper_id: string
          triper_id: string
          trip_id: string | null
          product_id: string | null
          custom_request_id: string | null
          item_name: string
          item_url: string | null
          quantity: number | null
          agreed_price: number | null
          service_fee: number | null
          total_amount: number | null
          currency: string | null
          notes: string | null
          status: string | null
          midtrans_snap_token: string | null
          midtrans_transaction_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          tiper_id: string
          triper_id: string
          trip_id?: string | null
          product_id?: string | null
          custom_request_id?: string | null
          item_name: string
          item_url?: string | null
          quantity?: number | null
          agreed_price?: number | null
          service_fee?: number | null
          total_amount?: number | null
          currency?: string | null
          notes?: string | null
        }
        Update: {
          status?: string | null
          midtrans_snap_token?: string | null
          midtrans_transaction_id?: string | null
          updated_at?: string | null
        }
      }
      custom_requests: {
        Row: {
          id: string
          tiper_id: string
          item_name: string
          item_url: string | null
          description: string | null
          target_country: string | null
          budget_min: number | null
          budget_max: number | null
          currency: string | null
          deadline: string | null
          image_urls: string[] | null
          status: string | null
          taken_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          tiper_id: string
          item_name: string
          item_url?: string | null
          description?: string | null
          target_country?: string | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: string | null
          deadline?: string | null
          image_urls?: string[] | null
        }
        Update: {
          status?: string | null
          taken_by?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          order_id: string | null
          custom_request_id: string | null
          sender_id: string
          receiver_id: string
          content: string | null
          image_url: string | null
          message_type: string | null
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          order_id?: string | null
          custom_request_id?: string | null
          sender_id: string
          receiver_id: string
          content?: string | null
          image_url?: string | null
          message_type?: string | null
        }
        Update: {
          read_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json | null
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          type?: string
          title: string
          body: string
          data?: Json | null
        }
        Update: {
          read_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
        }
        Update: { comment?: string | null }
      }
      escrow_payments: {
        Row: {
          id: string
          order_id: string
          buyer_id: string
          traveler_id: string
          amount: number
          currency: string
          status: string
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          held_at: string
          released_at: string | null
          refunded_at: string | null
          disputed_at: string | null
          dispute_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_id: string
          buyer_id: string
          traveler_id: string
          amount: number
          currency?: string
          status?: string
        }
        Update: {
          status?: string
          released_at?: string | null
          refunded_at?: string | null
          disputed_at?: string | null
          dispute_reason?: string | null
          updated_at?: string
        }
      }
      shake_discounts: {
        Row: {
          id: string
          user_id: string
          discount_pct: number
          discount_code: string | null
          last_shake_at: string
          is_used: boolean
          used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          discount_pct?: number
          discount_code?: string | null
          last_shake_at?: string
          is_used?: boolean
        }
        Update: {
          discount_pct?: number
          discount_code?: string | null
          last_shake_at?: string
          is_used?: boolean
          used_at?: string | null
          updated_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          token: string
          platform: string
        }
        Update: {
          token?: string
          updated_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
