import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 bg-background min-h-screen text-foreground">
        <AppHeader />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
