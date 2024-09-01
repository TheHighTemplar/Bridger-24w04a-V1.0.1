(function (exports) {
  'use strict';

  //!hoverTooltip

  const {hoverTooltip} = CM["@codemirror/view"];

  const wordHover = hoverTooltip((view, pos, side) => {
    let {from, to, text} = view.state.doc.lineAt(pos);
    let start = pos, end = pos;
    while (start > from && /\w/.test(text[start - from - 1])) start--;
    while (end < to && /\w/.test(text[end - from])) end++;
    if (start == pos && side < 0 || end == pos && side > 0)
      return null
    return {
      pos: start,
      end,
      above: true,
      create(view) {
        let dom = document.createElement("div");
        dom.textContent = text.slice(start - from, end - from);
        return {dom}
      }
    }
  });

  //!create

  const {EditorView, basicSetup} = CM["codemirror"];

  new EditorView({
    doc: "Hover over words to get tooltips\n",
    extensions: [basicSetup, wordHover],
    parent: document.querySelector("#hover-editor")
  });

  exports.wordHover = wordHover;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
