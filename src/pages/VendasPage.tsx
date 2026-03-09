import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Item, Venda, Categoria } from '../types';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Badge, 
  Table, 
  Spinner,
  Nav,
  Modal
} from 'react-bootstrap';
import { 
  ArrowLeft, 
  ShoppingCart, 
  History, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  User,
  FileText,
  ChevronRight,
  Tag,
  Trash2,
  AlertTriangle,
  Star,
  SlidersHorizontal,
  X
} from 'lucide-react';
import VendaModal from '../components/VendaModal';
import RelatorioVendasModal from '../components/RelatorioVendasModal';

interface VendasPageProps {
  onVoltar: () => void;
}

type FiltroPeriodo = 'todos' | 'dia' | 'mes' | 'ano';
type Ordenacao = 'nome' | 'precoMenor' | 'precoMaior' | 'qualidade' | 'quantidade';
type FiltroQualidade = 'todos' | '1' | '2' | '3' | '4' | '5';

// Tipo específico para entrada de venda (sem undefined)
type VendaInput = {
  itemId: string;
  itemCodigo: string;
  itemNome: string;
  itemCategoria: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  cliente: string;
  observacao: string;
};

export default function VendasPage({ onVoltar }: VendasPageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  
  // Filtros existentes
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  
  // NOVOS FILTROS AVANÇADOS
  const [filtroQualidade, setFiltroQualidade] = useState<FiltroQualidade>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('nome');
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  const [mostrarUsados, setMostrarUsados] = useState<boolean | null>(null);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<'vender' | 'historico'>('vender');
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos');
  const [dataFiltro, setDataFiltro] = useState<string>('');
  
  // Estados para exclusão
  const [vendaParaExcluir, setVendaParaExcluir] = useState<Venda | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'estoque'), orderBy('codigo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
    });
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

  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('dataVenda', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vendasData: Venda[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vendasData.push({ 
          id: doc.id, 
          ...data,
          dataVenda: data.dataVenda?.toDate() || new Date()
        } as Venda);
      });
      setVendas(vendasData);
    });
    return () => unsubscribe();
  }, []);

  const handleVender = async (vendaData: VendaInput) => {
    try {
      const dadosParaSalvar = {
        itemId: vendaData.itemId,
        itemCodigo: vendaData.itemCodigo,
        itemNome: vendaData.itemNome,
        itemCategoria: vendaData.itemCategoria,
        quantidade: vendaData.quantidade,
        precoUnitario: vendaData.precoUnitario,
        precoTotal: vendaData.precoTotal,
        cliente: vendaData.cliente || '',
        observacao: vendaData.observacao || '',
        dataVenda: new Date()
      };

      await addDoc(collection(db, 'vendas'), dadosParaSalvar);

      const itemRef = doc(db, 'estoque', vendaData.itemId);
      const itemAtual = items.find(i => i.id === vendaData.itemId);
      
      if (itemAtual) {
        const novaQuantidade = itemAtual.quantidade - vendaData.quantidade;
        await updateDoc(itemRef, { quantidade: novaQuantidade });
      }

      setItemSelecionado(null);
      alert('✅ Venda registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('❌ Erro ao registrar venda');
    }
  };

  const handleVenderCarrinho = async (vendasCarrinho: VendaInput[], totalGeral: number) => {
    try {
      for (const venda of vendasCarrinho) {
        const dadosParaSalvar = {
          itemId: venda.itemId,
          itemCodigo: venda.itemCodigo,
          itemNome: venda.itemNome,
          itemCategoria: venda.itemCategoria,
          quantidade: venda.quantidade,
          precoUnitario: venda.precoUnitario,
          precoTotal: venda.precoTotal,
          cliente: venda.cliente || '',
          observacao: venda.observacao || '',
          dataVenda: new Date()
        };

        await addDoc(collection(db, 'vendas'), dadosParaSalvar);

        const itemRef = doc(db, 'estoque', venda.itemId);
        const itemAtual = items.find(i => i.id === venda.itemId);
        if (itemAtual) {
          await updateDoc(itemRef, { 
            quantidade: itemAtual.quantidade - venda.quantidade 
          });
        }
      }

      setItemSelecionado(null);
      alert(`✅ ${vendasCarrinho.length} venda(s) registrada(s)! Total: R$ ${totalGeral.toFixed(2)}`);
    } catch (error) {
      console.error('Erro ao registrar vendas do carrinho:', error);
      alert('❌ Erro ao registrar vendas do carrinho');
    }
  };

  const confirmarExclusao = (venda: Venda) => {
    setVendaParaExcluir(venda);
    setShowConfirmDelete(true);
  };

  const handleExcluirVenda = async () => {
    if (!vendaParaExcluir) return;

    try {
      await deleteDoc(doc(db, 'vendas', vendaParaExcluir.id));

      const itemRef = doc(db, 'estoque', vendaParaExcluir.itemId);
      const itemAtual = items.find(i => i.id === vendaParaExcluir.itemId);
      
      if (itemAtual) {
        const novaQuantidade = itemAtual.quantidade + vendaParaExcluir.quantidade;
        await updateDoc(itemRef, { quantidade: novaQuantidade });
      }

      setShowConfirmDelete(false);
      setVendaParaExcluir(null);
      alert('✅ Venda excluída e estoque restaurado!');
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      alert('❌ Erro ao excluir venda');
    }
  };

  const vendasFiltradas = useMemo(() => {
    let filtradas = vendas;

    if (filtroPeriodo !== 'todos' && dataFiltro) {
      const dataSelecionada = new Date(dataFiltro);
      
      filtradas = filtradas.filter(venda => {
        const dataVenda = new Date(venda.dataVenda);
        
        switch (filtroPeriodo) {
          case 'dia':
            return dataVenda.toDateString() === dataSelecionada.toDateString();
          case 'mes':
            return dataVenda.getMonth() === dataSelecionada.getMonth() && 
                   dataVenda.getFullYear() === dataSelecionada.getFullYear();
          case 'ano':
            return dataVenda.getFullYear() === dataSelecionada.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtradas;
  }, [vendas, filtroPeriodo, dataFiltro]);

  // SISTEMA DE FILTROS AVANÇADOS PARA ITENS
  const itensDisponiveis = useMemo(() => {
    let resultado = items.filter(item => {
      const temEstoque = item.quantidade > 0;
      
      const matchSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
      
      const matchQualidade = filtroQualidade === 'todos' || 
        item.nivelQualidade === parseInt(filtroQualidade);
      
      const preco = item.precoVenda;
      const matchPrecoMin = precoMin === '' || preco >= parseFloat(precoMin);
      const matchPrecoMax = precoMax === '' || preco <= parseFloat(precoMax);
      
      const matchUsado = mostrarUsados === null || item.usado === mostrarUsados;
      
      return temEstoque && matchSearch && matchCategoria && matchQualidade && 
             matchPrecoMin && matchPrecoMax && matchUsado;
    });

    // ORDENAÇÃO
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'precoMenor':
          return a.precoVenda - b.precoVenda;
        case 'precoMaior':
          return b.precoVenda - a.precoVenda;
        case 'qualidade':
          return b.nivelQualidade - a.nivelQualidade;
        case 'quantidade':
          return b.quantidade - a.quantidade;
        default:
          return 0;
      }
    });

    return resultado;
  }, [items, searchTerm, categoriaFiltro, filtroQualidade, ordenacao, 
      precoMin, precoMax, mostrarUsados]);

  const itensPorCategoria = useMemo(() => {
    return categorias
      .map(cat => ({
        categoria: cat,
        itens: itensDisponiveis.filter(item => item.categoriaId === cat.id)
      }))
      .filter(group => group.itens.length > 0);
  }, [categorias, itensDisponiveis]);

  const totalVendas = vendasFiltradas.length;
  const totalItensVendidos = vendasFiltradas.reduce((sum, v) => sum + v.quantidade, 0);
  const totalReceita = vendasFiltradas.reduce((sum, v) => sum + v.precoTotal, 0);

  const vendasPorData = useMemo(() => {
    const grupos: { [key: string]: Venda[] } = {};
    
    vendasFiltradas.forEach(venda => {
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(venda);
    });
    
    return Object.entries(grupos).sort((a, b) => 
      new Date(b[1][0].dataVenda).getTime() - new Date(a[1][0].dataVenda).getTime()
    );
  }, [vendasFiltradas]);

  const totalVendasGeral = vendas.length;
  const totalReceitaGeral = vendas.reduce((sum, v) => sum + v.precoTotal, 0);
  const totalItensGeral = vendas.reduce((sum, v) => sum + v.quantidade, 0);

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

  // Renderizar estrelas de qualidade
  const renderEstrelas = (nivel: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={12} 
        fill={i < nivel ? "#fbbf24" : "transparent"}
        color={i < nivel ? "#fbbf24" : "#d1d5db"}
        className="me-1"
      />
    ));
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}>
      {/* Header Premium */}
      <header className="sticky-top" style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #dcfce7',
        zIndex: 1000
      }}>
        <Container fluid="lg" className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="light" 
                onClick={onVoltar}
                className="btn-premium d-flex align-items-center justify-content-center p-2"
                style={{ width: '40px', height: '40px' }}
              >
                <ArrowLeft size={20} />
              </Button>
              
              <div className="d-flex align-items-center justify-content-center rounded-xl" style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)'
              }}>
                <ShoppingCart size={24} color="white" />
              </div>
              
              <div>
                <h1 className="h4 mb-0 fw-bold text-gray-900">Central de Vendas</h1>
                <p className="mb-0 small text-secondary">Registre vendas e acompanhe histórico</p>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-md-block">
                <p className="mb-0 small text-secondary">Receita total</p>
                <p className="mb-0 fw-bold text-success">R$ {totalReceitaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </Container>
      </header>

      <Container fluid="lg" className="py-4">
        {/* Navigation Tabs Premium */}
        <div className="card-premium p-2 mb-4">
          <div className="d-flex gap-2">
            <Button
              onClick={() => setActiveTab('vender')}
              className={`flex-fill btn-premium d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'vender' 
                  ? 'btn-gradient-success' 
                  : 'btn-light text-secondary'
              }`}
              style={activeTab !== 'vender' ? { border: '1px solid #e5e7eb' } : {}}
            >
              <ShoppingCart size={18} />
              <span className="fw-semibold">Nova Venda</span>
            </Button>
            
            <Button
              onClick={() => setActiveTab('historico')}
              className={`flex-fill btn-premium d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'historico' 
                  ? 'btn-gradient-primary' 
                  : 'btn-light text-secondary'
              }`}
              style={activeTab !== 'historico' ? { border: '1px solid #e5e7eb' } : {}}
            >
              <History size={18} />
              <span className="fw-semibold">Histórico</span>
              <Badge bg="primary" className="ms-1">{vendas.length}</Badge>
            </Button>
          </div>
        </div>

        {activeTab === 'vender' ? (
          /* ABA DE VENDER */
          <div>
            {/* Stats Vendas */}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#f0fdf4' }}>
                      <Package size={20} style={{ color: '#16a34a' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Itens Disponíveis</span>
                  </div>
                  <div className="stat-value" style={{ color: '#16a34a' }}>{itensDisponiveis.length}</div>
                  <div className="stat-label">produtos em estoque</div>
                </div>
              </Col>
              
              <Col md={3}>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#eff6ff' }}>
                      <TrendingUp size={20} style={{ color: '#2563eb' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Vendas Hoje</span>
                  </div>
                  <div className="stat-value text-primary">
                    {vendas.filter(v => {
                      const hoje = new Date().toDateString();
                      return new Date(v.dataVenda).toDateString() === hoje;
                    }).length}
                  </div>
                  <div className="stat-label">vendas realizadas</div>
                </div>
              </Col>
              
              <Col md={3}>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#fffbeb' }}>
                      <DollarSign size={20} style={{ color: '#d97706' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Receita Hoje</span>
                  </div>
                  <div className="stat-value" style={{ color: '#d97706' }}>
                    R$ {vendas
                      .filter(v => new Date(v.dataVenda).toDateString() === new Date().toDateString())
                      .reduce((sum, v) => sum + v.precoTotal, 0)
                      .toFixed(2)}
                  </div>
                  <div className="stat-label">em vendas</div>
                </div>
              </Col>
              
              <Col md={3}>
                <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#f5f3ff' }}>
                      <Star size={20} style={{ color: '#7c3aed' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Itens Premium</span>
                  </div>
                  <div className="stat-value" style={{ color: '#7c3aed' }}>
                    {itensDisponiveis.filter(i => i.nivelQualidade >= 4).length}
                  </div>
                  <div className="stat-label">qualidade 4-5 estrelas</div>
                </div>
              </Col>
            </Row>

            {/* Search & Filter Section - AGORA COM FILTROS AVANÇADOS */}
            <div className="card-premium p-4 mb-4">
              {/* Busca básica */}
              <Row className="g-3 align-items-end mb-3">
                <Col md={5}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    <Search size={14} className="me-1" />
                    Buscar produto
                  </Form.Label>
                  <Form.Control
                    placeholder="Digite nome ou código do item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control-premium"
                  />
                </Col>
                
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    <Filter size={14} className="me-1" />
                    Categoria
                  </Form.Label>
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
                    variant={mostrarFiltrosAvancados ? "success" : "light"}
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
                <strong>{itensDisponiveis.length}</strong> item(s) disponível(is)
                {filtrosAtivos > 0 && <span className="ms-1">• <span className="text-success">{filtrosAtivos} filtro(s)</span></span>}
              </p>
            </div>

            {itensDisponiveis.length === 0 ? (
              <div className="empty-state card-premium">
                <div className="empty-state-icon">🛒</div>
                <h4 className="h5 text-secondary mb-2">Nenhum item disponível</h4>
                <p className="text-secondary mb-3">Ajuste os filtros ou adicione itens ao estoque</p>
                {filtrosAtivos > 0 && (
                  <Button 
                    variant="outline-success" 
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
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        fontSize: '0.875rem'
                      }}>
                        {categoria.abreviacao}
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="h5 fw-bold mb-0 text-gray-900">{categoria.nome}</h3>
                        <p className="mb-0 small text-secondary">
                          {itens.length} produtos disponíveis
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-secondary" />
                    </div>

                    {/* Items Grid */}
                    <Row className="g-3">
                      {itens.map(item => (
                        <Col key={item.id} md={6} lg={4} xl={3}>
                          <Card 
                            onClick={() => setItemSelecionado(item)}
                            className="h-100 cursor-pointer hover-lift border-0 overflow-hidden"
                            style={{ 
                              borderRadius: '16px',
                              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div 
                              className="position-absolute top-0 start-0 w-100" 
                              style={{ 
                                height: '4px',
                                background: item.quantidade <= 5 
                                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' 
                                  : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                              }} 
                            />
                            
                            <Card.Body className="p-4">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge 
                                  bg="light" 
                                  text="dark" 
                                  className="font-monospace fw-bold"
                                  style={{ 
                                    fontSize: '0.75rem',
                                    padding: '0.5rem 0.75rem',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0'
                                  }}
                                >
                                  {item.codigo}
                                </Badge>
                                <div className="d-flex flex-column align-items-end gap-1">
                                  {item.usado && (
                                    <Badge 
                                      bg="warning" 
                                      text="dark"
                                      style={{ fontSize: '0.65rem' }}
                                    >
                                      Usado
                                    </Badge>
                                  )}
                                  {/* Badge de Qualidade */}
                                  <div className="d-flex align-items-center" title={getLabelQualidade(item.nivelQualidade)}>
                                    {renderEstrelas(item.nivelQualidade)}
                                  </div>
                                </div>
                              </div>

                              <h5 className="fw-bold text-gray-900 mb-1" style={{ 
                                fontSize: '0.9375rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {item.nome}
                              </h5>
                              <p className="small text-secondary mb-3">{item.marca}</p>

                              <div className="d-flex justify-content-between align-items-end">
                                <div>
                                  <p className="small text-secondary mb-1">Estoque</p>
                                  <p className={`h4 mb-0 fw-bold ${item.quantidade <= 5 ? 'text-danger' : 'text-success'}`}>
                                    {item.quantidade}
                                  </p>
                                </div>
                                <div className="text-end">
                                  <p className="small text-secondary mb-1">Preço</p>
                                  <p className="h5 mb-0 fw-bold text-success">
                                    R$ {item.precoVenda.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <Button 
                                variant="success" 
                                className="w-100 mt-3 btn-premium btn-gradient-success"
                              >
                                Vender Agora
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ABA DE HISTÓRICO - mantido igual */
          <div>
            {/* Stats Histórico */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#eff6ff' }}>
                      <FileText size={20} style={{ color: '#2563eb' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Total de Vendas</span>
                  </div>
                  <div className="stat-value text-primary">{totalVendas}</div>
                  <div className="stat-label">no período selecionado</div>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#f5f3ff' }}>
                      <Package size={20} style={{ color: '#7c3aed' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Itens Vendidos</span>
                  </div>
                  <div className="stat-value" style={{ color: '#7c3aed' }}>{totalItensVendidos}</div>
                  <div className="stat-label">unidades comercializadas</div>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-lg p-2" style={{ background: '#f0fdf4' }}>
                      <DollarSign size={20} style={{ color: '#16a34a' }} />
                    </div>
                    <span className="text-secondary small fw-medium">Receita Total</span>
                  </div>
                  <div className="stat-value text-success">R$ {totalReceita.toFixed(2)}</div>
                  <div className="stat-label">em vendas</div>
                </div>
              </Col>
            </Row>

            {/* Filtros do Histórico - mantido igual */}
            <div className="card-premium p-4 mb-4">
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-secondary mb-2">
                    <Calendar size={14} className="me-1" />
                    Período
                  </Form.Label>
                  <Form.Select
                    value={filtroPeriodo}
                    onChange={(e) => {
                      setFiltroPeriodo(e.target.value as FiltroPeriodo);
                      setDataFiltro('');
                    }}
                    className="form-control-premium"
                  >
                    <option value="todos">Todo o histórico</option>
                    <option value="dia">Dia específico</option>
                    <option value="mes">Mês específico</option>
                    <option value="ano">Ano específico</option>
                  </Form.Select>
                </Col>
                
                {filtroPeriodo !== 'todos' && (
                  <Col md={3}>
                    <Form.Label className="small fw-semibold text-secondary mb-2">
                      {filtroPeriodo === 'dia' ? 'Selecione a data' : filtroPeriodo === 'mes' ? 'Mês/Ano' : 'Ano'}
                    </Form.Label>
                    <Form.Control
                      type={filtroPeriodo === 'dia' ? 'date' : filtroPeriodo === 'mes' ? 'month' : 'number'}
                      min={filtroPeriodo === 'ano' ? '2000' : undefined}
                      max={filtroPeriodo === 'ano' ? '2100' : undefined}
                      value={dataFiltro}
                      onChange={(e) => setDataFiltro(e.target.value)}
                      className="form-control-premium"
                    />
                  </Col>
                )}

                {dataFiltro && (
                  <Col md="auto">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setDataFiltro('')}
                      className="btn-premium"
                    >
                      Limpar
                    </Button>
                  </Col>
                )}

                <Col md="auto" className="ms-auto">
                  <Button 
                    onClick={() => setIsRelatorioOpen(true)}
                    className="btn-premium btn-gradient-primary d-flex align-items-center gap-2"
                  >
                    <FileText size={18} />
                    Relatório Completo
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Lista de Vendas - mantido igual */}
            <div className="d-flex flex-column gap-3">
              {vendasPorData.length === 0 ? (
                <div className="empty-state card-premium">
                  <div className="empty-state-icon">📋</div>
                  <h4 className="h5 text-secondary mb-2">Nenhuma venda encontrada</h4>
                  <p className="text-secondary mb-0">Ajuste o período ou registre novas vendas</p>
                </div>
              ) : (
                vendasPorData.map(([data, vendasDoDia]) => {
                  const totalDia = vendasDoDia.reduce((sum, v) => sum + v.precoTotal, 0);
                  const itensDia = vendasDoDia.reduce((sum, v) => sum + v.quantidade, 0);
                  
                  return (
                    <Card key={data} className="border-0 overflow-hidden" style={{ 
                      borderRadius: '16px',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}>
                      <Card.Header className="bg-primary bg-opacity-10 border-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            <strong className="text-primary">{data}</strong>
                          </div>
                          <Badge bg="primary" className="px-3 py-2">
                            {vendasDoDia.length} venda(s) • {itensDia} item(ns) • R$ {totalDia.toFixed(2)}
                          </Badge>
                        </div>
                      </Card.Header>
                      
                      <div className="table-responsive">
                        <Table className="mb-0" style={{ fontSize: '0.9375rem' }}>
                          <thead className="bg-light">
                            <tr>
                              <th className="fw-semibold text-secondary text-uppercase small" style={{ padding: '1rem' }}>Item</th>
                              <th className="fw-semibold text-secondary text-uppercase small text-center" style={{ padding: '1rem' }}>Qtd</th>
                              <th className="fw-semibold text-secondary text-uppercase small text-end" style={{ padding: '1rem' }}>Unitário</th>
                              <th className="fw-semibold text-secondary text-uppercase small text-end" style={{ padding: '1rem' }}>Total</th>
                              <th className="fw-semibold text-secondary text-uppercase small" style={{ padding: '1rem' }}>Cliente</th>
                              <th className="fw-semibold text-secondary text-uppercase small text-center" style={{ padding: '1rem' }}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendasDoDia.map((venda) => (
                              <tr key={venda.id} className="align-middle">
                                <td style={{ padding: '1rem' }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <Badge bg="light" text="dark" className="font-monospace">
                                      {venda.itemCodigo}
                                    </Badge>
                                    <div>
                                      <p className="mb-0 fw-semibold">{venda.itemNome}</p>
                                      <small className="text-secondary">{venda.itemCategoria}</small>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center fw-bold" style={{ padding: '1rem' }}>{venda.quantidade}</td>
                                <td className="text-end" style={{ padding: '1rem' }}>R$ {venda.precoUnitario.toFixed(2)}</td>
                                <td className="text-end fw-bold text-success" style={{ padding: '1rem' }}>R$ {venda.precoTotal.toFixed(2)}</td>
                                <td style={{ padding: '1rem' }}>
                                  {venda.cliente ? (
                                    <div className="d-flex align-items-center gap-1 text-secondary">
                                      <User size={14} />
                                      <span>{venda.cliente}</span>
                                    </div>
                                  ) : (
                                    <span className="text-secondary">-</span>
                                  )}
                                </td>
                                <td className="text-center" style={{ padding: '1rem' }}>
                                  <Button
                                    variant="link"
                                    onClick={() => confirmarExclusao(venda)}
                                    className="text-danger p-1"
                                    style={{ textDecoration: 'none' }}
                                    title="Excluir venda"
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Container>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
        <div className="p-4 text-center">
          <div className="mb-3">
            <AlertTriangle size={48} className="text-warning" />
          </div>
          <h5 className="fw-bold mb-2">Confirmar Exclusão</h5>
          <p className="text-secondary mb-4">
            Tem certeza que deseja excluir esta venda de <strong>{vendaParaExcluir?.itemNome}</strong>?<br/>
            <small className="text-muted">
              O item será devolvido ao estoque ({vendaParaExcluir?.quantidade} unidade(s))
            </small>
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button 
              variant="light" 
              onClick={() => setShowConfirmDelete(false)}
              className="btn-premium"
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleExcluirVenda}
              className="btn-premium d-flex align-items-center gap-2"
            >
              <Trash2 size={18} />
              Sim, Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modais */}
      {itemSelecionado && (
        <VendaModal
          item={itemSelecionado}
          itensDisponiveis={itensDisponiveis}
          onClose={() => setItemSelecionado(null)}
          onVender={handleVender}
          onVenderCarrinho={handleVenderCarrinho}
        />
      )}

      {isRelatorioOpen && (
        <RelatorioVendasModal
          vendas={vendas}
          onClose={() => setIsRelatorioOpen(false)}
        />
      )}
    </div>
  );
}