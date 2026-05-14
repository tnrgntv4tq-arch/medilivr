'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-dark-100">
        <h2 className="text-xl font-bold text-dark-900 mb-2">Erreur</h2>
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4 font-mono break-all">
          {error.message}
        </p>
        {error.stack && (
          <details className="mb-4">
            <summary className="text-xs text-dark-400 cursor-pointer">Stack trace</summary>
            <pre className="text-[10px] text-dark-500 mt-2 overflow-auto max-h-40 bg-dark-50 p-2 rounded-lg">
              {error.stack}
            </pre>
          </details>
        )}
        <button onClick={reset} className="btn-primary w-full">
          Réessayer
        </button>
      </div>
    </div>
  );
}
