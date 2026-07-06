'use client';

import { useState, useRef } from 'react';
import { createCalendarEvent, deleteCalendarEvent } from '@/app/actions';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
}

interface Props {
  events: CalendarEvent[];
}

export default function CalendarClient({ events }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false, isToday: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true, isToday: date.toDateString() === today.toDateString() });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false });
  }

  // Get events for a specific day
  function getEventsForDay(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      const start = e.startDate.split('T')[0];
      const end = e.endDate.split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createCalendarEvent(formData);
      formRef.current?.reset();
    } catch (e) {
      alert('Failed to add event');
    }
    setPending(false);
  }

  async function handleDelete(eventId: string) {
    await deleteCalendarEvent(eventId);
  }

  return (
    <div>
      {/* Calendar Grid */}
      <div className="panel">
        <div className="panel-header">
          <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
          <span>{monthName.toUpperCase()}</span>
          <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
        </div>
        <div className="panel-body">
          <div className="cal-grid">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="cal-header">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day.date);
              return (
                <div key={i} className={`cal-day ${day.isCurrentMonth ? '' : 'other-month'} ${day.isToday ? 'today' : ''}`}>
                  <span className="cal-day-num">{day.date.getDate()}</span>
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="cal-event" style={{ background: ev.color }}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Form */}
      <div className="panel">
        <div className="panel-header"><span>➕ ADD EVENT</span></div>
        <form ref={formRef} action={handleSubmit} className="panel-body">
          <div className="form-field">
            <label htmlFor="title">EVENT TITLE</label>
            <input type="text" id="title" name="title" placeholder="Sprint planning..." required />
          </div>
          <div className="form-field">
            <label htmlFor="startDate">START DATE</label>
            <input type="datetime-local" id="startDate" name="startDate" required />
          </div>
          <div className="form-field">
            <label htmlFor="endDate">END DATE</label>
            <input type="datetime-local" id="endDate" name="endDate" required />
          </div>
          <button type="submit" className="btn-craft" disabled={pending}>
            {pending ? '⏳ ADDING...' : '📅 ADD EVENT'}
          </button>
        </form>
      </div>

      {/* Event List */}
      {events.length > 0 && (
        <div className="panel">
          <div className="panel-header"><span>📋 UPCOMING EVENTS</span></div>
          <div className="panel-body">
            <div className="event-list">
              {events.map(ev => (
                <div key={ev.id} className="event-item">
                  <div className="event-color" style={{ background: ev.color }} />
                  <div className="event-info">
                    <span className="event-title">{ev.title}</span>
                    <span className="event-dates">
                      {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' → '}
                      {new Date(ev.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button className="btn-delete-sm" onClick={() => handleDelete(ev.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
