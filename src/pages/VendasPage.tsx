import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Item, Venda, Categoria } from '../types';
import VendaModal from '../components/VendaModal';
import RelatorioVendasModal from '../components/RelatorioVendasModal';

interface VendasPageProps {
  onVoltar: () => void;
}

type FiltroPeriodo = 'todos' | 'dia' | 'mes' | 'ano';

export default function VendasPage({ onVoltar }: VendasPageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(''); // NOVO
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<'vender' | 'historico'>('vender');
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  
  // Filtros de período
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos');
  const [dataFiltro, setDataFiltro] = useState<string>('');

  // Buscar itens
  useEffect(() => {
    const q = query(collection(db, 'estoque'), orderBy('codigo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, []);

  // Buscar categorias - NOVO
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

  // Buscar vendas
  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('dataVenda', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vendasData: Venda[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vendasData.push({ 
          id: doc.id, 
          ...data,
          dataVenda: data.dataVenda?.toDate() || new Date()
        } as Venda);
      });
      setVendas(vendasData);
    });

    return () => unsubscribe();
  }, []);

  // Realizar venda
  const handleVender = async (vendaData: Omit<Venda, 'id' | 'dataVenda'>) => {
    try {
      // 1. Registrar a venda
      await addDoc(collection(db, 'vendas'), {
        ...vendaData,
        dataVenda: new Date()
      });

      // 2. Atualizar estoque
      const itemRef = doc(db, 'estoque', vendaData.itemId);
      const itemAtual = items.find(i => i.id === vendaData.itemId);
      
      if (itemAtual) {
        const novaQuantidade = itemAtual.quantidade - vendaData.quantidade;
        await updateDoc(itemRef, {
          quantidade: novaQuantidade
        });
      }

      setItemSelecionado(null);
      alert('✅ Venda registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('❌ Erro ao registrar venda');
    }
  };

  // Filtrar vendas do histórico
  const vendasFiltradas = useMemo(() => {
    let filtradas = vendas;

    // Filtro por período
    if (filtroPeriodo !== 'todos' && dataFiltro) {
      const dataSelecionada = new Date(dataFiltro);
      
      filtradas = filtradas.filter(venda => {
        const dataVenda = new Date(venda.dataVenda);
        
        switch (filtroPeriodo) {
          case 'dia':
            return dataVenda.toDateString() === dataSelecionada.toDateString();
          case 'mes':
            return dataVenda.getMonth() === dataSelecionada.getMonth() && 
                   dataVenda.getFullYear() === dataSelecionada.getFullYear();
          case 'ano':
            return dataVenda.getFullYear() === dataSelecionada.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtradas;
  }, [vendas, filtroPeriodo, dataFiltro]);

  // Itens disponíveis para venda com filtros - ATUALIZADO
  const itensDisponiveis = items.filter(item => item.quantidade > 0);
  
  const itensFiltrados = useMemo(() => {
    return itensDisponiveis.filter(item => {
      const matchSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
      
      return matchSearch && matchCategoria;
    });
  }, [itensDisponiveis, searchTerm, categoriaFiltro]);

  // Agrupar itens por categoria - NOVO
  const itensPorCategoria = useMemo(() => {
    return categorias
      .map(cat => ({
        categoria: cat,
        itens: itensFiltrados.filter(item => item.categoriaId === cat.id)
      }))
      .filter(group => group.itens.length > 0);
  }, [categorias, itensFiltrados]);

  // Totais das vendas filtradas
  const totalVendas = vendasFiltradas.length;
  const totalItensVendidos = vendasFiltradas.reduce((sum, v) => sum + v.quantidade, 0);
  const totalReceita = vendasFiltradas.reduce((sum, v) => sum + v.precoTotal, 0);

  // Agrupar vendas por data para exibição
  const vendasPorData = useMemo(() => {
    const grupos: { [key: string]: Venda[] } = {};
    
    vendasFiltradas.forEach(venda => {
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(venda);
    });
    
    return Object.entries(grupos).sort((a, b) => 
      new Date(b[1][0].dataVenda).getTime() - new Date(a[1][0].dataVenda).getTime()
    );
  }, [vendasFiltradas]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛒 Vendas</h1>
          <button 
            onClick={onVoltar}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition"
          >
            ← Voltar ao Estoque
          </button>
        </div>
      </header>

      {/* Abas */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('vender')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'vender' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🛒 Nova Venda
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'historico' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📋 Histórico ({vendas.length})
          </button>
        </div>

        {activeTab === 'vender' ? (
          /* ABA DE VENDER - ATUALIZADA COM FILTRO E SEPARAÇÃO POR CATEGORIA */
          <div>
            {/* Barra de busca e filtro por categoria */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar item por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
              </div>

              {/* Filtro por categoria - NOVO */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Filtrar por categoria:</span>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome} ({cat.abreviacao})
                    </option>
                  ))}
                </select>
                {categoriaFiltro && (
                  <button
                    onClick={() => setCategoriaFiltro('')}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {itensFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">Nenhum item disponível para venda</p>
                <p>Ajuste o filtro ou adicione itens ao estoque</p>
              </div>
            ) : (
              /* SEPARAÇÃO POR CATEGORIA - NOVO */
              <div className="space-y-8">
                {itensPorCategoria.map(({ categoria, itens }) => (
                  <div key={categoria.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Header da Categoria */}
                    <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-white text-green-600 px-3 py-1 rounded-full font-bold text-sm">
                          {categoria.abreviacao}
                        </span>
                        <h2 className="text-xl font-bold">{categoria.nome}</h2>
                      </div>
                      <span className="text-green-100">
                        {itens.length} item(s) • {itens.reduce((sum, item) => sum + item.quantidade, 0)} unidade(s)
                      </span>
                    </div>
                    
                    {/* Grid de Itens da Categoria */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {itens.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setItemSelecionado(item)}
                          className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition cursor-pointer border-l-4 border-green-500"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-mono mb-2">
                                {item.codigo}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
                              <p className="text-sm text-gray-500">{item.marca}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">R$ {item.precoVenda.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">{item.quantidade} disp.</p>
                            </div>
                          </div>
                          {item.usado && (
                            <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              USADO
                            </span>
                          )}
                          <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition">
                            Vender
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ABA DE HISTÓRICO */
          <div>
            {/* Filtros e Ações */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-wrap gap-4 items-end justify-between">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por período</label>
                    <select
                      value={filtroPeriodo}
                      onChange={(e) => {
                        setFiltroPeriodo(e.target.value as FiltroPeriodo);
                        setDataFiltro('');
                      }}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos</option>
                      <option value="dia">Dia</option>
                      <option value="mes">Mês</option>
                      <option value="ano">Ano</option>
                    </select>
                  </div>
                  
                  {filtroPeriodo !== 'todos' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {filtroPeriodo === 'dia' ? 'Data' : filtroPeriodo === 'mes' ? 'Mês/Ano' : 'Ano'}
                      </label>
                      <input
                        type={filtroPeriodo === 'dia' ? 'date' : filtroPeriodo === 'mes' ? 'month' : 'number'}
                        min={filtroPeriodo === 'ano' ? '2000' : undefined}
                        max={filtroPeriodo === 'ano' ? '2100' : undefined}
                        value={dataFiltro}
                        onChange={(e) => setDataFiltro(e.target.value)}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {dataFiltro && (
                    <button
                      onClick={() => setDataFiltro('')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsRelatorioOpen(true)}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
                >
                  📊 Ver Relatório Completo
                </button>
              </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-600">Vendas no período</p>
                <p className="text-2xl font-bold text-blue-600">{totalVendas}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-600">Itens vendidos</p>
                <p className="text-2xl font-bold text-purple-600">{totalItensVendidos}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-600">Receita total</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalReceita.toFixed(2)}</p>
              </div>
            </div>

            {/* Lista de Vendas Agrupadas por Data */}
            <div className="space-y-6">
              {vendasPorData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                  <p>Nenhuma venda encontrada neste período</p>
                </div>
              ) : (
                vendasPorData.map(([data, vendasDoDia]) => {
                  const totalDia = vendasDoDia.reduce((sum, v) => sum + v.precoTotal, 0);
                  const itensDia = vendasDoDia.reduce((sum, v) => sum + v.quantidade, 0);
                  
                  return (
                    <div key={data} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-blue-100 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800">📅 {data}</h3>
                        <span className="text-sm text-blue-600">
                          {vendasDoDia.length} venda(s) • {itensDia} item(ns) • R$ {totalDia.toFixed(2)}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Código</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Item</th>
                              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">Qtd</th>
                              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Unitário</th>
                              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Total</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Cliente</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {vendasDoDia.map((venda) => (
                              <tr key={venda.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-sm">{venda.itemCodigo}</td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-gray-800">{venda.itemNome}</p>
                                  <p className="text-xs text-gray-500">{venda.itemCategoria}</p>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold">{venda.quantidade}</td>
                                <td className="px-4 py-3 text-right">R$ {venda.precoUnitario.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-green-600">R$ {venda.precoTotal.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{venda.cliente || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {itemSelecionado && (
        <VendaModal
          item={itemSelecionado}
          onClose={() => setItemSelecionado(null)}
          onVender={handleVender}
        />
      )}

      {isRelatorioOpen && (
        <RelatorioVendasModal
          vendas={vendas}
          onClose={() => setIsRelatorioOpen(false)}
        />
      )}
    </div>
  );
}