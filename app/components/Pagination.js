'use client';

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  // GitHub API 限制：搜索结果最多只返回 1000 条
  const maxItems = 1000;
  const effectiveTotalItems = Math.min(totalItems, maxItems);
  const totalPages = Math.ceil(effectiveTotalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null; // 如果只有一页或没有结果，不显示分页
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        上一页
      </button>
      
      <span>
        第 {currentPage} 页 / 共 {totalPages} 页
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    </div>
  );
}