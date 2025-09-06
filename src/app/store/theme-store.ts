import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,

      setTheme: (theme: Theme) => {
        const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme());
        
        set({ theme, isDark });
        applyTheme(isDark);
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme());
        
        set({ isDark });
        applyTheme(isDark);

        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          
          const handleChange = () => {
            const currentTheme = get().theme;
            if (currentTheme === 'system') {
              const systemIsDark = mediaQuery.matches;
              set({ isDark: systemIsDark });
              applyTheme(systemIsDark);
            }
          };

          mediaQuery.addEventListener('change', handleChange);
          
          // Return cleanup function
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'tsa-theme-store',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);