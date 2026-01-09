-- Seed data for services
-- Run this SQL to insert sample services

-- 基礎保養
INSERT INTO services (id, name, category, description, duration_minutes, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', '基礎手部保養', '基礎保養', '包含手部去角質、滋潤保濕、基礎指甲修剪', 45, 500, true),
('550e8400-e29b-41d4-a716-446655440002', '基礎足部保養', '基礎保養', '包含足部去角質、滋潤保濕、基礎指甲修剪', 60, 600, true),
('550e8400-e29b-41d4-a716-446655440003', '手部深層護理', '基礎保養', '深層清潔+按摩+保濕面膜', 75, 800, true);

-- 凝膠指甲
INSERT INTO services (id, name, category, description, duration_minutes, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440004', '單色凝膠指甲', '凝膠指甲', '純色凝膠指甲上色，持久不掉色', 90, 1200, true),
('550e8400-e29b-41d4-a716-446655440005', '漸層凝膠指甲', '凝膠指甲', '漸層色凝膠指甲，自然優雅', 120, 1500, true),
('550e8400-e29b-41d4-a716-446655440006', '光療凝膠延甲', '凝膠指甲', '使用光療凝膠延長指甲', 150, 2000, true);

-- 造型彩繪
INSERT INTO services (id, name, category, description, duration_minutes, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440007', '簡約線條彩繪', '造型彩繪', '1-2個手指簡約線條或圖案', 30, 300, true),
('550e8400-e29b-41d4-a716-446655440008', '精緻花卉彩繪', '造型彩繪', '手繪精緻花卉圖案', 60, 800, true),
('550e8400-e29b-41d4-a716-446655440009', '全手繪藝術設計', '造型彩繪', '客製化全手繪藝術指甲', 120, 1800, true);

-- 特殊服務
INSERT INTO services (id, name, category, description, duration_minutes, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440010', '指甲修補', '特殊服務', '單指指甲修補或卸除', 20, 200, true),
('550e8400-e29b-41d4-a716-446655440011', '凝膠卸除', '特殊服務', '完整凝膠指甲卸除+基礎保養', 45, 400, true),
('550e8400-e29b-41d4-a716-446655440012', '問題指甲處理', '特殊服務', '針對問題指甲的特殊護理', 60, 800, true);
