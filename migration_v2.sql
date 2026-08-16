-- ============================================================
-- SALIOU SHOP - Migration v2
-- A coller dans Supabase > SQL Editor > New query > Run
-- (a executer APRES le schema.sql original - ne le remplace pas)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORIES : image / couleur de fond (pour les cartes "Univers"
--    de la page d'accueil - crocs homme, femme, enfant...)
-- ------------------------------------------------------------
alter table categories add column if not exists image_url text;
alter table categories add column if not exists bg_color text default '#F3F4F6';

-- ------------------------------------------------------------
-- 2. VARIANTES : suppression "douce"
--    Une variante deja utilisee dans une commande ne peut pas etre
--    supprimee (contrainte de cle etrangere depuis order_items).
--    On la desactive donc au lieu de la supprimer quand l'admin modifie
--    un produit et retire une taille/couleur.
-- ------------------------------------------------------------
alter table product_variants add column if not exists is_active boolean not null default true;

-- ------------------------------------------------------------
-- 3. FAQ (page d'accueil / fiche produit) - geree depuis l'admin
-- ------------------------------------------------------------
create table if not exists site_faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  position int not null default 0,
  is_active boolean not null default true
);

alter table site_faqs enable row level security;

drop policy if exists "FAQ visibles par tous" on site_faqs;
create policy "FAQ visibles par tous" on site_faqs for select using (is_active = true or is_admin());

drop policy if exists "Admin gere la FAQ" on site_faqs;
create policy "Admin gere la FAQ" on site_faqs for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 4. AVIS CLIENTS (temoignages) - affiches sur la page d'accueil
--    pour rassurer et faire convertir
-- ------------------------------------------------------------
create table if not exists site_testimonials (
  id bigint generated always as identity primary key,
  customer_name text not null,
  rating int not null default 5 check (rating between 1 and 5),
  comment text not null,
  image_url text,
  city text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table site_testimonials enable row level security;

drop policy if exists "Avis visibles par tous" on site_testimonials;
create policy "Avis visibles par tous" on site_testimonials for select using (is_active = true or is_admin());

drop policy if exists "Admin gere les avis" on site_testimonials;
create policy "Admin gere les avis" on site_testimonials for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- Fin de la migration v2
-- ------------------------------------------------------------
