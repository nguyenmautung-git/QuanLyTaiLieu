import React, { useState, useContext, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { DocumentContext } from '../context/DocumentContext';
import { useToast, useConfirm } from '../context/UIContext';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Check, Clock, Circle, ChevronDown, ChevronUp, AlertCircle, Save, Paperclip, FileText, Download, Loader, GripVertical, Maximize2, Minimize2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { ROLES, STEP_STATUS, WORKFLOW_DEFAULT_STEPS, LEGAL_PHASES, LEGAL_TEMPLATES } from '../constants';
import StepBadge, { STATUS_CONFIG } from './shared/StepBadge';
import { withTimeout, getUploadErrorMessage } from '../utils/uploadHelpers';



const getDeadlineStatus = (targetDate, status) => {
  if (status === 'done' || !targetDate) return null;
  const target = new Date(targetDate);
  target.setHours(23, 59, 59, 999);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { type: 'overdue', days: Math.abs(diffDays), text: `Trễ hạn ${Math.abs(diffDays)} ngày` };
  } else if (diffDays <= 7) {
    return { type: 'upcoming', days: diffDays, text: `Sắp trễ (${diffDays} ngày)` };
  }
  return null;
};

/* ─── Workflow Step Row ─── */
const StepRow = ({
  step, index, total, onEdit, onDelete, partners,
  canEditStep, canReorder,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) => {
  const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isLast = index === total - 1;
  const attachments = step.attachments || [];

  return (
    <div
      draggable={canReorder}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex', gap: '0.5rem', position: 'relative',
        opacity: isDragging ? 0.4 : 1,
        borderTop: isDragOver ? '2px solid var(--color-primary)' : '2px solid transparent',
        borderRadius: isDragOver ? '4px 4px 0 0' : undefined,
        transition: 'opacity 0.15s, border-color 0.1s',
        cursor: canReorder ? 'default' : undefined,
      }}
    >
      {/* Drag handle — chỉ Admin/Reorder mới thấy */}
      {canReorder && (
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', paddingTop: '6px',
            color: 'var(--color-text-muted)', flexShrink: 0,
            cursor: 'grab', opacity: 0.5,
          }}
          title="Kéo để sắp xếp lại"
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          <GripVertical size={15} />
        </div>
      )}

      {/* Connector line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '28px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
          <Icon size={13} color={cfg.color} />
        </div>
        {!isLast && <div style={{ width: '2px', flex: 1, backgroundColor: step.status === 'done' ? 'var(--color-success)' : 'var(--color-border)', minHeight: '20px', marginTop: '2px' }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
            {step.name}
          </span>
          {(() => {
            const dl = getDeadlineStatus(step.targetDate, step.status);
            if (!dl) return null;
            const isOverdue = dl.type === 'overdue';
            return (
              <span style={{
                fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
                backgroundColor: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: isOverdue ? '#f87171' : '#fbbf24',
                border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                display: 'inline-flex', alignItems: 'center', gap: '3px'
              }}>
                <Clock size={10} />
                {dl.text}
              </span>
            );
          })()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {step.targetDate && <div>🎯 Mục tiêu: {step.targetDate}</div>}
            {step.effectiveDate && <div>📅 Hiệu lực: {step.effectiveDate}</div>}
            {step.implementingUnit && <div>🏢 ĐVTH: {partners?.find(p => p.id === step.implementingUnit)?.name || step.implementingUnit}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <StepBadge status={step.status} />
            {canEditStep && (
              <>
                <button className="btn-icon" onClick={() => onEdit(step)} style={{ color: 'var(--color-primary)', padding: '3px' }} title="Sửa"><Edit2 size={13} /></button>
                <button className="btn-icon" onClick={() => onDelete(step.id)} style={{ color: 'var(--color-danger)', padding: '3px' }} title="Xóa"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        </div>
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {attachments.map((att, i) => (
              <a key={i} href={att.url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', fontSize: '0.7rem', textDecoration: 'none', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Paperclip size={10} /> {att.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Project Workflow Detail Component (Reused in Card & Fullscreen) ─── */
const ProjectWorkflowDetail = ({
  project, steps, partners,
  canAddStep, canEditStep, canReorder,
  onAddStep, onEditStep, onDeleteStep, onMoveStep,
  customTemplates = [], onDeleteTemplate,
  isFullscreen = false
}) => {
  const { updateLegalStep, addLegalStep } = useContext(DocumentContext);
  const toast = useToast();
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'kanban'
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState({});

  const togglePhase = (phaseKey) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };

  const sorted = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleDragStart = (i) => (e) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (i) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (i !== dropIndex) setDropIndex(i);
  };

  const handleDrop = (i) => (e) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== i) {
      onMoveStep(sorted, dragIndex, i);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  // Kanban Drag & Drop
  const handleKanbanDragStart = (e, stepId) => {
    e.dataTransfer.setData('text/plain', stepId);
  };

  const handleKanbanDrop = async (e, targetStatus) => {
    e.preventDefault();
    const stepId = e.dataTransfer.getData('text/plain');
    if (!stepId) return;
    const stepToUpdate = steps.find(s => s.id === stepId || String(s.id) === String(stepId));
    if (stepToUpdate && stepToUpdate.status !== targetStatus) {
      try {
        await updateLegalStep(stepToUpdate.id, { ...stepToUpdate, status: targetStatus });
        toast.success(`Đã cập nhật trạng thái bước sang ${targetStatus === 'done' ? 'Hoàn thành' : targetStatus === 'inprogress' ? 'Đang thực hiện' : 'Chưa thực hiện'}`);
      } catch (err) {
        toast.error('Lỗi khi đổi trạng thái: ' + err.message);
      }
    }
  };

  // Danh sách các quy trình mẫu chuẩn và quy trình mẫu tùy chỉnh
  const allTemplates = [
    { id: 'civil', name: 'Quy trình chuẩn Xây dựng dân dụng', steps: LEGAL_TEMPLATES.civil.steps, isDefault: true },
    { id: 'infrastructure', name: 'Quy trình chuẩn Công trình Hạ tầng kỹ thuật', steps: LEGAL_TEMPLATES.infrastructure.steps, isDefault: true },
    ...(customTemplates || []).map(t => ({ id: t.id, name: t.name, steps: t.steps, isDefault: false }))
   ];

  // Áp dụng Quy trình mẫu
  const handleApplyTemplate = async (tmpl) => {
    if (!tmpl || applyingTemplate) return;
    setApplyingTemplate(true);
    try {
      const promises = tmpl.steps.map((s, idx) =>
        addLegalStep(project.id, {
          name: s.name,
          phase: s.phase || 'phase_1',
          status: STEP_STATUS.PENDING,
          effectiveDate: '',
          targetDate: '',
          implementingUnit: '',
          summary: '',
          order: s.order ?? idx,
          attachments: []
        })
      );
      await Promise.all(promises);
      toast.success(`Đã áp dụng thành công: ${tmpl.name}`);
    } catch (err) {
      toast.error('Lỗi khi áp dụng mẫu: ' + err.message);
    } finally {
      setApplyingTemplate(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isFullscreen ? '100%' : 'auto' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setViewMode('timeline')}
          style={{
            background: 'none', border: 'none',
            borderBottom: viewMode === 'timeline' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: viewMode === 'timeline' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', padding: '4px 12px',
            transition: 'all 0.15s'
          }}
        >
          Timeline dọc
        </button>
        <button
          type="button"
          onClick={() => setViewMode('kanban')}
          style={{
            background: 'none', border: 'none',
            borderBottom: viewMode === 'kanban' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: viewMode === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', padding: '4px 12px',
            transition: 'all 0.15s'
          }}
        >
          📋 Kanban Board
        </button>
      </div>

      {/* A. Quy trình mẫu nếu dự án chưa có bước nào */}
      {sorted.length === 0 && (
        <div style={{ padding: '1.5rem', border: '1px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', backgroundColor: 'var(--color-bg-surface-hover)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 0.85rem 0' }}>
            Dự án này chưa có bước pháp lý nào. Áp dụng quy trình mẫu có sẵn?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {allTemplates.map((t) => (
              <div 
                key={t.id} 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)', padding: '4px 10px', transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <button
                  type="button"
                  disabled={applyingTemplate}
                  onClick={() => handleApplyTemplate(t)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  {applyingTemplate ? 'Đang áp dụng...' : t.name}
                </button>
                {!t.isDefault && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteTemplate(t.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                    title="Xóa quy trình mẫu này"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. View Mode 1: Timeline Dọc (Phân theo Giai đoạn) */}
      {viewMode === 'timeline' && sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: isFullscreen ? 'auto' : 'visible', flex: isFullscreen ? 1 : 'none', paddingRight: isFullscreen ? '0.5rem' : 0 }}>
          {Object.entries(LEGAL_PHASES).map(([phaseKey, phaseName]) => {
            const phaseSteps = sorted.filter(s => (s.phase || 'PHASE_1') === phaseKey);
            if (phaseSteps.length === 0) return null;

            return (
              <div key={phaseKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Tiêu đề Phase */}
                <div 
                  onClick={() => togglePhase(phaseKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary)',
                    padding: '6px 10px', backgroundColor: 'rgba(99,102,241,0.08)',
                    borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.02em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {phaseName}
                    <span style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                      color: 'var(--color-primary)', 
                      padding: '1px 6px', 
                      borderRadius: '10px',
                      textTransform: 'none'
                    }}>
                      {phaseSteps.length} bước
                    </span>
                  </span>
                  {collapsedPhases[phaseKey] ? (
                    <ChevronDown size={14} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <ChevronUp size={14} style={{ color: 'var(--color-primary)' }} />
                  )}
                </div>

                {/* Các bước trong phase */}
                {!collapsedPhases[phaseKey] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '4px' }}>
                    {phaseSteps.map((step, idx) => {
                      const globalIdx = sorted.findIndex(s => s.id === step.id);
                      return (
                        <StepRow
                          key={step.id}
                          step={step}
                          index={idx}
                          total={phaseSteps.length}
                          canEditStep={canEditStep}
                          canReorder={canReorder}
                          onEdit={onEditStep}
                          onDelete={onDeleteStep}
                          isDragging={dragIndex === globalIdx}
                          isDragOver={dropIndex === globalIdx && dragIndex !== globalIdx}
                          onDragStart={handleDragStart(globalIdx)}
                          onDragOver={handleDragOver(globalIdx)}
                          onDrop={handleDrop(globalIdx)}
                          onDragEnd={handleDragEnd}
                          partners={partners}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* C. View Mode 2: Kanban Board */}
      {viewMode === 'kanban' && sorted.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem',
          minHeight: isFullscreen ? '400px' : '260px',
          flex: isFullscreen ? 1 : 'none',
          height: isFullscreen ? 'calc(100% - 40px)' : 'auto'
        }}>
          {/* 3 cột trạng thái */}
          {[
            { key: STEP_STATUS.PENDING, title: 'Chưa thực hiện', color: 'var(--color-text-muted)', bg: 'rgba(148,163,184,0.08)' },
            { key: STEP_STATUS.IN_PROGRESS, title: 'Đang làm', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { key: STEP_STATUS.DONE, title: 'Hoàn thành', color: '#10b981', bg: 'rgba(16,185,129,0.08)' }
          ].map(col => {
            const colSteps = sorted.filter(s => (s.status || STEP_STATUS.PENDING) === col.key);

            return (
              <div
                key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleKanbanDrop(e, col.key)}
                style={{
                  backgroundColor: col.bg, borderRadius: '8px',
                  padding: '10px', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  border: '1px solid var(--color-border)',
                  height: isFullscreen ? '100%' : 'auto',
                  overflow: 'hidden'
                }}
              >
                {/* Tiêu đề cột */}
                <div style={{
                  fontSize: '0.78rem', fontWeight: '700', color: col.color,
                  textAlign: 'center', borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '6px', marginBottom: '2px', textTransform: 'uppercase'
                }}>
                  {col.title} ({colSteps.length})
                </div>

                {/* Danh sách thẻ */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  flex: 1, overflowY: 'auto',
                  maxHeight: isFullscreen ? 'calc(100% - 35px)' : '280px',
                  paddingBottom: '1rem'
                }}>
                  {colSteps.map(step => {
                    const dl = getDeadlineStatus(step.targetDate, step.status);
                    return (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={e => handleKanbanDragStart(e, step.id)}
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: `1px solid ${dl && dl.type === 'overdue' ? '#ef4444' : 'var(--color-border)'}`,
                          borderRadius: '6px', padding: '10px', cursor: 'grab',
                          fontSize: '0.82rem', transition: 'all 0.15s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = col.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = dl && dl.type === 'overdue' ? '#ef4444' : 'var(--color-border)'}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-main)', lineHeight: '1.3' }}>
                          {step.name}
                        </div>

                        {dl && (
                          <div style={{
                            fontSize: '0.7rem', fontWeight: '700',
                            color: dl.type === 'overdue' ? '#f87171' : '#fbbf24',
                            marginBottom: '6px'
                          }}>
                            ⚠️ {dl.text}
                          </div>
                        )}

                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {step.targetDate ? `🎯 Hạn: ${step.targetDate}` : 'Chưa có hạn'}
                        </div>

                        {/* Hành động nhanh */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => onEditStep(step)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.72rem', padding: '2px' }}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteStep(step.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.72rem', padding: '2px' }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Project Legal Card ─── */
const ProjectLegalCard = ({
  project, steps, partners,
  canAddStep, canEditStep, canReorder,
  onAddStep, onEditStep, onDeleteStep, onMoveStep,
  onMaximize, onSaveTemplate, customTemplates = [], onDeleteTemplate
}) => {
  const [expanded, setExpanded] = useState(false);

  // Đếm các bước trễ hạn
  const overdueCount = steps.filter(s => {
    const dl = getDeadlineStatus(s.targetDate, s.status);
    return dl && dl.type === 'overdue';
  }).length;

  const done = steps.filter(s => s.status === STEP_STATUS.DONE).length;
  const progress = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;

  return (
    <div className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      {/* Header image */}
      <div 
        style={{ position: 'relative', height: '140px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onMaximize(); }}
        title="Click để phóng to toàn màn hình"
      >
        {project.image
          ? <img src={project.image} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontSize: '2rem' }}>🏗️</div>
        }
        <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
          {project.code || 'N/A'}
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
          {overdueCount > 0 && (
            <div style={{
              backgroundColor: '#ef4444', color: 'white', padding: '3px 10px', borderRadius: '20px',
              fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              ⚠️ {overdueCount} trễ hạn
            </div>
          )}
          <div style={{ backgroundColor: progress === 100 ? '#10b981' : 'rgba(0,0,0,0.55)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
            {progress}% hoàn thành
          </div>
        </div>
        
        {/* Nút phóng to lơ lửng khi hover */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s', color: 'white', fontSize: '0.85rem', fontWeight: '600'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <Maximize2 size={18} style={{ marginRight: '6px' }} /> Phóng to toàn màn hình
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem' }}>
        <h3 
          style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', lineHeight: '1.3', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onMaximize(); }}
          title="Click để phóng to toàn màn hình"
        >
          {project.name}
        </h3>
        <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-bg-surface-hover)', marginBottom: '0.75rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '3px', background: progress === 100 ? 'var(--color-success)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          {done}/{steps.length} bước pháp lý • {steps.filter(s => s.status === STEP_STATUS.IN_PROGRESS).length} đang thực hiện
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {canAddStep && (
              <button className="btn btn-outline" onClick={() => onAddStep(project)} style={{ fontSize: '0.78rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                <Plus size={13} /> Thêm bước
              </button>
            )}
            {canAddStep && steps.length === 0 && (
              <button 
                className="btn btn-outline" 
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }} 
                style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.4)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                📋 Áp dụng mẫu
              </button>
            )}
            {canAddStep && steps.length > 0 && (
              <button 
                className="btn btn-outline" 
                onClick={(e) => { e.stopPropagation(); onSaveTemplate(project, steps); }} 
                style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', borderColor: 'rgba(99, 102, 241, 0.4)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                title="Lưu danh sách bước hiện tại thành quy trình mẫu"
              >
                💾 Lưu mẫu
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}
              title="Phóng to toàn màn hình"
            >
              <Maximize2 size={13} />
            </button>
            <button onClick={() => setExpanded(v => !v)} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {expanded ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Xem workflow</>}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <ProjectWorkflowDetail
              project={project}
              steps={steps}
              partners={partners}
              canAddStep={canAddStep}
              canEditStep={canEditStep}
              canReorder={canReorder}
              onAddStep={onAddStep}
              onEditStep={onEditStep}
              onDeleteStep={onDeleteStep}
              onMoveStep={onMoveStep}
              customTemplates={customTemplates}
              onDeleteTemplate={onDeleteTemplate}
              isFullscreen={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Step Form Modal ─── */
const StepFormModal = ({ project, editingStep, onClose, onSave, savedCount, partners, canUpload }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const blankForm = {
    name: '',
    status: STEP_STATUS.PENDING,
    effectiveDate: '',
    targetDate: '',
    implementingUnit: '',
    summary: '',
    phase: 'PHASE_1',
    order: 0,
    attachments: [],
  };

  const [form, setForm] = useState(
    editingStep
      ? {
          name: editingStep.name || '',
          status: editingStep.status || STEP_STATUS.PENDING,
          effectiveDate: editingStep.effectiveDate || editingStep.completedDate || '',
          targetDate: editingStep.targetDate || '',
          implementingUnit: editingStep.implementingUnit || '',
          summary: editingStep.summary || editingStep.note || '',
          phase: editingStep.phase || 'PHASE_1',
          order: editingStep.order ?? 0,
          attachments: editingStep.attachments || [],
        }
      : blankForm
  );

  // Reset form khi savedCount tăng (chỉ khi đang thêm mới, không phải edit)
  React.useEffect(() => {
    if (!editingStep && savedCount > 0) {
      setForm(blankForm);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  }, [savedCount]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');

    try {
      const newAtts = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `legalSteps/${Date.now()}_${file.name}`);
          const snapshot = await withTimeout(uploadBytes(storageRef, file), 20000);
          const url = await getDownloadURL(snapshot.ref);
          return { name: file.name, url };
        })
      );
      setForm(f => ({ ...f, attachments: [...f.attachments, ...newAtts], status: STEP_STATUS.DONE }));
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(getUploadErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      // Error is already alerted in parent
    } finally {
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--color-primary)" />
            {editingStep ? 'Sửa bước pháp lý' : 'Thêm bước pháp lý mới'}
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: '8px' }}>
          📁 Dự án: <strong>{project.name}</strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên bước pháp lý <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input list="step-suggestions" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Cấp phép xây dựng..." />
            <datalist id="step-suggestions">
              {WORKFLOW_DEFAULT_STEPS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày mục tiêu</label>
              <input type="date" className="input-field" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày hiệu lực</label>
              <input type="date" className="input-field" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Trạng thái</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value={STEP_STATUS.PENDING}>⚪ Chưa thực hiện</option>
                <option value={STEP_STATUS.IN_PROGRESS}>🟡 Đang thực hiện</option>
                <option value={STEP_STATUS.DONE}>🟢 Hoàn thành</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Đơn vị thực hiện</label>
              <select className="input-field" value={form.implementingUnit} onChange={e => setForm({ ...form, implementingUnit: e.target.value })}>
                <option value="">-- Chọn đối tác --</option>
                {partners?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giai đoạn pháp lý</label>
            <select className="input-field" value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}>
              {Object.entries(LEGAL_PHASES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Trích yếu</label>
            <textarea rows={3} className="input-field" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Nội dung trích yếu của bước pháp lý này..." style={{ resize: 'vertical' }} />
          </div>

          {savedMsg && (
            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Đã lưu! Nhập tiếp bước pháp lý mới...
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tệp đính kèm</label>
            <div style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface)' }}>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || !canUpload}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', opacity: canUpload ? 1 : 0.6, cursor: canUpload ? 'pointer' : 'not-allowed' }}>
                {uploading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải lên...</> : <><Paperclip size={14} /> Chọn tệp đính kèm</>}
              </button>
              {uploadError && (
                <div style={{ marginTop: '0.5rem', padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '0.75rem', color: '#f87171' }}>
                  ⚠️ {uploadError}
                </div>
              )}
              {form.attachments.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {form.attachments.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd', overflow: 'hidden' }}>
                        <FileText size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }} title="Tải xuống"><Download size={12} /></a>
                        <button type="button" onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 0 }} title="Xóa"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={isSaving}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSaveClick} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={!form.name.trim() || uploading || isSaving}>
            {isSaving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {editingStep ? 'Cập nhật' : 'Lưu bước'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ─── Save Template Modal ─── */
const SaveTemplateModal = ({ project, steps, customTemplates, onClose, onSave, onUpdate }) => {
  const [mode, setMode] = useState('new'); // 'new' | 'update'
  const [templateName, setTemplateName] = useState(`Mẫu quy trình - ${project.name}`);
  const [selectedTemplateId, setSelectedTemplateId] = useState(customTemplates[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (mode === 'new' && !templateName.trim()) return;
    setIsSaving(true);
    try {
      if (mode === 'new') {
        await onSave(templateName, steps);
      } else {
        const target = customTemplates.find(t => t.id === selectedTemplateId);
        await onUpdate(selectedTemplateId, target.name, steps);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💾 Lưu quy trình thành mẫu</span>
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: '8px' }}>
          📁 Dự án nguồn: <strong>{project.name}</strong> ({steps.length} bước)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Lựa chọn chế độ */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="template-mode" checked={mode === 'new'} onChange={() => setMode('new')} style={{ accentColor: 'var(--color-primary)' }} />
              <span>Tạo mới quy trình mẫu</span>
            </label>
            {customTemplates.length > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="radio" name="template-mode" checked={mode === 'update'} onChange={() => setMode('update')} style={{ accentColor: 'var(--color-primary)' }} />
                <span>Cập nhật mẫu đã có</span>
              </label>
            )}
          </div>

          {/* Form tạo mới */}
          {mode === 'new' ? (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên quy trình mẫu mới <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input 
                type="text" 
                className="input-field" 
                value={templateName} 
                onChange={e => setTemplateName(e.target.value)} 
                placeholder="VD: Quy trình mẫu hạ tầng..."
              />
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Chọn quy trình mẫu muốn cập nhật <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select 
                className="input-field" 
                value={selectedTemplateId} 
                onChange={e => setSelectedTemplateId(e.target.value)}
              >
                {customTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.steps?.length || 0} bước)</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px', margin: '6px 0 0 0' }}>
                ⚠️ Lưu ý: Thao tác này sẽ ghi đè toàn bộ danh sách bước hiện tại của mẫu quy trình cũ bằng danh sách bước của dự án này.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={isSaving}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || (mode === 'new' && !templateName.trim())}>
            {isSaving ? 'Đang lưu...' : 'Lưu quy trình mẫu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ─── Main Page ─── */
const PhapLy = () => {
  const { projects, legalSteps, addLegalStep, updateLegalStep, deleteLegalStep, userRole, partners, enableLazy, checkPermission } = useContext(DocumentContext);
  const toast = useToast();
  const confirm = useConfirm();
  useEffect(() => { enableLazy(); }, [enableLazy]);
  const isAdmin = userRole === ROLES.ADMIN;
  const [addingToProject, setAddingToProject] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [savedCount, setSavedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 3;

  const [customTemplates, setCustomTemplates] = useState([]);
  const [savingTemplateProject, setSavingTemplateProject] = useState(null);

  // Lắng nghe quy trình mẫu tùy chỉnh từ Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'legalTemplates'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCustomTemplates(list);
    });
    return () => unsub();
  }, []);

  const handleSave = async (form) => {
    try {
      if (editingStep) {
        await updateLegalStep(editingStep.id, form);
        setEditingStep(null);
        setEditingProject(null);
      } else {
        const projectSteps = legalSteps.filter(s => s.projectId === addingToProject.id || s.projectId === addingToProject.id?.toString());
        const maxOrder = projectSteps.reduce((max, s) => Math.max(max, s.order ?? 0), -1);
        await addLegalStep(addingToProject.id, { ...form, order: maxOrder + 1 });
        setSavedCount(c => c + 1); // reset form, giữ modal mở
      }
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
      toast.error('Lỗi khi lưu: ' + err.message);
      throw err;
    }
  };

  const handleEdit = (project, step) => {
    setEditingProject(project);
    setEditingStep(step);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Bạn có chắc muốn xóa bước pháp lý này?');
    if (ok) await deleteLegalStep(id);
  };

  // Di chuyển vị trí và cập nhật lại order cho tất cả các item nếu cần để sửa lỗi trùng order
  const handleMoveStep = async (sortedSteps, fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sortedSteps.length) return;
    const newSteps = [...sortedSteps];
    const [moved] = newSteps.splice(fromIdx, 1);
    newSteps.splice(toIdx, 0, moved);

    const promises = [];
    newSteps.forEach((step, index) => {
      if (step.order !== index) {
        promises.push(updateLegalStep(step.id, { ...step, order: index }));
      }
    });
    await Promise.all(promises);
  };

  // Tạo mới quy trình mẫu
  const handleSaveNewTemplate = async (templateName, projectSteps) => {
    try {
      const stepsData = projectSteps
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s, idx) => ({
          name: s.name,
          phase: s.phase || 'phase_1',
          order: idx
        }));

      await addDoc(collection(db, 'legalTemplates'), {
        name: templateName,
        steps: stepsData,
        createdAt: new Date().toISOString()
      });
      toast.success(`Đã lưu quy trình mẫu mới: ${templateName}`);
    } catch (err) {
      toast.error('Lỗi khi lưu quy trình mẫu mới: ' + err.message);
      throw err;
    }
  };

  // Cập nhật quy trình mẫu đã có
  const handleUpdateTemplate = async (templateId, templateName, projectSteps) => {
    try {
      const stepsData = projectSteps
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s, idx) => ({
          name: s.name,
          phase: s.phase || 'phase_1',
          order: idx
        }));

      await updateDoc(doc(db, 'legalTemplates', templateId), {
        steps: stepsData,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Đã cập nhật quy trình mẫu: ${templateName}`);
    } catch (err) {
      toast.error('Lỗi khi cập nhật quy trình mẫu: ' + err.message);
      throw err;
    }
  };

  // Xóa quy trình mẫu
  const handleDeleteTemplate = async (templateId) => {
    const ok = await confirm('Bạn có chắc chắn muốn xóa quy trình mẫu này?');
    if (ok) {
      try {
        await deleteDoc(doc(db, 'legalTemplates', templateId));
        toast.success('Đã xóa quy trình mẫu thành công.');
      } catch (err) {
        toast.error('Lỗi khi xóa quy trình mẫu: ' + err.message);
      }
    }
  };

  const [fullscreenProject, setFullscreenProject] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(['Đang thực hiện']);
  const filterMenuRef = useRef(null);

  const PROJECT_STATUSES = ['Chưa bắt đầu', 'Đang thực hiện', 'Đã hoàn thành', 'Đã bị hủy'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatusFilter = (status) => {
    let next;
    if (selectedStatuses.includes(status)) {
      next = selectedStatuses.filter(s => s !== status);
    } else {
      next = [...selectedStatuses, status];
    }
    setSelectedStatuses(next);
    setCurrentPage(1); // Reset trang
  };

  const filteredProjects = projects.filter(p => {
    const pStatus = p.status || 'Chưa bắt đầu';
    return selectedStatuses.length === 0 || selectedStatuses.includes(pStatus);
  });

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProjects = filteredProjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="fade-in" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>⚖️ Pháp lý dự án</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Theo dõi tiến trình pháp lý của {filteredProjects.length} dự án — {legalSteps.filter(s => s.status === STEP_STATUS.DONE && filteredProjects.some(fp => fp.id === s.projectId)).length} bước đã hoàn thành
          </p>
        </div>

        {/* Filter Dropdown */}
        <div style={{ position: 'relative' }} ref={filterMenuRef}>
           <button 
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)} 
              style={{ 
                backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' 
              }}
           >
              <Filter size={16} color="var(--color-text-muted)" />
              <span>Tình trạng {selectedStatuses.length < PROJECT_STATUSES.length ? `(${selectedStatuses.length})` : ''}</span>
              <ChevronDown size={14} color="var(--color-text-muted)" />
           </button>
           {showFilterMenu && (
             <div style={{ 
               position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 150,
               backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-border)',
               borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', width: '220px', overflow: 'hidden'
             }}>
               <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Lọc tình trạng dự án</span>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedStatuses(selectedStatuses.length === PROJECT_STATUSES.length ? [] : PROJECT_STATUSES); setCurrentPage(1); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {selectedStatuses.length === PROJECT_STATUSES.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                  </button>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                 {PROJECT_STATUSES.map(status => (
                   <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-main)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                     <div style={{ 
                       width: '16px', height: '16px', borderRadius: '4px', border: `1px solid ${selectedStatuses.includes(status) ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                       backgroundColor: selectedStatuses.includes(status) ? 'var(--color-primary)' : 'transparent',
                       display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}>
                       {selectedStatuses.includes(status) && <Check size={12} color="white" />}
                     </div>
                     <input 
                       type="checkbox" 
                       checked={selectedStatuses.includes(status)} 
                       onChange={() => toggleStatusFilter(status)}
                       style={{ display: 'none' }}
                     />
                     {status}
                   </label>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Cards grid */}
      {projects.length === 0
        ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', flex: 1 }}>Chưa có dự án nào. Vui lòng tạo dự án ở trang "Dự án".</div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start', flex: 1, paddingBottom: '1rem' }}>
            {pagedProjects.map(project => {
              const steps = legalSteps.filter(s => s.projectId === project.id || s.projectId === project.id?.toString());
              return (
                <ProjectLegalCard
                  key={project.id}
                  project={project}
                  steps={steps}
                  canAddStep={checkPermission(project.id, 'add_steps')}
                  canEditStep={checkPermission(project.id, 'edit_steps')}
                  canReorder={checkPermission(project.id, 'reorder')}
                  onAddStep={(p) => setAddingToProject(p)}
                  onEditStep={(step) => handleEdit(project, step)}
                  onDeleteStep={handleDelete}
                  onMoveStep={handleMoveStep}
                  partners={partners}
                  onMaximize={() => setFullscreenProject(project)}
                  onSaveTemplate={(proj) => setSavingTemplateProject(proj)}
                  customTemplates={customTemplates}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              );
            })}
          </div>
        )
      }

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={{
          flexShrink: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--color-border)',
          background: 'rgba(15, 23, 42, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
          borderRadius: 'var(--radius-md)',
          flexWrap: 'wrap', rowGap: '0.4rem',
          marginTop: 'auto',
        }}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safePage === 1}
            style={{
              padding: '0.35rem 0.65rem', borderRadius: '8px',
              background: 'none', border: '1px solid var(--color-border)',
              color: safePage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
              cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.78rem',
              opacity: safePage === 1 ? 0.4 : 1,
            }}
            title="Trang đầu"
          >«</button>

          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={{
              display: 'flex', alignItems: 'center', padding: '0.35rem 0.65rem',
              borderRadius: '8px', background: 'none', border: '1px solid var(--color-border)',
              color: safePage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
              cursor: safePage === 1 ? 'not-allowed' : 'pointer',
              opacity: safePage === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} style={{ color: 'var(--color-text-muted)', padding: '0 0.25rem', fontSize: '0.85rem' }}>…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  style={{
                    padding: '0.35rem 0.7rem', borderRadius: '8px',
                    background: safePage === item ? 'var(--color-primary)' : 'none',
                    border: safePage === item ? 'none' : '1px solid var(--color-border)',
                    color: safePage === item ? 'white' : 'var(--color-text-main)',
                    fontWeight: safePage === item ? '700' : '400',
                    cursor: 'pointer', fontSize: '0.85rem',
                    boxShadow: safePage === item ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
                    minWidth: '34px',
                  }}
                >
                  {item}
                </button>
              )
            )
          }

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={{
              display: 'flex', alignItems: 'center', padding: '0.35rem 0.65rem',
              borderRadius: '8px', background: 'none', border: '1px solid var(--color-border)',
              color: safePage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-main)',
              cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
              opacity: safePage === totalPages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safePage === totalPages}
            style={{
              padding: '0.35rem 0.65rem', borderRadius: '8px',
              background: 'none', border: '1px solid var(--color-border)',
              color: safePage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-main)',
              cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.78rem',
              opacity: safePage === totalPages ? 0.4 : 1,
            }}
            title="Trang cuối"
          >»</button>

          <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Trang <strong style={{ color: 'var(--color-text-main)' }}>{safePage}</strong> / {totalPages}
            &nbsp;·&nbsp;
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, projects.length)} / {projects.length} dự án
          </span>
        </div>
      )}

      {/* Modal Thêm/Sửa bước */}
      {(addingToProject || editingStep) && (
        <StepFormModal
          project={editingProject || addingToProject}
          editingStep={editingStep}
          canUpload={checkPermission((editingProject || addingToProject).id, 'upload_att')}
          onClose={() => { setAddingToProject(null); setEditingStep(null); setEditingProject(null); setSavedCount(0); }}
          onSave={handleSave}
          savedCount={savedCount}
          partners={partners}
        />
      )}

      {/* Modal Pháp lý Toàn màn hình */}
      {fullscreenProject && ReactDOM.createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setFullscreenProject(null)} 
          style={{ zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '96vw', 
              width: '1400px', 
              height: '92vh', 
              padding: 0, 
              borderRadius: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }}
          >
            {/* Header banner của Fullscreen Modal */}
            <div style={{ 
              padding: fullscreenProject.image ? '5rem 2rem 1.5rem' : '2rem', 
              borderBottom: '1px solid var(--color-border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              backgroundColor: 'var(--color-bg-surface-hover)',
              backgroundImage: fullscreenProject.image ? `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%), url(${fullscreenProject.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: fullscreenProject.image ? 'white' : 'var(--color-text-main)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(4px)', marginBottom: '0.5rem' }}>
                  Mã dự án: {fullscreenProject.code || 'N/A'}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: 0, textShadow: fullscreenProject.image ? '0 2px 4px rgba(0,0,0,0.7)' : 'none' }}>
                  {fullscreenProject.name}
                </h2>
              </div>
              
              <button 
                type="button"
                onClick={() => setFullscreenProject(null)}
                style={{ 
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content vùng to */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--color-bg-surface)' }}>
              <ProjectWorkflowDetail
                project={fullscreenProject}
                steps={legalSteps.filter(s => s.projectId === fullscreenProject.id || s.projectId === fullscreenProject.id?.toString())}
                partners={partners}
                canAddStep={checkPermission(fullscreenProject.id, 'add_steps')}
                canEditStep={checkPermission(fullscreenProject.id, 'edit_steps')}
                canReorder={checkPermission(fullscreenProject.id, 'reorder')}
                onAddStep={(p) => setAddingToProject(p)}
                onEditStep={(step) => handleEdit(fullscreenProject, step)}
                onDeleteStep={handleDelete}
                onMoveStep={handleMoveStep}
                customTemplates={customTemplates}
                onDeleteTemplate={handleDeleteTemplate}
                isFullscreen={true}
              />
            </div>
            
            {/* Footer */}
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--color-bg-surface-hover)' }}>
              <button className="btn btn-outline" onClick={() => setFullscreenProject(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Minimize2 size={15} /> Thu nhỏ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Lưu thành Quy trình mẫu */}
      {savingTemplateProject && (
        <SaveTemplateModal
          project={savingTemplateProject}
          steps={legalSteps.filter(s => s.projectId === savingTemplateProject.id || s.projectId === savingTemplateProject.id?.toString())}
          customTemplates={customTemplates}
          onClose={() => setSavingTemplateProject(null)}
          onSave={handleSaveNewTemplate}
          onUpdate={handleUpdateTemplate}
        />
      )}
    </div>
  );
};

export default PhapLy;
