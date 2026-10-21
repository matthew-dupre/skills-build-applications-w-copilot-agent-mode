import { useEffect, useState } from 'react';
import { getJson } from './client.js';

export type ApiResourceState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T };

export function useApiResource<T>(path: string): ApiResourceState<T> {
  const [state, setState] = useState<ApiResourceState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [path]);

  return state;
}