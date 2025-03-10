import {Group} from "./group.ts";
import {Station} from "./station.ts";

export enum Relationship {
    SIBLING = "sibling",
    DEPENDANT = "dependant"
}

export interface Link {
    id: string;
    value: string;
    rightType: "Group" | "Station";
    right: Group|Station;
    relationship: Relationship;
}