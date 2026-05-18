// app/composables/useAuthModal.ts
export type AuthModalView = 'login' | 'register' | 'forgotPassword';

export const useAuthModal = () => {
  const authOpen = useState<boolean>('auth-modal-open', () => false);
  
  // État global pour la vue courante (par défaut on ouvre sur 'login')
  const currentView = useState<AuthModalView>('auth-modal-view', () => 'login');

  const openModal = (view: AuthModalView = 'login') => {
    currentView.value = view;
    authOpen.value = true;
  };

  const closeModal = () => {
    authOpen.value = false;
    // Optionnel : Réinitialiser la vue après fermeture pour la prochaine fois
    setTimeout(() => { currentView.value = 'login'; }, 300);
  };

  const switchView = (view: AuthModalView) => {
    currentView.value = view;
  };

  return {
    authOpen,
    currentView,
    openModal,
    closeModal,
    switchView
  };
};