(function () {
  'use strict';

  var _class;const { receiveUpdates, sendableUpdates, collab, getSyncedVersion} = CM["@codemirror/collab"];
  const {basicSetup} = CM["codemirror"];
  const {ChangeSet, EditorState, Text} = CM["@codemirror/state"];
  const {EditorView, ViewPlugin,} = CM["@codemirror/view"];(document.querySelector("#addpeer") ).onclick = addPeer;

  function pause(time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  function currentLatency() {
    let base = +(document.querySelector("#latency") ).value;
    return base * (1 + (Math.random() - 0.5))
  }

  class Connection {
     __init() {this.disconnected = null;}

    constructor( worker,
                 getLatency = currentLatency) {this.worker = worker;this.getLatency = getLatency;Connection.prototype.__init.call(this);}

     _request(value) {
      return new Promise(resolve => {
        let channel = new MessageChannel;
        channel.port2.onmessage = event => resolve(JSON.parse(event.data));
        this.worker.postMessage(JSON.stringify(value), [channel.port1]);
      })
    }

    async request(value) {
      let latency = this.getLatency();
      if (this.disconnected) await this.disconnected.wait;
      await pause(latency);
      let result = await this._request(value);
      if (this.disconnected) await this.disconnected.wait;
      await pause(latency);
      return result
    }

    setConnected(value) {
      if (value && this.disconnected) {
        this.disconnected.resolve();
        this.disconnected = null;
      } else if (!value && !this.disconnected) {
        let resolve, wait = new Promise(r => resolve = r);
        this.disconnected = {wait, resolve};
      }
    }
  }

  //!wrappers

  function pushUpdates(
    connection,
    version,
    fullUpdates
  ) {
    // Strip off transaction data
    let updates = fullUpdates.map(u => ({
      clientID: u.clientID,
      changes: u.changes.toJSON()
    }));
    return connection.request({type: "pushUpdates", version, updates})
  }

  function pullUpdates(
    connection,
    version
  ) {
    return connection.request({type: "pullUpdates", version})
      .then(updates => updates.map(u => ({
        changes: ChangeSet.fromJSON(u.changes),
        clientID: u.clientID
      })))
  }

  function getDocument(
    connection
  ) {
    return connection.request({type: "getDocument"}).then(data => ({
      version: data.version,
      doc: Text.of(data.doc.split("\n"))
    }))
  }

  //!peerExtension

  function peerExtension(startVersion, connection) {
    let plugin = ViewPlugin.fromClass( (_class =class {
       __init2() {this.pushing = false;}
       __init3() {this.done = false;}

      constructor( view) {this.view = view;_class.prototype.__init2.call(this);_class.prototype.__init3.call(this); this.pull(); }

      update(update) {
        if (update.docChanged) this.push();
      }

      async push() {
        let updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return
        this.pushing = true;
        let version = getSyncedVersion(this.view.state);
        await pushUpdates(connection, version, updates);
        this.pushing = false;
        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        if (sendableUpdates(this.view.state).length)
          setTimeout(() => this.push(), 100);
      }

      async pull() {
        while (!this.done) {
          let version = getSyncedVersion(this.view.state);
          let updates = await pullUpdates(connection, version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() { this.done = true; }
    }, _class));
    return [collab({startVersion}), plugin]
  }

  //!rest

  const worker = new Worker("./worker.js");

  async function addPeer() {
    let {version, doc} = await getDocument(new Connection(worker, () => 0));
    let connection = new Connection(worker);
    let state = EditorState.create({
      doc,
      extensions: [basicSetup, peerExtension(version, connection)]
    });
    let editors = document.querySelector("#editors");
    let wrap = editors.appendChild(document.createElement("div"));
    wrap.className = "editor";
    let cut = wrap.appendChild(document.createElement("div"));
    cut.innerHTML = "<label><input type=checkbox aria-description='Cut'>✂️</label>";
    cut.className = "cut-control";
    cut.querySelector("input").addEventListener("change", e => {
      let isCut = (e.target ).checked;
      wrap.classList.toggle("cut", isCut);
      connection.setConnected(!isCut);
    });
    new EditorView({state, parent: wrap});
  }

  addPeer();
  addPeer();

})();
