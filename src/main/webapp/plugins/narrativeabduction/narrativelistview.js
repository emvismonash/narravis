
/**
 * Accordion View of a narrative
 */
class NarrativeListView {
    constructor(narrative, container, editorui, color) {
      this.narrative = narrative;
      this.cellviews = [];
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
    remove = function () {
      console.log("Removing accordion view", this);
      this.container.remove();
    };
  
    /**
     *
     * @returns Get the style to hightlight
     */
    getHighlightStyle = function () {
      return "strokeColor=" + this.color + ";strokeWidth=6";
    };
  
    /**
     * Highlight children cells
     * @param {*} cellsToHighlight
     */
    highlightCells = function (cellsToHighlight) {
      var highlightStyle = this.getHighlightStyle();
  
      var graph = this.editorui.editor.graph;
      graph.getModel().beginUpdate();
      try {
        for (let cell of cellsToHighlight) {
          graph.setCellStyle(cell.getStyle() + highlightStyle, [cell]);
        }
      } finally {
        graph.getModel().endUpdate();
      }
    };
  
    /**
     * Unhighilight the children cells
     * @param {*} cellsToUnhighlight
     */
    unhighlightCells = function (cellsToUnhighlight) {
      var highlightStyle = this.getHighlightStyle();
  
      var graph = this.editorui.editor.graph;
      graph.getModel().beginUpdate();
      try {
        for (let cell of cellsToUnhighlight) {
          var style = cell.getStyle().replace(highlightStyle, "");
          graph.setCellStyle(style, [cell]);
        }
      } finally {
        graph.getModel().endUpdate();
      }
    };
  
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
    createContainers = function () {
      this.headContainer = document.createElement("div");
      this.bodyContainer = document.createElement("div");
      this.uinarrativetitle = document.createElement("div");
      var toppart = document.createElement("div");
      var botpart = document.createElement("div");
  
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
      this.uinarrativetitle.classList.add(
        NASettings.CSSClasses.NarrativeListView.Title
      );
  
      var t = this;
      this.uinarrativetitle.onmouseenter = function () {
        t.highlightCells(t.narrative.cells);
      };
      this.uinarrativetitle.onmouseleave = function () {
        t.unhighlightCells(t.narrative.cells);
      };
  
      var toggleButton = document.createElement("button");
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
  
    /**
     * Update the narrative list livew
     */
    initListenerUpdateNarrativeCellEdit = function () {
      var graph = this.editorui.editor.graph;
      var t = this;
      graph.addListener(mxEvent.LABEL_CHANGED, function (sender, evt) {
        var cell = evt.getProperty("cell"); // Get the cell whose label changed
        var newValue = evt.getProperty("value"); // Get the new label value
        console.log("cell", cell);
  
        if (Narrative.isCellNarrative(cell) && t.narrative.rootCell == cell) {
          console.log("Edit title", newValue);
          t.uinarrativetitle.innerHTML = newValue;
        }
      });
    };
  
    /**
     * Update the narrative list livew
     */
    initListenerUpdateDocumentItemTitle = function () {
      var graph = this.editorui.editor.graph;
      var t = this;
      graph.addListener(mxEvent.LABEL_CHANGED, function (sender, evt) {
        var cell = evt.getProperty("cell"); // Get the cell whose label changed
        var newValue = evt.getProperty("value"); // Get the new label value
        var natype = cell.natype;
        console.log("cell", cell);
        console.log("natype", natype);
  
        if (natype == NASettings.Dictionary.ATTRIBUTTES.DOCTITLE) {
          //check if the parent is in narrative
          var parent = cell.parent;
          console.log("Parent", parent);
          if (t.narrative.cells.includes(parent)) {
            console.log("Cell in narrative");
            console.log("Edit title of cell view");
            var cellview = t.getCellView(parent);
            console.log("cellview", cellview);
            if (cellview) cellview.htmltitle.innerHTML = newValue;
          }
        }
      });
    };
  
    /**
     * Create assign nodes button
     */
    createAssignNodesButton = function () {
      var buttonAssignNode = document.createElement("button");
      buttonAssignNode.innerHTML = "←";
      buttonAssignNode.title = NASettings.Language.English["assign"];
      buttonAssignNode.onclick = this.assignNode.bind(null, this);
      this.headContainer.bottompart.append(buttonAssignNode);
    };
  
    /**
     * Assign selected node to the narrative.
     * The narrative cell should contain the all information necessary to recreate the view, thus, the children cells' ids should be stored in the narrative cell.
     */
    assignNode = function (t) {
      var graph = t.editorui.editor.graph;
      var selectedCells = graph.getSelectionCells();
      if (selectedCells) {
        t.assignNodes(selectedCells);
      }
    };
    assignNodes = function (cells) {
      this.narrative.addCells(cells); //add cell to the narrative object, this is where the children cells are added to the root cell
      this.createBodyElements(); //create representaton
    };
  
    getTitleCell = function (cell) {
      var children = cell.children;
      var ret = null;
      if (children) {
        children.forEach((child) => {
          if (child.natype == NASettings.Dictionary.ATTRIBUTTES.DOCTITLE) {
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
    createCellView = function (cell) {
      if (cell.isVertex()) {
        //container of the view
        var container = document.createElement("div"); //main container
        var textcontainer = document.createElement("div");
        textcontainer.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewTitle
        );
  
        var uicontainer = document.createElement("div");
        uicontainer.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewUIContainer
        );
        container.append(textcontainer);
        container.append(uicontainer);
  
        var titlecell = this.getTitleCell(cell);
        textcontainer.innerHTML = titlecell.value;
        container.cell = cell;
        container.style.cursor = "pointer";
        container.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewContainer
        );
        container.id = cell.id;
  
        //create unasign button
        var unasignButton = document.createElement("button");
        unasignButton.classList.add(
          NASettings.CSSClasses.NarrativeListView.CellViewUnassignButton
        );
        unasignButton.innerHTML = "→";
        unasignButton.title = NASettings.Language.English["unassign"];
        unasignButton.onclick = this.unasignCell.bind(null, this, cell); //handler to remove this cell from the group
        uicontainer.append(unasignButton);
  
        //add the container to the body
        this.bodyContainer.append(container);
        var graph = this.editorui.editor.graph;
        var highlight = new mxCellHighlight(graph, "#000", 2);
        //add highlight
        textcontainer.onmouseenter = function () {
          highlight.highlight(graph.view.getState(cell));
        };
        textcontainer.onmouseleave = function () {
          highlight.hide();
        };
  
        var cellView = {
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
    unasignCell = function (t, c) {
      t.narrative.removeCell(c);
      t.removeCellView(c);
    };
  
    /**
     * Remove cell view
     * @param {*} c
     */
    removeCellView = function (c) {
      var cellView = this.getCellView(c);
      cellView.htmlcontainer.remove();
      this.cellviews.splice(this.cellviews.indexOf(cellView), 1);
    };
  
    /**
     * Get cell view from given cell
     * @param {*} cell
     * @returns
     */
    getCellView = function (cell) {
      var ret = null;
      console.log("getCellView");
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
    createBodyElements = function () {
      var t = this;
      this.bodyContainer.innerHTML = "";
      this.cellviews = [];
      this.narrative.cells.forEach(function (cell) {
        t.createCellView(cell);
      });
    };
  
    createHeadElements = function () {
      this.createAssignNodesButton();
    };
  
    updateView = function () {
      this.createContainers();
      this.createHeadElements();
      this.createBodyElements();
      this.updateRootCellColor();
    };
  
    updateRootCellColor = function () {
      var style =
        this.narrative.rootCell.getStyle() + ";fillColor=" + this.color + ";";
      this.editorui.editor.graph
        .getModel()
        .setStyle(this.narrative.rootCell, style);
    };
  }