import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const { data, error } = await supabase
          .from("experiments")
          .update(req.body)
          .eq("id", id)
          .select();
        
        if (error) throw error;
        return res.status(200).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Error updating experiment' });
      }

    case 'DELETE':
      try {
        // First delete all associated test cases
        const { error: testCasesError } = await supabase
          .from('test_cases')
          .delete()
          .eq('experiment_id', id);
        
        if (testCasesError) throw testCasesError;

        // Then delete the experiment
        const { error: experimentError } = await supabase
          .from("experiments")
          .delete()
          .eq("id", id);
        
        if (experimentError) throw experimentError;
        
        return res.status(200).json({ message: 'Experiment and associated test cases deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Error deleting experiment' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 