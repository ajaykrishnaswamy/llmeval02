import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('test_cases')
          .select(`
            *,
            experiment:experiments (
              id,
              name
            )
          `);
        
        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: 'Error fetching test cases' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('test_cases')
          .insert([req.body])
          .select();
        
        if (error) throw error;
        return res.status(201).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Error creating test case' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 