// 读取各单元的进度。status：loading / ready / unavailable（接口不可用）/ error（接口报错）
import { useCallback, useEffect, useRef, useState } from 'react';
import { learnApi } from '../api';

export default function useUnitStatuses() {
  const [state, setState] = useState({ status: 'loading', byKey: new Map(), error: null });
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const units = await learnApi.listUnits();
      if (mounted.current) {
        setState({ status: 'ready', byKey: new Map(units.map((unit) => [unit.key, unit])), error: null });
      }
    } catch (error) {
      if (mounted.current) {
        setState({ status: error.code === 'UNAVAILABLE' ? 'unavailable' : 'error', byKey: new Map(), error });
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  return { ...state, reload };
}
