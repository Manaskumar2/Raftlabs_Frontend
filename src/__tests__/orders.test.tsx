import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import OrdersPage from '@/app/(main)/orders/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';

vi.mock('@/services/orders.service', () => ({
  ordersService: {
    getOrders: vi.fn(),
  },
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  it('renders phone number form initially', () => {
    renderWithProviders(<OrdersPage />);
    expect(screen.getByText(/Find Your Orders/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1234567890')).toBeInTheDocument();
  });

  it('renders orders fetched from backend after phone number submission', async () => {
    (ordersService.getOrders as Mock).mockResolvedValue({
      data: [
        { id: 'RL-TEST1', customerName: 'Alice', status: 'PREPARING', totalAmount: '50.00', items: [], createdAt: new Date().toISOString() },
      ],
      meta: { totalPages: 1 },
    });

    renderWithProviders(<OrdersPage />);

    // Submit phone number form
    const phoneInput = screen.getByPlaceholderText('+1234567890');
    fireEvent.change(phoneInput, { target: { value: '+1987654321' } });
    fireEvent.click(screen.getByRole('button', { name: /view orders/i }));

    await waitFor(() => {
      expect(screen.getByText(/RL-LTEST1/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
      expect(screen.getByText(/PREPARING/i)).toBeInTheDocument();
    });
  });

  it('triggers search with debounce when typing', async () => {
    (ordersService.getOrders as Mock).mockResolvedValue({
      data: [],
      meta: { totalPages: 1 },
    });

    renderWithProviders(<OrdersPage />);

    // Submit phone number form
    const phoneInput = screen.getByPlaceholderText('+1234567890');
    fireEvent.change(phoneInput, { target: { value: '+1987654321' } });
    fireEvent.click(screen.getByRole('button', { name: /view orders/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by id or name.../i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by id or name.../i);
    fireEvent.change(searchInput, { target: { value: 'RL-TEST' } });

    await waitFor(() => {
      expect(ordersService.getOrders).toHaveBeenCalledWith('+1987654321', 1, 10, 'RL-TEST');
    }, { timeout: 1000 }); // Wait for 500ms debounce
  });

  it('renders empty state when no orders match', async () => {
    (ordersService.getOrders as Mock).mockResolvedValue({
      data: [],
      meta: { totalPages: 1 },
    });

    renderWithProviders(<OrdersPage />);

    // Submit phone number form
    const phoneInput = screen.getByPlaceholderText('+1234567890');
    fireEvent.change(phoneInput, { target: { value: '+1987654321' } });
    fireEvent.click(screen.getByRole('button', { name: /view orders/i }));

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });
});
