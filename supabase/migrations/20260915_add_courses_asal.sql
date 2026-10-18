ALTER TABLE courses ADD COLUMN IF NOT EXISTS asal text NOT NULL DEFAULT 'Lokal';

ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_asal_check;
ALTER TABLE courses ADD CONSTRAINT courses_asal_check
  CHECK (asal IN ('Lokal', 'Luar'));