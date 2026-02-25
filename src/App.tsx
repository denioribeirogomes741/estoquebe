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
import VendasPage from './pages/VendasPage'; // NOVO

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState<'estoque' | 'vendas'>('estoque'); // NOVO
  const [loading, setLoading] = useState(true);

  // Buscar itens
  useEffect(() => {
    const q = query(collection(db, 'estoque'), orderBy('codigo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar itens:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Buscar categorias
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

  const generateCode = (abreviacao: string): string => {
    const prefix = abreviacao.toUpperCase();
    const sameCategory = items.filter(item => 
      item.categoriaAbreviacao === prefix
    );
    const number = sameCategory.length + 1;
    return `${prefix}${String(number).padStart(3, '0')}`;
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'codigo'>) => {
    try {
      const codigo = generateCode(itemData.categoriaAbreviacao);
      await addDoc(collection(db, 'estoque'), {
        ...itemData,
        codigo,
        createdAt: new Date()
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao salvar item.');
    }
  };

  const addCategoria = async (nome: string, abreviacao: string) => {
    try {
      await addDoc(collection(db, 'categorias'), {
        nome,
        abreviacao: abreviacao.toUpperCase()
      });
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao salvar categoria.');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'estoque', id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const updateItem = async (id: string, data: Partial<Item>) => {
    try {
      await updateDoc(doc(db, 'estoque', id), data);
      setEditingItem(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchSearch = 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoriaNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
    
    return matchSearch && matchCategoria;
  });

  const itensPorCategoria = categorias
    .map(cat => ({
      categoria: cat,
      itens: filteredItems.filter(item => item.categoriaId === cat.id)
    }))
    .filter(group => group.itens.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // NOVO - Renderizar página de vendas
  if (paginaAtual === 'vendas') {
    return <VendasPage onVoltar={() => setPaginaAtual('estoque')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-2xl font-bold">📦 Meu Estoque</h1>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => setPaginaAtual('vendas')} // NOVO - Ir para vendas
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              🛒 Vendas
            </button>
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

      {/* Barra de Pesquisa e Filtro */}
      <div className="max-w-6xl mx-auto p-4 space-y-4">
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

        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">Filtrar por categoria:</span>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome} ({cat.abreviacao})
              </option>
            ))}
          </select>
          {categoriaFiltro && (
            <button
              onClick={() => setCategoriaFiltro('')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Itens Agrupados por Categoria */}
      <div className="max-w-6xl mx-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Nenhum item encontrado</p>
            <p>Adicione um novo item ou ajuste sua pesquisa/filtro</p>
          </div>
        ) : (
          <div className="space-y-8">
            {itensPorCategoria.map(({ categoria, itens }) => (
              <div key={categoria.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold text-sm">
                      {categoria.abreviacao}
                    </span>
                    <h2 className="text-xl font-bold">{categoria.nome}</h2>
                  </div>
                  <span className="text-blue-100">
                    {itens.length} item(s) • {itens.reduce((sum, item) => sum + item.quantidade, 0)} unidade(s)
                  </span>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itens.map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
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