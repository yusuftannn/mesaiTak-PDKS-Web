type Props = {
  title: string;
  value: number;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
