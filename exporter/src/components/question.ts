import {h} from "snabbdom";
import Station from "./station.ts";
import {Option} from "./option.ts";
import {Collection} from "./collection.ts";
import {renderReview} from "../main.ts";

export class Question {
    parent: Collection;
    options: Map<string, Option> = new Map();
    label: string = "";
    id: string = "";

    constructor(station: Station, parent: Collection) {
        station.terminals.forEach(terminal => {
            this.options.set(terminal.id, new Option(terminal, parent));
        });
        this.label = station.value;
        this.id = station.id;
        this.parent = parent;
    }

    render() {
        return h("div", [
            h("label", {props: {for: this.id}}, this.label),
            h("select", {
                    props: {id: this.id}, on: {
                       change: (event: Event) => {
                            const target = event.target as HTMLSelectElement;
                            const selectedOption = target.options[target.selectedIndex];
                            const selectedOptionDependencies = this.options.get(selectedOption.id).nextDependencies;
                            if (selectedOptionDependencies) {
                                selectedOptionDependencies.forEach(dependency => {
                                    if(dependency instanceof Collection) {
                                        this.parent.parent.collections.set(dependency.id, dependency);
                                    }
                                    else {
                                        this.parent.questions.push(dependency);
                                    }
                                })
                            }
                            renderReview();
                       }
                    },
                },
                [
                    h("option", ["Select an option"]),
                    ...Array.from(this.options.values()).map(option => option.render())
                ]
            )
        ]);
    }
}