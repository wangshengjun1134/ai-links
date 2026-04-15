/**
 * 通用分页工具 - 用于列表页的分页和搜索功能
 * 使用方法：
 * 1. 在页面中引入此脚本
 * 2. 调用 initPagination(config) 初始化
 * 3. 确保 HTML 结构符合约定
 */

export interface PaginationConfig {
  /** 卡片容器 ID，如 'product-list' */
  listId: string;
  /** 卡片项类名，如 'product-item' */
  itemClass: string;
  /** 搜索输入框 ID */
  searchId: string;
  /** 每页显示数量 */
  pageSize: number;
  /** 项目类型标签，用于显示（如 '产品'、'智能体'） */
  itemTypeLabel: string;
  /** 搜索时检查的 data 属性列表 */
  searchAttrs?: string[];
}

interface PaginationState {
  currentPage: number;
  allCards: HTMLElement[];
  filteredCards: HTMLElement[];
}

export function initPagination(config: PaginationConfig) {
  const { listId, itemClass, searchId, pageSize, itemTypeLabel, searchAttrs = [] } = config;

  const state: PaginationState = {
    currentPage: 1,
    allCards: [],
    filteredCards: [],
  };

  function init() {
    // 获取所有卡片
    const listEl = document.getElementById(listId);
    if (!listEl) return;

    state.allCards = Array.from(listEl.querySelectorAll(`.${itemClass}`)) as HTMLElement[];
    state.filteredCards = [...state.allCards];

    const searchInput = document.getElementById(searchId);
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // 搜索事件
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value.toLowerCase().trim();

        state.filteredCards = state.allCards.filter(card => {
          // 使用配置的搜索属性或默认属性
          const defaultAttrs = ['data-name', 'data-company', 'data-introduction'];
          const attrsToSearch = searchAttrs.length > 0 ? searchAttrs : defaultAttrs;

          return attrsToSearch.some(attr => {
            const value = card.getAttribute(attr) || '';
            return value.toLowerCase().includes(val);
          });
        });

        state.currentPage = 1;
        render();
      });
    }

    // 监听侧边栏过滤事件
    document.addEventListener('filtersChanged', () => {
      // 根据当前可见的卡片更新 filteredCards
      state.filteredCards = state.allCards.filter(card => {
        return card.style.display !== 'none';
      });

      // 重置到第一页
      state.currentPage = 1;
      render();
    });

    // 翻页事件
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        const totalPages = Math.ceil(state.filteredCards.length / pageSize);
        if (state.currentPage < totalPages) {
          state.currentPage++;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    render();
  }

  function render() {
    const totalPages = Math.ceil(state.filteredCards.length / pageSize);
    const start = (state.currentPage - 1) * pageSize;
    const end = start + pageSize;

    // 1. 处理显隐
    state.allCards.forEach(card => card.classList.add('v-hidden'));
    state.filteredCards.slice(start, end).forEach(card => card.classList.remove('v-hidden'));

    // 2. 更新按钮状态
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = state.currentPage === 1;
    if (nextBtn) nextBtn.disabled = state.currentPage === totalPages || totalPages === 0;

    // 3. 更新页码显示
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
      pageInfo.textContent = totalPages > 0
        ? `第 ${state.currentPage} / ${totalPages} 页（共 ${state.filteredCards.length} 个${itemTypeLabel}）`
        : '无结果';
    }
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return state;
}