import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Tạo context
const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra nếu user đã đăng nhập (từ localStorage)
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: parsedUser,
      });
    }
  }, []);

  // Đăng nhập
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });

      const { data } = await api.post('/auth/login', { email, password });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      throw error;
    }
  }, []);

  // Đăng ký
  const register = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });

      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: data,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      throw error;
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      // Gọi API đăng xuất để xóa refresh token khỏi cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      // Xóa thông tin người dùng khỏi localStorage
      localStorage.removeItem('userInfo');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Xóa lỗi
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng auth context
export const useAuth = () => useContext(AuthContext);