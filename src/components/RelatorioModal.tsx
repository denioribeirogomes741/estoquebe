import React, { useRef } from 'react';
import { Item, Categoria } from '../types';

interface RelatorioModalProps {
  items: Item[];
  categorias: Categoria[];
  onClose: () => void;
}

export default function RelatorioModal({ items, categorias, onClose }: RelatorioModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Agrupar itens por categoria
  const itensPorCategoria = categorias.map(cat => ({
    categoria: cat,
    itens: items.filter(item => item.categoriaId === cat.id)
  })).filter(group => group.itens.length > 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Estoque</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            .header-info { text-align: center; margin-bottom: 30px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .categoria-header { background-color: #1e40af; color: white; font-size: 18px; }
            .total { font-weight: bold; background-color: #dbeafe; }
            .usado { color: #d97706; font-weight: bold; }
            .qtd-col { text-align: center; font-weight: bold; }
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

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const totalItens = items.reduce((sum, item) => sum + item.quantidade, 0);
  const valorTotalCusto = items.reduce((sum, item) => sum + (item.precoCusto * item.quantidade), 0);
  const valorTotalVenda = items.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
  const lucroTotal = valorTotalVenda - valorTotalCusto;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header do Modal */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📊 Relatório de Estoque</h2>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
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

        {/* Conteúdo para Impressão */}
        <div ref={printRef} className="overflow-y-auto p-6 bg-white">
          
          {/* Cabeçalho do Relatório */}
          <div className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Relatório de Estoque</h1>
            <p className="text-center text-gray-600">Gerado em: {dataAtual}</p>
            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Tipos de Itens</p>
                <p className="text-2xl font-bold text-blue-600">{items.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total em Unidades</p>
                <p className="text-2xl font-bold text-purple-600">{totalItens}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold text-red-600">R$ {valorTotalCusto.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Venda Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {valorTotalVenda.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg">
                Lucro Estimado Total: 
                <span className={`font-bold text-xl ml-2 ${lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lucroTotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Tabelas por Categoria */}
          {itensPorCategoria.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum item cadastrado</p>
          ) : (
            itensPorCategoria.map(({ categoria, itens }) => {
              const qtdCat = itens.reduce((sum, item) => sum + item.quantidade, 0);
              const custoCat = itens.reduce((sum, item) => sum + (item.precoCusto * item.quantidade), 0);
              const vendaCat = itens.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
              
              return (
                <div key={categoria.id} className="mb-8">
                  <table>
                    <thead>
                      <tr>
                        <th colSpan={8} className="categoria-header">
                          {categoria.nome} ({categoria.abreviacao}) - {itens.length} tipo(s) de item, {qtdCat} unidade(s)
                        </th>
                      </tr>
                      <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Marca</th>
                        <th>Qtd</th>
                        <th>Unit Custo</th>
                        <th>Unit Venda</th>
                        <th>Custo Total</th>
                        <th>Venda Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => {
                        const custoTotal = item.precoCusto * item.quantidade;
                        const vendaTotal = item.precoVenda * item.quantidade;
                        return (
                          <tr key={item.id}>
                            <td className="font-mono">{item.codigo}</td>
                            <td>{item.nome} {item.usado ? '(USADO)' : ''}</td>
                            <td>{item.marca}</td>
                            <td className="qtd-col">{item.quantidade}</td>
                            <td>R$ {item.precoCusto.toFixed(2)}</td>
                            <td>R$ {item.precoVenda.toFixed(2)}</td>
                            <td>R$ {custoTotal.toFixed(2)}</td>
                            <td>R$ {vendaTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="total">
                        <td colSpan={3} className="text-right">Subtotal {categoria.nome}:</td>
                        <td className="qtd-col">{qtdCat}</td>
                        <td colSpan={2}></td>
                        <td>R$ {custoCat.toFixed(2)}</td>
                        <td>R$ {vendaCat.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          )}

          {/* Resumo Final */}
          {itensPorCategoria.length > 0 && (
            <div className="mt-8 pt-4 border-t-2 border-gray-800">
              <table>
                <tbody>
                  <tr className="text-lg font-bold bg-gray-100">
                    <td colSpan={3} className="text-right">TOTAL GERAL:</td>
                    <td className="qtd-col text-purple-600">{totalItens}</td>
                    <td colSpan={2}></td>
                    <td className="text-red-600">R$ {valorTotalCusto.toFixed(2)}</td>
                    <td className="text-green-600">R$ {valorTotalVenda.toFixed(2)}</td>
                  </tr>
                  <tr className="text-xl font-bold bg-blue-100">
                    <td colSpan={7} className="text-right">LUCRO TOTAL ESTIMADO:</td>
                    <td className={`text-center ${lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {lucroTotal.toFixed(2)}
                    </td>
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