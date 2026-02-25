import React, { useRef, useState, useMemo } from 'react';
import { Venda } from '../types';

interface RelatorioVendasModalProps {
  vendas: Venda[];
  onClose: () => void;
}

type FiltroPeriodo = 'todos' | 'dia' | 'mes' | 'ano';

export default function RelatorioVendasModal({ vendas, onClose }: RelatorioVendasModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [filtro, setFiltro] = useState<FiltroPeriodo>('todos');
  const [dataSelecionada, setDataSelecionada] = useState<string>('');

  // Filtrar vendas por período
  const vendasFiltradas = useMemo(() => {
    if (filtro === 'todos') return vendas;
    if (!dataSelecionada) return vendas;

    const dataFiltro = new Date(dataSelecionada);
    
    return vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda);
      
      switch (filtro) {
        case 'dia':
          return dataVenda.toDateString() === dataFiltro.toDateString();
        case 'mes':
          return dataVenda.getMonth() === dataFiltro.getMonth() && 
                 dataVenda.getFullYear() === dataFiltro.getFullYear();
        case 'ano':
          return dataVenda.getFullYear() === dataFiltro.getFullYear();
        default:
          return true;
      }
    });
  }, [vendas, filtro, dataSelecionada]);

  // Agrupar vendas por data
  const vendasPorData = useMemo(() => {
    const grupos: { [key: string]: Venda[] } = {};
    
    vendasFiltradas.forEach(venda => {
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(venda);
    });
    
    return Object.entries(grupos).sort((a, b) => 
      new Date(b[1][0].dataVenda).getTime() - new Date(a[1][0].dataVenda).getTime()
    );
  }, [vendasFiltradas]);

  // Totais
  const totalVendas = vendasFiltradas.length;
  const totalItens = vendasFiltradas.reduce((sum, v) => sum + v.quantidade, 0);
  const totalReceita = vendasFiltradas.reduce((sum, v) => sum + v.precoTotal, 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Vendas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; margin-bottom: 10px; }
            .periodo { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #16a34a; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .data-header { background-color: #15803d; color: white; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #dcfce7; }
            .valor { text-align: right; }
            .qtd { text-align: center; }
            .resumo { margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; }
            .resumo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
            .resumo-item h3 { margin: 0; color: #166534; font-size: 24px; }
            .resumo-item p { margin: 5px 0 0; color: #666; font-size: 12px; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTituloPeriodo = () => {
    switch (filtro) {
      case 'dia':
        return dataSelecionada 
          ? `Vendas do dia ${new Date(dataSelecionada).toLocaleDateString('pt-BR')}`
          : 'Todas as vendas';
      case 'mes':
        return dataSelecionada
          ? `Vendas de ${new Date(dataSelecionada).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
          : 'Todas as vendas';
      case 'ano':
        return dataSelecionada
          ? `Vendas de ${new Date(dataSelecionada).getFullYear()}`
          : 'Todas as vendas';
      default:
        return 'Todas as vendas';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📊 Relatório de Vendas</h2>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              🖨️ Imprimir
            </button>
            <button 
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por</label>
              <select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as FiltroPeriodo);
                  setDataSelecionada('');
                }}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos os períodos</option>
                <option value="dia">Dia específico</option>
                <option value="mes">Mês específico</option>
                <option value="ano">Ano específico</option>
              </select>
            </div>
            
            {filtro !== 'todos' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filtro === 'dia' ? 'Selecione o dia' : filtro === 'mes' ? 'Selecione o mês' : 'Selecione o ano'}
                </label>
                <input
                  type={filtro === 'dia' ? 'date' : filtro === 'mes' ? 'month' : 'number'}
                  min={filtro === 'ano' ? '2000' : undefined}
                  max={filtro === 'ano' ? '2100' : undefined}
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={filtro === 'ano' ? '2024' : undefined}
                />
              </div>
            )}

            {dataSelecionada && (
              <button
                onClick={() => setDataSelecionada('')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo para Impressão */}
        <div ref={printRef} className="overflow-y-auto p-6 bg-white">
          
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Relatório de Vendas</h1>
          <p className="text-center text-gray-600 mb-6">{getTituloPeriodo()}</p>

          {/* Resumo */}
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-3xl font-bold text-green-600">{totalVendas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Itens Vendidos</p>
                <p className="text-3xl font-bold text-blue-600">{totalItens}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-purple-600">R$ {totalReceita.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Vendas por Data */}
          {vendasPorData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma venda encontrada neste período</p>
          ) : (
            vendasPorData.map(([data, vendasDoDia]) => {
              const totalDia = vendasDoDia.reduce((sum, v) => sum + v.precoTotal, 0);
              const itensDia = vendasDoDia.reduce((sum, v) => sum + v.quantidade, 0);
              
              return (
                <div key={data} className="mb-6">
                  <table>
                    <thead>
                      <tr className="data-header">
                        <th colSpan={6}>
                          📅 {data} — {vendasDoDia.length} venda(s), {itensDia} item(ns)
                        </th>
                      </tr>
                      <tr>
                        <th>Código</th>
                        <th>Item</th>
                        <th>Qtd</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                        <th>Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasDoDia.map((venda) => (
                        <tr key={venda.id}>
                          <td className="font-mono">{venda.itemCodigo}</td>
                          <td>{venda.itemNome}</td>
                          <td className="qtd">{venda.quantidade}</td>
                          <td className="valor">R$ {venda.precoUnitario.toFixed(2)}</td>
                          <td className="valor font-semibold">R$ {venda.precoTotal.toFixed(2)}</td>
                          <td>{venda.cliente || '-'}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan={2} className="text-right">Subtotal do dia:</td>
                        <td className="qtd">{itensDia}</td>
                        <td></td>
                        <td className="valor font-bold">R$ {totalDia.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          )}

          {/* Total Geral */}
          {vendasFiltradas.length > 0 && (
            <div className="mt-8 pt-4 border-t-2 border-green-600">
              <table>
                <tbody>
                  <tr className="text-xl font-bold bg-green-100">
                    <td colSpan={2} className="text-right">TOTAL GERAL:</td>
                    <td className="qtd text-green-700">{totalItens}</td>
                    <td></td>
                    <td className="valor text-green-700">R$ {totalReceita.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}