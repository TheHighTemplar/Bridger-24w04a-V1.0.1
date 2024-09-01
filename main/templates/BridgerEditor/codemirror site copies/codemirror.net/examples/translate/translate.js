(function () {
  'use strict';

  //!germanPhrases

  const germanPhrases = {
    // @codemirror/view
    "Control character": "Steuerzeichen",
    // @codemirror/commands
    "Selection deleted": "Auswahl gelöscht",
    // @codemirror/language
    "Folded lines": "Eingeklappte Zeilen",
    "Unfolded lines": "Ausgeklappte Zeilen",
    "to": "bis",
    "folded code": "eingeklappter Code",
    "unfold": "ausklappen",
    "Fold line": "Zeile einklappen",
    "Unfold line": "Zeile ausklappen",
    // @codemirror/search
    "Go to line": "Springe zu Zeile",
    "go": "OK",
    "Find": "Suchen",
    "Replace": "Ersetzen",
    "next": "nächste",
    "previous": "vorherige",
    "all": "alle",
    "match case": "groß/klein beachten",
    "by word": "ganze Wörter",
    "replace": "ersetzen",
    "replace all": "alle ersetzen",
    "close": "schließen",
    "current match": "aktueller Treffer",
    "replaced $ matches": "$ Treffer ersetzt",
    "replaced match on line $": "Treffer on Zeile $ ersetzt",
    "on line": "auf Zeile",
    // @codemirror/autocomplete
    "Completions": "Vervollständigungen",
    // @codemirror/lint
    "Diagnostics": "Diagnosen",
    "No diagnostics": "Keine Diagnosen",
  };

  //!create

  const {EditorView, basicSetup} = CM["codemirror"];
  const {EditorState} = CM["@codemirror/state"];(window ).view = new EditorView({
    doc: `CodeMirror auf Deutsch übersetzt

Versuche zum Beispiel Strg-F für die Suchfunktion, oder bewege die
Mauszeiger über dieses Zeichen: \u0011
`,
    extensions: [basicSetup, EditorState.phrases.of(germanPhrases)],
    parent: document.querySelector("#editor")
  });

})();
