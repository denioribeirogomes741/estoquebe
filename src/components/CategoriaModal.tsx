import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Categoria } from '../types';
import { Modal, Button, Form, Badge, ListGroup, Row, Col } from 'react-bootstrap';
import { 
  X, 
  Plus, 
  Settings, 
  Tag, 
  Trash2, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CategoriaModalProps {
  onClose: () => void;
  onAdd: (nome: string, abreviacao: string) => void;
}

export default function CategoriaModal({ onClose, onAdd }: CategoriaModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', abreviacao: '' });
  const [erro, setErro] = useState('');

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!novaCategoria.nome.trim() || !novaCategoria.abreviacao.trim()) {
      setErro('Preencha nome e abreviação!');
      return;
    }

    if (novaCategoria.abreviacao.length > 3) {
      setErro('Abreviação deve ter no máximo 3 caracteres!');
      return;
    }
    
    onAdd(novaCategoria.nome.trim(), novaCategoria.abreviacao.trim().toUpperCase());
    setNovaCategoria({ nome: '', abreviacao: '' });
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${nome}"?\n\nIsso pode afetar itens existentes!`)) {
      try {
        await deleteDoc(doc(db, 'categorias', id));
      } catch (error) {
        alert('Erro ao deletar categoria');
      }
    }
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          padding: '1.5rem',
          borderRadius: '24px 24px 0 0'
        }}>
          <div className="d-flex justify-content-between align-items-center text-white">
            <div className="d-flex align-items-center gap-2">
              <Settings size={24} />
              <h5 className="mb-0 fw-bold">Gerenciar Categorias</h5>
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

        <Modal.Body className="p-4">
          {/* Form Nova Categoria */}
          <div className="p-4 rounded-xl mb-4" style={{ 
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1px solid #ddd6fe'
          }}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#7c3aed' }}>
              <Plus size={18} />
              Nova Categoria
            </h6>
            
            <Form onSubmit={handleAdd}>
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      <Tag size={14} className="me-1" />
                      Nome da categoria
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ex: Driver"
                      value={novaCategoria.nome}
                      onChange={(e) => setNovaCategoria({...novaCategoria, nome: e.target.value})}
                      className="form-control-premium"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Abreviação (máx. 3 caracteres)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ex: DR"
                      maxLength={3}
                      value={novaCategoria.abreviacao}
                      onChange={(e) => setNovaCategoria({...novaCategoria, abreviacao: e.target.value.toUpperCase()})}
                      className="form-control-premium text-center fw-bold"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Button 
                    type="submit" 
                    className="w-100 btn-premium btn-gradient-primary d-flex align-items-center justify-content-center gap-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none'
                    }}
                  >
                    <Plus size={18} />
                    Adicionar
                  </Button>
                </Col>
              </Row>
              
              {erro && (
                <div className="d-flex align-items-center gap-2 mt-3 text-danger small">
                  <AlertCircle size={16} />
                  {erro}
                </div>
              )}
            </Form>
          </div>

          {/* Lista de Categorias */}
          <h6 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
            <CheckCircle size={18} />
            Categorias Existentes
            <Badge bg="primary" className="ms-2">{categorias.length}</Badge>
          </h6>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {categorias.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <Tag size={48} className="mb-3 opacity-25" />
                <p className="mb-0">Nenhuma categoria cadastrada</p>
                <small>Adicione sua primeira categoria acima</small>
              </div>
            ) : (
              <ListGroup className="gap-2">
                {categorias.map((cat, index) => (
                  <ListGroup.Item 
                    key={cat.id}
                    className="d-flex justify-content-between align-items-center p-3 border-0 rounded-xl"
                    style={{ 
                      background: index % 2 === 0 ? '#f9fafb' : 'white',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-lg fw-bold text-white"
                        style={{ 
                          width: '44px', 
                          height: '44px', 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          fontSize: '0.875rem'
                        }}
                      >
                        {cat.abreviacao}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{cat.nome}</h6>
                        <small className="text-secondary">Código: {cat.abreviacao}###</small>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(cat.id, cat.nome)}
                      className="d-flex align-items-center gap-1 rounded-lg"
                    >
                      <Trash2 size={16} />
                      <span className="d-none d-md-inline">Excluir</span>
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button 
            variant="light" 
            onClick={onClose}
            className="btn-premium"
            style={{ border: '1px solid #e5e7eb' }}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}