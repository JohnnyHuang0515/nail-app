-- Database Initialization Script (Validated V2)
-- Usage: Run this script to populate the database with essential seed data.
-- WARNING: This script clears existing data in the target tables!

-- 1. Clean up existing data (Cascade delete to handle relations)
TRUNCATE TABLE "booking_items", "bookings", "client_visits", "reviews", "inventory_transactions", "inventory_items", "coupons", "services", "staff", "users" RESTART IDENTITY CASCADE;

-- 2. Insert Users (Admin, Staff, Customer)
-- Included line_user_id AND updated_at (required)
INSERT INTO "users" ("id", "line_user_id", "email", "password_hash", "role", "name", "phone", "avatar_url", "updated_at") VALUES
('user_admin_01', 'line_admin_01', 'admin@example.com', '$2b$10$EpI.j.p.y.z.x.w.v.u.t.s.r.q.p.o.n.m.l.k.j.i.h.g.f.e.d.c.b.a', 'ADMIN', 'Admin User', '0900000000', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', NOW()),
('user_staff_01', 'line_staff_01', 'staff_mika@example.com', '$2b$10$EpI.j.p.y.z.x.w.v.u.t.s.r.q.p.o.n.m.l.k.j.i.h.g.f.e.d.c.b.a', 'STAFF', 'Mika', '0911111111', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mika', NOW()),
('user_staff_02', 'line_staff_02', 'staff_ann@example.com', '$2b$10$EpI.j.p.y.z.x.w.v.u.t.s.r.q.p.o.n.m.l.k.j.i.h.g.f.e.d.c.b.a', 'STAFF', 'Ann', '0922222222', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ann', NOW()),
('user_customer_01', 'line_cust_alice', 'customer_alice@example.com', '$2b$10$EpI.j.p.y.z.x.w.v.u.t.s.r.q.p.o.n.m.l.k.j.i.h.g.f.e.d.c.b.a', 'CUSTOMER', 'Alice Chen', '0933333333', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', NOW());

-- 3. Insert Staff Profiles
-- staff also has updated_at NOT NULL
INSERT INTO "staff" ("id", "user_id", "display_name", "title", "bio", "specialties", "is_active", "rating", "review_count", "updated_at") VALUES
('staff_01', 'user_staff_01', 'Mika', '資深美甲師', '擅長日系彩繪與暈染設計，擁有5年經驗。', ARRAY['凝膠指甲', '手部保養', '日系彩繪'], true, 4.9, 120, NOW()),
('staff_02', 'user_staff_02', 'Ann', '美睫專家', '專精於自然款與濃密款嫁接，動作輕柔快速。', ARRAY['3D嫁接', '6D嫁接', '角蛋白'], true, 4.8, 85, NOW());

-- 4. Insert Services
-- Services usually have updated_at? Schema says: created_at default, NO updated_at column?
-- Checked schema: Services do NOT have updated_at in manual_migration (only created_at).
-- Wait, schema.prisma said `updatedAt`? No, schema.prisma showed `createdAt` for Service, NO `updatedAt`.
-- let's check manual_migration (step 1130): `created_at` timestamp NOT NULL default current_timestamp. No updated_at.
INSERT INTO "services" ("id", "name", "category", "description", "duration_minutes", "price", "is_active") VALUES
('srv_nail_01', '單色凝膠手部', 'Nail', '包含基礎保養、修型、單色凝膠上色。', 60, 1200, true),
('srv_nail_02', '深層足部保養', 'Nail', '包含去角質、足底硬皮處理、保濕敷膜。', 90, 1800, true),
('srv_lash_01', '3D 自然款嫁接 (100根)', 'Eyelash', '根根分明，適合素顏也不突兀的自然妝感。', 90, 1500, true),
('srv_care_01', '手部基礎保養', 'Care', '指緣油護理、甘皮修整、甲面拋光。', 30, 600, true);

-- 5. Insert Inventory Items (Has updated_at)
INSERT INTO "inventory_items" ("id", "name", "category", "sku", "quantity", "unit", "cost_price", "supplier", "updated_at") VALUES
('inv_001', 'OPI 透明底膠', 'consumables', 'GEL-001', 12, '瓶', 450, 'OPI Taiwan', NOW()),
('inv_002', 'Presto 建構膠', 'consumables', 'GEL-002', 8, '罐', 800, 'Nail Labo', NOW()),
('inv_003', '施華洛世奇水鑽 (混)', 'consumables', 'ART-001', 50, '包', 200, 'Nail Partner', NOW()),
('inv_004', '指緣油 (玫瑰)', 'retail', 'RET-001', 20, '瓶', 150, 'In-house', NOW()),
('inv_005', '護手霜 (薰衣草)', 'retail', 'RET-002', 15, '條', 250, 'In-house', NOW());

-- 6. Insert Coupons (No updated_at in schema.prisma or manual_migration? Check manual_migration)
-- Coupons: created_at only. NO updated_at.
INSERT INTO "coupons" ("id", "code", "discount_type", "discount_value", "min_purchase_amount", "valid_from", "valid_until", "usage_limit", "is_active") VALUES
('cpn_welcome', 'WELCOME2024', 'fixed_amount', 100, 1000, '2024-01-01', '2025-12-31', 1000, true),
('cpn_birthday', 'HBDqy88', 'percentage', 10, 0, '2024-01-01', '2025-12-31', 500, true),
('cpn_summer', 'SUMMER_SALE', 'percentage', 15, 2000, '2024-06-01', '2024-08-31', 200, false);

-- 7. Insert Sample Bookings (Has updated_at)
-- Booking 1: Today, Mika - Nail Service
INSERT INTO "bookings" ("id", "customer_id", "stylist_id", "scheduled_at", "status", "total_price", "total_duration_minutes", "notes", "updated_at") VALUES
('bk_01', 'user_customer_01', 'staff_01', NOW() + INTERVAL '2 hours', 'CONFIRMED', 1200, 60, '第一次來，希望自然一點', NOW());

INSERT INTO "booking_items" ("id", "booking_id", "service_id", "price", "duration_minutes") VALUES
('bki_01', 'bk_01', 'srv_nail_01', 1200, 60);

-- Booking 2: Today, Ann - Lash Service
INSERT INTO "bookings" ("id", "customer_id", "stylist_id", "scheduled_at", "status", "total_price", "total_duration_minutes", "updated_at") VALUES
('bk_02', 'user_customer_01', 'staff_02', NOW() + INTERVAL '4 hours', 'PENDING', 1500, 90, NOW());

INSERT INTO "booking_items" ("id", "booking_id", "service_id", "price", "duration_minutes") VALUES
('bki_02', 'bk_02', 'srv_lash_01', 1500, 90);

-- Booking 3: Tomorrow, Mika
INSERT INTO "bookings" ("id", "customer_id", "stylist_id", "scheduled_at", "status", "total_price", "total_duration_minutes", "updated_at") VALUES
('bk_03', 'user_customer_01', 'staff_01', NOW() + INTERVAL '1 day', 'CONFIRMED', 1800, 90, NOW());

INSERT INTO "booking_items" ("id", "booking_id", "service_id", "price", "duration_minutes") VALUES
('bki_03', 'bk_03', 'srv_nail_02', 1800, 90);
