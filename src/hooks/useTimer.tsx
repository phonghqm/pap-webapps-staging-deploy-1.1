import { useCallback, useEffect, useRef, useState } from 'react';

const useTimer = (time: number, end = 0, step = 1) => {
  const [timer, setTimer] = useState(time);
  const ref = useRef<any>(null);

  const reset = useCallback(() => {
    setTimer(time);
  }, [time]);

  const start = useCallback(() => {
    ref.current = setInterval(() => {
      setTimer(t => t - step);
    }, 1000);
  }, [step]);

  const clear = useCallback(() => {
    if (ref.current) {
      clearInterval(ref.current);
    }
  }, []);

  useEffect(() => {
    if (timer <= end) {
      clear();
    }
  }, [timer, end, clear]);

  return [timer, start, clear, reset] as [
    number,
    () => void,
    () => void,
    () => void,
  ];
};

export default useTimer;
