import React, { createContext, useState, useEffect } from 'react';
import i18next from 'i18next';

// Create Language Context
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
  ];
  
  // Change language function
  const changeLanguage = (langCode) => {
    i18next.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    localStorage.setItem('language', langCode);
  };
  
  // Set initial language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    } else {
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = languages.find(lang => lang.code === browserLang);
      changeLanguage(supportedLang ? browserLang : 'en');
    }
  }, []);
  
  const value = {
    currentLanguage,
    languages,
    changeLanguage
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 