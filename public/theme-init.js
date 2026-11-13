/**
 * Pre-paint theme initialiser.
 *
 * Loaded render-blocking from <head> in src/app/layout.tsx so the `dark` class
 * is on <html> before the first paint. ThemeProvider's useEffect would
 * otherwise flip it after hydration, which flashed a light page on every
 * dark-mode load and re-painted surfaces a frame late.
 *
 * Keep this in sync with the storage key in ThemeProvider ('propati-theme').
 */
(function () {
  try {
    var stored = localStorage.getItem('propati-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (!stored && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    /* localStorage can throw in private mode — fall back to light. */
  }
})();
