export default function TagChip({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700">
      {label}
    </span>
  );
}
