/**
 * Migration 003: Insert Test Data
 * Adds sample admin users, clients, and products for testing
 */

-- ============= INSERT ADMIN USERS =============
INSERT INTO admin_users (id, public_id, email, password_hash, first_name, last_name, role, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ADM-00001', 'admin@bazarbuy.ru', '$2a$10$VtlTVKZfYHVEVjKaQnrGS.vhYADkiuCMKLAm.yFxV8CqXVwK9O9uC', 'Admin', 'User', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'ADM-00002', 'manager@bazarbuy.ru', '$2a$10$VtlTVKZfYHVEVjKaQnrGS.vhYADkiuCMKLAm.yFxV8CqXVwK9O9uC', 'Manager', 'User', 'manager', true);

-- ============= INSERT CLIENTS =============
INSERT INTO clients (id, public_id, email, name, phone, city, inn, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CL-00001', 'client1@example.com', 'ОАО Ткани Мир', '+7 (495) 123-45-67', 'Москва', '123456789012', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CL-00002', 'client2@example.com', 'ООО Розница', '+7 (812) 234-56-78', 'Санкт-Петербург', '210987654321', true);

-- ============= INSERT CATEGORIES =============
INSERT INTO categories (name, slug, parent_id, level, position, product_count, icon, is_active)
VALUES
  ('Ткани', 'fabrics', NULL, 1, 1, 5, 'fabric', true),
  ('Хлопок', 'cotton', 1, 2, 1, 3, 'cotton', true),
  ('Полиэстер', 'polyester', 1, 2, 2, 2, 'poly', true);

-- ============= INSERT PRODUCTS =============
INSERT INTO products (id, public_id, sku, name, description, price_per_unit, unit_type, stock_quantity, color, composition, width_cm, is_active)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'SKU-001', 'FAB-001', 'Хлопок Премиум', 'Натуральная хлопковая ткань высокого качества', 450.00, 'meter', 1000, 'Белый', '100% Хлопок', 150, true),
  ('00000000-0000-0000-0000-000000000001', 'SKU-002', 'FAB-002', 'Хлопок Стандарт', 'Практичная хлопковая ткань', 350.00, 'meter', 1500, 'Серый', '100% Хлопок', 150, true),
  ('00000000-0000-0000-0000-000000000002', 'SKU-003', 'FAB-003', 'Полиэстер Блеск', 'Блестящая полиэстеровая ткань', 280.00, 'meter', 2000, 'Черный', '100% Полиэстер', 150, true),
  ('00000000-0000-0000-0000-000000000003', 'SKU-004', 'FAB-004', 'Полиэстер Матовый', 'Матовая полиэстеровая ткань', 300.00, 'meter', 1800, 'Синий', '100% Полиэстер', 150, true),
  ('00000000-0000-0000-0000-000000000004', 'SKU-005', 'FAB-005', 'Смесь Хлопок-Полиэстер', 'Универсальная смесь', 400.00, 'meter', 1200, 'Красный', '65% Хлопок, 35% Полиэстер', 150, true);

-- ============= INSERT CATEGORY-PRODUCT RELATIONS =============
INSERT INTO category_product (category_id, product_id, position)
VALUES
  (2, 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1),
  (2, '00000000-0000-0000-0000-000000000001', 2),
  (2, '00000000-0000-0000-0000-000000000004', 3),
  (3, '00000000-0000-0000-0000-000000000002', 1),
  (3, '00000000-0000-0000-0000-000000000003', 2);

-- ============= INSERT TEST ORDER =============
INSERT INTO orders (id, public_id, client_id, status, total_amount, currency, created_at, updated_at)
VALUES
  ('66666666-6666-6666-6666-666666666666', 'ORD-2026-000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending', 45000.00, 'RUB', NOW(), NOW());

-- ============= INSERT ORDER ITEMS =============
INSERT INTO order_items (id, order_id, fabric_id, color, requested_meters, unit_price_per_meter, total_price, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Белый', 100.00, 450.00, 45000.00, NOW());

-- Print confirmation
SELECT 'Test data inserted successfully!' as status;
