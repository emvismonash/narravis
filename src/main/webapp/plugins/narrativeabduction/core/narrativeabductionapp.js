/**
 * This is the main script that handles and integrate all events. 
 */
class NarrativeAbductionApp {
    constructor(ui) {
      this.editorui = ui;
      this.narratives = [];
      this.narrativelistcell = {};
      this.narrativeaviewscontainer = {};
      this.panelwindow = {};
      this.naentries = NAEntries;
      this.excludefrompicker = [
        NASettings.Dictionary.CELLS.NARRATIVELIST,
        NASettings.Dictionary.CELLS.NARRATIVE,
      ];
      this.documentitemminwidth = NASettings.DocumentCellSetting.minwidth;
      this.documentitemminheight = NASettings.DocumentCellSetting.minheight;     
      this.narrativelanescontroller;
      this.narrativeaviewscontainer;
      this.narrativelayoutwindow;
      this.narrativegptauthor;
      this.generatingsession = false;
    }
  
    initiate(){
      this.narrativelanescontroller = new NarrativeLanesController(this.editorui.editor.graph, this);
      this.narrativelanescontroller.initiate();

      this.narrativegptauthor = new NarrativeGPTAuthoring(this);
      this.createNAPanel();
      this.narrativeaviewscontainer = new NarrativeListViewContainer(NASettings.Colors.Narratives, this);  
      this.createPalette();
      this.initListenerResponsiveSizeHandler();
      this.initOverrideShapePickerHandler();
      this.initListenerNewCellHandler();
      this.initOverrideConnectionConstraints();
      this.initListenerRemoveNarrativeCellHandler();
      this.initListenerEdgeDoubleClickEditHandler();
      this.updateMoreShapesButton();

    }

    /**
     * Assign the narrative cell into the narrative list
     * @param {*} cell
     */
    addNarrativeCellToList(cell) {
      if (this.narrativelistcell) {
        const graph = this.editorui.editor.graph;
        graph.getModel().beginUpdate();
        try {
          graph.getModel().add(this.narrativelistcell, cell);
          let layout = new mxStackLayout(graph, true);
          layout.execute(this.narrativelistcell);
          // cell.setParent();
        } finally {
          graph.getModel().endUpdate();
        }
      }
    };
  
      
    /** Assign cell to a narrative */
    assignNodes(nalistview, targets){
      let validated = this.getValidatedAssignedCells(targets);
      let validTargets = validated.validcells;
      let invalidTargets = validated.invalidcells;
  
      if(validTargets.length > 0)  {
        if(nalistview) {
          nalistview.assignNodes(validTargets);
        } 
      }
      if(invalidTargets.length > 0){
        let msg = "Some of selected cells are ignored because they are part of existing narrative";
      }
  
    }
  


    /**
     * Create link. This is still not working well as it creates two empty nodes
     * @param {*} itemname
     * @param {*} style
     * @returns
     */
    createLinkItem (itemname, style) {
      const graph = new mxGraph();
      const parent = graph.getDefaultParent();
      graph.getModel().beginUpdate();
      let linkcell;
      try {
        let v1 = graph.insertVertex(
          parent,
          null,
          null,
          200,
          0,
          1,
          1,
          "opacity=0;"
        );
        let v2 = graph.insertVertex(parent, null, null, 0, 0, 1, 1, "opacity=0;");
  
        linkcell = graph.insertEdge(parent, null, "", v2, v1);
        linkcell.setStyle(style);
        linkcell.value = itemname;
      } finally {
        graph.getModel().endUpdate();
      }
      return {
        xml: NAUtil.ModelToXML(graph),
        graph: graph,
        cell: linkcell,
      };
    };
  
   
    /**
     * Create the cell for a document item in label + content format
     * @param {*} graph
     * @param {*} entry
     * @returns
     */
    createDocumentItemCell(graph, entry) {
      const itemname = entry.name;
      const titlename = entry.titlename;
      const descrname = entry.descrname;
      const style = entry.style;
  
      const doc = mxUtils.createXmlDocument();
      let objna = doc.createElement(itemname);
      objna.setAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE, itemname);
  
      let objtitle = doc.createElement(titlename);
      objtitle.setAttribute(
        NASettings.Dictionary.ATTRIBUTES.NATYPE,
        NASettings.Dictionary.ATTRIBUTES.DOCTITLE
      );
  
      let objdescription = doc.createElement(descrname);
      objdescription.setAttribute(
        NASettings.Dictionary.ATTRIBUTES.NATYPE,
        NASettings.Dictionary.ATTRIBUTES.DOCDESCRIPTION
      );
  
      const parent = graph.getDefaultParent();
      graph.getModel().beginUpdate();
      let documentcell;
      try {
        documentcell = graph.insertVertex(
          parent,
          null,
          objna,
          200,
          150,
          this.documentitemminwidth,
          this.documentitemminheight
        );
        documentcell.setStyle(style);      
      } finally {
        graph.getModel().endUpdate();
      }
  
