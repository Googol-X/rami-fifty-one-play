import { useSearchParams } from 'react-router-dom';

export function useDevMode() {
  const [searchParams] = useSearchParams();
  return searchParams.get('dev') === '1';
}
