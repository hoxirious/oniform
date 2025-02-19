import Connector from "./connector.ts";


export default class Terminal {

    public constructor(
        private _label: string,
        private _nextConnectors: Connector[] = [],
    ) {}

    get label(): string {
        return this._label;
    }

    get nextConnectors(): Connector[] {
        return this._nextConnectors;
    }

    addConnector(connector: Connector) {
        this.nextConnectors.push(connector);
    }
}
