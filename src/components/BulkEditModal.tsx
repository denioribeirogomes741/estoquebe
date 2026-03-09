import React, { useMemo, useState } from 'react';
import { Modal, Button, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { Trash2, ArrowRightLeft, SlidersHorizontal, X } from 'lucide-react';
import { Categoria, Item } from '../types';

export interface BulkAdvancedChanges {
  nivelQualidade?: 1 | 2 | 3 | 4 | 5;
  usado?: boolean;
  precoMin?: number;
  precoMax?: number;
}

interface BulkEditModalProps {
  items: Item[];
  categorias: Categoria[];
  onClose: () => void;
  onDelete: (itemIds: string[]) => Promise<void>;
  onMoveCategoria: (itemIds: string[], categoriaId: string) => Promise<void>;
  onAplicarFiltros: (itemIds: string[], changes: BulkAdvancedChanges) => Promise<void>;
}

export default function BulkEditModal({
  items,
  categorias,
  onClose,
  onDelete,
  onMoveCategoria,
  onAplicarFiltros
}: BulkEditModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoriaDestino, setCategoriaDestino] = useState('');
  const [novaQualidade, setNovaQualidade] = useState('');
  const [novaCondicao, setNovaCondicao] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [loadingAction, setLoadingAction] = useState<'delete' | 'move' | 'edit' | null>(null);

  const itensFiltrados = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = categoriaFiltro === '' || item.categoriaId === categoriaFiltro;
      return matchSearch && matchCategoria;
    });
  }, [items, searchTerm, categoriaFiltro]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const todosVisiveisSelecionados =
    itensFiltrados.length > 0 && itensFiltrados.every((item) => selectedSet.has(item.id));

  const toggleSelecionarItem = (itemId: string) => {
    setSelectedIds((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  };

  const toggleSelecionarTodosVisiveis = () => {
    if (todosVisiveisSelecionados) {
      const visiveis = new Set(itensFiltrados.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !visiveis.has(id)));
      return;
    }

    const merged = new Set(selectedIds);
    itensFiltrados.forEach((item) => merged.add(item.id));
    setSelectedIds(Array.from(merged));
  };

  const handleExcluir = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Excluir ${selectedIds.length} item(ns) selecionado(s)?`)) return;

    try {
      setLoadingAction('delete');
      await onDelete(selectedIds);
      setSelectedIds([]);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoverCategoria = async () => {
    if (selectedIds.length === 0 || !categoriaDestino) return;

    try {
      setLoadingAction('move');
      await onMoveCategoria(selectedIds, categoriaDestino);
      setCategoriaDestino('');
      setSelectedIds([]);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAplicarFiltros = async () => {
    if (selectedIds.length === 0) return;

    const changes: BulkAdvancedChanges = {};

    if (novaQualidade) {
      changes.nivelQualidade = parseInt(novaQualidade, 10) as 1 | 2 | 3 | 4 | 5;
    }

    if (novaCondicao === 'novo') changes.usado = false;
    if (novaCondicao === 'usado') changes.usado = true;

    if (precoMin !== '') changes.precoMin = parseFloat(precoMin);
    if (precoMax !== '') changes.precoMax = parseFloat(precoMax);

    if (Object.keys(changes).length === 0) {
      alert('Selecione ao menos um campo para edição em massa.');
      return;
    }

    try {
      setLoadingAction('edit');
      await onAplicarFiltros(selectedIds, changes);
      setNovaQualidade('');
      setNovaCondicao('');
      setPrecoMin('');
      setPrecoMax('');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Modal show onHide={onClose} centered size="xl" contentClassName="border-0">
      <div className="position-relative">
        <div
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <div className="d-flex justify-content-between align-items-center text-white">
            <div>
              <h5 className="mb-0 fw-bold">Editor em Massa</h5>
              <small className="opacity-75">
                Selecione produtos e aplique ações em lote
              </small>
            </div>
            <Button variant="link" onClick={onClose} className="text-white p-0" style={{ textDecoration: 'none' }}>
              <X size={24} />
            </Button>
          </div>
        </div>

        <Modal.Body className="p-4">
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Label className="small fw-semibold text-secondary">Buscar produto</Form.Label>
              <Form.Control
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou código"
                className="form-control-premium"
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-semibold text-secondary">Filtrar categoria</Form.Label>
              <Form.Select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="form-control-premium"
              >
                <option value="">Todas</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="light"
                onClick={toggleSelecionarTodosVisiveis}
                className="w-100 btn-premium"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {todosVisiveisSelecionados ? 'Desmarcar' : 'Selecionar'}
              </Button>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-secondary">
              {selectedIds.length} selecionado(s) de {itensFiltrados.length} visível(is)
            </small>
            <Badge bg="primary">{selectedIds.length}</Badge>
          </div>

          <div className="table-responsive mb-4" style={{ maxHeight: '320px' }}>
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: 48 }}></th>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th className="text-end">Preço</th>
                  <th className="text-center">Qualidade</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={selectedSet.has(item.id)}
                        onChange={() => toggleSelecionarItem(item.id)}
                      />
                    </td>
                    <td className="font-monospace">{item.codigo}</td>
                    <td>{item.nome}</td>
                    <td>{item.categoriaNome}</td>
                    <td className="text-end">R$ {item.precoVenda.toFixed(2)}</td>
                    <td className="text-center">{item.nivelQualidade ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Row className="g-3">
            <Col md={4}>
              <div className="card-premium p-3 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Trash2 size={18} className="text-danger" />
                  <h6 className="mb-0 fw-bold">Excluir</h6>
                </div>
                <p className="small text-secondary mb-3">Remove todos os itens selecionados.</p>
                <Button
                  variant="outline-danger"
                  className="w-100 btn-premium"
                  onClick={handleExcluir}
                  disabled={selectedIds.length === 0 || loadingAction !== null}
                >
                  Excluir Selecionados
                </Button>
              </div>
            </Col>

            <Col md={4}>
              <div className="card-premium p-3 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <ArrowRightLeft size={18} className="text-primary" />
                  <h6 className="mb-0 fw-bold">Mover Categoria</h6>
                </div>
                <Form.Select
                  value={categoriaDestino}
                  onChange={(e) => setCategoriaDestino(e.target.value)}
                  className="form-control-premium mb-3"
                >
                  <option value="">Selecione a categoria destino</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  className="w-100 btn-premium btn-gradient-primary"
                  onClick={handleMoverCategoria}
                  disabled={selectedIds.length === 0 || !categoriaDestino || loadingAction !== null}
                >
                  Mover Selecionados
                </Button>
              </div>
            </Col>

            <Col md={4}>
              <div className="card-premium p-3 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <SlidersHorizontal size={18} className="text-success" />
                  <h6 className="mb-0 fw-bold">Filtros Avançados</h6>
                </div>
                <Form.Select
                  value={novaQualidade}
                  onChange={(e) => setNovaQualidade(e.target.value)}
                  className="form-control-premium mb-2"
                >
                  <option value="">Qualidade (não alterar)</option>
                  <option value="1">1 - Básico</option>
                  <option value="2">2 - Inicial</option>
                  <option value="3">3 - Intermediário</option>
                  <option value="4">4 - Avançado</option>
                  <option value="5">5 - Premium</option>
                </Form.Select>
                <Form.Select
                  value={novaCondicao}
                  onChange={(e) => setNovaCondicao(e.target.value)}
                  className="form-control-premium mb-2"
                >
                  <option value="">Condição (não alterar)</option>
                  <option value="novo">Novo</option>
                  <option value="usado">Usado</option>
                </Form.Select>
                <Row className="g-2 mb-3">
                  <Col>
                    <Form.Control
                      type="number"
                      value={precoMin}
                      onChange={(e) => setPrecoMin(e.target.value)}
                      placeholder="Preço mín."
                      className="form-control-premium"
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      placeholder="Preço máx."
                      className="form-control-premium"
                    />
                  </Col>
                </Row>
                <Button
                  className="w-100 btn-premium btn-gradient-success"
                  onClick={handleAplicarFiltros}
                  disabled={selectedIds.length === 0 || loadingAction !== null}
                >
                  Aplicar Edição
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </div>
    </Modal>
  );
}

