import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className = '',
  maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all ${className}`}
      >
        {/* Header */}
        {(title || description) && (
            <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between">
                <div>
                    {title && (
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-sm text-slate-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors absolute right-4 top-4"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

