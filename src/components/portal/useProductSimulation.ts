import { useEffect, useState } from 'react';
import { api, type SimulacionCredito } from '../../api';

export function useProductSimulation(productId: number | null | undefined, monto: number, plazo: number, enabled = true) {
  const [result, setResult] = useState<{key: string; data: SimulacionCredito} | null>(null);
  const [failure, setFailure] = useState<{key: string; message: string} | null>(null);
  const requestKey = productId + ':' + monto + ':' + plazo;
  useEffect(() => {
    if (!enabled || !productId) return;
    setResult(null);
    setFailure(null);
    let active = true;
    const timer = setTimeout(() => {
      api.simularProductoPublico({idProductoCredito: productId, montoSolicitado: monto, plazo})
        .then(data => { if (active) { setResult({key: requestKey, data}); setFailure(null); } })
        .catch(error => { if (active) setFailure({key: requestKey, message: error instanceof Error ? error.message : 'No se pudo calcular la simulación'}); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [productId, monto, plazo, enabled, requestKey]);
  const simulation = enabled && result?.key === requestKey ? result.data : null;
  const error = enabled && failure?.key === requestKey ? failure.message : '';
  return {simulation, error, loading: enabled && !!productId && !simulation && !error};
}
