-- Draft/Publish-Migration für bestehende Datenbanken.
-- Nach dieser Migration erzeugt die Anwendung beim ersten Menüabruf automatisch:
-- 1. eine veröffentlichte Revision aus menu_items
-- 2. eine Draft-Kopie für den Adminbereich

CREATE TABLE IF NOT EXISTS site_revisions (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_revisions_one_published
    ON site_revisions (status) WHERE status = 'published';

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_revisions_one_draft
    ON site_revisions (status) WHERE status = 'draft';

CREATE TABLE IF NOT EXISTS menu_item_versions (
    id SERIAL PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES site_revisions(id) ON DELETE CASCADE,
    source_id INTEGER,
    parent_id INTEGER REFERENCES menu_item_versions(id) ON DELETE CASCADE,
    label VARCHAR(120) NOT NULL,
    path VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_item_versions_revision
    ON menu_item_versions(revision_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_versions_parent_sort
    ON menu_item_versions(revision_id, parent_id, sort_order);

CREATE TABLE IF NOT EXISTS content_block_versions (
    id SERIAL PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES site_revisions(id) ON DELETE CASCADE,
    page_slug VARCHAR(150) NOT NULL,
    block_key VARCHAR(150) NOT NULL,
    block_type VARCHAR(30) NOT NULL CHECK (block_type IN ('text', 'image', 'youtube')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (revision_id, page_slug, block_key)
);

CREATE INDEX IF NOT EXISTS idx_content_block_versions_revision
    ON content_block_versions(revision_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_item_versions_updated_at ON menu_item_versions;
CREATE TRIGGER trg_menu_item_versions_updated_at
    BEFORE UPDATE ON menu_item_versions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_content_block_versions_updated_at ON content_block_versions;
CREATE TRIGGER trg_content_block_versions_updated_at
    BEFORE UPDATE ON content_block_versions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
