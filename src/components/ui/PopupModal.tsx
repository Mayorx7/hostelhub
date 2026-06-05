import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export function PopupModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
}: PopupModalProps) {
  if (!isOpen) return null;

  const types = {
    danger: {
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      btnBg: "bg-orange-600 hover:bg-orange-700",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      btnBg: "bg-green-600 hover:bg-green-700",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      btnBg: "bg-[#5C2200] hover:bg-[#7A3010]",
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#e8dcd7] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1 pt-1 pr-4">
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#fdf7f4] px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e8dcd7]">
          {onConfirm && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm ? onConfirm : onClose}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${config.btnBg}`}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText || (onConfirm ? "Confirm" : "Okay")}
          </button>
        </div>
      </div>
    </div>
  );
}
