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
            NARRATIVELIST: "NarrativeList",
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
        ATTRIBUTTES: {
            NATYPE: 'natype',
            DOCTITLE: 'doctitle',
            DOCDESCRIPTION: 'docdescription',
            NARRATIVECELLS: 'cells',
        },
        UI: {
            NAHTMLCONTENT: 'HTMLDocContent',
            DOCUMENTITEMWINDOW : 'DocumentItemWindow'
        },
        EVENTS:{
            NEWNARRATIVE: 'newnarrative',
            DELETENARRATIVE: 'deletenarrative'
        }
    }
    static Language = {
        English: {
            "newnarrative": "New Narrative",
            "loadnarratives": "Load Narratives"
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
        NarrativeListView:{
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
    constructor(rootCell, graph, name, id){
        this.id = id;
        this.rootCell = rootCell;
        this.name = name;
        this.cells = [];
        this.graph = graph;
        this.currentGroup;
    }

    /**
     * Remove cell from cells list as well as rootCell children. Note that these two arrays are currently redundant. 
     * @param {*} c 
     */
    removeCell = function(c){
        var idx = this.cells.indexOf(c);
        this.cells.splice(idx, 1); 
        this.unsaveCell(c);
    }

    addCell = function(c){
         if(!this.cells.includes(c)) {
            this.cells.push(c);
            this.saveCell(c);
        }
    }

    /**
     * Push cell id to the cells attribute of the rootCell. 
     */
    saveCell = function(c){
        var cellstring = this.rootCell.value.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS);
        var cellsarr = Narrative.stringCellsToArray(cellstring);

        cellsarr.push(c.id);
        cellstring = Narrative.arrayCellsToString(cellsarr);
        this.rootCell.value.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS, cellstring);
    }

    static stringCellsToArray = function(cellstring){
        if(cellstring == null) cellstring = "[]";
        var cellsarr = JSON.parse(cellstring);
        return cellsarr;
    }

    static arrayCellsToString = function(cellsarr){
       return JSON.stringify(cellsarr);
    }

    /**
     * Remove cell from the root cell cells attribute
     * @param {*} c 
     */
    unsaveCell = function(c){
        var cellstring = this.rootCell.value.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS);
        var cellsarr = Narrative.stringCellsToArray(cellstring);
        var idx = cellsarr.indexOf(c.idx);
        cellsarr.splice(idx, 1); 
        cellstring = Narrative.arrayCellsToString(cellsarr);
        this.rootCell.value.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS, cellstring);
    }
    

    /**
     * Add cells into the narrative cell, also add the cells as children of rootcells
     * @param {*} cells 
     */
    addCells = function(cells){
        var t = this;
        console.log(this.rootCell);
        cells.forEach(element => {
            if(Narrative.isCellValid(element)){
                t.addCell(element);
            }
        });
    }


    /**
     * In some cases, the selected cells are part of narrative element, e.g. content cell. This function validates what cell can be added.
     */
    static isCellValid = function(cell){
        console.log("isCellValid", cell);
        return (cell.value && cell.value.tagName && cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVE && cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVELIST);
    }

    static isCellNarrative = function(cell){
        return (cell.value && cell.value.tagName && cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVE);

    }
}

/**
 * The container object of all narrative accordion views
 */
class NarrativeListViewContainer {
    constructor(colors){
        this.narrativealistviews = [];
        this.app;
        this.colors = colors;
    }

    /**
     * Remove view from the list
     * @param {*} narrative 
     */
    removeListView = function(narrative){
        var listView = this.getListViewByNarrative(narrative);
        if(listView) {
            listView.remove(); //remove the view
            this.colors.push(listView.color); //return the color
        } 
        this.narrativealistviews.splice(this.narrativealistviews.indexOf(listView), 1); //update the list
        this.app.deleteNarrative(narrative); //delete the narrative object
    }

    /**
     * Get the view by narrative
     * @param {*} narrative 
     */
    getListViewByNarrative = function(narrative){
        var ret = null;
        this.narrativealistviews.forEach(element => {
            console.log("Narrative id", narrative.id);
            if(element.narrative.id == narrative.id){
                console.log("Found");
                console.log(element);
                ret = element;
            }
        });
        return ret;
    }

    /**
     * Add view to the list
     * @param {*} na 
     * @param {*} narrativecell 
     */
    addNarrativeListView = function(narrative, narrativecell){
        //container of the narrative view
        var container = document.createElement('div');
        container.id = narrativecell.id;

        this.container.append(container);
        var color = this.getColor();
        var naaccview = new NarrativeListView(narrative, container, this.app.editorui, color); //create view
        naaccview.updateView();   
        naaccview.cell = narrativecell;        
        this.narrativealistviews.push(naaccview);

        return naaccview;
    }

