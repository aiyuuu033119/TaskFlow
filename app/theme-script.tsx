export function ThemeScript() {
  const codeToRunOnClient = `
    (function() {
      const storageKey = 'taskflow-theme';
      const theme = localStorage.getItem(storageKey);
      
      if (theme === 'dark' || theme === 'light') {
        document.documentElement.classList.add(theme);
      } else {
        // Default to light theme
        document.documentElement.classList.add('light');
      }
    })()
  `

  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
}
