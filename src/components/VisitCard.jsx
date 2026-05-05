import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useMunicipios } from '../hooks/useMunicipios';
import { municipiosRS } from '../lib/municipios';

export function VisitCard({ vendedor, periodo, onSave, onCancel }) {
  const [cidade, setCidade] = useState('');
  const [cliente, setCliente] = useState('');
  const [contato, setContato] = useState('');
  const [dataVisita, setDataVisita] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mostrarDescricao, setMostrarDescricao] = useState(false);
  const [error, setError] = useState('');

  const { inputRef, suggestions, showSuggestions, handleInput, selectCity } = useMunicipios();

  // Funções auxiliares (formato de data, validação)
  const formatDateBR = (dateISO) => {
    if (!dateISO) return '';
    const [year, month, day] = dateISO.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseDateBR = (dateBR) => {
    const partes = dateBR.split('/');
    if (partes.length !== 3) return null;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  const getDiaSemana = (dateISO) => {
    if (!dateISO) return '';
    const d = new Date(dateISO + 'T12:00:00');
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[d.getDay()];
  };

  const isDataValidaNoPeriodo = (dataISO) => {
    if (!periodo.inicio || !periodo.fim) return false;
    return (dataISO >= periodo.inicio && dataISO <= periodo.fim);
  };

  const handleSalvar = () => {
    const cidadeTrim = cidade.trim();
    const clienteTrim = cliente.trim();
    const contatoTrim = contato.trim();
    const dataISO = dataVisita;

    if (!cidadeTrim || !municipiosRS.includes(cidadeTrim)) {
      setError('Cidade inválida (deve estar na lista RS).');
      return;
    }
    if (!clienteTrim) { setError('Cliente obrigatório.'); return; }
    if (!contatoTrim) { setError('Contato obrigatório.'); return; }
    if (!dataISO) { setError('Selecione a data da visita.'); return; }
    if (!isDataValidaNoPeriodo(dataISO)) {
      setError(`Data fora do período definido (${formatDateBR(periodo.inicio)} a ${formatDateBR(periodo.fim)}).`);
      return;
    }
    if (!motivo) { setError('Motivo obrigatório.'); return; }
    if (motivo === 'Outro' && !descricao.trim()) {
      setError('Descreva o motivo "Outro".');
      return;
    }

    const diaSemana = getDiaSemana(dataISO);
    onSave({
      vendedor,
      cidade: cidadeTrim,
      cliente: clienteTrim,
      contato: contatoTrim,
      dataVisitaISO: dataISO,
      diaSemana,
      motivo,
      descricao: motivo === 'Outro' ? descricao.trim() : ''
    });
  };

  useEffect(() => {
    setMostrarDescricao(motivo === 'Outro');
  }, [motivo]);

  return (
    <div className="visit-card">
      <h3>📌 Novo atendimento - {vendedor}</h3>
      <div className="grid-5">
        <div className="field" style={{ position: 'relative' }}>
          <label>🏙️ CIDADE *</label>
          <input
            type="text"
            ref={inputRef}
            onChange={(e) => {
              setCidade(e.target.value);
              handleInput(e.target.value);
            }}
            placeholder="Digite ou selecione"
            autoComplete="off"
          />
          {showSuggestions && (
            <div className="city-suggest">
              {suggestions.map(c => (
                <div key={c} onClick={() => {
                  selectCity(c);
                  setCidade(c);
                }}>{c}</div>
              ))}
            </div>
          )}
        </div>
        <div className="field">
          <label>🏢 CLIENTE *</label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" />
        </div>
        <div className="field">
          <label>📞 CONTATO *</label>
          <input type="text" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Nome do contato" />
        </div>
        <div className="field">
          <label>📅 DATA VISITA *</label>
          <input type="date" value={dataVisita} onChange={(e) => setDataVisita(e.target.value)} className="data-visita-iso" />
        </div>
        <div className="field">
          <label>📌 MOTIVO *</label>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="">Selecione</option>
            <option value="Visita">Visita</option>
            <option value="Entrega">Entrega</option>
            <option value="Cobrança">Cobrança</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        {mostrarDescricao && (
          <div className="field">
            <label>✏️ DESCRIÇÃO (Outro)</label>
            <textarea rows="2" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva detalhes..."></textarea>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn-cancelar" onClick={onCancel}>Cancelar</button>
        <button className="btn-salvar" onClick={handleSalvar}>💾 Salvar visita</button>
      </div>
      {error && <div className="card-error" style={{ color: '#b33', fontSize: '0.7rem', marginTop: '8px' }}>{error}</div>}
    </div>
  );
}
