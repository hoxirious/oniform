import {h} from "snabbdom";
import Terminal from "./terminal.ts";
import {Collection} from "./collection.ts";
import {Question} from "./question.ts";
import Group from "./group.ts";
import Station from "./station.ts";

// type OptionDependant = Question | Collection;

export class Option {
    parentCollection: Collection;
    value: string = "";
    id: string = "";
    isCompleted: boolean = false;
    nextDependencies: (Collection|Question)[] = [];
    constructor(terminal: Terminal, parentCollection: Collection) {
        this.value = terminal.value;
        this.id = terminal.id;
        this.parentCollection = parentCollection;
        this.nextDependencies = terminal.links.map(link => {
            return link.rightType === "Group" ?
                new Collection(link.right as Group, parentCollection.parent) :
                new Question(link.right as Station, parentCollection);
        })
    }
    render() {
        return h("option", {props: {id: this.id}}, [this.value]);
    }
}