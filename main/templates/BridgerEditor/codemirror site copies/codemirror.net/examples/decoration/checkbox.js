(function () {
  'use strict';

  //!CheckboxWidget

  const {WidgetType} = CM["@codemirror/view"];

  class CheckboxWidget extends WidgetType {
    constructor( checked) { super();this.checked = checked; }

    eq(other) { return other.checked == this.checked }

    toDOM() {
      let wrap = document.createElement("span");
      wrap.setAttribute("aria-hidden", "true");
      wrap.className = "cm-boolean-toggle";
      let box = wrap.appendChild(document.createElement("input"));
      box.type = "checkbox";
      box.checked = this.checked;
      return wrap
    }

    ignoreEvent() { return false }
  }

  //!checkboxes

  const {EditorView, Decoration} = CM["@codemirror/view"];
  const {syntaxTree} = CM["@codemirror/language"];

  function checkboxes(view) {
    let widgets = [];
    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          if (node.name == "BooleanLiteral") {
            let isTrue = view.state.doc.sliceString(node.from, node.to) == "true";
            let deco = Decoration.widget({
              widget: new CheckboxWidget(isTrue),
              side: 1
            });
            widgets.push(deco.range(node.to));
          }
        }
      });
    }
    return Decoration.set(widgets)
  }

  //!toggleBoolean

  function toggleBoolean(view, pos) {
    let before = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
    let change;
    if (before == "false")
      change = {from: pos - 5, to: pos, insert: "true"};
    else if (before.endsWith("true"))
      change = {from: pos - 4, to: pos, insert: "false"};
    else
      return false
    view.dispatch({changes: change});
    return true
  }

  //!checkboxPlugin

  const { ViewPlugin,} = CM["@codemirror/view"];

  const checkboxPlugin = ViewPlugin.fromClass(class {
    

    constructor(view) {
      this.decorations = checkboxes(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged ||
          syntaxTree(update.startState) != syntaxTree(update.state))
        this.decorations = checkboxes(update.view);
    }
  }, {
    decorations: v => v.decorations,

    eventHandlers: {
      mousedown: (e, view) => {
        let target = e.target; 
        if (target.nodeName == "INPUT" &&
            target.parentElement.classList.contains("cm-boolean-toggle"))
          return toggleBoolean(view, view.posAtDOM(target))
      }
    }
  });

  //!create

  const {basicSetup} = CM["codemirror"];
  const {javascript} = CM["@codemirror/lang-javascript"];

  new EditorView({
    doc: "let value = true\nif (!value == false)\n  console.log(\"good\")\n",
    extensions: [checkboxPlugin, basicSetup, javascript()],
    parent: document.querySelector("#editor-checkbox")
  });

})();
