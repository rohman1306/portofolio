"use client";

import dynamic from "next/dynamic";

const SettingsContent = dynamic(
  () => import("@/features/settings/components/SettingsContent"),
  { ssr: false }
);

export default function SettingsPage() {
  return <SettingsContent />;
}
