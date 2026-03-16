import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import { 
  X, 
  Package, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Star, 
  Edit3, 
  Trash2
} from 'lucide-react';
import { Item } from '../types';

interface ItemModalProps {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ItemModal({ item, onClose, onEdit, onDelete }: ItemModalProps) {
  const valorTotalCusto = item.precoCusto * item.quantidade;
  const valorTotalVenda = item.precoVenda * item.quantidade;
  const lucroTotal = valorTotalVenda - valorTotalCusto;
  const margemLucro = item.precoCusto > 0 ? ((item.precoVenda - item.precoCusto) / item.precoCusto) * 100 : 0;

  const formatarValor = (valor: number): string => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getLabelQualidade = (nivel: number = 3) => {
    const labels = ['Básico', 'Inicial', 'Intermediário', 'Avançado', 'Premium'];
    return labels[nivel - 1] || 'Intermediário';
  };

  const renderEstrelas = (nivel: number = 3) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < nivel ? "#fbbf24" : "transparent"}
        color={i < nivel ? "#f59e0b" : "#d1d5db"}
        className="me-1"
      />
    ));
  };

  return (
    <Modal 
      show 
      onHide={onClose} 
      centered 
      size="lg"
      contentClassName="border-0 overflow-hidden"
      style={{ '--bs-modal-border-radius': '24px' } as React.CSSProperties}
    >
      {/* Header Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '1.5rem',
      }}>
        <div className="d-flex justify-content-between align-items-start text-white">
          <div className="d-flex align-items-start gap-3">
            {item.fotoUrl ? (
              <img 
                src={item.fotoUrl} 
                alt={item.nome}
                className="rounded-lg"
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px'
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div 
                className="rounded-lg d-flex align-items-center justify-content-center"
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px'
                }}
              >
                <Package size={32} color="white" />
              </div>
            )}
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Badge 
                  bg="light" 
                  text="dark" 
                  className="font-monospace fw-bold"
                  style={{ fontSize: '0.875rem' }}
                >
                  {item.codigo}
                </Badge>
                <Badge 
                  bg={item.usado ? 'warning' : 'success'} 
                  text={item.usado ? 'dark' : 'white'}
                  style={{ fontSize: '0.75rem' }}
                >
                  {item.usado ? 'Usado' : 'Novo'}
                </Badge>
              </div>
              <h5 className="mb-0 fw-bold text-white" style={{ fontSize: '1.25rem' }}>{item.nome}</h5>
              <small style={{ color: 'rgba(255,255,255,0.7)' }}>{item.marca || 'Sem marca'}</small>
            </div>
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

      <Modal.Body className="p-4" style={{ background: '#ffffff' }}>
        {/* Imagem grande se existir */}
        {item.fotoUrl && (
          <div className="mb-4">
            <img 
              src={item.fotoUrl} 
              alt={item.nome}
              className="img-fluid w-100"
              style={{ 
                maxHeight: '250px', 
                objectFit: 'cover',
                borderRadius: '16px'
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Grid de Informações */}
        <Row className="g-3">
          {/* Categoria */}
          <Col md={6}>
            <div className="p-3 rounded-xl" style={{ 
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                <Tag size={14} />
                <span>Categoria</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="d-flex align-items-center justify-content-center rounded fw-bold text-white"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    fontSize: '0.75rem',
                    borderRadius: '8px'
                  }}
                >
                  {item.categoriaAbreviacao}
                </div>
                <span className="fw-semibold">{item.categoriaNome}</span>
              </div>
            </div>
          </Col>

          {/* Qualidade */}
          <Col md={6}>
            <div className="p-3 rounded-xl" style={{ 
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                <Star size={14} />
                <span>Qualidade</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  {renderEstrelas(item.nivelQualidade)}
                </div>
                <Badge bg="warning" text="dark">
                  {getLabelQualidade(item.nivelQualidade)}
                </Badge>
              </div>
            </div>
          </Col>

          {/* Quantidade */}
          <Col md={4}>
            <div className="p-3 rounded-xl text-center" style={{ 
              background: item.quantidade <= 5 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${item.quantidade <= 5 ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-secondary small">
                <Package size={14} />
                <span>Estoque</span>
              </div>
              <h4 className={`mb-0 fw-bold ${item.quantidade <= 5 ? 'text-danger' : 'text-success'}`}>
                {item.quantidade}
              </h4>
              <small className="text-secondary">unidades</small>
            </div>
          </Col>

          {/* Preço Custo */}
          <Col md={4}>
            <div className="p-3 rounded-xl text-center" style={{ 
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-secondary small">
                <DollarSign size={14} />
                <span>Custo Unit.</span>
              </div>
              <h5 className="mb-0 fw-bold text-danger">
                {formatarValor(item.precoCusto)}
              </h5>
            </div>
          </Col>

          {/* Preço Venda */}
          <Col md={4}>
            <div className="p-3 rounded-xl text-center" style={{ 
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-secondary small">
                <DollarSign size={14} />
                <span>Venda Unit.</span>
              </div>
              <h5 className="mb-0 fw-bold text-success">
                {formatarValor(item.precoVenda)}
              </h5>
            </div>
          </Col>

          {/* Valores Totais */}
          <Col md={12}>
            <div className="p-4 rounded-xl" style={{ 
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px'
            }}>
              <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                <TrendingUp size={16} />
                Resumo Financeiro
              </h6>
              <Row className="g-3 text-center">
                <Col md={3}>
                  <small className="text-secondary d-block mb-1">Custo Total</small>
                  <span className="fw-bold text-danger">{formatarValor(valorTotalCusto)}</span>
                </Col>
                <Col md={3}>
                  <small className="text-secondary d-block mb-1">Venda Total</small>
                  <span className="fw-bold text-success">{formatarValor(valorTotalVenda)}</span>
                </Col>
                <Col md={3}>
                  <small className="text-secondary d-block mb-1">Lucro Total</small>
                  <span className={`fw-bold ${lucroTotal >= 0 ? 'text-primary' : 'text-danger'}`}>
                    {formatarValor(lucroTotal)}
                  </span>
                </Col>
                <Col md={3}>
                  <small className="text-secondary d-block mb-1">Margem</small>
                  <span className={`fw-bold ${margemLucro >= 0 ? 'text-info' : 'text-danger'}`}>
                    {margemLucro.toFixed(1)}%
                  </span>
                </Col>
              </Row>
            </div>
          </Col>

          {/* Tags Específicas */}
          {item.tagsEspecificas && item.tagsEspecificas.length > 0 && (
            <Col md={12}>
              <div className="p-3 rounded-xl" style={{ 
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '16px'
              }}>
                <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                  <Tag size={14} />
                  <span>Especificações Técnicas</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {item.tagsEspecificas.map((tag, index) => (
                    <Badge 
                      key={index}
                      bg="primary"
                      style={{ 
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px'
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Col>
          )}

          {/* Observações */}
          {item.observacoes && (
            <Col md={12}>
              <div className="p-3 rounded-xl" style={{ 
                background: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '16px'
              }}>
                <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                  <AlertCircle size={14} />
                  <span>Observações</span>
                </div>
                <p className="mb-0 small">{item.observacoes}</p>
              </div>
            </Col>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 pb-4 px-4" style={{ background: '#ffffff' }}>
        <Button 
          variant="light" 
          onClick={onClose}
          className="flex-fill btn-premium"
          style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '0.75rem'
          }}
        >
          Fechar
        </Button>
        <Button 
          variant="primary"
          onClick={onEdit}
          className="flex-fill btn-premium d-flex align-items-center justify-content-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
          }}
        >
          <Edit3 size={18} />
          Editar Item
        </Button>
        <Button 
          variant="danger"
          onClick={() => {
            if (confirm('Tem certeza que deseja excluir este item?')) onDelete();
          }}
          className="flex-fill btn-premium d-flex align-items-center justify-content-center gap-2"
          style={{ 
            borderRadius: '12px',
            padding: '0.75rem'
          }}
        >
          <Trash2 size={18} />
          Excluir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}