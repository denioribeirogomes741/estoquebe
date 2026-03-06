import React, { useRef, useState, useMemo } from 'react';
import { Venda } from '../types';
import { Modal, Button, Form, Badge, Table, Row, Col } from 'react-bootstrap';
import { 
  X, 
  Printer, 
  Calendar, 
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  FileText
} from 'lucide-react';

interface RelatorioVendasModalProps {
  vendas: Venda[];
  onClose: () => void;
}

type FiltroPeriodo = 'todos' | 'dia' | 'mes' | 'ano';

export default function RelatorioVendasModal({ vendas, onClose }: RelatorioVendasModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [filtro, setFiltro] = useState<FiltroPeriodo>('todos');
  const [dataSelecionada, setDataSelecionada] = useState<string>('');

  const vendasFiltradas = useMemo(() => {
    if (filtro === 'todos') return vendas;
    if (!dataSelecionada) return vendas;

    const dataFiltro = new Date(dataSelecionada);
    
    return vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda);
      
      switch (filtro) {
        case 'dia':
          return dataVenda.toDateString() === dataFiltro.toDateString();
        case 'mes':
          return dataVenda.getMonth() === dataFiltro.getMonth() && 
                 dataVenda.getFullYear() === dataFiltro.getFullYear();
        case 'ano':
          return dataVenda.getFullYear() === dataFiltro.getFullYear();
        default:
          return true;
      }
    });
  }, [vendas, filtro, dataSelecionada]);

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

  const totalVendas = vendasFiltradas.length;
  const totalItens = vendasFiltradas.reduce((sum, v) => sum + v.quantidade, 0);
  const totalReceita = vendasFiltradas.reduce((sum, v) => sum + v.precoTotal, 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Vendas</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print { 
              .no-print { display: none; } 
              body { font-family: 'Inter', sans-serif; }
            }
            .report-header { 
              background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
              color: white;
              padding: 2rem;
              border-radius: 16px 16px 0 0;
            }
            .stat-card { 
              background: #f0fdf4; 
              border-radius: 12px; 
              padding: 1.5rem;
              text-align: center;
            }
            table { border-collapse: separate; border-spacing: 0; }
            th { background: #f9fafb; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
          </style>
        </head>
        <body class="bg-light p-4">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTituloPeriodo = () => {
    switch (filtro) {
      case 'dia':
        return dataSelecionada 
          ? `Vendas do dia ${new Date(dataSelecionada).toLocaleDateString('pt-BR')}`
          : 'Todas as vendas';
      case 'mes':
        return dataSelecionada
          ? `Vendas de ${new Date(dataSelecionada).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
          : 'Todas as vendas';
      case 'ano':
        return dataSelecionada
          ? `Vendas de ${new Date(dataSelecionada).getFullYear()}`
          : 'Todas as vendas';
      default:
        return 'Todas as vendas';
    }
  };

  return (
    <Modal 
      show 
      onHide={onClose} 
      fullscreen
      contentClassName="bg-light"
    >
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '1.5rem 2rem',
      }}>
        <div className="d-flex justify-content-between align-items-center text-white">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-xl" style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(255,255,255,0.2)'
            }}>
              <FileText size={24} color="white" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">Relatório de Vendas</h4>
              <p className="mb-0 small opacity-75">{getTituloPeriodo()}</p>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Button 
              onClick={handlePrint}
              className="btn-premium d-flex align-items-center gap-2"
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              <Printer size={18} />
              Imprimir
            </Button>
            <Button 
              variant="link" 
              onClick={onClose}
              className="text-white p-2"
              style={{ textDecoration: 'none' }}
            >
              <X size={24} />
            </Button>
          </div>
        </div>
      </div>

      <Modal.Body className="p-4">
        {/* Filtros */}
        <div className="card-premium p-4 mb-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                <Filter size={14} />
                Filtrar por
              </Form.Label>
              <Form.Select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as FiltroPeriodo);
                  setDataSelecionada('');
                }}
                className="form-control-premium"
              >
                <option value="todos">Todo o histórico</option>
                <option value="dia">Dia específico</option>
                <option value="mes">Mês específico</option>
                <option value="ano">Ano específico</option>
              </Form.Select>
            </Col>
            
            {filtro !== 'todos' && (
              <Col md={3}>
                <Form.Label className="fw-semibold small text-secondary d-flex align-items-center gap-2">
                  <Calendar size={14} />
                  {filtro === 'dia' ? 'Data' : filtro === 'mes' ? 'Mês/Ano' : 'Ano'}
                </Form.Label>
                <Form.Control
                  type={filtro === 'dia' ? 'date' : filtro === 'mes' ? 'month' : 'number'}
                  min={filtro === 'ano' ? '2000' : undefined}
                  max={filtro === 'ano' ? '2100' : undefined}
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="form-control-premium"
                />
              </Col>
            )}

            {dataSelecionada && (
              <Col md="auto">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setDataSelecionada('')}
                  className="btn-premium"
                >
                  Limpar
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Conteúdo para impressão */}
        <div ref={printRef}>
          {/* Stats */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <FileText size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div className="stat-value text-primary">{totalVendas}</div>
                <div className="stat-label">vendas realizadas</div>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <Package size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>{totalItens}</div>
                <div className="stat-label">itens vendidos</div>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <DollarSign size={20} style={{ color: '#22c55e' }} />
                </div>
                <div className="stat-value text-success">R$ {totalReceita.toFixed(2)}</div>
                <div className="stat-label">receita total</div>
              </div>
            </Col>
          </Row>

          {/* Tabelas */}
          {vendasPorData.length === 0 ? (
            <div className="empty-state card-premium">
              <div className="empty-state-icon">📊</div>
              <h4 className="h5 text-secondary mb-2">Nenhuma venda encontrada</h4>
              <p className="text-secondary mb-0">Ajuste o período do relatório</p>
            </div>
          ) : (
            vendasPorData.map(([data, vendasDoDia]) => {
              const totalDia = vendasDoDia.reduce((sum, v) => sum + v.precoTotal, 0);
              const itensDia = vendasDoDia.reduce((sum, v) => sum + v.quantidade, 0);
              
              return (
                <div key={data} className="card-premium mb-4 overflow-hidden">
                  <div className="p-3" style={{ 
                    background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)',
                    borderBottom: '1px solid #bfdbfe'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        <strong className="text-primary">{data}</strong>
                      </div>
                      <Badge bg="primary" className="px-3 py-2">
                        {vendasDoDia.length} venda(s) • {itensDia} item(ns) • R$ {totalDia.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Table className="mb-0">
                    <thead style={{ background: '#f9fafb' }}>
                      <tr>
                        <th className="fw-semibold text-secondary small text-uppercase">Item</th>
                        <th className="fw-semibold text-secondary small text-uppercase text-center">Qtd</th>
                        <th className="fw-semibold text-secondary small text-uppercase text-end">Unitário</th>
                        <th className="fw-semibold text-secondary small text-uppercase text-end">Total</th>
                        <th className="fw-semibold text-secondary small text-uppercase">Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasDoDia.map((venda) => (
                        <tr key={venda.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="light" text="dark" className="font-monospace">
                                {venda.itemCodigo}
                              </Badge>
                              <div>
                                <p className="mb-0 fw-semibold">{venda.itemNome}</p>
                                <small className="text-secondary">{venda.itemCategoria}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center fw-bold">{venda.quantidade}</td>
                          <td className="text-end">R$ {venda.precoUnitario.toFixed(2)}</td>
                          <td className="text-end fw-bold text-success">R$ {venda.precoTotal.toFixed(2)}</td>
                          <td className="text-secondary">{venda.cliente || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#f0fdf4' }}>
                        <td colSpan={2} className="text-end fw-bold">Subtotal do dia:</td>
                        <td></td>
                        <td className="text-end fw-bold text-success">R$ {totalDia.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              );
            })
          )}

          {vendasFiltradas.length > 0 && (
            <div className="card-premium p-4" style={{ 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #86efac'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-success">TOTAL GERAL</h5>
                <div className="text-end">
                  <p className="mb-0 small text-secondary">{totalItens} itens vendidos</p>
                  <h3 className="mb-0 fw-bold text-success">R$ {totalReceita.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}