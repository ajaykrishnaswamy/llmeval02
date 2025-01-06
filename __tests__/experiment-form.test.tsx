import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentForm } from '@/components/experiment-form';

describe('ExperimentForm', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        then: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
    })),
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    expect(screen.getByLabelText('Experiment Name')).toBeInTheDocument();
    expect(screen.getByLabelText('System Prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Prompt')).toBeInTheDocument();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      id: 1,
      name: 'Test Experiment',
      systemPrompt: 'Test Prompt',
      input_prompt: 'Test Input',
      created_at: '2024-01-01',
      mistral: true,
      google: false,
      meta: true
    };

    render(
      <ExperimentForm 
        onSubmit={mockOnSubmit} 
        supabase={mockSupabase} 
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue('Test Experiment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Input')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    // Try to submit empty form
    await userEvent.click(screen.getByText('Save'));

    // Check for validation messages
    expect(await screen.findByText('Experiment name is required')).toBeInTheDocument();
    expect(await screen.findByText('System prompt is required')).toBeInTheDocument();
    expect(await screen.findByText('Input prompt is required')).toBeInTheDocument();
  });

  it('handles form submission for new experiment', async () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    // Fill out form
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'New Experiment');
    await userEvent.type(screen.getByLabelText('System Prompt'), 'Test system prompt');
    await userEvent.type(screen.getByLabelText('Test Prompt'), 'Test input prompt');

    // Submit form
    await userEvent.click(screen.getByText('Save'));

    // Verify Supabase insert was called with correct data
    expect(mockSupabase.from).toHaveBeenCalledWith('experiments');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
      name: 'New Experiment',
      systemPrompt: 'Test system prompt',
      input_prompt: 'Test input prompt',
      mistral: false,
      google: false,
      meta: false
    }]);

    // Verify onSubmit callback was called
    expect(mockOnSubmit).toHaveBeenCalled();
  });
}); 