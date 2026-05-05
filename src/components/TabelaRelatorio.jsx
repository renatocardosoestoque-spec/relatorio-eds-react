import React from 'react';

export function TabelaRelatorio({ registros, formatDateBR }) {
  if (registros.length === 0) return null;
  return (
    <div className="relatorio-tabela">
      <table>
        <thead>
          <tr><th>Vendedor</th><th>Data (BR)</th><th>Dia semana</th><th>Cidade</th><th>Cliente</th><th>Contato</th><th>Motivo</th><th>Descrição</th></tr>
        </thead>
        <tbody>
          {registros.map((reg, idx) => (
            <tr key={idx}>
              <td>{reg.vendedor}</td>
              <td>{formatDateBR(reg.dataVisitaISO)}</td>
              <td>{reg.diaSemana}</td>
              <td>{reg.cidade}</td>
              <td>{reg.cliente}</td>
              <td>{reg.contato}</td>
              <td>{reg.motivo}</td>
              <td>{reg.descricao || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
