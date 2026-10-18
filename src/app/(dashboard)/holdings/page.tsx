"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HoldingsHeader from "@/features/holdings/components/HoldingsHeader";
import HoldingsStats from "@/features/holdings/components/HoldingsStats";
import HoldingsList from "@/features/holdings/components/HoldingsList";
import HoldingsEmpty from "@/features/holdings/components/HoldingsEmpty";
import HoldingDialog from "@/features/holdings/components/HoldingDialog";
import TransactionDialog from "@/features/holdings/components/TransactionDialog";
import TransactionHistory from "@/features/transactions/components/TransactionHistory";
import AllTransactionsHistory from "@/features/transactions/components/AllTransactionsHistory";
import {
  useHoldingsQuery,
  useCreateHoldingMutation,
  useUpdateHoldingMutation,
  useDeleteHoldingMutation,
} from "@/features/holdings/hooks/useHoldingQuery";
import { usePriceSync } from "@/contexts/PriceSyncContext";
import { Holding, HoldingFormData } from "@/features/holdings/types/holding";
import { useLanguage } from "@/contexts/LanguageContext";
import { HoldingsTableSkeleton, StatsGridSkeleton } from "@/components/shared/Skeleton";

export default function HoldingsPage() {
  const { t } = useLanguage();
  const { data: holdings = [], isLoading } = useHoldingsQuery();
  const { refreshPrices, refreshing } = usePriceSync();
  const createHolding = useCreateHoldingMutation();
  const updateHolding = useUpdateHoldingMutation();
  const deleteHolding = useDeleteHoldingMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  const addHolding = async (data: HoldingFormData) => createHolding.mutateAsync(data);
  const editHolding = async (id: string, data: Partial<Holding>) => {
    const updated = await updateHolding.mutateAsync({ id, data });
    return updated;
  };
  const removeHolding = async (id: string) => {
    await deleteHolding.mutateAsync(id);
    return true;
  };

  const handleRefresh = async () => {
    await refreshPrices();
  };

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txHolding, setTxHolding] = useState<Holding | null>(null);
  const [txMode, setTxMode] = useState<"DCA" | "JUAL" | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingHolding(null);
    setDialogOpen(true);
  };

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("holdings.deleteConfirm"))) {
      if (selectedHoldingId === id) setSelectedHoldingId(null);
      await removeHolding(id);
    }
  };

  const handleDca = (holding: Holding) => {
    setTxHolding(holding);
    setTxMode("DCA");
    setTxDialogOpen(true);
  };

  const handleSell = (holding: Holding) => {
    setTxHolding(holding);
    setTxMode("JUAL");
    setTxDialogOpen(true);
  };

  const handleSubmit = async (data: HoldingFormData) => {
    if (editingHolding) {
      await editHolding(editingHolding.id, data);
    } else {
      await addHolding(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <StatsGridSkeleton />
        <HoldingsTableSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <HoldingsHeader onAdd={handleAdd} onRefresh={handleRefresh} refreshing={refreshing} />
      <HoldingsStats holdings={holdings} />

      {holdings.length === 0 && !selectedHoldingId ? (
        <HoldingsEmpty />
      ) : (
        <>
          {holdings.length > 0 && (
            <HoldingsList
              holdings={holdings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDca={handleDca}
              onSell={handleSell}
              onSelect={setSelectedHoldingId}
              selectedHoldingId={selectedHoldingId}
            />
          )}

          {selectedHoldingId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionHistory holdingId={selectedHoldingId} />
            </motion.div>
          )}
        </>
      )}

      <AllTransactionsHistory />

      <HoldingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        editingHolding={editingHolding}
      />

      <TransactionDialog
        open={txDialogOpen}
        onOpenChange={setTxDialogOpen}
        holding={txHolding}
        mode={txMode}
        onSuccess={(updated) => {
          if (updated) setSelectedHoldingId(updated.id);
          else if (txHolding) setSelectedHoldingId(txHolding.id);
        }}
        editHolding={editHolding as (id: string, data: Partial<Holding>) => Promise<Holding | null>}
        removeHolding={removeHolding as (id: string) => Promise<boolean>}
      />
    </motion.div>
  );
}
