import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Đăng ký các thành phần ChartJS cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatLineChart = ({
  datasets = [], // Set default empty array
  labels = [], // Set default empty array
  title = 'Biểu đồ theo thời gian',
  height = 300,
}) => {
  // Kiểm tra xem datasets và labels có tồn tại không
  if (!datasets || !labels || datasets.length === 0 || labels.length === 0) {
    return (
      <div style={{ height: `${height}px`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Tạo dữ liệu cho biểu đồ
  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  // Cấu hình tùy chọn cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      x: {
        display: true,
        title: {
          display: true
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StatLineChart;