      return documentcell;
    };
  
    /**
     * Create document item cell for the Shape picker and Palette
     * @returns
     */
    createDocumentItem(entry) {
      const graph = new mxGraph();
      const documentcell = this.createDocumentItemCell(graph, entry); //there are two options, HTML Document or Simple label + description.
      //this.insertListenerHTMLDocumentItemDoubleClick(entry);  //disable double click window editor
      return {
        xml: NAUtil.ModelToXML(graph),
        graph: graph,
        cell: documentcell,
      };
    };
    /**
     * Create NA Panel Window
     * Default shape picker
     * Narrative Abduction Side Panel 
     * - Narrative View
     * - Common Menus
     */
    createNAPanel() {
      let container = document.createElement("div");
      let commonmenu = document.createElement("div");
      let narrativeview = document.createElement("div");
  
      container.classList.add(NASettings.CSSClasses.Panels.SidePanel);
      commonmenu.classList.add(NASettings.CSSClasses.Panels.CommonMenuContainer);
      this.panelwindow = container;
      this.panelwindow.commonmenu = commonmenu;
      this.panelwindow.narrativeview = narrativeview;
  
      this.editorui.sidebar.container.append(container);
      container.append(narrativeview);
      container.append(commonmenu);
  
      this.createCommonMenus();
      //This part contains some functions for development purposes
      //this.createDevToolPanel(container);
    };
  
    createCommonMenus(){
        let title = document.createElement("h3");
        title.innerHTML = "Common Menus";
        this.panelwindow.commonmenu.append(title);
        this.createUpdateLinksMenu();
        this.createLoadJSONMenu();
    }

    createLoadJSONMenu(){
      let container = document.createElement("div");
      // Create a new input element
      const inputElement = document.createElement('input');
  
      // Set the type attribute to 'file' for a file input
      inputElement.setAttribute('type', 'file');
  
      // Optionally, set other attributes or properties, such as an ID or name
      inputElement.setAttribute('id', 'fileInput');
      inputElement.setAttribute('name', 'fileInput');
      let t = this;
  
      // Add event listener to handle selected file
      inputElement.addEventListener('change', function() {
        const selectedFile = fileInput.files[0];
        if (selectedFile) {
          // Read the selected JSON file
          const fileReader = new FileReader();
          fileReader.onload = function(event) {
            // Parse the JSON data into a JavaScript object
            try {
              const jsonData = JSON.parse(event.target.result);
              // Do something with the parsed JSON data
              t.createDocumentItemsFromJSON(jsonData);
            } catch (error) {
            }
          };
          fileReader.readAsText(selectedFile);
        }
      });
  
      // Append the input element to the desired location in the DOM
      container.appendChild(inputElement); // Example: append it to the body
      this.createCommonMenu("Load JSON", container);
    }  
  
    insertDocumentItemFromJSONObject(jsonObject){
        let graph = this.editorui.editor.graph;
        let parent = graph.getDefaultParent();
        let t = this;
        let cells = [];
  
        graph.getModel().beginUpdate();
        try{
          t.createDocumentItemFromJSONObject(jsonObject, cells);          
          graph.addCells(cells, parent);
        }catch(e){
        }finally{
          graph.getModel().endUpdate();
          this.updateLayoutOfNonNarrativeCells();
        }
    }

    updateLayoutOfNonNarrativeCells(){
      let graph = this.editorui.editor.graph;
      graph.selectAll();
      let allcells = graph.getSelectionCells();
      let cells = [];
      allcells.forEach(cell => {
          if(!this.isCellPartOfExistingNarrative(cell)) cells.push(cell);
      });
      NarrativeLayout.applyCellsLayout(graph, graph.getModel(), cells);
    }

    insertDocumentLinkFromJSONObject(jsonObject, nodes){
      let graph = this.editorui.editor.graph;
      let parent = graph.getDefaultParent();
      let t = this;
      let cells = [];

      graph.getModel().beginUpdate();
      try{
        t.createDocumentLinkFromJSONObject(jsonObject, nodes, graph);
        graph.addCells(cells, parent);
      }catch(e){
      }finally{
        graph.getModel().endUpdate();
        this.updateLayoutOfNonNarrativeCells();
      }
  }

    createDocumentItemFromJSONObject(node, cells){
      let documentitem = this.nodeToDocumentItem(node);
      let cell = documentitem.cell;
      cell.setAttribute("label", this.getContentFromNode(node));
      if(cell) cells.push(cell);
      node.cell = cell;
      this.updateResponsiveCellSize(cell);
    }

    createDocumentLinkFromJSONObject(link, nodes, graph){
      let sourceId = link.source;
      let targetId = link.target;
      let sourceCell, targetCell;
      //get cell
      nodes.forEach(node => {
        if(node.id == sourceId) sourceCell = node.cell;
        if(node.id == targetId) targetCell = node.cell;
      });
      if(sourceCell && targetCell){
        let label = link.type;
        let linkCell = graph.insertEdge(graph.getDefaultParent(), null, "", sourceCell, targetCell);
        this.setEdgeType(linkCell, label);
      }
    }

    createDocumentItemsFromJSON(parsedObject){
        //create nodes
        let graph = this.editorui.editor.graph;
        let parent = graph.getDefaultParent();
        let nodes = parsedObject.nodes;
        let links = parsedObject.links;
        let cells = [];
        this.generatingsession = true;
        

        graph.getModel().beginUpdate();
        try{
          nodes.forEach(node => {
            this.createDocumentItemFromJSONObject(node, cells);
          });

          graph.addCells(cells, parent);
          //create links
          links.forEach(link => {
            this.createDocumentLinkFromJSONObject(link, nodes, graph);
          });
        }catch(e){
          console.log("error",e);
        }finally{
          graph.getModel().endUpdate();       
          NarrativeLayout.applyCellsLayout(graph, graph.getModel(), cells);
          graph.setSelectionCells(cells);
          let n = this.newNarrative();
          n.narrativecell.geometry.x = 0;
          n.narrativecell.geometry.y = -100;
          n.narrative.updateCellsPositions();
          this.generatingsession = false;  

        }

    }
   
    createCommonMenu(label, menucontainer){
        let container = document.createElement("div");
        let labelcontainer = document.createElement("div");
        labelcontainer.innerHTML = label;
        labelcontainer.classList.add(NASettings.CSSClasses.NarrativeListView.MenuLabel);
        container.append(labelcontainer);
        container.append(menucontainer);
        this.panelwindow.commonmenu.append(container);
    }    
  
    createLoadNarrativeMenu(){
      let container = document.createElement("div");
      let t = this;
      NAUIHelper.AddButton("Load narratives", container, function () {
        t.loadExistingNarratives();
      });
  
      this.createCommonMenu("Load existing narrative", container);
    }
  
  
    createUpdateLinksMenu(){
      //This part is to add link type buttons 
      let setlinktypecontainer = document.createElement("div");
      //looping through naentries
      let t = this;
      this.naentries.forEach(function (element) {
        if (element.type == "edge") {
          NAUIHelper.AddButton(
            element.name.replace("Link", ""),
            setlinktypecontainer,
            function () {
              let selectedCells = t.editorui.editor.graph.getSelectionCells();
              if (selectedCells.length == 0) {
                alert("Select an edge");
                return;
              }
              selectedCells.forEach(function (selected) {
                if (selected.isEdge()) {
                  let graph = t.editorui.editor.graph;
                  graph.getModel().beginUpdate();
                  try {
                    graph
                      .getModel()
                      .setValue(selected, element.name.replace("Link", "") + "s");
                    graph.setCellStyle(element.style, [selected]);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              });
            }
          );
        }
      });
      this.createCommonMenu("Update selected edge into", setlinktypecontainer);
    }

  
    /**
     * Create palette for the side bar
     */
    createPalette() {
      let entries = []; //all palette entries
      for (let i = 0; i < this.naentries.length; i++) {
        let res;
        if (this.isValidShapePickerItem(this.naentries[i])) {
          let entry = this.naentries[i];
          entry.titlename = NAUtil.GetCellChildrenLabels(
            this.naentries[i].name
          ).title;
          entry.descname = NAUtil.GetCellChildrenLabels(
            this.naentries[i].name
          ).description;
  
          res = this.createDocumentItem(entry);
          this.naentries[i].xml = res.xml;
          this.naentries[i].graph = res.graph;
          entries.push(
            this.editorui.sidebar.addDataEntry(
              this.naentries[i].name,
              0,
              0,
              this.naentries[i].name,
              Graph.compress(this.naentries[i].xml)
            )
          );
        }
      }
      //else{
      //     res = this.createLinkItem(this.naentries[i].name, this.naentries[i].style);
      // }
      NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", entries);
    };
  
    /**
     * Create the container cell that will contain the narrative cells
     */
    createNarrativeListCell() {
      let entry = this.getEntryByName(NASettings.Dictionary.CELLS.NARRATIVELIST);
      let graph = this.editorui.editor.graph;
      let doc = mxUtils.createXmlDocument();
      let obj = doc.createElement(entry.name);
  
      graph.getModel().beginUpdate();
      try {
        let cell = graph.insertVertex(
          graph.getDefaultParent(),
          null,
          obj,
          0,
          0,
          100,
          100
        );
        cell.setStyle(entry.style);
        this.narrativelistcell = cell;
      } finally {
        graph.getModel().endUpdate();
      }
    };
  

  
    /**
     * Remove narrative from the list
     * @param {*} narrative
     */
    deleteNarrative(narrative) {
      this.narratives.splice(this.narratives.indexOf(narrative), 1);
    };
  
    /**
     * Return the narrative entry
     */
    getNarrativeEntry() {
      let res = null;
      this.naentries.forEach(function (elem) {
        if (elem.name == NASettings.Dictionary.CELLS.NARRATIVE) {
          res = elem;
        }
      });
      return res;
    };
  
    getNarrativeCells(cells) {
      let nacells = [];
      cells.forEach((cell) => {
        if (Narrative.isCellNarrative(cell)) nacells.push(cell);
      });
      //not found, they might be inside the narrative list cell
      if (nacells.length == 0) {
        cells.forEach((cell) => {
          if (this.isCellNarrativeList(cell)) {
            let children = cell.children;
            if (children) {
              children.forEach((child) => {
                if (Narrative.isCellNarrative(child)) nacells.push(child);
              });
            }
          }
        });
      }
  
      return nacells;
    };
  
    /**
     * Get value (label) of the narrative cell, check isCellNarrativeCell first
     * @param {*} cell 
     * @returns 
     */
    getNarrativeCellValue(cell){
      let val = "";
      let cellvalue =  this.editorui.editor.graph.model.getValue(cell);
      if (cellvalue != null) val = cellvalue.getAttribute('label');
      if(val == null) val = cellvalue.innerHTML;
  
      return val;
    }
  
    getDocumentItemCellValue(cell){
      return cell.getValue().getAttribute("label");
    }
  
    /**
     * Return the html content of the HTML Document Item
     * @param {*} title
     * @param {*} description
     * @returns
     */
    getHTMLDocumentItemContent(title, description) {
      return (
        '<div class="responsive-content"><b>' +
        title +
        "</b><br/><div>" +
        description +
        "</div></div>"
      );
    };
  
    getEntryByName(name) {
      let ent = null;
      this.naentries.forEach((element) => {
        if (element.name == name) {
          ent = element;
          return ent;
        }
      });
  
      return ent;
    };
  
    /**
     * Get the description cell child from a cell
     * @param {*} parentcell
     */
    getDescriptionCell(parentcell) {
      let res = null;
      if (parentcell.children) {
        parentcell.children.forEach((child) => {
          let natype = child.natype;
          if (natype == NASettings.Dictionary.ATTRIBUTES.DOCDESCRIPTION) {
            res = child;
          }
        });
      }
      return res;
    };
  
    /**
     * Get the title cell from a cell
     * @param {*} parentcell
     * @returns
     */
    getTitleCell(parentcell) {
      let res = null;
      if (parentcell.children) {
        parentcell.children.forEach((child) => {
          let natype = child.natype;
          if (natype == NASettings.Dictionary.ATTRIBUTES.DOCTITLE) {
            res = child;
          }
        });
      }
      return res;
    };
  
    getDescriptionCellContentHTML(descell) {
      return document.getElementById(descell.id+"-cell");
    };
  
      
    getContentFromNode(node){
      return  "<b>" + node.title + "</b><br/>" + node.description;
    }

    /**
     * Get the height of the html description cell content
     */
    getDescriptionCellContentHeight(descell) {
      let res = null;
      if (descell) {
        //get html
        let html = document.getElementById(descell.id + "-description");
        if (html) {
          res = html.offsetHeight;
        }
      }
      return res;
    };
  
      /**
     * Get a narrative that has the cell
     * @param {*} cell 
     * @returns 
     */
      getDocumentItemNarrative(cell){
        let na = null;
        this.narratives.forEach(narrative => {
            if(narrative.cells.includes(cell)){
              na = narrative;       
              return na; 
            }
        });
        return na;
      }
  
      /**
       * Get narrative from given root cell
       * @param {*} cell 
       * @returns 
       */
      getNarrativeFromRootCell(cell){
        return NAUtil.GetNarrativeFromCell(cell, this.narratives);
      }

      getValidatedAssignedCells(targets){
        let validTargets = [];
        let invalidTargets = [];
        targets.forEach(cell => {
           if(this.isAssignedCellValid(cell)){
            validTargets.push(cell);
           } else{
            invalidTargets.push(cell);
           }
        });
    
        return {validcells: validTargets, invalidcells: invalidTargets}
      }
  
  
        
    getDocumentItemTitle(cell){
      let value = this.getDocumentItemCellValue(cell);
      if(value){
        const regex = /<b>(.*?)<\/b>/g;
        let content = NarrativeAbductionApp.extractTitleContentFromText(value, regex);
        if(content){
          return content.title
        }else{
          return value;
        }
      }else{
        return cell.getAttribute("natype");
      }
    }

    /**
     * Get narrative group of the source cell from a cell, if no source cell or no narrative, it gives null
     * @param {*} cell 
     * @returns 
     */
    getSourceCellNarrative(cell){
      let graph = this.editorui.editor.graph;
      //get connected edges
      let edges = graph.getEdges(cell, graph.getDefaultParent());
      let narrative = null;
      //if has edge, get the first one
      if(edges){
        edges.forEach(edge => {
          let s = edge.source;
          let sourceNarrative = t.getDocumentItemNarrative(s);
          if(sourceNarrative != null) narrative = sourceNarrative;
        });
      }

      return narrative;
    }
  

    /**
     * Hide Mode Shapes button on the Side bar
     */
    hideMoreShapesButton() {
      let buttons = document.getElementsByClassName("geSidebarFooter");
      Array.from(buttons).forEach(function (elm) {
        if (elm.innerHTML.includes("More Shapes")) {
          elm.style.display = "none";
        }
      });
    };
  
    //#region listeners
  
    /**
     * Handler for when the vanila document item size is updated.
     * The requirement is that the height can't be manually adjusted. The height is adjusted based on the content of the description.
     */
    initListenerResponsiveSizeHandler() {
      let graph = this.editorui.editor.graph;
      let t = this;
      // Handle resizing of the cell
      graph.addListener(mxEvent.RESIZE_CELLS, function (sender, evt) {
        let cells = evt.getProperty("cells");
        for (let i = 0; i < cells.length; i++) {
          let cell = cells[i]; 
          if(NarrativeAbductionApp.isCellDocumentItem(cell)) t.updateResponsiveCellSize(cell);
        }
      });
    };


  
    /**
     * Trigger custom functions everytime a new cell is added
     * New Cell
     *  Condition: is generating multile narrative cells in progress
     *  Yes: ignore
     *  No: 
     *    Condition: is cell Evidence?
     *      Yes:
     *        Condition: does evidence group exist?
     *          Yes: assign
     *          No: create one, assign
     *      No:
     *        Condition: is cell connected to narrative cell?
     *            Yes: Assign the cell to the narrative 
     *            No: Create new narrative group
     *                Condition: is narrative in the lane?
     *                  Yes: assign narrative to the lane 
     */
    initListenerNewCellHandler() {
      let graph = this.editorui.editor.graph;
  
      let t = this;
      graph.addListener(mxEvent.CELLS_ADDED, function (sender, evt) {
        let cells = evt.getProperty("cells");
        let newCell = cells[0];

        //if generating in progress, return;
        if(t.generatingsession) return;

        //if cell is in the lane, create new group
        //#region 
        if(NarrativeAbductionApp.isCellDocumentItem(newCell) && 
        t.narrativelanescontroller.isCellInAnyLane(newCell)){
            //if cell is evidence cell, create new narrative in evidence lane
            if(NarrativeAbductionApp.isCellDocumentItemType(newCell, NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE)){
              //evidence group exist, assign the evidence item to this group
              if(t.narrativelanescontroller.evidencenarrative != null){
                t.assignNodes(t.narrativeaviewscontainer.getListViewByNarrative(t.narrativelanescontroller.evidencenarrative), [newCell]);                 
              }else{ //otherwise, create a new narrative group
                let res = t.newNarrative("Evidence");
                t.narrativelanescontroller.evidencenarrative = res.narrative;
                t.assignNodes(res.narrativeview, [newCell]);   
                t.narrativelanescontroller.evidencelane.assignNarrative(res.narrative);   
              }
              NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, {
                cell: newCell, 
                narrative: t.narrativelanescontroller.evidencenarrative
              });  
              NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {
              });
              NarrativeLayout.applyLayout(t.narrativelanescontroller.evidencenarrative, graph, null, null, ()=>{
                t.narrativelanescontroller.updateLanesGrowth();
                t.narrativelanescontroller.updateLanesPosition();                
              });
            }
        }
        //#endregion
        
        //if the cell is not evidence, either create a new group (if not connected to any narrative) or assign to existing group if connected 
        //the issue is that the node is created first before the link, there is no way to know the source. Thus, we use the edge here
        //#region
        if(newCell.isEdge()){
          let edge = newCell;
          let targetType = edge.target.value.getAttribute(
            NASettings.Dictionary.ATTRIBUTES.NATYPE
          );
          switch (targetType) {
            case NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE:
              t.setEdgeType(edge, NASettings.Dictionary.CELLS.EXPLAINLINK);
              break;
            default:
              t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);
              break;
          }
          let source = edge.source;
          let target = edge.target;
          let sourcenarrative = t.getDocumentItemNarrative(source);
          if(sourcenarrative){
            let nalistview = t.narrativeaviewscontainer.getListViewByNarrative(sourcenarrative);  
            if(nalistview){
              t.assignNodes(nalistview, [target]);
              (async()=>{
                await new Promise((resolve) => setTimeout(resolve, 500))
                .then(()=>{
                  NarrativeLayout.applyLayout(sourcenarrative, graph, null, null, ()=>{
                    t.narrativelanescontroller.updateLanesGrowth();
                    t.narrativelanescontroller.updateLanesPosition();    
                  });  
                });
              })(); 
            }
          }
        } 

        //if the cell is rogue cell, create a new group, however, this needs to wait as the link is created after the cell
        (async()=>{
          await new Promise((resolve) => setTimeout(resolve, 500))
          .then(()=>{
            let edges = graph.getModel().getEdges(newCell);
            if(NarrativeAbductionApp.isCellDocumentItem(newCell) &&  
            edges.length == 0 && 
            t.narrativelanescontroller.isCellInAnyLane(newCell) &&
            !NarrativeAbductionApp.isCellDocumentItemType(newCell, NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE)
            ){
               //get closest lane
               let closestlane = t.narrativelanescontroller.getClosestLane(newCell);
                let res = t.newNarrative("Narrative");
                t.assignNodes(res.narrativeview, [newCell]);
                closestlane.assignNarrative(res.narrative);
                NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, {
                    cell: newCell, 
                    narrative: res.narrative
                });
                NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {
                });  
                t.narrativelanescontroller.updateLanesGrowth();
                t.narrativelanescontroller.updateLanesPosition();    
              }    
          });                   
        })(); 

                
      if(newCell && newCell.isVertex()){
          t.updateResponsiveCellSize(newCell);
      }
      });
    };
  
  
  
    //#endregion

  
    /**
     * Prevent editing with double click
     */
    initListenerEdgeDoubleClickEditHandler() {
      let graph = this.editorui.editor.graph;
      let t = this;
      graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
        //if edge, show Contextual Edge Option Menu
        let cell = evt.getProperty("cell");
        if (cell != null && cell.isEdge()) {
          let event = evt.getProperty("event");
          t.showContextualEdgeOptionMenu(cell, event.x, event.y);
        }
      });
    };
  
    /**
     * Show link type option when two nodes are connected. In the vanila version, the default link will be "Cause".
     */
    initListenerConnectionHandler() {
      let graph = this.editorui.editor.graph;
      let t = this;
  
      graph.connectionHandler.addListener(
        mxEvent.CONNECT,
        function (sender, evt) {
          let edge = evt.getProperty("cell");
          let source = graph.getModel().getTerminal(edge, true);
          let target = graph.getModel().getTerminal(edge, false);
          let event = evt.getProperty("event");
  
          //t.showContextualEdgeOptionMenu(edge, event.x, event.y); //no contextual menu by default
          //by default the link will be causes link
          t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);
        }
      );
    };
  
    /**
     * Remove cell handler
     */
    initListenerRemoveNarrativeCellHandler() {
      let graph = this.editorui.editor.graph;
      let t = this;
  
      graph.addListener(mxEvent.CELLS_REMOVED, function (sender, evt) {
        let cells = evt.getProperty("cells");
        cells.forEach((cell) => {
          //if the cell is narrative, remove the view as well
          if (Narrative.isCellNarrative(cell)) {
            let narrative = t.getNarrativeFromRootCell(cell);
            t.narrativeaviewscontainer.removeListView(cell);
            NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.DELETENARRATIVE, {
              narrative: narrative
            })
            t.narrativelanescontroller.evidencenarrative = null;
            t.deleteNarrative(narrative);
          }
        });
      });
    };
  

    /**
     * Show contextual menu to select next item after finish editing
     */
    initListenerShowAddCellAfterEdit(){
      let graph = this.editorui.editor.graph;
      let t = this;
      graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt)
      {
        let cell = evt.getProperty("cell");
        if(cell && NarrativeAbductionApp.isCellDocumentItem(cell)){
          var view = graph.view;
          var state = view.getState(cell);
          
          if (state) {
            var cellElement = state.shape.node; // This is the DOM element of the cell
            
            // Now, you can access and manipulate the DOM element of the cell as needed
            let rect = cellElement.getBoundingClientRect();
  
            //update the size
            t.updateResponsiveCellSize(cell);
            t.showContextualAddNewCellItem(cell, rect.x + rect.width, rect.y);
          }
       
        }
      })
    }
  
      /**
     * This is the listener to the new HTML document item, lots of duplicates with insertListenerDocumentItemDoubleClick
     * TODO: remove duplicates
     * @param {*} entry
     */
      insertListenerHTMLDocumentItemDoubleClick(entry) {
        let currgraph = this.editorui.editor.graph;
        let t = this;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeDoubleClickListener(
          currgraph,
          entry.name,
          function (cell, evt) {
            if (!cell || !cell.children) return;
    
            let contentcell = cell.children[0].value;
    
            // get x and y position of triggered event
            let x = evt.getProperty("event").x;
            let y = evt.getProperty("event").y;
    
            // create form
            let formContainer = document.createElement("div");
            formContainer.style.width = "150px";
            formContainer.style.padding = "20px";
    
            const form = document.createElement("form");
            form.id = "narrativeitemform";
    
            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name:";
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.id = "name";
            nameInput.name = "name";
            nameInput.required = true;
            nameInput.value = cell.getAttribute(
              NASettings.Dictionary.ATTRIBUTES.DOCTITLE
            );
    
            const br = document.createElement("br");
    
            const descriptionLabel = document.createElement("label");
            descriptionLabel.textContent = "Description:";
            const descriptionTextarea = document.createElement("textarea");
            descriptionTextarea.id = "description";
            descriptionTextarea.name = "description";
            descriptionTextarea.rows = 4;
            descriptionTextarea.cols = 30;
            descriptionTextarea.value = cell.getAttribute(
              NASettings.Dictionary.ATTRIBUTES.DOCDESCRIPTION
            );
    
            const applyButton = document.createElement("button");
            applyButton.id = "applyButton";
            applyButton.type = "button";
            applyButton.textContent = "Apply";
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
            let highlight = new mxCellHighlight(currgraph, "#000", 2);
            formContainer.onmouseenter = function () {
              highlight.highlight(currgraph.view.getState(cell));
            };
            formContainer.onmouseleave = function () {
              highlight.hide();
            };
    
            let wnd = NAUIHelper.CreateWindow(
              NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
              NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
              formContainer,
              x,
              y,
              250,
              200
            );
    
            wnd.setLocation(x, y);
            wnd.setClosable(true);
            wnd.setMinimizable(false);
            wnd.setVisible(true);
    
            form.onsubmit = function (event) {
              event.preventDefault();
              return false;
            };
    
            function applyForm(currgraph, c, t, n, d) {
              return function () {
                const nameInput = document.getElementById("name");
                const descriptionTextarea = document.getElementById("description");
    
                currgraph.getModel().beginUpdate();
                try {
                  let html = t.getHTMLDocumentItemContent(
                    nameInput.value,
                    descriptionTextarea.value
                  );
                  let contentcell = c.children[0];
    
                  currgraph.model.setValue(contentcell, html);
                  cell.setAttribute(
                    NASettings.Dictionary.ATTRIBUTES.DOCTITLE,
                    nameInput.value
                  );
                  cell.setAttribute(
                    NASettings.Dictionary.ATTRIBUTES.DOCDESCRIPTION,
                    descriptionTextarea.value
                  );
                } finally {
                  currgraph.getModel().endUpdate();
                }
                wnd.destroy();
                highlight.hide();
              };
            }
          }
        );
      };
    
    

      /**
     * This is listener for the old document item with dedicated nodes for the title and description. Lots of duplicated codes with insertListenerHTMLDocumentItemDoubleClick.
     * TODO: remove duplicates
     * @param {*} entry
     */
      insertListenerDocumentItemDoubleClick(entry) {
        let currgraph = this.editorui.editor.graph;
        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeDoubleClickListener(
          currgraph,
          entry.name,
          function (cell, evt) {
            if (!cell || !cell.children) return;
    
            let cellName = cell.children[0].value;
            let cellDesc = cell.children[1].value;
    
            let x = evt.getProperty("event").x;
            let y = evt.getProperty("event").y;
    
            let formContainer = document.createElement("div");
            formContainer.style.width = "150px";
            formContainer.style.padding = "20px";
    
            const form = document.createElement("form");
            form.id = "narrativeitemform";
    
            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name:";
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.id = "name";
            nameInput.name = "name";
            nameInput.required = true;
            nameInput.value = cellName;
    
            const br = document.createElement("br");
    
            const descriptionLabel = document.createElement("label");
            descriptionLabel.textContent = "Description:";
            const descriptionTextarea = document.createElement("textarea");
            descriptionTextarea.id = "description";
            descriptionTextarea.name = "description";
            descriptionTextarea.rows = 4;
            descriptionTextarea.cols = 30;
            descriptionTextarea.value = cellDesc;
    
            const applyButton = document.createElement("button");
            applyButton.id = "applyButton";
            applyButton.type = "button";
            applyButton.textContent = "Apply";
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
            let highlight = new mxCellHighlight(currgraph, "#000", 2);
            formContainer.onmouseenter = function () {
              highlight.highlight(currgraph.view.getState(cell));
            };
            formContainer.onmouseleave = function () {
              highlight.hide();
            };
    
            let wnd = NAUIHelper.CreateWindow(
              NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
              NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
              formContainer,
              x,
              y,
              250,
              200
            );
    
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
            form.onsubmit = function (event) {
              event.preventDefault();
              return false;
            };
    
            function applyForm(currgraph, c, n, d) {
              return function () {
                const nameInput = document.getElementById("name");
                const descriptionTextarea = document.getElementById("description");
    
                currgraph.getModel().beginUpdate();
                try {
                  currgraph.model.setValue(c.children[0], nameInput.value);
                  currgraph.model.setValue(
                    c.children[1],
                    descriptionTextarea.value
                  );
                } finally {
                  currgraph.getModel().endUpdate();
                }
                wnd.destroy();
                highlight.hide();
              };
            }
          }
        );
      };
    

    /**
     * Shape-picker override to show NA cells
     */
    initOverrideShapePickerHandler() {
      //override
      let t = this;
      this.editorui.getCellsForShapePicker = function (
        cell,
        hovering,
        showEdges
      ) {
        //somehow the style fails, we need to override it. This might not be the case anymore, need to revisit this again later
        let newcells = [];
        t.naentries.forEach(function (currentValue, index, arr) {
          //only add node items
          if (t.isValidShapePickerItem(currentValue)) {
            let cell = NAUtil.GetCellByNodeName(
              currentValue.graph,
              currentValue.name
            );
            let g = currentValue.graph;
            g.getModel().setStyle(cell, currentValue.style);
            newcells.push(cell);
          }
        });
        return newcells;
      };
    };
  
  
    /**
     * Override the connection points, only use four pounts
     */
    initOverrideConnectionConstraints(){
      this.editorui.editor.graph.getAllConnectionConstraints = function(terminal)
          {
            if (terminal != null && this.model.isVertex(terminal.cell))
            {
              return [
                      new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                      new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                      new mxConnectionConstraint(new mxPoint(0.5, 1), true),
                      new mxConnectionConstraint(new mxPoint(0, 0.5), true)];
            }
            return null;
          };    
    }
  
  
  
  



    static extractTitleContentFromText(text, regex) {
  
    // Use the `exec` method to find the first match
    const match = regex.exec(text);
  
    if (match) {
      // Extract the text between asterisks
      const title = match[1];
      
      // Remove the first match from the input text
      const content = text.replace(match[0], '');
  
      // Create and return an object with the extracted title and content
      return { title, content};
    } else {
      // If no match is found, return null or an appropriate value
      return null;
    }
  }
    /**
     * Is the cell a document item
     * @param {*} cell 
     * @returns 
     */
    static isCellDocumentItem(cell){
      return (cell.getAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE));
    }

    static isCellDocumentItemType(cell, type){
      return(cell.getAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE) == type)
    }
  
    isCellNarrativeCell(cell){
      if(cell.value && cell.value.nodeName == NASettings.Dictionary.CELLS.NARRATIVE){
          return true;
      }else{
          return false;
      }
    }
  
  
    /** Check wheter or not a cell is part of any narrative */
    isCellPartOfExistingNarrative(cell){
      let ret = false;
      this.narratives.forEach(narrative => {
        if(narrative.cells.includes(cell)){
          ret = true;
        }
      });
      return ret;
    }
  
    /** Is cell to be assigned valid */
    isAssignedCellValid(cell){
      return !this.isCellPartOfExistingNarrative(cell);
    }
  
        
  
    isCellNarrativeList(cell) {
      return (
        cell.value &&
        cell.value.tagName &&
        cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVELIST
      );
    };
  
    /**
     * check whether or not the entry should be included in the shape picker
     * @param {*} entry
     * @returns
     */
    isValidShapePickerItem(entry) {
      return entry.type == "node" && !this.excludefrompicker.includes(entry.name);
    };
  


  
    /**
     * Check for existing narrative cells and update the view accordingly
     */
    loadExistingNarratives() {
      let t = this;
      let graph = t.editorui.editor.graph;
  
      t.editorui.editor.graph.selectAll();
      let cells = graph.getSelectionCells();
  
      let nacells = this.getNarrativeCells(cells);
  
      nacells.forEach((cell) => {
        //if the cell is already bound with a view, ignore
        let narrative = this.getNarrativeFromRootCell(cell);
        if (Narrative.isCellNarrative(cell) && narrative == null) {
          let val = t.getNarrativeCellValue(cell);
          if(val == "") val = NASettings.Language.English.newnarrative;
          let na = new Narrative(
            cell,
            graph,
            val,
            cell.id
          );
          this.narratives.push(na);
          let nalistview = this.narrativeaviewscontainer.addNarrativeListView(
            na,
            cell,
            this
          ); //add accordion view
  
          //then, we need to re-assign cells to this narrative. These cells ids are store in the cells proprty
          let cellstring = cell.getAttribute(
            NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLS
          );
          let cellsidsarray = Narrative.stringCellsToArray(cellstring);
          let cellsarray = [];
          cellsidsarray.forEach((id) => {
            let cell = graph.getModel().getCell(id);
            if (cell) cellsarray.push(cell);
          });
          t.assignNodes(nalistview, cellsarray);
        }
      });
      t.editorui.editor.graph.removeSelectionCells(cells);
    };
  
    nodeToDocumentItem(node){
        let entry = this.getEntryByName(node.type);
        return this.createDocumentItem(entry);
    }

    /**
     * Create a new narrative, trigger create narrative view and narrative cell
     */
    newNarrative(name) {

      let groupname = (name)? name : NASettings.Language.English.newnarrative;
      let narrativeentry = this.getNarrativeEntry(); //get narrative entry from the entries list
      let graph = this.editorui.editor.graph;
      let parent = graph.getDefaultParent();
      let doc = mxUtils.createXmlDocument();
      let objna = doc.createElement(narrativeentry.name);
  
      let narrativecell;
      let narrview;
      let na;
      graph.getModel().beginUpdate();
      //add the narrative cell
      try {
        narrativecell = graph.insertVertex(parent, null, objna, 0, 0, 50, 40);
        narrativecell.value.setAttribute('label', groupname);
        graph.setCellStyle(narrativeentry.style, [narrativecell]);
      } finally {
        graph.getModel().endUpdate();
        //create narrative object and view
        na = new Narrative(
          narrativecell,
          graph,
          groupname,
          narrativecell.id
        );
        this.narratives.push(na);
        narrview = this.narrativeaviewscontainer.addNarrativeListView(
          na,
          narrativecell,
          this
        ); //add accordion view
  
        NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.NEWNARRATIVE,  {
          narrative: na,
          narrativecell: narrativecell,
          narrativeview: narrview
        });
        
  
        //if objects are selected, add them automatically to the narrative
        let selectedCells = graph.getSelectionCells();
        if (selectedCells[0] && narrview) {
          this.assignNodes(narrview, selectedCells);
          //move narrative root to the first item
          na.rootcell.geometry.y = selectedCells[0].geometry.y;
          na.rootcell.geometry.x = selectedCells[0].geometry.x - 270;
        }
      }
  
  
      //update layout
      //this.narrativelanescontroller.updateLayout();
  
      return {
        narrative: na,
        narrativeview: narrview,
        narrativecell: narrativecell,
      };
    };

      
    parseDocumentContent(content){
      return  NarrativeAbductionApp.getTextBetweenAsterisks(content);
  }
  
    /**
     * Take the edge and turn it into Cause link
     * @param {*} edge
     */
    setEdgeType(edge, target) {
      let graph = this.editorui.editor.graph;
      let causeLink = this.getEntryByName(target);
      if (causeLink) {
        graph.getModel().beginUpdate();
        try {
          graph.getModel().setValue(edge, target.replace("Link", "") + "s");
          graph.setCellStyle(causeLink.style, [edge]);
        } finally {
          graph.getModel().endUpdate();
        }
      }
    };
  
    /**
     * Show edge type options at position x and y
     * @param {*} edge
     * @param {*} x
     * @param {*} y
     */
    showContextualEdgeOptionMenu(edge, x, y) {
      let container = document.createElement("div");
      let window = new mxWindow("EdgeType", container, x, y, 200, 200);
  
      let t = this;
      this.naentries.forEach(function (element) {
        if (element.type == "edge") {
          NAUIHelper.AddButton(
            element.name.replace("Link", ""),
            container,
            function () {
              let graph = t.editorui.editor.graph;
              graph.getModel().beginUpdate();
              try {
                graph
                  .getModel()
                  .setValue(edge, element.name.replace("Link", "") + "s");
                graph.setCellStyle(element.style, [edge]);
              } finally {
                graph.getModel().endUpdate();
              }
              window.destroy();
            }
          );
        }
      });
  
      window.setMinimizable(false);
      window.setClosable(true);
      window.setVisible(true);
    };
  
    showContextualAddNewCellItem(sourcecell, x, y){
      let container = document.createElement("form");
      let wnd = new mxWindow("AddItem", container, x, y, 200, 200);
  
      let t = this;
      let buttons = [];
      this.naentries.forEach(function (element) {
        if (t.isValidShapePickerItem(element)) {
          let btn = NAUIHelper.AddButton(
            element.name.replace("Link", ""),
            container,
            function () {
              let graph = t.editorui.editor.graph;
              let parent = graph.getDefaultParent();
              graph.getModel().beginUpdate();
              try {
                let cellitem = t.createDocumentItem(element).cell;
                cellitem.geometry.x = sourcecell.geometry.x + sourcecell.geometry.width + 50;
                cellitem.geometry.y = sourcecell.geometry.y;
                if(cellitem){
                    graph.addCell(cellitem, parent);
                    let edget = graph.insertEdge(parent, null, "", sourcecell, cellitem);
                    
                }
              } finally {
                graph.getModel().endUpdate();
              }
              wnd.destroy();
            }
          );
          buttons.push(btn);
        }
      });
  
      wnd.setMinimizable(false);
      wnd.setClosable(true);
      wnd.setVisible(true);
      wnd.activate();
  
      window.setTimeout(function () { 
        container.click();
        buttons[0].focus();
      }, 0); 
     
  
    }
  
    /**
     * This function decides how the content of the HTML Document Item is rendered to HTML element. This function is related to the HTML Document Item format.
     * @param {*} contencell
     */
    updateHTMLDocumentItemAppearance(doccell, contencell) {
      let title = doccell.getAttribute(
        NASettings.Dictionary.ATTRIBUTES.DOCTITLE
      );
      let des = doccell.getAttribute(
        NASettings.Dictionary.ATTRIBUTES.DOCDESCRIPTION
      );
      let html = this.getHTMLDocumentItemContent(title, des);
      contencell.setValue(html);
    };
  
    updateResponsiveCellSize(cell){
      const t = this;
      let graph = this.editorui.editor.graph;

      graph.autoSizeCell(cell);
      let newWidth = Math.max(cell.geometry.width, t.documentitemminwidth);
      cell.geometry.width = newWidth;
    }

    /**
     * Update position of more shape button
     */
    updateMoreShapesButton() {
      let buttons = document.getElementsByClassName("geSidebarFooter");
      let t = this;
      Array.from(buttons).forEach(function (elm) {
        if (elm.innerHTML.includes("More Shapes")) {
          elm.style.position = "relative";
          t.panelwindow.append(elm);
        }
      });
    };
  }
  
  