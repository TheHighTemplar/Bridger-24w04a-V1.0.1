(function (exports) {
  'use strict';

  //!underlineState

  const {EditorView, Decoration,} = CM["@codemirror/view"];
  const {StateField, StateEffect} = CM["@codemirror/state"];

  const addUnderline = StateEffect.define({
    map: ({from, to}, change) => ({from: change.mapPos(from), to: change.mapPos(to)})
  });

  const underlineField = StateField.define({
    create() {
      return Decoration.none
    },
    update(underlines, tr) {
      underlines = underlines.map(tr.changes);
      for (let e of tr.effects) if (e.is(addUnderline)) {
        underlines = underlines.update({
          add: [underlineMark.range(e.value.from, e.value.to)]
        });
      }
      return underlines
    },
    provide: f => EditorView.decorations.from(f)
  });

  const underlineMark = Decoration.mark({class: "cm-underline"});

  //!underlineSelection

  const underlineTheme = EditorView.baseTheme({
    ".cm-underline": { textDecoration: "underline 3px red" }
  });

  function underlineSelection(view) {
    let effects = view.state.selection.ranges
      .filter(r => !r.empty)
      .map(({from, to}) => addUnderline.of({from, to}));
    if (!effects.length) return false

    if (!view.state.field(underlineField, false))
      effects.push(StateEffect.appendConfig.of([underlineField,
                                                underlineTheme]));
    view.dispatch({effects});
    return true
  }

  //!underlineKeymap

  const {keymap} = CM["@codemirror/view"];

  const underlineKeymap = keymap.of([{
    key: "Mod-h",
    preventDefault: true,
    run: underlineSelection
  }]);

  //!create

  const {basicSetup} = CM["codemirror"];

  new EditorView({
    doc: "Select text and press Ctrl-h (Cmd-h) to add an underline\nto it.\n",
    extensions: [underlineKeymap, basicSetup],
    parent: document.querySelector("#editor-underline")
  });

  exports.underlineKeymap = underlineKeymap;
  exports.underlineSelection = underlineSelection;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
