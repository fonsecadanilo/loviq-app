import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  noPadding?: boolean;
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  hideHeader = false,
  noPadding = false,
  title,
  description,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm"
            onClick={() => closeOnOverlayClick && onClose()}
          />

          {/* Sheet Container */}
          <div className="fixed inset-0 z-[70] flex items-stretch pointer-events-none overflow-hidden">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className={`pointer-events-auto relative ml-auto flex h-full w-full max-w-[640px] flex-col bg-white shadow-2xl border-l border-slate-100 ${className}`}
            >
              {!hideHeader && (
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
                  <div>
                    {title && (
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-sm text-slate-500 mt-1">{description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-6'}`}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Sheet;





