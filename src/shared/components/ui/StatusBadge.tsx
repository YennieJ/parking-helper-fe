interface StatusBadgeProps {
  status: 'Waiting' | 'Check' | 'Completed';
  className?: string;
  count?: number;
}

const StatusBadge = ({ status, className = '', count }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Waiting':
        return {
          text: '대기중',
          className: 'bg-yellow-400',
        };
      case 'Check':
        return {
          text: '진행중',
          className: 'bg-orange-400',
        };
      case 'Completed':
        return {
          text: '완료',
          className: 'bg-green-600',
        };
      default:
        return {
          text: '대기중',
          className: 'bg-gray-200 text-gray-800',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full text-white font-bold ${config.className} ${className}`}
    >
      {config.text}
      {count !== undefined && ` ${count}`}
    </span>
  );
};

export default StatusBadge;
