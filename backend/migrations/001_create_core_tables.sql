/**
 * Migration 001: Create Core Tables
 * Based on: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md
 * 
 * Creates 8 core entities:
 * 1. clients (D-001: B2B model)
 * 2. admin_users (D-001: B2B model)
 * 3. orders (D-001: client ownership)
 * 4. order_items (D-004: meters model)
 * 5. saga_orchestration (D-002: enterprise-grade)
 * 6. saga_steps (D-002: source of truth)
 * 7. idempotent_requests (idempotency)
 * 8. sessions (auth)
 */

-- ============= 1. CLIENTS TABLE =============
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) UNIQUE NOT NULL, -- CL-XXXXXX
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    inn VARCHAR(12),
    primary_auth_method VARCHAR(20) DEFAULT 'email',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_public_id ON clients(public_id);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- ============= 2. ADMIN_USERS TABLE =============
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) UNIQUE NOT NULL, -- ADM-XXXXXX
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT admin_role_check CHECK (role IN ('admin', 'superadmin', 'manager'))
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_public_id ON admin_users(public_id);

-- ============= 3. ORDERS TABLE =============
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) UNIQUE NOT NULL, -- ORD-YYYY-NNNNNN
    client_id UUID NOT NULL REFERENCES clients(id),
    created_by_admin_id UUID REFERENCES admin_users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT order_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'))
);

CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_public_id ON orders(public_id);

-- ============= 4. ORDER_ITEMS TABLE =============
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    fabric_id UUID NOT NULL,
    color VARCHAR(50) NOT NULL,
    requested_meters DECIMAL(10,2) NOT NULL,
    fulfilled_meters DECIMAL(10,2),
    unit_price_per_meter DECIMAL(10,2) NOT NULL,
    rolls INTEGER,
    roll_allocations JSONB,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT requested_meters_check CHECK (requested_meters > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============= 5. SAGA_ORCHESTRATION TABLE =============
CREATE TABLE saga_orchestration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_type VARCHAR(50) NOT NULL,
    saga_status VARCHAR(30) NOT NULL DEFAULT 'initiated',
    request_id UUID NOT NULL,
    current_step VARCHAR(100), -- DERIVED FIELD (D-002)
    payload JSONB NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    timeout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT saga_type_check CHECK (saga_type IN ('order_creation', 'order_cancellation', 'payment_processing', 'stock_reservation')),
    CONSTRAINT saga_status_check CHECK (saga_status IN ('initiated', 'in_progress', 'completed', 'failed', 'compensating', 'compensated'))
);

CREATE INDEX idx_saga_orchestration_status ON saga_orchestration(saga_status);
CREATE INDEX idx_saga_orchestration_type ON saga_orchestration(saga_type);

-- ============= 6. SAGA_STEPS TABLE =============
CREATE TABLE saga_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id UUID NOT NULL REFERENCES saga_orchestration(id),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(saga_id, step_number),
    CONSTRAINT saga_step_status_check CHECK (step_status IN ('pending', 'completed', 'failed', 'compensated'))
);

CREATE INDEX idx_saga_steps_saga ON saga_steps(saga_id, step_number);

-- Trigger to update saga_orchestration.current_step (DERIVED FIELD)
CREATE OR REPLACE FUNCTION update_saga_current_step()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE saga_orchestration
    SET current_step = NEW.step_name,
        updated_at = NOW()
    WHERE id = NEW.saga_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_current_step
AFTER INSERT OR UPDATE ON saga_steps
FOR EACH ROW EXECUTE FUNCTION update_saga_current_step();

-- ============= 7. IDEMPOTENT_REQUESTS TABLE =============
CREATE TABLE idempotent_requests (
    idempotency_key CHAR(36) PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    admin_user_id UUID REFERENCES admin_users(id),
    request_hash VARCHAR(64) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_idempotent_client ON idempotent_requests(client_id);
CREATE INDEX idx_idempotent_expires ON idempotent_requests(expires_at);

-- ============= 8. SESSIONS TABLE =============
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_admin_user ON sessions(admin_user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
