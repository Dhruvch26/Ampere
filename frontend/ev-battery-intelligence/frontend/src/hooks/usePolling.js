import { useEffect, useRef, useState } from "react";

export function usePolling(fetcher, intervalMs = 4000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const cancelledRef = useRef(false);

  async function tick() {
    try {
      const result = await fetcherRef.current();
      if (!cancelledRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (!cancelledRef.current) setError(err);
    }
  }

  useEffect(() => {
    cancelledRef.current = false;
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Lets a caller force an immediate refresh (e.g. right after an action
  // that changed server state) instead of waiting for the next tick.
  return { data, error, refetch: tick };
}
