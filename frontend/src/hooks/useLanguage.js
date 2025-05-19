import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

// Custom hook to use LanguageContext
const useLanguage = () => {
  return useContext(LanguageContext);
};

export default useLanguage; 