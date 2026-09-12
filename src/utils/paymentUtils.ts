import { PaymentStatus } from '../types';

export type DueDateCategory = 'overdue' | 'today' | 'soon' | 'future' | 'paid';

export interface DueDateAnalysis {
  category: DueDateCategory;
  daysDiff: number; // negative = overdue by X days, 0 = today, positive = due in X days
  isUrgent: boolean; // true if overdue, today, or due soon (<= 5 days) while unpaid
  isOverdue: boolean; // true if daysDiff < 0 and unpaid
  isDueSoon: boolean; // true if daysDiff >= 0 and daysDiff <= 5 and unpaid
  isDueToday: boolean; // true if daysDiff === 0 and unpaid
  badgeLabel: string;
  badgeShort: string;
  badgeClasses: string;
  rowHighlightClasses: string;
  borderAccentClasses: string;
  textColorClass: string;
  icon: 'alert-triangle' | 'clock' | 'calendar' | 'check';
  formattedDueDate: string;
}

/**
 * Analyzes a due date relative to today's local date.
 * Accurately parses YYYY-MM-DD strings in local timezone.
 */
export function analyzeDueDate(dueDateStr: string, status: PaymentStatus): DueDateAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD
  const parts = dueDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const due = new Date(year, month, day, 0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formattedDueDate = due.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (status === 'pago') {
    return {
      category: 'paid',
      daysDiff,
      isUrgent: false,
      isOverdue: false,
      isDueSoon: false,
      isDueToday: false,
      badgeLabel: 'Liquidado',
      badgeShort: 'Pago',
      badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rowHighlightClasses: 'border-l-4 border-l-transparent',
      borderAccentClasses: 'border-emerald-300',
      textColorClass: 'text-emerald-700',
      icon: 'check',
      formattedDueDate,
    };
  }

  // Overdue
  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff);
    const label = absDays === 1 ? 'Ultrapassada ontem' : `Ultrapassada há ${absDays} dias`;
    return {
      category: 'overdue',
      daysDiff,
      isUrgent: true,
      isOverdue: true,
      isDueSoon: false,
      isDueToday: false,
      badgeLabel: `⚠️ ${label}`,
      badgeShort: `⚠️ ${absDays}d em atraso`,
      badgeClasses: 'bg-rose-100 text-rose-800 border-rose-300 font-bold shadow-xs',
      rowHighlightClasses: 'bg-rose-50/70 hover:bg-rose-100/60 border-l-4 border-l-rose-500',
      borderAccentClasses: 'border-rose-400',
      textColorClass: 'text-rose-700 font-bold',
      icon: 'alert-triangle',
      formattedDueDate,
    };
  }

  // Due today
  if (daysDiff === 0) {
    return {
      category: 'today',
      daysDiff,
      isUrgent: true,
      isOverdue: false,
      isDueSoon: true,
      isDueToday: true,
      badgeLabel: '⏰ Vence hoje!',
      badgeShort: '⏰ Hoje',
      badgeClasses: 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-xs',
      rowHighlightClasses: 'bg-amber-50/80 hover:bg-amber-100/60 border-l-4 border-l-amber-500',
      borderAccentClasses: 'border-amber-400',
      textColorClass: 'text-amber-800 font-bold',
      icon: 'clock',
      formattedDueDate,
    };
  }

  // Due soon (within next 5 days)
  if (daysDiff <= 5) {
    const label = daysDiff === 1 ? 'Vence amanhã' : `Vence em ${daysDiff} dias`;
    return {
      category: 'soon',
      daysDiff,
      isUrgent: true,
      isOverdue: false,
      isDueSoon: true,
      isDueToday: false,
      badgeLabel: `⏰ ${label}`,
      badgeShort: `⏰ Em ${daysDiff}d`,
      badgeClasses: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-xs',
      rowHighlightClasses: 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-l-amber-400',
      borderAccentClasses: 'border-amber-300',
      textColorClass: 'text-amber-700 font-semibold',
      icon: 'clock',
      formattedDueDate,
    };
  }

  // Future / on-time
  return {
    category: 'future',
    daysDiff,
    isUrgent: false,
    isOverdue: false,
    isDueSoon: false,
    isDueToday: false,
    badgeLabel: `No prazo (em ${daysDiff} dias)`,
    badgeShort: `Em ${daysDiff}d`,
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
    rowHighlightClasses: 'border-l-4 border-l-transparent',
    borderAccentClasses: 'border-slate-200',
    textColorClass: 'text-slate-600',
    icon: 'calendar',
    formattedDueDate,
  };
}

/**
 * Generates a polite, professional payment reminder text for WhatsApp / SMS.
 */
export function generatePaymentReminderText(
  studentName: string,
  instrument: string,
  paymentTitle: string,
  amount: number,
  dueDateStr: string,
  daysDiff: number,
  teacherName: string = 'Prof. André Martins'
): string {
  const parts = dueDateStr.split('-');
  const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const formattedDate = due.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
  });

  let urgencyPhrase = '';
  if (daysDiff < 0) {
    const abs = Math.abs(daysDiff);
    urgencyPhrase = `com data limite ultrapassada a ${formattedDate} (há ${abs} ${abs === 1 ? 'dia' : 'dias'})`;
  } else if (daysDiff === 0) {
    urgencyPhrase = `com data de vencimento HOJE (${formattedDate})`;
  } else if (daysDiff <= 5) {
    urgencyPhrase = `com data de vencimento próxima a ${formattedDate} (dentro de ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'})`;
  } else {
    urgencyPhrase = `com data de vencimento a ${formattedDate}`;
  }

  return `Olá ${studentName}! 😊\n\nEspero que estejas a gostar das aulas de ${instrument}. Lembramos com estima que a mensalidade referente a "${paymentTitle}" no valor de ${amount.toFixed(2)} € encontra-se pendente, ${urgencyPhrase}.\n\nPodes efetuar a liquidação por:\n• MB WAY: 912 345 678\n• IBAN: PT50 0033 0000 1234 5678 9012 3\n\nApós a operação, podes notificar diretamente através do teu Portal do Aluno. Muito obrigado!\n${teacherName} 🎸`;
}
