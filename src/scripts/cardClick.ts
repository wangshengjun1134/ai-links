// 卡片点击交互脚本 - 点击卡片展开悬浮框
export function initCardClick() {
  const init = () => {
    const cards = document.querySelectorAll<HTMLElement>('.card-container[data-state]');

    cards.forEach((card) => {
      // 避免重复绑定
      if (card.dataset.cardClickInitialized === 'true') return;

      const trigger = card.querySelector<HTMLElement>('[data-trigger="card"]');
      const closeBtn = card.querySelector<HTMLButtonElement>('button[aria-label="关闭详情"]');

      // 点击卡片打开悬浮框
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

      // 点击关闭按钮关闭悬浮框
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          card.setAttribute('data-state', 'closed');
        });
      }

      card.dataset.cardClickInitialized = 'true';
    });

    // 点击页面其他地方关闭所有卡片
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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
}
