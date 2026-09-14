/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  ScheduleItem,
  PaymentRecord,
  StudyMaterial,
  PaymentStatus,
  UserAccount,
} from './types';
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredSchedules,
  saveStoredSchedules,
  getStoredPayments,
  saveStoredPayments,
  getStoredMaterials,
  saveStoredMaterials,
  getStoredCurrentStudentId,
  saveStoredCurrentStudentId,
  getStoredAccounts,
  saveStoredAccounts,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  saveStoredRememberedStudentId,
  resetToDefaults,
  isAuthorizedTeacherEmail,
  removeStudentFromStorage,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Metronome } from './components/Metronome';
import { AuthPortal } from './components/auth/AuthPortal';
import { BrandLogo } from './components/common/BrandLogo';
import { CheckCircle2, Music2, Info, Lock } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [mode, setMode] = useState<'aluno' | 'professor'>('aluno');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('student-1');

  // Metronome tool state
  const [isMetronomeOpen, setIsMetronomeOpen] = useState<boolean>(false);
  const [metronomeBpm, setMetronomeBpm] = useState<number>(90);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial load from storage
  useEffect(() => {
    const loadedStudents = getStoredStudents();
    const loadedSchedules = getStoredSchedules();
    const loadedPayments = getStoredPayments();
    const loadedMaterials = getStoredMaterials();
    const loadedAccounts = getStoredAccounts();
    const storedUser = getStoredCurrentUser();

    setStudents(loadedStudents);
    setSchedules(loadedSchedules);
    setPayments(loadedPayments);
    setMaterials(loadedMaterials);
    setAccounts(loadedAccounts);

    if (storedUser) {
      if (storedUser.role === 'professor' && !isAuthorizedTeacherEmail(storedUser.email)) {
        // Prevent unauthorized access to teacher area
        saveStoredCurrentUser(null);
        setCurrentUser(null);
        setMode('aluno');
      } else {
        setCurrentUser(storedUser);
        if (storedUser.role === 'professor') {
          setMode('professor');
        } else {
          setMode('aluno');
          if (storedUser.studentId) {
            setCurrentStudentId(storedUser.studentId);
          }
        }
      }
    } else {
      // Default: ask user to login or register
      setCurrentUser(null);
    }
  }, []);

  // Handle successful login or registration
  const handleLoginSuccess = (
    user: UserAccount,
    newStudents?: Student[],
    newSchedules?: ScheduleItem[],
    newPayments?: PaymentRecord[],
  ) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);

    if (newStudents) {
      setStudents(newStudents);
      saveStoredStudents(newStudents);
    }
    if (newSchedules) {
      setSchedules(newSchedules);
      saveStoredSchedules(newSchedules);
    }
    if (newPayments) {
      setPayments(newPayments);
      saveStoredPayments(newPayments);
    }

    if (user.role === 'professor') {
      setMode('professor');
      showToast(`Bem-vindo, ${user.name}! Painel do Professor ativo.`);
    } else {
      setMode('aluno');
      if (user.studentId) {
        setCurrentStudentId(user.studentId);
        saveStoredCurrentStudentId(user.studentId);
        saveStoredRememberedStudentId(user.studentId);
      }
      showToast(`Bem-vindo, ${user.name}! Acesso à tua área pessoal.`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    setMode('aluno');
    showToast('Sessão terminada com sucesso.');
  };

  // Update current student (Teacher only)
  const handleStudentChange = (id: string) => {
    if (currentUser?.role !== 'professor') return; // Students cannot change student
    setCurrentStudentId(id);
    saveStoredCurrentStudentId(id);
  };

  // Mode change (Teacher only can switch modes)
  const handleModeChange = (newMode: 'aluno' | 'professor') => {
    if (currentUser?.role !== 'professor' && newMode === 'professor') {
      showToast('Apenas o professor tem acesso ao painel de gestão.');
      return;
    }
    setMode(newMode);
  };

  // If student is logged in, their student object is strictly their own
  const currentStudent = currentUser?.role === 'aluno'
    ? students.find((s) => s.id === currentUser.studentId || s.email.toLowerCase() === currentUser.email.toLowerCase()) || students[0]
    : students.find((s) => s.id === currentStudentId) || students[0];

  const currentSchedule = schedules.find((s) => s.studentId === currentStudent?.id);

  // Filter payments strictly: if student, only their payments
  const visiblePaymentsForStudent = payments.filter((p) => p.studentId === currentStudent?.id);

  // Filter materials strictly: if student, only their materials or instrument materials
  const visibleMaterialsForStudent = materials.filter(
    (m) =>
      m.studentId === currentStudent?.id ||
      m.studentId === 'all' ||
      (currentStudent && m.instrument === currentStudent.instrument),
  );

  // Student marks payment as sent / notified
  const handleNotifyPayment = (paymentId: string, method: string, notes: string) => {
    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'pago' as PaymentStatus,
          paymentMethod: method as 'MB WAY' | 'Transferência Bancária' | 'Dinheiro',
          paidDate: new Date().toISOString().split('T')[0],
          notes: notes,
          receiptCode: `REC-${Date.now().toString().slice(-6)}`,
        };
      }
      return p;
    });

    // Update student month status
    const updatedStudents = students.map((s) => {
      if (s.id === currentStudent?.id) {
        return {
          ...s,
          currentMonthStatus: 'pago' as PaymentStatus,
        };
      }
      return s;
    });

    setPayments(updatedPayments);
    setStudents(updatedStudents);
    saveStoredPayments(updatedPayments);
    saveStoredStudents(updatedStudents);
    showToast(`Obrigado! O pagamento via ${method} foi registado com sucesso.`);
  };

  // Teacher updates payment status
  const handleUpdatePaymentStatus = (
    paymentId: string,
    status: PaymentStatus,
    method?: string,
  ) => {
    let affectedStudentId: string | undefined;

    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        affectedStudentId = p.studentId;
        return {
          ...p,
          status: status,
          paymentMethod: (method as 'MB WAY') || p.paymentMethod || 'MB WAY',
          paidDate: status === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return p;
    });

    const updatedStudents = students.map((s) => {
      if (s.id === affectedStudentId) {
        return {
          ...s,
          currentMonthStatus: status,
        };
      }
      return s;
    });

    setPayments(updatedPayments);
    setStudents(updatedStudents);
    saveStoredPayments(updatedPayments);
    saveStoredStudents(updatedStudents);
    showToast(`Estado de pagamento atualizado para: ${status.toUpperCase()}`);
  };

  // Teacher adds new student and schedule
  const handleAddStudent = (newStudent: Student, newSchedule: ScheduleItem) => {
    const updatedStudents = [newStudent, ...students];
    const updatedSchedules = [...schedules, newSchedule];

    // Create initial payment for the student
    const initialPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: newStudent.id,
      title: `Mensalidade ${newStudent.currentMonthName}`,
      type: newStudent.paymentPlan === 'mensal' ? 'mensalidade' : 'aula_avulso',
      amount: newStudent.paymentPlan === 'mensal' ? (newStudent.monthlyFee || 75) : 22,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pendente',
      notes: 'Mensalidade inicial do novo aluno.',
    };

    const updatedPayments = [initialPayment, ...payments];

    // Also register an account for this student if needed
    const newStudentAccount: UserAccount = {
      id: `acc-${newStudent.id}`,
      email: newStudent.email.toLowerCase(),
      name: newStudent.name,
      role: 'aluno',
      studentId: newStudent.id,
      instrument: newStudent.instrument,
      phone: newStudent.phone,
      avatarUrl: newStudent.avatarUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedAccounts = [newStudentAccount, ...accounts];

    setStudents(updatedStudents);
    setSchedules(updatedSchedules);
    setPayments(updatedPayments);
    setAccounts(updatedAccounts);
    saveStoredStudents(updatedStudents);
    saveStoredSchedules(updatedSchedules);
    saveStoredPayments(updatedPayments);
    saveStoredAccounts(updatedAccounts);

    showToast(`Aluno ${newStudent.name} registado com sucesso!`);
  };

  // Update existing student details (from student or teacher portal)
  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    saveStoredStudents(updated);

    // Synchronize account if exists
    const updatedAccounts = accounts.map((a) => {
      if (a.studentId === updatedStudent.id || (a.email && a.email.toLowerCase() === updatedStudent.email.toLowerCase())) {
        return {
          ...a,
          name: updatedStudent.name,
          email: updatedStudent.email.toLowerCase(),
          phone: updatedStudent.phone,
          instrument: updatedStudent.instrument,
        };
      }
      return a;
    });
    setAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);

    // Synchronize current session if it belongs to this student
    if (currentUser && (currentUser.studentId === updatedStudent.id || currentUser.email.toLowerCase() === updatedStudent.email.toLowerCase())) {
      const updatedUser = {
        ...currentUser,
        name: updatedStudent.name,
        email: updatedStudent.email.toLowerCase(),
        phone: updatedStudent.phone,
        instrument: updatedStudent.instrument,
      };
      setCurrentUser(updatedUser);
      saveStoredCurrentUser(updatedUser);
    }

    showToast(`Dados de ${updatedStudent.name} atualizados com sucesso!`);
  };

  // Update or assign schedule (from student or teacher portal)
  const handleUpdateSchedule = (updatedSch: ScheduleItem) => {
    const exists = schedules.some((s) => s.id === updatedSch.id || s.studentId === updatedSch.studentId);
    const updated = exists
      ? schedules.map((s) => (s.id === updatedSch.id || s.studentId === updatedSch.studentId ? updatedSch : s))
      : [...schedules, updatedSch];

    setSchedules(updated);
    saveStoredSchedules(updated);
    showToast('Horário da aula atualizado com sucesso!');
  };

  // Teacher removes a student who is no longer taking classes
  const handleRemoveStudent = (studentId: string) => {
    const studentToRemove = students.find((s) => s.id === studentId);
    const studentName = studentToRemove?.name || 'Aluno';

    const result = removeStudentFromStorage(
      studentId,
      students,
      schedules,
      payments,
      materials,
      accounts,
    );

    setStudents(result.updatedStudents);
    setSchedules(result.updatedSchedules);
    setPayments(result.updatedPayments);
    setMaterials(result.updatedMaterials);
    setAccounts(result.updatedAccounts);

    // If current selected student was removed, select the first available one
    if (currentStudentId === studentId) {
      const nextStudent = result.updatedStudents[0];
      if (nextStudent) {
        setCurrentStudentId(nextStudent.id);
        saveStoredCurrentStudentId(nextStudent.id);
      }
    }

    // If current logged-in user was this student, logout
    if (currentUser?.studentId === studentId) {
      setCurrentUser(null);
      saveStoredCurrentUser(null);
      setMode('aluno');
    }

    showToast(`O aluno "${studentName}" foi removido do sistema.`);
  };

  // Teacher adds new study material
  const handleAddMaterial = (newMaterial: StudyMaterial) => {
    const updatedMaterials = [newMaterial, ...materials];
    setMaterials(updatedMaterials);
    saveStoredMaterials(updatedMaterials);
    showToast(`Material "${newMaterial.title}" enviado com sucesso!`);
  };

  // Teacher deletes study material
  const handleDeleteMaterial = (materialId: string) => {
    const updatedMaterials = materials.filter((m) => m.id !== materialId);
    setMaterials(updatedMaterials);
    saveStoredMaterials(updatedMaterials);
    showToast('Material removido.');
  };

  // Student marks material as completed / practiced
  const handleToggleMaterialCompleted = (materialId: string) => {
    const updatedMaterials = materials.map((m) => {
      if (m.id === materialId) {
        return {
          ...m,
          isCompleted: !m.isCompleted,
        };
      }
      return m;
    });
    setMaterials(updatedMaterials);
    saveStoredMaterials(updatedMaterials);
  };

  // Open Metronome at a given BPM from material card
  const handleOpenMetronomeAtBpm = (bpm: number) => {
    setMetronomeBpm(bpm);
    setIsMetronomeOpen(true);
    showToast(`Metrónomo ajustado para ${bpm} BPM.`);
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Desejas restaurar os dados de demonstração iniciais?')) {
      resetToDefaults();
      setStudents(getStoredStudents());
      setSchedules(getStoredSchedules());
      setPayments(getStoredPayments());
      setMaterials(getStoredMaterials());
      setAccounts(getStoredAccounts());
      setCurrentStudentId('student-1');
      setCurrentUser(null);
      saveStoredCurrentUser(null);
      showToast('Dados restaurados para o padrão original.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onModeChange={handleModeChange}
        students={students}
        currentStudent={currentStudent}
        onStudentChange={handleStudentChange}
        isMetronomeOpen={isMetronomeOpen}
        onToggleMetronome={() => setIsMetronomeOpen(!isMetronomeOpen)}
        onResetData={handleResetData}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setCurrentUser(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          /* When NOT logged in: Show the Auth & Registration Portal */
          <AuthPortal
            accounts={accounts}
            students={students}
            schedules={schedules}
            payments={payments}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : mode === 'aluno' ? (
          /* Student Portal (strictly isolated to current student) */
          currentStudent ? (
            <StudentPortal
              student={currentStudent}
              schedule={currentSchedule}
              payments={visiblePaymentsForStudent}
              materials={visibleMaterialsForStudent}
              onNotifyPayment={handleNotifyPayment}
              onToggleMaterialCompleted={handleToggleMaterialCompleted}
              onOpenMetronomeAtBpm={handleOpenMetronomeAtBpm}
              onUpdateStudent={handleUpdateStudent}
              onUpdateSchedule={handleUpdateSchedule}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <Music2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">
                Perfil de aluno não encontrado.
              </p>
            </div>
          )
        ) : (
          /* Teacher Dashboard (Full Access, only if Teacher) */
          currentUser.role === 'professor' ? (
            <TeacherDashboard
              students={students}
              schedules={schedules}
              payments={payments}
              materials={materials}
              onAddStudent={handleAddStudent}
              onRemoveStudent={handleRemoveStudent}
              onUpdateStudent={handleUpdateStudent}
              onUpdateSchedule={handleUpdateSchedule}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onAddPayment={(newPayment) => {
                const updated = [newPayment, ...payments];
                setPayments(updated);
                saveStoredPayments(updated);
                showToast('Novo pagamento registado!');
              }}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onSelectStudentView={(stId) => {
                setCurrentStudentId(stId);
                setMode('aluno');
              }}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
              <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 mb-1">Acesso Restrito</h2>
              <p className="text-xs text-slate-600 mb-4">
                Apenas o professor tem autorização para aceder aos dados e gestão dos alunos.
              </p>
              <button
                onClick={() => setMode('aluno')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Voltar à Minha Área
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Metronome Tool */}
      <Metronome
        isOpen={isMetronomeOpen}
        initialBpm={metronomeBpm}
        onClose={() => setIsMetronomeOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold animate-fade-in transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="xs" showBorder={false} className="w-6 h-6 shadow-xs" />
            <span className="font-semibold text-slate-700">
              A Voz da Guitarra • Portal do Aluno & Gestão Pedagógica
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Horário Semanal</span>
            <span>•</span>
            <span>Controlo de Pagamentos</span>
            <span>•</span>
            <span>Materiais de Estudo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