    /**
     * Get new color
     */
    getColor = function(){
        return this.colors.pop();
    };
}

/**
 * Accordion View of a narrative
 */
class NarrativeListView{
    constructor(narrative, container, editorui, color){
        this.narrative = narrative;
        this.cellViews = [];
        this.headContainer;
        this.bodyContainer;
        this.container = container;
        this.editorui = editorui;
        this.color = color;
        this.uinarrativetitle;

        this.initListenerUpdateNarrativeCellEdit();
        this.initListenerUpdateDocumentItemTitle();
    }

    /**
     * Remove the list view
     */
    remove = function(){
        console.log("Removing accordion view", this);
        this.container.remove();
    }

    /**
     * 
     * @returns Get the style to hightlight
     */
    getHighlightStyle = function(){
        return 'strokeColor='+this.color+';strokeWidth=6';
    }

    /**
     * Highlight children cells
     * @param {*} cellsToHighlight 
     */
    highlightCells = function(cellsToHighlight) {
        var highlightStyle = this.getHighlightStyle();
      
        var graph = this.editorui.editor.graph;
        graph.getModel().beginUpdate();
        try {
          for (let cell of cellsToHighlight) {
            graph.setCellStyle (cell.getStyle()  + highlightStyle, [cell]);
          }
        } finally {
          graph.getModel().endUpdate();
        }
      }


    /**
     * Unhighilight the children cells
     * @param {*} cellsToUnhighlight 
     */
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
        this.uinarrativetitle = document.createElement('div');

        this.container.classList.add(NASettings.CSSClasses.NarrativeListView.Container);
        this.headContainer.classList.add(NASettings.CSSClasses.NarrativeListView.HeadContainer);
        this.bodyContainer.classList.add(NASettings.CSSClasses.NarrativeListView.BodyContainer);

        this.headContainer.style.background = this.color;

        this.uinarrativetitle.style.height = '30px';
        this.uinarrativetitle.innerHTML = this.narrative.name;        
        this.uinarrativetitle.classList.add(NASettings.CSSClasses.NarrativeListView.Title);

        var t = this;
        this.uinarrativetitle.onmouseenter = function(){            
            t.highlightCells(t.narrative.cells);
        }
        this.uinarrativetitle.onmouseleave = function(){
            t.unhighlightCells(t.narrative.cells);
        }


