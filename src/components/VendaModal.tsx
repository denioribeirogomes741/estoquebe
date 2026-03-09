import React, { useState } from 'react';
import { Modal, Button, Form, Badge, Table } from 'react-bootstrap';
import { X, ShoppingCart, Package, DollarSign, User, FileText, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { Item } from '../types';

interface CarrinhoItem {
  item: Item;
  quantidade: number;
}

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
    cliente: string;
    observacao: string;
  }) => void;
  onVenderCarrinho?: (vendas: {
    itemId: string;
    itemCodigo: string;
    itemNome: string;
    itemCategoria: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
    cliente: string;
    observacao: string;
  }[], totalGeral: number) => void;
  itensDisponiveis?: Item[];
}

export default function VendaModal({ 
  item, 
  onClose, 
  onVender, 
  onVenderCarrinho,
  itensDisponiveis = [] 
}: VendaModalProps) {
  const [modo, setModo] = useState<'rapida' | 'carrinho'>('rapida');
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [cliente, setCliente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [buscaItem, setBuscaItem] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  const precoTotal = quantidade * item.precoVenda;
  const totalCarrinho = carrinho.reduce((sum, ci) => sum + (ci.quantidade * ci.item.precoVenda), 0);

  // Filtrar itens disponíveis para adicionar ao carrinho
  const itensParaAdicionar = itensDisponiveis.filter(i => 
    i.id !== item.id && 
    i.quantidade > 0 &&
    (i.nome.toLowerCase().includes(buscaItem.toLowerCase()) || 
     i.codigo.toLowerCase().includes(buscaItem.toLowerCase())) &&
    !carrinho.some(ci => ci.item.id === i.id)
  );

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
      cliente: cliente || '',
      observacao: observacao || ''
    });
  };

  const adicionarAoCarrinho = (itemAdd: Item, qtd: number) => {
    if (qtd > itemAdd.quantidade) {
      alert(`Estoque insuficiente! Disponível: ${itemAdd.quantidade}`);
      return;
    }
    setCarrinho([...carrinho, { item: itemAdd, quantidade: qtd }]);
    setShowAddItem(false);
    setBuscaItem('');
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const atualizarQuantidadeCarrinho = (index: number, novaQtd: number) => {
    const itemCarrinho = carrinho[index];
    if (novaQtd > itemCarrinho.item.quantidade) {
      alert(`Estoque insuficiente! Disponível: ${itemCarrinho.item.quantidade}`);
      return;
    }
    if (novaQtd < 1) {
      removerDoCarrinho(index);
      return;
    }
    const novoCarrinho = [...carrinho];
    novoCarrinho[index].quantidade = novaQtd;
    setCarrinho(novoCarrinho);
  };

  const handleVenderCarrinho = () => {
    if (carrinho.length === 0) {
      alert('Adicione itens ao carrinho primeiro!');
      return;
    }

    const vendas = carrinho.map(ci => ({
      itemId: ci.item.id,
      itemCodigo: ci.item.codigo,
      itemNome: ci.item.nome,
      itemCategoria: ci.item.categoriaNome,
      quantidade: ci.quantidade,
      precoUnitario: ci.item.precoVenda,
      precoTotal: ci.quantidade * ci.item.precoVenda,
      cliente: cliente || '',
      observacao: observacao || ''
    }));

    onVenderCarrinho?.(vendas, totalCarrinho);
  };

  return (
    <Modal 
      show 
      onHide={onClose} 
      centered
      size={modo === 'carrinho' ? 'lg' : undefined}
      contentClassName="border-0"
      style={{ '--bs-modal-border-radius': '24px' } as React.CSSProperties}
    >
      <div className="position-relative">
        {/* Header Gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '1.5rem',
          borderRadius: '24px 24px 0 0'
        }}>
          <div className="d-flex justify-content-between align-items-center text-white">
            <div className="d-flex align-items-center gap-2">
              <ShoppingCart size={24} />
              <h5 className="mb-0 fw-bold">
                {modo === 'rapida' ? 'Registrar Venda' : 'Carrinho de Vendas'}
              </h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              {modo === 'carrinho' && (
                <Button 
                  variant="link" 
                  onClick={() => setModo('rapida')}
                  className="text-white p-1"
                  style={{ textDecoration: 'none', fontSize: '0.875rem' }}
                >
                  <ArrowLeft size={18} className="me-1" />
                  Voltar
                </Button>
              )}
              <Button 
                variant="link" 
                onClick={onClose}
                className="text-white p-0"
                style={{ textDecoration: 'none' }}
              >
                <X size={24} />
              </Button>
            </div>
          </div>
        </div>

        {modo === 'rapida' ? (
          /* MODO VENDA RÁPIDA */
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="p-4">
              {/* Toggle Modo */}
              <div className="d-flex gap-2 mb-4">
                <Button
                  variant="success"
                  className="flex-fill btn-premium btn-gradient-success"
                  style={{ opacity: 1 }}
                >
                  Venda Rápida
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => setModo('carrinho')}
                  className="flex-fill btn-premium"
                >
                  <ShoppingCart size={16} className="me-1" />
                  Carrinho
                </Button>
              </div>

              {/* Product Info Card */}
              <div className="p-3 rounded-xl mb-4" style={{ 
                background: '#f0fdf4',
                border: '1px solid #bbf7d0'
              }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Badge 
                      bg="success" 
                      className="mb-2 font-monospace"
                      style={{ background: '#16a34a' }}
                    >
                      {item.codigo}
                    </Badge>
                    <h6 className="fw-bold mb-1 text-gray-900">{item.nome}</h6>
                    <small className="text-secondary">{item.categoriaNome}</small>
                  </div>
                  {item.usado && (
                    <Badge bg="warning" text="dark">USADO</Badge>
                  )}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px dashed #86efac' }}>
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <Package size={16} />
                    <small>Estoque: <strong className="text-success">{item.quantidade}</strong></small>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <DollarSign size={16} />
                    <small>Preço: <strong className="text-success">R$ {item.precoVenda.toFixed(2)}</strong></small>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <Package size={14} />
                  Quantidade *
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="rounded-circle p-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <Minus size={16} />
                  </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    max={item.quantidade}
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                    className="form-control-premium text-center fw-bold"
                    style={{ maxWidth: '100px' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantidade(Math.min(item.quantidade, quantidade + 1))}
                    className="rounded-circle p-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <Plus size={16} />
                  </Button>
                  <small className="text-secondary">máx: {item.quantidade}</small>
                </div>
              </Form.Group>

              {/* Client */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <User size={14} />
                  Cliente (opcional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="form-control-premium"
                />
              </Form.Group>

              {/* Observation */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <FileText size={14} />
                  Observação (opcional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Alguma observação sobre a venda..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="form-control-premium"
                />
              </Form.Group>

              {/* Total */}
              <div className="p-4 rounded-xl text-center" style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #86efac'
              }}>
                <small className="text-secondary d-block mb-1">Total da venda</small>
                <h3 className="mb-0 fw-bold text-success" style={{ fontSize: '2rem' }}>
                  R$ {precoTotal.toFixed(2)}
                </h3>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
              <Button 
                variant="light" 
                onClick={onClose}
                className="flex-fill btn-premium"
                style={{ border: '1px solid #e5e7eb' }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-fill btn-premium btn-gradient-success d-flex align-items-center justify-content-center gap-2"
              >
                <ShoppingCart size={18} />
                Confirmar Venda
              </Button>
            </Modal.Footer>
          </Form>
        ) : (
          /* MODO CARRINHO */
          <div>
            <Modal.Body className="p-4">
              {/* Toggle Modo */}
              <div className="d-flex gap-2 mb-4">
                <Button
                  variant="outline-success"
                  onClick={() => setModo('rapida')}
                  className="flex-fill btn-premium"
                >
                  Venda Rápida
                </Button>
                <Button
                  variant="success"
                  className="flex-fill btn-premium btn-gradient-success"
                  style={{ opacity: 1 }}
                >
                  <ShoppingCart size={16} className="me-1" />
                  Carrinho ({carrinho.length})
                </Button>
              </div>

              {/* Cliente e Observação (compartilhado) */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <User size={14} />
                  Cliente (opcional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="form-control-premium"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <FileText size={14} />
                  Observação geral (opcional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Observação para todas as vendas..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="form-control-premium"
                />
              </Form.Group>

              {/* Item Principal (já no carrinho) */}
              <div className="p-3 rounded-xl mb-3" style={{ 
                background: '#f0fdf4',
                border: '2px solid #22c55e'
              }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Badge bg="success" className="mb-1">ITEM PRINCIPAL</Badge>
                    <h6 className="fw-bold mb-0">{item.nome}</h6>
                    <small className="text-secondary">{item.codigo}</small>
                  </div>
                  <div className="text-end">
                    <p className="mb-0 fw-bold text-success">R$ {item.precoVenda.toFixed(2)}</p>
                    <small className="text-secondary">unidade</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="rounded-circle p-1"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Minus size={14} />
                  </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    max={item.quantidade}
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                    className="form-control-premium text-center fw-bold"
                    style={{ maxWidth: '70px', padding: '0.25rem' }}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantidade(Math.min(item.quantidade, quantidade + 1))}
                    className="rounded-circle p-1"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Plus size={14} />
                  </Button>
                  <small className="text-secondary ms-2">Estoque: {item.quantidade}</small>
                </div>
              </div>

              {/* Itens Adicionais no Carrinho */}
              {carrinho.map((ci, index) => (
                <div key={ci.item.id} className="p-3 rounded-xl mb-2" style={{ 
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: '0.9375rem' }}>{ci.item.nome}</h6>
                      <small className="text-secondary">{ci.item.codigo}</small>
                    </div>
                    <Button
                      variant="link"
                      onClick={() => removerDoCarrinho(index)}
                      className="text-danger p-0"
                      style={{ textDecoration: 'none' }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => atualizarQuantidadeCarrinho(index, ci.quantidade - 1)}
                        className="rounded-circle p-1"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="fw-bold mx-2">{ci.quantidade}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => atualizarQuantidadeCarrinho(index, ci.quantidade + 1)}
                        className="rounded-circle p-1"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 fw-bold">R$ {(ci.quantidade * ci.item.precoVenda).toFixed(2)}</p>
                      <small className="text-secondary">R$ {ci.item.precoVenda.toFixed(2)} cada</small>
                    </div>
                  </div>
                </div>
              ))}

              {/* Adicionar Mais Itens */}
              {!showAddItem ? (
                <Button
                  variant="outline-primary"
                  onClick={() => setShowAddItem(true)}
                  className="w-100 btn-premium mb-3"
                >
                  <Plus size={18} className="me-2" />
                  Adicionar outro item
                </Button>
              ) : (
                <div className="p-3 rounded-xl mb-3" style={{ 
                  background: '#eff6ff',
                  border: '1px solid #3b82f6'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-primary">Adicionar Item</h6>
                    <Button
                      variant="link"
                      onClick={() => {
                        setShowAddItem(false);
                        setBuscaItem('');
                      }}
                      className="text-secondary p-0"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome ou código..."
                    value={buscaItem}
                    onChange={(e) => setBuscaItem(e.target.value)}
                    className="form-control-premium mb-2"
                    autoFocus
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {buscaItem && itensParaAdicionar.length === 0 && (
                      <p className="text-secondary small mb-0 py-2">Nenhum item encontrado</p>
                    )}
                    {itensParaAdicionar.slice(0, 5).map(itemAdd => (
                      <div key={itemAdd.id} className="d-flex justify-content-between align-items-center p-2 rounded hover:bg-gray-100" style={{ cursor: 'pointer' }} onClick={() => adicionarAoCarrinho(itemAdd, 1)}>
                        <div>
                          <p className="mb-0 fw-medium" style={{ fontSize: '0.875rem' }}>{itemAdd.nome}</p>
                          <small className="text-secondary">{itemAdd.codigo} • Estoque: {itemAdd.quantidade}</small>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 fw-bold text-success">R$ {itemAdd.precoVenda.toFixed(2)}</p>
                          <Button variant="success" size="sm" className="py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total do Carrinho */}
              <div className="p-4 rounded-xl text-center mt-4" style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #86efac'
              }}>
                <small className="text-secondary d-block mb-1">Total do carrinho</small>
                <h3 className="mb-0 fw-bold text-success" style={{ fontSize: '2rem' }}>
                  R$ {(totalCarrinho + (quantidade * item.precoVenda)).toFixed(2)}
                </h3>
                <small className="text-secondary">
                  {carrinho.length + 1} item(s) • {carrinho.reduce((sum, ci) => sum + ci.quantidade, 0) + quantidade} unidade(s)
                </small>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
              <Button 
                variant="light" 
                onClick={onClose}
                className="flex-fill btn-premium"
                style={{ border: '1px solid #e5e7eb' }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleVenderCarrinho}
                className="flex-fill btn-premium btn-gradient-success d-flex align-items-center justify-content-center gap-2"
              >
                <ShoppingCart size={18} />
                Finalizar Venda
              </Button>
            </Modal.Footer>
          </div>
        )}
      </div>
    </Modal>
  );
}