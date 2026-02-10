/**
 * Type Definitions for Bazar Buy
 * Based on: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md
 */

// ============= CLIENTS =============
export interface Client {
  id: string; // UUID
  public_id: string; // CL-XXXXXX
  email: string;
  name: string;
  phone?: string;
  city?: string;
  inn?: string;
  primary_auth_method: 'email' | 'oauth';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============= ADMIN USERS =============
export enum AdminRole {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  MANAGER = 'manager',
}

export interface AdminUser {
  id: string; // UUID
  public_id: string; // ADM-XXXXXX
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============= ORDERS =============
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing', // D-003: CANONICAL name
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string; // UUID
  public_id: string; // ORD-YYYY-NNNNNN
  client_id: string; // FK → clients.id (D-001)
  created_by_admin_id?: string; // FK → admin_users.id
  status: OrderStatus;
  total_amount: number;
  currency: string; // Default: RUB
  shipping_address?: Record<string, unknown>;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ============= ORDER ITEMS =============
export interface OrderItem {
  id: string; // UUID
  order_id: string; // FK → orders.id
  fabric_id: string;
  color: string;
  requested_meters: number; // DECIMAL (D-004)
  fulfilled_meters?: number;
  unit_price_per_meter: number;
  rolls?: number;
  roll_allocations?: Record<string, unknown>;
  total_price: number; // BR-ITEM-002: requested_meters * unit_price_per_meter
  created_at: Date;
}

// ============= SAGA ORCHESTRATION =============
export enum SagaType {
  ORDER_CREATION = 'order_creation',
  ORDER_CANCELLATION = 'order_cancellation',
  PAYMENT_PROCESSING = 'payment_processing',
  STOCK_RESERVATION = 'stock_reservation',
}

export enum SagaStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATING = 'compensating',
  COMPENSATED = 'compensated',
}

export interface SagaOrchestration {
  id: string; // UUID
  saga_type: SagaType;
  saga_status: SagaStatus;
  request_id: string;
  current_step?: string; // DERIVED FIELD (D-002)
  payload: Record<string, unknown>;
  started_at: Date;
  completed_at?: Date;
  timeout_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============= SAGA STEPS =============
export enum SagaStepStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATED = 'compensated',
}

export interface SagaStep {
  id: string; // UUID
  saga_id: string; // FK → saga_orchestration.id
  step_number: number;
  step_name: string;
  step_status: SagaStepStatus;
  input_data?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  error_message?: string;
  started_at?: Date;
  completed_at?: Date;
}

// ============= IDEMPOTENT REQUESTS =============
export interface IdempotentRequest {
  idempotency_key: string; // UUID v4
  client_id: string; // FK → clients.id (D-001)
  admin_user_id?: string; // FK → admin_users.id
  request_hash: string; // SHA-256
  response_status?: number;
  response_body?: Record<string, unknown>;
  created_at: Date;
  expires_at: Date;
}

// ============= SESSIONS =============
export interface Session {
  id: string; // UUID
  admin_user_id: string; // FK → admin_users.id
  token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, unknown>;
}

// ============= AUTH TYPES =============
export interface JWTPayload {
  sub: string; // admin_user_id
  email: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<AdminUser, 'password_hash'>;
}

// ============= PAGINATION =============
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
