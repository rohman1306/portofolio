ALTER TABLE courses ADD COLUMN IF NOT EXISTS kategori text NOT NULL DEFAULT 'Lokal';

ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_kategori_check;
ALTER TABLE courses ADD CONSTRAINT courses_kategori_check
  CHECK (kategori IN ('Lokal', 'Luar'));
