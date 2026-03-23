import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (start, end) => {
    try {
      let url = 'http://localhost:5000/api/dashboard/calendar';
      if (start && end) {
        url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
      }
      const response = await axios.get(url);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    // Open date in case creation modal or show events for that day
    console.log('Date clicked:', arg.dateStr);
  };

  const handleEventClick = (arg) => {
    const caseId = arg.event.extendedProps.caseId;
    if (caseId) {
      navigate(`/cases/${caseId}`);
    }
  };

  const handleDatesSet = (arg) => {
    fetchEvents(arg.start, arg.end);
  };

  const eventContent = (eventInfo) => {
    return (
      <div className="p-1 text-sm">
        <div className="font-semibold">{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.time && (
          <div className="text-xs text-gray-600">
            {eventInfo.event.extendedProps.time}
          </div>
        )}
        {eventInfo.event.extendedProps.location && (
          <div className="text-xs text-gray-500 truncate">
            {eventInfo.event.extendedProps.location}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Legal Calendar</h1>
        <div className="text-sm text-gray-600">
          Click on any hearing to view case details
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventContent={eventContent}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          aspectRatio={1.8}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Hearings</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Scheduled Hearings</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">This Week</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;