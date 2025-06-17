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
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          rating: number
          verified: boolean
          user_type: 'buyer' | 'seller'
          total_listings: number
          total_sold: number
          followers: number
          following: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          rating?: number
          verified?: boolean
          user_type?: 'buyer' | 'seller'
          total_listings?: number
          total_sold?: number
          followers?: number
          following?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          rating?: number
          verified?: boolean
          user_type?: 'buyer' | 'seller'
          total_listings?: number
          total_sold?: number
          followers?: number
          following?: number
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          phone: string | null
          email: string | null
          address: string | null
          owner_id: string
          verified: boolean
          total_cars: number
          total_sold: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          owner_id: string
          verified?: boolean
          total_cars?: number
          total_sold?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          owner_id?: string
          verified?: boolean
          total_cars?: number
          total_sold?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      cars: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          color: string
          fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
          transmission: 'Manual' | 'Automatic'
          body_type: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Truck'
          videos: string[]
          images: string[]
          description: string
          location: string
          seller_id: string
          brand_id: string | null
          seller_type: 'individual' | 'brand'
          likes_count: number
          comments_count: number
          views_count: number
          status: 'active' | 'sold' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          color: string
          fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
          transmission: 'Manual' | 'Automatic'
          body_type: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Truck'
          videos?: string[]
          images: string[]
          description: string
          location: string
          seller_id: string
          brand_id?: string | null
          seller_type?: 'individual' | 'brand'
          likes_count?: number
          comments_count?: number
          views_count?: number
          status?: 'active' | 'sold' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          price?: number
          mileage?: number
          color?: string
          fuel_type?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
          transmission?: 'Manual' | 'Automatic'
          body_type?: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Truck'
          videos?: string[]
          images?: string[]
          description?: string
          location?: string
          seller_id?: string
          brand_id?: string | null
          seller_type?: 'individual' | 'brand'
          likes_count?: number
          comments_count?: number
          views_count?: number
          status?: 'active' | 'sold' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          car_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          car_id: string
          text: string
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id: string
          text: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
          text?: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      car_views: {
        Row: {
          id: string
          user_id: string | null
          car_id: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          car_id: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          car_id?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
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