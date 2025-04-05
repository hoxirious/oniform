import { h, VNode } from "snabbdom";
import Station from "./station";
import { Option } from "./option";
import { Collection } from "./collection";
import { renderPreview } from "../main";
import "../styles/question.css";
import Group from "./group";

export class Question {
  parent: Collection;
  station: Station;
  options: Map<string, Option> = new Map();
  label: string = "";
  id: string = "";
  selectedOptionId: string = "nil";
  optionSubQuestions: (Question | Collection)[] = [];
  subQuestions: Map<string, Question | Collection> = new Map();
  isCompleted: boolean = this.calculateIsCompleted();

  constructor(station: Station) {
    this.station = station;
    this.label = station.value;
    this.id = station.id;
    if (station.terminals && station.terminals.length > 0) {
      station.terminals.forEach((terminal) => {
        this.options.set(terminal.id, new Option(terminal));
      });
    }
    if (station.links && station.links.length > 0) {
      console.log("constructor", station.links);
      station.links.forEach((link) => {
        if (link.rightType === "Group") {
          // (link.right as Group).stations.forEach((station) => {
          //   this.subQuestions.set(station.id, new Question(station));
          // });
          this.subQuestions.set(
            link.right.id,
            new Collection(link.right as Group),
          );
        } else {
          this.subQuestions.set(
            link.right.id,
            new Question(link.right as Station),
          );
        }
      });
    }
  }

  update(station: Station) {
    this.station = station;
    this.label = this.station.value;
    if (this.station.terminals)
      this.station.terminals.forEach((terminal) => {
        if (
          !this.options.has(terminal.id) ||
          this.options.get(terminal.id).value !== terminal.value
        ) {
          this.options.set(terminal.id, new Option(terminal));
        } else {
          this.options.get(terminal.id).update(terminal);
        }
      });

    console.log("update", this.station.links);
    if (this.station.links)
      this.station.links.forEach((link) => {
        if (!this.subQuestions.has(link.right.id)) {
          this.subQuestions.set(
            link.right.id,
            link.rightType == "Group"
              ? new Collection(link.right as Group)
              : new Question(link.right as Station),
          );
        } else if (link.rightType == "Group")
          (this.subQuestions.get(link.right.id) as Collection).update(
            link.right as Group,
          );
        else
          (this.subQuestions.get(link.right.id) as Question).update(
            link.right as Station,
          );
      });
  }

  calculateIsCompleted(): boolean {
    if (this.selectedOptionId === "nil") {
      this.isCompleted = false;
      return this.isCompleted;
    }

    const selectedOption = this.options.get(this.selectedOptionId);
    this.isCompleted = selectedOption
      ? selectedOption.calculateIsCompleted()
      : false;
    return this.isCompleted;
  }

  private handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptionId = target.options[target.selectedIndex].id;

    if (selectedOptionId === this.selectedOptionId) return;

    if (selectedOptionId !== "nil") {
      this.addDependencies(selectedOptionId);
      if (this.optionSubQuestions.length === 0) {
        this.calculateIsCompleted();
      }
    } else {
      this.removeOutdatedDependencies();
    }

    this.selectedOptionId = selectedOptionId;
    renderPreview();
  }

  private addDependencies(optionId: string): void {
    const selectedOptionDependencies =
      this.options.get(optionId)?.nextDependencies;
    if (selectedOptionDependencies) {
      this.removeOutdatedDependencies();
      selectedOptionDependencies.forEach((dependency) => {
        this.optionSubQuestions.push(dependency);
      });
    }
  }

  private removeOutdatedDependencies(): void {
    if (this.selectedOptionId !== "nil") {
      const previousDependencies = this.options.get(
        this.selectedOptionId,
      )?.nextDependencies;
      previousDependencies?.forEach((previousDependency) => {
        const stack: (Question | Collection)[] = [previousDependency];
        while (stack.length > 0) {
          const current = stack.pop();
          if (current) {
            if (current instanceof Collection) {
              current.questions.forEach((question) => {
                question.subQuestions = new Map();
                question.selectedOptionId = "nil";
              });
            } else {
              stack.push(...current.optionSubQuestions);
              current.optionSubQuestions = [];
              current.selectedOptionId = "nil";
            }
            this.optionSubQuestions = [];
          }
        }
      });
    }
  }

  render(): VNode {
    // this.options = new Map();
    // this.station.terminals.forEach(terminal => {
    //     this.options.set(terminal.id, new Option(terminal, this.parent));
    // });
    // this.selectedOptionId = "nil";
    return h("div.question", [
      h("label", { props: { for: this.id } }, this.label),
      h(
        "select",
        {
          props: { id: this.id },
          on: { change: this.handleChange.bind(this) },
        },
        [
          h("option", { props: { id: "nil" } }, ["Select an option"]),
          ...Array.from(this.options.values()).map((option) => option.render()),
        ],
      ),
      ...this.optionSubQuestions.map((subQuestion) => subQuestion.render()),
      ...(this.calculateIsCompleted()
        ? Array.from(this.subQuestions.values()).map((subQuestion) =>
            subQuestion.render(),
          )
        : []),
    ]);
  }
}
