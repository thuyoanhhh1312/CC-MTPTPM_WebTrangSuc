import { apiClient, publicApi } from '@/services/apiClient';
import { persistAuth, clearAuth } from '@/helpers/authStorage';

export { persistAuth, clearAuth, loadAuthFromStorage } from '@/helpers/authStorage';

const toError = (error, fallbackMessage) => {
  const apiMessage = error.response?.data?.message;
  return new Error(apiMessage || fallbackMessage);
};

export const authApi = {
  async signIn(payload) {
    try {
      const { data } = await publicApi.post('/auth/login', payload);
      persistAuth(data);
      return data;
    } catch (error) {
      throw toError(error, 'Đăng nhập thất bại');
    }
  },

  async signUp(payload) {
    try {
      const { data } = await publicApi.post('/auth/register', payload);
      persistAuth(data);
      return data;
    } catch (error) {
      throw toError(error, 'Đăng ký thất bại');
    }
  },

  async forgotPassword(payload) {
    try {
      const { data } = await publicApi.post('/auth/forgot-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Không thể yêu cầu đặt lại mật khẩu');
    }
  },

  async resetPassword(payload) {
    try {
      const { data } = await publicApi.post('/auth/reset-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Không thể đặt lại mật khẩu');
    }
  },

  async refresh() {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error('Không có refresh token');
    }

    try {
      const { data } = await publicApi.post(
        '/auth/refresh-token',
        { refreshToken: storedRefreshToken },
        { skipAuthRefresh: true },
      );
      persistAuth(data);
      return data;
    } catch (error) {
      throw toError(error, 'Không thể làm mới phiên đăng nhập');
    }
  },

  async me() {
    try {
      const { data } = await apiClient.get('/auth/current-user');
      return data;
    } catch (error) {
      throw toError(error, 'Không thể tải thông tin người dùng');
    }
  },

  async signOut() {
    try {
      const { data } = await apiClient.post('/auth/logout', null, {
        skipAuthRefresh: true,
      });
      clearAuth();
      return data;
    } catch {
      clearAuth();
      return { message: 'Đã đăng xuất' };
    }
  },
};
