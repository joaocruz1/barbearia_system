import {
  Scissors,
  Star,
  Edit2,
  X,
  Check,
  Ban,
  Calendar,
  Trash2,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Appointment, Barber } from "@/lib/api";

interface AppointmentCalendarProps {
  currentDate: Date;
  weekDates: Date[];
  appointments: Appointment[] | null | undefined;
  barbers: Barber[] | null | undefined;
  appointmentsLoading: boolean;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
  onCreateAppointment: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  showBarberName?: boolean;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void>;
  onDeleteAppointment?: (appointmentId: string) => Promise<void>;
  onPermanentDeleteAppointment?: (appointmentId: string) => Promise<void>;
  onRescheduleAppointment?: (appointment: Appointment) => void;
  onCompleteAppointment?: (appointmentId: string, clientName: string) => Promise<void>;
} // Updated interface with onCompleteAppointment

// Generate time slots from 10:00 to 20:00 in 15-minute intervals (more practical for barbershops)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Format date for display
const formatDisplayDate = (date: Date) => {
  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${weekdays[date.getDay()]}, ${date.getDate()} ${
    months[date.getMonth()]
  }. ${date.getFullYear()}`;
};

// Get appointment color based on service type
const getAppointmentColor = (service: string, status: string) => {
  if (status === "cancelled") return "bg-red-200 border-red-300";
  if (status === "completed") return "bg-blue-200 border-blue-300";

  if (service.toLowerCase().includes("corte"))
    return "bg-green-200 border-green-300";
  if (service.toLowerCase().includes("barba"))
    return "bg-yellow-200 border-yellow-300";
  if (service.toLowerCase().includes("combo"))
    return "bg-purple-200 border-purple-300";
  if (service.toLowerCase().includes("avaliação"))
    return "bg-blue-200 border-blue-300";
  if (service.toLowerCase().includes("procedimento"))
    return "bg-orange-200 border-orange-300";
  return "bg-gray-200 border-gray-300";
};

export function AppointmentCalendar({
  currentDate,
  weekDates,
  appointments,
  barbers,
  appointmentsLoading,
  onNavigateWeek,
  onGoToToday,
  onCreateAppointment,
  statusFilter,
  onStatusFilterChange,
  showBarberName = false,
  onUpdateAppointment,
  onDeleteAppointment,
  onPermanentDeleteAppointment,
  onRescheduleAppointment,
  onCompleteAppointment,
}: AppointmentCalendarProps) {
  const [compactMode, setCompactMode] = useState(false);
  const [draggedAppointment, setDraggedAppointment] =
    useState<Appointment | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{
    date: Date;
    timeSlot: string;
  } | null>(null);
  // Função para normalizar horários (remover segundos se existirem)
  const normalizeTime = (time: string) => {
    return time.split(":").slice(0, 2).join(":");
  };

  // Função para converter string de data para Date local (evita problemas de timezone)
  const parseLocalDate = (dateInput: string | Date) => {
    try {
      // Se já é um objeto Date, usar diretamente
      if (dateInput instanceof Date) {
        return new Date(
          dateInput.getFullYear(),
          dateInput.getMonth(),
          dateInput.getDate()
        );
      }

      // Se é uma string, processar
      if (typeof dateInput === "string") {
        // Se é uma string ISO, extrair apenas a parte da data
        if (dateInput.includes("T")) {
          const datePart = dateInput.split("T")[0];
          const [year, month, day] = datePart.split("-").map(Number);
          return new Date(year, month - 1, day);
        }

        // Se é uma string no formato YYYY-MM-DD
        const [year, month, day] = dateInput.split("-").map(Number);
        return new Date(year, month - 1, day);
      }

      console.error("parseLocalDate - Invalid input type:", dateInput);
      return new Date();
    } catch (error) {
      console.error("parseLocalDate - Error:", error, "Input:", dateInput);
      return new Date();
    }
  };

  // Função para comparar datas (ignorando timezone)
  const compareDates = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() === d2.getTime();
  };

  // Filtrar horários apenas com agendamentos no modo compacto
  const getFilteredTimeSlots = () => {
    if (!compactMode) return TIME_SLOTS;

    const slotsWithAppointments = new Set<string>();

    TIME_SLOTS.forEach((timeSlot) => {
      weekDates.forEach((date) => {
        const appointment = getAppointmentForSlot(date, timeSlot);
        if (appointment) {
          slotsWithAppointments.add(timeSlot);
        }
      });
    });

    return TIME_SLOTS.filter((slot) => slotsWithAppointments.has(slot));
  };

  // Funções de Drag & Drop
  const handleDragStart = useCallback(
    (e: React.DragEvent, appointment: Appointment) => {
      setDraggedAppointment(appointment);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", appointment.id);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, date: Date, timeSlot: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverSlot({ date, timeSlot });
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetDate: Date, targetTimeSlot: string) => {
      e.preventDefault();

      if (!draggedAppointment) return;

      console.log("🎯 Tentando soltar agendamento:", {
        appointmentId: draggedAppointment.id,
        targetDate: targetDate.toISOString().split("T")[0],
        targetTimeSlot,
      });

      const newStartTime = targetTimeSlot;
      const [hours, minutes] = targetTimeSlot.split(":").map(Number);

      // Calcular novo horário de fim baseado na duração do serviço (mais robusto)
      const serviceDuration = draggedAppointment.service?.durationMinutes || 30;
      let newEndHours = hours;
      let newEndMinutes = minutes + serviceDuration;

      // Ajustar horas se os minutos passarem de 60
      while (newEndMinutes >= 60) {
        newEndHours += 1;
        newEndMinutes -= 60;
      }

      const newEndTime = `${newEndHours
        .toString()
        .padStart(2, "0")}:${newEndMinutes.toString().padStart(2, "0")}`;

      // Verificar se o horário final não passa das 20:00
      if (newEndHours >= 20) {
        alert("❌ Horário final muito tarde! Horário máximo: 19:45");
        setDraggedAppointment(null);
        setDragOverSlot(null);
        return;
      }

      // Verificar se não está tentando mover para o passado
      const now = new Date();
      const targetDateTime = new Date(targetDate);
      targetDateTime.setHours(hours, minutes, 0, 0);

      if (targetDateTime < now) {
        alert("❌ Não é possível mover agendamento para o passado!");
        setDraggedAppointment(null);
        setDragOverSlot(null);
        return;
      }

      console.log("⏰ Novos horários:", {
        start: newStartTime,
        end: newEndTime,
        duration: serviceDuration,
      });

      // Verificar se há conflito de horário (lógica melhorada)
      const hasConflict = appointments?.some((appointment) => {
        if (appointment.id === draggedAppointment.id) return false;

        const appointmentDate = parseLocalDate(appointment.appointmentDate);
        const isSameDate = compareDates(appointmentDate, targetDate);

        if (!isSameDate) return false;

        // Converter horários para minutos para comparação mais precisa
        const timeToMinutes = (time: string) => {
          const [h, m] = time.split(":").map(Number);
          return h * 60 + m;
        };

        const appointmentStartMinutes = timeToMinutes(appointment.startTime);
        const appointmentEndMinutes = timeToMinutes(appointment.endTime);
        const newStartMinutes = timeToMinutes(newStartTime);
        const newEndMinutes = timeToMinutes(newEndTime);

        // Verificar sobreposição de horários (permitir agendamentos consecutivos)
        const conflict =
          newStartMinutes < appointmentEndMinutes &&
          newEndMinutes > appointmentStartMinutes;

        if (conflict) {
          console.log("⚠️ Conflito detectado com:", {
            appointmentId: appointment.id,
            client: appointment.client.name,
            existing: `${appointment.startTime}-${appointment.endTime}`,
            new: `${newStartTime}-${newEndTime}`,
            existingMinutes: `${appointmentStartMinutes}-${appointmentEndMinutes}`,
            newMinutes: `${newStartMinutes}-${newEndMinutes}`,
          });
        }

        return conflict;
      });

      if (hasConflict) {
        alert(
          "❌ Conflito de horário! Já existe um agendamento neste período.\n\nVerifique se o horário está disponível e tente novamente."
        );
        setDraggedAppointment(null);
        setDragOverSlot(null);
        return;
      }

      // Atualizar o agendamento
      const updatedAppointment = {
        ...draggedAppointment,
        appointmentDate: targetDate.toISOString().split("T")[0],
        startTime: newStartTime,
        endTime: newEndTime,
      };

      // Garantir que a data está no formato correto
      const formattedDate = targetDate.toISOString().split("T")[0];
      console.log("📅 Data formatada:", {
        original: targetDate,
        formatted: formattedDate,
        targetDateISO: targetDate.toISOString(),
      });

      // Validar dados antes de enviar
      if (
        !updatedAppointment.id ||
        !updatedAppointment.appointmentDate ||
        !updatedAppointment.startTime ||
        !updatedAppointment.endTime
      ) {
        console.error(
          "❌ Dados inválidos para atualização:",
          updatedAppointment
        );
        alert("❌ Dados inválidos para atualização!");
        setDraggedAppointment(null);
        setDragOverSlot(null);
        return;
      }

      console.log("✅ Agendamento atualizado:", updatedAppointment);
      console.log("📋 Dados para API:", {
        id: updatedAppointment.id,
        appointmentDate: updatedAppointment.appointmentDate,
        startTime: updatedAppointment.startTime,
        endTime: updatedAppointment.endTime,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
      });

      try {
        console.log("🔍 Verificando onUpdateAppointment:", {
          exists: !!onUpdateAppointment,
          type: typeof onUpdateAppointment,
          function: onUpdateAppointment,
        });

        if (onUpdateAppointment) {
          console.log("🚀 Chamando onUpdateAppointment...");
          await onUpdateAppointment(updatedAppointment);
          console.log("🎉 Agendamento movido com sucesso!");
        } else {
          console.error("❌ onUpdateAppointment não está definido!");
          alert("❌ Função de atualização não disponível!");
        }
      } catch (error) {
        console.error("❌ Erro ao atualizar agendamento:", error);
        alert("❌ Erro ao mover agendamento!");
      }

      setDraggedAppointment(null);
      setDragOverSlot(null);
    },
    [draggedAppointment, appointments, onUpdateAppointment]
  );


  // Função para cancelar agendamento
  const handleCancelAppointment = useCallback(
    async (appointmentId: string, clientName: string) => {
      if (!onDeleteAppointment) {
        alert("❌ Função de cancelamento não disponível!");
        return;
      }

      const confirmed = confirm(
        `🚫 Tem certeza que deseja cancelar o agendamento de ${clientName}?\n\nEsta ação não pode ser desfeita!`
      );

      if (confirmed) {
        try {
          await onDeleteAppointment(appointmentId);
          console.log("🚫 Agendamento cancelado com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao cancelar agendamento:", error);
          alert("❌ Erro ao cancelar agendamento!");
        }
      }
    },
    [onDeleteAppointment]
  );

  // Função para excluir agendamento permanentemente
  const handlePermanentDeleteAppointment = useCallback(
    async (appointmentId: string, clientName: string) => {
      if (!onPermanentDeleteAppointment) {
        alert("❌ Função de exclusão permanente não disponível!");
        return;
      }

      const confirmed = confirm(
        `🗑️ Tem certeza que deseja EXCLUIR PERMANENTEMENTE o agendamento de ${clientName}?\n\n⚠️ Esta ação é IRREVERSÍVEL e removerá o agendamento do banco de dados!`
      );

      if (confirmed) {
        try {
          await onPermanentDeleteAppointment(appointmentId);
          console.log("🗑️ Agendamento excluído permanentemente!");
        } catch (error) {
          console.error(
            "❌ Erro ao excluir agendamento permanentemente:",
            error
          );
          alert("❌ Erro ao excluir agendamento permanentemente!");
        }
      }
    },
    [onPermanentDeleteAppointment]
  );

  // Função para reagendar agendamento
  const handleRescheduleAppointment = useCallback(
    (appointment: Appointment) => {
      if (!onRescheduleAppointment) {
        alert("❌ Função de reagendamento não disponível!");
        return;
      }

      console.log("🔄 Reagendando:", appointment.client.name);
      onRescheduleAppointment(appointment);
    },
    [onRescheduleAppointment]
  );

  // Função para completar agendamento
  const handleCompleteAppointment = useCallback(
    async (appointmentId: string, clientName: string) => {
      if (!onCompleteAppointment) {
        alert("❌ Função de conclusão não disponível!");
        return;
      }

      console.log("✅ Completando agendamento:", clientName);
      await onCompleteAppointment(appointmentId, clientName);
    },
    [onCompleteAppointment]
  );

  // Get appointment for specific date and time slot
  const getAppointmentForSlot = (date: Date, timeSlot: string) => {
    const normalizedTimeSlot = normalizeTime(timeSlot);

    const foundAppointment = appointments?.find((appointment) => {
      // Comparar datas ignorando timezone - usar parseLocalDate para evitar problemas de timezone
      const appointmentDate = parseLocalDate(appointment.appointmentDate);
      const matchesDate = compareDates(appointmentDate, date);

      // Normalizar horários para comparação
      const normalizedStartTime = normalizeTime(appointment.startTime);
      const normalizedEndTime = normalizeTime(appointment.endTime);

      // Verificar se o slot atual está dentro do horário do agendamento
      const matchesTime =
        normalizedStartTime <= normalizedTimeSlot &&
        normalizedEndTime > normalizedTimeSlot;

      // Debug detalhado apenas para datas que coincidem
      if (matchesDate) {
        console.log("Data encontrada:", {
          slotDate: date.toISOString().split("T")[0],
          appointmentDate: appointmentDate.toISOString().split("T")[0],
          timeSlot: normalizedTimeSlot,
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          matchesTime,
          appointmentId: appointment.id,
          clientName: appointment.client.name,
        });
      }

      return matchesDate && matchesTime;
    });

    // Log adicional para debug
    if (foundAppointment) {
      console.log("✅ Agendamento encontrado para slot:", {
        date: date.toISOString().split("T")[0],
        timeSlot: normalizedTimeSlot,
        appointment: {
          id: foundAppointment.id,
          client: foundAppointment.client.name,
          service: foundAppointment.service.name,
          startTime: foundAppointment.startTime,
          endTime: foundAppointment.endTime,
        },
      });
    }

    return foundAppointment;
  };

  // Calculate appointment duration in slots
  const getAppointmentDuration = (startTime: string, endTime: string) => {
    const normalizedStartTime = normalizeTime(startTime);
    const normalizedEndTime = normalizeTime(endTime);
    const start = TIME_SLOTS.indexOf(normalizedStartTime);
    const end = TIME_SLOTS.indexOf(normalizedEndTime);
    return Math.max(1, end - start);
  };

  return (
    <div className="flex-1 bg-white overflow-auto">
      {appointmentsLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando agendamentos...</p>
          </div>
        </div>
      ) : (
        <div className="min-w-max">
          {/* Header with days of the week */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            {/* Quick time navigation */}
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Navegação rápida:
              </span>
              <button
                onClick={() =>
                  document
                    .getElementById("10:00")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Manhã (10:00)
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("12:00")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
              >
                Almoço (12:00)
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("15:00")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                Tarde (15:00)
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("18:00")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                Noite (18:00)
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = Math.floor(now.getMinutes() / 15) * 15;
                  const timeString = `${currentHour
                    .toString()
                    .padStart(2, "0")}:${currentMinute
                    .toString()
                    .padStart(2, "0")}`;
                  const element = document.getElementById(timeString);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Agora
              </button>

              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Modo:</span>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    compactMode
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {compactMode ? "Compacto" : "Completo"}
                </button>

                {appointments && (
                  <div className="ml-4 flex items-center gap-3 text-xs text-gray-600">
                    <span>📅 {appointments.length} agendamentos</span>
                    {compactMode && (
                      <span>
                        🎯 {getFilteredTimeSlots().length} horários ocupados
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex">
              <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50"></div>
              {weekDates.map((date, index) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const weekdays = [
                  "domingo",
                  "segunda-feira",
                  "terça-feira",
                  "quarta-feira",
                  "quinta-feira",
                  "sexta-feira",
                  "sábado",
                ];
                return (
                  <div
                    key={index}
                    className="flex-1 min-w-48 p-3 border-r border-gray-200"
                  >
                    <div className="text-center">
                      <div
                        className={`text-sm font-medium text-gray-600 capitalize`}
                      >
                        {weekdays[date.getDay()]}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isToday ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time slots and appointments grid */}
          <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              {getFilteredTimeSlots().map((timeSlot) => (
                <div
                  key={timeSlot}
                  id={timeSlot}
                  className="h-16 flex items-center justify-center text-xs text-gray-500 border-b border-gray-100"
                >
                  {timeSlot}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((date, dateIndex) => (
              <div
                key={dateIndex}
                className="flex-1 min-w-48 border-r border-gray-200"
              >
                {getFilteredTimeSlots().map((timeSlot, timeIndex) => {
                  const appointment = getAppointmentForSlot(date, timeSlot);
                  const normalizedTimeSlot = normalizeTime(timeSlot);
                  const normalizedStartTime = appointment
                    ? normalizeTime(appointment.startTime)
                    : "";
                  const isFirstSlotOfAppointment =
                    appointment && normalizedStartTime === normalizedTimeSlot;

                  // Log apenas para slots com agendamentos
                  if (appointment) {
                    console.log("🎯 Slot com agendamento:", {
                      date: date.toISOString().split("T")[0],
                      timeSlot: normalizedTimeSlot,
                      startTime: normalizedStartTime,
                      isFirstSlot: isFirstSlotOfAppointment,
                      client: appointment.client.name,
                    });
                  }

                  if (appointment && !isFirstSlotOfAppointment) {
                    return <div key={timeSlot} className="h-16"></div>;
                  }

                  return (
                    <div
                      key={timeSlot}
                      className={`h-16 border-b border-gray-100 relative group ${
                        dragOverSlot?.date === date &&
                        dragOverSlot?.timeSlot === timeSlot
                          ? "bg-blue-50 border-blue-300"
                          : ""
                      }`}
                      onDragOver={(e) => handleDragOver(e, date, timeSlot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, date, timeSlot)}
                    >
                      {/* Slot vazio com indicador de drop */}
                      {!appointment && draggedAppointment && (
                        <div className="absolute inset-1 border-2 border-dashed border-blue-400 bg-blue-100 opacity-80 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="text-center">
                            <span className="text-xs text-blue-700 font-medium block">
                              ✨ Soltar aqui
                            </span>
                            <span className="text-xs text-blue-600 block">
                              {draggedAppointment.client.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {appointment && isFirstSlotOfAppointment && (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, appointment)}
                          className={`absolute inset-x-1 rounded-lg p-2 border-l-4 ${getAppointmentColor(
                            appointment.service.name,
                            appointment.status
                          )} shadow-sm cursor-move hover:shadow-md transition-all ${
                            draggedAppointment?.id === appointment.id
                              ? "opacity-50 scale-95 shadow-lg"
                              : ""
                          }`}
                          style={{
                            height: `${
                              getAppointmentDuration(
                                appointment.startTime,
                                appointment.endTime
                              ) *
                                64 -
                              4
                            }px`,
                            zIndex:
                              draggedAppointment?.id === appointment.id
                                ? 10
                                : 1,
                          }}
                          title={`${appointment.client.name} - ${appointment.service.name} (${appointment.startTime} - ${appointment.endTime}) - Arraste para mover`}
                        >
                          {/* Modo de visualização */}
                            <div className="flex items-start gap-1 h-full">
                              <div className="flex-shrink-0 flex gap-1 mt-0.5">
                                {appointment.service.name
                                  .toLowerCase()
                                  .includes("corte") && (
                                  <Scissors className="h-3 w-3 text-gray-600" />
                                )}
                                {appointment.client.plan &&
                                  appointment.client.plan.name !== "Avulso" && (
                                    <Star className="h-3 w-3 text-yellow-600" />
                                  )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-medium text-gray-900 text-xs leading-tight truncate">
                                    {appointment.client.name}
                                  </p>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRescheduleAppointment(
                                          appointment
                                        );
                                      }}
                                      className="p-0.5 hover:bg-blue-200 rounded flex-shrink-0"
                                      title="Editar agendamento"
                                    >
                                      <Calendar className="h-3 w-3 text-blue-600" />
                                    </button>
                                    {appointment.status !== "completed" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCompleteAppointment(
                                            appointment.id,
                                            appointment.client.name
                                          );
                                        }}
                                        className="p-0.5 hover:bg-green-200 rounded flex-shrink-0"
                                        title="Concluir"
                                      >
                                        <Check className="h-3 w-3 text-green-600" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelAppointment(
                                          appointment.id,
                                          appointment.client.name
                                        );
                                      }}
                                      className="p-0.5 hover:bg-red-200 rounded flex-shrink-0"
                                      title="Cancelar"
                                    >
                                      <Ban className="h-3 w-3 text-red-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePermanentDeleteAppointment(
                                          appointment.id,
                                          appointment.client.name
                                        );
                                      }}
                                      className="p-0.5 hover:bg-red-300 rounded flex-shrink-0"
                                      title="Excluir Permanentemente"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-700" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 truncate leading-tight">
                                  {appointment.service.name}
                                </p>
                                <p className="text-xs text-blue-600 font-medium truncate leading-tight">
                                  {barbers?.find(
                                    (b) => b.id === appointment.barberId
                                  )?.name || "Barbeiro"}
                                </p>
                                <p className="text-xs text-gray-500 leading-tight">
                                  {appointment.startTime}-{appointment.endTime}
                                </p>
                                {appointment.notes && (
                                  <p className="text-xs text-gray-500 italic truncate leading-tight">
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
