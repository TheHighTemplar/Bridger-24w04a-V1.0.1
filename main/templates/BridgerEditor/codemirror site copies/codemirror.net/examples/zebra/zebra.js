(function (exports) {
  'use strict';

  //!baseTheme

  const {EditorView} = CM["@codemirror/view"];

  const baseTheme = EditorView.baseTheme({
    "&light .cm-zebraStripe": {backgroundColor: "#d4fafa"},
    "&dark .cm-zebraStripe": {backgroundColor: "#1a2727"}
  });

  //!facet

  const {Facet} = CM["@codemirror/state"];

  const stepSize = Facet.define({
    combine: values => values.length ? Math.min(...values) : 2
  });





  function zebraStripes(options = {}) {
    return [
      baseTheme,
      options.step == null ? [] : stepSize.of(options.step),
      showStripes
    ]
  }

  //!stripeDeco

  const {Decoration} = CM["@codemirror/view"];
  const {RangeSetBuilder} = CM["@codemirror/state"];

  const stripe = Decoration.line({
    attributes: {class: "cm-zebraStripe"}
  });

  function stripeDeco(view) {
    let step = view.state.facet(stepSize);
    let builder = new RangeSetBuilder();
    for (let {from, to} of view.visibleRanges) {
      for (let pos = from; pos <= to;) {
        let line = view.state.doc.lineAt(pos);
        if ((line.number % step) == 0)
          builder.add(line.from, line.from, stripe);
        pos = line.to + 1;
      }
    }
    return builder.finish()
  }

  //!showStripes

  const {ViewPlugin,} = CM["@codemirror/view"];

  const showStripes = ViewPlugin.fromClass(class {
    

    constructor(view) {
      this.decorations = stripeDeco(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = stripeDeco(update.view);
    }
  }, {
    decorations: v => v.decorations
  });

  //!example

  const {keymap} = CM["@codemirror/view"];
  const {defaultKeymap} = CM["@codemirror/commands"];

  let text = [];
  for (let i = 1; i <= 100; i++) text.push("line " + i)

  ;(window ).view = new EditorView({
    extensions: [zebraStripes(), keymap.of(defaultKeymap)],
    doc: text.join("\n"),
    parent: document.querySelector("#editor")
  });

  exports.zebraStripes = zebraStripes;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
