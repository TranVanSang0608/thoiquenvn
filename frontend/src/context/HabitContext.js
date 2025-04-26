import React, { createContext, useContext, useReducer, useEffect, useCallback} from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

// Initial state
const initialState = {
  habits: [],
  currentHabit: null,
  loading: false,
  error: null,
  success: false,
};

// Tạo context
const HabitContext = createContext(initialState);

// Reducer
const habitReducer = (state, action) => {
  switch (action.type) {
    case 'HABIT_LIST_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_LIST_SUCCESS':
      return {
        ...state,
        loading: false,
        habits: action.payload,
      };
    case 'HABIT_LIST_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_DETAILS_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_DETAILS_SUCCESS':
      return {
        ...state,
        loading: false,
        currentHabit: action.payload,
      };
    case 'HABIT_DETAILS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_CREATE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_CREATE_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        habits: [...state.habits, action.payload],
      };
    case 'HABIT_CREATE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_UPDATE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_UPDATE_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        habits: state.habits.map(habit =>
          habit._id === action.payload._id ? action.payload : habit
        ),
      };
    case 'HABIT_UPDATE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_COMPLETE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_COMPLETE_SUCCESS':
      return {
        ...state,
        loading: false,
        habits: state.habits.map(habit =>
          habit._id === action.payload.habit ? { ...habit, completed: true } : habit
        ),
      };
    case 'HABIT_COMPLETE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_UNCOMPLETE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_UNCOMPLETE_SUCCESS':
      return {
        ...state,
        loading: false,
        habits: state.habits.map(habit =>
          habit._id === action.payload.habit ? { ...habit, completed: false } : habit
        ),
      };
    case 'HABIT_UNCOMPLETE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_DELETE_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_DELETE_SUCCESS':
      return {
        ...state,
        loading: false,
        habits: state.habits.filter(habit => habit._id !== action.payload),
      };
    case 'HABIT_DELETE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_HISTORY_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'HABIT_HISTORY_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'HABIT_RESET':
      return initialState;
    default:
      return state;
  }
};

// Provider
export const HabitProvider = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Reset habits khi đăng xuất
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: 'HABIT_RESET' });
    }
  }, [isAuthenticated]);

  const getHabits = useCallback(async () => {
    try {
      dispatch({ type: 'HABIT_LIST_REQUEST' });

      const { data } = await api.get('/habits');

      dispatch({
        type: 'HABIT_LIST_SUCCESS',
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: 'HABIT_LIST_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
    }
  }, []);

  // Lấy chi tiết thói quen
  const getHabitById = useCallback(async (id) => {
    try {
      dispatch({ type: 'HABIT_DETAILS_REQUEST' });

      const { data } = await api.get(`/habits/${id}`);

      dispatch({
        type: 'HABIT_DETAILS_SUCCESS',
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: 'HABIT_DETAILS_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
    }
  }, []);

  // Tạo thói quen mới
  const createHabit = useCallback(async (habit) => {
    try {
      dispatch({ type: 'HABIT_CREATE_REQUEST' });

      const { data } = await api.post('/habits', habit);

      dispatch({
        type: 'HABIT_CREATE_SUCCESS',
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'HABIT_CREATE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      throw error;
    }
  }, []);
  // Cập nhật thói quen
  const updateHabit = useCallback(async (id, habitData) => {    
    try {
      dispatch({ type: 'HABIT_UPDATE_REQUEST' });

      const { data } = await api.put(`/habits/${id}`, habitData);

      dispatch({
        type: 'HABIT_UPDATE_SUCCESS',
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'HABIT_UPDATE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      throw error;
    }
  }, []);

  // Đánh dấu thói quen hoàn thành
  const completeHabit = useCallback(async (id, date) => {
    try {
      dispatch({ type: 'HABIT_COMPLETE_REQUEST' });
      
      const { data } = await api.post(`/habits/${id}/complete`, { date });

      dispatch({
        type: 'HABIT_COMPLETE_SUCCESS',
        payload: data,
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'HABIT_COMPLETE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi đánh dấu hoàn thành:', error);
    }
  }, []);

  // Bỏ đánh dấu thói quen hoàn thành
  const uncompleteHabit = useCallback(async (id, date) => {
    try {
      dispatch({ type: 'HABIT_UNCOMPLETE_REQUEST' });
      
      const { data } = await api.post(`/habits/${id}/uncomplete`, { date });

      dispatch({
        type: 'HABIT_UNCOMPLETE_SUCCESS',
        payload: { habit: id },
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'HABIT_UNCOMPLETE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi bỏ đánh dấu hoàn thành:', error);
    }
  }, []);

  // Xóa thói quen
  const deleteHabit = useCallback(async (id) => {
    try {
      dispatch({ type: 'HABIT_DELETE_REQUEST' });
      
      await api.delete(`/habits/${id}`);

      dispatch({
        type: 'HABIT_DELETE_SUCCESS',
        payload: id,
      });
    } catch (error) {
      dispatch({
        type: 'HABIT_DELETE_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi xóa thói quen:', error);
    }
  }, []);

  // Lấy lịch sử hoàn thành của thói quen
  const getHabitHistory = useCallback(async (id, startDate, endDate) => {
    try {
      dispatch({ type: 'HABIT_HISTORY_REQUEST' });
      
      let url = `/habits/${id}/history`;
      
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      dispatch({
        type: 'HABIT_HISTORY_FAIL',
        payload:
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message,
      });
      console.error('Lỗi khi lấy lịch sử:', error);
      return [];
    }
  }, []);
  
  // Lấy tình trạng hoàn thành thói quen theo ngày
  const getHabitCompletionsForDate = useCallback(async (date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const { data } = await api.get(`/habits/completions/date/${formattedDate}`);
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hoàn thành theo ngày:', error);
      return [];
    }
  }, []);

  return (
    <HabitContext.Provider
      value={{
        ...state,
        getHabits,
        getHabitById,
        createHabit,
        updateHabit,
        completeHabit,
        uncompleteHabit,
        deleteHabit,
        getHabitHistory,
        getHabitCompletionsForDate  // Thêm function mới
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

// Custom hook để sử dụng habit context
export const useHabit = () => useContext(HabitContext);