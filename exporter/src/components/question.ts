import {h} from "snabbdom";
import Station from "./station.ts";
import {Option} from "./option.ts";
import {Collection} from "./collection.ts";
import {renderReview} from "../main.ts";
import {Review} from "./review.ts";
import "../styles/question.css";

export class Question {
    parent: Collection;
    options: Map<string, Option> = new Map();
    label: string = "";
    id: string = "";
    selectedOptionId: string = "nil";
    subQuestions: Question[] = [];

    constructor(station: Station, parent: Collection) {
        this.parent = parent;
        this.label = station.value;
        this.id = station.id;
        station.terminals.forEach(terminal => {
            this.options.set(terminal.id, new Option(terminal, parent));
        });
    }

    private handleChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const selectedOption = target.options[target.selectedIndex];
        if (selectedOption.id !== this.selectedOptionId) {
            if (selectedOption.id !== "nil") {
                this.addDependencies(selectedOption.id);
            } else {
                this.removeOutdatedDependencies();
            }
            this.selectedOptionId = selectedOption.id;
            renderReview();
        }
    }

    private addDependencies(optionId: string): void {
        const selectedOptionDependencies = this.options.get(optionId)?.nextDependencies;
        if (selectedOptionDependencies) {
            this.removeOutdatedDependencies();
            selectedOptionDependencies.forEach(dependency => {
                if (dependency instanceof Collection) {
                    Review.instance.collections.set(dependency.id, dependency);
                    console.log("Collection added to review");
                } else {
                    this.subQuestions.push(dependency);
                }
            });
        }
    }

    private removeOutdatedDependencies(): void {
        if (this.selectedOptionId !== "nil") {
            const previousDependencies = this.options.get(this.selectedOptionId)?.nextDependencies;
            previousDependencies?.forEach(previousDependency => {
                if (previousDependency instanceof Collection) {
                    Review.instance.collections.delete(previousDependency.id);
                } else {
                    const stack: Question[] = [previousDependency];
                    while (stack.length > 0) {
                        const current = stack.pop();
                        if (current) {
                            stack.push(...current.subQuestions);
                            current.subQuestions = [];
                            current.selectedOptionId = "nil";
                        }
                    }
                    this.subQuestions = [];
                }
            });
        }
    }

    render() {
        return h("div.question", [
            h("label", {props: {for: this.id}}, this.label),
            h("select", {
                props: {id: this.id},
                on: {change: this.handleChange.bind(this)},
            }, [
                h("option", {props: {id: "nil"}}, ["Select an option"]),
                ...Array.from(this.options.values()).map(option => option.render())
            ]),
            ...this.subQuestions.map(subQuestion => subQuestion.render())
        ]);
    }
}