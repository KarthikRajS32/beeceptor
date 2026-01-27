import { useEffect } from 'react';
import { getQueryHeaderRules } from './queryHeaderRuleEngine';

export const useSyncQueryHeaderRules = () => {
  useEffect(() => {
    const syncRules = async () => {
      try {
        const rules = getQueryHeaderRules();
        await fetch('http://localhost:3001/api/query-header-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules }),
        });
      } catch (error) {
        console.error('Failed to sync query/header rules:', error);
      }
    };

    syncRules();
    const interval = setInterval(syncRules, 5000);
    return () => clearInterval(interval);
  }, []);
};
