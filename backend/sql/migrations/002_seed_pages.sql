-- Registriert die bisher im Frontend vorhandenen Zielseiten.
-- Bestehende Seiten bleiben sofort veröffentlicht; neue Seiten aus dem Admin bleiben Draft.

INSERT INTO pages (slug, title, is_published)
VALUES
  ('das-sind-wir-1', 'Das sind wir', TRUE),
  ('unser-van', 'Unser Van', TRUE),
  ('unimog-projekt', 'Unimog Projekt', TRUE),
  ('unimog-projekt/fahrzeugvorstellung', 'Fahrzeugvorstellung', TRUE),
  ('unimog-projekt/planung-konzept', 'Planung & Konzept', TRUE),
  ('unimog-projekt/der-ausbau', 'Der Ausbau', TRUE),
  ('wandern-1', 'Wandern', TRUE),
  ('unsere-ausruestung', 'Unsere Ausrüstung', TRUE),
  ('blog', 'Blog', TRUE),
  ('blog/east-tour-2024-2025', 'East Tour 2024/2025', TRUE),
  ('blog/video-blog-vlog', 'Video Blog #Vlog', TRUE),
  ('nuetzliches', 'Nützliches', TRUE),
  ('so-erreichst-du-uns', 'So erreichst du uns', TRUE)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;
