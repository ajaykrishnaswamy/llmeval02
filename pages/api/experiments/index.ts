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
          .from("experiments")
          .select("*");
        
        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: 'Error fetching experiments' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from("experiments")
          .insert([req.body])
          .select();
        
        if (error) throw error;
        return res.status(201).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Error creating experiment' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 