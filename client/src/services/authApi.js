import { apiClient, publicApi } from '@/services/apiClient';

const useMockAuth = (import.meta.env.VITE_USE_MOCK_AUTH || 'false') === 'true';

// roleId: 1 = Admin, 2 = Customer, 3 = Staff
const ROLE_NAME_TO_ID = { admin: 1, customer: 2, staff: 3 };

const mockUsers = [
  {
    id: 'u-admin',
    name: 'Admin Operator',
    email: 'admin@jewel.local',
    password: 'Admin@123',
    roles: ['admin'],
    roleId: 1,
  },
  {
    id: 'u-staff',
    name: 'Staff Operator',
    email: 'staff@jewel.local',
    password: 'Staff@123',
    roles: ['staff'],
    roleId: 3,
  },
  {
    id: 'u-customer',
    name: 'Customer Demo',
    email: 'customer@jewel.local',
    password: 'Customer@123',
    roles: ['customer'],
    roleId: 2,
  },
];

let mockRefreshSubjectId = null;

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeMockUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  role: user.roles[0],
  roleId: user.roleId ?? ROLE_NAME_TO_ID[user.roles[0]] ?? 2,
});

const buildToken = (user) => `mock-${user.roles[0]}-${Date.now()}`;

const toError = (error, fallbackMessage) => {
  const apiMessage = error.response?.data?.message;
  return new Error(apiMessage || fallbackMessage);
};

// ─── localStorage helpers ────────────────────────────────────────────────────
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
    const user = JSON.parse(localStorage.getItem(LS_USER) || 'null');
    return accessToken && user ? { accessToken, user } : null;
  } catch {
    return null;
  }
};
// ────────────────────────────────────────────────────────────────────────────

export const authApi = {
  async signIn(payload) {
    if (useMockAuth) {
      await delay();

      const user = mockUsers.find(
        (candidate) =>
          candidate.email.toLowerCase() === payload.email.toLowerCase() &&
          candidate.password === payload.password,
      );

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      mockRefreshSubjectId = user.id;
      const result = {
        user: sanitizeMockUser(user),
        accessToken: buildToken(user),
        refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
      };
      persistAuth(result);
      return result;
    }

    try {
      const { data } = await publicApi.post('/auth/login', payload);
      persistAuth(data);
      return data;
    } catch (error) {
      throw toError(error, 'Đăng nhập thất bại');
    }
  },

  async signUp(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: `Đăng ký thành công cho ${payload.email}`,
      };
    }

    try {
      const { data } = await publicApi.post('/auth/register', payload);
      persistAuth(data);
      return data;
    } catch (error) {
      throw toError(error, 'Đăng ký thất bại');
    }
  },

  async forgotPassword(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: `Đã gửi hướng dẫn đặt lại mật khẩu đến ${payload.email}`,
      };
    }

    try {
      const { data } = await publicApi.post('/auth/forgot-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Không thể yêu cầu đặt lại mật khẩu');
    }
  },

  async resetPassword(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: 'Đặt lại mật khẩu thành công',
      };
    }

    try {
      const { data } = await publicApi.post('/auth/reset-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Không thể đặt lại mật khẩu');
    }
  },

  async refresh() {
    if (useMockAuth) {
      await delay(180);

      if (!mockRefreshSubjectId) {
        throw new Error('Không có phiên đăng nhập');
      }

      const user = mockUsers.find((candidate) => candidate.id === mockRefreshSubjectId);

      if (!user) {
        throw new Error('Không tìm thấy phiên đăng nhập');
      }

      const result = {
        user: sanitizeMockUser(user),
        accessToken: buildToken(user),
        refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
      };
      persistAuth(result);
      return result;
    }

    const storedRefreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
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
    if (useMockAuth) {
      await delay(120);

      if (!mockRefreshSubjectId) {
        throw new Error('Không có phiên đăng nhập');
      }

      const user = mockUsers.find((candidate) => candidate.id === mockRefreshSubjectId);

      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      return {
        user: sanitizeMockUser(user),
      };
    }

    try {
      const { data } = await apiClient.get('/auth/current-user');
      return data;
    } catch (error) {
      throw toError(error, 'Không thể tải thông tin người dùng');
    }
  },

  async signOut() {
    if (useMockAuth) {
      await delay(100);
      mockRefreshSubjectId = null;
      clearAuth();
      return { message: 'Đã đăng xuất' };
    }

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
