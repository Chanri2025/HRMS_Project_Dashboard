import {useEffect, useState} from "react";

const KEY = "activeProjectId";

export function useProjectSelection() {
    const read = () => {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    };

    const [projectId, setProjectId] = useState(read());

    useEffect(() => {
        if (projectId == null) {
            localStorage.removeItem(KEY);
        } else {
            localStorage.setItem(KEY, JSON.stringify(projectId));
        }
    }, [projectId]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === KEY) {
                setProjectId(e.newValue ? JSON.parse(e.newValue) : null);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return {projectId, setProjectId};
}
