const el = (id) => document.getElementById(id);
    const components = [];
    const selectedLogics = [];

    const escHtml = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    const escJs = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/\"/g, '\\"').replace(/\r?\n/g, " ");
    const safeId = (v) => String(v || "").trim().replace(/[^A-Za-z0-9_:-]/g, "_");
    const safeKey = (v) => String(v || "").trim().replace(/[^A-Za-z0-9_]/g, "_");

    function renderChips() {
      const box = el("chips");
      if (!components.length) {
        box.innerHTML = '<span class="muted">No elements</span>';
        return;
      }
      box.innerHTML = "";
      components.forEach((c, i) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.innerText = c.id + " (" + c.type + ")";
        chip.onclick = () => { components.splice(i, 1); renderChips(); };
        box.appendChild(chip);
      });
    }

    function renderLogicChips() {
      const box = el("logicChips");
      if (!selectedLogics.length) {
        box.innerHTML = '<span class="muted">No logic selected</span>';
        return;
      }
      box.innerHTML = "";
      selectedLogics.forEach((k, i) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.innerText = k;
        chip.onclick = () => { selectedLogics.splice(i, 1); renderLogicChips(); };
        box.appendChild(chip);
      });
    }

    function componentToHtml(c) {
      const id = safeId(c.id);
      const label = escHtml(c.label || id);
      if (["input", "number", "email", "password", "tel", "url", "range", "date", "time"].includes(c.type)) {
        const t = c.type === "input" ? "text" : c.type;
        return '<label for="' + id + '">' + label + '</label>\n<input type="' + t + '" id="' + id + '" />\n';
      }
      if (c.type === "textarea") return '<label for="' + id + '">' + label + '</label>\n<textarea id="' + id + '"></textarea>\n';
      if (c.type === "select") {
        const opts = String(c.extra || "").split(",").map((x) => x.trim()).filter(Boolean);
        const optionsHtml = opts.length ? opts.map((o) => '<option value="' + escHtml(o) + '">' + escHtml(o) + '</option>').join("") : '<option value="">Select</option>';
        return '<label for="' + id + '">' + label + '</label>\n<select id="' + id + '">' + optionsHtml + '</select>\n';
      }
      if (c.type === "checkbox") return '<label><input type="checkbox" id="' + id + '" /> ' + label + '</label>\n';
      if (c.type === "radio") {
        const opts = String(c.extra || "Option 1,Option 2").split(",").map((x) => x.trim()).filter(Boolean);
        const radios = opts.map((o) => '<label><input type="radio" name="' + id + '" value="' + escHtml(o) + '" /> ' + escHtml(o) + '</label>').join("\n");
        return '<label>' + label + '</label>\n' + radios + '\n';
      }
      if (c.type === "upload") return '<label for="' + id + '">' + label + '</label>\n<input type="file" id="' + id + '" />\n';
      if (c.type === "image") return '<img id="' + id + '" src="" alt="' + label + '" />\n';
      if (c.type === "list") {
        const items = String(c.extra || "Item 1,Item 2").split(",").map((x) => x.trim()).filter(Boolean);
        const lis = items.map((it) => '<li>' + escHtml(it) + '</li>').join("");
        return '<ul id="' + id + '">' + lis + '</ul>\n';
      }
      if (c.type === "table") {
        const cols = String(c.extra || "ID,Name").split(",").map((x) => x.trim()).filter(Boolean);
        const th = cols.map((col) => '<th>' + escHtml(col) + '</th>').join("");
        return '<table id="' + id + '"><thead><tr>' + th + '</tr></thead><tbody id="' + id + '_body"></tbody></table>\n';
      }
      if (c.type === "label") return '<label id="' + id + '">' + label + '</label>\n';
      return '<div id="' + id + '">' + label + '</div>\n';
    }

    function generateHTML() {
      return components.map(componentToHtml).join("\n") || "<!-- No elements -->";
    }

    function getDataFields() {
      const skip = new Set(["label", "image", "upload", "list", "table"]);
      return components.filter((c) => !skip.has(c.type));
    }

    function valueExpr(c) {
      const id = escJs(safeId(c.id));
      if (c.type === "checkbox") return 'document.getElementById("' + id + '").checked';
      if (c.type === "radio") return '(document.querySelector(\'input[name="' + id + '"]:checked\')?.value || "")';
      return 'document.getElementById("' + id + '").value';
    }

    function setExpr(c) {
      const id = escJs(safeId(c.id));
      const key = safeKey(c.id);
      if (c.type === "checkbox") return 'document.getElementById("' + id + '").checked = !!data["' + key + '"];';
      if (c.type === "radio") return 'const r_' + key + '=document.querySelector(\'input[name="' + id + '"][value="\'+(data["' + key + '"]||\'\')+\'"]\'); if(r_' + key + ') r_' + key + '.checked=true;';
      return 'document.getElementById("' + id + '").value = data["' + key + '"] || "";';
    }

    function commonMeta() {
      const node = escJs((el("nodePath").value || "users").trim());
      const idField = escJs(safeId((el("idField").value || "id").trim()));
      const fields = getDataFields();
      const payload = fields.map((c) => '"' + safeKey(c.id) + '": ' + valueExpr(c)).join(",\n    ");
      const setters = fields.map((c) => '    ' + setExpr(c)).join("\n");
      return { node, idField, payload, setters };
    }

    function generateFirebaseConfig() {
      return [
        "// Firebase v8 compat setup",
        "// Required CDN files:",
        "// firebase-app-compat.js",
        "// firebase-database-compat.js",
        "",
        "const firebaseConfig = {",
        "  apiKey: \"YOUR_API_KEY\",",
        "  authDomain: \"YOUR_PROJECT.firebaseapp.com\",",
        "  databaseURL: \"https://YOUR_PROJECT-default-rtdb.firebaseio.com\",",
        "  projectId: \"YOUR_PROJECT_ID\"",
        "};",
        "",
        "firebase.initializeApp(firebaseConfig);",
        "const db = firebase.database();"
      ].join("\n");
    }

    function generateAddFunction() {
      const m = commonMeta();
      return [
        "function addRecord(){",
        '  const id = document.getElementById("' + m.idField + '").value.trim();',
        '  if(!id) return Swal.fire("Warning","Enter ' + m.idField + '","warning");',
        "  const data = {",
        "    " + m.payload,
        "  };",
        '  db.ref("' + m.node + '/" + id).set(data)',
        '    .then(()=>Swal.fire("Saved","Record added","success"))',
        '    .catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generateFetchFunction() {
      const m = commonMeta();
      return [
        "function fetchRecordById(){",
        '  const id = document.getElementById("' + m.idField + '").value.trim();',
        '  if(!id) return Swal.fire("Info","Enter ' + m.idField + '","info");',
        '  db.ref("' + m.node + '/" + id).once("value").then((s)=>{',
        '    if(!s.exists()) return Swal.fire("Info","No record found","info");',
        "    const data = s.val() || {};",
        m.setters,
        '    Swal.fire("Done","Record loaded","success");',
        '  }).catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generateFetchAllFunction() {
      const m = commonMeta();
      return [
        "function fetchAllRecords(){",
        '  db.ref("' + m.node + '").once("value").then((s)=>{',
        "    const all = s.val() || {};",
        "    console.log(all);",
        '    Swal.fire("Done","Fetched all records. Check console.","success");',
        "    return all;",
        '  }).catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generateUpdateFunction() {
      const m = commonMeta();
      return [
        "function updateRecord(){",
        '  const id = document.getElementById("' + m.idField + '").value.trim();',
        '  if(!id) return Swal.fire("Warning","Enter ' + m.idField + '","warning");',
        "  const data = {",
        "    " + m.payload,
        "  };",
        '  db.ref("' + m.node + '/" + id).update(data)',
        '    .then(()=>Swal.fire("Updated","Record updated","success"))',
        '    .catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generateDeleteFunction() {
      const m = commonMeta();
      return [
        "function deleteRecordById(){",
        '  const id = document.getElementById("' + m.idField + '").value.trim();',
        '  if(!id) return Swal.fire("Warning","Enter ' + m.idField + '","warning");',
        '  Swal.fire({title:"Delete?", text:id, icon:"warning", showCancelButton:true})',
        '    .then((r)=>{',
        '      if(!r.isConfirmed) return;',
        '      return db.ref("' + m.node + '/" + id).remove()',
        '        .then(()=>Swal.fire("Deleted","Record removed","success"));',
        '    })',
        '    .catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generateDeleteAllFunction() {
      const m = commonMeta();
      return [
        "function deleteAllRecords(){",
        '  Swal.fire({title:"Delete all data?", icon:"warning", showCancelButton:true, confirmButtonText:"Delete All"})',
        '    .then((r)=>{',
        '      if(!r.isConfirmed) return;',
        '      return db.ref("' + m.node + '").remove()',
        '        .then(()=>Swal.fire("Done","All records deleted","success"));',
        '    })',
        '    .catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}"
      ].join("\n");
    }

    function generatePopulateTableFunction() {
      const m = commonMeta();
      return [
        "function populateTable(tableBodyId=\"tableBody\"){",
        "  const tbody = document.getElementById(tableBodyId);",
        '  if(!tbody) return Swal.fire("Info","table body not found","info");',
        '  db.ref("' + m.node + '").once("value").then((s)=>{',
        "    const data = s.val() || {};",
        "    tbody.innerHTML = \"\";",
        "    Object.keys(data).forEach((key)=>{",
        "      const tr = document.createElement(\"tr\");",
        "      tr.innerHTML = \"<td>\" + key + \"</td><td><button onclick=\\\"loadFromRow('\" + key + \"')\\\">Load</button></td>\";",
        "      tbody.appendChild(tr);",
        "    });",
        '    Swal.fire("Done","Table populated","success");',
        '  }).catch((e)=>Swal.fire("Error",e.message,"error"));',
        "}",
        "",
        "function loadFromRow(id){",
        '  const idInput = document.getElementById("' + m.idField + '");',
        "  if(idInput) idInput.value = id;",
        "  if(typeof fetchRecordById === \"function\") fetchRecordById();",
        "}"
      ].join("\n");
    }

    function generateExcelFunction() {
      return [
        "function exportTableToExcel(tableId=\"dataTable\", fileName=\"report.xls\"){",
        "  const table = document.getElementById(tableId);",
        '  if(!table) return Swal.fire("Info","Table not found","info");',
        "  const html = table.outerHTML.replace(/ /g, \"%20\");",
        "  const a = document.createElement(\"a\");",
        "  a.href = \"data:application/vnd.ms-excel,\" + html;",
        "  a.download = fileName;",
        "  a.click();",
        '  Swal.fire("Done","Excel exported","success");',
        "}"
      ].join("\n");
    }

    function generateCRUD() {
      return [
        generateFirebaseConfig(), "",
        generateAddFunction(), "",
        generateFetchFunction(), "",
        generateFetchAllFunction(), "",
        generateUpdateFunction(), "",
        generateDeleteFunction(), "",
        generateDeleteAllFunction(), "",
        generatePopulateTableFunction(), "",
        generateExcelFunction()
      ].join("\n");
    }

    function getGeneratorMap() {
      return {
        config: generateFirebaseConfig,
        add: generateAddFunction,
        fetch: generateFetchFunction,
        fetchAll: generateFetchAllFunction,
        update: generateUpdateFunction,
        delete: generateDeleteFunction,
        deleteAll: generateDeleteAllFunction,
        populate: generatePopulateTableFunction,
        excel: generateExcelFunction
      };
    }

    function generateSelectedBundle() {
      if (!selectedLogics.length) return "// No logic selected";
      const map = getGeneratorMap();
      return selectedLogics.map((k) => (map[k] ? map[k]() : "// Unknown logic: " + k)).join("\n\n");
    }

    function sanitizeGeneratedFunctions(code) {
      let clean = String(code || "");
      clean = clean.replace(/<\/(script)/gi, "<\\/$1");
      return clean;
    }

    function generateFullPageTemplate() {
      const title = escHtml((el("pageTitle").value || "My App").trim());
      const styleText = document.querySelector("style") ? document.querySelector("style").textContent : "";
      const htmlCodes = generateHTML();
      const rawFunctionsCode = selectedLogics.length ? generateSelectedBundle() : generateCRUD();
      const functionsCode = sanitizeGeneratedFunctions(rawFunctionsCode);
      const cs = "<" + "/script>";

      return [
        "<!doctype html>",
        "<html lang=\"en\">",
        "  <head>",
        "    <meta charset=\"UTF-8\" />",
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
        "    <title>" + title + "</title>",
        "    <script src=\"https://cdn.jsdelivr.net/npm/sweetalert2@11\">" + cs,
        "    <script src=\"https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js\">" + cs,
        "    <script src=\"https://www.gstatic.com/firebasejs/10.3.1/firebase-database-compat.js\">" + cs,
        "    <script src=\"https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js\">" + cs,
        "    <style>",
        styleText,
        "    </style>",
        "  </head>",
        "  <body>",
        htmlCodes,
        "    <script>",
        functionsCode,
        "    " + cs,
        "  </body>",
        "</html>"
      ].join("\n");
    }

    function updateExtraHint() {
      const type = el("elementType").value;
      const l = el("cfg_extra_label");
      const i = el("cfg_extra");
      if (type === "select") { l.innerText = "Options (comma separated)"; i.placeholder = "active,pending,closed"; }
      else if (type === "list") { l.innerText = "List Items (comma separated)"; i.placeholder = "item1,item2,item3"; }
      else if (type === "table") { l.innerText = "Columns (comma separated)"; i.placeholder = "id,name,status"; }
      else if (type === "radio") { l.innerText = "Radio Options (comma separated)"; i.placeholder = "Option 1,Option 2"; }
      else { l.innerText = "Extra (for select/list/table/radio)"; i.placeholder = "option1,option2 OR col1,col2"; }
    }

    el("addElement").onclick = () => {
      const type = el("elementType").value;
      const id = safeId(el("cfg_id").value || "");
      const label = (el("cfg_label").value || "").trim();
      const extra = (el("cfg_extra").value || "").trim();
      if (!id) return Swal.fire("Warning", "ID required", "warning");
      components.push({ type: type, id: id, label: label, extra: extra });
      renderChips();
      el("cfg_id").value = "";
      el("cfg_label").value = "";
    };

    el("genHTML").onclick = () => { el("output").innerText = generateHTML(); };
    el("genJS").onclick = () => { el("output").innerText = generateCRUD(); };
    el("genPage").onclick = () => { el("output").innerText = generateFullPageTemplate(); };
    el("genConfig").onclick = () => { el("output").innerText = generateFirebaseConfig(); };
    el("genAdd").onclick = () => { el("output").innerText = generateAddFunction(); };
    el("genFetch").onclick = () => { el("output").innerText = generateFetchFunction(); };
    el("genFetchAll").onclick = () => { el("output").innerText = generateFetchAllFunction(); };
    el("genUpdate").onclick = () => { el("output").innerText = generateUpdateFunction(); };
    el("genDelete").onclick = () => { el("output").innerText = generateDeleteFunction(); };
    el("genDeleteAll").onclick = () => { el("output").innerText = generateDeleteAllFunction(); };
    el("genPopulate").onclick = () => { el("output").innerText = generatePopulateTableFunction(); };
    el("genExcel").onclick = () => { el("output").innerText = generateExcelFunction(); };

    el("addLogic").onclick = () => {
      selectedLogics.push(el("logicType").value);
      renderLogicChips();
    };

    el("clearLogic").onclick = () => {
      selectedLogics.length = 0;
      renderLogicChips();
    };

    el("genLogicBundle").onclick = () => {
      el("output").innerText = generateSelectedBundle();
    };

    el("elementType").addEventListener("change", updateExtraHint);

    function copyCode() {
      navigator.clipboard.writeText(el("output").innerText || "");
      Swal.fire("Copied");
    }

    function downloadCode() {
      const blob = new Blob([el("output").innerText || ""], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "generated.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    }

    renderChips();
    renderLogicChips();
    updateExtraHint();
