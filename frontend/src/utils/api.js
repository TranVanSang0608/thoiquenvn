import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi và nhận cookies
});

// Biến để theo dõi trạng thái đang refresh token
let isRefreshing = false;
// Hàng đợi các request cần thực hiện lại sau khi refresh token
let failedQueue = [];

// Xử lý hàng đợi các request
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Thêm interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const userInfoString = localStorage.getItem('userInfo');
    
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi và tự động refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi không phải 401 hoặc request đã thử lại, reject luôn
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Đánh dấu request này đã thử refresh token
    originalRequest._retry = true;

    // Nếu đang refresh token, thêm request vào hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Gọi API refresh token
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true } // Quan trọng để gửi cookies
      );

      // Cập nhật token mới vào localStorage
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        userInfo.token = data.token;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      // Cập nhật header cho request gốc
      originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
      
      // Xử lý hàng đợi request
      processQueue(null, data.token);
      
      // Thực hiện lại request gốc
      return api(originalRequest);
    } catch (refreshError) {
      // Xử lý tất cả request trong hàng đợi
      processQueue(refreshError);
      
      // Xóa thông tin người dùng nếu không thể refresh token
      localStorage.removeItem('userInfo');
      
      // Chuyển hướng về trang đăng nhập
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;