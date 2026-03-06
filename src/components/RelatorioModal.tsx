import React, { useRef } from 'react';
import { Item, Categoria } from '../types';
import { Modal, Button, Table, Badge, Row, Col } from 'react-bootstrap';

interface RelatorioModalProps {
  items: Item[];
  categorias: Categoria[];
  onClose: () => void;
}

export default function RelatorioModal({ items, categorias, onClose }: RelatorioModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const itensPorCategoria = categorias.map(cat => ({
    categoria: cat,
    itens: items.filter(item => item.categoriaId === cat.id)
  })).filter(group => group.itens.length > 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Estoque</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="container mt-4">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const totalItens = items.reduce((sum, item) => sum + item.quantidade, 0);
  const valorTotalCusto = items.reduce((sum, item) => sum + (item.precoCusto * item.quantidade), 0);
  const valorTotalVenda = items.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
  const lucroTotal = valorTotalVenda - valorTotalCusto;

  const arredondar = (valor: number): string => Math.round(valor).toString();

  return (
    <Modal show onHide={onClose} fullscreen>
      <Modal.Header closeButton className="bg-warning">
        <Modal.Title>📊 Relatório de Estoque</Modal.Title>
        <Button variant="primary" onClick={handlePrint} className="ms-auto me-2">
          🖨️ Imprimir
        </Button>
      </Modal.Header>
      
      <Modal.Body>
        <div ref={printRef}>
          {/* Cabeçalho */}
          <div className="text-center mb-4 pb-3 border-bottom">
            <h2>Relatório de Estoque</h2>
            <p className="text-muted">Gerado em: {dataAtual}</p>
            
            <Row className="g-3 mt-3">
              <Col md={3}>
                <div className="p-3 bg-primary bg-opacity-10 rounded">
                  <p className="text-muted small mb-1">Tipos de Itens</p>
                  <p className="h3 text-primary mb-0">{items.length}</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 bg-info bg-opacity-10 rounded">
                  <p className="text-muted small mb-1">Total Unidades</p>
                  <p className="h3 text-info mb-0">{totalItens}</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 bg-danger bg-opacity-10 rounded">
                  <p className="text-muted small mb-1">Custo Total</p>
                  <p className="h3 text-danger mb-0">{arredondar(valorTotalCusto)}</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 bg-success bg-opacity-10 rounded">
                  <p className="text-muted small mb-1">Venda Total</p>
                  <p className="h3 text-success mb-0">{arredondar(valorTotalVenda)}</p>
                </div>
              </Col>
            </Row>
            
            <p className="mt-3 h5">
              Lucro Estimado: 
              <span className={`ms-2 ${lucroTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                {arredondar(lucroTotal)}
              </span>
            </p>
          </div>

          {/* Tabelas por Categoria */}
          {itensPorCategoria.length === 0 ? (
            <p className="text-center text-muted py-5">Nenhum item cadastrado</p>
          ) : (
            itensPorCategoria.map(({ categoria, itens }) => {
              const qtdCat = itens.reduce((sum, item) => sum + item.quantidade, 0);
              const custoCat = itens.reduce((sum, item) => sum + (item.precoCusto * item.quantidade), 0);
              const vendaCat = itens.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
              
              return (
                <div key={categoria.id} className="mb-4">
                  <div className="bg-primary text-white p-2 rounded-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge bg="light" text="primary" className="me-2">{categoria.abreviacao}</Badge>
                        <strong>{categoria.nome}</strong>
                      </div>
                      <small>{itens.length} item(s) • {qtdCat} unidade(s)</small>
                    </div>
                  </div>
                  
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Marca</th>
                        <th className="text-center">Qtd</th>
                        <th>Custo Total</th>
                        <th>Venda Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => (
                        <tr key={item.id}>
                          <td className="font-monospace">{item.codigo}</td>
                          <td>{item.nome} {item.usado && <Badge bg="warning" text="dark" className="ms-1">USADO</Badge>}</td>
                          <td>{item.marca}</td>
                          <td className="text-center fw-bold">{item.quantidade}</td>
                          <td>{arredondar(item.precoCusto * item.quantidade)}</td>
                          <td>{arredondar(item.precoVenda * item.quantidade)}</td>
                        </tr>
                      ))}
                      <tr className="table-info fw-bold">
                        <td colSpan={3} className="text-end">Subtotal {categoria.nome}:</td>
                        <td className="text-center">{qtdCat}</td>
                        <td>{arredondar(custoCat)}</td>
                        <td>{arredondar(vendaCat)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              );
            })
          )}

          {/* Total Geral */}
          {items.length > 0 && (
            <div className="mt-4 pt-3 border-top border-dark border-2">
              <Table bordered>
                <tbody>
                  <tr className="table-secondary fw-bold">
                    <td colSpan={3} className="text-end">TOTAL GERAL:</td>
                    <td className="text-center text-primary">{totalItens}</td>
                    <td className="text-danger">{arredondar(valorTotalCusto)}</td>
                    <td className="text-success">{arredondar(valorTotalVenda)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}