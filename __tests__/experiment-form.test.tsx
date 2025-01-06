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
    // Reset the mock implementations for each test
    mockSupabase.from.mockImplementation(() => ({
      insert: jest.fn(() => ({
        then: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
    }));
  });

  it('renders all form fields', () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    expect(screen.getByLabelText('Experiment Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly')).toBeInTheDocument();
    expect(screen.getByLabelText('Daily')).toBeInTheDocument();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      id: 1,
      name: 'Test Experiment',
      systemPrompt: 'Test Prompt',
      frequency: 'hourly',
      created_at: '2024-01-01'
    };

    render(
      <ExperimentForm 
        onSubmit={mockOnSubmit} 
        supabase={mockSupabase} 
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue('Test Experiment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly')).toBeChecked();
  });

  it('validates required fields', async () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    // Try to submit empty form
    await userEvent.click(screen.getByText('Save'));

    // Check for validation messages
    expect(await screen.findByText('Experiment name is required')).toBeInTheDocument();
    expect(await screen.findByText('System prompt is required')).toBeInTheDocument();
  });

  it('handles form submission for new experiment', async () => {
    render(<ExperimentForm onSubmit={mockOnSubmit} supabase={mockSupabase} />);

    // Fill out form
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'New Experiment');
    await userEvent.type(screen.getByLabelText('System Prompt'), 'Test system prompt');
    await userEvent.click(screen.getByLabelText('Daily'));

    // Submit form
    await userEvent.click(screen.getByText('Save'));

    // Verify Supabase insert was called with correct data
    expect(mockSupabase.from).toHaveBeenCalledWith('experiments');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
      name: 'New Experiment',
      systemPrompt: 'Test system prompt',
      frequency: 'daily'
    }]);

    // Verify onSubmit callback was called
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('handles form submission for editing experiment', async () => {
    const initialData = {
      id: 1,
      name: 'Test Experiment',
      systemPrompt: 'Test Prompt',
      frequency: 'hourly',
      created_at: '2024-01-01'
    };

    render(
      <ExperimentForm 
        onSubmit={mockOnSubmit} 
        supabase={mockSupabase} 
        initialData={initialData}
      />
    );

    // Modify form
    await userEvent.clear(screen.getByLabelText('Experiment Name'));
    await userEvent.type(screen.getByLabelText('Experiment Name'), 'Updated Experiment');

    // Submit form
    await userEvent.click(screen.getByText('Save'));

    // Verify Supabase update was called with correct data
    expect(mockSupabase.from).toHaveBeenCalledWith('experiments');
    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      name: 'Updated Experiment',
      status: 'active',
      frequency: 'hourly'
    });
    expect(mockSupabase.from().update().eq()).toHaveBeenCalledWith('id', 1);

    // Verify onSubmit callback was called
    expect(mockOnSubmit).toHaveBeenCalled();
  });
}); 