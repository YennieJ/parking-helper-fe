import React from 'react';
import { useMembers, useMyInfo, useUpdateMember } from './useMember';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 회원 정보 조회 사용 예시 컴포넌트
 */
const MemberExample: React.FC = () => {
  const { user } = useAuth();

  // 1. 내 정보 조회 (편의성 훅)
  const {
    data: myInfo,
    isLoading: myInfoLoading,
    error: myInfoError,
  } = useMyInfo();

  // 2. 특정 조건으로 회원 목록 조회 (예: 차량번호로 검색)
  const { data: membersWithCar, isLoading: membersLoading } = useMembers({
    carNumber: '10저3519',
  });

  // 3. 이름으로 회원 검색
  const { data: membersByName } = useMembers({
    memberName: '박주현',
  });

  // 4. 상태별 회원 조회
  const { data: membersByStatus } = useMembers({
    Status: 'Active',
  });

  // 5. 모든 회원 조회 (파라미터 없음)
  const { data: allMembers } = useMembers();

  // 6. 회원 정보 업데이트
  const updateMember = useUpdateMember();

  const handleUpdateCarNumber = () => {
    if (user?.memberId) {
      updateMember.mutate({
        id: user.memberId.toString(),
        data: { carNumber: '12가3456' },
      });
    }
  };

  if (myInfoLoading) return <div>내 정보 로딩 중...</div>;
  if (myInfoError) return <div>에러 발생</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">회원 정보 조회 예시</h1>

      {/* 내 정보 표시 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">내 정보</h2>
        {myInfo && (
          <div className="space-y-2">
            <p>
              <strong>이름:</strong> {myInfo.name}
            </p>
            <p>
              <strong>사원번호:</strong> {myInfo.memberLoginId}
            </p>
            <p>
              <strong>이메일:</strong> {myInfo.email}
            </p>
            <p>
              <strong>차량번호:</strong> {myInfo.cars[0]?.carNumber || '없음'}
            </p>

            {/* 요청 히스토리 */}
            <div className="mt-4">
              <h3 className="font-medium">
                도움 요청 히스토리 ({myInfo.requestHelpHistory.length}건)
              </h3>
              <div className="space-y-2 mt-2">
                {myInfo.requestHelpHistory.map((request) => (
                  <div
                    key={request.id}
                    className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50"
                  >
                    <div className="text-sm">
                      <span className="font-medium">요청일:</span>{' '}
                      {new Date(request.reqDate).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">상태:</span>{' '}
                      {request.status}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">총 건수:</span>{' '}
                      {request.totalDisCount}건 /
                      <span className="font-medium"> 처리된 건수:</span>{' '}
                      {request.applyDisCount}건
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      세부 내역: {request.helpDetails.length}개
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 제안 히스토리 */}
            <div className="mt-4">
              <h3 className="font-medium">
                도움 제안 히스토리 ({myInfo.helpOfferHistory.length}건)
              </h3>
              <div className="space-y-2 mt-2">
                {myInfo.helpOfferHistory.map((offer) => (
                  <div
                    key={offer.id}
                    className="border-l-4 border-green-500 pl-3 py-2 bg-green-50"
                  >
                    <div className="text-sm">
                      <span className="font-medium">상태:</span> {offer.status}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">서비스 날짜:</span>{' '}
                      {offer.helperServiceDate
                        ? new Date(offer.helperServiceDate).toLocaleDateString(
                            'ko-KR'
                          )
                        : '미정'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">총 할인권:</span>{' '}
                      {offer.discountTotalCount}건 /
                      <span className="font-medium"> 사용된 할인권:</span>{' '}
                      {offer.discountApplyCount}건
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      세부 내역: {offer.helpOfferDetail.length}개
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleUpdateCarNumber}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={updateMember.isPending}
        >
          {updateMember.isPending ? '업데이트 중...' : '차량번호 업데이트'}
        </button>
      </div>

      {/* 차량번호로 검색된 회원들 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">
          차량번호로 검색 (10저3519)
        </h2>
        {membersLoading ? (
          <div>로딩 중...</div>
        ) : membersWithCar && membersWithCar.length > 0 ? (
          <div className="space-y-4">
            {membersWithCar.map((member) => (
              <div key={member.id} className="border p-3 rounded">
                <p>
                  <strong>이름:</strong> {member.name}
                </p>
                <p>
                  <strong>사원번호:</strong> {member.memberLoginId}
                </p>
                <p>
                  <strong>차량번호:</strong>{' '}
                  {member.cars[0]?.carNumber || '없음'}
                </p>
                <p>
                  <strong>요청 히스토리:</strong>{' '}
                  {member.requestHelpHistory.length}건
                </p>
                <p>
                  <strong>제안 히스토리:</strong>{' '}
                  {member.helpOfferHistory.length}건
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div>검색 결과 없음</div>
        )}
      </div>

      {/* 검색 옵션들 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">검색 옵션 예시</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">이름으로 검색 결과</h3>
            <p>박주현: {membersByName?.length || 0}명</p>
          </div>
          <div>
            <h3 className="font-medium">상태별 검색 결과</h3>
            <p>Active: {membersByStatus?.length || 0}명</p>
          </div>
          <div>
            <h3 className="font-medium">전체 회원</h3>
            <p>총 {allMembers?.length || 0}명</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberExample;
