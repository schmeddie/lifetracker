import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CalendarEvent } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await api.get('/calendar', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/calendar', {
        title,
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
      });

      alert('Event created successfully!');
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/calendar/${eventId}`);
      alert('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setSelectedDate(null);
  };

  const openCreateModal = (selectedDay?: Date) => {
    if (selectedDay) {
      setSelectedDate(selectedDay);
      setDate(format(selectedDay, 'yyyy-MM-dd'));
    } else {
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
    setShowModal(true);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) =>
      isSameDay(new Date(event.date), day)
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const today = new Date();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary-text">Calendar</h1>
        <button
          onClick={() => openCreateModal()}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-primary-text transition-colors"
        >
          + Add Event
        </button>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-hover-bg rounded hover:bg-accent hover:text-white transition-colors"
          >
            ← Prev
          </button>
          <h2 className="text-xl font-semibold text-primary-text">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-hover-bg rounded hover:bg-accent hover:text-white transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-secondary-text py-2">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={day.toString()}
                onClick={() => openCreateModal(day)}
                className={`min-h-24 p-2 border rounded cursor-pointer hover:bg-hover-bg transition-colors ${
                  isToday ? 'border-accent border-2 bg-accent bg-opacity-5' : 'border-divider'
                } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-accent' : 'text-primary-text'}`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        event.eventType === 'UK_HOLIDAY'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-accent bg-opacity-20 text-primary-text'
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-secondary-text">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6">
        <h2 className="text-xl font-semibold text-primary-text mb-4">All Events This Month</h2>
        {events.length === 0 ? (
          <p className="text-secondary-text">No events this month.</p>
        ) : (
          <div className="space-y-3">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start justify-between p-4 rounded border ${
                    event.eventType === 'UK_HOLIDAY'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-hover-bg border-divider'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-primary-text">{event.title}</h3>
                      {event.eventType === 'UK_HOLIDAY' && (
                        <span className="text-xs px-2 py-0.5 bg-red-200 text-red-700 rounded">
                          UK Holiday
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-text mt-1">
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    {event.description && (
                      <p className="text-sm text-secondary-text mt-1">{event.description}</p>
                    )}
                  </div>
                  {event.eventType === 'CUSTOM' && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-primary-text mb-4">Create Event</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-divider rounded hover:bg-hover-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-primary-text transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
