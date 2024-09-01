(function () {
  'use strict';

  //!regexpLint

  const {syntaxTree} = CM["@codemirror/language"];
  const {linter,} = CM["@codemirror/lint"];

  const regexpLinter = linter(view => {
    let diagnostics = [];
    syntaxTree(view.state).cursor().iterate(node => {
      if (node.name == "RegExp") diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "warning",
        message: "Regular expressions are FORBIDDEN",
        actions: [{
          name: "Remove",
          apply(view, from, to) { view.dispatch({changes: {from, to}}); }
        }]
      });
    });
    return diagnostics
  });

  //!editor

  const {basicSetup, EditorView} = CM["codemirror"];
  const {javascript} = CM["@codemirror/lang-javascript"];
  const {lintGutter} = CM["@codemirror/lint"];

  new EditorView({
    doc: `function isNumber(string) {
  return /^\\d+(\\.\\d*)?$/.test(string)
}`,
    extensions: [
      basicSetup,
      javascript(),
      lintGutter(),
      regexpLinter
    ],
    parent: document.querySelector("#editor")
  });

})();
