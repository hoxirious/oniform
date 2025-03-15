// snabbdom-setup.ts
import { init } from "snabbdom";
import { classModule } from "snabbdom/build";
import { propsModule } from "snabbdom/build";
import { styleModule } from "snabbdom/build";
import { eventListenersModule } from "snabbdom/build";

export const patch = init([classModule, propsModule, styleModule, eventListenersModule]);