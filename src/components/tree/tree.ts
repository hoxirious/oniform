import Group from "../oniform/group";
import {h} from "snabbdom";
import "../../styles/tree.css";

export default class Tree {
    static instance = new Tree();
    groups: Group[] = [];

    constructor(groups?: Group[]) {
        if (groups) {
            this.groups = groups;
        }
    }

    render() {
        return h("div#tree-window", {key: "tree"}, [
                h("div.tree_container", [...this.groups.map(group => group.tree())])
            ]
        );
    }

}