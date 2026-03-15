/**
 * 多选标签过滤器 - 客户端脚本
 * 用法：
 * 1. 在页面引入此脚本
 * 2. 添加 data-filter 属性的容器，如 <div id="task-filters" data-filter="task">
 * 3. 按钮添加对应的 data-{filter} 属性
 * 4. 卡片元素添加对应的 data-* 属性
 *
 * 过滤逻辑：
 * - 同一维度内：OR 关系（选中多个标签，匹配任一即可）
 * - 不同维度间：AND 关系（同时满足所有维度的选中条件）
 */

// 全局选中状态
const activeFilters: Record<string, string[]> = {};

// 映射关系：filter 名称 -> 卡片 data 属性名
const filterToDataAttr: Record<string, string> = {
  task: 'data-task',
  company: 'data-company',
  country: 'data-country',
  pricing: 'data-pricing',
  useType: 'data-useType',
  language: 'data-language',
};

export function initMultiFilter() {
  // 切换筛选状态并执行过滤
  function toggleFilter(btn: HTMLElement) {
    const isActive = btn.classList.contains('active');
    const closeIcon = btn.querySelector('.close-icon') as HTMLElement;

    // 获取当前筛选维度
    const filterContainer = btn.closest('[data-filter]') as HTMLElement;
    const filterType = filterContainer?.getAttribute('data-filter');

    if (!filterType) return;

    // 获取按钮的筛选值
    const filterValue = btn.getAttribute(`data-${filterType}`) || '';

    if (isActive) {
      // 取消选中
      btn.classList.remove('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.add('border-gray-100');
      if (closeIcon) closeIcon.classList.add('hidden');

      // 从选中列表移除
      if (activeFilters[filterType]) {
        activeFilters[filterType] = activeFilters[filterType].filter(v => v !== filterValue);
      }
    } else {
      // 选中
      btn.classList.add('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.remove('border-gray-100');
      if (closeIcon) closeIcon.classList.remove('hidden');

      // 添加到选中列表
      if (!activeFilters[filterType]) {
        activeFilters[filterType] = [];
      }
      activeFilters[filterType].push(filterValue);
    }

    // 执行过滤
    applyFilters();
  }

  // 执行过滤逻辑
  function applyFilters() {
    // 查找所有产品卡片（通过 data-task 属性识别，因为所有产品卡片都应该有这个属性）
    // 使用更通用的选择器，查找主内容区域中带有任意 data-* 过滤属性的元素
    const cardsContainer = document.querySelector('main') || document.body;
    const cards = cardsContainer.querySelectorAll('[data-task], [data-company], [data-country], [data-pricing], [data-useType], [data-language]');

    cards.forEach(card => {
      const cardEl = card as HTMLElement;

      // 跳过 sidebar 中的标签按钮
      if (cardEl.closest('aside') || cardEl.classList.contains('filter-btn')) {
        return;
      }

      let shouldShow = true;

      // 检查每个维度的筛选条件
      for (const [filterType, selectedValues] of Object.entries(activeFilters)) {
        if (selectedValues.length === 0) continue; // 该维度没有选中项，跳过

        const dataAttr = filterToDataAttr[filterType];
        if (!dataAttr) continue;

        const cardDataStr = cardEl.getAttribute(dataAttr);
        if (!cardDataStr) {
          shouldShow = false;
          break;
        }

        // 解析卡片数据（数组格式）
        let cardValues: string[] = [];
        try {
          cardValues = JSON.parse(cardDataStr);
          if (!Array.isArray(cardValues)) {
            cardValues = [cardValues];
          }
        } catch {
          cardValues = [cardDataStr];
        }

        // OR 关系：卡片值包含任一选中值即匹配
        const matches = selectedValues.some(selected => cardValues.includes(selected));

        if (!matches) {
          shouldShow = false;
          break;
        }
      }

      // 应用显示/隐藏
      if (shouldShow) {
        cardEl.classList.remove('hidden');
      } else {
        cardEl.classList.add('hidden');
      }
    });
  }

  // 初始化筛选器容器
  function initFilterContainer(container: Element) {
    const buttons = container.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
      const closeIcon = btn.querySelector('.close-icon') as HTMLElement;

      // 初始状态：未选中
      btn.classList.remove('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.add('border-gray-100');
      if (closeIcon) closeIcon.classList.add('hidden');

      // 绑定点击事件
      btn.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('close-icon')) {
          e.stopPropagation();
        }
        toggleFilter(btn as HTMLElement);
      });

      // 绑定关闭图标点击
      if (closeIcon) {
        closeIcon.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          toggleFilter(btn as HTMLElement);
        });
      }
    });
  }

  // DOM 加载完成后初始化所有筛选器
  document.addEventListener('DOMContentLoaded', () => {
    // 自动查找所有带 data-filter 属性的容器
    const containers = document.querySelectorAll('[data-filter]');
    containers.forEach(container => {
      const paramName = container.getAttribute('data-filter');
      if (paramName) {
        initFilterContainer(container);
      }
    });
  });
}
