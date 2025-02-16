type Relationship = "dependant" | "children" | "sibling";

interface Group {
    label: string;
    terminals: Terminal[];
    scoreExpression: string;
    score: number;
}

class Connector {
    constructor(
        public label: string,
        public relationship: Relationship,
        public nextGroup: Group[],
        public prevTerminal: Terminal
    ) {}

    public addGroup(group: Group) {
        this.nextGroup.push(group);
    }
}

export class Terminal {

    constructor(
        public label: string,
        public nextConnectors: Connector[] = [],
    ) {}

    public addConnector(connector: Connector) {
        this.nextConnectors.push(connector);
    }
}