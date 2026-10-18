"use client";

interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

export default function PageTitle({ children, subtitle }: PageTitleProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">{children}</h1>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
