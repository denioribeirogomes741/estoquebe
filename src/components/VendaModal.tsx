import React, { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { X, ShoppingCart, Package, DollarSign, User, FileText } from 'lucide-react';
import { Item } from '../types';

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
}

export default function VendaModal({ item, onClose, onVender }: VendaModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [cliente, setCliente] = useState('');
  const [observacao, setObservacao] = useState('');

  const precoTotal = quantidade * item.precoVenda;

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

  return (
    <Modal 
      show 
      onHide={onClose} 
      centered
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
              <h5 className="mb-0 fw-bold">Registrar Venda</h5>
            </div>
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

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
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
                  -
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
                  +
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
      </div>
    </Modal>
  );
}