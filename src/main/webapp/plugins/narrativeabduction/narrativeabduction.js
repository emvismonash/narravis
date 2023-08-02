/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow. 
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).  
 */
// load plugin
Draw.loadPlugin(function(ui) {
    console.log("EditorUi",  ui);
    console.log("Sidebar", ui.sidebar.graph);
    console.log("Editor", ui.editor);

    var na = new NarrativeAbductionApp(ui);
    na._init();
});


class NASettings{
    //base on https://docs.google.com/document/d/1FByhhJe67pJC6fPdE3lo8lgM6NN7K0_Uivf6n5Io9UE/edit
    static Dictionary = {
        CELLS:{
            NARRATIVE: 'Narrative',
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
        },
        EVENTS:{
            NEWNARRATIVE: 'newnarrative',
            DELETENARRATIVE: 'deletenarrative'
        }
    }
    static Language = {
        English: {
            "newnarrative": "New Narrative"
        }
    }
    static Colors = {
        Narratives: [
            "#a6cee3",
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
            "#6a3d9a",
            "#ffff99",
            "#b15928",
          ]
    }
    static CSSClasses= {
        NarrativeAccordionView:{
            NodeContainer: 'naAccordionViewNodeContainer',
            Container: 'naAccordionViewContainer',
            HeadContainer: 'naAccordionViewHeadContainer',
            BodyContainer: 'naAccordionViewBodyContainer',
            Title: 'naAccordionViewTitle'
        },
        Panels:{
            SidePanel: 'naSidePanel'
        },
        NAUtils:{
            Button: 'naUtilButton'
        }
    }
}

class Narrative {
    #event;
    constructor(){
        this.rootCell;
        this.name;
        this.cells = [];
        this.graph;
    }
}

class NarrativeAccordionViewsContainer {
    constructor(){
        this.narrativeaccodionviews = [];
        this.app;
    }

