
    const el = (id) => document.getElementById(id);
    const components = [];
    const selectedLogic = new Set(["add", "modify", "show", "delete", "populate", "excel"]);
    
    // Helpers
    function esc(s) {
      return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function setOutput(title, text) {
      el("outTitle").innerText = title;
      el("output").innerText = text;
      el("previewFrame").style.display = "none";
      el("output").style.display = "block";
    }

    function showPreview() {
      const code = el("output").innerText;
      if (!code.trim()) return Swal.fire("Info", "No code to preview", "info");
      
      const frame = el("previewFrame");
      frame.style.display = "block";
      el("output").style.display = "none";
      
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      frame.src = url;
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // Element configuration generator
    function renderElementConfig() {
      const t = el("elementType").value;
      let html = "";

      // Common fields for most elements
      const commonFields = `
        <label>Element ID</label><input id="cfg_id" placeholder="element_id" />
        <label>CSS Classes</label><input id="cfg_class" placeholder="class1 class2" />
        <label>Inline Styles</label><input id="cfg_style" placeholder="color: red; margin: 10px;" />`;

      if (t === "input" || t === "number" || t === "email" || t === "password" || t === "tel" || t === "url") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="field_name" />
          <label>Label</label><input id="cfg_label" placeholder="Field Label" />
          <label>Placeholder</label><input id="cfg_placeholder" placeholder="Enter value" />
          <label>Default Value</label><input id="cfg_value" placeholder="Default" />
          <label>Validation</label><select id="cfg_validation"><option value="">None</option><option value="required">Required</option><option value="email">Email</option><option value="number">Number</option><option value="pattern">Pattern</option></select>
          ${commonFields}`;
      } 
      else if (t === "range") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="slider" />
          <label>Label</label><input id="cfg_label" placeholder="Volume" />
          <label>Min / Max / Step</label><input id="cfg_min" placeholder="0" style="width:30%; display:inline;" /> 
          <input id="cfg_max" placeholder="100" style="width:30%; display:inline;" />
          <input id="cfg_step" placeholder="1" style="width:30%; display:inline;" />
          ${commonFields}`;
      }
      else if (t === "color") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="color_picker" />
          <label>Label</label><input id="cfg_label" placeholder="Pick color" />
          <label>Default Color</label><input type="color" id="cfg_value" value="#ff0000" />
          ${commonFields}`;
      }
      else if (t === "textarea") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="description" />
          <label>Label</label><input id="cfg_label" placeholder="Description" />
          <label>Rows / Cols</label><input id="cfg_rows" placeholder="4" style="width:45%; display:inline;" /> <input id="cfg_cols" placeholder="50" style="width:45%; display:inline;" />
          <label>Placeholder</label><input id="cfg_placeholder" placeholder="Write here..." />
          ${commonFields}`;
      }
      else if (t === "select") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="status" />
          <label>Label</label><input id="cfg_label" placeholder="Status" />
          <label>Options (key:value pairs)</label>
          <textarea id="cfg_options" placeholder="active:Active&#10;pending:Pending&#10;closed:Closed"></textarea>
          <label>Multiple Select</label><input type="checkbox" id="cfg_multiple" />
          ${commonFields}`;
      }
      else if (t === "radio" || t === "checkbox") {
        html = `
          <label>Group Name</label><input id="cfg_id" placeholder="options" />
          <label>Label</label><input id="cfg_label" placeholder="Options" />
          <label>Options (comma separated)</label><input id="cfg_options" placeholder="Option1,Option2,Option3" />
          <label>Layout</label><select id="cfg_layout"><option value="inline">Inline</option><option value="stacked">Stacked</option></select>
          ${commonFields}`;
      }
      else if (t === "date" || t === "time" || t === "datetime" || t === "month" || t === "week") {
        html = `
          <label>Field ID</label><input id="cfg_id" placeholder="date_field" />
          <label>Label</label><input id="cfg_label" placeholder="Select date" />
          <label>Min / Max</label><input id="cfg_min" placeholder="Min" style="width:45%; display:inline;" /> <input id="cfg_max" placeholder="Max" style="width:45%; display:inline;" />
          ${commonFields}`;
      }
      else if (t === "upload") {
        html = `
          <label>Input ID</label><input id="cfg_id" value="fileUpload" />
          <label>Label</label><input id="cfg_label" placeholder="Choose file" />
          <label>Accept</label><input id="cfg_accept" value="image/*,.pdf,.doc" />
          <label>Multiple</label><input type="checkbox" id="cfg_multiple" />
          ${commonFields}`;
      }
      else if (t === "image") {
        html = `
          <label>Image ID</label><input id="cfg_id" value="previewImg" />
          <label>Image Src</label><input id="cfg_src" placeholder="https://..." />
          <label>Alt Text</label><input id="cfg_alt" placeholder="Description" />
          <label>Width/Height</label><input id="cfg_width" placeholder="200px" style="width:45%; display:inline;" /> <input id="cfg_height" placeholder="auto" style="width:45%; display:inline;" />
          ${commonFields}`;
      }
      else if (t === "audio" || t === "video") {
        html = `
          <label>${t === "audio" ? "Audio" : "Video"} ID</label><input id="cfg_id" placeholder="media_player" />
          <label>Source URL</label><input id="cfg_src" placeholder="media.mp4" />
          <label>Controls</label><input type="checkbox" id="cfg_controls" checked /> Autoplay: <input type="checkbox" id="cfg_autoplay" /> Loop: <input type="checkbox" id="cfg_loop" />
          ${commonFields}`;
      }
      else if (t === "canvas") {
        html = `
          <label>Canvas ID</label><input id="cfg_id" value="myCanvas" />
          <label>Width / Height</label><input id="cfg_width" placeholder="300" style="width:45%; display:inline;" /> <input id="cfg_height" placeholder="150" style="width:45%; display:inline;" />
          <label>Sample Drawing</label><select id="cfg_draw"><option value="">None</option><option value="rect">Rectangle</option><option value="circle">Circle</option><option value="line">Line</option><option value="text">Text</option></select>
          ${commonFields}`;
      }
      else if (t === "button") {
        html = `
          <label>Button Text</label><input id="cfg_text" placeholder="Click Me" />
          <label>Button Type</label><select id="cfg_btntype"><option value="button">Button</option><option value="submit">Submit</option><option value="reset">Reset</option></select>
          <label>OnClick Function</label><input id="cfg_onclick" placeholder="myFunction()" />
          ${commonFields}`;
      }
      else if (t === "progress" || t === "meter") {
        html = `
          <label>ID</label><input id="cfg_id" placeholder="progress1" />
          <label>Value / Max</label><input id="cfg_value" placeholder="50" style="width:45%; display:inline;" /> <input id="cfg_max" placeholder="100" style="width:45%; display:inline;" />
          <label>Label</label><input id="cfg_label" placeholder="Progress: " />
          ${commonFields}`;
      }
      else if (t === "details") {
        html = `
          <label>Summary</label><input id="cfg_summary" placeholder="Click to expand" />
          <label>Content</label><textarea id="cfg_content" placeholder="Hidden content here..."></textarea>
          <label>Open by default</label><input type="checkbox" id="cfg_open" />
          ${commonFields}`;
      }
      else if (t === "dialog") {
        html = `
          <label>Dialog ID</label><input id="cfg_id" placeholder="myDialog" />
          <label>Title</label><input id="cfg_title" placeholder="Dialog Title" />
          <label>Content</label><textarea id="cfg_content" placeholder="Dialog content"></textarea>
          <label>Buttons</label><input id="cfg_buttons" placeholder="Close,Save" />
          ${commonFields}`;
      }
      else if (t === "table") {
        html = `
          <label>Table ID</label><input id="cfg_tableid" value="dataTable" />
          <label>Columns (comma separated)</label><input id="cfg_columns" placeholder="id,name,age,actions" />
          <label>Show Header</label><input type="checkbox" id="cfg_header" checked />
          <label>Table Style</label><select id="cfg_style"><option value="border:1px solid">Bordered</option><option value="border-collapse:collapse">Collapsed</option><option value="width:100%">Full width</option></select>
          ${commonFields}`;
      }
      else if (t === "list") {
        html = `
          <label>List Type</label><select id="cfg_listtype"><option value="ul">Bullet (UL)</option><option value="ol">Numbered (OL)</option></select>
          <label>Items (one per line)</label><textarea id="cfg_items" placeholder="Item 1&#10;Item 2&#10;Item 3"></textarea>
          ${commonFields}`;
      }
      else if (t === "grid" || t === "flex") {
        html = `
          <label>Container ID</label><input id="cfg_id" placeholder="container" />
          <label>Columns / Gap</label><input id="cfg_cols" placeholder="repeat(3,1fr)" style="width:45%; display:inline;" /> <input id="cfg_gap" placeholder="10px" style="width:45%; display:inline;" />
          <label>Sample Items</label><input id="cfg_items" placeholder="Item 1,Item 2,Item 3" />
          ${commonFields}`;
      }
      else if (t === "heading") {
        html = `
          <label>Heading Level</label><select id="cfg_level"><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="h5">H5</option><option value="h6">H6</option></select>
          <label>Text</label><input id="cfg_text" placeholder="Heading Text" />
          ${commonFields}`;
      }
      else if (t === "paragraph" || t === "span" || t === "div" || t === "section" || t === "article" || t === "nav" || t === "header" || t === "footer" || t === "aside") {
        html = `
          <label>ID (optional)</label><input id="cfg_id" placeholder="element_id" />
          <label>Text Content</label><textarea id="cfg_text" placeholder="Content here..."></textarea>
          ${commonFields}`;
      }
      else if (t === "code" || t === "pre" || t === "blockquote") {
        html = `
          <label>ID</label><input id="cfg_id" placeholder="code_block" />
          <label>Content</label><textarea id="cfg_text" placeholder="Code or text..."></textarea>
          <label>Language (for code)</label><input id="cfg_lang" placeholder="javascript" />
          ${commonFields}`;
      }
      else if (t === "chart") {
        html = `
          <label>Chart ID</label><input id="cfg_id" placeholder="myChart" />
          <label>Chart Type</label><select id="cfg_charttype"><option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option><option value="doughnut">Doughnut</option></select>
          <label>Labels (comma)</label><input id="cfg_labels" placeholder="Jan,Feb,Mar" />
          <label>Data (comma)</label><input id="cfg_data" placeholder="10,20,30" />
          ${commonFields}`;
      }
      else if (t === "qr") {
        html = `
          <label>QR ID</label><input id="cfg_id" placeholder="qrcode" />
          <label>Data / Text</label><input id="cfg_text" placeholder="https://example.com" />
          <label>Size</label><input id="cfg_size" placeholder="150" />
          ${commonFields}`;
      }
      else if (t === "signature") {
        html = `
          <label>Signature ID</label><input id="cfg_id" placeholder="signaturePad" />
          <label>Width / Height</label><input id="cfg_width" placeholder="400" style="width:45%; display:inline;" /> <input id="cfg_height" placeholder="200" style="width:45%; display:inline;" />
          <label>Show Clear Button</label><input type="checkbox" id="cfg_clear" checked />
          ${commonFields}`;
      }
      else if (t === "rich") {
        html = `
          <label>Editor ID</label><input id="cfg_id" placeholder="richEditor" />
          <label>Height</label><input id="cfg_height" placeholder="200px" />
          <label>Toolbar</label><select id="cfg_toolbar"><option value="basic">Basic</option><option value="full">Full</option></select>
          ${commonFields}`;
      }
      else if (t === "tabs") {
        html = `
          <label>Tabs ID</label><input id="cfg_id" placeholder="tabContainer" />
          <label>Tab Labels (comma)</label><input id="cfg_labels" placeholder="Tab1,Tab2,Tab3" />
          <label>Tab Contents (one per line)</label><textarea id="cfg_contents" placeholder="Content 1&#10;Content 2&#10;Content 3"></textarea>
          ${commonFields}`;
      }
      else if (t === "accordion") {
        html = `
          <label>Accordion ID</label><input id="cfg_id" placeholder="accordion" />
          <label>Sections (title|content per line)</label><textarea id="cfg_sections" placeholder="Section1|Content 1&#10;Section2|Content 2"></textarea>
          ${commonFields}`;
      }
      else if (t === "carousel") {
        html = `
          <label>Carousel ID</label><input id="cfg_id" placeholder="carousel" />
          <label>Images (URLs per line)</label><textarea id="cfg_images" placeholder="https://image1.jpg&#10;https://image2.jpg"></textarea>
          <label>Auto play (ms)</label><input id="cfg_autoplay" placeholder="3000" />
          ${commonFields}`;
      }
      else if (t === "pagination") {
        html = `
          <label>Pagination ID</label><input id="cfg_id" placeholder="pagination" />
          <label>Total Items / Per Page</label><input id="cfg_total" placeholder="100" style="width:45%; display:inline;" /> <input id="cfg_perpage" placeholder="10" style="width:45%; display:inline;" />
          ${commonFields}`;
      }
      else if (t === "breadcrumb") {
        html = `
          <label>Breadcrumb ID</label><input id="cfg_id" placeholder="breadcrumb" />
          <label>Links (label|url per line)</label><textarea id="cfg_links" placeholder="Home|/&#10;Products|/products&#10;Current|"></textarea>
          ${commonFields}`;
      }
      else if (t === "tooltip" || t === "popover") {
        html = `
          <label>Element ID</label><input id="cfg_id" placeholder="tooltipTarget" />
          <label>Text</label><input id="cfg_text" placeholder="Tooltip content" />
          <label>Position</label><select id="cfg_position"><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select>
          ${commonFields}`;
      }
      else if (t === "toast") {
        html = `
          <label>Toast Container ID</label><input id="cfg_id" placeholder="toastContainer" />
          <label>Position</label><select id="cfg_position"><option value="top-right">Top Right</option><option value="top-left">Top Left</option><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option></select>
          ${commonFields}`;
      }
      else if (t === "label") {
        html = `
          <label>Label Text</label><input id="cfg_text" placeholder="Field Label" />
          <label>For Field ID</label><input id="cfg_for" placeholder="input_id" />
          ${commonFields}`;
      }

      el("elementConfig").innerHTML = html;
    }

    // Render chips
    function renderChips() {
      el("componentChips").innerHTML = components
        .map((c, i) => `<span class="chip" data-index="${i}">${i + 1}. ${esc(c.type)}${c.id ? ` (${esc(c.id)})` : ""}</span>`)
        .join("");

      // Add click handlers to chips
      document.querySelectorAll(".chips .chip").forEach(chip => {
        chip.addEventListener("click", function() {
          const index = parseInt(this.dataset.index);
          if (!isNaN(index) && index >= 0 && index < components.length) {
            components.splice(index, 1);
            renderChips();
          }
        });
      });

      el("logicChips").innerHTML = Array.from(selectedLogic)
        .map((k, i) => `<span class="chip" data-logic="${k}">${esc(k)}</span>`)
        .join("");
    }

    // Add element
    function addElement() {
      const t = el("elementType").value;
      const get = (id) => el(id) ? el(id).value.trim() : "";
      const getChecked = (id) => el(id) ? el(id).checked : false;
      
      const obj = { type: t };

      // Common fields
      if (el("cfg_id")) obj.id = get("cfg_id");
      if (el("cfg_class")) obj.class = get("cfg_class");
      if (el("cfg_style")) obj.style = get("cfg_style");

      // Element-specific fields
      if (["input", "number", "email", "password", "tel", "url", "textarea", "range", "color", "date", "time", "datetime", "month", "week"].includes(t)) {
        obj.label = get("cfg_label");
        obj.placeholder = get("cfg_placeholder");
        obj.value = get("cfg_value");
        if (el("cfg_validation")) obj.validation = get("cfg_validation");
        if (el("cfg_min")) obj.min = get("cfg_min");
        if (el("cfg_max")) obj.max = get("cfg_max");
        if (el("cfg_step")) obj.step = get("cfg_step");
      }

      if (t === "textarea") {
        obj.rows = get("cfg_rows") || "4";
        obj.cols = get("cfg_cols") || "50";
      }

      if (t === "select") {
        obj.options = get("cfg_options");
        obj.multiple = getChecked("cfg_multiple");
      }

      if (t === "radio" || t === "checkbox") {
        obj.options = get("cfg_options");
        obj.layout = get("cfg_layout");
      }

      if (t === "upload") {
        obj.accept = get("cfg_accept") || "*/*";
        obj.multiple = getChecked("cfg_multiple");
        obj.label = get("cfg_label");
      }

      if (t === "image") {
        obj.src = get("cfg_src");
        obj.alt = get("cfg_alt");
        obj.width = get("cfg_width");
        obj.height = get("cfg_height");
      }

      if (t === "audio" || t === "video") {
        obj.src = get("cfg_src");
        obj.controls = getChecked("cfg_controls");
        obj.autoplay = getChecked("cfg_autoplay");
        obj.loop = getChecked("cfg_loop");
      }

      if (t === "canvas") {
        obj.width = get("cfg_width") || "300";
        obj.height = get("cfg_height") || "150";
        obj.draw = get("cfg_draw");
      }

      if (t === "button") {
        obj.text = get("cfg_text") || "Button";
        obj.btntype = get("cfg_btntype") || "button";
        obj.onclick = get("cfg_onclick");
      }

      if (t === "progress" || t === "meter") {
        obj.value = get("cfg_value");
        obj.max = get("cfg_max");
        obj.label = get("cfg_label");
      }

      if (t === "details") {
        obj.summary = get("cfg_summary");
        obj.content = get("cfg_content");
        obj.open = getChecked("cfg_open");
      }

      if (t === "dialog") {
        obj.title = get("cfg_title");
        obj.content = get("cfg_content");
        obj.buttons = get("cfg_buttons");
      }

      if (t === "table") {
        obj.tableId = get("cfg_tableid") || "dataTable";
        obj.columns = get("cfg_columns");
        obj.header = getChecked("cfg_header");
        obj.tablestyle = get("cfg_style");
      }

      if (t === "list") {
        obj.listtype = get("cfg_listtype") || "ul";
        obj.items = get("cfg_items");
      }

      if (t === "grid" || t === "flex") {
        obj.cols = get("cfg_cols");
        obj.gap = get("cfg_gap");
        obj.items = get("cfg_items");
      }

      if (t === "heading") {
        obj.level = get("cfg_level") || "h2";
        obj.text = get("cfg_text");
      }

      if (["paragraph", "span", "div", "section", "article", "nav", "header", "footer", "aside", "code", "pre", "blockquote"].includes(t)) {
        obj.text = get("cfg_text");
        if (t === "code" || t === "pre") obj.lang = get("cfg_lang");
      }

      if (t === "chart") {
        obj.charttype = get("cfg_charttype") || "bar";
        obj.labels = get("cfg_labels");
        obj.data = get("cfg_data");
      }

      if (t === "qr") {
        obj.text = get("cfg_text");
        obj.size = get("cfg_size") || "150";
      }

      if (t === "signature") {
        obj.width = get("cfg_width") || "400";
        obj.height = get("cfg_height") || "200";
        obj.clear = getChecked("cfg_clear");
      }

      if (t === "rich") {
        obj.height = get("cfg_height") || "200px";
        obj.toolbar = get("cfg_toolbar") || "basic";
      }

      if (t === "tabs") {
        obj.labels = get("cfg_labels");
        obj.contents = get("cfg_contents");
      }

      if (t === "accordion") {
        obj.sections = get("cfg_sections");
      }

      if (t === "carousel") {
        obj.images = get("cfg_images");
        obj.autoplay = get("cfg_autoplay");
      }

      if (t === "pagination") {
        obj.total = get("cfg_total") || "100";
        obj.perpage = get("cfg_perpage") || "10";
      }

      if (t === "breadcrumb") {
        obj.links = get("cfg_links");
      }

      if (t === "tooltip" || t === "popover") {
        obj.text = get("cfg_text");
        obj.position = get("cfg_position") || "top";
      }

      if (t === "toast") {
        obj.position = get("cfg_position") || "top-right";
      }

      if (t === "label") {
        obj.text = get("cfg_text");
        obj.for = get("cfg_for");
      }

      components.push(obj);
      renderChips();

      Swal.fire({ 
        title: "✅ Element added", 
        text: `${t} added successfully`, 
        icon: "success", 
        toast: true, 
        position: "top-end", 
        timer: 1500, 
        showConfirmButton: false 
      });
    }

    // Collect field IDs
    function collectFieldIds() {
      const ids = [];
      components.forEach((c) => {
        if (["input", "number", "email", "password", "tel", "url", "date", "time", "datetime", "month", "week", "textarea", "select", "range", "color"].includes(c.type) && c.id) {
          ids.push(c.id);
        }
      });
      return Array.from(new Set(ids));
    }

    // Logic configuration
    function renderLogicConfig() {
      const category = el("logicCategory").value;
      const logicType = el("logicType").value;
      
      let html = "";
      
      if (logicType === "filter" || logicType === "search") {
        html = `
          <label>Field to filter by</label><input id="logic_field" placeholder="field_name" />
          <label>Operator</label><select id="logic_operator"><option value="=">=</option><option value=">">></option><option value="<"><</option><option value=">=">>=</option><option value="<="><=</option><option value="!=">!=</option><option value="contains">Contains</option></select>
        `;
      } else if (logicType === "sort") {
        html = `
          <label>Sort by field</label><input id="logic_field" placeholder="field_name" />
          <label>Order</label><select id="logic_order"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
        `;
      } else if (logicType === "paginate") {
        html = `
          <label>Items per page</label><input id="logic_limit" value="10" />
        `;
      } else if (logicType === "group") {
        html = `
          <label>Group by field</label><input id="logic_field" placeholder="category" />
          <label>Aggregate function</label><select id="logic_agg"><option value="count">Count</option><option value="sum">Sum</option><option value="avg">Average</option></select>
        `;
      } else if (logicType === "login" || logicType === "register") {
        html = `
          <label>Email field ID</label><input id="logic_email" value="email" />
          <label>Password field ID</label><input id="logic_password" value="password" />
          <label>Remember me</label><input type="checkbox" id="logic_remember" />
        `;
      } else if (logicType === "uploadFile") {
        html = `
          <label>File input ID</label><input id="logic_fileInput" value="fileUpload" />
          <label>Storage path</label><input id="logic_path" value="uploads/" />
        `;
      } else if (logicType === "barChart" || logicType === "lineChart" || logicType === "pieChart") {
        html = `
          <label>Chart ID</label><input id="logic_chartId" value="myChart" />
          <label>Data source (field)</label><input id="logic_source" placeholder="sales_data" />
        `;
      } else if (logicType === "excel" || logicType === "csv" || logicType === "pdf") {
        html = `
          <label>Filename</label><input id="logic_filename" value="export" />
          <label>Include fields (comma)</label><input id="logic_fields" placeholder="id,name,age" />
        `;
      } else if (logicType === "validateForm") {
        html = `
          <label>Form ID</label><input id="logic_formId" value="myForm" />
          <label>Rules (field:rule)</label><textarea id="logic_rules" placeholder="name:required&#10;email:email&#10;age:number|min:18"></textarea>
        `;
      } else if (logicType === "sum" || logicType === "average" || logicType === "minmax") {
        html = `
          <label>Field name</label><input id="logic_field" placeholder="amount" />
          <label>Where condition (optional)</label><input id="logic_condition" placeholder="status='active'" />
        `;
      } else if (logicType === "formula") {
        html = `
          <label>Formula (using field names)</label><input id="logic_formula" placeholder="price * quantity" />
          <label>Result field ID</label><input id="logic_result" value="total" />
        `;
      } else if (logicType === "realtimeList") {
        html = `
          <label>Container ID</label><input id="logic_container" value="realtimeList" />
          <label>Template (HTML with {field})</label><textarea id="logic_template" placeholder="<div>{name}: {value}</div>"></textarea>
        `;
      } else if (logicType === "localSave") {
        html = `
          <label>Storage key</label><input id="logic_key" value="app_data" />
          <label>Data source (fields or 'all')</label><input id="logic_data" value="all" />
        `;
      } else if (logicType === "backup") {
        html = `
          <label>Include fields (comma or 'all')</label><input id="logic_fields" value="all" />
          <label>Compress</label><input type="checkbox" id="logic_compress" />
        `;
      }
      
      el("logicConfig").innerHTML = html;
    }

    // Build UI HTML
    function buildUIHTML(useSwal) {
      const idField = el("idField").value.trim() || "id";
      const pos = el("buttonPosition").value;

      const htmlParts = [];
      const globalButtons = [];

      components.forEach((c) => {
        const styleAttr = c.style ? ` style="${esc(c.style)}"` : "";
        const classAttr = c.class ? ` class="${esc(c.class)}"` : "";

        if (c.type === "input" || c.type === "number" || c.type === "email" || c.type === "password" || c.type === "tel" || c.type === "url") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          const type = c.type === "input" ? "text" : c.type;
          htmlParts.push(`<input type="${esc(type)}" id="${esc(c.id)}" placeholder="${esc(c.placeholder || "")}" value="${esc(c.value || "")}"${classAttr}${styleAttr} />`);
        } 
        else if (c.type === "range") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          htmlParts.push(`<input type="range" id="${esc(c.id)}" min="${esc(c.min || "0")}" max="${esc(c.max || "100")}" step="${esc(c.step || "1")}" value="${esc(c.value || "50")}"${classAttr}${styleAttr} />`);
        }
        else if (c.type === "color") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          htmlParts.push(`<input type="color" id="${esc(c.id)}" value="${esc(c.value || "#ff0000")}"${classAttr}${styleAttr} />`);
        }
        else if (c.type === "textarea") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          htmlParts.push(`<textarea id="${esc(c.id)}" rows="${esc(c.rows || "4")}" cols="${esc(c.cols || "50")}" placeholder="${esc(c.placeholder || "")}"${classAttr}${styleAttr}>${esc(c.value || "")}</textarea>`);
        }
        else if (c.type === "select") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          const multiple = c.multiple ? " multiple" : "";
          const options = String(c.options || "").split("\n").map(line => {
            const parts = line.split(":");
            const val = parts[0].trim();
            const text = parts[1] ? parts[1].trim() : val;
            return `<option value="${esc(val)}">${esc(text)}</option>`;
          }).join("");
          htmlParts.push(`<select id="${esc(c.id)}"${multiple}${classAttr}${styleAttr}>${options}</select>`);
        }
        else if (c.type === "radio" || c.type === "checkbox") {
          const options = String(c.options || "").split(",").map(s => s.trim()).filter(Boolean);
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          const container = document.createElement("div");
          options.forEach(opt => {
            const id = `${c.id}_${opt}`;
            if (c.layout === "inline") {
              htmlParts.push(`<label style="margin-right:10px;"><input type="${c.type}" name="${esc(c.id)}" value="${esc(opt)}" /> ${esc(opt)}</label>`);
            } else {
              htmlParts.push(`<div><label><input type="${c.type}" name="${esc(c.id)}" value="${esc(opt)}" /> ${esc(opt)}</label></div>`);
            }
          });
        }
        else if (c.type === "date" || c.type === "time" || c.type === "datetime" || c.type === "month" || c.type === "week") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          const type = c.type === "datetime" ? "datetime-local" : c.type;
          htmlParts.push(`<input type="${esc(type)}" id="${esc(c.id)}" min="${esc(c.min || "")}" max="${esc(c.max || "")}"${classAttr}${styleAttr} />`);
        }
        else if (c.type === "upload") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          const multiple = c.multiple ? " multiple" : "";
          htmlParts.push(`<input type="file" id="${esc(c.id)}" accept="${esc(c.accept || "*/*")}"${multiple}${classAttr}${styleAttr} />`);
        }
        else if (c.type === "image") {
          htmlParts.push(`<img id="${esc(c.id)}" src="${esc(c.src || "")}" alt="${esc(c.alt || "")}" width="${esc(c.width || "")}" height="${esc(c.height || "auto")}"${classAttr}${styleAttr} />`);
        }
        else if (c.type === "audio" || c.type === "video") {
          const controls = c.controls ? " controls" : "";
          const autoplay = c.autoplay ? " autoplay" : "";
          const loop = c.loop ? " loop" : "";
          htmlParts.push(`<${c.type} id="${esc(c.id)}"${controls}${autoplay}${loop}${classAttr}${styleAttr}><source src="${esc(c.src)}">Your browser does not support the ${c.type} tag.</${c.type}>`);
        }
        else if (c.type === "canvas") {
          htmlParts.push(`<canvas id="${esc(c.id)}" width="${esc(c.width || "300")}" height="${esc(c.height || "150")}"${classAttr}${styleAttr}></canvas>`);
        }
        else if (c.type === "button") {
          if (pos === "global") {
            globalButtons.push(`<button type="${esc(c.btntype || "button")}" onclick="${esc(c.onclick || "")}"${classAttr}${styleAttr}>${esc(c.text || "Button")}</button>`);
          } else if (pos === "inline") {
            htmlParts.push(`<button type="${esc(c.btntype || "button")}" id="${esc(c.id || "")}" onclick="${esc(c.onclick || "")}"${classAttr}${styleAttr}>${esc(c.text || "Button")}</button>`);
          }
        }
        else if (c.type === "progress" || c.type === "meter") {
          if (c.label) htmlParts.push(`<label>${esc(c.label)}</label>`);
          htmlParts.push(`<${c.type} id="${esc(c.id)}" value="${esc(c.value || "0")}" max="${esc(c.max || "100")}"${classAttr}${styleAttr}>${c.value || "0"}%</${c.type}>`);
        }
        else if (c.type === "details") {
          htmlParts.push(`
<details id="${esc(c.id)}"${c.open ? " open" : ""}${classAttr}${styleAttr}>
  <summary>${esc(c.summary || "Details")}</summary>
  ${esc(c.content || "")}
</details>`);
        }
        else if (c.type === "dialog") {
          htmlParts.push(`
<dialog id="${esc(c.id)}"${classAttr}${styleAttr}>
  <h3>${esc(c.title || "Dialog")}</h3>
  <p>${esc(c.content || "")}</p>
  ${c.buttons ? c.buttons.split(",").map(b => `<button onclick="document.getElementById('${c.id}').close()">${esc(b.trim())}</button>`).join(" ") : ""}
</dialog>
<button onclick="document.getElementById('${c.id}').showModal()">Open Dialog</button>`);
        }
        else if (c.type === "table") {
          const cols = String(c.columns || "").split(",").map(x => x.trim()).filter(Boolean);
          const th = cols.map(x => `<th>${esc(x)}</th>`).join("");
          const rowActions = pos === "row" ? "<th>Actions</th>" : "";
          htmlParts.push(`
<table id="${esc(c.tableId || "dataTable")}" border="1" cellpadding="6" cellspacing="0" style="${esc(c.tablestyle || "border:1px solid")}"${classAttr}>
  ${c.header !== false ? `<thead><tr>${th}${rowActions}</tr></thead>` : ""}
  <tbody id="tableBody"></tbody>
</table>`);
        }
        else if (c.type === "list") {
          const items = String(c.items || "").split("\n").map(s => s.trim()).filter(Boolean);
          const listItems = items.map(i => `<li>${esc(i)}</li>`).join("");
          htmlParts.push(`<${c.listtype || "ul"} id="${esc(c.id)}"${classAttr}${styleAttr}>${listItems}</${c.listtype || "ul"}>`);
        }
        else if (c.type === "grid" || c.type === "flex") {
          const items = String(c.items || "").split(",").map(s => s.trim()).filter(Boolean);
          const display = c.type === "grid" ? `display: grid; grid-template-columns: ${c.cols || "repeat(3,1fr)"}; gap: ${c.gap || "10px"};` : `display: flex; gap: ${c.gap || "10px"};`;
          htmlParts.push(`<div id="${esc(c.id)}" style="${display}${c.style ? " " + c.style : ""}"${classAttr}>`);
          items.forEach((item, i) => {
            htmlParts.push(`<div style="padding:10px; background:#1e293b;">${esc(item)}</div>`);
          });
          htmlParts.push(`</div>`);
        }
        else if (c.type === "heading") {
          htmlParts.push(`<${c.level || "h2"} id="${esc(c.id)}"${classAttr}${styleAttr}>${esc(c.text || "")}</${c.level || "h2"}>`);
        }
        else if (["paragraph", "span", "div", "section", "article", "nav", "header", "footer", "aside"].includes(c.type)) {
          htmlParts.push(`<${c.type} id="${esc(c.id)}"${classAttr}${styleAttr}>${esc(c.text || "")}</${c.type}>`);
        }
        else if (c.type === "code" || c.type === "pre") {
          const lang = c.lang ? ` class="language-${esc(c.lang)}"` : "";
          htmlParts.push(`<${c.type} id="${esc(c.id)}"${lang}${classAttr}${styleAttr}>${esc(c.text || "")}</${c.type}>`);
        }
        else if (c.type === "blockquote") {
          htmlParts.push(`<blockquote id="${esc(c.id)}"${classAttr}${styleAttr}>${esc(c.text || "")}</blockquote>`);
        }
        else if (c.type === "chart") {
          htmlParts.push(`
<canvas id="${esc(c.id)}" width="400" height="200"${classAttr}${styleAttr}></canvas>
<script>
  // Chart.js would be needed - this is a placeholder
  console.log('Chart ${c.id} would render here with data: ${c.data}');
<\/script>`);
        }
        else if (c.type === "qr") {
          htmlParts.push(`
<div id="${esc(c.id)}"${classAttr}${styleAttr}></div>
<script>
  // QR code library would be needed
  document.getElementById('${c.id}').innerHTML = 'QR: ${esc(c.text || "")}';
<\/script>`);
        }
        else if (c.type === "signature") {
          htmlParts.push(`
<canvas id="${esc(c.id)}" width="${esc(c.width || "400")}" height="${esc(c.height || "200")}" style="border:1px solid #ccc"${classAttr}${styleAttr}></canvas>
${c.clear ? `<button onclick="clearSignature('${c.id}')">Clear</button>` : ""}
<script>
  function clearSignature(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
<\/script>`);
        }
        else if (c.type === "rich") {
          htmlParts.push(`
<div id="${esc(c.id)}" contenteditable="true" style="border:1px solid #ccc; padding:10px; min-height:${esc(c.height || "200px")};"${classAttr}${styleAttr}></div>`);
        }
        else if (c.type === "tabs") {
          const labels = String(c.labels || "").split(",").map(s => s.trim()).filter(Boolean);
          const contents = String(c.contents || "").split("\n").map(s => s.trim()).filter(Boolean);
          htmlParts.push(`<div class="tabs" id="${esc(c.id)}"${classAttr}${styleAttr}>`);
          htmlParts.push(`<div class="tab-buttons" style="display:flex; gap:2px;">`);
          labels.forEach((label, i) => {
            htmlParts.push(`<button class="tab-btn" data-tab="${i}" onclick="showTab('${c.id}', ${i})">${esc(label)}</button>`);
          });
          htmlParts.push(`</div>`);
          contents.forEach((content, i) => {
            htmlParts.push(`<div class="tab-content" id="${c.id}_tab_${i}" style="display:${i === 0 ? "block" : "none"}; padding:10px;">${esc(content)}</div>`);
          });
          htmlParts.push(`</div>`);
          htmlParts.push(`
<script>
  function showTab(tabId, index) {
    const container = document.getElementById(tabId);
    const contents = container.querySelectorAll('.tab-content');
    contents.forEach((c, i) => c.style.display = i === index ? 'block' : 'none');
  }
<\/script>`);
        }
        else if (c.type === "accordion") {
          const sections = String(c.sections || "").split("\n").map(s => s.split("|")).filter(arr => arr.length >= 2);
          htmlParts.push(`<div class="accordion" id="${esc(c.id)}"${classAttr}${styleAttr}>`);
          sections.forEach((section, i) => {
            htmlParts.push(`
<div class="accordion-item">
  <h3 class="accordion-header">
    <button onclick="toggleAccordion(this)">${esc(section[0].trim())}</button>
  </h3>
  <div class="accordion-body" style="display:none; padding:10px;">
    ${esc(section.slice(1).join("|").trim())}
  </div>
</div>`);
          });
          htmlParts.push(`</div>`);
          htmlParts.push(`
<script>
  function toggleAccordion(btn) {
    const body = btn.closest('.accordion-item').querySelector('.accordion-body');
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }
<\/script>`);
        }
        else if (c.type === "carousel") {
          const images = String(c.images || "").split("\n").map(s => s.trim()).filter(Boolean);
          htmlParts.push(`
<div class="carousel" id="${esc(c.id)}" style="position:relative; overflow:hidden;"${classAttr}${styleAttr}>
  <div class="carousel-inner" style="display:flex; transition:transform 0.5s;">
    ${images.map((img, i) => `<div class="carousel-item" style="min-width:100%;"><img src="${esc(img)}" style="width:100%;"></div>`).join("")}
  </div>
  <button onclick="moveCarousel('${c.id}', -1)" style="position:absolute; left:10px; top:50%;">‹</button>
  <button onclick="moveCarousel('${c.id}', 1)" style="position:absolute; right:10px; top:50%;">›</button>
</div>
<script>
  let currentSlide = {};
  function moveCarousel(id, direction) {
    if (!currentSlide[id]) currentSlide[id] = 0;
    const carousel = document.getElementById(id);
    const inner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    currentSlide[id] = (currentSlide[id] + direction + items.length) % items.length;
    inner.style.transform = \`translateX(-\${currentSlide[id] * 100}%)\`;
  }
<\/script>`);
        }
        else if (c.type === "pagination") {
          const total = parseInt(c.total || "100");
          const perPage = parseInt(c.perpage || "10");
          const pages = Math.ceil(total / perPage);
          htmlParts.push(`<div class="pagination" id="${esc(c.id)}"${classAttr}${styleAttr}>`);
          for (let i = 1; i <= pages; i++) {
            htmlParts.push(`<button onclick="goToPage(${i})" style="margin:2px;">${i}</button>`);
          }
          htmlParts.push(`</div>`);
        }
        else if (c.type === "breadcrumb") {
          const links = String(c.links || "").split("\n").map(s => s.split("|")).filter(arr => arr.length >= 1);
          htmlParts.push(`<nav aria-label="breadcrumb" id="${esc(c.id)}"${classAttr}${styleAttr}>`);
          links.forEach((link, i) => {
            const label = link[0].trim();
            const url = link[1] ? link[1].trim() : "#";
            if (i === links.length - 1) {
              htmlParts.push(`<span>${esc(label)}</span>`);
            } else {
              htmlParts.push(`<a href="${esc(url)}">${esc(label)}</a> <span>/</span> `);
            }
          });
          htmlParts.push(`</nav>`);
        }
        else if (c.type === "tooltip" || c.type === "popover") {
          htmlParts.push(`
<div style="position:relative; display:inline-block;" id="${esc(c.id)}_container">
  <span id="${esc(c.id)}" style="border-bottom:1px dotted; cursor:help;"${classAttr}${styleAttr}>Hover me</span>
  <div class="tooltip" style="position:absolute; background:#333; color:white; padding:5px; border-radius:3px; display:none;">${esc(c.text || "")}</div>
</div>
<script>
  document.getElementById('${c.id}').addEventListener('mouseenter', function() {
    this.nextElementSibling.style.display = 'block';
  });
  document.getElementById('${c.id}').addEventListener('mouseleave', function() {
    this.nextElementSibling.style.display = 'none';
  });
<\/script>`);
        }
        else if (c.type === "toast") {
          htmlParts.push(`
<div id="${esc(c.id)}" style="position:fixed; ${c.position === "top-right" ? "top:20px; right:20px;" : c.position === "top-left" ? "top:20px; left:20px;" : c.position === "bottom-right" ? "bottom:20px; right:20px;" : "bottom:20px; left:20px;"}; z-index:1000;"${classAttr}${styleAttr}></div>
<script>
  function showToast(message, type='info') {
    const container = document.getElementById('${c.id}');
    const toast = document.createElement('div');
    toast.style.background = type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.marginBottom = '10px';
    toast.style.borderRadius = '4px';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
<\/script>`);
        }
        else if (c.type === "label") {
          htmlParts.push(`<label for="${esc(c.for || "")}" id="${esc(c.id || "")}"${classAttr}${styleAttr}>${esc(c.text || "Label")}</label>`);
        }
      });

      if (globalButtons.length && pos === "global") {
        htmlParts.push(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">${globalButtons.join("")}</div>`);
      }

      const finalUI = htmlParts.join("\n");

      if (!useSwal) return finalUI;

      const escaped = finalUI.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
      return `<button onclick="openFactoryModal()" class="btn primary">Open Generated UI</button>
<script>
function openFactoryModal() {
  Swal.fire({
    title: "Generated UI",
    width: "90%",
    html: \`<div style="max-height:70vh; overflow:auto;">${escaped}</div>\`,
    showConfirmButton: false,
    showCloseButton: true
  });
}
<\/script>`;
    }

    // Logic map generator
    function logicMap() {
      const node = el("nodePath").value.trim() || "Learning_App";
      const idField = el("idField").value.trim() || "id";
      const fields = collectFieldIds();
      const position = el("buttonPosition").value;
      const logicField = el("logic_field") ? el("logic_field").value : "";
      const logicOperator = el("logic_operator") ? el("logic_operator").value : "";
      const logicOrder = el("logic_order") ? el("logic_order").value : "asc";
      const logicLimit = el("logic_limit") ? el("logic_limit").value : "10";

      const payloadLines = fields.map(f => `    ${f}: el('${f}').value`).join(',\n');

      const fillRowFields = fields.map(f => `<td>\${row["${f}"] ?? ""}</td>`).join("");
      const rowActions = position === "row"
        ? `<td>
            <button onclick="el('${idField}').value='\${key}'; showData()">👁️</button>
            <button onclick="el('${idField}').value='\${key}'; modifyData()">✏️</button>
            <button onclick="el('${idField}').value='\${key}'; deleteByInput()">🗑️</button>
          </td>`
        : "";

      return {
        // CRUD
        add: `async function addData() {
  const id = el('${idField}')?.value.trim();
  if (!id) return Swal.fire("Warning", "Enter ${idField}", "warning");

  try {
    const check = await get(ref(db, '${node}/' + id));
    if (check.exists()) return Swal.fire("Duplicate", "ID already exists", "warning");

    const payload = {
${payloadLines || "    // Add your fields here"},
      createdAt: new Date().toISOString()
    };

    await set(ref(db, '${node}/' + id), payload);
    Swal.fire("✅ Saved", "Data added successfully", "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        modify: `async function modifyData() {
  const id = el('${idField}')?.value.trim();
  if (!id) return Swal.fire("Warning", "Enter ${idField}", "warning");

  try {
    const updates = {
${payloadLines || "      // Add your fields here"},
      updatedAt: new Date().toISOString()
    };

    await update(ref(db, '${node}/' + id), updates);
    Swal.fire("✅ Updated", "Data modified successfully", "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        show: `async function showData() {
  const id = el('${idField}')?.value.trim();
  try {
    if (!id) return Swal.fire("Info", "Enter ${idField} to show record", "info");
    const snap = await get(ref(db, '${node}/' + id));
    if (!snap.exists()) return Swal.fire("Info", "No record found", "info");
    
    const data = snap.val();
    // Auto-fill fields if they exist
    Object.keys(data).forEach(key => {
      if (el(key)) el(key).value = data[key];
    });
    
    Swal.fire({
      title: "Record Found",
      html: '<pre style="text-align:left; max-height:300px; overflow:auto;">' + JSON.stringify(data, null, 2) + '</pre>',
      icon: "info"
    });
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        delete: `async function deleteByInput() {
  const id = el('${idField}')?.value.trim();
  if (!id) return Swal.fire("Warning", "Enter ${idField}", "warning");

  const conf = await Swal.fire({
    title: "Delete Record?",
    text: id,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Delete"
  });
  if (!conf.isConfirmed) return;

  try {
    await remove(ref(db, '${node}/' + id));
    Swal.fire("🗑️ Deleted", "Record deleted successfully", "success");
    el('${idField}').value = "";
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        deleteAll: `async function deleteAllData() {
  const conf = await Swal.fire({
    title: "Delete ALL data?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Delete All"
  });
  if (!conf.isConfirmed) return;

  try {
    await remove(ref(db, '${node}'));
    Swal.fire("✅ Done", "All records deleted", "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        populate: `async function populateTable() {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return Swal.fire("Info", "Table body not found", "info");

  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    tbody.innerHTML = "";

    if (Object.keys(data).length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No data found</td></tr>';
      return;
    }

    Object.keys(data).forEach((key) => {
      const row = data[key] || {};
      const tr = document.createElement("tr");
      tr.innerHTML = \`<td>\${key}</td>${fillRowFields}${rowActions}\`;
      tbody.appendChild(tr);
    });

    Swal.fire("✅ Done", \`\${Object.keys(data).length} records loaded\`, "success");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        // Query operations
        filter: `async function filterData() {
  const field = '${logicField || 'field'}';
  const value = prompt('Enter value to filter by:');
  if (!value) return;
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const filtered = {};
    
    Object.keys(data).forEach(key => {
      if (data[key][field] && String(data[key][field]).includes(value)) {
        filtered[key] = data[key];
      }
    });
    
    displayFilteredResults(filtered);
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        search: `async function searchData() {
  const term = prompt('Enter search term:').toLowerCase();
  if (!term) return;
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const results = {};
    
    Object.keys(data).forEach(key => {
      const match = Object.values(data[key]).some(val => 
        String(val).toLowerCase().includes(term)
      );
      if (match) results[key] = data[key];
    });
    
    displayFilteredResults(results);
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        sort: `async function sortData() {
  const field = '${logicField || 'field'}';
  const order = '${logicOrder}';
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const entries = Object.entries(data);
    
    entries.sort((a, b) => {
      const valA = a[1][field] || '';
      const valB = b[1][field] || '';
      if (order === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    const sorted = Object.fromEntries(entries);
    displayFilteredResults(sorted);
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        paginate: `let currentPage = 1;
let allData = [];

async function paginateData(page = 1) {
  const perPage = ${logicLimit || 10};
  
  if (page === 1 || allData.length === 0) {
    const snap = await get(ref(db, '${node}'));
    allData = snap.exists() ? Object.entries(snap.val()) : [];
  }
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = allData.slice(start, end);
  
  displayPaginatedResults(pageData, page, Math.ceil(allData.length / perPage));
  currentPage = page;
}`,

        count: `async function countRecords() {
  try {
    const snap = await get(ref(db, '${node}'));
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    Swal.fire("📊 Count", \`Total records: \${count}\`, "info");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        distinct: `async function distinctValues() {
  const field = '${logicField || 'field'}';
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const values = new Set();
    
    Object.values(data).forEach(item => {
      if (item[field]) values.add(item[field]);
    });
    
    Swal.fire("📊 Distinct Values", Array.from(values).join(', '), "info");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        group: `async function groupByField() {
  const field = '${logicField || 'category'}';
  const agg = '${el("logic_agg") ? el("logic_agg").value : "count"}';
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const groups = {};
    
    Object.values(data).forEach(item => {
      const key = item[field] || 'undefined';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    
    const result = {};
    Object.keys(groups).forEach(key => {
      if (agg === 'count') {
        result[key] = groups[key].length;
      } else if (agg === 'sum') {
        result[key] = groups[key].reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      } else if (agg === 'avg') {
        const sum = groups[key].reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        result[key] = sum / groups[key].length;
      }
    });
    
    Swal.fire("📊 Grouped Results", JSON.stringify(result, null, 2), "info");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        // Batch operations
        batchAdd: `async function batchAdd() {
  const input = prompt('Enter JSON array of records:');
  if (!input) return;
  
  try {
    const records = JSON.parse(input);
    if (!Array.isArray(records)) throw new Error('Input must be an array');
    
    const updates = {};
    records.forEach((record, i) => {
      const id = record.${idField} || \`batch_\${Date.now()}_\${i}\`;
      updates[\`\${id}\`] = {
        ...record,
        batchCreated: new Date().toISOString()
      };
    });
    
    await update(ref(db, '${node}'), updates);
    Swal.fire("✅ Done", \`\${records.length} records added\`, "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", "Invalid JSON: " + e.message, "error");
  }
}`,

        batchUpdate: `async function batchUpdate() {
  const field = prompt('Field to update:');
  const value = prompt('New value:');
  const condition = prompt('Condition (e.g., age>25) or leave empty for all:');
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    const updates = {};
    let count = 0;
    
    Object.keys(data).forEach(key => {
      let apply = !condition;
      if (condition) {
        // Simple condition parsing - can be enhanced
        const [condField, op, condValue] = condition.split(/([><=!]+)/);
        const fieldValue = data[key][condField.trim()];
        if (op === '>' && fieldValue > Number(condValue)) apply = true;
        else if (op === '<' && fieldValue < Number(condValue)) apply = true;
        else if (op === '=' && fieldValue == condValue) apply = true;
      }
      
      if (apply) {
        updates[\`\${key}/${field}\`] = value;
        count++;
      }
    });
    
    if (count === 0) return Swal.fire("Info", "No records match condition", "info");
    
    await update(ref(db, '${node}'), updates);
    Swal.fire("✅ Done", \`\${count} records updated\`, "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        batchDelete: `async function batchDelete() {
  const ids = prompt('Enter IDs to delete (comma separated):');
  if (!ids) return;
  
  const idArray = ids.split(',').map(id => id.trim());
  
  const conf = await Swal.fire({
    title: "Batch Delete",
    text: \`Delete \${idArray.length} records?\`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33"
  });
  if (!conf.isConfirmed) return;
  
  try {
    const updates = {};
    idArray.forEach(id => {
      updates[\`\${id}\`] = null;
    });
    
    await update(ref(db, '${node}'), updates);
    Swal.fire("✅ Done", \`\${idArray.length} records deleted\`, "success");
    if (typeof populateTable === 'function') populateTable();
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        bulkImport: `async function bulkImport() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    
    try {
      const data = JSON.parse(text);
      const updates = {};
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          const id = item.${idField} || \`import_\${Date.now()}_\${Math.random()}\`;
          updates[\`\${id}\`] = item;
        });
      } else {
        updates = data;
      }
      
      await update(ref(db, '${node}'), updates);
      Swal.fire("✅ Done", "Data imported successfully", "success");
      if (typeof populateTable === 'function') populateTable();
    } catch (e) {
      Swal.fire("Error", "Invalid JSON: " + e.message, "error");
    }
  };
  fileInput.click();
}`,

        // Authentication (mock for learning)
        login: `function login() {
  const email = el('${el("logic_email") ? el("logic_email").value : "email"}')?.value;
  const password = el('${el("logic_password") ? el("logic_password").value : "password"}')?.value;
  
  if (!email || !password) {
    return Swal.fire("Warning", "Enter email and password", "warning");
  }
  
  // This is a mock login for learning
  localStorage.setItem('user', JSON.stringify({ email, loggedIn: true }));
  Swal.fire("✅ Logged In", \`Welcome \${email}\`, "success");
}`,

        logout: `function logout() {
  localStorage.removeItem('user');
  Swal.fire("👋 Logged Out", "You have been logged out", "info");
}`,

        register: `async function register() {
  const email = el('${el("logic_email") ? el("logic_email").value : "email"}')?.value;
  const password = el('${el("logic_password") ? el("logic_password").value : "password"}')?.value;
  
  if (!email || !password) {
    return Swal.fire("Warning", "Enter email and password", "warning");
  }
  
  // Mock registration for learning
  const usersRef = ref(db, 'users/' + email.replace(/[.#$\\[\\]]/g, '_'));
  const check = await get(usersRef);
  if (check.exists()) {
    return Swal.fire("Error", "User already exists", "error");
  }
  
  await set(usersRef, {
    email,
    password: btoa(password), // NOT secure - just for learning
    createdAt: new Date().toISOString()
  });
  
  Swal.fire("✅ Registered", "Account created successfully", "success");
}`,

        // File operations
        uploadFile: `async function uploadFile() {
  const fileInput = el('${el("logic_fileInput") ? el("logic_fileInput").value : "fileUpload"}');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    return Swal.fire("Warning", "Select a file first", "warning");
  }
  
  const file = fileInput.files[0];
  const path = '${el("logic_path") ? el("logic_path").value : "uploads/"}' + file.name;
  
  // This is a mock upload - in real app use Firebase Storage
  Swal.fire({
    title: "Uploading...",
    text: \`\${file.name} (\${(file.size/1024).toFixed(2)} KB)\`,
    icon: "info",
    timer: 2000,
    showConfirmButton: false
  });
  
  // Store metadata in database
  await set(ref(db, 'files/' + file.name.replace(/[.#$\\[\\]]/g, '_')), {
    name: file.name,
    size: file.size,
    type: file.type,
    path: path,
    uploadedAt: new Date().toISOString()
  });
  
  setTimeout(() => {
    Swal.fire("✅ Uploaded", "File metadata saved", "success");
  }, 2000);
}`,

        // Export
        excel: `function exportExcel() {
  const table = document.getElementById("dataTable") || document.getElementById("mainTable");
  if (!table) return Swal.fire("Info", "No table found to export", "info");
  
  // Using XLSX library (included in head)
  const wb = XLSX.utils.table_to_book(table, { sheet: "Data" });
  XLSX.writeFile(wb, "${el('nodePath').value || 'export'}_report.xlsx");
  Swal.fire("✅ Exported", "Excel file created", "success");
}`,

        csv: `function exportCSV() {
  const table = document.getElementById("dataTable") || document.getElementById("mainTable");
  if (!table) return Swal.fire("Info", "No table found", "info");
  
  const rows = [];
  const headers = [];
  table.querySelectorAll('thead th').forEach(th => headers.push(th.textContent));
  if (headers.length) rows.push(headers.join(','));
  
  table.querySelectorAll('tbody tr').forEach(tr => {
    const row = [];
    tr.querySelectorAll('td').forEach(td => {
      row.push('"' + td.textContent.replace(/"/g, '""') + '"');
    });
    rows.push(row.join(','));
  });
  
  const csv = rows.join('\\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "${el('nodePath').value || 'export'}.csv";
  a.click();
  URL.revokeObjectURL(url);
  
  Swal.fire("✅ Exported", "CSV file created", "success");
}`,

        json: `function exportJSON() {
  const table = document.getElementById("dataTable") || document.getElementById("mainTable");
  if (!table) return Swal.fire("Info", "No table found", "info");
  
  const data = [];
  const headers = [];
  table.querySelectorAll('thead th').forEach(th => headers.push(th.textContent));
  
  table.querySelectorAll('tbody tr').forEach(tr => {
    const row = {};
    tr.querySelectorAll('td').forEach((td, i) => {
      if (i < headers.length) row[headers[i]] = td.textContent;
    });
    data.push(row);
  });
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "${el('nodePath').value || 'export'}.json";
  a.click();
  URL.revokeObjectURL(url);
  
  Swal.fire("✅ Exported", "JSON file created", "success");
}`,

        // Validation
        validateForm: `function validateForm() {
  const rules = {
${el("logic_rules") ? el("logic_rules").value.split("\n").map(line => {
  const [field, rule] = line.split(":");
  return `    "${field.trim()}": "${rule.trim()}"`;
}).join(",\n") : '    "name": "required"'}
  };
  
  const errors = [];
  
  Object.keys(rules).forEach(field => {
    const input = el(field);
    if (!input) return;
    
    const value = input.value.trim();
    const ruleSet = rules[field].split('|');
    
    ruleSet.forEach(rule => {
      if (rule === 'required' && !value) {
        errors.push(\`\${field} is required\`);
      } else if (rule.startsWith('min:')) {
        const min = parseInt(rule.split(':')[1]);
        if (value.length < min) {
          errors.push(\`\${field} must be at least \${min} characters\`);
        }
      } else if (rule === 'email' && value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        errors.push(\`\${field} must be a valid email\`);
      } else if (rule === 'number' && value && isNaN(value)) {
        errors.push(\`\${field} must be a number\`);
      }
    });
  });
  
  if (errors.length) {
    Swal.fire("Validation Errors", errors.join('\\n'), "error");
    return false;
  }
  
  Swal.fire("✅ Valid", "Form is valid", "success");
  return true;
}`,

        // Calculations
        sum: `async function calculateSum() {
  const field = '${logicField || 'amount'}';
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    
    let sum = 0;
    Object.values(data).forEach(item => {
      sum += Number(item[field]) || 0;
    });
    
    Swal.fire("🧮 Sum", \`Total \${field}: \${sum}\`, "info");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        average: `async function calculateAverage() {
  const field = '${logicField || 'amount'}';
  
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    
    let sum = 0;
    let count = 0;
    Object.values(data).forEach(item => {
      const val = Number(item[field]);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    });
    
    const avg = count > 0 ? sum / count : 0;
    Swal.fire("🧮 Average", \`Average \${field}: \${avg.toFixed(2)}\`, "info");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`,

        // Realtime
        realtimeList: `function setupRealtimeList() {
  const container = document.getElementById('${el("logic_container") ? el("logic_container").value : "realtimeList"}');
  if (!container) return;
  
  const template = '${el("logic_template") ? el("logic_template").value.replace(/\n/g, "\\n") : "<div>{name}</div>"}';
  
  const listRef = ref(db, '${node}');
  onValue(listRef, (snapshot) => {
    const data = snapshot.val() || {};
    container.innerHTML = '';
    
    Object.keys(data).forEach(key => {
      const item = data[key];
      let html = template;
      Object.keys(item).forEach(field => {
        html = html.replace(new RegExp('{' + field + '}', 'g'), item[field] || '');
      });
      html = html.replace(/{key}/g, key);
      
      const div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div.firstChild || div);
    });
  });
}`,

        // Local storage
        localSave: `function saveToLocal() {
  const key = '${el("logic_key") ? el("logic_key").value : "app_data"}';
  const dataSource = '${el("logic_data") ? el("logic_data").value : "all"}';
  
  if (dataSource === 'all') {
    const data = {};
    ${fields.map(f => `if (el('${f}')) data.${f} = el('${f}').value;`).join('\n  ')}
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    const fieldData = {};
    dataSource.split(',').forEach(f => {
      if (el(f.trim())) fieldData[f.trim()] = el(f.trim()).value;
    });
    localStorage.setItem(key, JSON.stringify(fieldData));
  }
  
  Swal.fire("✅ Saved", "Data saved to localStorage", "success");
}`,

        localLoad: `function loadFromLocal() {
  const key = '${el("logic_key") ? el("logic_key").value : "app_data"}';
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  
  Object.keys(data).forEach(field => {
    if (el(field)) el(field).value = data[field];
  });
  
  Swal.fire("✅ Loaded", "Data loaded from localStorage", "success");
}`,

        // Backup
        backup: `async function backupData() {
  try {
    const snap = await get(ref(db, '${node}'));
    const data = snap.exists() ? snap.val() : {};
    
    const backup = {
      timestamp: new Date().toISOString(),
      node: '${node}',
      data: data
    };
    
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`backup_\${new Date().toISOString().slice(0,10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    
    Swal.fire("✅ Backup", "Data exported as backup", "success");
  } catch (e) {
    Swal.fire("Error", e.message, "error");
  }
}`
      };
    }

    // Generate basic shell
    function generateBasicShellOnly() {
      const title = el("pageTitle").value.trim() || "NDEDC Learning System";
      const shell = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: 600; }
    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    button { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <!-- Your UI components will go here -->
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
    import { getDatabase, ref, get, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCTSWDR3IvFpzp8UARsClrpwbRtTwr12jA",
      authDomain: "ndedc-meter-calib.firebaseapp.com",
      databaseURL: "https://ndedc-meter-calib-default-rtdb.firebaseio.com",
      projectId: "ndedc-meter-calib",
      storageBucket: "ndedc-meter-calib.appspot.com",
      messagingSenderId: "185425429190",
      appId: "1:185425429190:web:dce85f29eea55ad9f54dc7"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const el = (id) => document.getElementById(id);
    window.db = db;
    window.el = el;
  <\/script>
</body>
</html>`;
      setOutput("📄 BASIC SHELL", shell);
    }

    // Generate logic only
    function generateLogicOnly() {
      const m = logicMap();
      const key = el("logicType").value;
      const logicCode = m[key] || "// Logic not implemented yet";
      setOutput("⚡ LOGIC: " + key.toUpperCase(), logicCode);
    }

    // Firebase module script
    function firebaseModuleScript() {
      return `<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTSWDR3IvFpzp8UARsClrpwbRtTwr12jA",
  authDomain: "ndedc-meter-calib.firebaseapp.com",
  databaseURL: "https://ndedc-meter-calib-default-rtdb.firebaseio.com",
  projectId: "ndedc-meter-calib",
  storageBucket: "ndedc-meter-calib.appspot.com",
  messagingSenderId: "185425429190",
  appId: "1:185425429190:web:dce85f29eea55ad9f54dc7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const el = (id) => document.getElementById(id);
window.db = db;
window.el = el;
<\/script>`;
    }

    // Generate full HTML
    function generateFull(useSwalUi = false, debugMode = false) {
      const title = el("pageTitle").value.trim() || "NDEDC Learning System";
      const shellTop = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .app-container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: 600; color: #333; }
    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; }
    button { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 5px; }
    button:hover { background: #2563eb; }
    button.secondary { background: #6b7280; }
    button.secondary:hover { background: #4b5563; }
    button.success { background: #10b981; }
    button.success:hover { background: #059669; }
    button.warning { background: #f59e0b; }
    button.warning:hover { background: #d97706; }
    button.danger { background: #ef4444; }
    button.danger:hover { background: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #f9fafb; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .flex { display: flex; gap: 10px; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    ${debugMode ? '.debug { border: 2px solid red; }' : ''}
  </style>
</head>
<body>
  <div class="app-container">`;

      const ui = buildUIHTML(useSwalUi);
      const allLogic = logicMap();
      const logicCode = Array.from(selectedLogic).map(k => allLogic[k]).filter(Boolean).join("\n\n");

      // Get fillRowFields and rowActions for display functions
      const fields = collectFieldIds();
      const idField = el("idField").value.trim() || "id";
      const position = el("buttonPosition").value;
      const fillRowFields = fields.map(f => `<td>\${row["${f}"] ?? ""}</td>`).join("");
      const rowActions = position === "row"
        ? `<td>
            <button onclick="el('${idField}').value='\${key}'; showData()">👁️</button>
            <button onclick="el('${idField}').value='\${key}'; modifyData()">✏️</button>
            <button onclick="el('${idField}').value='\${key}'; deleteByInput()">🗑️</button>
          </td>`
        : "";

      const final = `${shellTop}

<div id="app">
${ui}
</div>

${firebaseModuleScript()}

<script>
// Utility functions
function displayFilteredResults(data) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  if (Object.keys(data).length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No data found</td></tr>';
    return;
  }
  
  Object.keys(data).forEach((key) => {
    const row = data[key] || {};
    const tr = document.createElement("tr");
    tr.innerHTML = \`<td>\${key}</td>${fillRowFields}${rowActions}\`;
    tbody.appendChild(tr);
  });
}

function displayPaginatedResults(data, page, totalPages) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  data.forEach(([key, row]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = \`<td>\${key}</td>${fillRowFields}${rowActions}\`;
    tbody.appendChild(tr);
  });
  
  // Add pagination controls
  let paginationDiv = document.getElementById('paginationControls');
  if (!paginationDiv) {
    paginationDiv = document.createElement('div');
    paginationDiv.id = 'paginationControls';
    paginationDiv.style.marginTop = '10px';
    document.getElementById('app').appendChild(paginationDiv);
  }
  
  paginationDiv.innerHTML = \`
    <button onclick="paginateData(currentPage - 1)" \${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
    <span> Page \${page} of \${totalPages} </span>
    <button onclick="paginateData(currentPage + 1)" \${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
  \`;
}

// Your generated logic:
${logicCode}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  if (typeof populateTable === 'function') populateTable();
  if (typeof setupRealtimeList === 'function') setupRealtimeList();
});
<\/script>

</body>
</html>`;

      setOutput(debugMode ? "🐞 DEBUG MODE" : "🚀 COMPLETED HTML", final);
    }

    // Initialize
    function init() {
      renderElementConfig();
      renderChips();
      
      // Event listeners
      el("elementType").addEventListener("change", renderElementConfig);
      el("logicCategory").addEventListener("change", () => {
        const category = el("logicCategory").value;
        const options = el("logicType").options;
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          if (opt.dataset.cat === category || category === "all") {
            opt.style.display = "";
          } else {
            opt.style.display = "none";
          }
        }
        renderLogicConfig();
      });
      el("logicType").addEventListener("change", renderLogicConfig);
      
      el("addElementBtn").addEventListener("click", addElement);
      el("clearElementsBtn").addEventListener("click", () => {
        components.length = 0;
        renderChips();
        Swal.fire({ title: "🗑️ Cleared", text: "All elements removed", icon: "info", toast: true, timer: 1500 });
      });
      
      el("btnShell").addEventListener("click", generateBasicShellOnly);
      el("btnLogic").addEventListener("click", generateLogicOnly);
      
      el("btnAddLogicSelection").addEventListener("click", () => {
        selectedLogic.add(el("logicType").value);
        renderChips();
        Swal.fire({ title: "➕ Logic added", icon: "success", toast: true, timer: 1500 });
      });
      
      el("btnFull").addEventListener("click", () => generateFull(false));
      el("btnFullSwal").addEventListener("click", () => generateFull(true));
      el("btnMinimal").addEventListener("click", () => {
        const minimal = `<!doctype html>
<html>
<head><title>Minimal NDEDC</title></head>
<body>
  <h1>Minimal Version</h1>
  <p>Quick start template with just the basics.</p>
</body>
</html>`;
        setOutput("📄 MINIMAL", minimal);
      });
      el("btnDebug").addEventListener("click", () => generateFull(false, true));
      
      el("copyBtn").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(el("output").innerText);
          Swal.fire({ title: "📋 Copied", icon: "success", toast: true, timer: 1500 });
        } catch {
          Swal.fire("Error", "Copy failed", "error");
        }
      });
      
      el("downloadBtn").addEventListener("click", () => {
        const code = el("output").innerText || "";
        if (!code.trim()) {
          Swal.fire("Info", "No code to download", "info");
          return;
        }
        
        const rawName = (el("pageTitle").value || "ndedc_page").trim();
        const safeName = rawName.replace(/[\\/:*?\"<>|]+/g, "_").replace(/\s+/g, "_");
        const fileName = `${safeName || "ndedc_page"}.html`;
        
        const blob = new Blob([code], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        
        Swal.fire({ title: "💾 Downloaded", text: fileName, icon: "success", toast: true, timer: 1500 });
      });
      
      el("runBtn").addEventListener("click", showPreview);
      el("previewCode").addEventListener("click", showPreview);
      
      el("validateCode").addEventListener("click", () => {
        const code = el("output").innerText;
        if (!code.trim()) return Swal.fire("Info", "No code to validate", "info");
        
        // Basic HTML validation
        const hasDoctype = code.includes("<!doctype html>") || code.includes("<!DOCTYPE html>");
        const hasHtml = code.includes("<html");
        const hasBody = code.includes("<body");
        const hasClosing = code.split("</html>").length > 1;
        
        const issues = [];
        if (!hasDoctype) issues.push("Missing DOCTYPE");
        if (!hasHtml) issues.push("Missing <html> tag");
        if (!hasBody) issues.push("Missing <body> tag");
        if (!hasClosing) issues.push("Missing closing </html> tag");
        
        if (issues.length === 0) {
          Swal.fire("✅ Valid", "HTML structure looks good!", "success");
        } else {
          Swal.fire("⚠️ Issues Found", issues.join("\n"), "warning");
        }
      });
      
      el("showHtmlHelp").addEventListener("click", () => {
        Swal.fire({
          title: "📚 HTML Learning",
          html: `
            <div style="text-align:left">
              <h4>HTML Elements Guide:</h4>
              <ul>
                <li><b>Inputs</b>: text, number, email, password, tel, url</li>
                <li><b>Media</b>: img, audio, video, canvas</li>
                <li><b>Interactive</b>: button, details, dialog</li>
                <li><b>Layout</b>: div, section, article, nav, table</li>
                <li><b>Typography</b>: h1-h6, p, span, blockquote</li>
                <li><b>Advanced</b>: chart, qr, signature, tabs</li>
              </ul>
              <p>Each element can have IDs, classes, and styles for CSS targeting.</p>
            </div>
          `,
          width: 600
        });
      });
      
      el("showJsHelp").addEventListener("click", () => {
        Swal.fire({
          title: "📚 JavaScript Learning",
          html: `
            <div style="text-align:left">
              <h4>JS Operations:</h4>
              <ul>
                <li><b>CRUD</b>: Create, Read, Update, Delete</li>
                <li><b>Query</b>: Filter, Search, Sort, Paginate</li>
                <li><b>Batch</b>: Multiple operations at once</li>
                <li><b>Auth</b>: Login, Register, Profile</li>
                <li><b>Export</b>: Excel, CSV, JSON, PDF</li>
                <li><b>Validation</b>: Form and field validation</li>
                <li><b>Realtime</b>: Live updates with Firebase</li>
              </ul>
              <p>All functions use async/await and SweetAlert2 for feedback.</p>
            </div>
          `,
          width: 600
        });
      });
      
      el("showFirebaseHelp").addEventListener("click", () => {
        Swal.fire({
          title: "🔥 Firebase Learning",
          html: `
            <div style="text-align:left">
              <h4>Firebase Operations:</h4>
              <ul>
                <li><b>get()</b>: Read data</li>
                <li><b>set()</b>: Create/overwrite data</li>
                <li><b>update()</b>: Update specific fields</li>
                <li><b>remove()</b>: Delete data</li>
                <li><b>onValue()</b>: Realtime listener</li>
                <li><b>ref()</b>: Reference to database path</li>
              </ul>
              <p>Data is stored as JSON in Realtime Database.</p>
            </div>
          `,
          width: 600
        });
      });
    }
    
    // Start
    init();
  
