import React, { useState } from 'react';
import { Item, Categoria } from '../types';

interface AddItemModalProps {
  categorias: Categoria[];
  onClose: () => void;
  onSave: (data: Omit<Item, 'id' | 'codigo'>) => void;
}

export default function AddItemModal({ categorias, onClose, onSave }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    categoriaId: '',
    categoriaNome: '',
    categoriaAbreviacao: '',
    nome: '',
    marca: '',
    precoCusto: 0,
    precoVenda: 0,
    quantidade: 1, // PADRÃO 1
    usado: false
  });

  const handleCategoriaChange = (categoriaId: string) => {
    const cat = categorias.find(c => c.id === categoriaId);
    if (cat) {
      setFormData({
        ...formData,
        categoriaId: cat.id,
        categoriaNome: cat.nome,
        categoriaAbreviacao: cat.abreviacao
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoriaId) {
      alert('Selecione uma categoria!');
      return;
    }
    if (formData.quantidade < 1) {
      alert('Quantidade deve ser pelo menos 1!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Novo Item</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select de Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              required
              value={formData.categoriaId}
              onChange={(e) => handleCategoriaChange(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione uma categoria...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome} ({cat.abreviacao})
                </option>
              ))}
            </select>
            {categorias.length === 0 && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ Cadastre uma categoria primeiro!
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Driver Titânio"
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
              placeholder="Ex: TaylorMade, Callaway..."
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
                placeholder="0,00"
                value={formData.precoCusto || ''}
                onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value) || 0})}
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
                placeholder="0,00"
                value={formData.precoVenda || ''}
                onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CAMPO QUANTIDADE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade em Estoque *
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantidade}
              onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded">
            <input
              type="checkbox"
              id="novo-usado"
              checked={formData.usado}
              onChange={(e) => setFormData({...formData, usado: e.target.checked})}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="novo-usado" className="text-sm font-medium text-gray-700">
              Este item é <span className="font-bold text-yellow-600">USADO</span>
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
              disabled={!formData.categoriaId}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Adicionar ao Estoque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}