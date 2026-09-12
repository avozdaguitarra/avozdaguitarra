import React, { useState, useMemo } from 'react';
import { Student, PaymentRecord, PaymentStatus } from '../../types';
import { analyzeDueDate } from '../../utils/paymentUtils';
import { PaymentReminderModal } from './PaymentReminderModal';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

interface PaymentsManagementViewProps {
  students: Student[];
  payments: PaymentRecord[];
  onUpdatePaymentStatus: (paymentId: string, status: PaymentStatus, method?: string) => void;
  onSelectStudentView: (studentId: string) => void;
}

type FilterType = 'all' | 'overdue' | 'due_soon' | 'alerts' | 'pending' | 'paid';

export const PaymentsManagementView: React.FC<PaymentsManagementViewProps> = ({
  students,
  payments,
  onUpdatePaymentStatus,
  onSelectStudentView,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reminderPayment, setReminderPayment] = useState<PaymentRecord | null>(null);

  // Map each payment to its student and due date analysis
  const analyzedPayments = useMemo(() => {
    return payments.map((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const analysis = analyzeDueDate(p.dueDate, p.status);
      return {
        payment: p,
        student,
        analysis,
      };
    });
  }, [payments, students]);

  // Categories
  const overdueItems = useMemo(
    () => analyzedPayments.filter((item) => item.analysis.isOverdue),
    [analyzedPayments],
  );

  const dueSoonItems = useMemo(
    () => analyzedPayments.filter((item) => item.analysis.isDueSoon),
    [analyzedPayments],
  );

  const alertItems = useMemo(
    () => analyzedPayments.filter((item) => item.analysis.isUrgent),
    [analyzedPayments],
  );

  const pendingItems = useMemo(
    () => analyzedPayments.filter((item) => item.payment.status === 'pendente'),
    [analyzedPayments],
  );

  const paidItems = useMemo(
    () => analyzedPayments.filter((item) => item.payment.status === 'pago'),
    [analyzedPayments],
  );

  // Calculate totals
  const totalOverdueAmount = overdueItems.reduce((acc, i) => acc + i.payment.amount, 0);
  const totalDueSoonAmount = dueSoonItems.reduce((acc, i) => acc + i.payment.amount, 0);

  // Filtered list for display
  const displayedItems = useMemo(() => {
    return analyzedPayments.filter((item) => {
      // 1. Tab filter
      if (filter === 'overdue' && !item.analysis.isOverdue) return false;
      if (filter === 'due_soon' && !item.analysis.isDueSoon) return false;
      if (filter === 'alerts' && !item.analysis.isUrgent) return false;
      if (filter === 'pending' && item.payment.status !== 'pendente') return false;
      if (filter === 'paid' && item.payment.status !== 'pago') return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = item.student?.name.toLowerCase() || '';
        const instrument = item.student?.instrument.toLowerCase() || '';
        const title = item.payment.title.toLowerCase();
        const notes = (item.payment.notes || '').toLowerCase();
        if (
          !studentName.includes(q) &&
          !instrument.includes(q) &&
          !title.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [analyzedPayments, filter, searchQuery]);

  // Student for active reminder modal
  const reminderStudent = useMemo(() => {
    if (!reminderPayment) return null;
    return students.find((s) => s.id === reminderPayment.studentId) || null;
  }, [reminderPayment, students]);

  return (
    <div id="payments-management-view" className="space-y-6">
      {/* 1. HIGHLIGHT SECTION: ALERTAS DE VENCIMENTO (OVERDUE & DUE SOON HIGHLIGHTS) */}
      <div
        id="payments-due-date-alert-section"
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Destaque de Vencimento de Mensalidades
                {alertItems.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                    {alertItems.length} {alertItems.length === 1 ? 'alerta ativo' : 'alertas ativos'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Em dia
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhamento prioritário de alunos com data limite ultrapassada ou a vencer nos próximos 5 dias
              </p>
            </div>
          </div>

          {alertItems.length > 0 && (
            <button
              onClick={() => setFilter(filter === 'alerts' ? 'all' : 'alerts')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                filter === 'alerts'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {filter === 'alerts' ? 'Ver Todos os Pagamentos' : 'Filtrar Todos em Alerta'}
            </button>
          )}
        </div>

        {/* 2 DISTINCT HIGHLIGHT CARDS: OVERDUE VS DUE SOON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card A: Vencimento Já Ultrapassado */}
          <div
            id="highlight-card-overdue"
            className={`p-5 rounded-2xl border transition-all ${
              overdueItems.length > 0
                ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/40'
                : 'bg-slate-50/50 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    overdueItems.length > 0
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-rose-900">
                    Vencimento Já Ultrapassado
                  </div>
                  <div className="text-[11px] text-rose-700/80">
                    {overdueItems.length > 0
                      ? `${overdueItems.length} ${overdueItems.length === 1 ? 'aluno em atraso' : 'alunos em atraso'} (${totalOverdueAmount.toFixed(2)} € em dívida)`
                      : 'Nenhum pagamento em atraso de momento'}
                  </div>
                </div>
              </div>

              {overdueItems.length > 0 && (
                <button
                  onClick={() => setFilter('overdue')}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
                >
                  Filtrar ({overdueItems.length})
                </button>
              )}
            </div>

            {overdueItems.length > 0 ? (
              <div className="space-y-2 mt-3">
                {overdueItems.map((item) => (
                  <div
                    key={item.payment.id}
                    className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.student?.avatarUrl}
                        alt={item.student?.name}
                        className="w-8 h-8 rounded-full object-cover border border-rose-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.student?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.student?.instrument} • {item.payment.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-black text-rose-900 text-xs">
                          {item.payment.amount.toFixed(2)} €
                        </div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          {item.analysis.badgeShort}
                        </span>
                      </div>

                      <button
                        onClick={() => setReminderPayment(item.payment)}
                        title="Enviar lembrete de pagamento"
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lembrete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Nenhum aluno com data limite vencida. Excelente!</span>
              </div>
            )}
          </div>

          {/* Card B: Vencimento Próximo (Próximos 5 dias) */}
          <div
            id="highlight-card-due-soon"
            className={`p-5 rounded-2xl border transition-all ${
              dueSoonItems.length > 0
                ? 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/40'
                : 'bg-slate-50/50 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    dueSoonItems.length > 0
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Vencimento Próximo (Próximos 5 dias)
                  </div>
                  <div className="text-[11px] text-amber-800/80">
                    {dueSoonItems.length > 0
                      ? `${dueSoonItems.length} ${dueSoonItems.length === 1 ? 'mensalidade a vencer' : 'mensalidades a vencer'} (${totalDueSoonAmount.toFixed(2)} € previstos)`
                      : 'Nenhuma mensalidade a vencer nos próximos 5 dias'}
                  </div>
                </div>
              </div>

              {dueSoonItems.length > 0 && (
                <button
                  onClick={() => setFilter('due_soon')}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                >
                  Filtrar ({dueSoonItems.length})
                </button>
              )}
            </div>

            {dueSoonItems.length > 0 ? (
              <div className="space-y-2 mt-3">
                {dueSoonItems.map((item) => (
                  <div
                    key={item.payment.id}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.student?.avatarUrl}
                        alt={item.student?.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.student?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.student?.instrument} • {item.payment.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-black text-amber-900 text-xs">
                          {item.payment.amount.toFixed(2)} €
                        </div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          {item.analysis.badgeShort}
                        </span>
                      </div>

                      <button
                        onClick={() => setReminderPayment(item.payment)}
                        title="Enviar aviso prévio de vencimento"
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Aviso</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Nenhum pagamento com vencimento nos próximos 5 dias.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: SEARCH & FILTER PILLS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabela de Pagamentos & Vencimentos
            </h3>
            <p className="text-xs text-slate-500">
              Linhas com vencimento ultrapassado ou próximo surgem destacadas a cor
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar aluno, instrumento..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({analyzedPayments.length})
          </button>

          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              filter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ Ultrapassadas ({overdueItems.length})</span>
          </button>

          <button
            onClick={() => setFilter('due_soon')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              filter === 'due_soon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⏰ Vencimento Próximo ({dueSoonItems.length})</span>
          </button>

          <button
            onClick={() => setFilter('alerts')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'alerts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            ⚡ Todos em Alerta ({alertItems.length})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'pending'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pendentes ({pendingItems.length})
          </button>

          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Pagos ({paidItems.length})
          </button>
        </div>

        {/* 3. PAYMENTS TABLE WITH VISUAL HIGHLIGHTS */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Mensalidade / Descrição</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1 text-slate-700 font-bold">
                    <span>Data Vencimento</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Destaque Urgência)
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4">Estado Atual</th>
                <th className="py-3 px-4 text-right">Ações & Lembrete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedItems.length > 0 ? (
                displayedItems.map(({ payment: p, student, analysis }) => {
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${analysis.rowHighlightClasses || 'hover:bg-slate-50/70'}`}
                    >
                      {/* Aluno & Instrumento */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {student?.avatarUrl && (
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{student?.name || 'Aluno'}</span>
                              {analysis.isOverdue && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-tight">
                                  <AlertTriangle className="w-3 h-3" />
                                  Vencido
                                </span>
                              )}
                              {analysis.isDueSoon && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-tight">
                                  <Clock className="w-3 h-3" />
                                  Próximo
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] font-normal text-slate-500">
                              {student?.instrument}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mensalidade / Descrição */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-800">{p.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="capitalize">{p.type.replace('_', ' ')}</span>
                          {p.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]" title={p.notes}>
                                {p.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {p.amount.toFixed(2)} €
                      </td>

                      {/* Data de Vencimento + Destaque Visual */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span>{analysis.formattedDueDate}</span>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${analysis.badgeClasses}`}
                            >
                              {analysis.badgeLabel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estado Atual */}
                      <td className="py-3.5 px-4">
                        {p.status === 'pago' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pago ({p.paymentMethod || 'Validado'})
                          </span>
                        ) : p.status === 'pendente' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Em Atraso
                          </span>
                        )}
                      </td>

                      {/* Ações & Lembrete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                          {/* Lembrete button for overdue or due soon */}
                          {p.status !== 'pago' && (
                            <button
                              onClick={() => setReminderPayment(p)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all ${
                                analysis.isOverdue
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                              }`}
                              title="Criar lembrete personalizado de cobrança"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Lembrete</span>
                            </button>
                          )}

                          {/* Quick Mark as Paid */}
                          {p.status !== 'pago' && (
                            <button
                              onClick={() => onUpdatePaymentStatus(p.id, 'pago', 'MB WAY')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                            >
                              Marcar Pago
                            </button>
                          )}

                          {/* Portal Aluno link */}
                          {student && (
                            <button
                              onClick={() => onSelectStudentView(student.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                              title="Ver Portal do Aluno"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum pagamento encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Reminder Modal */}
      {reminderPayment && reminderStudent && (
        <PaymentReminderModal
          payment={reminderPayment}
          student={reminderStudent}
          onClose={() => setReminderPayment(null)}
          onMarkAsPaid={() => {
            onUpdatePaymentStatus(reminderPayment.id, 'pago', 'MB WAY');
            setReminderPayment(null);
          }}
        />
      )}
    </div>
  );
};
