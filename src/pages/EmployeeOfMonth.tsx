import React from 'react';
import Header from '../components/Header';

const EmployeeOfMonth: React.FC = () => {
  // 임시 랭킹 데이터
  const rankings = [
    { rank: 1, name: '김철수', completedCount: 15, carNumber: '12가 3456' },
    { rank: 2, name: '이영희', completedCount: 12, carNumber: '34나 1234' },
    { rank: 3, name: '박민수', completedCount: 10, carNumber: '56다 7890' },
    { rank: 4, name: '정수민', completedCount: 8, carNumber: '78라 5678' },
    { rank: 5, name: '최영수', completedCount: 5, carNumber: '90마 9012' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '👤';
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <Header
        title={`${getCurrentMonth()} 이달의 사원`}
        icon="🏆"
        subtitle="주차 도움을 가장 많이 완료한 직원들입니다"
      />

      <div className="p-4 space-y-4  md:max-w-[700px] mx-auto">
        {rankings.map((employee) => (
          <div
            key={employee.rank}
            className={`card border-2 ${getRankBg(employee.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getRankIcon(employee.rank)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">
                      {employee.rank}위
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {employee.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {employee.carNumber}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {employee.completedCount}
                </div>
                <div className="text-sm text-gray-600">건 완료</div>
              </div>
            </div>

            {/* 1위만 특별 효과 */}
            {employee.rank === 1 && (
              <div className="mt-3 pt-3 border-t border-yellow-300">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
                    🎉 이달의 최고 주차 도움 완료자 🎉
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 격려 메시지 */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              함께 만드는 더 나은 주차 환경
            </h3>
            <p className="text-sm text-blue-700">
              서로 도우며 더 편리한 주차 문화를 만들어가요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOfMonth;
