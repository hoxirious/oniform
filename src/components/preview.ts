import { h } from "snabbdom";
import { Collection } from "./collection";
import Oniform from "./oniform";

export class Preview {
  static instance: Preview = new Preview();
  collections: Map<string, Collection> = new Map();

  private constructor() {
    Oniform.instance.groups.forEach((group) => {
      this.collections.set(group.id, new Collection(group));
    });
  }

  update() {
    Oniform.instance.groups.forEach((group) => {
      if (!this.collections.has(group.id)) {
        this.collections.set(group.id, new Collection(group));
      } else {
        this.collections.get(group.id).update();
      }
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

