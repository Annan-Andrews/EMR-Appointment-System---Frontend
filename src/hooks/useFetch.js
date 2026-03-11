// src/hooks/useFetch.js
import { useState, useEffect } from "react";

const useFetch = (apiFn, params = null, refreshKey = 0) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!apiFn) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn(params);
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [JSON.stringify(params), refreshKey]); // ← refreshKey added

  return { data, loading, error };
};

export default useFetch;