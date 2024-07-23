import { useCallback, useEffect, useRef, useState } from 'react';

const useTimer = (from = 0, step = 1) => {
  const [timer, setTimer] = useState(from);
  const ref = useRef<any>(null);

  const start = useCallback(() => {
    ref.current = setInterval(() => {
      setTimer(t => t + step);
    }, 1000);
  }, [step]);

  const clear = useCallback(() => {
    setTimer(from);
    if (ref.current) {
      clearInterval(ref.current);
    }
  }, [from]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return [timer, start, clear] as [number, () => void, () => void];
};

export default useTimer;
