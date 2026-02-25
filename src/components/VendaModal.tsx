import React, { useState } from 'react';
import { Item } from '../types';

interface VendaModalProps {
  item: Item;
  onClose: () => void;
  onVender: (venda: {
    itemId: string;
    itemCodigo: string;
    itemNome: string;
    itemCategoria: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
    cliente?: string;
    observacao?: string;
  }) => void;
}

export default function VendaModal({ item, onClose, onVender }: VendaModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [cliente, setCliente] = useState('');
  const [observacao, setObservacao] = useState('');

  const precoTotal = quantidade * item.precoVenda;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantidade > item.quantidade) {
      alert(`Estoque insuficiente! Disponível: ${item.quantidade}`);
      return;
    }

    if (quantidade < 1) {
      alert('Quantidade deve ser pelo menos 1');
      return;
    }

    onVender({
      itemId: item.id,
      itemCodigo: item.codigo,
      itemNome: item.nome,
      itemCategoria: item.categoriaNome,
      quantidade,
      precoUnitario: item.precoVenda,
      precoTotal,
      cliente: cliente || undefined,
      observacao: observacao || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal compacto - max-h-[85vh] para não ultrapassar a tela */}
      <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {/* Header compacto */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">🛒 Vender</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Info do item - compacta */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm">
          <p className="font-bold text-gray-800">{item.nome}</p>
          <p className="text-gray-500">{item.codigo} • {item.categoriaNome}</p>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Estoque: <strong className="text-blue-600">{item.quantidade}</strong></span>
            <span className="text-gray-600">R$ {item.precoVenda.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Quantidade - linha compacta */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={item.quantidade}
              required
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 text-center"
            />
          </div>

          {/* Cliente - opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Observação - opcional, menor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obs. (opcional)</label>
            <input
              type="text"
              placeholder="Observação curta..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Total destacado */}
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Total da venda</p>
            <p className="text-xl font-bold text-green-600">R$ {precoTotal.toFixed(2)}</p>
          </div>

          {/* Botões - sempre visíveis */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              ✅ Vender
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}