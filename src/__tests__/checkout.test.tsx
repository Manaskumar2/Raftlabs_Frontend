import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import CheckoutPage from '@/app/(main)/checkout/page';
import { useCartStore } from '@/store/cart.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersService } from '@/services/orders.service';

vi.mock('@/store/cart.store', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/services/orders.service', () => ({
  ordersService: {
    createOrder: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CheckoutPage', () => {
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  it('renders empty cart message when cart is empty', () => {
    (useCartStore as unknown as Mock).mockReturnValue({
      items: [],
      getSubtotal: vi.fn().mockReturnValue(0),
      total: 0,
    });

    renderWithProviders(<CheckoutPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/menu');
  });

  it('renders checkout form when cart has items', () => {
    (useCartStore as unknown as Mock).mockReturnValue({
      items: [{ menuItemId: 'item-1', name: 'Pizza', price: 10, quantity: 1 }],
      getSubtotal: vi.fn().mockReturnValue(10),
      total: 10,
    });

    renderWithProviders(<CheckoutPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const mockClearCart = vi.fn();
    (useCartStore as unknown as Mock).mockReturnValue({
      items: [{ menuItemId: 'item-1', name: 'Pizza', price: 10, quantity: 1 }],
      getSubtotal: vi.fn().mockReturnValue(10),
      total: 10,
      clearCart: mockClearCart,
    });

    (ordersService.createOrder as Mock).mockResolvedValue({ id: 'RL-123' });

    renderWithProviders(<CheckoutPage />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+1234567890' } });
    fireEvent.change(screen.getByLabelText(/delivery address/i), { target: { value: '123 Main St' } });

    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(ordersService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'John Doe',
          phoneNumber: '+1234567890',
          deliveryAddress: '123 Main St',
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        }),
        expect.anything()
      );
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/orders/RL-123');
    });
  });
});
