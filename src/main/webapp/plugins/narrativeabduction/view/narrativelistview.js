
/**
 * Accordion View of a narrative
 */
class NarrativeListView {
    constructor(narrative, container, editorui, color, app) {
      this.narrative = narrative;
      this.app = app;
      this.cellviews = [];
      this.headContainer;
      this.bodyContainer;
      this.container = container;
      this.editorui = editorui;
      this.color = color;
      this.uinarrativetitle;


      this.initListenerUpdateNarrativeCellEdit();
      this.initListenerUpdateDocumentItemTitle();
      this.initListenerRemoveCell();
      //this.initListenerClickRemoveHighlight();
    }
  
    /**
     * Remove the list view
     */
    remove() {
      this.container.remove();
    };
  
    /**
     *
     * @returns Get the style to hightlight
     */
    getHighlightStyle() {
      return "strokeColor=" + this.color + ";strokeWidth=6";
    };
  
    /**
     * Highlight children cells
     * @param {*} cellsToHighlight
     */
    highlightCells(cellsToHighlight) {
      let highlightStyle = this.getHighlightStyle();
  
      let graph = this.editorui.editor.graph;
      graph.getModel().beginUpdate();
      try {
        for (let cell of cellsToHighlight) {
          graph.setCellStyle(cell.getStyle() + highlightStyle, [cell]);
        }
      } finally {
        graph.getModel().endUpdate();
      }
      graph.refresh();
    };

    selectCells = function(){
        let graph = this.editorui.editor.graph;
        graph.getModel().beginUpdate();
        try {
            graph.setSelectionCells(this.narrative.cells);          
        } finally {
          graph.getModel().endUpdate();
        }
        graph.refresh();
    }
  
    isAllCellsSelected = function(){
        let graph = this.editorui.editor.graph;
        let selectedCells = graph.getSelectionCells();
        let docitems = [];
        selectedCells.forEach(cell => {
            if(NarrativeAbductionApp.isCellDocumentItem(cell)){
                docitems.push(cell);
            }
        });
        if(NAUtil.ArraysContainSameItems(docitems, this.narrative.cells)){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Unhighilight the children cells
     * @param {*} cellsToUnhighlight
     */
    unhighlightCells(cellsToUnhighlight) {
      let graph = this.editorui.editor.graph;
      let highlightStyle = this.getHighlightStyle();
  
      graph.getModel().beginUpdate();
      try {
        for (let cell of cellsToUnhighlight) {
          let style = cell.getStyle().replace(highlightStyle, "");
          graph.setCellStyle(style, [cell]);
        }
      } finally {
         graph.getModel().endUpdate();
      }
      graph.refresh();
    };
  
    /**
     * Hide provided cells
     * @param {*} cellsToHide 
     */
    toggleCellsVisibility = function(cellsToHide, status){
      let graph = this.editorui.editor.graph;  
      graph.getModel().beginUpdate();
      try {
         graph.cellsToggled(cellsToHide, status);
      } finally {
         graph.getModel().endUpdate();
      }
      graph.refresh();
    }

    /**
     * Create head, body, and name label
     * <head
     *      <top part
     *          <title
     *          <toggle
     *      <bottom part
     *          <uis
     * <body
     *      <cell view
     *      <cell view
     */
    createContainers() {
      this.headContainer = document.createElement("div");
      this.bodyContainer = document.createElement("div");
      this.uinarrativetitle = document.createElement("div");
      let toppart = document.createElement("div");
      let botpart = document.createElement("div");
  
      this.container.classList.add(
        NASettings.CSSClasses.NarrativeListView.Container
      );
      this.headContainer.classList.add(
        NASettings.CSSClasses.NarrativeListView.HeadContainer
      );
      toppart.classList.add(NASettings.CSSClasses.NarrativeListView.HeadTopPart);
      botpart.classList.add(
        NASettings.CSSClasses.NarrativeListView.HeadBottomPart
      );
      this.bodyContainer.classList.add(
        NASettings.CSSClasses.NarrativeListView.BodyContainer
      );
      this.headContainer.style.background = this.color;
      this.uinarrativetitle.innerHTML = this.narrative.name;
      this.uinarrativetitle.title = "Click to select items"; //ToDO move to dictionary
      this.uinarrativetitle.classList.add(
        NASettings.CSSClasses.NarrativeListView.Title
      );
  
      let t = this;
      //#region narrative title event listeners
      let graph = this.editorui.editor.graph;
      let highlight = new mxCellHighlight(graph, "#000", 2);
      this.uinarrativetitle.onmouseenter = function () {
        //t.highlightCells(t.narrative.cells);
        highlight.highlight(graph.view.getState(t.narrative.rootCell));
      };
      this.uinarrativetitle.onmouseleave = function () {
        //t.unhighlightCells(t.narrative.cells);
        highlight.hide();
      };
      this.uinarrativetitle.onclick = function(){
        t.selectCells();
      }
      //#endregion
  
      let toggleButton = document.createElement("button");
      toggleButton.classList.add(
        NASettings.CSSClasses.NarrativeListView.ToggleButton
      );
      toggleButton.innerHTML = "▼";
  
      toggleButton.onclick = function () {
        if (t.bodyContainer.style.display != "none") {
          t.bodyContainer.style.display = "none";
          this.innerHTML = "▲";
        } else {
          t.bodyContainer.style.display = "block";
          this.innerHTML = "▼";
        }
      };
  
      this.container.append(this.headContainer);
      this.container.append(this.bodyContainer);
  
      toppart.appendChild(this.uinarrativetitle);
      toppart.appendChild(toggleButton);
      this.headContainer.appendChild(toppart);
      this.headContainer.appendChild(botpart);
      this.headContainer.toppart = toppart;
      this.headContainer.bottompart = botpart;
    };
  
    initListenerRemoveCell(){
      let t = this;
      let graph = this.editorui.editor.graph;
      graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt){
        let cells = evt.getProperty("cells");
        cells.forEach(cell => {
          if (t.getCellView(cell)) {
            t.removeCellView(cell);
          }
        });
      })
    }

