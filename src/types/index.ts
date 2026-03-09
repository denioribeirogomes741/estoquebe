export interface Categoria {
  id: string;
  nome: string;
  abreviacao: string;
  ordem?: number;
}

export interface Item {
  id: string;
  codigo: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaAbreviacao: string;
  nome: string;
  marca: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  usado: boolean;
  observacoes?: string;
  fotoUrl?: string;
  createdAt?: Date;
  // NOVOS CAMPOS - opcionais por enquanto para compatibilidade:
  nivelQualidade?: 1 | 2 | 3 | 4 | 5; // 1 = Básico, 5 = Premium
  tagsEspecificas?: string[]; // Ex: ["i7", "16GB RAM", "SSD 512GB"]
}

// NOVO - Interface de Venda
export interface Venda {
  id: string;
  itemId: string;
  itemCodigo: string;
  itemNome: string;
  itemCategoria: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  dataVenda: Date;
  cliente: string;
  observacao: string;
}
