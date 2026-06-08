// UI generic elements

window.ui = {
  renderEmptyState: (title, message, iconSVG) => {
    return `
      <div class="empty-state" style="text-align:center; padding:40px 20px; color:var(--color-gray-500)">
        <div style="width:64px; height:64px; margin:0 auto 16px auto; color:var(--color-gray-400)">
          ${iconSVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>'}
        </div>
        <h3 class="font-bold text-lg" style="color:var(--color-gray-700)">${title}</h3>
        <p class="text-sm mt-2">${message}</p>
      </div>
    `;
  }
};
