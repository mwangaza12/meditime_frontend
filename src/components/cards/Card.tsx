import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-slate-200 ${className}`}>
      {children}
    </div>
  );
};
