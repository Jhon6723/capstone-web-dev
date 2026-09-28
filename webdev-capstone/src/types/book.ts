export type BookAvailability = "available" | "unavailable";

export interface Book {
    workKey: string;
    title: string;
    authors: string[];
    coverId?: number;
    firstPublishYear?: number;
    subjects: string[];
    ratingsAverage?: number;
    availability: BookAvailability;
}
