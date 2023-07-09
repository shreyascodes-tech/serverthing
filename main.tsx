/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, renderToString } from "./jsx-runtime/h.ts";

async function A({ text = "hello" }) {
  return (
    <>
      <div onclick="">
        <div>{text}</div>
      </div>
    </>
  );
}

const d = <A text="Hiiiii" />;

console.log(d);
console.log(await renderToString(d));
