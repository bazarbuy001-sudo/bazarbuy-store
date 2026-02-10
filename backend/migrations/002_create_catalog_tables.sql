/**
 * Migration 002: Create Catalog Tables
 * Based on: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/Кнопка Каталог Товаров/Backend/TZ_02_BACKEND.md
 * 
 * Creates catalog structure:
 * - categories (hierarchical: level 1-3)
 * - products (fabrics, furnishings)
 * - category_product (many-to-many)
 */

-- ============= CATEGORIES TABLE =============
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    level INTEGER NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    icon VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT level_check CHECK (level >= 1 AND level <= 3),
    CONSTRAINT position_check CHECK (position >= 0),
    CONSTRAINT product_count_check CHECK (product_count >= 0)
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_parent_position ON categories(parent_id, position);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============= PRODUCTS TABLE =============
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) UNIQUE NOT NULL, -- SKU or product code
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Fabric-specific fields (for TK, TC, etc.)
    sku VARCHAR(50) UNIQUE,
    composition VARCHAR(255), -- e.g., "100% cotton"
    width_cm DECIMAL(5,2), -- fabric width in cm
    roll_length_m DECIMAL(5,2), -- standard roll length
    color VARCHAR(100),
    pattern VARCHAR(100),
    
    price_per_unit DECIMAL(10,2) NOT NULL, -- Price per meter or piece
    unit_type VARCHAR(20) DEFAULT 'meter', -- meter, piece, kg, etc.
    
    stock_quantity DECIMAL(10,2) DEFAULT 0, -- Available quantity
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT price_check CHECK (price_per_unit > 0),
    CONSTRAINT stock_check CHECK (stock_quantity >= 0)
);

CREATE INDEX idx_products_public_id ON products(public_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at);

-- ============= CATEGORY_PRODUCT TABLE (Many-to-Many) =============
CREATE TABLE category_product (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, product_id)
);

CREATE INDEX idx_category_product_category ON category_product(category_id);
CREATE INDEX idx_category_product_product ON category_product(product_id);

-- ============= PRODUCT_IMAGES TABLE =============
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============= PRODUCT_ATTRIBUTES TABLE =============
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_key VARCHAR(50) NOT NULL, -- e.g., 'care_instruction', 'origin'
    attribute_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_key ON product_attributes(attribute_key);
