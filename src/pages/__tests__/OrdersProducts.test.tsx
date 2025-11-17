import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import OrdersProducts from '../../pages/OrdersProducts';
import { MemoryRouter } from 'react-router-dom';

describe('OrdersProducts page', () => {
  it('renders tabs and filters', () => {
    render(<MemoryRouter><OrdersProducts /></MemoryRouter>);
    const root = within(screen.getAllByRole('main')[0]);
    expect(root.getByRole('tab', { name: /Orders/i })).toBeInTheDocument();
    expect(root.getByRole('tab', { name: /Products/i })).toBeInTheDocument();
    expect(root.getByLabelText(/Status filter/i)).toBeInTheDocument();
    expect(root.getByLabelText(/Sort key/i)).toBeInTheDocument();
  });

  it('filters orders by search', () => {
    render(<MemoryRouter><OrdersProducts /></MemoryRouter>);
    const root = within(screen.getAllByRole('main')[0]);
    const search = root.getAllByPlaceholderText(/Search by name, SKU, or ID/i)[0];
    fireEvent.change(search, { target: { value: 'ORD-1002' } });
    expect(root.getAllByRole('table', { name: /Orders table/i })[0]).toBeInTheDocument();
    expect(root.getAllByText('ORD-1002')[0]).toBeInTheDocument();
  });

  it('shows orders table by default', () => {
    render(<MemoryRouter><OrdersProducts /></MemoryRouter>);
    const root = within(screen.getAllByRole('main')[0]);
    expect(root.getAllByRole('table', { name: /Orders table/i })[0]).toBeInTheDocument();
  });

  it('switches to products tab and shows table with actions', () => {
    render(<MemoryRouter><OrdersProducts /></MemoryRouter>);
    const root = within(screen.getAllByRole('main')[0]);
    fireEvent.click(root.getByRole('button', { name: /Clear/i }));
    const tablist = root.getAllByRole('tablist', { name: /Orders and Products/i })[0];
    const productsTab = within(tablist).getByRole('tab', { name: /Products/i });
    fireEvent.click(productsTab);
    const productsTable = root.getAllByRole('table', { name: /Products table/i })[0];
    expect(productsTable).toBeInTheDocument();
    expect(root.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(root.getAllByText(/Edit/i)[0]).toBeInTheDocument();
    expect(root.getAllByText(/Delete/i)[0]).toBeInTheDocument();
  });
});