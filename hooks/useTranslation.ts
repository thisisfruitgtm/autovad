import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return {
    t,
    currentLanguage: i18n.language,
    changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
}; 