        this.container.append(this.headContainer);
        this.container.append(this.bodyContainer);
        this.headContainer.appendChild(this.uinarrativetitle);


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
    * Update the narrative list livew
    */
   initListenerUpdateNarrativeCellEdit = function(){
    var graph = this.editorui.editor.graph;
    var t = this;
    graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt) {
        var cell = evt.getProperty('cell'); // Get the cell whose label changed
        var newValue = evt.getProperty('value'); // Get the new label value
        console.log("cell", cell);

        if(Narrative.isCellNarrative(cell)){
            console.log("Edit title");
            t.uinarrativetitle.innerHTML = newValue;
        }

        });
    }

     /**
    * Update the narrative list livew
    */
   initListenerUpdateDocumentItemTitle = function(){
    var graph = this.editorui.editor.graph;
    var t = this;
    graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt) {
        var cell = evt.getProperty('cell'); // Get the cell whose label changed
        var newValue = evt.getProperty('value'); // Get the new label value
        var natype = cell.natype;
        console.log("cell", cell);
        console.log("natype", natype);

        if(natype == NASettings.Dictionary.ATTRIBUTTES.DOCTITLE){
            //check if the parent is in narrative
            var parent = cell.parent;
            console.log("Parent", parent);
            if(t.narrative.cells.includes(parent)){
                console.log("Cell in narrative");
                console.log("Edit title of cell view");
                var cellview = t.getCellView(parent);
                console.log("cellview", cellview);
                if(cellview) cellview.htmltitle.innerHTML = newValue;                
            }

        }
        

        });
    }

    /**
     * Create assign nodes button
     */
    createAssignNodesButton = function(){
        var buttonAssignNode = document.createElement('button');
        buttonAssignNode.innerHTML = "Assign Nodes";        
        buttonAssignNode.onclick = this.assignNode.bind(null, this);
        this.headContainer.append(buttonAssignNode);
    }

    /**
     * Assign selected node to the narrative.
     * The narrative cell should contain the all information necessary to recreate the view, thus, the children cells' ids should be stored in the narrative cell. 
     */
    assignNode = function(t){
        var graph = t.editorui.editor.graph;
        var selectedCells = graph.getSelectionCells();
        if(selectedCells){
           t.assignNodes(selectedCells);
        }
    }
    assignNodes = function(cells){
        this.narrative.addCells(cells); //add cell to the narrative object, this is where the children cells are added to the root cell
        this.createBodyElements(); //create representaton
    }

    /**
     * Create representation of the cell/node in the view
     * @param {*} cell 
     */
    createCellView = function(cell){
        if(cell.isVertex()){
            
            //container of the view
            var container = document.createElement('div'); //main container
            var textcontainer = document.createElement('div');
            textcontainer.style.display = "inline list-item";
            textcontainer.id = cell.id + "title";
            var uicontainer = document.createElement('div');
            uicontainer.style.display = "inline";
            uicontainer.style.float = "right";

            container.append(textcontainer);
            container.append(uicontainer);

            textcontainer.innerHTML = cell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE);
            container.cell = cell;
            container.style.cursor = 'pointer';
            container.classList.add(NASettings.CSSClasses.NarrativeListView.NodeContainer);
            container.id = cell.id;
            
            //create unasign button
            var unasignButton = document.createElement('button');
            unasignButton.innerHTML = 'x';
            unasignButton.style.cursor = 'pointer';
            unasignButton.onclick = this.unasignCell.bind(null, this, cell); //handler to remove this cell from the group
            uicontainer.append(unasignButton);

            //add the container to the body
            this.bodyContainer.append(container);
            var graph = this.editorui.editor.graph;
            var highlight = new mxCellHighlight(graph, '#000', 2);
            //add highlight
            textcontainer.onmouseenter = function(){
                highlight.highlight(graph.view.getState(cell));
            }
            textcontainer.onmouseleave = function(){
                highlight.hide();
            }

            var cellView = {
                cell: cell,
                htmlcontainer: container, 
                htmltitle: textcontainer, 
                htmluicontainer: uicontainer
            }

            this.cellViews.push(cellView);
        }
    }

    /**
     * Remove cell from the list
     * @param {*} t 
     * @param {*} c 
     */
    unasignCell = function(t, c){
        t.narrative.removeCell(c);
        t.removeCellView(c);
    }

    /**
     * Remove cell view
     * @param {*} c 
     */
    removeCellView = function(c){
        var cellView = this.getCellView(c);
        cellView.htmlcontainer.remove();
        this.cellViews.splice(this.cellViews.indexOf(cellView), 1); 
    }


    /**
     * Get cell view from given cell
     * @param {*} cell 
     * @returns 
     */
    getCellView = function(cell){   
        var ret = null;     
        console.log("getCellView");
        this.cellViews.forEach(view => {
            if(view.cell == cell){
                ret = view;
            }
        });

        return ret;
    }

    /**
     * Create representation of cells in the view's body
     */
    createBodyElements = function(){
        var t = this;
        this.bodyContainer.innerHTML = "";
        this.narrative.cells.forEach(function(cell){
            t.createCellView(cell);
        });
    }

    createHeadElements = function(){
        this.createAssignNodesButton();
    }

    updateView = function(){
        this.createContainers();
        this.createHeadElements();
        this.createBodyElements();
        this.updateRootCellColor();
    }

    updateRootCellColor = function(){
        var style = this.narrative.rootCell.getStyle() +";fillColor="+this.color+";"
        this.editorui.editor.graph.getModel().setStyle(this.narrative.rootCell, style);
    }
}

class NarrativeAbductionApp {
    #event;
    constructor(ui) {
        this.editorui = ui;
        this.panelwindow;
        this.narrativeaviewscontainer;
        this.narratives = [];
        this.settings = {
            lodupdate: 5.5
        };
        this.narrativelistcell;
        this.myEvent = new CustomEvent("newnarrative", {
            narrative: {},
            bubbles: true,
            cancelable: true,
            composed: false,
          });
        this.excludefrompicker = [
            NASettings.Dictionary.CELLS.NARRATIVELIST,
            NASettings.Dictionary.CELLS.NARRATIVE
        ];
        this.naentries = [ 
            {
                name: NASettings.Dictionary.CELLS.NARRATIVELIST,              
                style: "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVE,              
                style: "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;resizable=0;connectable=0;",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEITEM,              
                style: "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;fontColor=#333333;strokeColor=none;",
                iconURL: "https://thenounproject.com/api/private/icons/5926263/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0",
                type: "node"            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
                style: "rounded=0;whiteSpace=wrap;html=1;",
                iconURL: "https://thenounproject.com/api/private/icons/4353546/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0",
                type: "node"
            },
            // {
            //     name: NASettings.Dictionary.CELLS.JOINTCAUSE,
            //     style: "swimlane;fillColor=#ffff;",
            //     //iconURL: "https://thenounproject.com/api/private/icons/4493200/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0",
            //     type: "node"
            // },
            // {
            //     name: NASettings.Dictionary.CELLS.EVIDENCENARRATIVESPECIFIC,
            //     style: "swimlane;fillColor=#fad9d5;strokeColor=#ae4132;rounded=0;",
            //     iconURL: "https://thenounproject.com/api/private/icons/4040420/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0",
            //     type: "node"
            // },
            // {
            //     name: NASettings.Dictionary.CELLS.SUPPORTINGARGUMENT,
            //     style: "swimlane;fillColor=#dae8fc;strokeColor=#6c8ebf;rounded=0;",
            //     iconURL: "https://thenounproject.com/api/private/icons/5741355/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0",
            //     type: "node"
            // },
            {
                name: NASettings.Dictionary.CELLS.EXPLAINLINK, 
                style: "editable=0;shape=flexArrow;endArrow=classic;html=1;rounded=0;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.CAUSELINK, 
                style: "editable=0;endArrow=classic;html=1;rounded=1;strokeWidth=3;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.TRIGGERLINK, 
                style: "editable=0;endArrow=classic;html=1;rounded=1;strokeWidth=3;dashed=1;",
                type: "edge"
            }
            ,
            {
                name: NASettings.Dictionary.CELLS.ENABLELINK, 
                style: "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;dashed=1;dashPattern=1 1;strokeColor=#FF3333;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.SUPPORTLINK, 
                style: "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#006600;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.MOTIVATELINK, 
                style: "editable=0;shape=flexArrow;endArrow=classic;html=1;rounded=0;",
                type: "edge"
            },
            {
                name: NASettings.Dictionary.CELLS.CONFLICTLINK, 
                style: "editable=0;editable=1;endArrow=cross;html=1;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;connectable=1;startArrow=none;startFill=0;endFill=0;strokeWidth=2;strokeColor=#ff0000;",
                type: "edge"
            }
        ];
    }


