export interface Categoria {
  id: string;
  nome: string;
  abreviacao: string;
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
  cliente: string;      // removido o ?, sempre string (vazia ou preenchida)
  observacao: string;   // removido o ?, sempre string (vazia ou preenchida)
}