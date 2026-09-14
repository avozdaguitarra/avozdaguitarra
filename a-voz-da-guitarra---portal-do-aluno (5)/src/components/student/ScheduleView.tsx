import React from 'react';
import { Student, ScheduleItem } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  UserCheck,
  Sparkles,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react';

interface ScheduleViewProps {
  student: Student;
  schedule?: ScheduleItem;
  onOpenEdit?: (tab?: 'horario' | 'perfil') => void;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  student,
  schedule,
  onOpenEdit,
}) => {
  // Generate a basic .ics calendar file download for the student
  const handleDownloadCalendar = () => {
    if (!schedule) return;

    const dayName = DAYS_OF_WEEK[schedule.dayOfWeek];
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Portal do Aluno de Música//Aulas Semanais//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Aula de ${student.instrument} - ${student.name}
DESCRIPTION:Aula semanal com ${schedule.teacherName}. Foco: ${schedule.focusArea || 'Prática instrumental'}. Local/Link: ${schedule.locationOrLink}
LOCATION:${schedule.roomName} (${schedule.locationOrLink})
STATUS:CONFIRMED
RRULE:FREQ=WEEKLY
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aula_${student.instrument.replace(/\s+/g, '_')}_${dayName}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="student-schedule-view" className="space-y-6">
      {/* Next upcoming class highlight banner */}
      {schedule ? (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          {/* Subtle decorative background wave */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Próxima Aula Semanal</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {DAYS_OF_WEEK[schedule.dayOfWeek]}, às {schedule.startTime}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Duração: <strong>{schedule.durationMinutes} minutos</strong>
                </span>

                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  {schedule.teacherName}
                </span>

                <span className="flex items-center gap-1.5">
                  {schedule.modality === 'presencial' ? (
                    <>
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-200">Presencial</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-200">Online</span>
                    </>
                  )}
                </span>
              </div>

              {schedule.focusArea && (
                <div className="pt-2">
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                    <span className="font-bold text-amber-300">Foco desta semana: </span>
                    {schedule.focusArea}
                  </div>
                </div>
              )}
            </div>

            {/* Actions for next class */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
              {schedule.modality === 'online' ? (
                <a
                  id="join-online-class-btn"
                  href={schedule.locationOrLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                >
                  <Video className="w-4 h-4" />
                  Entrar na Aula Online
                </a>
              ) : (
                <div className="p-3 bg-white/10 rounded-xl text-xs border border-white/10">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {schedule.roomName}
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    {schedule.locationOrLink}
                  </div>
                </div>
              )}

              <button
                id="export-calendar-btn"
                onClick={handleDownloadCalendar}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Adicionar ao Calendário (.ics)
              </button>

              {onOpenEdit && (
                <button
                  id="student-edit-schedule-banner-btn"
                  onClick={() => onOpenEdit('horario')}
                  className="px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 hover:text-white font-bold rounded-xl border border-indigo-400/40 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Editar Horário da Aula</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-950 text-base mb-1">Sem horário semanal atribuído</h4>
            <p className="text-xs text-amber-800">
              Podes configurar e escolher o teu horário semanal habitual agora mesmo ou aguardar pela marcação.
            </p>
          </div>
          {onOpenEdit && (
            <button
              id="student-setup-schedule-btn"
              onClick={() => onOpenEdit('horario')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Configurar Horário</span>
            </button>
          )}
        </div>
      )}

      {/* Weekly Grid View */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Horário Semanal Regular</h3>
            <p className="text-xs text-slate-500">
              Distribuição semanal das tuas aulas de {student.instrument}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                id="student-edit-weekly-schedule-btn"
                onClick={() => onOpenEdit('horario')}
                className="text-xs font-bold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Editar Horário</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl">
              Semana Letiva
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const isLessonDay = schedule && schedule.dayOfWeek === dayIndex;

            return (
              <div
                key={dayIndex}
                className={`rounded-2xl p-4 border transition-all ${
                  isLessonDay
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/50 border-slate-200/70 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold ${
                      isLessonDay ? 'text-indigo-900' : 'text-slate-600'
                    }`}
                  >
                    {dayName.split('-')[0]}
                  </span>
                  {isLessonDay && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>

                {isLessonDay ? (
                  <div className="space-y-2 mt-2">
                    <div className="inline-block px-2 py-0.5 bg-indigo-600 text-white rounded-md text-xs font-mono font-bold">
                      {schedule.startTime}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {student.instrument}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {schedule.durationMinutes} min • {schedule.modality}
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic mt-3">
                    Sem aula agendada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Recommendations */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          Dicas para a tua aula semanal
        </h4>
        <ul className="text-xs text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Pontualidade:</strong> Chega 5 minutos antes para afinar o teu instrumento (ou testar câmara e microfone se for aula online).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Material de estudo:</strong> Consulta a aba de materiais para rever as partituras, tablaturas e o áudio da semana.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Avisos de faltas:</strong> Comunica qualquer impedimento com pelo menos 24 horas de antecedência para remarcação.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
