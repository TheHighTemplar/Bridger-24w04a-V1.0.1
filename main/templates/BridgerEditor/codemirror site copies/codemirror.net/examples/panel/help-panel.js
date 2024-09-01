(function (exports) {
  'use strict';

  //!helpState

  const {showPanel,} = CM["@codemirror/view"];
  const {StateField, StateEffect} = CM["@codemirror/state"];

  const toggleHelp = StateEffect.define();

  const helpPanelState = StateField.define({
    create: () => false,
    update(value, tr) {
      for (let e of tr.effects) if (e.is(toggleHelp)) value = e.value;
      return value
    },
    provide: f => showPanel.from(f, on => on ? createHelpPanel : null)
  });

  //!createHelpPanel

  const {EditorView} = CM["@codemirror/view"];

  function createHelpPanel(view) {
    let dom = document.createElement("div");
    dom.textContent = "F1: Toggle the help panel";
    dom.className = "cm-help-panel";
    return {top: true, dom}
  }

  //!helpKeymap

  const helpKeymap = [{
    key: "F1",
    run(view) {
      view.dispatch({
        effects: toggleHelp.of(!view.state.field(helpPanelState))
      });
      return true
    }
  }];

  //!helpPanel

  const {keymap} = CM["@codemirror/view"];

  const helpTheme = EditorView.baseTheme({
    ".cm-help-panel": {
      padding: "5px 10px",
      backgroundColor: "#fffa8f",
      fontFamily: "monospace"
    }
  });

  function helpPanel() {
    return [helpPanelState, keymap.of(helpKeymap), helpTheme]
  }

  //!create

  const {basicSetup} = CM["codemirror"];(window ).view = new EditorView({
    doc: "In this editor, F1 is bound to a panel-toggling\ncommand.\n",
    extensions: [helpPanel(), basicSetup],
    parent: document.querySelector("#editor")
  });

  exports.helpPanel = helpPanel;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