    removeAccordionView = function(narrative){
        var view;
        console.log("Narrative to delete", narrative);
        this.narrativeaccodionviews.forEach(function(naview){
            console.log("Current narrative", naview.narrative);
            if(naview.narrative.rootCell.id == narrative.id){
                console.log("Same");
                view = naview;
            }
        })

        console.log("Remove view", view);
        if(view){
            view.remove();
            var index = this.narrativeaccodionviews.indexOf(view);
            if (index > -1) { // only splice array when item is found
                this.narrativeaccodionviews = this.narrativeaccodionviews.splice(index, 1); // 2nd parameter means remove one item only
            }

            index = this.app.narratives.indexOf(view);
            if (index > -1) { // only splice array when item is found
                this.app.narratives =  this.app.narratives.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    }

    addAccordionView = function(na, narrativecell){
        var container = document.createElement('div');
        this.container.append(container);
        var color = NASettings.Colors.Narratives[this.app.narratives.length-1];
        var naaccview = new NarrativeAccordionView(na, container, this.app.editorui, color);
        naaccview.updateView();   
        naaccview.cell = narrativecell;        
        this.narrativeaccodionviews.push(naaccview);
    }
}

/**
 * Accordion View of a narrative
 */
class NarrativeAccordionView{
    constructor(narrative, container, editorui, color){
        this.narrative = narrative;
        this.headContainer;
        this.bodyContainer;
        this.container = container;
        this.editorui = editorui;
        this.color = color;
    }

    remove = function(){
        console.log("Removing accordion view", this);
        this.container.remove();
    }

    getHighlightStyle = function(){
        return 'strokeColor='+this.color+';strokeWidth=6';
    }

    highlightCells = function(cellsToHighlight) {
        var highlightStyle = this.getHighlightStyle();
      
        var graph = this.editorui.editor.graph;
        graph.getModel().beginUpdate();
        try {
          for (let cell of cellsToHighlight) {
            var style = cell.getStyle();
            graph.setCellStyle (cell.getStyle()  + highlightStyle, [cell]);
          }
        } finally {
          graph.getModel().endUpdate();
        }
      }

    unhighlightCells = function(cellsToUnhighlight) {
        var highlightStyle = this.getHighlightStyle();

        var graph = this.editorui.editor.graph;
        graph.getModel().beginUpdate();
        try {
          for (let cell of cellsToUnhighlight) {
            var style = cell.getStyle().replace(highlightStyle, '');
            graph.setCellStyle (style, [cell]);
          }
        } finally {
          graph.getModel().endUpdate();
        }
    }

    /**
     * Create head, body, and name label
     */
    createContainers = function(){
        this.headContainer = document.createElement('div');
        this.bodyContainer = document.createElement('div');
        var naNameLabel = document.createElement('div');

        this.container.classList.add(NASettings.CSSClasses.NarrativeAccordionView.Container);
        this.headContainer.classList.add(NASettings.CSSClasses.NarrativeAccordionView.HeadContainer);
        this.bodyContainer.classList.add(NASettings.CSSClasses.NarrativeAccordionView.BodyContainer);

        this.headContainer.style.background = this.color;

        naNameLabel.style.height = '30px';
        naNameLabel.innerHTML = this.narrative.name;        
        naNameLabel.classList.add(NASettings.CSSClasses.NarrativeAccordionView.Title);

        var t = this;
        naNameLabel.onmouseenter = function(){            
            t.highlightCells(t.narrative.cells);
        }
        naNameLabel.onmouseleave = function(){
            t.unhighlightCells(t.narrative.cells);
        }


        this.container.append(this.headContainer);
        this.container.append(this.bodyContainer);
        this.headContainer.appendChild(naNameLabel);


        var toggleButton = document.createElement('button');
        toggleButton.innerHTML = 'Toggle';
        toggleButton.style.height = '25px';

        toggleButton.onclick = function(){
            if(t.bodyContainer.style.display != 'none'){
                t.bodyContainer.style.display = 'none';
            }else{
                t.bodyContainer.style.display = 'block';
            }
        }
        this.headContainer.append(toggleButton);
    }

    /**
     * Create assign nodes button
     */
    createAssignNodesButton = function(){
        var buttonAssignNode = document.createElement('button');
        buttonAssignNode.innerHTML = "Assign Nodes";
        var t = this;

        buttonAssignNode.onclick = function(){
            var graph = t.editorui.editor.graph;
            var selectedCells = graph.getSelectionCells();
            selectedCells.forEach(function(elm){
                if(!t.narrative.cells.includes(elm, 0)) t.narrative.cells.push(elm);
            });
            console.log("Assigning celss", t.narrative.cells);
            t.createBodyElements();
        }
        this.headContainer.append(buttonAssignNode);
    }

    /**
     * Create representation of the cell/node in the view
     * @param {*} cell 
     */
    createNodeRepresentation = function(cell){
        console.log(cell);
        if(cell.isVertex()){
            var container = document.createElement('div');
            container.innerHTML = cell.natype;
            container.cell = cell;
            container.style.cursor = 'pointer';
            container.classList.add(NASettings.CSSClasses.NarrativeAccordionView.NodeContainer);
            this.bodyContainer.append(container);
            console.log(container);
            var graph = this.editorui.editor.graph;
            var highlight = new mxCellHighlight(graph, '#000', 2);
            container.onmouseenter = function(){
                highlight.highlight(graph.view.getState(cell));
            }
            container.onmouseleave = function(){
                highlight.hide();
            }
        }
    }

    createBodyElements = function(){
        var t = this;
        this.bodyContainer.innerHTML = "";
        this.narrative.cells.forEach(function(cell){
            t.createNodeRepresentation(cell);
        });
    }

    createHeadElements = function(){
        this.createAssignNodesButton();
    }

    updateView = function(){
        this.createContainers();
        this.createHeadElements();
        this.createBodyElements();
    }
}

class NarrativeAbductionApp {
    #event;
    constructor(ui) {
        this.editorui = ui;
        this.panelwindow;
        this.narrativeaccordionviewscontainer;
        this.narratives = [];
        this.settings = {
            lodupdate: 1.5
        };
        this.myEvent = new CustomEvent("newnarrative", {
            narrative: {},
            bubbles: true,
            cancelable: true,
            composed: false,
          });
        this.naentries = [
            {
                name: NASettings.Dictionary.CELLS.NARRATIVE,              
                style: "swimlane;",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEITEM,              
                style: "fillColor=#ffff;",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
                style: "fillColor=#fad7ac;strokeColor=#b46504;rounded=0;",
                type: "node"
            },
            {
                name: NASettings.Dictionary.CELLS.JOINTCAUSE,
                style: "fillColor=#ffff;",
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


    /**
     * Initialisation 
     */
    _init = function(){        
        this.hideMoreShapesButton();
        this.initNarrativesView();
        this.createNAPanel();
        this.createPalette();     
        this.overrideShapePicker();
        this.initLODUpdate();
        this.initNewCellHandler();
        this.initRemoveCellHandler();
        this.initEdgeDoubleClickEditHandler();
    }

    /**
     * Return the narrative entry
     */
    getNarrativeEntry = function(){
        var res = null;
        this.naentries.forEach(function(elem){
            if(elem.name == NASettings.Dictionary.CELLS.NARRATIVE){
                res = elem;
            }
        })
        return res;
    };

        /**
     * Hide Mode Shapes button on the Side bar
     */
    hideMoreShapesButton = function(){
            var buttons = document.getElementsByClassName("geSidebarFooter");
            console.log("Buttons", buttons);
            Array.from(buttons).forEach(function(elm){
                console.log("Element", elm.innerHTML);
                if(elm.innerHTML.includes('More Shapes')){
                    elm.style.display = 'none';
                }
            });
     }
    
    initRemoveCellHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;

        graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt) {
            var cells = evt.getProperty('cells');

            //if the cell is narrative, remove the view as well 
            if(cells[0] && cells[0].natype == NASettings.Dictionary.CELLS.NARRATIVE){  
                console.log("Narrative removed", cells[0]);  
                t.narrativeaccordionviewscontainer.removeAccordionView(cells[0]);
            }   
          });      
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
                t.showContextualEdgeOptionMenu(cells[0] , sender.lastMouseX, sender.lastMouseY);
            } 
            //if the cell is Narrative, trigger create a new narrative action
            if(cells[0].natype == NASettings.Dictionary.CELLS.NARRATIVE){
                graph.removeCells([cells[0]]);
                t.newNarrative();
            }                
        });
    }

    /**
     * Prevent editing with double click
     */
    initEdgeDoubleClickEditHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt)
        {
            //if edge, show Contextual Edge Option Menu
            var cell = evt.getProperty('cell');   
            if(cell != null && cell.isEdge())
            {    
                var event = evt.getProperty('event');
                t.showContextualEdgeOptionMenu(cell , event.x, event.y);
            }                 
        });
        
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

    /**
     * Update graph model base on LOD if specified
     */
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

    /**
     * Create narrativesviewer window/panel
     */
    initNarrativesView = function(){
        this.narrativeaccordionviewscontainer = new NarrativeAccordionViewsContainer();
        this.narrativeaccordionviewscontainer.app = this;
        var container = document.createElement('div');
        this.editorui.sidebar.container.append(container);
        this.narrativeaccordionviewscontainer.container = container;
        container.classList.add(NASettings.CSSClasses.Panels.SidePanel);

        var t = this;
        // add create narrative buttion
        NAUtil.AddButton(NASettings.Language.English.newnarrative, container, function(){
           console.log("Dev tool - group nodes", t.editorui.editor.graph.getModel());
           t.newNarrative();
        });
    }

    /**
     * Create a new narrative, trigger create narrative view and narrative cell
     */
    newNarrative = function(){

        //create new narrative
        var na = new Narrative();
        this.narratives.push(na);
        na.name = NASettings.Language.English.newnarrative;
        
        // add narrative node
        var graph = this.editorui.editor.graph;
        var narrativeentry = this.getNarrativeEntry();

        //create cell
        var narrativecell = this.createDocumentItemCell(graph, narrativeentry.name,  
            NAUtil.GetCellChildrenLabels(narrativeentry.name).title, 
            NAUtil.GetCellChildrenLabels(narrativeentry.name).description, 
            narrativeentry.style);

        na.rootCell = narrativecell;

        //create view
        this.narrativeaccordionviewscontainer.addAccordionView(na, narrativecell);

        this.#event = new CustomEvent(NASettings.Dictionary.EVENTS.NEWNARRATIVE, { 
            detail: {
                narrative: na, 
                narrativecell: narrativecell
            }, 
        });
        dispatchEvent(this.#event);
    }

    deleteNarrative = function(narrative){

    }


    /**
     * Create NA Panel Window
     */
    createNAPanel = function(){
        var container = document.createElement('div');
        container.classList.add(NASettings.CSSClasses.Panels.SidePanel);
        this.panelwindow = container;


        this.editorui.sidebar.container.append(container);


        //This part is to add link type buttons 
        var setlinktypecontainer = document.createElement('div');
        var label = document.createElement("div");
        label.innerHTML = "Update edge into";
        label.style.paddingBottom = "5px";
        setlinktypecontainer.append(label);
        container.append(setlinktypecontainer);
        //looping through naentries
        var t = this;
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
        this.createDevToolPanel(container);
    }

    /**
     * Create Dev tool panel on
     * @param {*} container 
     */
    createDevToolPanel = function(container){
        var devtoolcontainer = document.createElement('div');

        devtoolcontainer.style.border = "1px solid #aaa";
        var label = document.createElement("span");
        label.innerHTML = "Dev tool";
        devtoolcontainer.append(label);
        container.append(devtoolcontainer);

        var t = this;
        NAUtil.AddButton("Show model", devtoolcontainer, function(){
            console.log("Dev tool - show model", t.editorui.editor.graph.getModel());
            var enc = new mxObjectCodec();
            var rootNode = t.editorui.editor.graph.getDefaultParent();
            var result = enc.decode(rootNode);

            console.log("Dev too - show object", result);
        });


        /// add group
        NAUtil.AddButton("Group nodes", devtoolcontainer, function(){
            console.log("Dev tool - group nodes", t.editorui.editor.graph.getModel());
            var graph = t.editorui.editor.graph;
            var cells = graph.getSelectionCells();
            graph.groupCells(null, 0, cells);
        });

        NAUtil.AddButton("Create narrative", devtoolcontainer, function(){
            console.log("Dev tool - group nodes", t.editorui.editor.graph.getModel());
            t.newNarrative();
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
                this.naentries[i].xml = res.xml;
                this.naentries[i].graph = res.graph;                
                    entries.push(
                    this.editorui.sidebar.addDataEntry(
                        this.naentries[i].name, 0, 0, this.naentries[i].name, Graph.compress(this.naentries[i].xml))
                        );
                }
                console.log("Entires", entries);
            } 
            //else{
            //     res = this.createLinkItem(this.naentries[i].name, this.naentries[i].style);
            // }
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

    createDocumentItemCell = function(graph, itemname, titlename, descrname, style){
        var doc = mxUtils.createXmlDocument();
        var objna = doc.createElement(itemname);
        objna.setAttribute("natype", itemname);

        var objtitle = doc.createElement(titlename);
        var objdescription = doc.createElement(descrname);
        
        var parent = graph.getDefaultParent();       
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

        return nodenaitem;
    }

    /**
     * Create document item cell for the Shape picker and Palette
     * @returns 
     */
    createDocumentItem = function(itemname, titlename, descrname, style){
        var graph = new mxGraph();
        var nodenaitem  = this.createDocumentItemCell(graph, itemname, titlename, descrname, style);

        var currgraph = this.editorui.editor.graph;
        var na = this;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeDoubleClickListener(currgraph, itemname, function(cell, evt){
            var cellName =  cell.children[0].value;
            var cellDesc = cell.children[1].value;

            console.log("Document item clicked");
            console.log("Graph", currgraph);
            console.log("Cell", cell);
            console.log("Name", cellName);
            console.log("Description", cellDesc);
            
            console.log("Event", evt);
            var x = evt.getProperty('event').x;
            var y = evt.getProperty('event').y;

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
            nameInput.value = cellName;

            const br = document.createElement('br');

            const descriptionLabel = document.createElement('label');
            descriptionLabel.textContent = 'Description:';
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.id = 'description';
            descriptionTextarea.name = 'description';
            descriptionTextarea.rows = 4;
            descriptionTextarea.cols = 30;
            descriptionTextarea.value = cellDesc;

            const applyButton = document.createElement('button');
            applyButton.id = 'applyButton';
            applyButton.type = 'button';
            applyButton.textContent = 'Apply';
            applyButton.onclick = applyForm(currgraph, cell);

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
            var highlight = new mxCellHighlight(currgraph, '#000', 2);
            formContainer.onmouseenter = function(){
                highlight.highlight(currgraph.view.getState(cell));
            }
            formContainer.onmouseleave = function(){
                highlight.hide();
            }

            var wnd = NAUtil.CreateWindow(NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, formContainer, x, y, 250, 200);                

            wnd.setLocation(x, y);
            wnd.setClosable(true);
            wnd.setMinimizable(false);
            wnd.setVisible(true);  

            // const nameInput = document.getElementById("name");
            // nameInput.value = cellName;
            // const descriptionTextarea = document.getElementById("description");
            // descriptionTextarea.value = cellDesc;
            // const applyButton = document.getElementById("applyButton");
            // applyButton.onclick = applyForm(currgraph, cell);
            // const form = document.getElementById("narrativeitemform");
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
                    wnd.destroy();
                    highlight.hide();
                }
            };
      
        });
       
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: nodenaitem
        }
    }

    

     /**
     * Show edge type options at position x and y
     * @param {*} edge 
     * @param {*} x 
     * @param {*} y 
     */
     showContextualEdgeOptionMenu = function(edge, x, y){
        var container = document.createElement('div');
        var window = new mxWindow("EdgeType", container, x, y, 200, 200);
        
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

      window.setMinimizable(false);
      window.setClosable(true);
      window.setVisible(true);

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
                f(cell, evt);
            }
            evt.consume();
        });
    }


    static AddNodeDoubleClickListener = function(graph, name, f){
        graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
            var cell = evt.getProperty("cell"); // cell may be null
            if(cell != null && cell.value != null && cell.value.nodeName == name){
                f(cell, evt);
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
     * @returns 
     */
    static CreateWindow = function(id, title, content, x, y, width, height) {
        var wnd = new mxWindow(title, content, x, y, width, height, true, true);
        wnd.id = id;
        return wnd;
      }

    static AddButton = function(label, container, funct)
    {
        var btn = document.createElement('div');
        btn.innerHTML = label;        
        btn.classList.add(NASettings.CSSClasses.NAUtils.Button);

        mxEvent.addListener(btn, 'click', function(evt)
        {
            funct();
            mxEvent.consume(evt);
        });
                
        container.appendChild(btn);
    };

}



