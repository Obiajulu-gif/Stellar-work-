"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ title, description, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center sm:px-6 sm:py-12 ${className}`.trim()}
    >
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
