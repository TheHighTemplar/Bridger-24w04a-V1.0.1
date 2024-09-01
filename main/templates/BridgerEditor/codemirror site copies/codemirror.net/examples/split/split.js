(function () {
  'use strict';

  //!startState

  const {EditorState} = CM["@codemirror/state"];
  const {defaultKeymap, historyKeymap, history} = CM["@codemirror/commands"];
  const {drawSelection, keymap, lineNumbers} = CM["@codemirror/view"];

  let startState = EditorState.create({
    doc: "The document\nis\nshared",
    extensions: [
      history(),
      drawSelection(),
      lineNumbers(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
      ])
    ]
  });

  //!otherState

  const {undo, redo} = CM["@codemirror/commands"];

  let otherState = EditorState.create({
    doc: startState.doc,
    extensions: [
      drawSelection(),
      lineNumbers(),
      keymap.of([
        ...defaultKeymap,
        {key: "Mod-z", run: () => undo(mainView)},
        {key: "Mod-y", mac: "Mod-Shift-z", run: () => redo(mainView)}
      ])
    ]
  });

  //!syncDispatch

  const {EditorView} = CM["@codemirror/view"];
  const {Transaction, Annotation} = CM["@codemirror/state"];

  let syncAnnotation = Annotation.define();

  function syncDispatch(tr, view, other) {
    view.update([tr]);
    if (!tr.changes.empty && !tr.annotation(syncAnnotation)) {
      let annotations = [syncAnnotation.of(true)];
      let userEvent = tr.annotation(Transaction.userEvent);
      if (userEvent) annotations.push(Transaction.userEvent.of(userEvent));
      other.dispatch({changes: tr.changes, annotations});
    }
  }

  //!setup

  let mainView = new EditorView({
    state: startState,
    parent: document.querySelector("#editor1"),
    dispatch: tr => syncDispatch(tr, mainView, otherView)
  });

  let otherView = new EditorView({
    state: otherState,
    parent: document.querySelector("#editor2"),
    dispatch: tr => syncDispatch(tr, otherView, mainView)
  });

})();
