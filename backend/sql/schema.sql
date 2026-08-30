-- PostgreSQL-Schema für Menü- und Content-Verwaltung (CMS)

-- Menüeinträge (hierarchisch über parent_id, z.B. für Dropdown-Untermenüs)
CREATE TABLE IF NOT EXISTS menu_items (
	id SERIAL PRIMARY KEY,
	parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
	label VARCHAR(120) NOT NULL,
	path VARCHAR(255) NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);

-- Mitgliederkonten für Registrierung und Anmeldung
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(30) NOT NULL DEFAULT 'member',
	status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
	email_verified_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ergänzt die Registrierungsfelder auch in einer bereits vorhandenen users-Tabelle.
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (LOWER(email));

-- Seiten, denen Content-Blöcke zugeordnet werden (identifiziert über slug, z.B. "das-sind-wir-1")
CREATE TABLE IF NOT EXISTS pages (
	id SERIAL PRIMARY KEY,
	slug VARCHAR(150) NOT NULL UNIQUE,
	title VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Editierbare Content-Blöcke einer Seite (Text, Bild, YouTube, ...)
-- "data" enthält die je nach block_type unterschiedlichen Felder (z.B. text, image_url/alt, video_id)
CREATE TABLE IF NOT EXISTS content_blocks (
	id SERIAL PRIMARY KEY,
	page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
	block_key VARCHAR(150) NOT NULL,
	block_type VARCHAR(30) NOT NULL CHECK (block_type IN ('text', 'image', 'youtube')),
	sort_order INTEGER NOT NULL DEFAULT 0,
	data JSONB NOT NULL DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (page_id, block_key)
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_page_id ON content_blocks(page_id);

-- Hochgeladene Mediendateien (Bilder etc.), referenzierbar aus content_blocks.data
CREATE TABLE IF NOT EXISTS media (
	id SERIAL PRIMARY KEY,
	filename VARCHAR(255) NOT NULL,
	original_name VARCHAR(255) NOT NULL,
	mime_type VARCHAR(100) NOT NULL,
	size_bytes INTEGER NOT NULL,
	uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger, um updated_at automatisch zu aktualisieren
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_menu_items_updated_at
	BEFORE UPDATE ON menu_items
	FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
	BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pages_updated_at
	BEFORE UPDATE ON pages
	FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_content_blocks_updated_at
	BEFORE UPDATE ON content_blocks
	FOR EACH ROW EXECUTE FUNCTION set_updated_at();
