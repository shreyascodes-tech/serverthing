import { Children, Component, Node, NodeSet, literal } from "./types.ts";

export type PropsWithChildren<P> = P & Children;
// deno-lint-ignore ban-types
export type FC<P = {}> = (props: P) => NodeSet | Promise<NodeSet>;

export function h(
  type: Component | string,
  props?: { [prop: string]: unknown },
  ...children: (Node | literal | null | false)[]
): JSX.Element {
  return { type, props: { ...props, children } };
}

export function Fragment({ children }: Children) {
  return children;
}

function escapeHTML(text: string): string {
  const entities: { [char: string]: string } = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&#39;",
    '"': "&#34;",
  };
  return text.replaceAll(/[&<>"']/g, (char) => {
    return entities[char];
  });
}

async function renderNodeSetToString(nodes: NodeSet): Promise<string> {
  if (nodes == null || nodes === false) {
    return "";
  } else if (typeof nodes !== "object") {
    return escapeHTML(`${nodes}`);
  } else if (Array.isArray(nodes)) {
    return (
      await Promise.all(
        nodes.map(
          (child: NodeSet): Promise<string> => renderNodeSetToString(child)
        )
      )
    ).join("");
  } else {
    return await renderToString(nodes);
  }
}

// deno-lint-ignore no-explicit-any
function __jsx(_jsx: any): asserts _jsx is Node {}

/**
 * Renders a given JSX node to a string.
 */
export async function renderToString(
  jsx: Node | Promise<JSX.Element>
): Promise<string> {
  __jsx(jsx);
  if (typeof jsx.type === "function") {
    return await renderNodeSetToString(await jsx.type(jsx.props));
  } else {
    let className = "";
    // render props
    const props =
      Object.entries(jsx.props)
        .map(([prop, value]: [string, unknown]): string => {
          switch (prop) {
            case "dangerouslySetInnerHTML":
            case "innerHTML":
            case "children":
              return "";
            case "class":
            case "className":
              className += `${value} `;
              return "";
            default:
              return ` ${prop}="${""
                .concat(value as string)
                .replace(/\"/g, '\\"')}"`;
          }
        })
        .join("") + (className ? ` class="${className.trim()}"` : "");

    // render inner HTML
    const children = jsx.props?.children ?? [];
    let innerHTML = "";
    if (
      jsx.props.dangerouslySetInnerHTML != null ||
      jsx.props.innerHTML != null
    ) {
      if (
        jsx.props.dangerouslySetInnerHTML != null &&
        jsx.props.innerHTML != null
      ) {
        throw new Error(
          "Cannot use both dangerouslySetInnerHTML and innerHTML props."
        );
      }
      innerHTML =
        jsx.props.dangerouslySetInnerHTML?.__html ?? jsx.props.innerHTML ?? "";
    } else {
      innerHTML = await renderNodeSetToString(children);
    }

    // render HTML tag
    switch (jsx.type) {
      case "area":
      case "base":
      case "basefont":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "img":
      case "input":
      case "keygen":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "spacer":
      case "track":
      case "wbr":
        return `<${jsx.type}${props} />`;
      default:
        return `<${jsx.type}${props}>${innerHTML}</${jsx.type}>`;
    }
  }
}
