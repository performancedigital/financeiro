"use client";

type ModalProps = {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
};

export function Modal({ title, onClose, maxWidth = "max-w-2xl", children }: ModalProps) {
  return (
    <div className="cc-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`cc-modal w-full ${maxWidth}`}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
