import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EditProfileModal from '../components/EditProfileModal';

const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!user) return null;

  const monthlyStats = {
    helpRequests: 3,
    helpOffers: 5,
    completedHelps: 8,
  };

  const myRequests = [
    { id: '1', time: '08:30', status: '예약됨', reservedBy: '이영희' },
    { id: '2', time: '어제', status: '완료됨', reservedBy: '박민수' },
  ];

  const myOffers = [{ id: '1', time: '08:40', status: '대기중' }];

  const myReservations = [
    { id: '1', type: '차량 등록 요청하기', user: '박민수', time: '진행중' },
  ];

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">내 페이지</h1>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 사용자 프로필 카드 */}
        <div className="card bg-gradient-to-r from-primary-500 to-emerald-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-primary-100 font-medium">{user.carNumber}</p>
                <p className="text-primary-200 text-sm">
                  {user.employeeNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <span className="text-lg">✏️</span>
              <span className="hidden sm:inline">수정</span>
            </button>
          </div>
        </div>

        {/* 이번 달 활동 통계 */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-xl">📊</span>
            이번 달 활동
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {monthlyStats.helpRequests}
              </div>
              <div className="text-sm text-blue-700 font-medium">도움 요청</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {monthlyStats.helpOffers}
              </div>
              <div className="text-sm text-primary-700 font-medium">
                도움 제안
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {monthlyStats.completedHelps}
              </div>
              <div className="text-sm text-purple-700 font-medium">
                완료 처리
              </div>
            </div>
          </div>
        </div>

        {/* 내가 올린 요청 */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🆘</span>
            내가 올린 요청 ({myRequests.length}건)
          </h3>
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {request.time} 등록
                  </div>
                  <div className="text-sm text-gray-600">
                    {request.status === '예약됨'
                      ? `${request.reservedBy}님이 예약`
                      : request.status}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    request.status === '예약됨'
                      ? 'bg-blue-500 text-white'
                      : 'bg-primary-500 text-white'
                  }`}
                >
                  {request.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 내가 올린 제안 */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🙋‍♂️</span>
            내가 올린 제안 ({myOffers.length}건)
          </h3>
          <div className="space-y-3">
            {myOffers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-2xl border border-primary-100"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {offer.time} 등록
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl text-xs font-bold bg-yellow-500 text-white">
                  {offer.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 내가 예약한 것 */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            내가 예약한 것 ({myReservations.length}건)
          </h3>
          <div className="space-y-3">
            {myReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {reservation.user}님 {reservation.type}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reservation.time}
                  </div>
                </div>
                <button className="btn-secondary text-sm px-4 py-2">
                  완료하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">로그아웃</h2>
              <p className="text-gray-600 mb-8">정말 로그아웃 하시겠습니까?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn-outline flex-1"
                >
                  취소
                </button>
                <button onClick={handleLogout} className="btn-danger flex-1">
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 수정 모달 */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedData) => {
            // 개인정보 업데이트 로직
            console.log('Updated profile:', updatedData);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MyPage;
