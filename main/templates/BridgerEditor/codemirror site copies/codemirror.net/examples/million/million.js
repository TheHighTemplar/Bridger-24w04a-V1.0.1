(function () {
  'use strict';

  const {Text} = CM["@codemirror/state"];
  const {EditorView, drawSelection, keymap, lineNumbers} = CM["@codemirror/view"];
  const {defaultKeymap, history, historyKeymap} = CM["@codemirror/commands"];
  const {syntaxHighlighting, defaultHighlightStyle} = CM["@codemirror/language"];
  const {html} = CM["@codemirror/lang-html"];

  let lines = [`<!doctype html>`, `<meta charset="utf8">`, `<body>`];
  let repeated = [`  <p>These lines are repeated many times to save memory on`,
                  `  string data.</p>`,
                  `  <hr>`,
                  `  <img src="../../style/logo.svg">`,
                  ``];
  for (let i = 0; lines.length < 2e6; i++) lines.push(repeated[i % repeated.length]);
  lines.push(`</body>`, ``)

  ;(window ).view = new EditorView({
    doc: Text.of(lines),
    extensions: [
      keymap.of([...defaultKeymap, ...historyKeymap]),
      history(),
      drawSelection(),
      syntaxHighlighting(defaultHighlightStyle),
      lineNumbers(),
      html()
    ],
    parent: document.querySelector("#editor")
  });

})();
