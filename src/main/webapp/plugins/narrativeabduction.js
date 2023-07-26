/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow. 
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).  
 */
// load plugin
Draw.loadPlugin(function(ui) {
    console.log("EditorUi",  ui);
    console.log("Sidebar", ui.sidebar.graph);
    console.log("Editor", ui.editor);

    var na = new NarrativeAbductionDev(ui);
    na.init();
});


class NASettings{
    static Dictionary = {
        NARRATIVEITEM: 'NarrativeItem',
        NARRATIVEITEMTITLE: 'NarrativeItemTitle',
        NARRATIVEITEMDESCRIPTION: 'NarrativeItemDescription',
        NARRATIVEITEMWINDOWID : 'NarrativeItemWindow',
        NARRATIVESET: 'NarrativeSet',
        EVIDENCEITEM: 'EvidenceItem',
        EXPLAINLINK: 'ExplainLinks'
    }
}

class NarrativeAbductionDev {

    constructor(ui) {
        this.editorui = ui;
        this.windowRegistry = {};
        this.entries = [];
        this.nodes = [];
    }


    init = function(){
        this.createPalette();     
        this.overrideShapePicker();
    }

    createPalette = function(){
        this.entries.push(this.editorui.sidebar.addDataEntry(NASettings.Dictionary.NARRATIVEITEM, 0, 0, NASettings.Dictionary.NARRATIVEITEM, Graph.compress(this.createItemNarrativeItem())));
        console.log("Entires", this.entries);
        NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", this.entries);        
    }

    overrideShapePicker = function(){
        //override
        var editorui = this.editorui;
        var t = this;
        this.editorui.getCellsForShapePicker = function(cell, hovering, showEdges){

            var graph = editorui.editor.graph;
    
            var createVertex = mxUtils.bind(this, function(style, w, h, value)
            {
                return graph.createVertex(null, null, value || '', 0, 0, w || 120, h || 60, style, false);
            });
        
            var createEdge = mxUtils.bind(this, function(style, y, value)
            {
                var cell = new mxCell(value || '', new mxGeometry(0, 0, graph.defaultEdgeLength + 20, 0), style);
                cell.geometry.setTerminalPoint(new mxPoint(0, 0), true);
                cell.geometry.setTerminalPoint(new mxPoint(cell.geometry.width, (y != null) ? y : 0), false);
                cell.geometry.points = (y != null) ? [new mxPoint(cell.geometry.width / 2, y)] : [];
                cell.geometry.relative = true;
                cell.edge = true;
        
                return cell;
            });
        
            // Creates a clone of the source cell and moves it to the origin
            if (cell != null)
            {
                try
                {
                    cell = graph.cloneCell(cell);
                    
                    if (graph.model.isVertex(cell) && cell.geometry != null)
                    {
                        cell.geometry.x = 0;
                        cell.geometry.y = 0;
                    }
                }
                catch (e)
                {
                    cell = null;
                }
            }
            
            if (cell == null)
            {
                cell = createVertex('text;html=1;align=center;verticalAlign=middle;resizable=0;' +
                    'points=[];autosize=1;strokeColor=none;fillColor=none;', 40, 20, 'Text');
                
                if (graph.model.isVertex(cell) && graph.isAutoSizeCell(cell))
                {
                    // Uses offscreen graph to bypass undo history
                    var tempGraph = Graph.createOffscreenGraph(graph.getStylesheet());
                    tempGraph.updateCellSize(cell);
                }
            }
        
            var cells = [cell, createVertex('whiteSpace=wrap;html=1;'),
                createVertex('ellipse;whiteSpace=wrap;html=1;', 80, 80),
                createVertex('rhombus;whiteSpace=wrap;html=1;', 80, 80)];
            
            if (showEdges)
            {
                cells = cells.concat([
                    createEdge('edgeStyle=none;orthogonalLoop=1;jettySize=auto;html=1;'),
                    createEdge('edgeStyle=none;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;startArrow=classic;endSize=8;startSize=8;'),
                    createEdge('edgeStyle=none;orthogonalLoop=1;jettySize=auto;html=1;shape=flexArrow;rounded=1;startSize=8;endSize=8;'),
                    createEdge('edgeStyle=segmentEdgeStyle;endArrow=classic;html=1;curved=0;rounded=0;endSize=8;startSize=8;sourcePerimeterSpacing=0;targetPerimeterSpacing=0;',
                        this.editor.graph.defaultEdgeLength / 2)
                ]);
            }
        
            console.log("Shape-picker cells", cells);
            return t.nodes;
        };
    }

