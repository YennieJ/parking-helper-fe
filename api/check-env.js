// api/check-env.js
export default async function handler(req, res) {
    const slackToken = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_CHANNEL;
    const dbUrl = process.env.DATABASE_URL;
    const paymentKey = process.env.PAYMENT_KEY;

    // 환경변수 상태 확인
    const envStatus = {
        SLACK_BOT_TOKEN: slackToken ? '✅ 설정됨' : '❌ 미설정',
        SLACK_CHANNEL: channel ? '✅ 설정됨' : '❌ 미설정',
        DATABASE_URL: dbUrl ? '✅ 설정됨' : '❌ 미설정',
        PAYMENT_KEY: paymentKey ? '✅ 설정됨' : '❌ 미설정'
    };

    console.log('환경 변수 상태:', envStatus);

    res.status(200).json({
        message: '환경 변수 확인 완료',
        environment: envStatus,
        timestamp: new Date().toISOString()
    });
} 