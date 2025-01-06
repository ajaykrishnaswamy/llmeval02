import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentsList } from '@/components/experiments-list';

describe('ExperimentsList', () => {
  const mockExperiments = [
    { 
      id: 1, 
      name: 'Test 1', 
      systemPrompt: 'Prompt 1', 
      input_prompt: 'Input 1', 
      created_at: '2024-01-01',
      mistral: true,
      google: false,
      meta: true
    },
    { 
      id: 2, 
      name: 'Test 2', 
      systemPrompt: 'Prompt 2', 
      input_prompt: 'Input 2', 
      created_at: '2024-01-02',
      mistral: false,
      google: true,
      meta: false
    },
  ];

  const mockFetchExperiments = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when no experiments', () => {
    render(
      <ExperimentsList 
        experiments={[]} 
        fetchExperiments={mockFetchExperiments}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Loading experiments...')).toBeInTheDocument();
  });

  it('renders experiments table with data', () => {
    render(
      <ExperimentsList 
        experiments={mockExperiments} 
        fetchExperiments={mockFetchExperiments}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Input 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Input 2')).toBeInTheDocument();
  });

  it('calls fetchExperiments on mount', () => {
    render(
      <ExperimentsList 
        experiments={mockExperiments} 
        fetchExperiments={mockFetchExperiments}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(mockFetchExperiments).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ExperimentsList 
        experiments={mockExperiments} 
        fetchExperiments={mockFetchExperiments}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await userEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockExperiments[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <ExperimentsList 
        experiments={mockExperiments} 
        fetchExperiments={mockFetchExperiments}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[1]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockExperiments[1].id);
  });
}); 