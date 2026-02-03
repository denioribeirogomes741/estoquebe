import React from 'react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-mono">
              {item.codigo}
            </span>
            {item.usado && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                USADO
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
          <p className="text-sm text-gray-500">{item.categoriaNome}</p>
        </div>
        
        {/* QUANTIDADE DESTACADA */}
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-blue-600">{item.quantidade}</span>
          <span className="text-xs text-gray-400">unidade(s)</span>
        </div>
      </div>
    </div>
  );
}