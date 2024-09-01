(function (exports) {
  'use strict';

  //!wordCountPanel

  const {EditorView,} = CM["@codemirror/view"];

  function wordCountPanel(view) {
    let dom = document.createElement("div");
    dom.textContent = countWords(view.state.doc);
    return {
      dom,
      update(update) {
        if (update.docChanged)
          dom.textContent = countWords(update.state.doc);
      }
    }
  }





  function countWords(doc) {
    let count = 0, iter = doc.iter();
    while (!iter.next().done) {
      let inWord = false;
      for (let i = 0; i < iter.value.length; i++) {
        let word = /\w/.test(iter.value[i]);
        if (word && !inWord) count++;
        inWord = word;
      }
    }
    return `Word count: ${count}`
  }

  //!wordCounter

  const {showPanel} = CM["@codemirror/view"];

  function wordCounter() {
    return showPanel.of(wordCountPanel)
  }

  //!create

  const {basicSetup} = CM["codemirror"];

  new EditorView({
    doc: "Type here and the editor will count your\nwords.",
    extensions: [basicSetup, wordCounter()],
    parent: document.querySelector("#count-editor")
  });

  exports.wordCounter = wordCounter;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
