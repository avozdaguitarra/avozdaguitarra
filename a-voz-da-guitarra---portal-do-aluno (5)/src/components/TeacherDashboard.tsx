import React, { useState } from 'react';
import {
  Student,
  ScheduleItem,
  PaymentRecord,
  StudyMaterial,
  InstrumentType,
  PaymentPlanType,
  PaymentStatus,
  ModalityType,
  MaterialCategory,
} from '../types';
import {
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  Video,
  MapPin,
  Music,
  Send,
  Sparkles,
  Search,
  DollarSign,
  Sliders,
  Key,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { analyzeDueDate } from '../utils/paymentUtils';
import { PaymentsManagementView } from './teacher/PaymentsManagementView';
import { TeacherPricingInstruments } from './teacher/TeacherPricingInstruments';
import { TeacherSecuritySettings } from './teacher/TeacherSecuritySettings';
import { getStoredTeacherSettings } from '../utils/storage';
import { EditStudentOptionsModal } from './student/EditStudentOptionsModal';

interface TeacherDashboardProps {
  students: Student[];
  schedules: ScheduleItem[];
  payments: PaymentRecord[];
  materials: StudyMaterial[];
  onAddStudent: (student: Student, schedule: ScheduleItem) => void;
  onRemoveStudent: (studentId: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdatePaymentStatus: (paymentId: string, status: PaymentStatus, method?: string) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onAddMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onUpdateSchedule: (schedule: ScheduleItem) => void;
  onSelectStudentView: (studentId: string) => void;
}

const INSTRUMENT_OPTIONS: InstrumentType[] = [
  'Guitarra Clássica',
  'Piano',
  'Ukulele',
  'Guitarra Portuguesa',
];

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  schedules,
  payments,
  materials,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudent,
  onUpdatePaymentStatus,
  onAddPayment,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateSchedule,
  onSelectStudentView,
}) => {
  const teacherSettings = getStoredTeacherSettings();
  const [activeTab, setActiveTab] = useState<
    'alunos' | 'horarios' | 'pagamentos' | 'materiais' | 'precos_instrumentos' | 'seguranca'
  >('alunos');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Student deletion modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Student & Schedule editing modal state
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editModalInitialTab, setEditModalInitialTab] = useState<'horario' | 'perfil'>('horario');

  // New student modal state
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [newStudentInstrument, setNewStudentInstrument] = useState<InstrumentType>(
    (teacherSettings.mainInstrument as InstrumentType) || 'Guitarra Clássica',
  );
  const [newStudentLevel, setNewStudentLevel] = useState<'Iniciante' | 'Intermédio' | 'Avançado'>('Iniciante');
  const [newStudentPlan, setNewStudentPlan] = useState<PaymentPlanType>('mensal');
  const [newStudentFee, setNewStudentFee] = useState<number>(teacherSettings.defaultMonthlyFee || 75);
  const [newStudentDay, setNewStudentDay] = useState<number>(2);
  const [newStudentTime, setNewStudentTime] = useState<string>('16:00');
  const [newStudentDuration, setNewStudentDuration] = useState<number>(teacherSettings.lessonDurationMinutes || 60);
  const [newStudentModality, setNewStudentModality] = useState<ModalityType>('presencial');
  const [newStudentRoom, setNewStudentRoom] = useState<string>('Sala 6 (1º Andar)');

  // New material modal state
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState<boolean>(false);
  const [matTargetStudentId, setMatTargetStudentId] = useState<string>('all');
  const [matInstrument, setMatInstrument] = useState<InstrumentType>('Guitarra Clássica');
  const [matTitle, setMatTitle] = useState<string>('');
  const [matCategory, setMatCategory] = useState<MaterialCategory>('partitura');
  const [matDescription, setMatDescription] = useState<string>('');
  const [matBpm, setMatBpm] = useState<string>('80');
  const [matKey, setMatKey] = useState<string>('Lá menor (Am)');
  const [matUrl, setMatUrl] = useState<string>('');
  const [matText, setMatText] = useState<string>('');
  const [matNotes, setMatNotes] = useState<string>('');

  // Calculate metrics
  const totalPaidRevenue = payments
    .filter((p) => p.status === 'pago')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendingRevenue = payments
    .filter((p) => p.status !== 'pago')
    .reduce((acc, p) => acc + p.amount, 0);

  const overduePayments = payments.filter(
    (p) => analyzeDueDate(p.dueDate, p.status).isOverdue,
  );
  const dueSoonPayments = payments.filter(
    (p) => analyzeDueDate(p.dueDate, p.status).isDueSoon,
  );
  const totalAlertCount = overduePayments.length + dueSoonPayments.length;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = `student-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      name: newStudentName,
      email: newStudentEmail,
      phone: newStudentPhone,
      instrument: newStudentInstrument,
      level: newStudentLevel,
      paymentPlan: newStudentPlan,
      monthlyFee: newStudentPlan === 'mensal' ? newStudentFee : 75,
      perLessonFee: newStudentPlan === 'por_aula' ? newStudentFee : 22,
      currentMonthStatus: 'pendente',
      currentMonthName: 'Março 2026',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    const newSchedule: ScheduleItem = {
      id: `sch-${Date.now()}`,
      studentId: studentId,
      dayOfWeek: Number(newStudentDay),
      startTime: newStudentTime,
      durationMinutes: Number(newStudentDuration),
      modality: newStudentModality,
      roomName: newStudentRoom,
      locationOrLink:
        newStudentModality === 'online'
          ? 'https://meet.google.com/voz-guitarra-aula'
          : (teacherSettings.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga'),
      teacherName: teacherSettings.teacherName || 'Prof. Sérgio Gomes',
      focusArea: `Início de estudos em ${newStudentInstrument}`,
    };

    onAddStudent(newStudent, newSchedule);
    setIsNewStudentModalOpen(false);
    // Reset form
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPhone('');
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      studentId: matTargetStudentId,
      instrument: matInstrument,
      title: matTitle,
      category: matCategory,
      description: matDescription,
      targetBpm: matBpm ? Number(matBpm) : undefined,
      keySignature: matKey || undefined,
      fileType: matCategory === 'audio_playalong' ? 'audio' : matText ? 'tab' : 'pdf',
      contentUrl: matUrl || undefined,
      textContent: matText || undefined,
      teacherNotes: matNotes || undefined,
      assignedDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
    };

    onAddMaterial(newMat);
    setIsNewMaterialModalOpen(false);
    // Reset
    setMatTitle('');
    setMatDescription('');
    setMatText('');
    setMatUrl('');
    setMatNotes('');
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.instrument.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  return (
    <div id="teacher-dashboard" className="space-y-6">
      {/* Studio Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Alunos
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {students.length}
            </div>
            <span className="text-[11px] text-slate-500">Inscritos ativos</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Receita Liquidada
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              {totalPaidRevenue.toFixed(2)} €
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Pagamentos recebidos</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valores Pendentes
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">
              {totalPendingRevenue.toFixed(2)} €
            </div>
            <span className="text-[11px] text-amber-600 font-medium">Aguardam liquidação</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('pagamentos')}
          className={`rounded-3xl p-5 border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${
            totalAlertCount > 0
              ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300 ring-1 ring-rose-300/40'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              totalAlertCount > 0
                ? 'bg-rose-600 text-white'
                : 'bg-purple-50 text-purple-700'
            }`}
          >
            {totalAlertCount > 0 ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {totalAlertCount > 0 ? 'Vencimentos em Alerta' : 'Materiais Ativos'}
            </span>
            <div
              className={`text-2xl font-black mt-0.5 ${
                totalAlertCount > 0 ? 'text-rose-900' : 'text-purple-900'
              }`}
            >
              {totalAlertCount > 0 ? totalAlertCount : materials.length}
            </div>
            <span
              className={`text-[11px] ${
                totalAlertCount > 0
                  ? 'text-rose-700 font-bold'
                  : 'text-slate-500'
              }`}
            >
              {totalAlertCount > 0
                ? `${overduePayments.length} ultrapassadas • ${dueSoonPayments.length} a vencer`
                : 'Partituras, tabs & áudios'}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Notification Banner if payments need attention */}
      {totalAlertCount > 0 && (
        <div
          onClick={() => setActiveTab('pagamentos')}
          className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 hover:border-rose-300 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-800">
              <span className="font-bold text-slate-900">
                Atenção às Mensalidades:
              </span>{' '}
              Existem {totalAlertCount} pagamentos com data de vencimento próxima ou já ultrapassada.
              {overduePayments.length > 0 && (
                <span className="ml-1 text-rose-700 font-bold">
                  ({overduePayments.length} ultrapassada{overduePayments.length > 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 hover:text-indigo-900 shrink-0 underline">
            Ver na Lista &rarr;
          </span>
        </div>
      )}

      {/* Tabs for Teacher Management */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          id="teacher-tab-alunos"
          onClick={() => setActiveTab('alunos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'alunos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alunos ({students.length})</span>
        </button>

        <button
          id="teacher-tab-horarios"
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'horarios'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Grelha de Horários ({schedules.length})</span>
        </button>

        <button
          id="teacher-tab-pagamentos"
          onClick={() => setActiveTab('pagamentos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'pagamentos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Gestão de Pagamentos ({payments.length})</span>
          {totalAlertCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse">
              {totalAlertCount} em alerta
            </span>
          )}
        </button>

        <button
          id="teacher-tab-materiais"
          onClick={() => setActiveTab('materiais')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'materiais'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Enviar Material de Estudo</span>
        </button>

        <button
          id="teacher-tab-precos"
          onClick={() => setActiveTab('precos_instrumentos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'precos_instrumentos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preços & Instrumentos</span>
        </button>

        <button
          id="teacher-tab-seguranca"
          onClick={() => setActiveTab('seguranca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'seguranca'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Segurança & Palavra-passe</span>
        </button>
      </div>

      {/* TAB 1: ALUNOS (STUDENTS) */}
      {activeTab === 'alunos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Pesquisar aluno ou instrumento..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              id="teacher-add-student-btn"
              onClick={() => setIsNewStudentModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Novo Aluno & Horário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">Aluno</th>
                  <th className="pb-3 px-4">Instrumento / Nível</th>
                  <th className="pb-3 px-4">Horário Semanal</th>
                  <th className="pb-3 px-4">Plano & Valor</th>
                  <th className="pb-3 px-4">Estado Mensal</th>
                  <th className="pb-3 pl-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const studentSchedule = schedules.find((s) => s.studentId === st.id);
                  const studentPayment = payments.find((p) => p.studentId === st.id);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {st.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {st.email} • {st.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instrument */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {st.instrument}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {st.level}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4">
                        {studentSchedule ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {DAYS_OF_WEEK[studentSchedule.dayOfWeek]} às {studentSchedule.startTime}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {studentSchedule.durationMinutes} min • {studentSchedule.modality}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Por agendar</span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {st.paymentPlan === 'mensal'
                            ? `${st.monthlyFee.toFixed(2)} €/mês`
                            : `${st.perLessonFee.toFixed(2)} €/aula`}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {st.paymentPlan.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Payment Status Switcher & Due Date Indicator */}
                      <td className="py-4 px-4">
                        <select
                          value={st.currentMonthStatus}
                          onChange={(e) => {
                            if (studentPayment) {
                              onUpdatePaymentStatus(
                                studentPayment.id,
                                e.target.value as PaymentStatus,
                              );
                            }
                          }}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                            st.currentMonthStatus === 'pago'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : st.currentMonthStatus === 'pendente'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="pago">✅ Pago</option>
                          <option value="pendente">⏳ Pendente</option>
                          <option value="atrasado">⚠️ Atrasado</option>
                        </select>

                        {/* Due date urgency badge */}
                        {studentPayment && (() => {
                          const analysis = analyzeDueDate(studentPayment.dueDate, studentPayment.status);
                          if (analysis.isOverdue) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 mt-1 block">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                {analysis.badgeShort}
                              </span>
                            );
                          }
                          if (analysis.isDueSoon) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-1 block">
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                {analysis.badgeShort}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </td>

                      {/* Fast actions */}
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            id={`teacher-edit-student-${st.id}-btn`}
                            onClick={() => {
                              setStudentToEdit(st);
                              setEditModalInitialTab('horario');
                            }}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Editar Horário e Opções do Aluno"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            id={`teacher-view-student-${st.id}-btn`}
                            onClick={() => onSelectStudentView(st.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Abrir o Portal do Aluno"
                          >
                            Portal
                          </button>

                          <button
                            id={`teacher-delete-student-${st.id}-btn`}
                            onClick={() => setStudentToDelete(st)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Remover aluno que já não frequenta as aulas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HORÁRIOS (SCHEDULES) */}
      {activeTab === 'horarios' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Grelha Semanal de Aulas do Estúdio
              </h3>
              <p className="text-xs text-slate-500">
                Visualização semanal das aulas individuais e salas ocupadas
              </p>
            </div>
            <button
              onClick={() => setIsNewStudentModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Horário
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySchedules = schedules.filter((s) => s.dayOfWeek === dayIndex);

              return (
                <div
                  key={dayIndex}
                  className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200 flex flex-col min-h-[300px]"
                >
                  <div className="font-bold text-xs text-slate-800 pb-2 mb-2 border-b border-slate-200 flex items-center justify-between">
                    <span>{dayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {daySchedules.length} aulas
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((sch) => {
                        const student = students.find((s) => s.id === sch.studentId);
                        return (
                          <div
                            key={sch.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-indigo-700">
                                {sch.startTime}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {sch.durationMinutes}m
                              </span>
                            </div>

                            <div className="font-bold text-xs text-slate-900 truncate">
                              {student?.name || 'Aluno'}
                            </div>

                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <Music className="w-2.5 h-2.5 text-indigo-500" />
                              {student?.instrument}
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              {sch.modality === 'online' ? (
                                <>
                                  <Video className="w-2.5 h-2.5 text-cyan-500" />
                                  Online
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                                  {sch.roomName}
                                </>
                              )}
                            </div>

                            <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                              <button
                                onClick={() => {
                                  if (student) {
                                    setStudentToEdit(student);
                                    setEditModalInitialTab('horario');
                                  }
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer py-0.5 px-1 hover:bg-indigo-50 rounded"
                                title="Editar Horário"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Editar</span>
                              </button>
                              {student && (
                                <button
                                  onClick={() => onSelectStudentView(student.id)}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer py-0.5 px-1 hover:bg-slate-100 rounded"
                                  title="Ver Portal Aluno"
                                >
                                  Portal
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                        Sem aulas
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAGAMENTOS (PAYMENTS WITH DUE DATE HIGHLIGHTS) */}
      {activeTab === 'pagamentos' && (
        <PaymentsManagementView
          students={students}
          payments={payments}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
          onSelectStudentView={onSelectStudentView}
        />
      )}

      {/* TAB 4: ENVIAR MATERIAL (STUDY MATERIALS) */}
      {activeTab === 'materiais' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Materiais Enviados para Estudo
              </h3>
              <p className="text-xs text-slate-500">
                Atribui partituras, tablaturas, faixas de áudio e exercícios para os teus alunos praticarem em casa
              </p>
            </div>

            <button
              id="teacher-add-material-btn"
              onClick={() => setIsNewMaterialModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Enviar Novo Material
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => {
              const targetStudent = students.find((s) => s.id === m.studentId);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {m.category.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => onDeleteMaterial(m.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Eliminar material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {m.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] mt-2">
                      <span className="font-semibold text-slate-700">
                        {m.instrument}
                      </span>
                      {m.targetBpm && (
                        <span className="text-amber-700 font-mono">
                          • {m.targetBpm} BPM
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Destinatário: <strong>{targetStudent ? targetStudent.name : 'Todos'}</strong>
                    </span>
                    <span>{new Date(m.assignedDate).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PREÇOS & INSTRUMENTOS */}
      {activeTab === 'precos_instrumentos' && (
        <TeacherPricingInstruments />
      )}

      {/* TAB 6: SEGURANÇA & PALAVRA-PASSE */}
      {activeTab === 'seguranca' && (
        <TeacherSecuritySettings />
      )}

      {/* Modal: New Student & Schedule */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Registar Novo Aluno & Horário Semanal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configura o instrumento, plano de pagamento e reserva da vaga semanal.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: João Pereira"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instrumento
                  </label>
                  <select
                    value={newStudentInstrument}
                    onChange={(e) => setNewStudentInstrument(e.target.value as InstrumentType)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  >
                    {INSTRUMENT_OPTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="joao@exemplo.pt"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telemóvel
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+351 912 345 678"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nível
                  </label>
                  <select
                    value={newStudentLevel}
                    onChange={(e) => setNewStudentLevel(e.target.value as 'Iniciante' | 'Intermédio' | 'Avançado')}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermédio">Intermédio</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Plano de Pagamento
                  </label>
                  <select
                    value={newStudentPlan}
                    onChange={(e) => setNewStudentPlan(e.target.value as PaymentPlanType)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="mensal">Mensalidade Fixa</option>
                    <option value="por_aula">Pagamento por Aula</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor (€)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newStudentFee}
                    onChange={(e) => setNewStudentFee(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Schedule definition */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                  📅 Horário Semanal do Aluno
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Dia da Semana</label>
                    <select
                      value={newStudentDay}
                      onChange={(e) => setNewStudentDay(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                    >
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <option key={idx} value={idx}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Hora de Início</label>
                    <input
                      type="time"
                      value={newStudentTime}
                      onChange={(e) => setNewStudentTime(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Duração (Min)</label>
                    <input
                      type="number"
                      step="5"
                      value={newStudentDuration}
                      onChange={(e) => setNewStudentDuration(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Modalidade</label>
                    <select
                      value={newStudentModality}
                      onChange={(e) => setNewStudentModality(e.target.value as ModalityType)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    >
                      <option value="presencial">Presencial no Estúdio</option>
                      <option value="online">Online (Videochamada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Sala / Link</label>
                    <input
                      type="text"
                      value={newStudentRoom}
                      onChange={(e) => setNewStudentRoom(e.target.value)}
                      placeholder="Ex: Estúdio 2 ou link do Meet"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  Registar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Study Material */}
      {isNewMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Enviar Material de Estudo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Atribui partituras, tablaturas, faixas de áudio ou exercícios com orientações específicas.
            </p>

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destinatário
                  </label>
                  <select
                    value={matTargetStudentId}
                    onChange={(e) => setMatTargetStudentId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    <option value="all">Todos os Alunos do Instrumento</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.instrument})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instrumento
                  </label>
                  <select
                    value={matInstrument}
                    onChange={(e) => setMatInstrument(e.target.value as InstrumentType)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    {INSTRUMENT_OPTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Título da Peça ou Exercício
                  </label>
                  <input
                    type="text"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Ex: Estudo de Arpejos em Lá Menor"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value as MaterialCategory)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="partitura">Partitura</option>
                    <option value="tablatura">Tablatura / Cifra</option>
                    <option value="audio_playalong">Áudio Playalong / Backing Track</option>
                    <option value="exercicio">Exercício Técnico</option>
                    <option value="teoria">Teoria & Harmonia</option>
                    <option value="video_aula">Vídeo Aula</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição / Objetivo
                </label>
                <input
                  type="text"
                  required
                  value={matDescription}
                  onChange={(e) => setMatDescription(e.target.value)}
                  placeholder="Ex: Treino de agilidade para os dedos da mão direita e sincronismo."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Velocidade Alvo (BPM)
                  </label>
                  <input
                    type="number"
                    value={matBpm}
                    onChange={(e) => setMatBpm(e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tonalidade / Compasso
                  </label>
                  <input
                    type="text"
                    value={matKey}
                    onChange={(e) => setMatKey(e.target.value)}
                    placeholder="Ex: Sol Maior (G), 4/4"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Link para PDF ou Ficheiro Áudio (opcional)
                </label>
                <input
                  type="url"
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  placeholder="https://exemplo.com/partitura.pdf ou ficheiro áudio"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Texto da Tablatura / Cifra / Acordes (opcional)
                </label>
                <textarea
                  rows={4}
                  value={matText}
                  onChange={(e) => setMatText(e.target.value)}
                  placeholder={`E|---0---0---|
