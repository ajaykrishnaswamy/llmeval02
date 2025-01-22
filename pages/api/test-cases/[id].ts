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
        // Extract only the fields we want to update
        const {
          test_case,
          expected_output,
          mistral_output,
          meta_output,
          google_output,
          mistral_factually,
          meta_factually,
          google_factually,
          unittest_input_mistral,
          unittest_input_meta,
          unittest_input_google,
          unittest_output_mistral,
          unittest_output_meta,
          unittest_output_google,
        } = req.body;

        const updateData = {
          ...(test_case !== undefined && { test_case }),
          ...(expected_output !== undefined && { expected_output }),
          ...(mistral_output !== undefined && { mistral_output }),
          ...(meta_output !== undefined && { meta_output }),
          ...(google_output !== undefined && { google_output }),
          ...(mistral_factually !== undefined && { mistral_factually }),
          ...(meta_factually !== undefined && { meta_factually }),
          ...(google_factually !== undefined && { google_factually }),
          ...(unittest_input_mistral !== undefined && { unittest_input_mistral }),
          ...(unittest_input_meta !== undefined && { unittest_input_meta }),
          ...(unittest_input_google !== undefined && { unittest_input_google }),
          ...(unittest_output_mistral !== undefined && { unittest_output_mistral }),
          ...(unittest_output_meta !== undefined && { unittest_output_meta }),
          ...(unittest_output_google !== undefined && { unittest_output_google }),
        };

        const { data, error } = await supabase
          .from('test_cases')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            experiment:experiments (
              id,
              name
            )
          `);
        
        if (error) throw error;
        return res.status(200).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Error updating test case' });
      }

    case 'DELETE':
      try {
        const { error } = await supabase
          .from('test_cases')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return res.status(200).json({ message: 'Test case deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Error deleting test case' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 