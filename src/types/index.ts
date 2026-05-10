// ─── Booking types ───────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id:           string;
  service_id:   string;
  service_name: string;
  date:         string;         // ISO date: YYYY-MM-DD
  time:         string;         // HH:MM (24h)
  duration:     number;         // minutes
  price:        number;
  // Customer
  customer_name:    string;
  customer_email:   string;
  customer_phone:   string;
  customer_address: string;
  notes?:           string;
  // Status
  status:       BookingStatus;
  created_at:   string;
  updated_at:   string;
}

export interface CreateBookingInput {
  service_id:       string;
  date:             string;
  time:             string;
  customer_name:    string;
  customer_email:   string;
  customer_phone:   string;
  customer_address: string;
  notes?:           string;
}

// ─── Availability types ──────────────────────────────────────────────────────

export interface TimeSlot {
  time:      string;    // HH:MM
  available: boolean;
}

export interface DayAvailability {
  date:  string;        // YYYY-MM-DD
  slots: TimeSlot[];
}

// ─── API response types ──────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
}

export interface ApiError {
  success: false;
  error:   string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Form types ──────────────────────────────────────────────────────────────

export interface BookingFormData {
  // Step 1
  service_id: string;
  // Step 2
  date: string;
  time: string;
  // Step 3
  customer_name:    string;
  customer_email:   string;
  customer_phone:   string;
  customer_address: string;
  notes?:           string;
}
