import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const AppContext = createContext({
  lang: 'id', setLang: () => {},
  theme: 'dark', setTheme: () => {},
  t: () => '',
});

export function AppProvider({ children }) {
  const [lang,  setLang]  = useState(() => localStorage.getItem('lang')  || 'id');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = (key) => translations[lang]?.[key] ?? translations['id']?.[key] ?? key;

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
