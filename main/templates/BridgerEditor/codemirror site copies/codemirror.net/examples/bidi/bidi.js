(function () {
  'use strict';

  function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }//!htmlIsolates

  const {EditorView, Direction, ViewPlugin,
          Decoration,} = CM["@codemirror/view"];
  const {Prec} = CM["@codemirror/state"];
  const {syntaxTree} = CM["@codemirror/language"];


  const htmlIsolates = ViewPlugin.fromClass(class {
    
    

    constructor(view) {
      this.isolates = computeIsolates(view);
      this.tree = syntaxTree(view.state);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged ||
          syntaxTree(update.state) != this.tree) {
        this.isolates = computeIsolates(update.view);
        this.tree = syntaxTree(update.state);
      }
    }
  }, {
    provide: plugin => {
      function access(view) {
        return _nullishCoalesce(_optionalChain([view, 'access', _ => _.plugin, 'call', _2 => _2(plugin), 'optionalAccess', _3 => _3.isolates]), () => ( Decoration.none))
      }
      return Prec.lowest([EditorView.decorations.of(access),
                          EditorView.bidiIsolatedRanges.of(access)])
    }
  });

  //!computeIsolates

  const {RangeSetBuilder} = CM["@codemirror/state"];

  const isolate = Decoration.mark({
    attributes: {style: "direction: ltr; unicode-bidi: isolate"},
    bidiIsolate: Direction.LTR
  });

  function computeIsolates(view) {
    let set = new RangeSetBuilder();
    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter(node) {
          if (node.name == "OpenTag" || node.name == "CloseTag" ||
              node.name == "SelfClosingTag")
            set.add(node.from, node.to, isolate);
        }
      });
    }
    return set.finish()
  }

  //!create

  const {basicSetup} = CM["codemirror"];
  const {html} = CM["@codemirror/lang-html"];

  new EditorView({
    doc: `זהו עורך קוד מימין לשמאל.
يحتوي على شريط التمرير على الجانب الأيمن
`,
    extensions: basicSetup,
    parent: document.querySelector("#rtl_editor")
  });

  new EditorView({
    doc: `النص <span class="blue">الأزرق</span>\n`,
    extensions: [basicSetup, html(), htmlIsolates],
    parent: document.querySelector("#isolate_editor")
  });

})();
