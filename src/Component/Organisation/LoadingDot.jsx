import React from "react";

export default function LoadingDot() {
    return (
        <span className="inline-flex items-center gap-2">
      <span className="animate-pulse">⏳</span>Processing…
    </span>
    );
}