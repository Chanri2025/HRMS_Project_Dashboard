import React, { useState } from "react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { format } from "date-fns";

const mockAttendance = [
  {
    id: "1",
    name: "Alex Chen",
    initials: "AC",
    status: "present",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    hours: "9h",
  },
  {
    id: "2",
    name: "Jordan Lee",
    initials: "JL",
    status: "present",
    checkIn: "08:45 AM",
    checkOut: "05:30 PM",
    hours: "8h 45m",
  },
  {
    id: "3",
    name: "Morgan Park",
    initials: "MP",
    status: "absent",
    checkIn: "-",
    checkOut: "-",
    hours: "-",
  },
  {
    id: "4",
    name: "Casey Brown",
    initials: "CB",
    status: "present",
    checkIn: "09:15 AM",
    checkOut: "06:15 PM",
    hours: "9h",
  },
  {
    id: "5",
    name: "Riley Davis",
    initials: "RD",
    status: "leave",
    checkIn: "-",
    checkOut: "-",
    hours: "-",
  },
];

const statusColors = {
  present: "bg-success/10 text-success border-success/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  leave: "bg-warning/10 text-warning border-warning/20",
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const stats = {
    present: mockAttendance.filter((a) => a.status === "present").length,
    absent: mockAttendance.filter((a) => a.status === "absent").length,
    leave: mockAttendance.filter((a) => a.status === "leave").length,
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-2xl font-bold">Attendance</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-success">
                  {stats.present}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-success text-xl">✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.absent}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive text-xl">✗</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-warning">{stats.leave}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <span className="text-warning text-xl">–</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Table + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Table */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate
                  ? `${format(selectedDate, "MMMM dd, yyyy")}`
                  : "Today's"}{" "}
                Attendance
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendance.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[member.status]}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.checkIn}</TableCell>
                    <TableCell>{member.checkOut}</TableCell>
                    <TableCell>{member.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
