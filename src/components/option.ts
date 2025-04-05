import { h } from "snabbdom";
import Terminal from "./terminal";
import { Collection } from "./collection";
import { Question } from "./question";
import Group from "./group";
import Station from "./station";

// type OptionDependant = Question | Collection;

export class Option {
  terminal: Terminal;
  value: string = "";
  id: string = "";
  nextDependencies: (Collection | Question)[] = [];
  isCompleted: boolean = false;

  constructor(terminal: Terminal) {
    this.value = terminal.value;
    this.terminal = terminal;
    this.id = terminal.id;
    this.nextDependencies = terminal.links.map((link) => {
      return link.rightType === "Group"
        ? new Collection(link.right as Group)
        : new Question(link.right as Station);
    });
  }

  update(terminal: Terminal) {
    // this.nextDependencies = this.terminal.links.map(link => {
    //     if(link)
    //     return link.rightType === "Group" ?
    //         new Collection(link.right as Group) :
    //         new Question(link.right as Station, this.parentCollection);
    // })
    this.terminal = terminal;
    this.value = terminal.value;
  }

  calculateIsCompleted(): boolean {
    this.isCompleted = this.nextDependencies.every((dependency) => {
      if (dependency instanceof Collection) {
        return dependency.calculatedIsCompleted();
      } else {
        return dependency.calculateIsCompleted();
      }
    });
    return this.isCompleted;
  }

  render() {
    // this.nextDependencies = this.terminal.links.map(link => {
    //     return link.rightType === "Group" ?
    //         new Collection(link.right as Group) :
    //         new Question(link.right as Station, this.parentCollection);
    // })
    return h("option", { props: { id: this.id } }, [this.value]);
  }
}