    /**
     * Update the narrative list livew
     */
    initListenerUpdateNarrativeCellEdit() {
      let graph = this.editorui.editor.graph;
      let t = this;
      graph.addListener(mxEvent.LABEL_CHANGED, function (sender, evt) {
        let cell = evt.getProperty("cell"); // Get the cell whose label changed
        let newValue = evt.getProperty("value"); // Get the new label value  
        if (Narrative.isCellNarrative(cell) && t.narrative.rootCell == cell) {
          t.uinarrativetitle.innerHTML = newValue;
        }
      });
    };

    initListenerClickRemoveHighlight = function(){
        let graph = this.editorui.editor.graph;
        let t = this;
        graph.addListener(mxEvent.CLICK, function (sender, evt) {
            if(!t.isAllCellsSelected()){
                t.unhighlightCells(t.narrative.cells);
                graph.refresh();
            }
        });
    }
  
    /**
     * Update the narrative list livew
     */
    initListenerUpdateDocumentItemTitle() {
      let graph = this.editorui.editor.graph;
      let t = this;
      graph.addListener(mxEvent.LABEL_CHANGED, function (sender, evt) {
        let cell = evt.getProperty("cell"); // Get the cell whose label changed
        
        if (NarrativeAbductionApp.isCellDocumentItem(cell)) {
          let newValue = t.app.getDocumentItemTitle(cell);
          //check if the parent is in narrative
          console.log("new value", newValue);
          if (t.narrative.cells.includes(cell)) {
            let cellview = t.getCellView(cell);
            if (cellview) cellview.htmltitle.innerHTML = newValue;
          }
        }
      });
    };
  
    /**
     * Create assign nodes button
     */
    createAssignNodesButton() {
      let buttonAssignNode = document.createElement("button");
      buttonAssignNode.innerHTML = "←";
      buttonAssignNode.title = NASettings.Language.English["assign"];
      buttonAssignNode.onclick = this.assignNode.bind(null, this);
      this.headContainer.bottompart.append(buttonAssignNode);
    };

