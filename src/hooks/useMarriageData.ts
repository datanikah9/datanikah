import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MarriageRecord } from '../types/marriage';

export function useMarriageData(year: number) {
  const [data, setData] = useState<MarriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const marriageRef = collection(db, 'marriages');
        const q = query(
          marriageRef,
          where('tglNikah', '>=', startDate.toISOString()),
          where('tglNikah', '<=', endDate.toISOString())
        );

        const querySnapshot = await getDocs(q);
        const marriages: MarriageRecord[] = [];
        
        querySnapshot.forEach((doc) => {
          marriages.push({ id: doc.id, ...doc.data() } as MarriageRecord);
        });

        setData(marriages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [year]);

  return { data, loading, error };
}
