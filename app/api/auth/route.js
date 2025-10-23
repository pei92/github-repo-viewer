// app/api/auth/route.js

// 注意：此文件是运行在服务器端的，因此可以安全地访问非 NEXT_PUBLIC_ 的环境变量。

/**
 * 处理 POST 请求进行密码验证
 * @param {Request} request
 */
export async function POST(request) {
  try {
    const { password } = await request.json();

    // 从服务器端环境变量中安全地获取密码
    // 只有在服务器端才能访问 ACCESS_PSSSWD
    const correctPassword = process.env.ACCESS_PSSSWD;

    // 建议：在生产环境中，使用更安全的认证机制，如 OAuth, JWT 或 Session。
    // 这里的简单比较仅用于演示如何将密码逻辑转移到服务器端。
    if (password === correctPassword) {
      // 密码匹配成功
      // 实际应用中，您可能还会设置一个 Session 或返回一个用于后续请求的 JWT
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // 密码错误
      return new Response(JSON.stringify({ success: false, message: '密码错误，请重试。' }), {
        status: 401, // 401 Unauthorized
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('认证请求出错:', error);
    return new Response(JSON.stringify({ success: false, message: '服务器错误。' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}