import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SunIcon, MoonIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fontSize, setFontSize] = useState('medium');
  const [reminderTime, setReminderTime] = useState('20:00');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reminderDays, setReminderDays] = useState([1, 2, 3, 4, 5]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Khởi tạo dữ liệu từ user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      if (user.settings) {
        setFontSize(user.settings.fontSize || 'medium');
        setEmailNotifications(user.settings.notifications?.email || false);
        setReminderTime(user.settings.notifications?.reminderTime || '20:00');
        setReminderDays(user.settings.notifications?.reminderDays || [1, 2, 3, 4, 5]);
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu không khớp!' });
      return;
    }
    
    try {
      const userData = {
        name,
        email,
        settings: {
          fontSize,
          notifications: {
            email: emailNotifications,
            reminderTime,
            reminderDays,
          }
        }
      };
      
      if (password) {
        userData.password = password;
      }
      
      await updateProfile(userData);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin.' });
      console.error('Lỗi cập nhật:', error);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setMessage({ type: 'success', text: `Đã chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}!` });
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/me');
      logout();
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa tài khoản.' });
      console.error('Lỗi xóa tài khoản:', error);
    }
  };

  const weekdays = [
    { id: 0, name: 'CN' },
    { id: 1, name: 'T2' },
    { id: 2, name: 'T3' },
    { id: 3, name: 'T4' },
    { id: 4, name: 'T5' },
    { id: 5, name: 'T6' },
    { id: 6, name: 'T7' },
  ];

  const handleReminderDayToggle = (dayId) => {
    if (reminderDays.includes(dayId)) {
      setReminderDays(reminderDays.filter(day => day !== dayId));
    } else {
      setReminderDays([...reminderDays, dayId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-neutral-dark">Cài đặt</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cài đặt chung */}
        <div className="md:col-span-2">
          <Card>
            <h2 className="text-lg font-medium mb-4">Thông tin tài khoản</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Lưu thông tin
              </Button>
            </form>
          </Card>
          
          <Card className="mt-6">
            <h2 className="text-lg font-medium mb-4">Nhắc nhở</h2>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mr-2"
                />
                <span>Nhận email nhắc nhở</span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Thời gian nhắc nhở</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Các ngày nhắc nhở</label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleReminderDayToggle(day.id)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      reminderDays.includes(day.id)
                        ? 'bg-primary text-white'
                        : 'bg-neutral-lightest text-neutral'
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleProfileUpdate} className="w-full">
              Lưu cài đặt nhắc nhở
            </Button>
          </Card>
        </div>
        
        {/* Sidebar: Cài đặt giao diện */}
        <div>
          <Card>
            <h2 className="text-lg font-medium mb-4">Giao diện</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Chế độ màu</label>
              <button
                onClick={handleThemeToggle}
                className="flex items-center justify-between w-full p-3 rounded-md border"
              >
                <span>{theme === 'light' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                {theme === 'light' ? (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-indigo-400" />
                )}
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Kích thước chữ</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFontSize('small')}
                  className={`p-2 rounded-md ${
                    fontSize === 'small'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-lightest'
                  }`}
                >
                  Nhỏ
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`p-2 rounded-md ${
                    fontSize === 'medium'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-lightest'
                  }`}
                >
                  Vừa
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`p-2 rounded-md ${
                    fontSize === 'large'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-lightest'
                  }`}
                >
                  Lớn
                </button>
              </div>
            </div>
          </Card>
          
          <Card className="mt-6">
            <h2 className="text-lg font-medium mb-4">Tài khoản</h2>
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center w-full p-3 text-red-500 border border-red-200 rounded-md hover:bg-red-50"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Xóa tài khoản
            </button>
          </Card>
        </div>
      </div>
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Xác nhận xóa tài khoản</h3>
            <p className="mb-4 text-neutral-dark">
              Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất và không thể khôi phục.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                variant="danger"
                onClick={handleDeleteAccount}
              >
                Xóa tài khoản
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;