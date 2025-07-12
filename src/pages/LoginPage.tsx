import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeNumber) {
      setError('사원번호를 입력해주세요.');
      return;
    }

    try {
      const success = await login(employeeNumber);

      if (success) {
        // 로그인 성공 시 홈으로 이동
        navigate('/', { replace: true });
      } else {
        setError('사원번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 앱 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-6 shadow-xl">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">주차 도우미</h1>
          <p className="text-primary-100 text-lg">
            함께 만드는 편리한 주차 문화
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                사원번호
              </label>
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                className="input-field"
                placeholder="사원번호를 입력해주세요."
                disabled={isLoading}
              />
              <p className="text-red-700 font-medium mt-2">{error}</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 테스트 계정 안내 */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <h3 className="text-sm font-semibold text-primary-800 mb-3">
              💡 테스트 계정
            </h3>
            <div className="text-xs text-primary-700 space-y-1">
              <div>• 사원번호: EMP001 ~ EMP005</div>
              <div className="text-primary-600 mt-2">예: EMP001 (김철수)</div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-primary-100 text-sm">
            © 2024 주차 도우미. 모든 권리 보유.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
