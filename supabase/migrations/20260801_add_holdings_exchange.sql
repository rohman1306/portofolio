ALTER TABLE holdings ADD COLUMN IF NOT EXISTS exchange text NOT NULL DEFAULT 'IDX';

ALTER TABLE holdings DROP CONSTRAINT IF EXISTS holdings_exchange_check;
ALTER TABLE holdings ADD CONSTRAINT holdings_exchange_check
  CHECK (exchange IN ('IDX', 'Global'));
