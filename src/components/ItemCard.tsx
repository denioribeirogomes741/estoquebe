import React from 'react';
import { Badge } from 'react-bootstrap';
import { Package, AlertCircle, Star } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
  mostrarQualidade?: boolean; // NOVA PROP OPCIONAL
}

export default function ItemCard({ item, onClick, mostrarQualidade = false }: ItemCardProps) {
  const isLowStock = item.quantidade <= 5;
  
  // Função para renderizar estrelas de qualidade
  const renderEstrelas = (nivel?: number) => {
    if (!nivel) return null;
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={10} 
        fill={i < nivel ? "#fbbf24" : "transparent"}
        color={i < nivel ? "#f59e0b" : "#d1d5db"}
        className="me-1"
      />
    ));
  };

  const getLabelQualidade = (nivel?: number) => {
    if (!nivel) return 'Não classificado';
    const labels = ['Básico', 'Inicial', 'Intermediário', 'Avançado', 'Premium'];
    return labels[nivel - 1] || 'Intermediário';
  };
  
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
          
          <div className="d-flex flex-column align-items-end gap-1">
            {isLowStock && (
              <div className="d-flex align-items-center gap-1 text-danger" title="Estoque baixo">
                <AlertCircle size={16} />
              </div>
            )}
            
            {/* MOSTRAR QUALIDADE SE A PROP FOR TRUE */}
            {mostrarQualidade && item.nivelQualidade && (
              <div 
                className="d-flex align-items-center" 
                title={getLabelQualidade(item.nivelQualidade)}
              >
                {renderEstrelas(item.nivelQualidade)}
              </div>
            )}
          </div>
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
          
          {/* Tags específicas (se houver e mostrarQualidade=true) */}
          {mostrarQualidade && item.tagsEspecificas && item.tagsEspecificas.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-2">
              {item.tagsEspecificas.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  bg="info" 
                  style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
                >
                  {tag}
                </Badge>
              ))}
              {item.tagsEspecificas.length > 2 && (
                <Badge bg="secondary" style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}>
                  +{item.tagsEspecificas.length - 2}
                </Badge>
              )}
            </div>
          )}
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