    createItemNarrativeItem = function(){       
        // Note that these XML nodes will be enclosing the
        // mxCell nodes for the model cells in the output
        var doc = mxUtils.createXmlDocument();

        var objna = doc.createElement(NASettings.Dictionary.NARRATIVEITEM);
        var objtitle = doc.createElement(NASettings.Dictionary.NARRATIVEITEMTITLE);
        var objdescription = doc.createElement(NASettings.Dictionary.NARRATIVEITEMDESCRIPTION);


        var graph = new mxGraph();
        var parent = graph.getDefaultParent();
                           
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
            var nodenaitem = graph.insertVertex(parent, null, objna, 200, 150, 150, 150);

            var nodetitle = graph.insertVertex(nodenaitem, null, objtitle, 10, 10, 120, 30);
            nodetitle.setStyle("text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontStyle=1;fontSize=17;fontColor=default;labelBorderColor=none;labelBackgroundColor=none;resizable=0;allowArrows=0;movable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodetitle.value = "Title";
            nodetitle.setConnectable(false);
            
            var nodedesc = graph.insertVertex(nodenaitem, null, objdescription, 10, 50, 120, 150);
            nodedesc.setStyle("text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;allowArrows=0;movable=0;resizable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodedesc.value = "Desription";
            nodedesc.setConnectable(false);

        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }

        var currgraph = this.editorui.editor.graph;
        var na = this;

        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeClickListener(currgraph, NASettings.Dictionary.NARRATIVEITEM, function(cell){

            var cellName =  cell.children[0].value;
            var cellDesc = cell.children[1].value;

            console.log("Narrative item clicked");
            console.log("Graph", currgraph);
            console.log("Cell", cell);
            console.log("Name", cellName);
            console.log("Description", cellDesc);

            var wnd = NAUtil.GetWindowById(NASettings.Dictionary.NARRATIVEITEMWINDOWID, na.windowRegistry);

            if(wnd == null)
            {
                var formContainer = document.createElement('div');
                formContainer.style.width = "200px";
                formContainer.style.padding = "20px";
    
                const form = document.createElement('form');
                form.id = 'narrativeitemform';
    
                const nameLabel = document.createElement('label');
                nameLabel.textContent = 'Name:';
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.id = 'name';
                nameInput.name = 'name';
                nameInput.required = true;
    
                const br = document.createElement('br');
    
                const descriptionLabel = document.createElement('label');
                descriptionLabel.textContent = 'Description:';
                const descriptionTextarea = document.createElement('textarea');
                descriptionTextarea.id = 'description';
                descriptionTextarea.name = 'description';
                descriptionTextarea.rows = 4;
                descriptionTextarea.cols = 50;
    
                const applyButton = document.createElement('button');
                applyButton.id = 'applyButton';
                applyButton.type = 'button';
                applyButton.textContent = 'Apply';
    
                // Add elements to the form
                form.appendChild(nameLabel);
                form.appendChild(nameInput);
                form.appendChild(br);
                form.appendChild(descriptionLabel);
                form.appendChild(descriptionTextarea);
                form.appendChild(br.cloneNode(false)); // Create a new line break for spacing
                form.appendChild(applyButton);
    
                // Add the form to the container
                formContainer.appendChild(form);
    
                wnd = NAUtil.CreateWindow(NASettings.Dictionary.NARRATIVEITEMWINDOWID, NASettings.Dictionary.NARRATIVEITEM, formContainer, 100, 100, 400, 200, na.windowRegistry);
            }else{
              

            }

            const nameInput = document.getElementById("name");
            nameInput.value = cellName;
            const descriptionTextarea = document.getElementById("description");
            descriptionTextarea.value = cellDesc;
            const applyButton = document.getElementById("applyButton");
            applyButton.onclick = applyForm(currgraph, cell);
            const form = document.getElementById("narrativeitemform");
            form.onsubmit =  function(event) {
                event.preventDefault();
                return false;
            }
            

            function applyForm(currgraph, c, n, d) {
                return function(){

                    const nameInput = document.getElementById("name");
                    const descriptionTextarea = document.getElementById("description");

                    console.log("Graph", currgraph);
                    console.log("Cell", c);

                    console.log("Name", n);
                    console.log("Des", d);


                    currgraph.getModel().beginUpdate();        
                    try
                    {
                        currgraph.model.setValue(c.children[0], nameInput.value);
                        currgraph.model.setValue(c.children[1], descriptionTextarea.value);
                    }
                    finally
                    {
                        currgraph.getModel().endUpdate();
                    }

                    console.log("Cell", c);

                }
            };

            wnd.setVisible(true);

          
        });
       

        // store the Narrative Item cell
        var cell = NAUtil.GetCellByNodeName(graph, NASettings.Dictionary.NARRATIVEITEM);
        console.log("Target cell", cell);
        this.nodes.push(cell);
        
        return NAUtil.ModelToXML(graph);
    }
}

class NAUtil {
    static ModelToXML = function(graph){
        var encoder = new mxCodec();
        var result = encoder.encode(graph.getModel());
        var xml = mxUtils.getXml(result);

        return xml;
    }

