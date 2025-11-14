// src/Component/ProjectSection/ScrumDashboard/AnimatedNumber.jsx
import React, {useEffect, useState} from "react";

export function AnimatedNumber({value, duration = 600, className = ""}) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const target = Number(value) || 0;
        if (!Number.isFinite(target)) {
            setDisplay(target);
            return;
        }

        let frame;
        let start;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min(1, (timestamp - start) / duration);
            const current = 0 + (target - 0) * progress;
            setDisplay(Math.round(current));
            if (progress < 1) {
                frame = requestAnimationFrame(step);
            }
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <span className={className}>{display}</span>;
}
