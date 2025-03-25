import { useCallback, useRef, useEffect } from 'react';

/**
 * 节流钩子，限制函数调用频率
 * @param fn 需要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 清理函数
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        fn(...args);
        lastRun.current = now;
      } else {
        // 如果距离上次执行时间小于延迟时间，设置一个定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fn(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [fn, delay]
  );
}

export default useThrottle; 