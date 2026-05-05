import React, { useState } from 'react';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PeriodoForm } from './components/PeriodoForm';
import { KmForm } from './components/KmForm';
import { VisitCard } from './components/VisitCard';
import { TabelaRelatorio } from './components/TabelaRelatorio';
import { usePersistencia } from './hooks/usePersistencia';

function App() {
  const [periodo, setPeriodo] = usePersistencia('periodoEDS', { inicio: null, fim: null, vendedor: '' });
  const [registros, setRegistros] = usePersistencia('registrosEDS', []);
  const [kmInicial, setKmInicial] = usePersistencia('kmInicialEDS', '');
  const [kmFinal, setKmFinal] = usePersistencia('kmFinalEDS', '');
  const [cards, setCards] = useState([]);

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

  const definirPeriodo = (inicioBR, fimBR) => {
    if (!inicioBR || !fimBR) {
      Swal.fire({ icon: 'error', title: 'Datas incompletas', text: 'Selecione as duas datas usando o calendário.' });
      return false;
    }
    const inicioISO = parseDateBR(inicioBR);
    const fimISO = parseDateBR(fimBR);
    if (!inicioISO || !fimISO || inicioISO > fimISO) {
      Swal.fire('Atenção', 'Data inicial não pode ser maior que a data final.', 'warning');
      return false;
    }
    setPeriodo({ ...periodo, inicio: inicioISO, fim: fimISO });
    return true;
  };

  const adicionarRegistro = (novoReg) => {
    setRegistros([...registros, novoReg]);
    Swal.fire({ icon: 'success', title: 'Salvo!', text: 'Visita registrada com sucesso.', toast: true, position: 'top-end', showConfirmButton: false, timer: 1600 });
  };

  const adicionarCard = () => {
    if (!periodo.inicio || !periodo.fim) {
      Swal.fire({ icon: 'warning', title: 'Período não definido', text: 'Defina as datas inicial e final antes de adicionar uma visita.' });
      return;
    }
    if (!periodo.vendedor) {
      Swal.fire({ icon: 'error', title: 'Vendedor obrigatório', text: 'Selecione o vendedor no campo superior.' });
      return;
    }
    if (!kmInicial || !kmFinal) {
      Swal.fire({ icon: 'error', title: 'KM do veículo obrigatório', text: 'Preencha o KM Inicial e KM Final do veículo antes de registrar visitas.' });
      return;
    }
    if (parseFloat(kmFinal) < parseFloat(kmInicial)) {
      Swal.fire({ icon: 'error', title: 'KM inválido', text: 'KM Final não pode ser menor que o KM Inicial.' });
      return;
    }
    setCards([...cards, Date.now()]);
  };

  const removerCard = (id) => {
    setCards(cards.filter(c => c !== id));
  };

  const exportarJSON = () => {
    const estado = { periodo, registros, kmInicial, kmFinal };
    const dataStr = JSON.stringify(estado, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_eds_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire('Exportado!', 'Arquivo JSON salvo com sucesso.', 'success');
  };

  const importarJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (dados.periodo) setPeriodo(dados.periodo);
        if (dados.registros) setRegistros(dados.registros);
        if (dados.kmInicial !== undefined) setKmInicial(dados.kmInicial);
        if (dados.kmFinal !== undefined) setKmFinal(dados.kmFinal);
        Swal.fire('Importado!', 'Dados restaurados com sucesso.', 'success');
      } catch (err) {
        Swal.fire('Erro', 'Arquivo inválido ou corrompido.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const gerarPDF = async () => {
    if (registros.length === 0) {
      Swal.fire('Nada para exportar', 'Nenhum registro de visita salvo.', 'info');
      return;
    }
    if (!periodo.vendedor) {
      Swal.fire('Vendedor não selecionado', 'Selecione o vendedor antes de gerar o PDF.', 'warning');
      return;
    }
    if (!kmInicial || !kmFinal) {
      Swal.fire('KM obrigatório', 'Preencha KM Inicial e Final do veículo.', 'warning');
      return;
    }

    const periodoTexto = `${formatDateBR(periodo.inicio)} a ${formatDateBR(periodo.fim)}`;
    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '24px';
    pdfContent.style.fontFamily = 'Inter, sans-serif';
    pdfContent.style.backgroundColor = '#fff';
    pdfContent.style.width = '1000px';
    pdfContent.innerHTML = `
      <div style="text-align:center; border-bottom: 3px solid #1f7542; padding-bottom: 12px;">
        <h1 style="color:#1f7542;">RELATÓRIO DE VISITAS EDS</h1>
        <p><strong>Vendedor:</strong> ${periodo.vendedor} &nbsp;|&nbsp; <strong>Período:</strong> ${periodoTexto}</p>
        <p><strong>🚗 KM Inicial:</strong> ${kmInicial} km &nbsp;&nbsp;|&nbsp;&nbsp; <strong>🚗 KM Final:</strong> ${kmFinal} km &nbsp;|&nbsp; <strong>Total percorrido:</strong> ${parseInt(kmFinal) - parseInt(kmInicial)} km</p>
      </div>
      <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse; margin-top:20px;">
        <thead><tr style="background:#e0f0da;"><th>Data (BR)</th><th>Dia</th><th>Cidade</th><th>Cliente</th><th>Contato</th><th>Motivo</th><th>Descrição</th></tr></thead>
        <tbody>${registros.map(r => `
          <tr>
            <td>${formatDateBR(r.dataVisitaISO)}</td>
            <td>${r.diaSemana}</td>
            <td>${r.cidade}</td>
            <td>${r.cliente}</td>
            <td>${r.contato}</td>
            <td>${r.motivo}</td>
            <td>${r.descricao || ''}</td>
          </tr>
        `).join('')}</tbody>
      </table>
      <p style="font-size:10px; margin-top:20px;">Emitido em ${new Date().toLocaleString('pt-BR')}</p>
    `;
    document.body.appendChild(pdfContent);
    const canvas = await html2canvas(pdfContent, { scale: 2 });
    document.body.removeChild(pdfContent);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`Relatorio_EDS_${periodo.vendedor}_${periodo.inicio}_a_${periodo.fim}.pdf`);
    Swal.fire({ icon: 'success', title: 'PDF gerado!', text: 'Download iniciado com sucesso.' });
  };

  const limparHistorico = () => {
    if (registros.length === 0) return;
    Swal.fire({
      title: 'Limpar histórico?', text: 'Todos os registros serão removidos permanentemente.', icon: 'question', showCancelButton: true, confirmButtonColor: '#c0392b', confirmButtonText: 'Sim, limpar'
    }).then((res) => {
      if (res.isConfirmed) {
        setRegistros([]);
        setCards([]);
        Swal.fire('Limpo!', 'Histórico removido.', 'success');
      }
    });
  };

  return (
    <div className="glass-container">
      <div className="hero-header">
        <h1>📋 Relatório de Visitas EDS</h1>
        <p>Sistema completo com KM do veículo | Datas no formato brasileiro (dd/mm/aaaa)</p>
      </div>

      <div className="form-panel">
        <PeriodoForm periodo={periodo} setPeriodo={setPeriodo} onDefinirPeriodo={definirPeriodo} />
        <KmForm kmInicial={kmInicial} kmFinal={kmFinal} setKmInicial={setKmInicial} setKmFinal={setKmFinal} />
        <div className="status-badge" style={{ marginTop: '16px' }}>
          {periodo.inicio && periodo.fim ? `📅 Período ativo: ${formatDateBR(periodo.inicio)} (${getDiaSemana(periodo.inicio)}) até ${formatDateBR(periodo.fim)} (${getDiaSemana(periodo.fim)})` : '⏳ Nenhum período definido'}
        </div>
      </div>

      <div style={{ margin: '0.5rem 2.5rem' }}>
        <button className="btn-primary" onClick={adicionarCard} style={{ background: '#2b6e42' }}>+ Adicionar visita / atendimento</button>
      </div>

      {cards.map(id => (
        <VisitCard
          key={id}
          vendedor={periodo.vendedor}
          periodo={{ inicio: periodo.inicio, fim: periodo.fim }}
          onSave={(novoReg) => { adicionarRegistro(novoReg); removerCard(id); }}
          onCancel={() => removerCard(id)}
        />
      ))}

      {registros.length > 0 && (
        <>
          <h3 style={{ margin: '1rem 2.5rem 0', fontWeight: 600 }}>📋 Registros realizados no período</h3>
          <TabelaRelatorio registros={registros} formatDateBR={formatDateBR} />
          <div className="toolbar">
            <button className="btn-primary" onClick={gerarPDF}>📄 GERAR PDF (completo)</button>
            <button className="btn-secondary" onClick={exportarJSON}>💾 Exportar dados (JSON)</button>
            <button className="btn-secondary" onClick={() => document.getElementById('importFile').click()}>📂 Importar dados (JSON)</button>
            <button className="btn-secondary" onClick={limparHistorico}>🗑️ Limpar histórico</button>
            <input type="file" id="importFile" accept=".json" style={{ display: 'none' }} onChange={importarJSON} />
          </div>
        </>
      )}
      <footer>Base com 497 municípios do RS | Datas sempre em formato brasileiro (dd/mm/aaaa) | KM Inicial e Final obrigatórios</footer>
    </div>
  );
}

export default App;
