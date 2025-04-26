import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-light">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral">
          &copy; {new Date().getFullYear()} ThóiQuenVN. Xây dựng thói quen tốt mỗi ngày.
        </p>
      </div>
    </footer>
  );
};

export default Footer;