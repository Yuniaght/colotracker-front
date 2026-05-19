export type AuthModalView = 'login' | 'register' | 'forgotPassword';

export const useAuthModal = () => {
  const authOpen = useState<boolean>('auth-modal-open', () => false);
  
  const currentView = useState<AuthModalView>('auth-modal-view', () => 'login');

  const openModal = (view: AuthModalView = 'login') => {
    currentView.value = view;
    authOpen.value = true;
  };

  const closeModal = () => {
    authOpen.value = false;
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