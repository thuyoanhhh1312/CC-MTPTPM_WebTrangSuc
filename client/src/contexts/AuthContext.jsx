/* eslint-disable react-refresh/only-export-components */
import { App } from 'antd';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { authApi, clearAuth, loadAuthFromStorage } from '@/services/authApi';
import { registerAuthHandlers } from '@/services/apiClient';
import { extractUserRoles } from '@/utils/roles';

export const AuthContext = createContext(undefined);

const initialState = {
  status: 'initializing',
  user: null,
  accessToken: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'BOOTSTRAP_AUTHENTICATED':
      return {
        status: 'authenticated',
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };

    case 'BOOTSTRAP_GUEST':
      return {
        status: 'unauthenticated',
        user: null,
        accessToken: null,
      };

    case 'SIGNED_IN':
      return {
        status: 'authenticated',
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };

    case 'TOKEN_REFRESHED':
      return {
        ...state,
        status: state.user ? 'authenticated' : state.status,
        accessToken: action.payload,
      };

    case 'USER_UPDATED':
      return {
        ...state,
        status: state.accessToken ? 'authenticated' : state.status,
        user: action.payload,
      };

    case 'SIGNED_OUT':
      return {
        status: 'unauthenticated',
        user: null,
        accessToken: null,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { message } = App.useApp();
  const accessTokenRef = useRef(state.accessToken);
  const logoutToastRef = useRef(false);

  useEffect(() => {
    accessTokenRef.current = state.accessToken;
  }, [state.accessToken]);

  const forceLogout = useCallback(() => {
    clearAuth();
    dispatch({ type: 'SIGNED_OUT' });

    if (!logoutToastRef.current) {
      logoutToastRef.current = true;
      message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        logoutToastRef.current = false;
      }, 1200);
    }
  }, [message]);

  const refreshAccessToken = useCallback(async () => {
    const result = await authApi.refresh();

    if (!result?.accessToken) {
      throw new Error('Missing access token from refresh endpoint');
    }

    dispatch({ type: 'TOKEN_REFRESHED', payload: result.accessToken });

    if (result.user) {
      dispatch({ type: 'USER_UPDATED', payload: result.user });
    }

    return result.accessToken;
  }, []);

  useEffect(() => {
    registerAuthHandlers({
      getAccessToken: () => accessTokenRef.current,
      setAccessToken: (token) => dispatch({ type: 'TOKEN_REFRESHED', payload: token }),
      refreshToken: refreshAccessToken,
      onAuthFailed: forceLogout,
    });
  }, [forceLogout, refreshAccessToken]);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      // 1. Restore immediately from localStorage for instant UI response
      const stored = loadAuthFromStorage();
      if (stored && mounted) {
        dispatch({
          type: 'BOOTSTRAP_AUTHENTICATED',
          payload: { user: stored.user, accessToken: stored.accessToken },
        });
      }

      // Không có stored auth → đánh dấu guest ngay, không cần gọi refresh
      if (!stored) {
        if (mounted) dispatch({ type: 'BOOTSTRAP_GUEST' });
        return;
      }

      // 2. Attempt a silent token refresh to get a fresh accessToken
      try {
        const refreshResult = await authApi.refresh();

        if (!refreshResult?.accessToken) {
          throw new Error('No token from bootstrap refresh');
        }

        let resolvedUser = refreshResult.user ?? stored?.user;

        if (!resolvedUser) {
          const meResult = await authApi.me();
          resolvedUser = meResult?.user;
        }

        if (!mounted || !resolvedUser) {
          return;
        }

        dispatch({
          type: 'BOOTSTRAP_AUTHENTICATED',
          payload: {
            user: resolvedUser,
            accessToken: refreshResult.accessToken,
          },
        });
      } catch {
        // Refresh thất bại → giữ nguyên trạng thái đã restore từ localStorage.
        // Lần gọi API tiếp theo sẽ trả về 401 và forceLogout sẽ dọn dẹp.
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (payload) => {
    const result = await authApi.signIn(payload);

    dispatch({
      type: 'SIGNED_IN',
      payload: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });

    return result;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } finally {
      dispatch({ type: 'SIGNED_OUT' });
    }
  }, []);

  const contextValue = useMemo(() => {
    const isInitializing = state.status === 'initializing';
    const isAuthenticated = Boolean(state.accessToken && state.user);

    return {
      user: state.user,
      accessToken: state.accessToken,
      status: state.status,
      isInitializing,
      isAuthenticated,
      roles: extractUserRoles(state.user),
      signIn,
      signOut,
      refreshAccessToken,
      forceLogout,
    };
  }, [state, signIn, signOut, refreshAccessToken, forceLogout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
