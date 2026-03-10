/**
 * 多选标签过滤器 - 客户端脚本
 * 用法：
 * 1. 在页面引入此脚本
 * 2. 添加 data-filter 属性的容器，如 <div id="task-filters" data-filter="task">
 * 3. 按钮添加对应的 data-{filter} 属性
 * 
 * 注意：不修改 URL 参数，仅视觉选中状态
 */

export function initMultiFilter() {
  // 切换筛选状态（仅视觉，不修改 URL）
  function toggleFilter(btn: HTMLElement) {
    const isActive = btn.classList.contains('active');
    const closeIcon = btn.querySelector('.close-icon') as HTMLElement;
    
    if (isActive) {
      // 取消选中
      btn.classList.remove('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.add('border-gray-100');
      if (closeIcon) closeIcon.classList.add('hidden');
    } else {
      // 选中
      btn.classList.add('active', 'border-blue-400', 'bg-blue-50', 'text-blue-600');
      btn.classList.remove('border-gray-100');
      if (closeIcon) closeIcon.classList.remove('hidden');
    }
  }

  // 初始化筛选器
  function initFilterContainer(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

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
        initFilterContainer(container.id);
      }
    });
  });
}
