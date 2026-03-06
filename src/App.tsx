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
import { Container, Row, Col, Form, Button, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { 
  Search, 
  Plus, 
  Settings, 
  FileText, 
  ShoppingCart, 
  ChevronRight,
  Package,
  TrendingUp,
  DollarSign,
  Grid
} from 'lucide-react';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import EditModal from './components/EditModal';
import AddItemModal from './components/AddItemModal';
import CategoriaModal from './components/CategoriaModal';
import RelatorioModal from './components/RelatorioModal';
import VendasPage from './pages/VendasPage';

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
  const [paginaAtual, setPaginaAtual] = useState<'estoque' | 'vendas'>('estoque');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'estoque'), orderBy('codigo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, []);

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
    const sameCategory = items.filter(item => item.categoriaAbreviacao === prefix);
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
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
    return matchSearch && matchCategoria;
  });

  const itensPorCategoria = categorias
    .map(cat => ({
      categoria: cat,
      itens: filteredItems.filter(item => item.categoriaId === cat.id)
    }))
    .filter(group => group.itens.length > 0);

  // Métricas
  const totalItens = items.reduce((sum, item) => sum + item.quantidade, 0);
  const valorTotal = items.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
  const categoriasAtivas = new Set(items.map(i => i.categoriaId)).size;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
          <p className="text-secondary fw-medium">Carregando seu estoque...</p>
        </div>
      </div>
    );
  }

  if (paginaAtual === 'vendas') {
    return <VendasPage onVoltar={() => setPaginaAtual('estoque')} />;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)' }}>
      {/* Header Premium */}
      <header className="sticky-top" style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000
      }}>
        <Container fluid="lg" className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-xl" style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
              }}>
                <Package size={24} color="white" />
              </div>
              <div>
                <h1 className="h4 mb-0 fw-bold text-gray-900">Estoque Pro</h1>
                <p className="mb-0 small text-secondary">Gestão inteligente de inventário</p>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Button 
                onClick={() => setPaginaAtual('vendas')}
                className="btn-premium btn-gradient-success d-flex align-items-center gap-2"
              >
                <ShoppingCart size={18} />
                <span className="d-none d-md-inline">Vendas</span>
              </Button>
              
              <Button 
                variant="light"
                onClick={() => setIsRelatorioOpen(true)}
                className="btn-premium d-flex align-items-center gap-2"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <FileText size={18} />
                <span className="d-none d-md-inline">Relatório</span>
              </Button>
              
              <Button 
                variant="light"
                onClick={() => setIsCategoriaModalOpen(true)}
                className="btn-premium d-flex align-items-center gap-2"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <Settings size={18} />
                <span className="d-none d-md-inline">Categorias</span>
              </Button>
              
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                disabled={categorias.length === 0}
                className="btn-premium btn-gradient-primary d-flex align-items-center gap-2"
              >
                <Plus size={20} />
                <span className="d-none d-md-inline">Novo Item</span>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container fluid="lg" className="py-4">
        {/* Stats Overview */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-lg p-2" style={{ background: 'var(--primary-50)' }}>
                  <Grid size={20} style={{ color: 'var(--primary-600)' }} />
                </div>
                <span className="text-secondary small fw-medium">Total em Estoque</span>
              </div>
              <div className="stat-value text-gradient">{totalItens}</div>
              <div className="stat-label">unidades disponíveis</div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-lg p-2" style={{ background: 'var(--success-50)' }}>
                  <DollarSign size={20} style={{ color: 'var(--success-600)' }} />
                </div>
                <span className="text-secondary small fw-medium">Valor Total</span>
              </div>
              <div className="stat-value" style={{ color: 'var(--success-600)' }}>
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="stat-label">em mercadoria</div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-lg p-2" style={{ background: '#fef3c7' }}>
                  <TrendingUp size={20} style={{ color: '#d97706' }} />
                </div>
                <span className="text-secondary small fw-medium">Categorias</span>
              </div>
              <div className="stat-value" style={{ color: '#d97706' }}>{categoriasAtivas}</div>
              <div className="stat-label">categorias ativas</div>
            </div>
          </Col>
        </Row>

        {/* Search & Filter Section */}
        <div className="card-premium p-4 mb-4">
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label className="small fw-semibold text-secondary mb-2">Buscar itens</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 ps-3">
                  <Search size={18} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Digite código ou nome do item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-premium border-start-0 ps-0"
                />
              </InputGroup>
            </Col>
            
            <Col md={4}>
              <Form.Label className="small fw-semibold text-secondary mb-2">Filtrar por categoria</Form.Label>
              <Form.Select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="form-control-premium"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={3}>
              {categoriaFiltro && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setCategoriaFiltro('')}
                  className="w-100 btn-premium"
                >
                  Limpar filtros
                </Button>
              )}
            </Col>
          </Row>
        </div>

        {/* Items by Category */}
        {filteredItems.length === 0 ? (
          <div className="empty-state card-premium">
            <div className="empty-state-icon">📦</div>
            <h4 className="h5 text-secondary mb-2">Nenhum item encontrado</h4>
            <p className="text-secondary mb-0">Adicione um novo item ou ajuste sua pesquisa</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {itensPorCategoria.map(({ categoria, itens }) => (
              <div key={categoria.id} className="animate-fade-in">
                {/* Category Header */}
                <div className="d-flex align-items-center gap-3 mb-3 px-1">
                  <div className="d-flex align-items-center justify-content-center rounded-lg fw-bold text-white" style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    fontSize: '0.875rem'
                  }}>
                    {categoria.abreviacao}
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="h5 fw-bold mb-0 text-gray-900">{categoria.nome}</h3>
                    <p className="mb-0 small text-secondary">
                      {itens.length} produtos • {itens.reduce((sum, item) => sum + item.quantidade, 0)} unidades
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-secondary" />
                </div>

                {/* Items Grid */}
                <Row className="g-3">
                  {itens.map(item => (
                    <Col key={item.id} md={6} lg={4} xl={3}>
                      <ItemCard item={item} onClick={() => setSelectedItem(item)} />
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        )}
      </Container>

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