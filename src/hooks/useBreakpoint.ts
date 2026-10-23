import { useEffect, useState } from 'react';

const QUERY = '(min-width: 768px)';

export function useBreakpoint() {
  const [wide, setWide] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setWide(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return { wide, isPhone: !wide };
}
