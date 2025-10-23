'use client'; // 这是一个客户端组件，因为它需要状态和事件处理

import { useState } from 'react';
import RepoItem from './components/RepoItem';
import Pagination from './components/Pagination';

export default function Home() {
  // 状态管理
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 20; // 需求：默认20条

  // 密码验证
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // *** 变更点 ***
    // 从环境变量中获取密码
    const correctPassword = process.env.NEXT_PUBLIC_ACCESS_PSSSWD;

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('密码错误，请重试。');
    }
  };

  // 搜索仓库
  const handleSearch = async (page = 1) => {
    if (!searchTerm) {
      setError('请输入搜索词。');
      setRepos([]);
      return;
    }

    setLoading(true);
    setError(null);
    setRepos([]); // 清空旧结果

    try {
      // 调用我们自己的 API 路由
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&page=${page}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.items) {
        setRepos(data.items);
        setTotalResults(data.total_count);
        setCurrentPage(page);
      } else {
        setError(data.message || '未能获取仓库。');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 搜索表单提交
  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(1); // 始终从第一页开始新搜索
  };

  // 分页更改
  const onPageChange = (newPage) => {
    handleSearch(newPage);
  };

  // 渲染密码表单
  if (!isAuthenticated) {
    return (
      <main>
        <h1>请输入访问密码</h1>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoFocus
          />
          <button type="submit">登录</button>
          {authError && <p className="error">{authError}</p>}
        </form>
      </main>
    );
  }

  // 渲染主应用界面
  return (
    <main>
      <h1>GitHub Release Viewer</h1>
      <form onSubmit={onSearchSubmit} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索仓库名称..."
        />
        <button type="submit" disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && !error && <p className="loading">正在加载仓库...</p>}

      {repos.length > 0 && (
        <>
          <ul className="repo-list">
            {repos.map((repo) => (
              <RepoItem key={repo.id} repo={repo} />
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalItems={totalResults}
            itemsPerPage={resultsPerPage}
            onPageChange={onPageChange}
          />
        </>
      )}

      {totalResults === 0 && !loading && !error && searchTerm && (
        <p>未找到与 "{searchTerm}" 相关的仓库。</p>
      )}
    </main>
  );
}