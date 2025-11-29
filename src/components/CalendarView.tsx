import { useState, useRef } from "react";
import { CalendarEvent } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, Clock, CalendarDays, ChevronLeft, ChevronRight, Edit2, Coffee, Utensils, Repeat, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner@2.0.3";

interface CalendarViewProps {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
}

export function CalendarView({ events, setEvents }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    recurrence: "none" as "none" | "weekly" | "monthly",
  });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Week view drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const [draggedDate, setDraggedDate] = useState<Date | null>(null);

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  
  // Get all events including recurring ones
  const getAllEventsForDate = (dateStr: string): CalendarEvent[] => {
    const targetDate = new Date(dateStr);
    const result: CalendarEvent[] = [];

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      
      if (event.date === dateStr) {
        result.push(event);
      } else if (event.recurrence === "weekly") {
        const daysDiff = Math.floor((targetDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0 && daysDiff % 7 === 0) {
          result.push(event);
        }
      } else if (event.recurrence === "monthly") {
        if (targetDate.getDate() === eventDate.getDate() && targetDate > eventDate) {
          result.push(event);
        }
      }
    });

    return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const selectedDateEvents = getAllEventsForDate(selectedDateStr);

  const checkTimeConflict = (startTime: string, endTime: string, excludeId?: string): boolean => {
    // Get events for the selected date
    const dateEvents = getAllEventsForDate(selectedDateStr).filter(e => e.id !== excludeId);
    
    const [newStartHour, newStartMin] = startTime.split(":").map(Number);
    const [newEndHour, newEndMin] = endTime.split(":").map(Number);
    const newStart = newStartHour * 60 + newStartMin;
    const newEnd = newEndHour * 60 + newEndMin;

    // Check if new event overlaps with any existing event
    for (const event of dateEvents) {
      const [existingStartHour, existingStartMin] = event.startTime.split(":").map(Number);
      const [existingEndHour, existingEndMin] = event.endTime.split(":").map(Number);
      const existingStart = existingStartHour * 60 + existingStartMin;
      const existingEnd = existingEndHour * 60 + existingEndMin;

      // Check for overlap
      if (
        (newStart >= existingStart && newStart < existingEnd) || // New event starts during existing event
        (newEnd > existingStart && newEnd <= existingEnd) || // New event ends during existing event
        (newStart <= existingStart && newEnd >= existingEnd) // New event completely overlaps existing event
      ) {
        return true; // Conflict found
      }
    }
    return false; // No conflict
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    // Validate time logic
    if (newEvent.startTime >= newEvent.endTime) {
      toast.error("La hora de inicio debe ser antes de la hora de fin");
      return;
    }

    // Check for time conflicts
    if (checkTimeConflict(newEvent.startTime, newEvent.endTime)) {
      toast.error("Conflicto de horario", {
        description: "Ya existe un evento en este período de tiempo",
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      date: selectedDateStr,
      recurrence: newEvent.recurrence,
    };

    setEvents([...events, event]);
    setNewEvent({ title: "", startTime: "", endTime: "", recurrence: "none" });
    setIsDialogOpen(false);
    
    const recurrenceText = 
      newEvent.recurrence === "weekly" ? " (se repetirá semanalmente)" :
      newEvent.recurrence === "monthly" ? " (se repetirá mensualmente)" : "";
    
    toast.success("Evento agregado", {
      description: `${newEvent.title} ha sido agregado a tu agenda${recurrenceText}`,
    });
  };

  const updateEvent = () => {
    if (!editingEvent) return;
    
    // Validate time logic
    if (editingEvent.startTime >= editingEvent.endTime) {
      toast.error("La hora de inicio debe ser antes de la hora de fin");
      return;
    }

    // Check for time conflicts (excluding the event being edited)
    if (checkTimeConflict(editingEvent.startTime, editingEvent.endTime, editingEvent.id)) {
      toast.error("Conflicto de horario", {
        description: "Ya existe un evento en este período de tiempo",
      });
      return;
    }
    
    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id ? editingEvent : e
    );
    setEvents(updatedEvents);
    setIsEditDialogOpen(false);
    setEditingEvent(null);
    toast.success("Evento actualizado", {
      description: "Los cambios han sido guardados",
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    toast.info("Evento eliminado", {
      description: "El evento ha sido removido de tu agenda",
    });
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const monthDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const hasEventsOnDate = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    return events.some((e) => e.date === dateStr);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const previousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Get week days for week view
  const getWeekDays = () => {
    const week = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDaysArray = getWeekDays();

  // Week view hours (6 AM to 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22

  // Handle drag events for week view
  const handleMouseDown = (day: number, hour: number, date: Date) => {
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
    setDraggedDate(date);
    setSelectedDate(date);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (isDragging && dragStart && dragStart.day === day) {
      setDragEnd({ day, hour });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && draggedDate) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
      
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      setNewEvent({
        title: "",
        startTime,
        endTime,
        recurrence: "none",
      });
      
      setIsDialogOpen(true);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDraggedDate(null);
  };

  // Check if a cell is in the dragged range
  const isInDragRange = (day: number, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    if (day !== dragStart.day) return false;
    
    const minHour = Math.min(dragStart.hour, dragEnd.hour);
    const maxHour = Math.max(dragStart.hour, dragEnd.hour);
    
    return hour >= minHour && hour <= maxHour;
  };

  // Get drag range display
  const getDragRangeDisplay = () => {
    if (!dragStart || !dragEnd) return "";
    
    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
    
    const formatTime = (h: number) => {
      const period = h < 12 ? "a.m." : "p.m.";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:00 ${period}`;
    };
    
    return `${formatTime(startHour)} - ${formatTime(endHour)}`;
  };

  // Get events for a specific date and hour
  const getEventsForTimeSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayEvents = getAllEventsForDate(dateStr);
    
    return dayEvents.filter(event => {
      const [startHour] = event.startTime.split(":").map(Number);
      const [endHour] = event.endTime.split(":").map(Number);
      return hour >= startHour && hour < endHour;
    });
  };

  // Calculate free slots for selected date
  const getFreeSlots = () => {
    const dayEvents = selectedDateEvents;
    const slots: { start: string; end: string; duration: number; type: string }[] = [];

    if (dayEvents.length === 0) return slots;

    // Before first event
    if (dayEvents[0].startTime > "08:00") {
      const duration = getMinutesDifference("08:00", dayEvents[0].startTime);
      if (duration >= 10) {
        slots.push({ 
          start: "08:00", 
          end: dayEvents[0].startTime, 
          duration,
          type: duration < 20 ? "snack" : duration < 40 ? "rápida" : "normal"
        });
      }
    }

    // Between events
    for (let i = 0; i < dayEvents.length - 1; i++) {
      const duration = getMinutesDifference(dayEvents[i].endTime, dayEvents[i + 1].startTime);
      if (duration >= 10) {
        slots.push({ 
          start: dayEvents[i].endTime, 
          end: dayEvents[i + 1].startTime, 
          duration,
          type: duration < 20 ? "snack" : duration < 40 ? "rápida" : "normal"
        });
      }
    }

    // After last event
    if (dayEvents[dayEvents.length - 1].endTime < "20:00") {
      const duration = getMinutesDifference(dayEvents[dayEvents.length - 1].endTime, "20:00");
      if (duration >= 10) {
        slots.push({ 
          start: dayEvents[dayEvents.length - 1].endTime, 
          end: "20:00", 
          duration,
          type: duration < 20 ? "snack" : duration < 40 ? "rápida" : "normal"
        });
      }
    }

    return slots;
  };

  const getMinutesDifference = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const getMealTypeLabel = (type: string) => {
    if (type === "snack") return "Snack";
    if (type === "rápida") return "Comida rápida";
    return "Comida normal";
  };

  const getMealTypeColor = (type: string) => {
    if (type === "snack") return "bg-green-50 border-green-200";
    if (type === "rápida") return "bg-blue-50 border-blue-200";
    return "bg-purple-50 border-purple-200";
  };

  const freeSlots = getFreeSlots();

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={viewMode === "month" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("month")}
          className={`flex-1 text-xs ${viewMode === "month" ? "bg-white shadow-sm" : ""}`}
        >
          <CalendarIcon className="size-3 mr-1" />
          Mensual
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("week")}
          className={`flex-1 text-xs ${viewMode === "week" ? "bg-white shadow-sm" : ""}`}
        >
          <CalendarDays className="size-3 mr-1" />
          Semanal
        </Button>
      </div>

      {/* Monthly View */}
      {viewMode === "month" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={previousMonth} className="size-8">
                  <ChevronLeft className="size-4" />
                </Button>
                <CardTitle className="text-base capitalize">{monthName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="size-8">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`
                      aspect-square p-1 rounded-lg text-xs relative
                      ${!date ? "invisible" : ""}
                      ${isSelected(date) ? "bg-orange-600 text-white" : ""}
                      ${isToday(date) && !isSelected(date) ? "bg-orange-100 text-orange-700" : ""}
                      ${!isToday(date) && !isSelected(date) ? "hover:bg-gray-100" : ""}
                    `}
                  >
                    {date && (
                      <>
                        <span>{date.getDate()}</span>
                        {hasEventsOnDate(date) && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full" />
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="size-4" />
                    Eventos del día
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs">
                      <Plus className="size-3 mr-1" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Agregar evento</DialogTitle>
                      <DialogDescription className="text-xs">Agrega un nuevo evento a tu agenda</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="title" className="text-sm">Título</Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Ej: Reunión de equipo"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="start" className="text-sm">Inicio</Label>
                          <Input
                            id="start"
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end" className="text-sm">Fin</Label>
                          <Input
                            id="end"
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="recurrence" className="text-sm">Repetir</Label>
                        <Select
                          value={newEvent.recurrence}
                          onValueChange={(value: "none" | "weekly" | "monthly") => 
                            setNewEvent({ ...newEvent, recurrence: value })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="No repetir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-sm">No repetir</SelectItem>
                            <SelectItem value="weekly" className="text-sm">Semanalmente</SelectItem>
                            <SelectItem value="monthly" className="text-sm">Mensualmente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addEvent} className="w-full text-sm">
                        Agregar evento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">
                    No hay eventos este día
                  </p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{event.title}</p>
                          {event.recurrence && event.recurrence !== "none" && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Repeat className="size-3" />
                              {event.recurrence === "weekly" ? "Semanal" : "Mensual"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-orange-600">
                          <Clock className="size-3" />
                          <span className="text-xs">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEvent(event)}
                              className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Editar evento</DialogTitle>
                              <DialogDescription className="text-xs">Modifica el evento</DialogDescription>
                            </DialogHeader>
                            {editingEvent && (
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="edit-title" className="text-sm">Título</Label>
                                  <Input
                                    id="edit-title"
                                    value={editingEvent.title}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="edit-start" className="text-sm">Inicio</Label>
                                    <Input
                                      id="edit-start"
                                      type="time"
                                      value={editingEvent.startTime}
                                      onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-end" className="text-sm">Fin</Label>
                                    <Input
                                      id="edit-end"
                                      type="time"
                                      value={editingEvent.endTime}
                                      onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <Button onClick={updateEvent} className="w-full text-sm">
                                  Guardar cambios
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Free Slots */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Coffee className="size-4 text-orange-600" />
                    Espacios libres para comer
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Momentos disponibles según tu agenda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {freeSlots.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">
                    No hay espacios libres este día
                  </p>
                ) : (
                  freeSlots.map((slot, idx) => (
                    <div
                      key={`${slot.start}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getMealTypeColor(slot.type)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Utensils className="size-4 text-gray-600" />
                          <p className="text-sm">{getMealTypeLabel(slot.type)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-gray-600">
                          <Clock className="size-3" />
                          <span className="text-xs">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {slot.duration} min
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              {freeSlots.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 text-center">
                    💡 Las sugerencias de comida se basan en estos espacios
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Weekly View */}
      {viewMode === "week" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={previousWeek} className="size-8">
                  <ChevronLeft className="size-4" />
                </Button>
                <CardTitle className="text-base capitalize">
                  {weekDaysArray[0].toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={nextWeek} className="size-8">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 pb-3">
              <div className="overflow-x-auto">
                <div className="w-full min-w-[600px]" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchEnd={handleMouseUp}>
                  {/* Week header */}
                  <div className="grid grid-cols-8 border-b bg-white z-10">
                    <div className="p-1 text-[10px] sm:text-xs text-gray-500 border-r flex items-center justify-center">S.</div>
                    {weekDaysArray.map((date, idx) => {
                      const isCurrentDay = isToday(date);
                      return (
                        <div key={idx} className={`p-1 text-center border-l ${isCurrentDay ? 'bg-pink-100' : ''}`}>
                          <div className="text-[10px] sm:text-xs text-gray-500">{weekDays[date.getDay()].toUpperCase()}</div>
                          <div className={`text-sm ${isCurrentDay ? 'text-pink-600 font-bold' : ''}`}>
                            {date.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b relative">
                      <div className="p-1 text-[10px] sm:text-xs text-gray-400 border-r flex items-start justify-center pt-1">
                        {hour}
                      </div>
                      {weekDaysArray.map((date, dayIdx) => {
                        const eventsInSlot = getEventsForTimeSlot(date, hour);
                        const isInRange = isInDragRange(dayIdx, hour);
                        const isCurrentDay = isToday(date);
                        
                        return (
                          <div
                            key={dayIdx}
                            className={`border-l min-h-[50px] relative cursor-pointer transition-colors ${
                              isInRange ? 'bg-pink-300' : isCurrentDay ? 'bg-pink-50/50' : 'hover:bg-gray-50'
                            }`}
                            onMouseDown={() => handleMouseDown(dayIdx, hour, date)}
                            onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                            onTouchStart={() => handleMouseDown(dayIdx, hour, date)}
                            onTouchMove={(e) => {
                              const touch = e.touches[0];
                              const element = document.elementFromPoint(touch.clientX, touch.clientY);
                              if (element) {
                                const cell = element.closest('[data-hour]');
                                if (cell) {
                                  const hour = parseInt(cell.getAttribute('data-hour') || '0');
                                  const day = parseInt(cell.getAttribute('data-day') || '0');
                                  handleMouseEnter(day, hour);
                                }
                              }
                            }}
                            data-hour={hour}
                            data-day={dayIdx}
                          >
                            {eventsInSlot.map((event, idx) => (
                              <div
                                key={event.id}
                                className="absolute inset-x-0.5 bg-green-200 border border-green-300 rounded px-0.5 text-[9px] sm:text-xs overflow-hidden flex items-center justify-center"
                                style={{
                                  top: `${idx * 2}px`,
                                  zIndex: 5,
                                }}
                              >
                                <div className="truncate">{event.title}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Drag tooltip */}
                  {isDragging && dragStart && dragEnd && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-50 pointer-events-none text-sm">
                      {getDragRangeDisplay()}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pt-3 text-xs text-gray-600 text-center">
                💡 Arrastra sobre una columna para crear un evento
              </div>
            </CardContent>
          </Card>

          {/* Dialog for creating event from drag */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Agregar evento</DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-sm">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ej: Reunión de equipo"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start" className="text-sm">Inicio</Label>
                    <Input
                      id="start"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end" className="text-sm">Fin</Label>
                    <Input
                      id="end"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="recurrence" className="text-sm">Repetir</Label>
                  <Select
                    value={newEvent.recurrence}
                    onValueChange={(value: "none" | "weekly" | "monthly") => 
                      setNewEvent({ ...newEvent, recurrence: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="No repetir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-sm">No repetir</SelectItem>
                      <SelectItem value="weekly" className="text-sm">Semanalmente</SelectItem>
                      <SelectItem value="monthly" className="text-sm">Mensualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addEvent} className="w-full text-sm">
                  Agregar evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
