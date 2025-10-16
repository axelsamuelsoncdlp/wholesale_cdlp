-- Create shops table in Supabase
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create linesheet_presets table
CREATE TABLE IF NOT EXISTS linesheet_presets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  price_source TEXT NOT NULL,
  season TEXT,
  header_title TEXT,
  layout_style TEXT DEFAULT 'two-column-compact',
  products JSONB NOT NULL,
  cover_image_url TEXT,
  field_toggles JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- Create index on shop_id for better performance
CREATE INDEX IF NOT EXISTS idx_linesheet_presets_shop_id ON linesheet_presets(shop_id);

-- Enable Row Level Security (RLS)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE linesheet_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict these later)
CREATE POLICY "Enable all access for shops" ON shops FOR ALL USING (true);
CREATE POLICY "Enable all access for linesheet_presets" ON linesheet_presets FOR ALL USING (true);