    static GetCellByNodeName = function(graph, name){
        console.log("Graph", graph);
        var cells = graph.model.getCells();
        console.log("Celss", graph.model.getCells());
        for(var i = 0; i < cells.length; i++){
            console.log("Cell", cells[i]);
            if(!cells[i].value) continue;
            if(cells[i].value.nodeName == name){
                return cells[i];
            }
        }
    }

    static Decycle = function(obj, stack = []) {
        if (!obj || typeof obj !== 'object')
            return obj;
        
        if (stack.includes(obj))
            return null;
    
        let s = stack.concat([obj]);
    
        return Array.isArray(obj)
            ? obj.map(x => NAUtil.Decycle(x, s))
            : Object.fromEntries(
                Object.entries(obj)
                    .map(([k, v]) => [k, NAUtil.Decycle(v, s)]));
    }

    static AddNodeClickListener = function(graph, name, f){
        graph.addListener(mxEvent.CLICK, function (sender, evt) {
            var cell = evt.getProperty("cell"); // cell may be null
            if(cell != null && cell.value != null && cell.value.nodeName == name){
                f(cell);
            }
            evt.consume();
        });
    }

    static AddPalette = function(sidebar, name, nodes){
      //  var nodes = [sidebar.addDataEntry("Test", 0, 0, name, Graph.compress(xml))];
        //mxResources.get("narrativeabduction")
        sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
        sidebar.addPaletteFunctions("narrativeabduction", name, !1, nodes);
        sidebar.setCurrentSearchEntryLibrary()         
    }

    static CreateWindow = function(id, title, content, x, y, width, height, registry) {
        const wnd = new mxWindow(title, content, x, y, width, height, true, true);
        wnd.setResizable(false);
        wnd.setScrollable(false);
       // wnd.setClosable(true);
      
        registry[id] = wnd;      
        return wnd;
      }

    static GetWindowById = function(id, registry) {
        return registry[id] || null;
    }

}

class NarrativeAbductionUI{
    constructor(ui) {
        this.editorui = ui;
    }

    AddButton = function(label, funct)
    {
        var btn = document.createElement('div');
        mxUtils.write(btn, label);
        btn.style.position = 'absolute';
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '1px solid gray';
        btn.style.textAlign = 'center';
        btn.style.fontSize = '10px';
        btn.style.cursor = 'hand';
        btn.style.width = bw + 'px';
        btn.style.height = bh + 'px';
        btn.style.left = left + 'px';
        btn.style.top = '0px';
        
        mxEvent.addListener(btn, 'click', function(evt)
        {
            funct();
            mxEvent.consume(evt);
        });
        
        left += bw;
        
        buttons.appendChild(btn);
    };
}

