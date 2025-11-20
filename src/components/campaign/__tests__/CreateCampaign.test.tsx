import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCampaign } from '../CreateCampaign';

// Mock dos hooks e componentes
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: () => ({ current: { focus: vi.fn(), value: '' } }),
  };
});

describe('CreateCampaign Component', () => {
  it('renders the component with all elements', () => {
    render(<CreateCampaign />);
    
    // Verificar se o título está presente
    expect(screen.getByText('Criar Nova Campanha')).toBeInTheDocument();
    
    // Verificar se o subtítulo está presente
    expect(screen.getByText('Descreva sua campanha e deixe a mágica acontecer')).toBeInTheDocument();
    
    // Verificar se o textarea está presente
    expect(screen.getByLabelText('Descrição da campanha')).toBeInTheDocument();
    
    // Verificar se o botão de envio está presente (inicialmente desabilitado)
    expect(screen.getByLabelText('Criar campanha')).toBeInTheDocument();
    
    // Verificar se as tags de validação estão presentes
    expect(screen.getByText('Quantidade definida')).toBeInTheDocument();
    expect(screen.getByText('Perfil selecionado')).toBeInTheDocument();
    expect(screen.getByText('Segmento escolhido')).toBeInTheDocument();
  });

  it('shows validation tags as invalid initially', () => {
    render(<CreateCampaign />);
    
    // As tags devem estar em estado pendente (cinza)
    const quantityTag = screen.getByText('Quantidade definida').closest('div');
    const profileTag = screen.getByText('Perfil selecionado').closest('div');
    const segmentTag = screen.getByText('Segmento escolhido').closest('div');
    
    expect(quantityTag).toHaveClass('bg-gray-100', 'text-gray-500');
    expect(profileTag).toHaveClass('bg-gray-100', 'text-gray-500');
    expect(segmentTag).toHaveClass('bg-gray-100', 'text-gray-500');
  });

  it('validates quantity input and updates tag', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input com quantidade
    await user.type(textarea, 'Quero 3 lives');
    
    // Aguardar a validação em tempo real
    await waitFor(() => {
      const quantityTag = screen.getByText('Quantidade definida').closest('div');
      expect(quantityTag).toHaveClass('bg-green-100', 'text-green-700');
      expect(screen.getByText('(3 lives)')).toBeInTheDocument();
    });
  });

  it('validates profile input and updates tag', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input com perfil
    await user.type(textarea, 'Creators micro');
    
    // Aguardar a validação em tempo real
    await waitFor(() => {
      const profileTag = screen.getByText('Perfil selecionado').closest('div');
      expect(profileTag).toHaveClass('bg-green-100', 'text-green-700');
      expect(screen.getByText('(micro)')).toBeInTheDocument();
    });
  });

  it('validates segment input and updates tag', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input com segmento
    await user.type(textarea, 'Segmento fitness');
    
    // Aguardar a validação em tempo real
    await waitFor(() => {
      const segmentTag = screen.getByText('Segmento escolhido').closest('div');
      expect(segmentTag).toHaveClass('bg-green-100', 'text-green-700');
      expect(screen.getByText('(fitness)')).toBeInTheDocument();
    });
  });

  it('enables submit button when all validations pass', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    const submitButton = screen.getByLabelText('Criar campanha');
    
    // Inicialmente desabilitado
    expect(submitButton).toBeDisabled();
    
    // Digitar input completo
    await user.type(textarea, 'Quero 5 lives com creators micro de fitness');
    
    // Aguardar todas as validações
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows helper text for incomplete input', () => {
    render(<CreateCampaign />);
    
    expect(screen.getByText('Dica: mencione quantidade (ex: "3 lives"), perfil (ex: "micro") e segmento (ex: "fitness")')).toBeInTheDocument();
  });

  it('shows success helper text when all validations pass', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input completo
    await user.type(textarea, 'Quero 2 lives com creators mid de lifestyle');
    
    // Aguardar validação completa
    await waitFor(() => {
      expect(screen.getByText('✨ Pronto! Pressione Enter ou clique no botão para continuar')).toBeInTheDocument();
    });
  });

  it('handles Enter key submission when valid', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input completo
    await user.type(textarea, 'Quero 4 lives com creators top de beauty');
    
    // Aguardar validação
    await waitFor(() => {
      expect(screen.getByText('✨ Pronto! Pressione Enter ou clique no botão para continuar')).toBeInTheDocument();
    });
    
    // Pressionar Enter
    await user.type(textarea, '{Enter}');
    
    // Verificar se mostra loading (o componente vai para a tela de resultados)
    await waitFor(() => {
      expect(screen.queryByText('Criar Nova Campanha')).not.toBeInTheDocument();
    });
  });

  it('handles Escape key to clear input', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar algo
    await user.type(textarea, 'Quero 3 lives');
    
    // Verificar que tem texto
    expect(textarea).toHaveValue('Quero 3 lives');
    
    // Pressionar Escape
    await user.type(textarea, '{Escape}');
    
    // Verificar que limpou o input
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar input completo
    await user.type(textarea, 'Quero 3 lives com creators micro de fitness');
    
    // Aguardar validação
    await waitFor(() => {
      expect(screen.getByText('✨ Pronto! Pressione Enter ou clique no botão para continuar')).toBeInTheDocument();
    });
    
    // Clicar no botão
    const submitButton = screen.getByLabelText('Criar campanha');
    await user.click(submitButton);
    
    // Verificar estado de loading
    await waitFor(() => {
      expect(screen.queryByRole('status')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Verificar atributos de acessibilidade
    expect(textarea).toHaveAttribute('aria-label', 'Descrição da campanha');
    expect(textarea).toHaveAttribute('aria-describedby', 'input-helper');
    expect(textarea).toHaveAttribute('aria-invalid', 'false');
    expect(textarea).toHaveAttribute('aria-busy', 'false');
    
    // Verificar que o helper tem o ID correto
    expect(screen.getByText('Dica: mencione quantidade (ex: "3 lives"), perfil (ex: "micro") e segmento (ex: "fitness")')).toHaveAttribute('id', 'input-helper');
  });

  it('updates aria-invalid when input is invalid', async () => {
    const user = userEvent.setup();
    render(<CreateCampaign />);
    
    const textarea = screen.getByLabelText('Descrição da campanha');
    
    // Digitar algo inválido (apenas texto sem critérios)
    await user.type(textarea, 'Quero creators');
    
    // Aguardar validação
    await waitFor(() => {
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('has proper ARIA attributes on validation tags', () => {
    render(<CreateCampaign />);
    
    const validationContainer = screen.getByRole('status');
    expect(validationContainer).toHaveAttribute('aria-live', 'polite');
    
    const tags = screen.getAllByRole('status');
    tags.forEach(tag => {
      expect(tag).toHaveAttribute('aria-label');
    });
  });
});