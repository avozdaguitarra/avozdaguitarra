import React, { useState } from 'react';
import { Student, PaymentRecord } from '../../types';
import { getStoredTeacherSettings } from '../../utils/storage';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Smartphone,
  Building2,
  Send,
  Download,
  Banknote,
  MapPin,
} from 'lucide-react';

interface PaymentStatusViewProps {
  student: Student;
  payments: PaymentRecord[];
  onNotifyPayment: (paymentId: string, method: string, notes: string) => void;
}

export const PaymentStatusView: React.FC<PaymentStatusViewProps> = ({
  student,
  payments,
  onNotifyPayment,
}) => {
  const teacherSettings = getStoredTeacherSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('MB WAY');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [viewReceipt, setViewReceipt] = useState<PaymentRecord | null>(null);

  // Student specific payments sorted with latest first
  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const currentObligation = studentPayments[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentObligation) {
      onNotifyPayment(
        currentObligation.id,
        selectedMethod,
        paymentNote || 'Comprovativo submetido pelo aluno.',
      );
    }
    setShowNotifyModal(false);
    setPaymentNote('');
  };

  return (
    <div id="student-payment-view" className="space-y-6">
      {/* Primary Payment Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                Plano: {student.paymentPlan === 'mensal' ? 'Mensalidade Fixa' : 'Pagamento por Aula'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                {student.currentMonthName}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Estado de Pagamento
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Controlo de mensalidades e aulas do estúdio de música
            </p>
          </div>

          {/* Large Visual Status Pill */}
          <div>
            {student.currentMonthStatus === 'pago' ? (
              <div
                id="payment-status-badge-pago"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-600">
                    Mensalidade Regularizada
                  </div>
                  <div className="text-base font-black text-emerald-900">
                    PAGO ✅
                  </div>
                </div>
              </div>
            ) : student.currentMonthStatus === 'pendente' ? (
              <div
                id="payment-status-badge-pendente"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-600">
                    A aguardar liquidação
                  </div>
                  <div className="text-base font-black text-amber-900">
                    PENDENTE ⏳
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="payment-status-badge-atrasado"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-rose-600">
                    Pagamento em falta
                  </div>
                  <div className="text-base font-black text-rose-900">
                    EM ATRASO ⚠️
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Details / Call to Action */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valor do Período
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
              {student.paymentPlan === 'mensal'
                ? `${student.monthlyFee.toFixed(2)} €`
                : `${student.perLessonFee.toFixed(2)} €`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {student.paymentPlan === 'mensal'
                ? 'Inclui todas as 4 a 5 aulas do mês'
                : 'Cobrança avulso por aula lecionada'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Data de Vencimento
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {currentObligation?.dueDate
                ? new Date(currentObligation.dueDate).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Até ao 8º dia do mês'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {student.currentMonthStatus === 'pago'
                ? `Liquidado a ${currentObligation?.paidDate || 'tempo'}`
                : 'Evita atrasos para garantir a tua vaga na turma'}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {student.currentMonthStatus !== 'pago' ? (
              <button
                id="notify-payment-open-btn"
                onClick={() => setShowNotifyModal(true)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 text-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Informar Pagamento Efetuado
              </button>
            ) : (
              <button
                id="view-receipt-btn"
                onClick={() => setViewReceipt(currentObligation || null)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                Ver Recibo / Comprovativo
              </button>
            )}

            <span className="text-[11px] text-center text-slate-400">
              O professor valida os pagamentos após receção do comprovativo
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MB WAY */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs border border-red-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">MB WAY do Professor</h4>
                <p className="text-xs text-slate-500">Envio imediato e sem taxas</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Número:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {teacherSettings.paymentInfo?.mbwayPhone || '910 000 111'}
                  </span>
                  <button
                    id="copy-mbway-btn"
                    onClick={() => handleCopy(teacherSettings.paymentInfo?.mbwayPhone || '910000111', 'mbway')}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedField === 'mbway' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Beneficiário:</span>
                <span className="font-semibold text-slate-700">{teacherSettings.paymentInfo?.accountHolder || 'Prof. Sérgio Gomes'}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Descritivo: <span className="text-slate-700 font-medium">Aula {student.instrument} - {student.name}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            💡 Envia comprovativo ou notifica diretamente nesta plataforma após o envio.
          </p>
        </div>

        {/* Bank Transfer / IBAN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Transferência Bancária</h4>
                <p className="text-xs text-slate-500">Homebanking / SEPA</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">IBAN:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {teacherSettings.paymentInfo?.iban || 'PT50 0033 0000 1234 5678 9012 3'}
                  </span>
                  <button
                    id="copy-iban-btn"
                    onClick={() => handleCopy(teacherSettings.paymentInfo?.iban || 'PT50003300001234567890123', 'iban')}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedField === 'iban' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Titular:</span>
                <span className="font-semibold text-slate-700">{teacherSettings.paymentInfo?.accountHolder || 'Sérgio Gomes'}</span>
              </div>

              <div className="text-[11px] text-slate-400">
                Referência: <span className="text-slate-700 font-medium">ALUNO-{student.id.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Guarda o comprovativo emitido pelo teu banco para notificação.
          </p>
        </div>

        {/* Dinheiro / Numerário (Presencial) */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs border border-emerald-200 shadow-2xs">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">Pagamento em Dinheiro</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                    Presencial
                  </span>
                </div>
                <p className="text-xs text-slate-500">Entrega em mão no início da aula</p>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 space-y-2 mb-4">
              <div className="flex items-start gap-1.5 text-xs text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-900">Local das Aulas (Estúdio):</span>
                  <span className="text-[11px] text-slate-600 leading-snug">
                    {teacherSettings.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga'}
                  </span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-600 border-t border-emerald-200/60">
                Emissão imediata de recibo de quitação em formato digital ou impresso.
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-emerald-700 font-medium">Aulas de 60 minutos</span>
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('Dinheiro');
                setPaymentNote('Pagamento presencial em numerário entregue no estúdio na aula.');
                setShowNotifyModal(true);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              Avisar Pagamento em Dinheiro →
            </button>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Histórico de Pagamentos e Recibos
          </h3>
          <span className="text-xs text-slate-400">
            {studentPayments.length} registos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Descrição</th>
                <th className="pb-3 px-4">Valor</th>
                <th className="pb-3 px-4">Vencimento</th>
                <th className="pb-3 px-4">Estado</th>
                <th className="pb-3 px-4">Método</th>
                <th className="pb-3 pl-4 text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pr-4 font-semibold text-slate-900">
                    {p.title}
                    {p.notes && (
                      <span className="block text-[11px] font-normal text-slate-500">
                        {p.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {p.amount.toFixed(2)} €
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(p.dueDate).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="py-3.5 px-4">
                    {p.status === 'pago' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Pago
                      </span>
                    ) : p.status === 'pendente' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        <AlertCircle className="w-3 h-3" />
                        Atrasado
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {p.paymentMethod || '—'}
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    {p.status === 'pago' ? (
                      <button
                        onClick={() => setViewReceipt(p)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver Recibo
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Notify Payment */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Notificar Pagamento Efetuado
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informa o professor sobre a transferência ou MB WAY enviado para atualização imediata do registo.
            </p>

            <form onSubmit={handleSubmitNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Método Utilizado
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MB WAY">MB WAY</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Dinheiro">Dinheiro (em aula)</option>
                  <option value="Multibanco">Multibanco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nota / Número da Transação / Comprovativo
                </label>
                <textarea
                  rows={3}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Ex: Transferência feita hoje pela conta de Maria Santos. Referência: TX8921"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                Ao submeter, o teu estado é alterado para "Pago" ou fica sinalizado para validação pelo professor.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  Submeter Notificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Receipt */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Recibo de Quitação</h3>
              <p className="text-xs text-slate-500">
                {viewReceipt.receiptCode || 'REC-2026-OFICIAL'}
              </p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Aluno:</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Instrumento:</span>
                <span className="font-semibold text-slate-800">{student.instrument}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Descrição:</span>
                <span className="font-semibold text-slate-800">{viewReceipt.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Data de Pagamento:</span>
                <span className="font-semibold text-slate-800">
                  {viewReceipt.paidDate || viewReceipt.dueDate}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Método:</span>
                <span className="font-semibold text-slate-800">
                  {viewReceipt.paymentMethod || 'MB WAY'}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm bg-slate-50 px-3 rounded-xl">
                <span className="font-bold text-slate-800">Total Liquidado:</span>
                <span className="font-black text-emerald-700 font-mono">
                  {viewReceipt.amount.toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
