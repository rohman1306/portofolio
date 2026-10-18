ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_kategori_check;

ALTER TABLE goals ADD CONSTRAINT goals_kategori_check
  CHECK (kategori IN ('Profit', 'Portofolio', 'Alokasi', 'Pembelajaran', 'Dream'));
