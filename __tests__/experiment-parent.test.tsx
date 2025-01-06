import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentParent } from '@/components/experiment-parent';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Or alternatively, mock the environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'fake-url';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-key';

describe('ExperimentParent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders create experiment button', () => {
    render(<ExperimentParent />);
    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
  });

  it('opens create dialog when create button is clicked', async () => {
    render(<ExperimentParent />);
    const createButton = screen.getByText('Create New Experiment');
    await userEvent.click(createButton);
    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
    expect(screen.getByLabelText('Experiment Name')).toBeInTheDocument();
  });

  it('loads and displays experiments', async () => {
    render(<ExperimentParent />);
    await waitFor(() => {
      expect(screen.getByText('Test Exp')).toBeInTheDocument();
    });
  });

  it('handles experiment creation', async () => {
    const mockSupabase = createClient('', '');
    const mockDelete = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });
    (mockDelete as any).eq = mockEq;

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            name: 'Test Exp', 
            systemPrompt: 'Test Prompt',
            input_prompt: 'Test Input',
            created_at: '2024-01-01',
            mistral: true,
            google: false,
            meta: true
          }
        ], 
        error: null 
      })),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: mockDelete,
    });

    render(<ExperimentParent />);

    // Click create button
    await userEvent.click(screen.getByText('Create New Experiment'));

    // Fill out form
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'New Experiment');
    await userEvent.type(screen.getByLabelText('System Prompt'), 'New System Prompt');
    await userEvent.type(screen.getByLabelText('Test Prompt'), 'New Test Prompt');
    
    // Submit form
    await userEvent.click(screen.getByText('Save'));

    // Verify Supabase was called correctly
    expect(mockSupabase.from('experiments').insert).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'New Experiment',
        systemPrompt: 'New System Prompt',
        input_prompt: 'New Test Prompt'
      })
    ]);
  });

  it('handles experiment editing', async () => {
    const mockSupabase = createClient('', '');
    render(<ExperimentParent />);

    // Wait for experiments to load
    await waitFor(() => {
      expect(screen.getByText('Test Exp')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = await screen.findAllByText('Edit');
    await userEvent.click(editButtons[0]);

    // Verify edit form is populated
    expect(screen.getByDisplayValue('Test Exp')).toBeInTheDocument();

    // Edit name
    await userEvent.clear(screen.getByLabelText('Experiment Name'));
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'Updated Experiment');

    // Submit form
    await userEvent.click(screen.getByText('Save'));

    // Verify Supabase was called correctly
    expect(mockSupabase.from('experiments').update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Experiment'
      })
    );
  });

  it('handles experiment deletion', async () => {
    const mockSupabase = createClient('', '');
    window.confirm = jest.fn(() => true); // Mock confirm dialog
    render(<ExperimentParent />);

    // Wait for experiments to load
    await waitFor(() => {
      expect(screen.getByText('Test Exp')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalled();

    // Verify Supabase delete was called
    expect(mockSupabase.from('experiments').delete().eq).toHaveBeenCalledWith('id', 1);
  });

  it('shows error handling for failed operations', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const mockSupabase = createClient('', '');
    (mockSupabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Test error') }),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      url: '',
      headers: {},
      upsert: jest.fn(),
    });

    render(<ExperimentParent />);

    // Attempt to create an experiment
    await userEvent.click(screen.getByText('Create New Experiment'));
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'New Experiment');
    await userEvent.click(screen.getByText('Save'));

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error saving experiment:',
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });
}); 