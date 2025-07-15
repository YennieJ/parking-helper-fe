/**
 * 한국 시간으로 변환하는 유틸리티 함수
 * @param dateString - 변환할 날짜 문자열
 * @returns 한국 시간 형식의 문자열 (HH:MM)
 */
export const formatToKoreanTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const koreanTime = new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(date);

    return koreanTime;
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return dateString; // 변환 실패시 원본 반환
  }
};
