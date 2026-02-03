import React from 'react';
import { Item } from '../types';

interface ItemModalProps {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ItemModal({ item, onClose, onEdit, onDelete }: ItemModalProps) {
  const valorTotalCusto = item.precoCusto * item.quantidade;
  const valorTotalVenda = item.precoVenda * item.quantidade;
  const lucroTotal = valorTotalVenda - valorTotalCusto;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-mono">
              {item.codigo}
            </span>
            <h2 className="text-2xl font-bold mt-2 text-gray-800">{item.nome}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Categoria:</span>
            <span className="font-semibold">{item.categoriaNome}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Marca:</span>
            <span className="font-semibold">{item.marca}</span>
          </div>
          
          {/* QUANTIDADE DESTACADA */}
          <div className="flex justify-between border-b pb-2 bg-blue-50 p-2 rounded">
            <span className="text-gray-600">Quantidade em Estoque:</span>
            <span className="font-bold text-blue-600 text-lg">{item.quantidade} unidade(s)</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Preço de Custo (unitário):</span>
            <span className="font-semibold text-red-600">
              R$ {item.precoCusto.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Preço de Venda (unitário):</span>
            <span className="font-semibold text-green-600">
              R$ {item.precoVenda.toFixed(2)}
            </span>
          </div>
          
          {/* TOTAIS */}
          <div className="flex justify-between border-b pb-2 bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Custo Total ({item.quantidade}x):</span>
            <span className="font-bold text-red-600">
              R$ {valorTotalCusto.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2 bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Venda Total ({item.quantidade}x):</span>
            <span className="font-bold text-green-600">
              R$ {valorTotalVenda.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Lucro Estimado:</span>
            <span className={`font-bold ${lucroTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {lucroTotal.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Condição:</span>
            <span className={`font-semibold ${item.usado ? 'text-yellow-600' : 'text-green-600'}`}>
              {item.usado ? 'Usado' : 'Novo'}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este item?')) {
                onDelete();
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}