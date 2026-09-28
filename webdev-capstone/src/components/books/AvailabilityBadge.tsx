import type React from "react";
import type { BookAvailability } from "../../types/book";

interface AvailabilityBadgeProps {
    availability: BookAvailability;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ availability }) => {
    const available = availability === "available";
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
        >
            {available ? "Disponible" : "Prestado"}
        </span>
    );
};

export default AvailabilityBadge;