B|---1---1---|
G|---2---2---|`}
                  className="w-full text-xs bg-slate-900 text-emerald-400 font-mono rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dica de Estudo do Professor
                </label>
                <textarea
                  rows={2}
                  value={matNotes}
                  onChange={(e) => setMatNotes(e.target.value)}
                  placeholder="Ex: Tocar compassos 1 a 8 lentamente. Não acelerar enquanto a mão esquerda tiver tensão."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Deletion Confirmation Modal */}
      {studentToDelete && (
        <div
          id="confirm-delete-student-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setStudentToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Remover Aluno das Aulas
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  Esta ação desvincula o aluno do estúdio
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={studentToDelete.avatarUrl}
                  alt={studentToDelete.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{studentToDelete.name}</div>
                  <div className="text-slate-500">{studentToDelete.instrument} • {studentToDelete.email}</div>
                </div>
              </div>
              <p className="text-slate-600 pt-2 border-t border-slate-200/80 leading-relaxed">
                Confirmas que <strong>{studentToDelete.name}</strong> já não é aluno? Ao remover, serão cancelados o horário semanal, os registos de aula e as credenciais de acesso associadas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                id="cancel-delete-student-btn"
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-student-btn"
                type="button"
                onClick={() => {
                  onRemoveStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Remover Aluno</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student and Schedule Modal */}
      {studentToEdit && (
        <EditStudentOptionsModal
          isOpen={true}
          onClose={() => setStudentToEdit(null)}
          student={studentToEdit}
          schedule={schedules.find((s) => s.studentId === studentToEdit.id)}
          initialTab={editModalInitialTab}
          onSave={(updatedStudent, updatedSchedule) => {
            if (onUpdateStudent) {
              onUpdateStudent(updatedStudent);
            }
            if (updatedSchedule) {
              onUpdateSchedule(updatedSchedule);
            }
            setStudentToEdit(null);
          }}
        />
      )}
    </div>
  );
};
