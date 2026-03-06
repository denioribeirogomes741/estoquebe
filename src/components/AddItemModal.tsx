import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
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
    fotoUrl: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoriaId) {
      alert('Selecione uma categoria!');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>+ Novo Item</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Categoria *</Form.Label>
                <Form.Select
                  required
                  value={formData.categoriaId}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome} ({cat.abreviacao})
                    </option>
                  ))}
                </Form.Select>
                {categorias.length === 0 && (
                  <Form.Text className="text-danger">
                    Cadastre uma categoria primeiro!
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={8}>
              <Form.Group>
                <Form.Label>Nome do Item *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ex: Driver Titânio"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Marca *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ex: TaylorMade"
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Preço Custo (R$) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.precoCusto || ''}
                  onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Preço Venda (R$) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.precoVenda || ''}
                  onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Quantidade *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  required
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>URL da Foto (opcional)</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({...formData, fotoUrl: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Observações (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Detalhes adicionais..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="novo-usado"
                label="Item Usado"
                checked={formData.usado}
                onChange={(e) => setFormData({...formData, usado: e.target.checked})}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="success"
            disabled={!formData.categoriaId}
          >
            + Adicionar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}