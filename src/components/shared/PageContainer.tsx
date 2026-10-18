"use client";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`space-y-6 pb-8 ${className}`}>
      {children}
    </div>
  );
}
