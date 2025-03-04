import {Group} from "./group.ts";

export enum Relationship {
    SIBLING = "sibling",
    DEPENDANT = "dependant"
}

export interface Link {
    id: string;
    left_id: string;
    right: Group;
    relationship: Relationship;
}