    createLayoutButton = function(){
        let buttonLayout = document.createElement("button");
        buttonLayout.innerHTML = "⟲";
        buttonLayout.title = "Reset layout"; //todo
        buttonLayout.onclick = this.applyLayout.bind(null, this);
        this.headContainer.bottompart.append(buttonLayout);       
    }

    createToggleHighlightButton = function(){
        let buttonToggle = document.createElement("button");
        buttonToggle.innerHTML = "H";
        buttonToggle.title = "Toggle highlight"; //todo
        buttonToggle.onclick = this.toggleHighlight.bind(null, this);
        this.headContainer.bottompart.append(buttonToggle);       
    }

    createToggleVisibilityButton = function(){
      let buttonToggle = document.createElement("button");
      buttonToggle.title = "Toggle visibility"; //todo
      buttonToggle.onclick = this.toggleVisibility.bind(null, this);
      buttonToggle.innerHTML = "👁";
      //let img = document.createElement('img');
			//img.setAttribute('src', Editor.visibleImage);
      //buttonToggle.append(img);
      this.headContainer.bottompart.buttonvisibility = buttonToggle;
     // this.headContainer.bottompart.buttonvisibility.img = img;
      this.headContainer.bottompart.append(buttonToggle);  
    }


    createUpDownButtons = function(){
      let upButton = document.createElement("button");
      upButton.title = "Move up";
      upButton.innerHTML = "↑";
      upButton.onclick = this.moveUp.bind(null, this);
      this.headContainer.bottompart.append(upButton);

      let downButton = document.createElement("button");
      downButton.title = "Move down";
      downButton.innerHTML = "↓";
      downButton.onclick = this.moveDown.bind(null, this);
      this.headContainer.bottompart.append(downButton);
    }

    moveUp = function(t){
        t.app.narrativeaviewscontainer.moveUp(t.narrative);
    }

    moveDown = function(t){
      t.app.narrativeaviewscontainer.moveDown(t.narrative);
    }

    /**
     * Toggle the visibility of the narrative in the view. This also changes the visibility of the cells. 
     */
    toggleVisibility = function(t){
      if(t.narrative){
        if(t.narrative.isvisible){
          t.toggleCellsVisibility(t.narrative.cells, false);
          t.narrative.hideBound();
          t.narrative.isvisible = false;
          //t.headContainer.bottompart.buttonvisibility.img.setAttribute('src', Editor.hiddenImage);
          t.headContainer.bottompart.buttonvisibility.innerHTML = "⎯";

        }else{
          t.toggleCellsVisibility(t.narrative.cells, true);
          t.narrative.showBound();
          //t.headContainer.bottompart.buttonvisibility.img.setAttribute('src', Editor.visibleImage);
          t.headContainer.bottompart.buttonvisibility.innerHTML = "👁";
          t.narrative.isvisible = true;
          t.narrative.updateCellsBound();
          t.app.narrativelayout.applyLayout(t.narrative);
        }        
      }
    }

    toggleHighlight = function(t){
        if(t.narrative){
            if(t.narrative.ishighlight){
                t.unhighlightCells(t.narrative.cells);
                t.narrative.ishighlight = false;
            }else{
                t.highlightCells(t.narrative.cells);
                t.narrative.ishighlight = true;
            }
        }
    }

    applyLayout = function(t){
        if(t.narrative){
            t.app.narrativelayout.applyLayout(t.narrative);
        }
    }
  
    /**
     * Assign selected node to the narrative.
     * The narrative cell should contain the all information necessary to recreate the view, thus, the children cells' ids should be stored in the narrative cell.
     */
    assignNode(t) {
      let graph = t.editorui.editor.graph;
      let selectedCells = graph.getSelectionCells();
      if (selectedCells) {
        let validated = t.app.getValidatedAssignedCells(selectedCells);
        let validcells = validated.validcells;        
        t.assignNodes(validcells);
        if(validated.invalidcells.length > 0){
          mxUtils.alert("Some of the cells are ignored because they are part of existing narratives");
        }
      }
    };
    assignNodes(cells) {
      this.narrative.addCells(cells); //add cell to the narrative object, this is where the children cells are added to the root cell
      this.createBodyElements(); //create representaton
      if(this.narrative.ishighlight) {
            this.unhighlightCells(this.narrative.cells);
            this.highlightCells(this.narrative.cells);
        }
    };
  
