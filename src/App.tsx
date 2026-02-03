import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase/config';
import { Item, Categoria } from './types';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import EditModal from './components/EditModal';
import AddItemModal from './components/AddItemModal';
import CategoriaModal from './components/CategoriaModal';
import RelatorioModal from './components/RelatorioModal';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar itens
  useEffect(() => {
    console.log('Iniciando busca de itens...');
    const q = query(collection(db, 'estoque'), orderBy('codigo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Itens recebidos:', snapshot.docs.length);
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar itens:', error);
      alert('Erro ao conectar com o banco de dados. Verifique as regras do Firebase.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Buscar categorias
  useEffect(() => {
    console.log('Iniciando busca de categorias...');
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Categorias recebidas:', snapshot.docs.length);
      const cats: Categoria[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Categoria);
      });
      setCategorias(cats);
    }, (error) => {
      console.error('Erro ao buscar categorias:', error);
    });

    return () => unsubscribe();
  }, []);

  // Gerar código automático
  const generateCode = (abreviacao: string): string => {
    const prefix = abreviacao.toUpperCase();
    const sameCategory = items.filter(item => 
      item.categoriaAbreviacao === prefix
    );
    const number = sameCategory.length + 1;
    return `${prefix}${String(number).padStart(3, '0')}`;
  };

  // Adicionar item
  const addItem = async (itemData: Omit<Item, 'id' | 'codigo'>) => {
    try {
      const codigo = generateCode(itemData.categoriaAbreviacao);
      await addDoc(collection(db, 'estoque'), {
        ...itemData,
        codigo,
        createdAt: new Date()
      });
      console.log('Item adicionado com sucesso!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao salvar item. Verifique as regras do Firebase.');
    }
  };

  // Adicionar categoria
  const addCategoria = async (nome: string, abreviacao: string) => {
    try {
      await addDoc(collection(db, 'categorias'), {
        nome,
        abreviacao: abreviacao.toUpperCase()
      });
      console.log('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao salvar categoria. Verifique as regras do Firebase.');
    }
  };

  // Deletar item
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'estoque', id));
      console.log('Item deletado com sucesso!');
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      alert('Erro ao deletar item.');
    }
  };

  // Atualizar item
  const updateItem = async (id: string, data: Partial<Item>) => {
    try {
      await updateDoc(doc(db, 'estoque', id), data);
      console.log('Item atualizado com sucesso!');
      setEditingItem(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      alert('Erro ao atualizar item.');
    }
  };

  // Filtrar itens
  const filteredItems = items.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoriaNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-2xl font-bold">📦 Meu Estoque</h1>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => setIsRelatorioOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              📊 Relatório
            </button>
            <button 
              onClick={() => setIsCategoriaModalOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              ⚙️ Categorias
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={categorias.length === 0}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Novo Item
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Pesquisa */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por código, nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Nenhum item encontrado</p>
            <p>Adicione um novo item ou ajuste sua pesquisa</p>
          </div>
        )}
      </div>

      {/* Modais */}
      {selectedItem && !editingItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          onEdit={() => setEditingItem(selectedItem)}
          onDelete={() => deleteItem(selectedItem.id)}
        />
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(data) => updateItem(editingItem.id, data)}
        />
      )}

      {isAddModalOpen && (
        <AddItemModal
          categorias={categorias}
          onClose={() => setIsAddModalOpen(false)}
          onSave={addItem}
        />
      )}

      {isCategoriaModalOpen && (
        <CategoriaModal
          onClose={() => setIsCategoriaModalOpen(false)}
          onAdd={addCategoria}
        />
      )}

      {isRelatorioOpen && (
        <RelatorioModal
          items={items}
          categorias={categorias}
          onClose={() => setIsRelatorioOpen(false)}
        />
      )}
    </div>
  );
}

export default App;