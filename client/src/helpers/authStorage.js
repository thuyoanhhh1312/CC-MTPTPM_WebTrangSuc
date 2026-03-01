const LS_ACCESS_TOKEN = 'accessToken';
const LS_REFRESH_TOKEN = 'refreshToken';
const LS_USER = 'user';

export const persistAuth = ({ accessToken, refreshToken, user }) => {
  if (accessToken) localStorage.setItem(LS_ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(LS_REFRESH_TOKEN, refreshToken);
  if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(LS_ACCESS_TOKEN);
  localStorage.removeItem(LS_REFRESH_TOKEN);
  localStorage.removeItem(LS_USER);
};

export const loadAuthFromStorage = () => {
  try {
    const accessToken = localStorage.getItem(LS_ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
    const user = JSON.parse(localStorage.getItem(LS_USER) || 'null');

    return accessToken && refreshToken && user
      ? { accessToken, refreshToken, user }
      : null;
  } catch {
    return null;
  }
};

export const getRefreshToken = () =>
  localStorage.getItem(LS_REFRESH_TOKEN);

export const getAccessToken = () =>
  localStorage.getItem(LS_ACCESS_TOKEN);