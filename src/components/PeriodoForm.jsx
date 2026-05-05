import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/l10n/pt';

export function PeriodoForm({ periodo, setPeriodo, onDefinirPeriodo }) {
  const inicioRef = useRef();
  const fimRef = useRef();

  useEffect(() => {
    flatpickr.localize(flatpickr.l10ns.pt);
    const inicioPicker = flatpickr(inicioRef.current, { dateFormat: "d/m/Y", locale: "pt", allowInput: false });
    const fimPicker = flatpickr(fimRef.current, { dateFormat: "d/m/Y", locale: "pt", allowInput: false });
    return () => {
      inicioPicker.destroy();
      fimPicker.destroy();
    };
  }, []);

  const handleConfirmar = () => {
    const inicioBR = inicioRef.current.value;
    const fimBR = fimRef.current.value;
    if (!inicioBR || !fimBR) {
      // O alerta será exibido no App
      onDefinirPeriodo(inicioBR, fimBR);
      return;
    }
    onDefinirPeriodo(inicioBR, fimBR);
  };

  return (
    <div className="flex-row">
      <div className="input-group">
        <label className="obrigatorio-asterisco">👤 VENDEDOR</label>
        <select value={periodo.vendedor} onChange={(e) => setPeriodo(prev => ({ ...prev, vendedor: e.target.value }))}>
          <option value="">-- Selecione o vendedor --</option>
          <option value="ALESSANDRO">ALESSANDRO</option>
          <option value="DELOI PLATEN">DELOI PLATEN</option>
          <option value="FÁBIO LIMA DE ALMEIDA">FÁBIO LIMA DE ALMEIDA</option>
          <option value="RENATO CARDOSO">RENATO CARDOSO</option>
          <option value="GIAN">GIAN</option>
          <option value="LUIS OTAVIO">LUIS OTAVIO</option>
          <option value="SÉRGIO">SÉRGIO</option>
          <option value="RAFAEL">RAFAEL</option>
          <option value="EVERTON">EVERTON</option>
        </select>
      </div>
      <div className="input-group">
        <label className="obrigatorio-asterisco">📅 DATA INÍCIAL (PERÍODO)</label>
        <input type="text" ref={inicioRef} placeholder="dd/mm/aaaa" readOnly />
      </div>
      <div className="input-group">
        <label className="obrigatorio-asterisco">📅 DATA FINAL (PERÍODO)</label>
        <input type="text" ref={fimRef} placeholder="dd/mm/aaaa" readOnly />
      </div>
      <div className="input-group">
        <label>&nbsp;</label>
        <button className="btn-primary" onClick={handleConfirmar}>✅ CONFIRMAR PERÍODO</button>
      </div>
    </div>
  );
}
