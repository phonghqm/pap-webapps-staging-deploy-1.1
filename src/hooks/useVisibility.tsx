import { useEffect, useRef, useState } from 'react';
import { isInViewport } from 'utils/helpers';

function useVisibility() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleCheck = () => {
      if (!ref.current) return;
      if (isInViewport(ref.current)) {
        setVisible(true);
      }
    };

    document.addEventListener('scroll', handleCheck);

    return () => document.removeEventListener('scroll', handleCheck);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (isInViewport(ref.current)) {
      setVisible(true);
    }
  }, [ref]);

  return [ref, visible] as [React.RefObject<HTMLDivElement>, boolean];
}
export default useVisibility;
