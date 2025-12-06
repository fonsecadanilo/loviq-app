import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  // Auto-dismiss timer
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="w-4 h-4 text-green-600 stroke-[3]" />,
          bgIcon: 'bg-green-100/80',
          textColor: 'text-slate-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600 stroke-[2.5]" />,
          bgIcon: 'bg-red-100/80',
          textColor: 'text-slate-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600 stroke-[2.5]" />,
          bgIcon: 'bg-yellow-100/80',
          textColor: 'text-slate-800'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-600 stroke-[2.5]" />,
          bgIcon: 'bg-blue-100/80',
          textColor: 'text-slate-800'
        };
    }
  };

  const config = getConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          className="fixed top-24 right-8 z-[100] bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-lg shadow-lg shadow-slate-200/50 px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-sm"
        >
          <div className={`${config.bgIcon} p-1.5 rounded-full flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

