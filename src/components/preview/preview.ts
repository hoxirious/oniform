import { h } from "snabbdom";
import { Collection } from "./collection";
import Oniform from "../oniform/oniform";

export class Preview {
  static instance: Preview = new Preview();
  collections: Map<string, Collection> = new Map();

  private constructor() {
    Oniform.instance.groups.forEach((group) => {
      this.collections.set(group.id, new Collection(group));
    });
  }

  update() {
    let visited: string[] = [];
    Oniform.instance.groups.forEach((group) => {
      visited.push(group.id);
      if (!this.collections.has(group.id)) {
        this.collections.set(group.id, new Collection(group));
      } else {
        this.collections.get(group.id).update(group);
      }
    });

    // Remove unvisited
    Array.from(this.collections.keys()).forEach((key) => {
      if (visited.includes(key) === false) this.collections.delete(key);
    });
  }

  render() {
    this.update();
    return h("div#preview-window", { key: "preview" }, [
      h("div.review_container", [
        h("h2", "Preview"),
        h(
          "p",
          "> A quick peek at the result of your current oniform in the playground",
        ),
        h(
          "div.review_object",
          Array.from(this.collections.values()).map((collection) =>
            collection.render(),
          ),
        ),
      ]),
    ]);
  }
}
