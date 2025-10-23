import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const page = searchParams.get('page') || '1';
  const per_page = 5; // 需求：默认5条

  // *** 变更点 ***
  // GITHUB_TOKEN 现在是可选的
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo) {
    return NextResponse.json(
      { message: '缺少 owner 或 repo 参数。' },
      { status: 400 }
    );
  }

  // *** 变更点 ***
  // 动态构建 headers
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // *** 变更结束 ***


  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${per_page}&page=${page}`;

    const res = await fetch(url, {
      headers: headers, // 使用动态构建的 headers
    });

    if (!res.ok) {
      const errorData = await res.json();
      // 404 通常意味着没有 releases 或仓库不存在
      if (res.status === 404) {
        return NextResponse.json([], { status: 200 }); // 返回空数组
      }
      return NextResponse.json(
        { message: errorData.message || 'GitHub API 请求失败。' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: `服务器内部错误: ${error.message}` },
      { status: 500 }
    );
  }
}