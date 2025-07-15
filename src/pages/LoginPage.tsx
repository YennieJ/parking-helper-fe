import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogin } from '../hooks/useLogin';
import { useToast } from '../components/Toast';
import { MESSAGES } from '../utils/messages';

const LoginPage: React.FC = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [error, setError] = useState('');
  const { setLoginUser, setLoggingIn } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin((userData) => {
    setLoginUser(userData);
  });
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeNumber) {
      setError('사원번호를 입력해주세요.');
      return;
    }

    setLoggingIn(true);
    try {
      await loginMutation.mutateAsync({
        memberLoginId: employeeNumber,
      });

      // 성공 메시지 표시
      showSuccess(MESSAGES.AUTH.LOGIN_SUCCESS);

      // 홈으로 이동
      navigate('/', { replace: true });
    } catch (error: any) {
      // 응답 데이터에서 Result 필드 확인
      if (error?.response?.data?.Result === 'Login Fail') {
        setError('사원번호가 올바르지 않습니다.');
      } else {
        // 다른 오류 (네트워크/서버 문제 등)
        setError('문제가 생겼습니다. 관리자에게 연락해주세요.');
      }
    } finally {
      setLoggingIn(false);
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
                disabled={loginMutation.isPending}
              />
              <p className="text-red-700 font-medium mt-2">{error}</p>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full text-lg"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 로그인 안내 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-lg">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  로그인 안내
                </h3>
                <div className="text-xs text-green-700 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>우리 회사 사원번호로 로그인하세요</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>
                      사원번호가 기억나지 않으시면 관리자(사원)에게 문의해주세요
                    </span>
                  </div>
                </div>
              </div>
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
