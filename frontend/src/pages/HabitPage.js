import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabit } from '../context/HabitContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import HabitForm from '../components/habits/HabitForm';
import { format, parseISO, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const HabitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getHabitById, currentHabit, updateHabit, deleteHabit, loading } = useHabit();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [completionHistory, setCompletionHistory] = useState([]);
  
  useEffect(() => {
    getHabitById(id);
  }, [getHabitById, id]);
  
  useEffect(() => {
    if (currentHabit) {
      // Tạo lịch sử giả lập 7 ngày gần nhất
      const today = new Date();
      const history = [];
      
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        
        // Giả lập dữ liệu hoàn thành (thực tế sẽ lấy từ API)
        const completed = Math.random() > 0.3; // 70% khả năng hoàn thành
        
        history.push({
          date,
          completed,
        });
      }
      
      setCompletionHistory(history);
    }
  }, [currentHabit]);
  
  const handleEditSubmit = async (habitData) => {
    try {
      await updateHabit(id, habitData);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi cập nhật thói quen:', err);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteHabit(id);
      navigate('/');
    } catch (err) {
      console.error('Lỗi khi xóa thói quen:', err);
    }
  };
  
  if (loading || !currentHabit) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-neutral hover:text-primary mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Quay lại
      </button>
      
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `${currentHabit.color}40` }}
            >
              <span className="text-2xl" role="img" aria-label={currentHabit.title}>
                {currentHabit.icon}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">
                {currentHabit.title}
              </h1>
              <p className="text-neutral">
                {currentHabit.category === 'health' && 'Sức khỏe'}
                {currentHabit.category === 'learning' && 'Học tập'}
                {currentHabit.category === 'work' && 'Công việc'}
                {currentHabit.category === 'personal' && 'Cá nhân'}
                {currentHabit.category === 'general' && 'Chung'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Sửa
            </Button>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              variant="danger"
              className="flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </div>
        </div>
        
        {currentHabit.description && (
          <div className="mt-6 p-4 bg-neutral-lightest rounded-md">
            <p className="text-neutral-dark">{currentHabit.description}</p>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-neutral-dark mb-2">Thông tin</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral">Chuỗi ngày hiện tại:</span>
                <span className="font-medium">{currentHabit.streak?.current || 0} ngày</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral">Chuỗi ngày tốt nhất:</span>
                <span className="font-medium">{currentHabit.streak?.longest || 0} ngày</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral">Tần suất:</span>
                <span className="font-medium">
                  {currentHabit.frequency?.type === 'daily' && 'Hàng ngày'}
                  {currentHabit.frequency?.type === 'weekly' && 'Theo tuần'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral">Nhắc nhở:</span>
                <span className="font-medium">
                  {currentHabit.reminder?.enabled ? `${currentHabit.reminder.time}` : 'Tắt'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral">Ngày tạo:</span>
                <span className="font-medium">
                  {format(parseISO(currentHabit.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-dark mb-2">Lịch sử gần đây</h3>
            <div className="space-y-2">
              {completionHistory.map((item, index) => (
                <div key={index} className="flex items-center py-2 border-b">
                  <div className="w-8">
                    {item.completed ? (
                      <CheckCircleIcon className="h-6 w-6 text-success" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-neutral-light" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-neutral-dark">
                      {format(item.date, 'EEEE, dd/MM', { locale: vi })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa thói quen"
      >
        <HabitForm
          habit={currentHabit}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xóa thói quen"
      >
        <div className="p-4">
          <p className="text-neutral-dark mb-6">
            Bạn có chắc chắn muốn xóa thói quen "{currentHabit.title}"? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Xóa thói quen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitPage;