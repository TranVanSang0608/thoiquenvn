import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    if (authError) {
      setError(authError);
    }
  }, [isAuthenticated, authError, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    try {
      await register(name, email, password);
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại sau.');
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-lightest py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">ThóiQuenVN</h1>
          <p className="mt-2 text-neutral">Xây dựng thói quen tốt mỗi ngày</p>
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-bold text-neutral-dark">
          Đăng ký tài khoản
        </h2>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">
                Họ tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Nguyễn Văn A"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-dark">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="nguyenvana@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-dark">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-dark">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              fullWidth
              size="lg"
            >
              Đăng ký
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-dark">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Đăng nhập
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;