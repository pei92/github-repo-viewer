'use client';

import { useState } from 'react';
import RepoItem from './components/RepoItem';
import Pagination from './components/Pagination';

export default function Home() {
  // ... 保持其他状态不变 ...
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
  const resultsPerPage = 20;

  // 密码验证
  const handlePasswordSubmit = async (e) => { // 更改为 async
    e.preventDefault();
    setAuthError(''); // 清除旧错误

    try {
      // *** 变更点 ***: 向新的服务器端 API 路由发送请求
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        // API 返回的错误信息
        setAuthError(data.message || '登录失败，请检查网络或稍后重试。');
      }
    } catch (err) {
      console.error('认证网络错误:', err);
      setAuthError('网络错误，无法连接到服务器。');
    }
  };

  // ... 保持 handleSearch, onSearchSubmit, onPageChange 不变 ...
  const handleSearch = async (page = 1) => {
    // ... (保持不变) ...
    if (!searchTerm) {
      setError('请输入搜索词。');
      setRepos([]);
      return;
    }

    setLoading(true);
    setError(null);
    setRepos([]);

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
    handleSearch(1);
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
    // ... (保持不变) ...
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