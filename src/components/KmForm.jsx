import React from 'react';

export function KmForm({ kmInicial, kmFinal, setKmInicial, setKmFinal }) {
  return (
    <div className="km-row">
      <div className="input-group" style={{ flex: 1 }}>
        <label className="obrigatorio-asterisco">🚗 KM INICIAL (Veículo)</label>
        <input type="number" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} placeholder="Ex: 15200" step="1" min="0" />
      </div>
      <div className="input-group" style={{ flex: 1 }}>
        <label className="obrigatorio-asterisco">🚗 KM FINAL (Veículo)</label>
        <input type="number" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} placeholder="Ex: 15840" step="1" min="0" />
      </div>
    </div>
  );
}
