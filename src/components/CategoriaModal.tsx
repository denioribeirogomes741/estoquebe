import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Categoria } from '../types';

interface CategoriaModalProps {
  onClose: () => void;
  onAdd: (nome: string, abreviacao: string) => void;
}

export default function CategoriaModal({ onClose, onAdd }: CategoriaModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', abreviacao: '' });

  useEffect(() => {
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats: Categoria[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Categoria);
      });
      setCategorias(cats);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.nome || !novaCategoria.abreviacao) {
      alert('Preencha nome e abreviação!');
      return;
    }
    
    onAdd(novaCategoria.nome, novaCategoria.abreviacao);
    setNovaCategoria({ nome: '', abreviacao: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar itens existentes!')) {
      try {
        await deleteDoc(doc(db, 'categorias', id));
      } catch (error) {
        alert('Erro ao deletar categoria');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Formulário de Nova Categoria */}
        <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Nova Categoria</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
              <input
                type="text"
                placeholder="Ex: Driver"
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({...novaCategoria, nome: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Abreviação</label>
              <input
                type="text"
                placeholder="Ex: DR"
                maxLength={3}
                value={novaCategoria.abreviacao}
                onChange={(e) => setNovaCategoria({...novaCategoria, abreviacao: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
          >
            + Adicionar Categoria
          </button>
        </form>

        {/* Lista de Categorias */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Categorias Existentes ({categorias.length})</h3>
          <div className="space-y-2">
            {categorias.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                <div>
                  <span className="font-bold text-blue-600">{cat.abreviacao}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-800">{cat.nome}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️
                </button>
              </div>
            ))}
            {categorias.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma categoria cadastrada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}