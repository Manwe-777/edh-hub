export function NameInput({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  return (
    <input
      className="h-11 min-w-0 flex-1 rounded-none bg-transparent p-0 text-[22px] font-medium focus:bg-transparent focus:shadow-[0_1px_0_var(--color-muted)]"
      value={name}
      maxLength={24}
      aria-label="Name"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}
