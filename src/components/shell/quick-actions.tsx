type QuickActionsProps = {
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onUploadDocument?: () => void;
};

export function QuickActions({
  onAddIncome,
  onAddExpense,
  onUploadDocument,
}: QuickActionsProps) {
  const noop = () => undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAddIncome ?? noop}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        + Entrada
      </button>
      <button
        type="button"
        onClick={onAddExpense ?? noop}
        className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
      >
        + Saida
      </button>
      <button
        type="button"
        onClick={onUploadDocument ?? noop}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
      >
        Upload documento
      </button>
    </div>
  );
}
