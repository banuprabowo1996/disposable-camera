export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PhotoStatus = "pending" | "approved" | "rejected";
export type UploadReservationStatus = "reserved" | "confirmed" | "released";

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string;
          device_id: string;
          roll_id: string;
          shots_used: number;
          bonus_shots: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          roll_id: string;
          shots_used?: number;
          bonus_shots?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          roll_id?: string;
          shots_used?: number;
          bonus_shots?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_roll_id_fkey";
            columns: ["roll_id"];
            isOneRelation: false;
            referencedRelation: "rolls";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          guest_id: string;
          roll_id: string;
          storage_path: string;
          status: PhotoStatus;
          width: number;
          height: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          roll_id: string;
          storage_path: string;
          status?: PhotoStatus;
          width: number;
          height: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          roll_id?: string;
          storage_path?: string;
          status?: PhotoStatus;
          width?: number;
          height?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_guest_id_fkey";
            columns: ["guest_id"];
            isOneRelation: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_roll_id_fkey";
            columns: ["roll_id"];
            isOneRelation: false;
            referencedRelation: "rolls";
            referencedColumns: ["id"];
          },
        ];
      };
      refill_codes: {
        Row: {
          id: string;
          code: string;
          extra_shots: number;
          max_uses: number;
          used_count: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          extra_shots: number;
          max_uses: number;
          used_count?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          extra_shots?: number;
          max_uses?: number;
          used_count?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      rolls: {
        Row: {
          id: string;
          code: string;
          name: string;
          shots_limit: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          shots_limit?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          shots_limit?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      upload_reservations: {
        Row: {
          id: string;
          guest_id: string;
          storage_path: string;
          status: UploadReservationStatus;
          photo_id: string | null;
          expires_at: string;
          created_at: string;
          released_at: string | null;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          guest_id: string;
          storage_path: string;
          status?: UploadReservationStatus;
          photo_id?: string | null;
          expires_at: string;
          created_at?: string;
          released_at?: string | null;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          guest_id?: string;
          storage_path?: string;
          status?: UploadReservationStatus;
          photo_id?: string | null;
          expires_at?: string;
          created_at?: string;
          released_at?: string | null;
          confirmed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "upload_reservations_guest_id_fkey";
            columns: ["guest_id"];
            isOneRelation: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "upload_reservations_photo_id_fkey";
            columns: ["photo_id"];
            isOneRelation: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_shot: {
        Args: { p_guest_id: string };
        Returns: number | null;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
