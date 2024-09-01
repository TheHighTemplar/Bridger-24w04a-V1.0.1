(function (exports) {
  'use strict';

  //!cursorTooltipField

  const { showTooltip} = CM["@codemirror/view"];
  const {StateField} = CM["@codemirror/state"];

  const cursorTooltipField = StateField.define({
    create: getCursorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips
      return getCursorTooltips(tr.state)
    },

    provide: f => showTooltip.computeN([f], state => state.field(f))
  });





  function getCursorTooltips(state) {
    return state.selection.ranges
      .filter(range => range.empty)
      .map(range => {
        let line = state.doc.lineAt(range.head);
        let text = line.number + ":" + (range.head - line.from);
        return {
          pos: range.head,
          above: true,
          strictSide: true,
          arrow: true,
          create: () => {
            let dom = document.createElement("div");
            dom.className = "cm-tooltip-cursor";
            dom.textContent = text;
            return {dom}
          }
        }
      })
  }

  //!baseTheme

  const {EditorView} = CM["@codemirror/view"];

  const cursorTooltipBaseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-cursor": {
      backgroundColor: "#66b",
      color: "white",
      border: "none",
      padding: "2px 7px",
      borderRadius: "4px",
      "& .cm-tooltip-arrow:before": {
        borderTopColor: "#66b"
      },
      "& .cm-tooltip-arrow:after": {
        borderTopColor: "transparent"
      }
    }
  });

  //!cursorTooltip

  function cursorTooltip() {
    return [cursorTooltipField, cursorTooltipBaseTheme]
  }

  //!create

  const {basicSetup} = CM["codemirror"];

  new EditorView({
    doc: "Move through this text to\nsee your tooltip\n",
    extensions: [basicSetup, cursorTooltip()],
    parent: document.querySelector("#editor")
  });

  exports.cursorTooltip = cursorTooltip;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
