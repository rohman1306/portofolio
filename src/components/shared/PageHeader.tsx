"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

export default function PageHeader({ title, description, action, onAdd, addLabel }: PageHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {action ?? (onAdd && (
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel ?? t("common.add")}
        </Button>
      ))}
    </div>
  );
}
