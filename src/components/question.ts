import {h, VNode} from "snabbdom";
import Station from "./station";
import {Option} from "./option";
import {Collection} from "./collection";
import {renderReview} from "../index";
import "../styles/question.css";

export class Question {
    parent: Collection;
    options: Map<string, Option> = new Map();
    label: string = "";
    id: string = "";
    selectedOptionId: string = "nil";
    optionSubQuestions: (Question|Collection)[] = [];
    subQuestions: Question[] = [];
    isCompleted: boolean = this.calculateIsCompleted();

    constructor(station: Station, parent: Collection) {
        this.parent = parent;
        this.label = station.value;
        this.id = station.id;
        if(station.terminals && station.terminals.length > 0) {
            station.terminals.forEach(terminal => {
                this.options.set(terminal.id, new Option(terminal, parent));
            });
        }
        if(station.links && station.links.length > 0) {
            this.subQuestions = station.links.map(link => {
                return new Question(link.right as Station, parent);
            });
        }
    }

    calculateIsCompleted(): boolean {
        if (this.selectedOptionId === "nil") {
            this.isCompleted = false;
            return this.isCompleted;
        }

        const selectedOption = this.options.get(this.selectedOptionId);
        this.isCompleted = selectedOption ? selectedOption.calculateIsCompleted() : false;
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
        renderReview();
    }

    private addDependencies(optionId: string): void {
        const selectedOptionDependencies = this.options.get(optionId)?.nextDependencies;
        if (selectedOptionDependencies) {
            this.removeOutdatedDependencies();
            selectedOptionDependencies.forEach(dependency => {
                this.optionSubQuestions.push(dependency);
            });
        }
    }

    private removeOutdatedDependencies(): void {
        if (this.selectedOptionId !== "nil") {
            const previousDependencies = this.options.get(this.selectedOptionId)?.nextDependencies;
            previousDependencies?.forEach(previousDependency => {
                const stack: (Question|Collection)[] = [previousDependency];
                while (stack.length > 0) {
                    const current = stack.pop();
                    if (current) {
                        if (current instanceof Collection) {
                            current.questions.forEach(question => {
                                question.subQuestions = [];
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
        return h("div.question", [
            h("label", {props: {for: this.id}}, this.label),
            h("select", {
                props: {id: this.id},
                on: {change: this.handleChange.bind(this)},
            }, [
                h("option", {props: {id: "nil"}}, ["Select an option"]),
                ...Array.from(this.options.values()).map(option => option.render())
            ]),
            ...this.optionSubQuestions.map(subQuestion => subQuestion.render()),
            ...(this.calculateIsCompleted() ?
                this.subQuestions.map(subQuestion => subQuestion.render()) : [])
        ]);
    }
}