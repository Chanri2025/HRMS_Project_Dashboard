import React, { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const mockEvents = [
  {
    id: "1",
    date: new Date(2025, 9, 25),
    title: "Sprint Planning",
    type: "meeting",
  },
  {
    id: "2",
    date: new Date(2025, 9, 28),
    title: "Sprint Review",
    type: "review",
  },
  {
    id: "3",
    date: new Date(2025, 9, 30),
    title: "Release v2.0",
    type: "deadline",
  },
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventsForSelectedDate = selectedDate
    ? mockEvents.filter(
        (event) =>
          format(event.date, "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      )
    : [];

  const eventDates = mockEvents.map((event) => event.date);

  const typeColors = {
    meeting: "bg-info text-info-foreground",
    review: "bg-warning text-warning-foreground",
    deadline: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="p-6 lg:col-span-2">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full pointer-events-auto"
              modifiers={{
                event: eventDates,
              }}
              modifiersStyles={{
                event: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                },
              }}
            />
          </Card>

          {/* Event Details Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              {selectedDate
                ? format(selectedDate, "MMMM dd, yyyy")
                : "Select a date"}
            </h3>

            <div className="space-y-3">
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <Badge className={typeColors[event.type]}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events scheduled
                </p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Upcoming Events</h4>
              <div className="space-y-2">
                {mockEvents.map((event) => (
                  <div key={event.id} className="text-xs p-2 bg-muted rounded">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-muted-foreground">
                      {format(event.date, "MMM dd, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
