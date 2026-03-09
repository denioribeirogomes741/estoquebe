import React, { useState, useEffect, useMemo } from 'react';
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
  Grid,
  Star,
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import EditModal from './components/EditModal';
import AddItemModal from './components/AddItemModal';
import CategoriaModal from './components/CategoriaModal';
import RelatorioModal from './components/RelatorioModal';
import VendasPage from './pages/VendasPage';

// Tipos de filtros avançados
type Ordenacao = 'nome' | 'precoMenor' | 'precoMaior' | 'qualidade' | 'quantidade';
type FiltroQualidade = 'todos' | '1' | '2' | '3' | '4' | '5';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Filtros existentes
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  
  // NOVOS FILTROS
  const [filtroQualidade, setFiltroQualidade] = useState<FiltroQualidade>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('nome');
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  const [mostrarUsados, setMostrarUsados] = useState<boolean | null>(null); // null = todos, true = só usados, false = só novos
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  
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

  // SISTEMA DE FILTROS AVANÇADOS
  const filteredItems = useMemo(() => {
    let resultado = items.filter(item => {
      // Filtro de busca (nome/código)
      const matchSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de categoria
      const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
      
      // Filtro de qualidade
      const matchQualidade = filtroQualidade === 'todos' || 
        item.nivelQualidade === parseInt(filtroQualidade);
      
      // Filtro de preço
      const preco = item.precoVenda;
      const matchPrecoMin = precoMin === '' || preco >= parseFloat(precoMin);
      const matchPrecoMax = precoMax === '' || preco <= parseFloat(precoMax);
      
      // Filtro de usado/novo
      const matchUsado = mostrarUsados === null || item.usado === mostrarUsados;
      
      return matchSearch && matchCategoria && matchQualidade && 
             matchPrecoMin && matchPrecoMax && matchUsado;
    });

    // SISTEMA DE ORDENAÇÃO
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'precoMenor':
          return a.precoVenda - b.precoVenda;
        case 'precoMaior':
          return b.precoVenda - a.precoVenda;
        case 'qualidade':
          return b.nivelQualidade - a.nivelQualidade; // Maior qualidade primeiro
        case 'quantidade':
          return b.quantidade - a.quantidade; // Mais estoque primeiro
        default:
          return 0;
      }
    });

    return resultado;
  }, [items, searchTerm, categoriaFiltro, filtroQualidade, ordenacao, 
      precoMin, precoMax, mostrarUsados]);

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

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setSearchTerm('');
    setCategoriaFiltro('');
    setFiltroQualidade('todos');
    setOrdenacao('nome');
    setPrecoMin('');
    setPrecoMax('');
    setMostrarUsados(null);
  };

  // Contador de filtros ativos
  const filtrosAtivos = [
    searchTerm,
    categoriaFiltro,
    filtroQualidade !== 'todos',
    precoMin || precoMax,
    mostrarUsados !== null
  ].filter(Boolean).length;

  const getLabelQualidade = (nivel: number) => {
    const labels = ['Básico', 'Inicial', 'Intermediário', 'Avançado', 'Premium'];
    return labels[nivel - 1] || 'Básico';
  };

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
          <Col md={3}>
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
          
          <Col md={3}>
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
          
          <Col md={3}>
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
          
          <Col md={3}>
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-lg p-2" style={{ background: '#f0fdf4' }}>
                  <Star size={20} style={{ color: '#16a34a' }} />
                </div>
                <span className="text-secondary small fw-medium">Itens Premium</span>
              </div>
              <div className="stat-value" style={{ color: '#16a34a' }}>
                {items.filter(i => i.nivelQualidade >= 4).length}
              </div>
              <div className="stat-label">qualidade 4-5 estrelas</div>
            </div>
          </Col>
        </Row>

        {/* Search & Filter Section */}
        <div className="card-premium p-4 mb-4">
          {/* Busca básica */}
          <Row className="g-3 align-items-end mb-3">
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
              <Form.Label className="small fw-semibold text-secondary mb-2">Categoria</Form.Label>
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
              <Button 
                variant={mostrarFiltrosAvancados ? "primary" : "light"}
                onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                className="w-100 btn-premium d-flex align-items-center justify-content-center gap-2"
                style={!mostrarFiltrosAvancados ? { border: '1px solid #e5e7eb' } : {}}
              >
                <SlidersHorizontal size={18} />
                Filtros Avançados
                {filtrosAtivos > 0 && (
                  <Badge bg="danger" className="ms-1">{filtrosAtivos}</Badge>
                )}
              </Button>
            </Col>
          </Row>

          {/* Filtros Avançados */}
          {mostrarFiltrosAvancados && (
            <div className="pt-3 mt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Row className="g-3 align-items-end">
                {/* Filtro de Qualidade */}
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-secondary mb-2 d-flex align-items-center gap-2">
                    <Star size={14} />
                    Qualidade
                  </Form.Label>
                  <Form.Select
                    value={filtroQualidade}
                    onChange={(e) => setFiltroQualidade(e.target.value as FiltroQualidade)}
                    className="form-control-premium"
                  >
                    <option value="todos">Todas as qualidades</option>
                    <option value="5">⭐⭐⭐⭐⭐ Premium</option>
                    <option value="4">⭐⭐⭐⭐ Avançado</option>
                    <option value="3">⭐⭐⭐ Intermediário</option>
                    <option value="2">⭐⭐ Inicial</option>
                    <option value="1">⭐ Básico</option>
                  </Form.Select>
                </Col>

                {/* Filtro de Preço Mínimo */}
                <Col md={2}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    Preço Mínimo
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="R$ 0,00"
                    value={precoMin}
                    onChange={(e) => setPrecoMin(e.target.value)}
                    className="form-control-premium"
                  />
                </Col>

                {/* Filtro de Preço Máximo */}
                <Col md={2}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    Preço Máximo
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="R$ ∞"
                    value={precoMax}
                    onChange={(e) => setPrecoMax(e.target.value)}
                    className="form-control-premium"
                  />
                </Col>

                {/* Filtro de Usado/Novo */}
                <Col md={2}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    Condição
                  </Form.Label>
                  <Form.Select
                    value={mostrarUsados === null ? '' : mostrarUsados ? 'usado' : 'novo'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMostrarUsados(val === '' ? null : val === 'usado');
                    }}
                    className="form-control-premium"
                  >
                    <option value="">Todos</option>
                    <option value="novo">Novos</option>
                    <option value="usado">Usados</option>
                  </Form.Select>
                </Col>

                {/* Ordenação */}
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-secondary mb-2 d-flex align-items-center gap-2">
                    <Filter size={14} />
                    Ordenar por
                  </Form.Label>
                  <Form.Select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                    className="form-control-premium"
                  >
                    <option value="nome">Nome (A-Z)</option>
                    <option value="precoMenor">Menor Preço</option>
                    <option value="precoMaior">Maior Preço</option>
                    <option value="qualidade">Maior Qualidade</option>
                    <option value="quantidade">Mais Estoque</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* Botão limpar filtros */}
              {filtrosAtivos > 0 && (
                <div className="mt-3 text-end">
                  <Button 
                    variant="link" 
                    onClick={limparFiltros}
                    className="text-danger p-0"
                    style={{ textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    <X size={16} className="me-1" />
                    Limpar todos os filtros ({filtrosAtivos} ativo(s))
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resultados e contador */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <p className="mb-0 text-secondary">
            <strong>{filteredItems.length}</strong> item(s) encontrado(s)
            {filtrosAtivos > 0 && <span className="ms-1">• <span className="text-primary">{filtrosAtivos} filtro(s)</span></span>}
          </p>
        </div>

        {/* Items by Category */}
        {filteredItems.length === 0 ? (
          <div className="empty-state card-premium">
            <div className="empty-state-icon">🔍</div>
            <h4 className="h5 text-secondary mb-2">Nenhum item encontrado</h4>
            <p className="text-secondary mb-3">Tente ajustar os filtros ou adicione um novo item</p>
            {filtrosAtivos > 0 && (
              <Button 
                variant="outline-primary" 
                onClick={limparFiltros}
                className="btn-premium"
              >
                Limpar Filtros
              </Button>
            )}
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
                      <ItemCard 
                        item={item} 
                        onClick={() => setSelectedItem(item)}
                        mostrarQualidade={true}
                      />
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