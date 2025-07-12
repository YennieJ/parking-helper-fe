// api/test.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 환경 변수 사용 (VITE_ 접두사 없음)
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const dbUrl = process.env.DATABASE_URL;
  const paymentKey = process.env.PAYMENT_KEY;

  // 로컬 테스트용 로그
  console.log('환경 변수 확인:', {
    slackToken: slackToken ? '✅ 존재' : '❌ 없음',
    dbUrl: dbUrl ? '✅ 존재' : '❌ 없음',
    paymentKey: paymentKey ? '✅ 존재' : '❌ 없음',
  });

  res.status(200).json({
    message: '테스트 성공!',
    env: {
      slackToken: slackToken ? '설정됨' : '미설정',
      dbUrl: dbUrl ? '설정됨' : '미설정',
      paymentKey: paymentKey ? '설정됨' : '미설정',
    },
  });
}
