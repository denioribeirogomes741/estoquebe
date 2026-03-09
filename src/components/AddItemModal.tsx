import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { X, Plus, Package, DollarSign, Tag, Image, FileText, Check, Star } from 'lucide-react';
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
    quantidade: 1,
    usado: false,
    observacoes: '',
    fotoUrl: '',
    nivelQualidade: 3 as 1 | 2 | 3 | 4 | 5, // Padrão: Intermediário
    tagsEspecificas: [] as string[]
  });

  const [novaTag, setNovaTag] = useState('');

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

  const adicionarTag = () => {
    if (novaTag.trim() && !formData.tagsEspecificas.includes(novaTag.trim())) {
      setFormData({
        ...formData,
        tagsEspecificas: [...formData.tagsEspecificas, novaTag.trim()]
      });
      setNovaTag('');
    }
  };

  const removerTag = (tag: string) => {
    setFormData({
      ...formData,
      tagsEspecificas: formData.tagsEspecificas.filter(t => t !== tag)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoriaId) {
      alert('Selecione uma categoria!');
      return;
    }
    onSave(formData);
  };

  const categoriaSelecionada = categorias.find(c => c.id === formData.categoriaId);

  const getLabelQualidade = (nivel: number) => {
    const labels = ['Básico', 'Inicial', 'Intermediário', 'Avançado', 'Premium'];
    return labels[nivel - 1] || 'Intermediário';
  };

  return (
    <Modal 
      show 
      onHide={onClose} 
      centered 
      size="lg"
      contentClassName="border-0"
      style={{ '--bs-modal-border-radius': '24px' } as React.CSSProperties}
    >
      <div className="position-relative">
        {/* Header Gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '1.5rem',
          borderRadius: '24px 24px 0 0'
        }}>
          <div className="d-flex justify-content-between align-items-center text-white">
            <div className="d-flex align-items-center gap-2">
              <Plus size={24} />
              <h5 className="mb-0 fw-bold">Novo Item</h5>
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
            {/* Categoria Card */}
            <div className="p-3 rounded-xl mb-4" style={{ 
              background: '#eff6ff',
              border: '1px solid #bfdbfe'
            }}>
              <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2 mb-2">
                <Tag size={14} />
                Categoria *
              </Form.Label>
              
              <Form.Select
                required
                value={formData.categoriaId}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="form-control-premium mb-2"
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome} ({cat.abreviacao})
                  </option>
                ))}
              </Form.Select>
              
              {categorias.length === 0 && (
                <small className="text-danger">
                  Cadastre uma categoria primeiro!
                </small>
              )}

              {categoriaSelecionada && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded fw-bold text-white"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {categoriaSelecionada.abreviacao}
                  </div>
                  <span className="small text-secondary">{categoriaSelecionada.nome}</span>
                </div>
              )}
            </div>

            <Row className="g-3">
              {/* Nome */}
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Package size={14} />
                    Nome do Item *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ex: Driver Titânio"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Marca */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Tag size={14} />
                    Marca *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ex: TaylorMade"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Preço Custo */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <DollarSign size={14} />
                    Preço Custo (R$) *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0,00"
                    value={formData.precoCusto || ''}
                    onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value) || 0})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Preço Venda */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <DollarSign size={14} />
                    Preço Venda (R$) *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0,00"
                    value={formData.precoVenda || ''}
                    onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value) || 0})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Quantidade */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Package size={14} />
                    Quantidade *
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFormData({...formData, quantidade: Math.max(1, formData.quantidade - 1)})}
                      className="rounded-circle p-2"
                      style={{ width: '40px', height: '40px' }}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      min="1"
                      required
                      value={formData.quantidade}
                      onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
                      className="form-control-premium text-center fw-bold"
                      style={{ maxWidth: '80px' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFormData({...formData, quantidade: formData.quantidade + 1})}
                      className="rounded-circle p-2"
                      style={{ width: '40px', height: '40px' }}
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              {/* NOVO: Nível de Qualidade */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Star size={14} />
                    Nível de Qualidade *
                  </Form.Label>
                  <div className="p-3 rounded-xl" style={{ 
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div className="d-flex justify-content-between mb-2">
                      {[1, 2, 3, 4, 5].map((nivel) => (
                        <Button
                          key={nivel}
                          variant={formData.nivelQualidade === nivel ? "warning" : "light"}
                          onClick={() => setFormData({...formData, nivelQualidade: nivel as 1|2|3|4|5})}
                          className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            background: formData.nivelQualidade === nivel ? '#fbbf24' : 'white',
                            border: formData.nivelQualidade === nivel ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                          }}
                          title={getLabelQualidade(nivel)}
                        >
                          <Star 
                            size={16} 
                            fill={formData.nivelQualidade >= nivel ? "#fbbf24" : "transparent"}
                            color={formData.nivelQualidade >= nivel ? "#f59e0b" : "#d1d5db"}
                          />
                        </Button>
                      ))}
                    </div>
                    <div className="text-center">
                      <Badge bg="warning" text="dark" className="px-3">
                        {getLabelQualidade(formData.nivelQualidade)}
                      </Badge>
                    </div>
                  </div>
                </Form.Group>
              </Col>

              {/* NOVO: Tags Específicas */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Tag size={14} />
                    Especificações Técnicas
                  </Form.Label>
                  <div className="p-3 rounded-xl" style={{ 
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div className="d-flex gap-2 mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Ex: i7, 16GB RAM, SSD..."
                        value={novaTag}
                        onChange={(e) => setNovaTag(e.target.value)}
                        className="form-control-premium"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
                      />
                      <Button 
                        variant="primary"
                        onClick={adicionarTag}
                        className="btn-premium"
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {formData.tagsEspecificas.map((tag) => (
                        <Badge 
                          key={tag} 
                          bg="primary" 
                          className="d-flex align-items-center gap-1"
                          style={{ padding: '0.5rem 0.75rem' }}
                        >
                          {tag}
                          <X 
                            size={14} 
                            className="cursor-pointer" 
                            onClick={() => removerTag(tag)}
                          />
                        </Badge>
                      ))}
                      {formData.tagsEspecificas.length === 0 && (
                        <small className="text-secondary">Nenhuma especificação adicionada</small>
                      )}
                    </div>
                  </div>
                </Form.Group>
              </Col>

              {/* URL da Foto */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <Image size={14} />
                    URL da Foto (opcional)
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({...formData, fotoUrl: e.target.value})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Observações */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                    <FileText size={14} />
                    Observações (opcional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Detalhes adicionais sobre o item..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    className="form-control-premium"
                  />
                </Form.Group>
              </Col>

              {/* Checkbox Usado */}
              <Col md={12}>
                <div className="p-3 rounded-xl" style={{ 
                  background: formData.usado ? '#fef3c7' : '#f9fafb',
                  border: `1px solid ${formData.usado ? '#fcd34d' : '#e5e7eb'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <Form.Check
                    type="checkbox"
                    id="novo-usado"
                    label={
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Item Usado</span>
                        {formData.usado && (
                          <Badge bg="warning" text="dark" style={{ fontSize: '0.75rem' }}>
                            USADO
                          </Badge>
                        )}
                      </div>
                    }
                    checked={formData.usado}
                    onChange={(e) => setFormData({...formData, usado: e.target.checked})}
                  />
                  <small className="text-secondary d-block mt-1">
                    Marque esta opção se o item for usado/pre-owned
                  </small>
                </div>
              </Col>
            </Row>

            {/* Preview de Valores */}
            <div className="p-4 rounded-xl text-center mt-4" style={{ 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid #3b82f6'
            }}>
              <small className="text-secondary d-block mb-1">Margem de Lucro</small>
              <h3 className="mb-0 fw-bold text-primary" style={{ fontSize: '1.5rem' }}>
                {formData.precoCusto > 0 && formData.precoVenda > 0 
                  ? `${(((formData.precoVenda - formData.precoCusto) / formData.precoCusto) * 100).toFixed(1)}%`
                  : '-'}
              </h3>
              <small className="text-secondary">
                {formData.precoCusto > 0 && formData.precoVenda > 0 
                  ? `Lucro: R$ ${(formData.precoVenda - formData.precoCusto).toFixed(2)} por unidade`
                  : 'Preencha os preços para ver a margem'}
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
              type="submit" 
              className="flex-fill btn-premium btn-gradient-primary d-flex align-items-center justify-content-center gap-2"
              disabled={!formData.categoriaId || !formData.nome || !formData.marca}
            >
              <Check size={18} />
              Salvar Item
            </Button>
          </Modal.Footer>
        </Form>
      </div>
    </Modal>
  );
}