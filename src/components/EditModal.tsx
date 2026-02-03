import React, { useState } from 'react';
import { Item } from '../types';

interface EditModalProps {
  item: Item;
  onClose: () => void;
  onSave: (data: Partial<Item>) => void;
}

export default function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    nome: item.nome,
    marca: item.marca,
    precoCusto: item.precoCusto,
    precoVenda: item.precoVenda,
    quantidade: item.quantidade, // ADICIONAR
    usado: item.usado
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantidade < 0) {
      alert('Quantidade não pode ser negativa!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Editar Item</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código (não editável)
            </label>
            <input
              type="text"
              value={item.codigo}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria (não editável)
            </label>
            <input
              type="text"
              value={item.categoriaNome}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca *
            </label>
            <input
              type="text"
              required
              value={formData.marca}
              onChange={(e) => setFormData({...formData, marca: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precoCusto}
                onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precoVenda}
                onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CAMPO QUANTIDADE NO EDITAR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade em Estoque *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.quantidade}
              onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="usado"
              checked={formData.usado}
              onChange={(e) => setFormData({...formData, usado: e.target.checked})}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="usado" className="text-sm font-medium text-gray-700">
              Item Usado
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}