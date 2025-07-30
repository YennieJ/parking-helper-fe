export default function CardContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white rounded-lg shadow-sm p-4">{children}</div>;
}
