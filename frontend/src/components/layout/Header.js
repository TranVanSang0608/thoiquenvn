import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-primary">
                    ThóiQuenVN
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center">
                {isAuthenticated ? (
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="flex text-sm rounded-full focus:outline-none">
                        <span className="sr-only">Mở menu người dùng</span>
                        <UserCircleIcon className="h-8 w-8 text-primary" />
                      </Menu.Button>
                    </div>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <div className="px-4 py-2 text-sm text-neutral-dark border-b">
                              <p>Xin chào,</p>
                              <p className="font-semibold">{user?.name}</p>
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-neutral-lightest' : ''
                              } block px-4 py-2 text-sm text-neutral-dark`}
                            >
                              Cài đặt tài khoản
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-neutral-lightest' : ''
                              } block w-full text-left px-4 py-2 text-sm text-red-600`}
                            >
                              Đăng xuất
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-neutral-dark hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
                  <span className="sr-only">Mở menu chính</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Dashboard
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/calendar"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Lịch
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/stats"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Thống kê
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/mood"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Tâm trạng
                  </Disclosure.Button>
                </>
              ) : (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Đăng nhập
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-dark hover:bg-neutral-lightest"
                  >
                    Đăng ký
                  </Disclosure.Button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;