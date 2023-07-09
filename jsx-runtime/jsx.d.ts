import type { JSXIntrinsicElements, Node } from "./types.ts";

declare global {
  namespace JSX {
    type Element = Node | Promise<Node>;
    interface IntrinsicElements extends JSXIntrinsicElements {}
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes {}
  }
}
