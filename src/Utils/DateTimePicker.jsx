// src/Utils/DateTimePicker.jsx

import * as React from "react";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export default function BasicDateTimePicker({
                                                label,
                                                value,              // null | Dayjs | string | Date
                                                onChange,           // gets Dayjs | null (IST)
                                                textFieldProps = {},
                                            }) {
    const shouldDisableTime = (timeValue, clockType) => {
        if (clockType === "minutes") {
            return timeValue % 15 !== 0;
        }
        return false;
    };

    // Normalize incoming value for the picker
    const pickerValue = value
        ? (dayjs.isDayjs(value) ? value : dayjs(value))
        : null;

    const handleChange = (newValue) => {
        if (!newValue || !newValue.isValid || !newValue.isValid()) {
            onChange(null);
            return;
        }

        // normalize to IST Dayjs
        const istTime = newValue.tz("Asia/Kolkata");
        onChange(istTime);
    };

    const defaultSx = {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {borderColor: "blue"},
            "&:hover fieldset": {borderColor: "blue"},
            "&.Mui-focused fieldset": {borderColor: "blue"},
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label={label}
                value={pickerValue}
                onChange={handleChange}
                ampm={false}
                format="DD/MM/YYYY HH:mm"
                minutesStep={15}
                shouldDisableTime={shouldDisableTime}
                // IMPORTANT for MUI X v6 when customizing textField props
                enableAccessibleFieldDOMStructure={false}
                slotProps={{
                    textField: {
                        ...textFieldProps,
                        sx: {
                            ...defaultSx,
                            ...(textFieldProps.sx || {}),
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
}
