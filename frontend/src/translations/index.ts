export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    missions: 'Missions',
    projects: 'Projects',
    reflections: 'Reflections',
    collaboration: 'Collaboration',
    profile: 'Profile',
    
    // Dashboard
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    welcomeToDashboard: 'Welcome to your ELEVATE dashboard',
    yourProgress: 'Your Progress',
    platformOverview: 'Platform Overview',
    quickActions: 'Quick Actions',
    getStarted: 'Get started with your learning journey',
    
    // Stats
    missionsCompleted: 'Missions Completed',
    projectsDone: 'Projects Done',
    reflectionsWritten: 'Reflections Written',
    learningStreak: 'Learning Streak',
    activeStudents: 'Active Students',
    successRate: 'Success Rate',
    
    // Actions
    createMission: 'Create Mission',
    startNewMission: 'Start a new learning mission',
    newProject: 'New Project',
    buildSomething: 'Build something amazing',
    writeReflection: 'Write Reflection',
    documentLearning: 'Document your learning',
    
    // Profile
    achievements: 'Achievements',
    learningMilestones: 'Your learning milestones and badges',
    firstMission: 'First Mission',
    completedFirstMission: 'Completed your first mission',
    consistentLearner: 'Consistent Learner',
    sevenDayStreak: '7-day reflection streak',
    projectMaster: 'Project Master',
    completedFiveProjects: 'Completed 5 projects',
    risingStar: 'Rising Star',
    fiftyPercentProgress: 'Reached 50% progress on all missions',
    
    // Settings
    security: 'Security',
    notifications: 'Notifications',
    preferences: 'Preferences',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    
    // Notifications
    emailUpdates: 'Receive email updates about your missions',
    mentorFeedback: 'Get notified when mentors provide feedback',
    deadlineReminders: 'Receive reminders for upcoming deadlines',
    collaborationUpdates: 'Updates from your collaboration circles',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    earned: 'Earned'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    missions: 'Missions',
    projects: 'Projets',
    reflections: 'Réflexions',
    collaboration: 'Collaboration',
    profile: 'Profil',
    
    // Dashboard
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    welcomeToDashboard: 'Bienvenue sur votre tableau de bord ELEVATE',
    yourProgress: 'Votre Progrès',
    platformOverview: 'Aperçu de la Plateforme',
    quickActions: 'Actions Rapides',
    getStarted: 'Commencez votre parcours d\'apprentissage',
    
    // Stats
    missionsCompleted: 'Missions Terminées',
    projectsDone: 'Projets Réalisés',
    reflectionsWritten: 'Réflexions Écrites',
    learningStreak: 'Série d\'Apprentissage',
    activeStudents: 'Étudiants Actifs',
    successRate: 'Taux de Réussite',
    
    // Actions
    createMission: 'Créer une Mission',
    startNewMission: 'Commencer une nouvelle mission d\'apprentissage',
    newProject: 'Nouveau Projet',
    buildSomething: 'Construire quelque chose d\'incroyable',
    writeReflection: 'Écrire une Réflexion',
    documentLearning: 'Documenter votre apprentissage',
    
    // Profile
    achievements: 'Réalisations',
    learningMilestones: 'Vos étapes d\'apprentissage et badges',
    firstMission: 'Première Mission',
    completedFirstMission: 'Terminé votre première mission',
    consistentLearner: 'Apprenant Constant',
    sevenDayStreak: 'Série de réflexions de 7 jours',
    projectMaster: 'Maître de Projet',
    completedFiveProjects: 'Terminé 5 projets',
    risingStar: 'Étoile Montante',
    fiftyPercentProgress: 'Atteint 50% de progrès sur toutes les missions',
    
    // Settings
    security: 'Sécurité',
    notifications: 'Notifications',
    preferences: 'Préférences',
    changePassword: 'Changer le Mot de Passe',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    updatePassword: 'Mettre à Jour le Mot de Passe',
    
    // Notifications
    emailUpdates: 'Recevoir des mises à jour par email sur vos missions',
    mentorFeedback: 'Être notifié quand les mentors donnent des commentaires',
    deadlineReminders: 'Recevoir des rappels pour les échéances à venir',
    collaborationUpdates: 'Mises à jour de vos cercles de collaboration',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    loading: 'Chargement...',
    success: 'Succès',
    error: 'Erreur',
    earned: 'Gagné'
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;