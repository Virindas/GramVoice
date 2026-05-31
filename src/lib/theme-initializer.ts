// Force light mode on load
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');
}
export {};
