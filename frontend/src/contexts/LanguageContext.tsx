import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '@/services/api';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'missions.title': 'My Missions',
    'projects.title': 'Projects',
    'profile.title': 'Profile & Settings',
    'create.mission': 'Create Mission',
    'create.project': 'New Project',
    'save.changes': 'Save Changes',
    'update.password': 'Update Password',
    'current.password': 'Current Password',
    'new.password': 'New Password',
    'confirm.password': 'Confirm New Password',
    'full.name': 'Full Name',
    'bio': 'Bio',
    'email.notifications': 'Email Notifications',
    'mentor.feedback': 'Mentor Feedback',
    'deadline.reminders': 'Deadline Reminders',
    'collaboration.updates': 'Collaboration Updates',
    'theme': 'Theme',
    'language': 'Language',
    'light': 'Light',
    'dark': 'Dark',
    'system': 'System'
  },
  fr: {
    'missions.title': 'Mes Missions',
    'projects.title': 'Projets',
    'profile.title': 'Profil et Paramètres',
    'create.mission': 'Créer une Mission',
    'create.project': 'Nouveau Projet',
    'save.changes': 'Enregistrer les Modifications',
    'update.password': 'Mettre à Jour le Mot de Passe',
    'current.password': 'Mot de Passe Actuel',
    'new.password': 'Nouveau Mot de Passe',
    'confirm.password': 'Confirmer le Nouveau Mot de Passe',
    'full.name': 'Nom Complet',
    'bio': 'Biographie',
    'email.notifications': 'Notifications par Email',
    'mentor.feedback': 'Commentaires du Mentor',
    'deadline.reminders': 'Rappels d\'Échéance',
    'collaboration.updates': 'Mises à Jour de Collaboration',
    'theme': 'Thème',
    'language': 'Langue',
    'light': 'Clair',
    'dark': 'Sombre',
    'system': 'Système'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const response = await apiService.getPreferences();
      if (response.success && response.data?.language) {
        setLanguageState(response.data.language);
      }
    } catch (error) {
      const savedLang = localStorage.getItem('language');
      if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
        setLanguageState(savedLang);
      }
    }
  };

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    try {
      await apiService.updatePreferences({ language: lang });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}