    getTitleCell(cell) {
      let children = cell.children;
      let ret = null;
      if (children) {
        children.forEach((child) => {
          if (child.natype == NASettings.Dictionary.ATTRIBUTES.DOCTITLE) {
            ret = child;
          }
        });
      }
      return ret;
    };
  
    /**
     * Create representation of the cell/node in the view
     * @param {*} cell
     */
    createCellView(cell) {
      if (cell.isVertex()) {
        //container of the view
        let container = document.createElement("div"); //main container
        let textcontainer = document.createElement("div");
        textcontainer.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewTitle
        );
  
        let uicontainer = document.createElement("div");
        uicontainer.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewUIContainer
        );
        container.append(textcontainer);
        container.append(uicontainer);
  
        let title = this.app.getDocumentItemTitle(cell);
        textcontainer.innerHTML = title;
        textcontainer.title = "Click to select";
        container.cell = cell;
        container.style.cursor = "pointer";
        container.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewContainer
        );
        container.id = cell.id;
  
        //create unasign button
        let unasignButton = document.createElement("button");
        unasignButton.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewUnassignButton
        );
        unasignButton.innerHTML = "→";
        unasignButton.title = NASettings.Language.English["unassign"];
        unasignButton.onclick = this.unasignCell.bind(null, this, cell); //handler to remove this cell from the group
        uicontainer.append(unasignButton);
  
        //add the container to the body
        this.bodyContainer.append(container);
        let graph = this.editorui.editor.graph;
        let highlight = new mxCellHighlight(graph, "#000", 2);
        //add highlight
        textcontainer.onmouseenter = function () {
          highlight.highlight(graph.view.getState(cell));
        };
        textcontainer.onmouseleave = function () {
          highlight.hide();
        };
        textcontainer.onclick = function () {
          graph.setSelectionCell (cell);
        };

        let cellView = {
          cell: cell,
          htmlcontainer: container,
          htmltitle: textcontainer,
          htmluicontainer: uicontainer,
        };
  
        this.cellviews.push(cellView);
      }
    };
  
    /**
     * Remove cell from the list
     * @param {*} t
     * @param {*} c
     */
    unasignCell(t, c) {
      t.narrative.removeCell(c);
      t.removeCellView(c);
    };
  
    /**
     * Remove cell view
     * @param {*} cell
     */
    removeCellView(cell) {
      let cellView = this.getCellView(cell);
      this.unhighlightCells([cell]);
      cellView.htmlcontainer.remove();
      this.cellviews = NAUtil.RemoveElementArray(this.cellviews.indexOf(cellView), this.cellviews);
    };
  
    /**
     * Get cell view from given cell
     * @param {*} cell
     * @returns
     */
    getCellView(cell) {
      let ret = null;
      this.cellviews.forEach((view) => {
        if (view.cell == cell) {
          ret = view;
        }
      });
  
      return ret;
    };
  
    /**
     * Create representation of cells in the view's body
     */
    createBodyElements() {
      let t = this;
      this.bodyContainer.innerHTML = "";
      this.cellviews = [];
      this.narrative.cells.forEach(function (cell) {
        t.createCellView(cell);
      });
    };
  
    createHeadElements() {
      this.createAssignNodesButton();
      this.createLayoutButton();
      //this.createToggleHighlightButton();
      this.createToggleVisibilityButton();
      this.createUpDownButtons();
    };
  
    updateView() {
      this.createContainers();
      this.createHeadElements();
      this.createBodyElements();
      this.updateRootCellColor();
      this.toggleHighlight(this); //always highlight all cells
    };
  
    /**
     * Update the colour of the narrative cell
     */
    updateRootCellColor() {
      let style =
        this.narrative.rootCell.getStyle() + ";fontColor=" + this.color + ";";
        this.editorui.editor.graph
        .getModel()
        .setStyle(this.narrative.rootCell, style);
    };
  }