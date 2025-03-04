import {Station} from "./station.ts";

export interface Group {
    id: string;
    label: string;
    stations: Station[];
}