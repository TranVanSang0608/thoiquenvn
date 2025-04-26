import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  moods: [],
  currentMood: null,
  loading: false,
  error: null,
  success: false,
};

// Tạo context
const MoodContext = createContext(initialState);

// Reducer
const moodReducer = (state, action) => {
  switch (action.type) {
    case 'MOOD_LIST_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_LIST_SUCCESS':
      return {
        ...state,
        loading: false,
        moods: action.payload,
      };
    case 'MOOD_LIST_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_CREATE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_CREATE_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        currentMood: action.payload,
        moods: [...state.moods.filter(mood => 
          new Date(mood.date).toDateString() !== new Date(action.payload.date).toDateString()
        ), action.payload],
      };
    case 'MOOD_CREATE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_UPDATE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_UPDATE_SUCCESS':
      return {
        ...state,
        loading: false,
        currentMood: action.payload,
        moods: state.moods.map(mood =>
          mood._id === action.payload._id ? action.payload : mood
        ),
      };
    case 'MOOD_UPDATE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_DELETE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_DELETE_SUCCESS':
      return {
        ...state,
        loading: false,
        moods: state.moods.filter(mood => mood._id !== action.payload),
      };
    case 'MOOD_DELETE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_GET_BY_DATE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_GET_BY_DATE_SUCCESS':
      return {
        ...state,
        loading: false,
        currentMood: action.payload,
      };
    case 'MOOD_GET_BY_DATE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_STATS_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'MOOD_STATS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'MOOD_RESET':
      return initialState;
    default:
      return state;
  }
};

// Provider
export const MoodProvider = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Reset moods khi đăng xuất
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: 'MOOD_RESET' });
    }
  }, [isAuthenticated]);

  // Lấy danh sách tâm trạng
  const getMoods = useCallback(async (startDate, endDate) => {
    try {
      dispatch({ type: 'MOOD_LIST_REQUEST' });

      let url = '/moods';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const { data } = await api.get(url);

      dispatch({
        type: 'MOOD_LIST_SUCCESS',
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: 'MOOD_LIST_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
    }
  }, []);

  // Lấy tâm trạng theo ngày
  const getMoodByDate = useCallback(async (date) => {
    try {
      dispatch({ type: 'MOOD_GET_BY_DATE_REQUEST' });
      
      const { data } = await api.get(`/moods/date/${date}`);

      dispatch({
        type: 'MOOD_GET_BY_DATE_SUCCESS',
        payload: data,
      });

      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Không có tâm trạng cho ngày này
        dispatch({
          type: 'MOOD_GET_BY_DATE_SUCCESS',
          payload: null,
        });
      } else {
        dispatch({
          type: 'MOOD_GET_BY_DATE_FAIL',
          payload:
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message,
        });
      }
      return null;
    }
  }, []);

  // Tạo/cập nhật tâm trạng
  const createMood = useCallback(async (mood) => {
    try {
      dispatch({ type: 'MOOD_CREATE_REQUEST' });

      const { data } = await api.post('/moods', mood);

      dispatch({
        type: 'MOOD_CREATE_SUCCESS',
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'MOOD_CREATE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      throw error;
    }
  }, []);

  // Cập nhật tâm trạng
  const updateMood = useCallback(async (id, moodData) => {
    try {
      dispatch({ type: 'MOOD_UPDATE_REQUEST' });
      
      const { data } = await api.put(`/moods/${id}`, moodData);

      dispatch({
        type: 'MOOD_UPDATE_SUCCESS',
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'MOOD_UPDATE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi cập nhật tâm trạng:', error);
      throw error;
    }
  }, []);

  // Xóa tâm trạng
  const deleteMood = useCallback(async (id) => {
    try {
      dispatch({ type: 'MOOD_DELETE_REQUEST' });
      
      await api.delete(`/moods/${id}`);

      dispatch({
        type: 'MOOD_DELETE_SUCCESS',
        payload: id,
      });
    } catch (error) {
      dispatch({
        type: 'MOOD_DELETE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi xóa tâm trạng:', error);
    }
  }, []);

  // Lấy thống kê tâm trạng
  const getMoodStats = useCallback(async (startDate, endDate) => {
    try {
      dispatch({ type: 'MOOD_STATS_REQUEST' });
      
      let url = '/moods/stats';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      dispatch({
        type: 'MOOD_STATS_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi lấy thống kê tâm trạng:', error);
      return null;
    }
  }, []);

  return (
    <MoodContext.Provider
      value={{
        ...state,
        getMoods,
        getMoodByDate,
        createMood,
        updateMood,
        deleteMood,
        getMoodStats,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

// Custom hook để sử dụng mood context
export const useMood = () => useContext(MoodContext);