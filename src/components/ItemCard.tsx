import React from 'react';
import { Badge } from 'react-bootstrap';
import { Package, AlertCircle } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const isLowStock = item.quantidade <= 5;
  
  return (
    <div 
      onClick={onClick}
      className="card-premium h-100 cursor-pointer hover-lift position-relative overflow-hidden"
      style={{ minHeight: '180px' }}
    >
      {/* Status Indicator */}
      <div 
        className="position-absolute top-0 start-0 w-100" 
        style={{ 
          height: '4px',
          background: isLowStock 
            ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
        }} 
      />

      <div className="p-4 h-100 d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <Badge 
              bg="light" 
              text="dark" 
              className="font-monospace fw-bold"
              style={{ 
                fontSize: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb'
              }}
            >
              {item.codigo}
            </Badge>
            {item.usado && (
              <Badge 
                bg="warning" 
                text="dark"
                style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Usado
              </Badge>
            )}
          </div>
          
          {isLowStock && (
            <div className="d-flex align-items-center gap-1 text-danger" title="Estoque baixo">
              <AlertCircle size={16} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow-1">
          <h4 className="h6 fw-bold text-gray-900 mb-1" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}>
            {item.nome}
          </h4>
          <p className="small text-secondary mb-0">{item.marca}</p>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-end mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
          <div>
            <p className="small text-secondary mb-1">Quantidade</p>
            <p className={`h4 mb-0 fw-bold ${isLowStock ? 'text-danger' : 'text-primary'}`}>
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
      </div>
    </div>
  );
}