    /**
     * Initialisation 
     */
    _init = function(){      
        this.initNarrativesView();
        this.createNAPanel();
        this.createPalette();     
        //this.installStackedLayout();
        this.initResponsiveSizeHandlerVanilaContent();
        this.initListenerDocumentSizeAfterDescriptionEdit();
        this.initShapePickerHandler();
        this.initNewCellHandler();
        this.initRemoveNarrativeCellHandler();
        this.initEdgeDoubleClickEditHandler();
        this.updateMoreShapesButton();
        this.loadExistingNarratives();

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
     * Update position of more shape button
     */
    updateMoreShapesButton = function(){
            var buttons = document.getElementsByClassName("geSidebarFooter");
            console.log("Buttons", buttons);
            var t = this;
            Array.from(buttons).forEach(function(elm){
                console.log("Element", elm.innerHTML);
                if(elm.innerHTML.includes('More Shapes')){
                    elm.style.position = 'relative';
                    t.panelwindow.append(elm);
                }
            });
     }
    
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

    /**
     * This responsive handler is for HTML document title 
     */
    initResponsiveSizeHandlerHTMLContent = function(){
         // Define responsive styles using CSS
         var css = document.styleSheets[0];
         css.insertRule('.responsive-content { width: 100%; height: 100%; display: inline-block; justify-content: center; align-items: center; }', 0);

        var graph = this.editorui.editor.graph;
        // Handle resizing of the cell
        graph.addListener(mxEvent.RESIZE_CELLS, function(sender, evt) {
            var cells = evt.getProperty('cells');
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                var newWidth = cell.geometry.width;
                var newHeight = cell.geometry.height;
                console.log("Cell resize", cell);
                if(cell.children){
                    cell.children.forEach(child => {
                        child.geometry.width = newWidth;
                        child.geometry.height = newHeight - 20;
                    });
                }
            }
            });
    }

    /**
     * Handler for when the vanila document item size is updated
     */
    initResponsiveSizeHandlerVanilaContent = function(){
       var graph = this.editorui.editor.graph;
       // Handle resizing of the cell
       graph.addListener(mxEvent.RESIZE_CELLS, function(sender, evt) {
           var cells = evt.getProperty('cells');
           for (var i = 0; i < cells.length; i++) {
               var cell = cells[i];
               console.log("Cell", cell);
               var newWidth = cell.geometry.width;
               var newHeight = cell.geometry.height;
               console.log("Cell resize", cell);
               if(cell.children){
                   cell.children.forEach(child => {
                    console.log("child", child);

                    var natype = child.natype;
                    if(natype == NASettings.Dictionary.ATTRIBUTTES.DOCTITLE){
                        child.geometry.width = newWidth - 30;
                    }
                    if(natype == NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION){
                        child.geometry.width = newWidth - 30;
                        child.geometry.height = newHeight - 50;
                    }
                      
                   });
               }
           }
        });
   }

