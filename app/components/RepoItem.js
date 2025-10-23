'use client';

import { useState } from 'react';

// 辅助函数：格式化文件大小
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function RepoItem({ repo }) {
  // 状态：是否展开、Releases 列表、加载状态、错误、分页
  const [isOpen, setIsOpen] = useState(false); // 需求：默认折叠
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // 是否有更多 release 可加载

  const releasesPerPage = 5; // 需求：Release 列表默认5条

  // 获取 Releases
  const fetchReleases = async (pageNum) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/releases?owner=${repo.owner.login}&repo=${repo.name}&page=${pageNum}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.length > 0) {
        setReleases(data);
        setPage(pageNum);
        // 如果返回的条目数小于请求的条目数，说明没有更多了
        setHasMore(data.length === releasesPerPage); 
      } else {
        setReleases([]);
        setHasMore(false);
        if (pageNum === 1) {
          setError('未找到 Releases。');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 点击折叠/展开
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // 如果是第一次展开，则获取数据
    if (newIsOpen && releases.length === 0) {
      fetchReleases(1);
    }
  };

  // Release 分页
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchReleases(newPage);
  };

  return (
    <li className="repo-item">
      {/* 使用 <summary> 和 <details> 语义化标签，但通过 state 控制
        为了防止默认行为和 state 冲突，我们阻止 <summary> 的默认点击事件
      */}
      <details open={isOpen}>
        <summary
          className="repo-summary"
          onClick={(e) => {
            e.preventDefault(); // 阻止 <details> 标签的默认行为
            handleToggle(); // 使用我们自己的 state 控制
          }}
        >
          <span>{repo.full_name}</span>
          <span>{isOpen ? '折叠' : '展开'}</span>
        </summary>

        {/* 仅在展开时渲染内容 */}
        {isOpen && (
          <div className="repo-details">
            {loading && <p className="loading">正在加载 Releases...</p>}
            {error && <p className="error">{error}</p>}
            
            {!loading && releases.length > 0 && (
              <>
                <ul className="release-list">
                  {releases.map((release) => (
                    <li key={release.id} className="release-item">
                      <h4>{release.name || release.tag_name}</h4>
                      <p>{release.body?.substring(0, 150) || 'No description'}...</p>
                      
                      <strong>下载资源:</strong>
                      {release.assets.length > 0 ? (
                        release.assets.map((asset) => (
                          // 需求: a 标签点击下载
                          <a
                            key={asset.id}
                            href={asset.browser_download_url}
                            target="_blank" // 在新标签页打开下载
                            rel="noopener noreferrer"
                          >
                            {asset.name} ({formatBytes(asset.size)})
                          </a>
                        ))
                      ) : (
                        <p>此 Release 没有可下载的资源。</p>
                      )}
                    </li>
                  ))}
                </ul>
                
                {/* Release 分页 */}
                <div className="pagination-releases">
                  <button 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1 || loading}
                  >
                    上一页
                  </button>
                  <span>第 {page} 页</span>
                  <button 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={!hasMore || loading}
                  >
                    下一页
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </details>
    </li>
  );
}