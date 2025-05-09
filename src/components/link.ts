import Station from "./station";
import Terminal from "./terminal";
import Group from "./group";
import "../styles/link.css";
import { generateGUID, scrollIntoView } from "../common/utility";
import { h, VNode } from "snabbdom";
import ActionButton from "./actionButton";
import { renderView } from "../main";

export enum Relationship {
  ASSOCIATE = "associate",
  DEPENDANT = "dependant",
}

class LinkButton extends ActionButton {
  constructor(self: Link) {
    const subButtons = [
      new ActionButton(
        "Associate Link",
        () => {
          self.relationship = Relationship.ASSOCIATE;
        },
        undefined,
        ["text", "right"],
        "Associate Link",
      ),
      new ActionButton(
        "Dependant Link",
        () => {
          self.relationship = Relationship.DEPENDANT;
        },
        undefined,
        ["text", "right"],
        "Dependant Link",
      ),
    ];

    super(
      "",
      () => {
        scrollIntoView(this._id);
      },
      subButtons,
      ["icon"],
      `${self.relationship.toUpperCase()} Link`,
    );
  }
}

export default class Link {
  isCollapsed: boolean = false;
  isTreeCollapsed: boolean = false;
  isDropDown: boolean = true;
  private readonly _html: HTMLDivElement = document.createElement("div");

  constructor(
    private _parent: Station | Terminal,
    private readonly _right: Group | Station,
    private _relationship: Relationship,
    private readonly _editable: boolean = true,
    private readonly _rightType: string = _right.constructor.name,
    private readonly _id: string = `link-${generateGUID()}`,
    private readonly isRender: boolean = true,
  ) {
    this.render(isRender);
  }

  private render(isRender: boolean): VNode {
    this.parent.addLink(this, isRender);
    const title = `${this._parent.label}'s Dependant`;
    return h(
      `div.link.${this.relationship}`,
      {
        props: { id: this.id, title, tabIndex: "1" },
        key: this._id,
        class: { collapse: this.isCollapsed },
      },
      [
        this.isDropDown === true ? new LinkButton(this).render() : null,
        this.right.render(),
      ],
    );
  }

  rerender() {
    const title = `${this._parent.label}'s Dependant`;
    return h(
      `div.link.${this.relationship}`,
      {
        props: { id: this.id, title, tabIndex: "1" },
        key: this._id,
        class: { collapse: this.isCollapsed },
      },
      [
        this.isDropDown === true ? new LinkButton(this).render() : null,
        this.right.render(),
      ],
    );
  }

  tree() {
    return h(
      "div.tree_link",
      {
        props: {
          class: { collapse: this.isCollapsed },
        },
      },
      [this.right.tree()],
    );
  }

  clone(leftClone: Station | Terminal, editable: boolean = false): Link {
    const rightClone = this._right.clone(editable, leftClone);
    return new Link(
      leftClone,
      rightClone,
      this._relationship,
      editable,
      this._rightType,
      this._id,
      false,
    );
  }

  get parent(): Station | Terminal {
    return this._parent;
  }

  set parent(parent: Station | Terminal) {
    this._parent = parent;
  }

  get right(): Station | Group {
    return this._right;
  }

  get rightType(): string {
    return this._rightType;
  }

  get relationship(): Relationship {
    return this._relationship;
  }

  set relationship(relationship: Relationship) {
    this._relationship = relationship;
    renderView();
  }

  get html(): HTMLDivElement {
    return this._html;
  }

  get id(): string {
    return this._id;
  }

  toObj() {
    const { right, relationship, rightType, id } = this;
    return {
      id,
      relationship,
      rightType,
      right: right.toObj(),
    };
  }

  static from(obj: any, parent: Station | Terminal): Link {
    const { right, relationship, rightType, id } = obj;
    if (rightType === "Group") {
      return new Link(
        parent,
        Group.from(right, parent),
        relationship,
        true,
        "Group",
        id,
        false,
      );
    } else {
      return new Link(
        parent,
        Station.from(right, parent),
        relationship,
        true,
        "Station",
        id,
        false,
      );
    }
  }
}
