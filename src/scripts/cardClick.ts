// 卡片点击交互脚本
export function initCardClick() {
  const init = () => {
    console.log('[cardClick] 开始初始化...');
    
    // 使用更精确的选择器 - 匹配 class 包含 card-container 且带有 data-state 属性的元素
    const cards = document.querySelectorAll<HTMLElement>('.card-container[data-state]');
    console.log('[cardClick] 找到卡片数量:', cards.length);
    
    cards.forEach((card) => {
      // 避免重复绑定
      if (card.dataset.cardClickInitialized === 'true') return;
      
      const trigger = card.querySelector<HTMLElement>('[data-trigger="card"]');
      const closeBtn = card.querySelector<HTMLButtonElement>('button[aria-label="关闭详情"]');

      console.log('[cardClick] 卡片:', card);
      console.log('[cardClick] trigger 元素:', trigger);
      console.log('[cardClick] closeBtn 元素:', closeBtn);

      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // 先关闭所有其他打开的卡片
          document.querySelectorAll<HTMLElement>('.card-container[data-state="open"]').forEach((otherCard) => {
            if (otherCard !== card) {
              otherCard.setAttribute('data-state', 'closed');
            }
          });
          
          // 切换当前卡片状态
          const currentState = card.getAttribute('data-state');
          const newState = currentState === 'open' ? 'closed' : 'open';
          card.setAttribute('data-state', newState);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          card.setAttribute('data-state', 'closed');
        });
      }

      card.dataset.cardClickInitialized = 'true';
    });

    // 点击页面其他地方关闭所有卡片（只绑定一次）
    if (document.body.dataset.clickOutsideInitialized !== 'true') {
      document.addEventListener('click', (e) => {
        const openCards = document.querySelectorAll<HTMLElement>('.card-container[data-state="open"]');
        openCards.forEach((card) => {
          const isClickInside = card.contains(e.target as Node);
          if (!isClickInside) {
            card.setAttribute('data-state', 'closed');
          }
        });
      });
      document.body.dataset.clickOutsideInitialized = 'true';
    }
    
    console.log('[cardClick] 初始化完成');
  };

  // 如果 DOM 已加载，立即执行；否则等待加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 使用 setTimeout 确保在 DOM 就绪后执行
    setTimeout(init, 0);
  }
}
