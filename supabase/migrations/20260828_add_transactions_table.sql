CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DCA', 'JUAL')),
  tanggal DATE NOT NULL,
  jumlah_unit NUMERIC(16, 4) NOT NULL,
  harga_per_unit NUMERIC(18, 2) NOT NULL,
  harga_per_unit_currency TEXT NOT NULL DEFAULT 'IDR',
  total_idr NUMERIC(18, 2) NOT NULL,
  total_display NUMERIC(18, 2) NOT NULL,
  display_currency TEXT NOT NULL DEFAULT 'IDR',
  pnl NUMERIC(18, 2),
  pnl_percent NUMERIC(8, 2),
  avg_price_before NUMERIC(18, 2),
  avg_price_after NUMERIC(18, 2),
  avg_price_after_currency TEXT,
  is_withdrawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_holding_id ON transactions(holding_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
