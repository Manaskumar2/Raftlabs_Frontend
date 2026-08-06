import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import DashboardPage from '@/app/(main)/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';

vi.mock('@/services/orders.service', () => ({
  ordersService: {
    getOrders: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('DashboardPage', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    (ordersService.getOrders as Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<DashboardPage />);
    // Loading spinner is rendered, hard to query by role, but we can check if content is hidden
    expect(screen.queryByText(/total orders/i)).not.toBeInTheDocument();
  });

  it('renders dashboard statistics correctly', async () => {
    (ordersService.getOrders as Mock).mockResolvedValue({
      data: [
        { id: 'RL-1', totalAmount: '20.00', status: 'DELIVERED', items: [], createdAt: new Date().toISOString() },
        { id: 'RL-2', totalAmount: '30.00', status: 'ORDER_RECEIVED', items: [], createdAt: new Date().toISOString() },
      ],
      meta: { total: 2 },
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      // Total orders
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      // Total revenue (20 for DELIVERED)
      expect(screen.getAllByText('$20.00').length).toBeGreaterThan(0);
      // Pending orders (ORDER_RECEIVED)
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  it('renders empty state if no orders', async () => {
    (ordersService.getOrders as Mock).mockResolvedValue({
      data: [],
      meta: { total: 0 },
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });
});
