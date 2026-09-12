import React, { useState } from 'react';
import { Student, ScheduleItem, PaymentRecord, StudyMaterial, PaymentStatus } from '../types';
import { ScheduleView } from './student/ScheduleView';
import { PaymentStatusView } from './student/PaymentStatusView';
import { MaterialsView } from './student/MaterialsView';
import { Calendar, CreditCard, BookOpen, Clock, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface StudentPortalProps {
  student: Student;
  schedule?: ScheduleItem;
  payments: PaymentRecord[];
  materials: StudyMaterial[];
  onNotifyPayment: (paymentId: string, method: string, notes: string) => void;
  onToggleMaterialCompleted: (materialId: string) => void;
  onOpenMetronomeAtBpm: (bpm: number) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  schedule,
  payments,
  materials,
  onNotifyPayment,
  onToggleMaterialCompleted,
  onOpenMetronomeAtBpm,
}) => {
  const [activeTab, setActiveTab] = useState<'horario' | 'pagamentos' | 'materiais'>('horario');

  const studentMaterialsCount = materials.filter(
    (m) => m.studentId === student.id || m.studentId === 'all' || m.instrument === student.instrument,
  ).length;

  return (
    <div id="student-portal" className="space-y-6">
      {/* Student Identity Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={student.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <Music className="w-3 h-3" />
                {student.instrument}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span>Nível: <strong className="text-slate-700">{student.level}</strong></span>
              <span>•</span>
              <span>Plano: <strong className="text-slate-700">{student.paymentPlan === 'mensal' ? 'Mensal' : 'Por Aula'}</strong></span>
              <span>•</span>
              <span>Desde {new Date(student.joinedDate).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Payment Pill */}
          <div
            onClick={() => setActiveTab('pagamentos')}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
              student.currentMonthStatus === 'pago'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : student.currentMonthStatus === 'pendente'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {student.currentMonthStatus === 'pago' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : student.currentMonthStatus === 'pendente' ? (
              <Clock className="w-4 h-4 text-amber-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Mensalidade
              </div>
              <div className="capitalize font-black">
                {student.currentMonthStatus === 'pago'
                  ? 'Paga'
                  : student.currentMonthStatus === 'pendente'
                  ? 'Pendente'
                  : 'Em Atraso'}
              </div>
            </div>
          </div>

          {/* Next Class preview */}
          {schedule && (
            <div
              onClick={() => setActiveTab('horario')}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold">
                  Próxima Aula
                </div>
                <div className="font-black">
                  {schedule.startTime} ({schedule.durationMinutes}m)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PWA Install and Home Screen banner with direct action buttons */}
      <PWAInstallButton variant="banner" />

      {/* Main 3 Navigation Tabs requested by user */}
      <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          id="student-nav-horario"
          onClick={() => setActiveTab('horario')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'horario'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Horário Semanal</span>
        </button>

        <button
          id="student-nav-pagamentos"
          onClick={() => setActiveTab('pagamentos')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pagamentos'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Estado de Pagamento</span>
          {student.currentMonthStatus !== 'pago' && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          id="student-nav-materiais"
          onClick={() => setActiveTab('materiais')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'materiais'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>3. Material de Estudo</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {studentMaterialsCount}
          </span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'horario' && (
          <ScheduleView student={student} schedule={schedule} />
        )}

        {activeTab === 'pagamentos' && (
          <PaymentStatusView
            student={student}
            payments={payments}
            onNotifyPayment={onNotifyPayment}
          />
        )}

        {activeTab === 'materiais' && (
          <MaterialsView
            student={student}
            materials={materials}
            onToggleMaterialCompleted={onToggleMaterialCompleted}
            onOpenMetronomeAtBpm={onOpenMetronomeAtBpm}
          />
        )}
      </div>
    </div>
  );
};
