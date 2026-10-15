import React from "react";

export default function DedicatedExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {children}
    </div>
  );
}
