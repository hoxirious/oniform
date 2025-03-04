import {Terminal} from "./terminal.ts";
import {Link} from "./link.ts";

export interface Station {
    id: string;
    label: string;
    value: string;
    terminals: Terminal[];
    links: Link[];
}
