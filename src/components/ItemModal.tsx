import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
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

  const formatarValor = (valor: number): string => {
    return Math.round(valor).toString();
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light">
        <div>
          <Badge bg="primary" className="me-2 font-monospace">{item.codigo}</Badge>
          <Modal.Title className="d-inline h5">{item.nome}</Modal.Title>
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {item.fotoUrl && (
          <div className="mb-3">
            <img 
              src={item.fotoUrl} 
              alt={item.nome}
              className="img-fluid rounded w-100"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <Row className="g-2">
          <Col xs={6} className="text-muted small">Categoria:</Col>
          <Col xs={6} className="text-end fw-semibold">{item.categoriaNome}</Col>
          
          <Col xs={6} className="text-muted small">Marca:</Col>
          <Col xs={6} className="text-end fw-semibold">{item.marca}</Col>
          
          <Col xs={12}><hr className="my-1" /></Col>
          
          <Col xs={6} className="text-muted small">Quantidade:</Col>
          <Col xs={6} className="text-end fw-bold text-primary h5">{item.quantidade}</Col>
          
          <Col xs={6} className="text-muted small">Custo unit.:</Col>
          <Col xs={6} className="text-end text-danger">{formatarValor(item.precoCusto)}</Col>
          
          <Col xs={6} className="text-muted small">Venda unit.:</Col>
          <Col xs={6} className="text-end text-success">{formatarValor(item.precoVenda)}</Col>
          
          <Col xs={12}><hr className="my-1" /></Col>
          
          <Col xs={6} className="text-muted small">Custo total:</Col>
          <Col xs={6} className="text-end fw-bold text-danger">{formatarValor(valorTotalCusto)}</Col>
          
          <Col xs={6} className="text-muted small">Venda total:</Col>
          <Col xs={6} className="text-end fw-bold text-success">{formatarValor(valorTotalVenda)}</Col>
          
          <Col xs={6} className="text-muted small">Lucro:</Col>
          <Col xs={6} className={`text-end fw-bold ${lucroTotal >= 0 ? 'text-info' : 'text-danger'}`}>
            {formatarValor(lucroTotal)}
          </Col>
          
          <Col xs={6} className="text-muted small">Condição:</Col>
          <Col xs={6} className="text-end">
            <Badge bg={item.usado ? 'warning' : 'success'} text={item.usado ? 'dark' : undefined}>
              {item.usado ? 'Usado' : 'Novo'}
            </Badge>
          </Col>
        </Row>

        {item.observacoes && (
          <div className="mt-3 p-2 bg-warning bg-opacity-10 border border-warning rounded">
            <small className="text-muted d-block mb-1">Observações:</small>
            <small>{item.observacoes}</small>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onEdit}>
          ✏️ Editar
        </Button>
        <Button variant="danger" onClick={() => {
          if (confirm('Tem certeza que deseja excluir este item?')) onDelete();
        }}>
          🗑️ Excluir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}