type FiltersBarProps = {
  month?: string;
  account?: string;
  category?: string;
  client?: string;
  costCenter?: string;
};

const SelectField = ({
  name,
  value,
  options,
}: {
  name: string;
  value?: string;
  options: string[];
}) => (
  <label className="flex min-w-[150px] flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{name}</span>
    <select
      defaultValue={value ?? "Todos"}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 outline-none ring-blue-500 focus:ring-2"
    >
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </label>
);

export function FiltersBar(props: FiltersBarProps) {
  return (
    <div className="cc-card p-3">
      <div className="flex flex-wrap gap-3">
        <SelectField
          name="Mes"
          value={props.month}
          options={["Todos", "2026-05", "2026-04", "2026-03"]}
        />
        <SelectField
          name="Conta"
          value={props.account}
          options={["Todos", "Sicoob pessoal", "InfinitePay empresa", "Nubank compartilhado"]}
        />
        <SelectField
          name="Categoria"
          value={props.category}
          options={["Todos", "Receita de cliente", "Equipe", "Ferramentas", "Impostos"]}
        />
        <SelectField
          name="Cliente"
          value={props.client}
          options={["Todos", "Educaminas", "Bias Centro Educacional", "Sao Lucas"]}
        />
        <SelectField
          name="Centro de custo"
          value={props.costCenter}
          options={["Todos", "Agencia", "Casa", "Pessoal Helbert", "Projeto especifico"]}
        />
      </div>
    </div>
  );
}
