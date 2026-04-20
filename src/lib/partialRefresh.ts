/**
 * 局部刷新分页功能
 * 提升用户体验：点击分页时不刷新整个页面
 * 原理：拦截分页链接点击，fetch 获取新内容后局部更新
 * 注意：筛选链接不拦截，需要整页刷新来更新侧边栏状态
 */

import { initCardClick } from '../scripts/cardClick';

export function initPartialRefresh(config: {
  /** 产品列表容器 ID */
  listId: string;
  /** 分页容器 ID */
  paginationId: string;
  /** 过渡动画时长（毫秒） */
  transitionDuration?: number;
}) {
  const {
    listId,
    paginationId,
    transitionDuration = 200
  } = config;

  const listEl = document.getElementById(listId);
  const paginationEl = document.getElementById(paginationId);

  if (!listEl || !paginationEl) return;

  // 拦截分页链接点击（只拦截分页，不拦截筛选）
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    // 检查是否是链接
    const link = target.closest('a');

    if (!link || !link.getAttribute('href')) return;

    // 检查是否在产品页面
    if (!window.location.pathname.startsWith('/products')) return;

    const href = link.getAttribute('href') || '';

    // 只拦截分页链接（包含 page= 参数）
    // 筛选链接（改变 level1/level2）需要整页刷新来正确更新侧边栏状态
    if (!href.includes('page=')) return;

    // 检查是否是修饰键点击（如 Ctrl+点击，应该正常打开新标签页）
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();

    // 执行局部刷新
    await partialUpdate(href);
  }, true);

  // 处理浏览器历史导航
  window.addEventListener('popstate', async (e) => {
    if (e.state && e.state.url) {
      await partialUpdate(e.state.url, false);
    }
  });

  async function partialUpdate(url: string, pushState = true) {
    // 添加加载状态
    listEl.style.opacity = '0.5';
    listEl.style.transition = `opacity ${transitionDuration}ms`;

    try {
      // 获取新页面内容
      const response = await fetch(url);
      if (!response.ok) throw new Error('请求失败');

      const html = await response.text();

      // 解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 提取需要更新的部分
      const newListEl = doc.getElementById(listId);
      const newPaginationEl = doc.getElementById(paginationId);

      // 更新产品列表
      if (newListEl) {
        listEl.innerHTML = newListEl.innerHTML;
      }

      // 重新初始化卡片点击事件（新加载的卡片没有绑定事件）
      initCardClick();

      // 更新分页
      if (newPaginationEl) {
        paginationEl.innerHTML = newPaginationEl.innerHTML;
      }

      // 更新页面标题
      const newTitle = doc.querySelector('title')?.textContent;
      if (newTitle) {
        document.title = newTitle;
      }

      // 更新 URL（添加历史记录）
      if (pushState) {
        history.pushState({ url }, '', url);
      }

      // 恢复显示
      listEl.style.opacity = '1';

      // 滚动到顶部（平滑滚动）
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      // 出错时恢复并正常跳转
      console.error('局部刷新失败:', error);
      listEl.style.opacity = '1';
      window.location.href = url;
    }
  }
}