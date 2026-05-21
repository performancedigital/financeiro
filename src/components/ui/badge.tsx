type BadgeVariant = "green" | "red" | "amber" | "blue" | "gray" | "purple";

const variants: Record<BadgeVariant, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  red: "bg-red-100 text-red-800 border-red-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  gray: "bg-zinc-100 text-zinc-700 border-zinc-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

export function Badge({
  label,
  variant = "gray",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {label}
    </span>
  );
}

export const receivableStatusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING:     { label: "Pendente",     variant: "amber" },
    PAID:        { label: "Pago",         variant: "green" },
    PARTIAL:     { label: "Pago parcial", variant: "blue"  },
    OVERDUE:     { label: "Atrasado",     variant: "red"   },
    CANCELED:    { label: "Cancelado",    variant: "gray"  },
    RENEGOTIATED:{ label: "Renegociado",  variant: "purple"},
  };
  const m = map[status] ?? { label: status, variant: "gray" as BadgeVariant };
  return <Badge label={m.label} variant={m.variant} />;
};

export const payableStatusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    OPEN:        { label: "Aberto",       variant: "amber" },
    PAID:        { label: "Pago",         variant: "green" },
    OVERDUE:     { label: "Atrasado",     variant: "red"   },
    INSTALMENT:  { label: "Parcelado",    variant: "blue"  },
    RENEGOTIATED:{ label: "Renegociado",  variant: "purple"},
    SUSPENDED:   { label: "Suspenso",     variant: "gray"  },
  };
  const m = map[status] ?? { label: status, variant: "gray" as BadgeVariant };
  return <Badge label={m.label} variant={m.variant} />;
};

export const clientStatusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    ACTIVE:     { label: "Ativo",        variant: "green"  },
    STANDBY:    { label: "Standby",      variant: "amber"  },
    DELINQUENT: { label: "Inadimplente", variant: "red"    },
    CANCELED:   { label: "Cancelado",    variant: "gray"   },
    PROSPECT:   { label: "Prospect",     variant: "blue"   },
  };
  const m = map[status] ?? { label: status, variant: "gray" as BadgeVariant };
  return <Badge label={m.label} variant={m.variant} />;
};
