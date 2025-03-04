import { Link } from "./link.ts";

export interface Terminal {
    id: string;
    label: string;
    value: string;
    links: Link[];
}