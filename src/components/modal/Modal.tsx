import { X } from "lucide-react";
import React from "react";

interface ModalProps {
    title?: string;
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string; // Tailwind width like "max-w-lg"
}

export const Modal = ({title,show,onClose,children,width = "max-w-lg",}: ModalProps) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} p-6`}>
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    );
};