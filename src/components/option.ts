import { h } from "snabbdom";
import Terminal from "./terminal";
import { Collection } from "./collection";
import { Question } from "./question";
import Group from "./group";
import Station from "./station";

export class Option {
  terminal: Terminal;
  value: string = "";
  id: string = "";
  nextDependencies: Map<string, Collection | Question> = new Map();
  isCompleted: boolean = false;

  constructor(terminal: Terminal) {
    this.value = terminal.value;
    this.terminal = terminal;
    this.id = terminal.id;
    terminal.links.forEach((link) => {
      this.nextDependencies.set(
        link.right.id,
        link.rightType === "Group"
          ? new Collection(link.right as Group)
          : new Question(link.right as Station),
      );
    });
  }

  update(terminal: Terminal) {
    this.terminal = terminal;
    this.value = terminal.value;
    this.terminal.links.forEach((link) => {
      if (!this.nextDependencies.has(link.right.id)) {
        this.nextDependencies.set(
          link.right.id,
          link.rightType === "Group"
            ? new Collection(link.right as Group)
            : new Question(link.right as Station),
        );
      } else {
        if (link.rightType == "Group")
          (this.nextDependencies.get(link.right.id) as Collection).update(
            link.right as Group,
          );
        else
          (this.nextDependencies.get(link.right.id) as Question).update(
            link.right as Station,
          );
      }
    });
  }

  calculateIsCompleted(): boolean {
    this.isCompleted = Array.from(this.nextDependencies.values()).every(
      (dependency) => {
        if (dependency instanceof Collection) {
          return dependency.calculatedIsCompleted();
        } else {
          return dependency.calculateIsCompleted();
        }
      },
    );
    return this.isCompleted;
  }

  render() {
    return h("option", { props: { id: this.id } }, [this.value]);
  }
}
