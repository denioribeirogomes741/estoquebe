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
  quantidade: number; // NOVO CAMPO
  usado: boolean;
  createdAt?: Date;
}