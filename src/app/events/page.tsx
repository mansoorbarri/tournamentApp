"use client"
// src/app/components/EventTable.tsx
import React, { useEffect, useState } from 'react';

interface Event {
  eventID: string;
  participantsID: string; // This will now be a name
  activityID: string; // This will now be a description
  rankID: string; // This will now be a rank name
  eventTypeID: string; // This will now be a description
  date: string;
}

const EventTable: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.eventID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.participantsID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.activityID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.rankID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventTypeID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(event.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;
