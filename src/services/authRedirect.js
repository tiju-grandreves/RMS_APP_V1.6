export const getShopLoginPath = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData?.shopSlug) {
      return `/${userData.shopSlug}/login`;
    }
  } catch (error) {
    // fall through to generic login
  }
  return '/login';
};
