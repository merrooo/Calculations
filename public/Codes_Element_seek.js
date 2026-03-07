const el = (id) => document.getElementById(id);
const components = [];

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

function componentToHtml(c) {
    const id = safeId(c.id);
    const label = escHtml(c.label || id);
    if (["input", "number", "email", "password", "tel", "url", "range", "date", "time"].includes(c.type)) {
        const t = c.type === "input" ? "text" : c.type;
        return '<label for="' + id + '">' + label + '</label>\n<input type="' + t + '" id="' + id + '" />\n';
    }
    if (c.type === "upload") {
        return '<label for="' + id + '">' + label + '</label>\n' +
               '<input type="file" id="' + id + '" class="file-input" />\n' +
               '<small id="' + id + '_status" class="muted" style="display:block; margin-bottom:10px;"></small>\n';
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
    if (c.type === "image") return '<img id="' + id + '" src="" alt="' + label + '" style="max-width:100%; display:block; margin:10px 0;" />\n';
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
    return components.map(componentToHtml).join("\n") || "";
}

function valueExpr(c) {
    const id = escJs(safeId(c.id));
    if (c.type === "checkbox") return 'document.getElementById("' + id + '").checked';
    if (c.type === "radio") return '(document.querySelector(\'input[name="' + id + '"]:checked\')?.value || "")';
    if (c.type === "upload") {
        return '((() => { const f = document.getElementById("' + id + '"); return f.files[0] ? f.files[0].name : (f.dataset.savedName || ""); })())';
    }
    if (c.type === "image") return '(document.getElementById("' + id + '")?.getAttribute("src") || "")';
    if (c.type === "label") return '(document.getElementById("' + id + '")?.textContent || "")';
    if (c.type === "list") return 'JSON.stringify(Array.from(document.querySelectorAll("#' + id + ' li")).map((li)=>li.textContent || ""))';
    if (c.type === "table") return 'JSON.stringify(Array.from(document.querySelectorAll("#' + id + ' tbody tr")).map((tr)=>Array.from(tr.cells).map((td)=>td.textContent || "")))';
    return 'document.getElementById("' + id + '").value';
}

function setExpr(c) {
    const id = escJs(safeId(c.id));
    const key = safeKey(c.id);
    if (c.type === "checkbox") return 'document.getElementById("' + id + '").checked = !!data["' + key + '"];';
    if (c.type === "radio") return 'const r_' + key + '=document.querySelector(\'input[name="' + id + '"][value="\'+(data["' + key + '"]||\'\')+\'"]\'); if(r_' + key + ') r_' + key + '.checked=true;';
    if (c.type === "upload") {
        return 'const up_' + key + ' = document.getElementById("' + id + '"); if(up_' + key + '){ const st_' + key + ' = document.getElementById("' + id + '_status"); up_' + key + '.dataset.savedName = data["' + key + '"] || ""; if(st_' + key + ') st_' + key + '.innerText = data["' + key + '"] ? "Saved: " + data["' + key + '"] : ""; }';
    }
    if (c.type === "image") return 'const img_' + key + '=document.getElementById("' + id + '"); if(img_' + key + '){ img_' + key + '.src = data["' + key + '"] || ""; }';
    if (c.type === "label") return 'const lbl_' + key + '=document.getElementById("' + id + '"); if(lbl_' + key + '){ lbl_' + key + '.textContent = data["' + key + '"] || ""; }';
    if (c.type === "list") return 'try{ const list_' + key + '=document.getElementById("' + id + '"); const arr_' + key + '=JSON.parse(data["' + key + '"] || "[]"); if(list_' + key + ' && Array.isArray(arr_' + key + ')){ list_' + key + '.innerHTML = arr_' + key + '.map((x)=>"<li>"+x+"</li>").join(""); } }catch(_e){}';
    if (c.type === "table") return 'try{ const body_' + key + '=document.querySelector("#' + id + ' tbody"); const rows_' + key + '=JSON.parse(data["' + key + '"] || "[]"); if(body_' + key + ' && Array.isArray(rows_' + key + ')){ body_' + key + '.innerHTML = rows_' + key + '.map((r)=>"<tr>"+(Array.isArray(r)?r:[r]).map((v)=>"<td>"+v+"</td>").join("")+"</tr>").join(""); } }catch(_e){}';
    return 'document.getElementById("' + id + '").value = data["' + key + '"] || "";';
}

function commonMeta() {
    const node = escJs((el("nodePath").value || "users").trim());
    const idField = escJs(safeId((el("idField").value || "id").trim()));
    const fields = components.slice();
    const payload = fields.map((c) => '"' + safeKey(c.id) + '": ' + valueExpr(c)).join(",\n        ");
    const setters = fields.map((c) => '    ' + setExpr(c)).join("\n");
    return { node, idField, payload, setters };
}

function generateFirebaseConfig() {
    return [
        "// Firebase Config",
        "const firebaseConfig = {",
        "  apiKey: \"YOUR_API_KEY\",",
        "  authDomain: \"ndedc-meter-calib.firebaseapp.com\",",
        "  databaseURL: \"https://ndedc-meter-calib-default-rtdb.firebaseio.com\",",
        "  projectId: \"ndedc-meter-calib\",",
        "  storageBucket: \"ndedc-meter-calib.appspot.com\",",
        "  appId: \"1:185425429190:web:dce85f29eea55ad9f54dc7\"",
        "};",
        "firebase.initializeApp(firebaseConfig);",
        "const db = firebase.database();"
    ].join("\n");
}

function generateAddFunction() {
    const m = commonMeta();
    return [
        "async function addRecord(){",
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

function generateUpdateFunction() {
    const m = commonMeta();
    return [
        "async function updateRecord(){",
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

function generatePopulateTableFunction() {
    const m = commonMeta();
    const tableComp = components.find((c) => c.type === "table");
    const tableId = tableComp ? safeId(tableComp.id) : "dataTable";
    const tableBodyId = tableComp ? tableId + "_body" : "tableBody";
    const columns = tableComp ? String(tableComp.extra || "").split(",").map((x) => safeKey(x.trim())).filter(Boolean) : [];
    const cellExpr = columns.length ? columns.map((col) => '"<td>" + (row["' + escJs(col) + '"] ?? "") + "</td>"').join(" + ") : '"<td>" + key + "</td><td>" + JSON.stringify(row) + "</td>"';
    return [
        "function populateTable(tableBodyId=\"" + tableBodyId + "\"){",
        "  const tbody = document.getElementById(tableBodyId);",
        '  if(!tbody) return;',
        '  db.ref("' + m.node + '").once("value").then((s)=>{',
        "    const data = s.val() || {};",
        "    tbody.innerHTML = \"\";",
        "    Object.keys(data).forEach((key)=>{",
        "      const row = data[key] || {};",
        "      const tr = document.createElement(\"tr\");",
        "      tr.innerHTML = " + cellExpr + " + \"<td><button onclick=\\\"loadFromRow('\" + key + \"')\\\">Load</button></td>\";",
        "      tbody.appendChild(tr);",
        "    });",
        '  });',
        "}",
        "function loadFromRow(id){",
        '  const idInput = document.getElementById("' + m.idField + '");',
        "  if(idInput) idInput.value = id;",
        "  fetchRecordById();",
        "}"
    ].join("\n");
}

function generateCRUD() {
    return [
        generateFirebaseConfig(), "",
        generateAddFunction(), "",
        generateFetchFunction(), "",
        generateUpdateFunction(), "",
        generateDeleteFunction(), "",
        generatePopulateTableFunction()
    ].join("\n");
}

function generateFullPageTemplate() {
    const title = escHtml((el("pageTitle").value || "My App").trim());
    const htmlCodes = generateHTML();
    const functionsCode = sanitizeGeneratedFunctions(generateCRUD());
    return [
        "<!doctype html>",
        "<html lang=\"en\">",
        "<head>",
        "    <meta charset=\"UTF-8\">",
        "    <title>" + title + "</title>",
        "    <script src=\"https://cdn.jsdelivr.net/npm/sweetalert2@11\"></script>",
        "    <script src=\"https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js\"></script>",
        "    <script src=\"https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js\"></script>",
        "    <style>body{font-family:sans-serif; padding:20px; background:#f0f2f5;} label{display:block; margin-top:10px; font-weight:bold;} input,select,textarea{width:100%; padding:8px; margin-top:4px;} button{margin-top:20px; padding:10px 20px; cursor:pointer;} table{width:100%; border-collapse:collapse; margin-top:20px;} th,td{border:1px solid #ddd; padding:8px; text-align:left;} th{background:#eee;}</style>",
        "</head>",
        "<body>",
        "    <h2>" + title + "</h2>",
        htmlCodes,
        "    <div class='actions'>",
        "        <button onclick='addRecord()'>Add</button>",
        "        <button onclick='fetchRecordById()'>Fetch</button>",
        "        <button onclick='updateRecord()'>Update</button>",
        "        <button onclick='deleteRecordById()'>Delete</button>",
        "        <button onclick='populateTable()'>List All</button>",
        "    </div>",
        "    <script>",
        functionsCode,
        "    </script>",
        "</body>",
        "</html>"
    ].join("\n");
}

function sanitizeGeneratedFunctions(code) {
    return String(code || "").replace(/<\/(script)/gi, "<\\/$1");
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
el("genPage").onclick = () => { el("output").innerText = generateFullPageTemplate(); };
el("genSnippet").onclick = () => {
    const type = el("snippetType").value;
    const map = { config: generateFirebaseConfig, add: generateAddFunction, fetch: generateFetchFunction, update: generateUpdateFunction, delete: generateDeleteFunction, populate: generatePopulateTableFunction };
    el("output").innerText = type === "all" ? generateCRUD() : (map[type] ? map[type]() : "// Unknown");
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
    a.download = "generated_code.txt";
    a.click();
}

renderChips();
updateExtraHint();