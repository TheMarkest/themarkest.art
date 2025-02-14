// Пример простого скрипта для переключения светлой и тёмной темы
const toggleThemeBtn = document.createElement('button');
toggleThemeBtn.textContent = 'Toggle Theme';
toggleThemeBtn.style.position = 'fixed';
toggleThemeBtn.style.bottom = '20px';
toggleThemeBtn.style.right = '20px';
toggleThemeBtn.style.zIndex = '1000';
document.body.appendChild(toggleThemeBtn);

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});