   /**
    * Update the height of the document item to accomodate the description
    */
   initListenerDocumentSizeAfterDescriptionEdit = function(){
        var graph = this.editorui.editor.graph;
        graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt) {
            var cell = evt.getProperty('cell'); // Get the cell whose label changed
            var newValue = evt.getProperty('value'); // Get the new label value
            var natype = cell.natype;
            console.log("cell", cell);
            console.log("natype", natype);

            if(natype == NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION){
                console.log("cell", cell);
                console.log("new value", newValue);
                console.log("geometry", cell.geometry);
            }

        });
   }



    /**
     * Is the given cell narrative cell
     * @param {*} cell 
     * @returns 
     */
    isCellNarrative = function(cell){
        return (cell.value != undefined && cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVE);
    }

    /**
     * Create the container cell that will contain the narrative cells
     */
    createNarrativeListCell = function(){
        var entry = this.getEntryByName(NASettings.Dictionary.CELLS.NARRATIVELIST);
        var graph = this.editorui.editor.graph;
        var doc = mxUtils.createXmlDocument();
        var obj = doc.createElement(entry.name);    
 
        console.log("entry", entry);
        graph.getModel().beginUpdate();
        try{
            var cell = graph.insertVertex(graph.getDefaultParent(), null, obj, 0, 0, 100, 100); 
            cell.setStyle(entry.style);  
            this.narrativelistcell = cell;
            console.log("cell", cell);
        }finally{
            graph.getModel().endUpdate();
        }
    }

    /**
     * Remove cell handler
     */
    initRemoveNarrativeCellHandler = function(){
        var graph = this.editorui.editor.graph;
        var t = this;

        graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt) {
            var cells = evt.getProperty('cells');
            console.log("Cell removed", cells[0]);  
            cells.forEach(cell => {
                //if the cell is narrative, remove the view as well 
                if(t.isCellNarrative(cell)){  
                    console.log("Narrative removed", cell);  
                    t.narrativeaviewscontainer.removeListView(cell);
                }   
            });

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
            console.log("new cells", cells);
            if(cells[0] && cells[0].isEdge()){     
                //edge type based on target node
                var edge = cells[0];
                var target = edge.target.value.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE);
                switch(target){
                    case NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE:
                        t.setEdgeType(edge, NASettings.Dictionary.CELLS.EXPLAINLINK);
                        break;
                    default:
                        t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);
                        break;
                }
               // t.showContextualEdgeOptionMenu(cells[0] , sender.lastMouseX, sender.lastMouseY);
            } 
            //if the cell is Narrative, trigger create a new narrative action
            if(cells[0].getAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE) == NASettings.Dictionary.CELLS.NARRATIVE){
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
    * Take the edge and turn it into Cause link
    * @param {*} edge 
    */
    setEdgeType = function(edge, target){
        var graph = this.editorui.editor.graph;
        var causeLink = this.getEntryByName(target);
        if(causeLink){
          graph.getModel().beginUpdate();
          try
          {
              graph.getModel().setValue(edge, target.replace("Link","") + "s");
              graph.setCellStyle(causeLink.style, [edge]);
          }
          finally
          {
              graph.getModel().endUpdate();
          }
        }      
    }

    /**
     * Show link type option when two nodes are connected. In the vanila version, the default link will be "Cause". 
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

          //t.showContextualEdgeOptionMenu(edge, event.x, event.y); //no contextual menu by default
          //by default the link will be causes link
          t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);    
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
        this.narrativeaviewscontainer = new NarrativeListViewContainer(NASettings.Colors.Narratives);
        this.narrativeaviewscontainer.app = this;
        var container = document.createElement('div');
        this.editorui.sidebar.container.append(container);
        this.narrativeaviewscontainer.container = container;
        container.classList.add(NASettings.CSSClasses.Panels.SidePanel);

        var t = this;
        // add create narrative buttion
        NAUtil.AddButton(NASettings.Language.English.newnarrative, container, function(){
           if(!t.narrativelistcell){
            t.createNarrativeListCell();
           }
           var ret = t.newNarrative();
           t.addNarrativeCellToList(ret.narrativecell);
           
        });
        // add load narrative buttion
        // NAUtil.AddButton(NASettings.Language.English.loadnarratives, container, function(){
        //     t.loadExistingNarratives();
        //  });
    }

    /**
     * Assign the cell into the list
     * @param {*} cell 
     */
    addNarrativeCellToList = function(cell){
        if(this.narrativelistcell){
            console.log("this.narrativelistcell", this.narrativelistcell);
            var graph = this.editorui.editor.graph;
            graph.getModel().beginUpdate();
            try{
                graph.getModel().add(this.narrativelistcell, cell);
                var layout = new mxStackLayout(graph, true);
                layout.execute(this.narrativelistcell);
               // cell.setParent();
            }finally{
                graph.getModel().endUpdate();
            }
           
        }
    }

    /**
     * Check for existing narrative cells and update the view accordingly
     */
    loadExistingNarratives = function(){
        var t = this;
        var graph = t.editorui.editor.graph;

        t.editorui.editor.graph.selectAll();
        var cells = graph.getSelectionCells();
        console.log("Cells", cells);

        cells.forEach(cell => {
            if(t.isCellNarrative(cell)){
                console.log("loadExistingNarratives", cell);
                var na = new Narrative(cell, graph, NASettings.Language.English.newnarrative, cell.id);
                this.narratives.push(na);
                var nalistview = this.narrativeaviewscontainer.addNarrativeListView(na, cell); //add accordion view
                
                //then, we need to re-assign cells to this narrative. These cells ids are store in the cells proprty
                var cellstring = cell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS);
                var cellsidsarray = Narrative.stringCellsToArray(cellstring);
                var cellsarray = [];
                cellsidsarray.forEach(id => {                                        
                    var cell = graph.getModel().getCell(id);
                    if(cell) cellsarray.push(cell);
                });
                console.log("cellsarray", cellsarray);
                nalistview.assignNodes(cellsarray);
            }  
        });
        t.editorui.editor.graph.removeSelectionCells(cells);
    }

    /**
     * Create a new narrative, trigger create narrative view and narrative cell
     */
    newNarrative = function(){        
        var narrativeentry = this.getNarrativeEntry(); //get narrative entry from the entries list
        var graph = this.editorui.editor.graph;
        var parent = graph.getDefaultParent();  
        var doc = mxUtils.createXmlDocument();
        var objna = doc.createElement(narrativeentry.name);    
 
        var narrativecell;
        var narrview;
        var na;
        graph.getModel().beginUpdate();
       //add the narrative cell
       try
       {
            narrativecell = graph.insertVertex(parent, null, objna, 0, 0, 100, 100);       
            graph.setCellStyle(narrativeentry.style, [narrativecell]);  
       }
       finally
       {
           graph.getModel().endUpdate();
           //create narrative object and view
           na = new Narrative(narrativecell, graph, NASettings.Language.English.newnarrative, narrativecell.id);
           this.narratives.push(na);
           narrview =  this.narrativeaviewscontainer.addNarrativeListView(na, narrativecell); //add accordion view
           
           //trigger new narrative event
           this.#event = new CustomEvent(NASettings.Dictionary.EVENTS.NEWNARRATIVE, { 
               detail: {
                   narrative: na, 
                   narrativecell: narrativecell
               }, 
           });
           dispatchEvent(this.#event);

            //if objects are selected, add them automatically to the narrative
            var selectedCells = graph.getSelectionCells();
            if(selectedCells && narrview){
                narrview.assignNodes(selectedCells);
           }   
       }     
       return{
        narrative: na, 
        narrativeview: narrview,
        narrativecell: narrativecell
       }
    }

    /**
     * Remove narrative from the list
     * @param {*} narrative 
     */
    deleteNarrative = function(narrative){
        this.narratives.splice(this.narratives.indexOf(narrative), 1);
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
        });


        NAUtil.AddButton("Show cells detail", devtoolcontainer, function(){
            console.log("Dev tool - show model", t.editorui.editor.graph.getSelectionCells());
        });


        
        NAUtil.AddButton("Select all", devtoolcontainer, function(){
            t.editorui.editor.graph.selectAll();
        });

        NAUtil.AddButton("Test layout of Narrative 1", devtoolcontainer, function(){
            // Assuming you have the mxGraph instance and the graph model
            
            var graph = t.editorui.editor.graph;
            var model = graph.getModel();
            var narrative = t.narratives[0];
            if(!narrative) return;

            // Identify parent nodes and children (replace with your logic)
            var parentNodes = narrative.cells; // Array of parent node cells

            // check excluded nodes
            var excludeNodes = [];
            
            graph.selectAll();
            var selectedCells = graph.getSelectionCells();
            selectedCells.forEach(cell => {
                if(!parentNodes.includes(cell) && cell.children != null){
                    excludeNodes.push({
                        excell: cell, 
                        x: cell.geometry.x,
                        y: cell.geometry.y
                    });
                }
            });

            console.log("excludeNodes", excludeNodes);

            //update excluded cells position
            model.beginUpdate();
            try {
                
                var layout = new mxHierarchicalLayout(graph);
                layout.execute(graph.getDefaultParent(), parentNodes);

                excludeNodes.forEach(cell => {
                    var currentgeometry = model.getGeometry(cell.excell);
                    currentgeometry.x = cell.x;
                    currentgeometry.y = cell.y;

                    console.log("currentgeometry", currentgeometry);
                    console.log("cell", cell);

                    model.setGeometry(cell.excell, currentgeometry);
               });
            } finally {
              model.endUpdate();
            }
        });


        NAUtil.AddButton("Load narratives", devtoolcontainer, function(){
            t.loadExistingNarratives();
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
     * check whether or not the entry should be included in the shape picker
     * @param {*} entry 
     * @returns 
     */
    isValidShapePickerItem = function(entry){
        return (entry.type == "node" && !this.excludefrompicker.includes(entry.name));
    }

    /**
     * Create palette for the side bar
     */
    createPalette = function(){
        var entries = []; //all palette entries
        for(var i = 0; i < this.naentries.length;i++){
            var res;
            if(this.isValidShapePickerItem(this.naentries[i])){
                var entry = this.naentries[i];
                entry.titlename = NAUtil.GetCellChildrenLabels(this.naentries[i].name).title;
                entry.descname = NAUtil.GetCellChildrenLabels(this.naentries[i].name).description;

                res = this.createDocumentItem(entry);
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
    initShapePickerHandler = function(){
        //override
        var t = this;
        this.editorui.getCellsForShapePicker = function(cell, hovering, showEdges){
            //somehow the style fails, we need to override it. This might not be the case anymore, need to revisit this again later
            var newcells = [];
            t.naentries.forEach(function(currentValue, index, arr){
                    console.log("c", currentValue);
                    //only add node items
                    if(t.isValidShapePickerItem(currentValue)){
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

        var graph = new mxGraph();
        var parent = graph.getDefaultParent();                           
        graph.getModel().beginUpdate();
        var linkcell;
        try
        {
            var v1 = graph.insertVertex(parent, null, null, 200, 0, 1, 1, 'opacity=0;');        
            var v2 = graph.insertVertex(parent, null, null, 0, 0, 1, 1, 'opacity=0;');        

            linkcell = graph.insertEdge(parent, null, '', v2, v1);
            linkcell.setStyle(style);
            linkcell.value = itemname;
        }
        finally
        {
            graph.getModel().endUpdate();
        }
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: linkcell
        }
    }

    /**
     * Create a document node in HTML content format
     * @param {*} graph 
     * @param {*} entry 
     * @returns 
     */
    createDocumentItemHTMLCell = function(graph, entry){
        var itemname = entry.name;
        var titlename = entry.titlename;
        var descrname = entry.descrname;
        var style = entry.style;
  
        var doc = mxUtils.createXmlDocument();
        var docmain = doc.createElement(itemname);
        var doccontent = doc.createElement(NASettings.Dictionary.UI.NAHTMLCONTENT);
        docmain.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, itemname);
        //these attributes can be used to visualise the document item
        doccontent.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, NASettings.Dictionary.UI.NAHTMLCONTENT);
        docmain.setAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCTITLE, titlename);
        docmain.setAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION, descrname);

        var parent = graph.getDefaultParent();       
        var documentcell;
        var contentcell;
        try
        {
            documentcell = graph.insertVertex(parent, null, docmain, 200, 150, 350, 150);
            documentcell.setStyle(style);
            contentcell = graph.insertVertex(documentcell, null, doccontent,  0, 20, 350, 130);
            contentcell.setStyle("html=1;movable=0;editable=0;whiteSpace=wrap;overflow=hidden;resizable=0;rotatable=0;deletable=0;locked=0;connectable=0;");
            this.updateHTMLDocumentItemAppearance(documentcell, contentcell); // here is the visualisation happens
            //disable direct edit

        }
        finally
        {
            graph.getModel().endUpdate();

        }        
        return documentcell;
    }

    /**
     * Create the cell for a document item in label + content format
     * @param {*} graph 
     * @param {*} entry 
     * @returns 
     */
    createDocumentItemCell = function(graph, entry){
        var itemname = entry.name;
        var titlename = entry.titlename;
        var descrname = entry.descrname;
        var style = entry.style;

        var doc = mxUtils.createXmlDocument();
        var objna = doc.createElement(itemname);
        objna.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, itemname);

        var objtitle = doc.createElement(titlename);
        objtitle.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, NASettings.Dictionary.ATTRIBUTTES.DOCTITLE);

        var objdescription = doc.createElement(descrname);
        objdescription.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION);

        
        var parent = graph.getDefaultParent();       
        var documentcell;
        try
        {
            documentcell = graph.insertVertex(parent, null, objna, 200, 150, 350, 150);
            documentcell.setStyle(style);
            var nodetitle = graph.insertVertex(documentcell, null, objtitle, 10, 10, 320, 30);
            nodetitle.setStyle("text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontStyle=1;fontSize=17;fontColor=default;labelBorderColor=none;labelBackgroundColor=none;resizable=0;allowArrows=0;movable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodetitle.setValue(titlename);
            nodetitle.natype = NASettings.Dictionary.ATTRIBUTTES.DOCTITLE;
            nodetitle.setConnectable(false);            
            var nodedesc = graph.insertVertex(documentcell, null, objdescription, 10, 50, 320, 100);
            nodedesc.setStyle("text;whiteSpace=wrap;overflow=block;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;rounded=0;allowArrows=0;movable=0;resizable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;autosize=1;resizeHeight=1;fixedWidth=1;");
            nodedesc.setValue("Desription");
            nodedesc.setConnectable(false);
            nodedesc.natype = NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION;

            //nodedesc.lod = this.settings.lodupdate; //disable LOD for vanila version

            //disable icon for vanila version
            // if(entry.iconURL){
            //     var nodeicon = graph.insertVertex(documentcell, null, "", 10, 300, 100, 100);
            //     var iconstyle = "shape=image;imageAspect=1;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;rotation=0;labelBackgroundColor=#ffffff;labelBorderColor=none;connectable=0;allowArrows=0;recursiveResize=0;expand=0;editable=1;movable=1;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;image=" + entry.iconURL;
            //     nodeicon.setStyle(iconstyle);
            // }
        }
        finally
        {
            graph.getModel().endUpdate();
        }        

        return documentcell;
    }

    /**
     * This function decides how the content of the HTML Document Item is rendered to HTML element. This function is related to the HTML Document Item format. 
     * @param {*} contencell 
     */
    updateHTMLDocumentItemAppearance = function(doccell, contencell){
        var title = doccell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCTITLE);
        var des = doccell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION);
        var html = this.getHTMLDocumentItemContent(title, des);
        contencell.setValue(html);          
    }

    /**
     * Return the html content of the HTML Document Item
     * @param {*} title 
     * @param {*} description 
     * @returns 
     */
    getHTMLDocumentItemContent = function(title, description){
        return '<div class="responsive-content"><b>'+title+'</b><br/><div>'+description+'</div></div>';
    }

    getEntryByName = function(name){
        var ent = null;
        this.naentries.forEach(element => {
            if(element.name == name){
                ent = element;
                return ent;
            }
        });

        return ent;
    }

    /**
     * This is the listener to the new HTML document item, lots of duplicates with insertDocumentItemDoubleClickListener
     * TODO: remove duplicates
     * @param {*} entry 
     */
    insertHTMLDocumentItemDoubleClickListener = function(entry){
        var currgraph = this.editorui.editor.graph;
        var t = this;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeDoubleClickListener(currgraph, entry.name, function(cell, evt){
            if(!cell || !cell.children) return;

            var contentcell =  cell.children[0].value;

            // get x and y position of triggered event
            var x = evt.getProperty('event').x;
            var y = evt.getProperty('event').y;

            // create form 
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
            nameInput.value = cell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCTITLE);

            const br = document.createElement('br');

            const descriptionLabel = document.createElement('label');
            descriptionLabel.textContent = 'Description:';
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.id = 'description';
            descriptionTextarea.name = 'description';
            descriptionTextarea.rows = 4;
            descriptionTextarea.cols = 30;
            descriptionTextarea.value = cell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION);

            const applyButton = document.createElement('button');
            applyButton.id = 'applyButton';
            applyButton.type = 'button';
            applyButton.textContent = 'Apply';
            applyButton.onclick = applyForm(currgraph, cell, t);

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

            form.onsubmit =  function(event) {
                event.preventDefault();
                return false;
            }
            
            function applyForm(currgraph, c, t, n, d) {
                return function(){

                    
                    const nameInput = document.getElementById("name");
                    const descriptionTextarea = document.getElementById("description");

                    currgraph.getModel().beginUpdate();        
                    try
                    {
                        var html = t.getHTMLDocumentItemContent(nameInput.value, descriptionTextarea.value);
                        var contentcell = c.children[0];

                        currgraph.model.setValue(contentcell, html);
                        cell.setAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCTITLE, nameInput.value);
                        cell.setAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION, descriptionTextarea.value);
                    }
                    finally
                    {
                        currgraph.getModel().endUpdate();
                    }
                    wnd.destroy();
                    highlight.hide();
                }
            };

        });
    }

    /**
     * This is listener for the old document item with dedicated nodes for the title and description. Lots of duplicated codes with insertHTMLDocumentItemDoubleClickListener.
     * TODO: remove duplicates
     * @param {*} entry 
     */
    insertDocumentItemDoubleClickListener = function(entry){
        var currgraph = this.editorui.editor.graph;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeDoubleClickListener(currgraph, entry.name, function(cell, evt){
            if(!cell || !cell.children) return;

            var cellName =  cell.children[0].value;
            var cellDesc = cell.children[1].value;

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
    }

    /**
     * Create document item cell for the Shape picker and Palette
     * @returns 
     */
    createDocumentItem = function(entry){
        var graph = new mxGraph();
        var documentcell  = this.createDocumentItemCell(graph, entry); //there are two options, HTML Document or Simple label + description. 
        //this.insertHTMLDocumentItemDoubleClickListener(entry);  //disable double click window editor     
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: documentcell
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



