/**
 * 多选标签过滤器 - 客户端脚本
 * 用法：
 * 1. 在页面引入此脚本
 * 2. 添加 data-filter 属性的容器，如 <div id="task-filters" data-filter="task">
 * 3. 按钮添加对应的 data-{filter} 属性
 * 
 * URL 格式：?task=text,image (逗号分隔)
 */

export function initMultiFilter() {
  // 从 URL 获取当前选中的筛选条件（逗号分隔）
  function getSelectedFilters(paramName: string): string[] {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    if (!value) return [];
    return value.split(',').filter(Boolean);
  }

  // 更新 URL 参数（逗号分隔）
  function updateFilters(paramName: string, values: string[]) {
    const params = new URLSearchParams(window.location.search);
    if (values.length > 0) {
      params.set(paramName, values.join(','));
    } else {
      params.delete(paramName);
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}` 
      : window.location.pathname;
    
    window.history.pushState({}, '', newUrl);
  }

  // 切换筛选状态
  function toggleFilter(paramName: string, value: string, btn: HTMLElement) {
    const selected = getSelectedFilters(paramName);
    const index = selected.indexOf(value);
    const closeIcon = btn.querySelector('.close-icon') as HTMLElement;
    
    if (index > -1) {
      selected.splice(index, 1);
      btn.classList.remove('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.add('border-gray-100');
      if (closeIcon) closeIcon.classList.add('hidden');
    } else {
      selected.push(value);
      btn.classList.add('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.remove('border-gray-100');
      if (closeIcon) closeIcon.classList.remove('hidden');
    }
    
    updateFilters(paramName, selected);
  }

  // 初始化筛选器
  function initFilterContainer(containerId: string, paramName: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 不读取 URL 状态，所有按钮初始为未选中
    const buttons = container.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
      const value = (btn as HTMLElement).getAttribute(`data-${paramName}`);
      if (!value) return;

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
        toggleFilter(paramName, value, btn as HTMLElement);
      });

      // 绑定关闭图标点击
      if (closeIcon) {
        closeIcon.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          toggleFilter(paramName, value, btn as HTMLElement);
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
        initFilterContainer(container.id, paramName);
      }
    });
  });
}
