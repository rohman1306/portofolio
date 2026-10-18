ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_kategori_check;

UPDATE courses SET kategori = 'Saham' WHERE kategori IN ('Lokal', 'Luar');

ALTER TABLE courses ALTER COLUMN kategori SET DEFAULT 'Crypto';

ALTER TABLE courses ADD CONSTRAINT courses_kategori_check
  CHECK (kategori IN ('Crypto', 'Saham', 'Forex'));