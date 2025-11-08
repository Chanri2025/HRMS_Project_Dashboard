import React, {useState, useEffect} from "react";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";

/**
 * Shadcn-based DateTime picker
 *
 * Props:
 *  - value: string | Date | null (ISO or Date)
 *  - onChange: (isoStringOrEmpty: string) => void
 *  - required?: boolean
 *  - placeholder?: string
 *  - disabled?: boolean
 */
export function ShadcnDateTimePicker({
                                         value,
                                         onChange,
                                         required = false,
                                         placeholder = "Pick date & time",
                                         disabled = false,
                                         className,
                                     }) {
    // normalize incoming value
    const initialDate =
        value instanceof Date
            ? value
            : value
                ? new Date(value)
                : null;

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(() => {
        if (!initialDate) return "12:00";
        const h = String(initialDate.getHours()).padStart(2, "0");
        const m = String(initialDate.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    });

    // sync when parent value changes externally
    useEffect(() => {
        if (!value) {
            setDate(null);
            setTime("12:00");
            return;
        }

        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return;

        setDate(d);
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        setTime(`${h}:${m}`);
    }, [value]);

    const emit = (nextDate, nextTime) => {
        if (!nextDate || !nextTime) {
            onChange(""); // cleared
            return;
        }

        const [hStr, mStr] = nextTime.split(":");
        const d = new Date(nextDate);
        d.setHours(Number(hStr) || 0, Number(mStr) || 0, 0, 0);

        if (Number.isNaN(d.getTime())) {
            onChange("");
            return;
        }

        onChange(d.toISOString());
    };

    const handleDateSelect = (d) => {
        setDate(d);
        emit(d, time);
    };

    const handleTimeChange = (e) => {
        const v = e.target.value;
        setTime(v);
        if (date) emit(date, v);
    };

    const handleClear = () => {
        setDate(null);
        setTime("12:00");
        onChange("");
        setOpen(false);
    };

    const handleOk = () => {
        // value already emitted on select/time change
        setOpen(false);
    };

    const displayValue =
        date && time
            ? `${format(date, "dd/MM/yyyy")} ${time}`
            : "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between text-left font-normal",
                        !displayValue && "text-muted-foreground",
                        className
                    )}
                >
                    <span>
                        {displayValue || placeholder}
                        {required && (
                            <span className="text-destructive ml-0.5">*</span>
                        )}
                    </span>
                    <CalendarIcon className="h-4 w-4 opacity-70 ml-2"/>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-3" align="start">
                <div className="flex flex-col gap-3">
                    <Calendar
                        mode="single"
                        selected={date || undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                    />

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Time
                        </span>
                        <Input
                            type="time"
                            step={900} // 15 min
                            value={time}
                            onChange={handleTimeChange}
                            className="h-8 text-xs"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleOk}
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
