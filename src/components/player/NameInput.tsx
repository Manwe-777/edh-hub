export function NameInput({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  return (
    <input
      className="name-input"
      value={name}
      maxLength={24}
      aria-label="Name"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}
