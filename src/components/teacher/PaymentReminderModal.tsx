import React, { useState } from 'react';
import { Student, PaymentRecord } from '../../types';
import { analyzeDueDate, generatePaymentReminderText } from '../../utils/paymentUtils';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  AlertTriangle,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

interface PaymentReminderModalProps {
  payment: PaymentRecord;
  student: Student;
  onClose: () => void;
  onMarkAsPaid: () => void;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  payment,
  student,
  onClose,
  onMarkAsPaid,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const analysis = analyzeDueDate(payment.dueDate, payment.status);

  const [message, setMessage] = useState<string>(() =>
    generatePaymentReminderText(
      student.name,
      student.instrument,
      payment.title,
      payment.amount,
      payment.dueDate,
      analysis.daysDiff,
    ),
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Clean phone number for WhatsApp wa.me link
  const cleanPhone = student.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      id="payment-reminder-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className={`p-6 border-b ${analysis.isOverdue ? 'bg-rose-50/80 border-rose-100' : 'bg-amber-50/80 border-amber-100'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  analysis.isOverdue ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {analysis.isOverdue ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    analysis.isOverdue
                      ? 'bg-rose-200/70 text-rose-800'
                      : 'bg-amber-200/70 text-amber-800'
                  }`}
                >
                  {analysis.isOverdue ? 'Atraso de Cobrança' : 'Aviso Preventivo de Vencimento'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Lembrete para {student.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Summary Pill */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Item a Cobrar
              </span>
              <span className="font-bold text-slate-800">{payment.title}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Valor
              </span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {payment.amount.toFixed(2)} €
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Data de Vencimento
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{analysis.formattedDueDate}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Situação
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  analysis.isOverdue
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {analysis.badgeLabel}
              </span>
            </div>
          </div>

          {/* Contact quick links */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {student.phone}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {student.email}
            </span>
          </div>

          {/* Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Mensagem Personalizada de Lembrete:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Podes editar a mensagem antes de copiar ou enviar via WhatsApp.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={onMarkAsPaid}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
            >
              Marcar Já Como Pago
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
