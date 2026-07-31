-- 0010_product_media.sql
-- Product image URLs become DB source of truth (local /catalog paths or Supabase Storage).

alter table products
  add column if not exists image_url text,
  add column if not exists gallery_urls text[] not null default '{}';
