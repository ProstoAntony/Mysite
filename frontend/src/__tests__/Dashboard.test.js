import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../views/Dashboard';
import AuthContext from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import useAxios from '../utils/useAxios';

// Мокаем useAxios
jest.mock('../utils/useAxios');

// Мокаем jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(),
  jwtDecode: jest.fn()
}));

describe('Dashboard Component', () => {
  // Настройка перед каждым тестом
  beforeEach(() => {
    // Мокаем localStorage
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ access: 'fake-token' }));
    
    // Мокаем useAxios
    useAxios.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { response: 'Test response' } }),
      post: jest.fn().mockResolvedValue({ data: { response: 'Test post response' } })
    });
    
    // Мокаем jwt-decode
    require('jwt-decode').jwtDecode.mockReturnValue({
      user_id: '1',
      username: 'testuser',
      full_name: 'Test User',
      image: 'test-image.jpg',
      user_type: 'Admin'
    });
  });

  // Очистка после каждого теста
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard for admin users', async () => {
    // Создаем мок для AuthContext
    const authContextValue = {
      user: {
        user_id: '1',
        email: 'test@example.com',
        user_type: 'Admin',
        is_staff: true
      }
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <CartProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </CartProvider>
      </AuthContext.Provider>
    );

    // Проверяем, что заголовок дашборда отображается
    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });
    
    // Проверяем, что API был вызван
    expect(useAxios().get).toHaveBeenCalledWith('/test/');
    expect(useAxios().post).toHaveBeenCalledWith('/test/');
  });

  test('redirects non-admin users', async () => {
    // Создаем мок для AuthContext с не-админом
    const authContextValue = {
      user: {
        user_id: '2',
        email: 'customer@example.com',
        user_type: 'Customer',
        is_staff: false
      }
    };

    const { container } = render(
      <AuthContext.Provider value={authContextValue}>
        <CartProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </CartProvider>
      </AuthContext.Provider>
    );

    // Проверяем, что произошел редирект (контейнер пустой)
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });
});