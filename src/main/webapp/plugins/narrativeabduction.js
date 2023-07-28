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
    //base on https://docs.google.com/document/d/1FByhhJe67pJC6fPdE3lo8lgM6NN7K0_Uivf6n5Io9UE/edit
    static Dictionary = {
        CELLS:{
            NARRATIVEITEM: 'NarrativeItem',
            NARRATIVEEVIDENCECORE: "NarrativeEvidenceCore",             
            JOINTCAUSE: "JointCause",
            EVIDENCENARRATIVESPECIFIC: "EvidenceNarrativeSpecific", 
            SUPPORTINGARGUMENT: "SupportingArgument",
            NARRATIVESET: 'NarrativeSet',
            EVIDENCEITEM: 'EvidenceItem',
            EXPLAINLINK: 'ExplainLink',
            CAUSELINK: 'CauseLink',
            TRIGGERLINK: 'TriggerLink',
            ENABLELINK: 'EnableLink',
            SUPPORTLINK: 'SupportLink',
            MOTIVATELINK: 'MotivateLink',
            CONFLICTLINK: 'ConflictLink'
        },
        UI: {
            DOCUMENTITEMWINDOW : 'DocumentItemWindow'
        }
    }
}

class NarrativeAbductionDev {

    constructor(ui) {
        this.editorui = ui;
        this.windowRegistry = {};
        this.panelwindow;
        this.narrativeviewerwindow;
        this.settings = {
            lodupdate: 1.5
        }
        this.naentries = [
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEITEM,              
                style: "",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
                style: "fillColor=#fad7ac;strokeColor=#b46504;rounded=0;",
                type: "node"
            },
            {
                name: NASettings.Dictionary.CELLS.JOINTCAUSE,
                style: "",
                type: "node"
            },
            {
                name: NASettings.Dictionary.CELLS.EVIDENCENARRATIVESPECIFIC,
                style: "fillColor=#fad9d5;strokeColor=#ae4132;rounded=0;",
                type: "node"
            },
            {
                name: NASettings.Dictionary.CELLS.SUPPORTINGARGUMENT,
                style: "fillColor=#dae8fc;strokeColor=#6c8ebf;rounded=1;",
                type: "node"
            },
            {
                name: NASettings.Dictionary.CELLS.EXPLAINLINK, 
                style: "shape=flexArrow;endArrow=classic;html=1;rounded=0;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.CAUSELINK, 
                style: "endArrow=classic;html=1;rounded=1;strokeWidth=3;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.TRIGGERLINK, 
                style: "endArrow=classic;html=1;rounded=1;strokeWidth=3;dashed=1;",
                type: "edge"
            }
            ,
            {
                name: NASettings.Dictionary.CELLS.ENABLELINK, 
                style: "endArrow=classic;html=1;rounded=0;strokeWidth=3;dashed=1;dashPattern=1 1;strokeColor=#FF3333;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.SUPPORTLINK, 
                style: "endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#006600;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.MOTIVATELINK, 
                style: "shape=flexArrow;endArrow=classic;html=1;rounded=0;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.CONFLICTLINK, 
                style: "shape=flexArrow;endArrow=classic;html=1;rounded=0;",
                type: "edge"
            }
        ];
    }


    init = function(){        
        this.createPanelWindow();
        //this.createNarrativeViewer();
        this.createPalette();     
        this.overrideShapePicker();
        this.initLODUpdate();
        this.initNewCellHandler();
        this.inittEdgeDoubleClickEditHandler();
    }

    /**
     * Trigger custom functions everytime a new cell is added
     */
    initNewCellHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;
        graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt)
        {
            //if edge, show Contextual Edge Option Menu
            var cells = evt.getProperty('cells');   
            if(cells[0] && cells[0].isEdge()){
                console.log("Cell", cells);
                console.log("evt", evt);    
                console.log("sender", sender);        
                t.showContextualEdgeOptionMenu(cells[0] , sender.lastMouseX, sender.lastMouseY);
            }                 


        });
    }

    /**
     * Prevent editing with double click
     */
    inittEdgeDoubleClickEditHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt)
        {
            //if edge, show Contextual Edge Option Menu
            var cell = evt.getProperty('cell');   
            if(cell != null && cell.isEdge()){
                return false;            }                 
        });
    }

    /**
     * Show edge type options at position x and y
     * @param {*} edge 
     * @param {*} x 
     * @param {*} y 
     */
    showContextualEdgeOptionMenu = function(edge, x, y){
        var container = document.createElement('div');
        var window = new mxWindow("EdgeType", container, x, y, 200, 100);
        var t = this;
        this.naentries.forEach(function(element){
          if(element.type == "edge"){
              NAUtil.AddButton(element.name.replace("Link",""), container, function(){
                  var graph = t.editorui.editor.graph;
                  graph.getModel().beginUpdate();
                  try
                  {
                      graph.getModel().setValue(edge, element.name.replace("Link","") + "s");
                      graph.setCellStyle(element.style, [edge]);
                  }
                  finally
                  {
                      graph.getModel().endUpdate();
                  }
                  window.destroy();
              });
          }
         
      });

      window.setVisible(true);

    }

    /**
     * Show link type option when two nodes are connected
     */
    initConnectionHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;

        graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
        {
          var edge = evt.getProperty('cell');
          var source = graph.getModel().getTerminal(edge, true);
          var target = graph.getModel().getTerminal(edge, false);
          var event = evt.getProperty('event');
                  
          console.log("Connected");
          console.log("Source", source);
          console.log("Target", target);
          console.log("evt", evt);

          t.showContextualEdgeOptionMenu(edge, event.x, event.y);

        });
    }

    initLODUpdate = function(){
 			// Links level of detail to zoom level but can be independent of zoom
             var t = this;
             this.editorui.editor.graph.isCellVisible = function(cell)
             {
                //  console.log("Zooming", t.editorui.editor.graph.view.scale);
                //  console.log("Cell LOD", cell.lod);     
                 return cell.lod == null || cell.lod / 2 < t.editorui.editor.graph.view.scale;
             };
    }

    createNarrativeViewer = function(){
        var container = document.createElement('div');
        container.style.width = "200px";
        container.style.padding = "20px";

    
        this.narrativeviewerwindow = new mxWindow("NA Viewer", container, 0, 0, 200, 300, true, true);
        this.narrativeviewerwindow.setResizable(true);
        this.narrativeviewerwindow.setScrollable(true);
        this.narrativeviewerwindow.setVisible(true);

        this.narrativeToView(this.editorui.editor.graph, container);
    }

    narrativeToView = function(graph, container){
        console.log(graph.getModel().getCells());
        graph.getModel().getCells().forEach(element => {
            console.log("Value", element);
        });
    }

    createPanelWindow = function(){
        var container = document.createElement('div');
        container.style.width = "150px";
        container.style.padding = "20px";
    
        this.panelwindow = new mxWindow("NA Panel", container, 0, 0, 200, 300, true, true);
        this.panelwindow.setResizable(false);
        this.panelwindow.setScrollable(false);
        this.panelwindow.setVisible(true);


        //This part is to add link type buttons 
        var setlinktypecontainer = document.createElement('div');
        setlinktypecontainer.style.width = "150px";
        setlinktypecontainer.style.padding = "5px";
        setlinktypecontainer.style.border = "1px solid #aaa";
        var label = document.createElement("div");
        label.innerHTML = "Update edge into";
        label.style.paddingBottom = "5px";
        setlinktypecontainer.append(label);
        container.append(setlinktypecontainer);
        //looping through naentries
        this.naentries.forEach(function(element){
            if(element.type == "edge"){
                NAUtil.AddButton(element.name.replace("Link",""), setlinktypecontainer, function(){
                    var selectedCells = t.editorui.editor.graph.getSelectionCells();
                    if(selectedCells.length == 0) {
                        alert("Select an edge");
                        return;
                    }
                    console.log("Selection", selectedCells);
                    selectedCells.forEach(function(selected){

                        console.log("Is Edege", selected.isEdge());
                        if(selected.isEdge()){
                            var graph = t.editorui.editor.graph;
                            graph.getModel().beginUpdate();
                            try
                            {
                                graph.getModel().setValue(selected, element.name.replace("Link","") + "s");
                                graph.setCellStyle(element.style, [selected]);
                            }
                            finally
                            {
                                graph.getModel().endUpdate();
                            }
                        }
                    })
                   
        
                });
            }
           
        });
        

        //This part contains some functions for development purposes
        var devtoolcontainer = document.createElement('div');
        devtoolcontainer.style.width = "150px";
        devtoolcontainer.style.padding = "5px";
        devtoolcontainer.style.marginTop = "15px";

        devtoolcontainer.style.border = "1px solid #aaa";
        var label = document.createElement("span");
        label.innerHTML = "Dev tool";
        devtoolcontainer.append(label);
        container.append(devtoolcontainer);

        var t = this;
        NAUtil.AddButton("Show model", devtoolcontainer, function(){
            console.log(t.editorui.editor.graph.getModel());
        });
    }

    /**
     * Create palette for the side bar
     */
    createPalette = function(){
        var entries = []; //all palette entries
        for(var i = 0; i < this.naentries.length;i++){
            var res;
            if(this.naentries[i].type == "node"){
               res = this.createDocumentItem(this.naentries[i].name,  
                    NAUtil.GetCellChildrenLabels(this.naentries[i].name).title, 
                    NAUtil.GetCellChildrenLabels(this.naentries[i].name).description, 
                    this.naentries[i].style);
            } else{
                res = this.createLinkItem(this.naentries[i].name, this.naentries[i].style);
            }
            this.naentries[i].xml = res.xml;
            this.naentries[i].graph = res.graph;                
             entries.push(
                this.editorui.sidebar.addDataEntry(
                    this.naentries[i].name, 0, 0, this.naentries[i].name, Graph.compress(this.naentries[i].xml))
                    );
        }
        console.log("Entires", entries);
        NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", entries);        
    }

    /**
     * Shape-picker override to show NA cells
     */
    overrideShapePicker = function(){
        //override
        var t = this;
        this.editorui.getCellsForShapePicker = function(cell, hovering, showEdges){
            //somehow the style fails, we need to override it. This might not be the case anymore, need to revisit this again later
            var newcells = [];
            t.naentries.forEach(function(currentValue, index, arr){
                    console.log("c", currentValue);
                    //only add node items
                    if(currentValue.type == "node"){
                        var cell = NAUtil.GetCellByNodeName(currentValue.graph, currentValue.name);
                        var g = currentValue.graph;
                        g.getModel().setStyle(cell, currentValue.style);
                        newcells.push(cell);  
                    }
             });
            console.log("Shape-picker new cells", newcells);
            return newcells;
        };
    }

    /**
     * Create link. This is still not working well as it creates two empty nodes 
     * @param {*} itemname 
     * @param {*} style 
     * @returns 
     */
    createLinkItem = function(itemname, style){
        var doc = mxUtils.createXmlDocument();
        var graph = new mxGraph();
        var parent = graph.getDefaultParent();                           
        graph.getModel().beginUpdate();
        var nodenaitem;
        try
        {
            var v1 = graph.insertVertex(parent, null, null, 200, 0, 1, 1, 'opacity=0;');        
            var v2 = graph.insertVertex(parent, null, null, 0, 0, 1, 1, 'opacity=0;');        

            nodenaitem = graph.insertEdge(parent, null, '', v2, v1);
            nodenaitem.setStyle(style);
            nodenaitem.value = itemname;
        }
        finally
        {
            graph.getModel().endUpdate();
        }
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: nodenaitem
        }
    }

    /**
     * Create document item cell for the Shape picker and Palette
     * @returns 
     */
    createDocumentItem = function(itemname, titlename, descrname, style){
        var doc = mxUtils.createXmlDocument();
        var objna = doc.createElement(itemname);
        objna.setAttribute("natype", itemname);
        var objtitle = doc.createElement(titlename);
        var objdescription = doc.createElement(descrname);
        var graph = new mxGraph();
        var parent = graph.getDefaultParent();                           
        graph.getModel().beginUpdate();
        var nodenaitem;
        try
        {
            nodenaitem = graph.insertVertex(parent, null, objna, 200, 150, 350, 150);
            nodenaitem.setStyle(style);
            nodenaitem.natype = itemname;
            var nodetitle = graph.insertVertex(nodenaitem, null, objtitle, 10, 10, 320, 30);
            nodetitle.setStyle("text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontStyle=1;fontSize=17;fontColor=default;labelBorderColor=none;labelBackgroundColor=none;resizable=0;allowArrows=0;movable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodetitle.value = titlename;
            nodetitle.setConnectable(false);            
            var nodedesc = graph.insertVertex(nodenaitem, null, objdescription, 10, 50, 320, 150);
            nodedesc.setStyle("text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;allowArrows=0;movable=0;resizable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodedesc.value = "Desription";
            nodedesc.setConnectable(false);
            nodedesc.lod = this.settings.lodupdate;
        }
        finally
        {
            graph.getModel().endUpdate();
        }
        var currgraph = this.editorui.editor.graph;
        var na = this;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeClickListener(currgraph, itemname, function(cell){
            var cellName =  cell.children[0].value;
            var cellDesc = cell.children[1].value;
            console.log("Document item clicked");
            console.log("Graph", currgraph);
            console.log("Cell", cell);
            console.log("Name", cellName);
            console.log("Description", cellDesc);
            var wnd = NAUtil.GetWindowById(NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, na.windowRegistry);
            if(wnd == null)
            {
                var formContainer = document.createElement('div');
                formContainer.style.width = "150px";
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
                descriptionTextarea.cols = 30;
    
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
    
                wnd = NAUtil.CreateWindow(NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, formContainer, 100, 100, 250, 200, na.windowRegistry);
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
       
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: nodenaitem
        }
    }
}

class NAUtil {

    static GetCellChildrenLabels = function(name){
        return {
            title: name+"Title",
            description : name+"Description"
        }
    }

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
                console.log(cells[i].style);
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


    static AddNodeDoubleClickListener = function(graph, name, f){
        graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
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

    /**
     * Create window if the id does not exist in registry, otherwise return existing one
     * @param {*} id 
     * @param {*} title 
     * @param {*} content 
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     * @param {*} registry 
     * @returns 
     */
    static CreateWindow = function(id, title, content, x, y, width, height, registry) {
        var wnd = NAUtil.GetWindowById(id, registry);
        if(wnd == null){
            wnd = new mxWindow(title, content, x, y, width, height, true, true);
            registry[id] = wnd;     
        }
        return wnd;
      }

    static GetWindowById = function(id, registry) {
        return registry[id] || null;
    }

    static AddButton = function(label, container, funct)
    {
        var btn = document.createElement('div');
        btn.innerHTML = label;
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '1px solid gray';
        btn.style.textAlign = 'center';
        btn.style.fontSize = '10px';
        btn.style.cursor = 'hand';
        btn.style.width = '70 px';
        btn.style.height = '60 px';
        btn.style.top = '0px';
        btn.style.cursor = "pointer";
        
        mxEvent.addListener(btn, 'click', function(evt)
        {
            funct();
            mxEvent.consume(evt);
        });
                
        container.appendChild(btn);
    };

}



