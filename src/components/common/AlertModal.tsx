import { ReactNode } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  message: string | ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <Check className="w-6 h-6 text-green-500" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    confirm: <Info className="w-6 h-6 text-blue-500" />
  };

  const typeColorMap = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    confirm: 'bg-blue-50'
  };

  const buttonColorMap = {
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    error: 'bg-red-600 hover:bg-red-700',
    confirm: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className={`px-6 py-4 flex items-center gap-3 ${typeColorMap[type]}`}>
          {iconMap[type]}
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-gray-700 mb-6">
            {message}
          </div>
          
          <div className="flex justify-end gap-3">
            {(type === 'confirm' || onCancel) && (
              <button
                onClick={() => {
                  if (onCancel) onCancel();
                  else onClose();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                else onClose();
              }}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonColorMap[type]} focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}