-- Überführt die bisher fest codierte Header-Navigation in menu_items.
-- Das Script ist idempotent: Es fügt die Struktur nur ein, wenn menu_items leer ist.

DO $$
DECLARE
    spooners_id INTEGER;
    on_tour_id INTEGER;
    blog_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM menu_items) THEN
        INSERT INTO menu_items (label, path, sort_order, is_active)
        VALUES
            ('SPOONERS', '/das-sind-wir-1', 0, TRUE),
            ('ON TOUR', '/on-tour', 1, TRUE),
            ('BLOG', '/blog', 2, TRUE),
            ('SO ERREICHST DU UNS', '/so-erreichst-du-uns', 3, TRUE);

        SELECT id INTO spooners_id FROM menu_items WHERE label = 'SPOONERS' AND parent_id IS NULL;
        SELECT id INTO on_tour_id FROM menu_items WHERE label = 'ON TOUR' AND parent_id IS NULL;
        SELECT id INTO blog_id FROM menu_items WHERE label = 'BLOG' AND parent_id IS NULL;

        INSERT INTO menu_items (parent_id, label, path, sort_order, is_active)
        VALUES
            (spooners_id, 'Rania', '/das-sind-wir-1', 0, TRUE),
            (spooners_id, 'Daniel', '/das-sind-wir-1', 1, TRUE),
            (spooners_id, '(Albert) Einstein', '/das-sind-wir-1', 2, TRUE),
            (on_tour_id, 'Unimog Projekt', '/unimog-projekt', 0, TRUE),
            (on_tour_id, 'Wandern', '/wandern-1', 1, TRUE),
            (on_tour_id, 'Unsere Ausrüstung', '/unsere-ausruestung', 2, TRUE),
            (on_tour_id, 'NÜTZLICHES', '/nuetzliches', 3, TRUE),
            (blog_id, 'East Tour 2024/2025', '/blog/east-tour-2024-2025', 0, TRUE),
            (blog_id, 'Video Blog #Vlog', '/blog/video-blog-vlog', 1, TRUE);
    END IF;
END $$;
