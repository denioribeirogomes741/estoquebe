import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Item } from '../types';

interface EditModalProps {
  item: Item;
  onClose: () => void;
  onSave: (data: Partial<Item>) => void;
}

export default function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    nome: item.nome,
    marca: item.marca,
    precoCusto: item.precoCusto,
    precoVenda: item.precoVenda,
    quantidade: item.quantidade,
    usado: item.usado,
    observacoes: item.observacoes || '',
    fotoUrl: item.fotoUrl || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>✏️ Editar Item</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Código (não editável)</Form.Label>
                <Form.Control type="text" value={item.codigo} disabled />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Categoria (não editável)</Form.Label>
                <Form.Control type="text" value={item.categoriaNome} disabled />
              </Form.Group>
            </Col>

            <Col md={8}>
              <Form.Group>
                <Form.Label>Nome *</Form.Label>
                <Form.Control
                  type="text"
                  required
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
                  value={formData.precoCusto}
                  onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value)})}
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
                  value={formData.precoVenda}
                  onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value)})}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Quantidade *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  required
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>URL da Foto</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({...formData, fotoUrl: e.target.value})}
                />
                {formData.fotoUrl && (
                  <img 
                    src={formData.fotoUrl} 
                    alt="Preview" 
                    className="mt-2 img-thumbnail"
                    style={{ maxHeight: '100px' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Observações</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="edit-usado"
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
          <Button type="submit" variant="primary">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}