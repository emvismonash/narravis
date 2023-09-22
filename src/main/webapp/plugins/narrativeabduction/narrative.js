class Narrative {
    #event;
    constructor(rootCell, graph, name, id) {
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
    removeCell = function (c) {
      var idx = this.cells.indexOf(c);
      this.cells.splice(idx, 1);
      this.unsaveCell(c);
    };
  
    addCell = function (c) {
      if (!this.cells.includes(c)) {
        this.cells.push(c);
        this.saveCell(c);
      }
    };
  
    /**
     * Push cell id to the cells attribute of the rootCell.
     */
    saveCell = function (c) {
      var cellstring = this.rootCell.value.getAttribute(
        NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS
      );
      var cellsarr = Narrative.stringCellsToArray(cellstring);
  
      cellsarr.push(c.id);
      cellstring = Narrative.arrayCellsToString(cellsarr);
      this.rootCell.value.setAttribute(
        NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS,
        cellstring
      );
    };
  
    static stringCellsToArray = function (cellstring) {
      if (cellstring == null) cellstring = "[]";
      var cellsarr = JSON.parse(cellstring);
      return cellsarr;
    };
  
    static arrayCellsToString = function (cellsarr) {
      return JSON.stringify(cellsarr);
    };
  
    /**
     * Remove cell from the root cell cells attribute
     * @param {*} c
     */
    unsaveCell = function (c) {
      var cellstring = this.rootCell.value.getAttribute(
        NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS
      );
      var cellsarr = Narrative.stringCellsToArray(cellstring);
      var idx = cellsarr.indexOf(c.idx);
      cellsarr.splice(idx, 1);
      cellstring = Narrative.arrayCellsToString(cellsarr);
      this.rootCell.value.setAttribute(
        NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS,
        cellstring
      );
    };
  
    /**
     * Add cells into the narrative cell, also add the cells as children of rootcells
     * @param {*} cells
     */
    addCells = function (cells) {
      var t = this;
      console.log(this.rootCell);
      cells.forEach((element) => {
        if (Narrative.isCellValid(element)) {
          t.addCell(element);
        }
      });
    };

    applyLayout = function(){
        //update excluded cells position
        var model = this.graph.model;
        var graph = this.graph;

          // Identify parent nodes and children (replace with your logic)
          var parentNodes = this.cells; // Array of parent node cells

          // check excluded nodes
          var excludeNodes = [];
  
          graph.selectAll();
          var selectedCells = graph.getSelectionCells();
          selectedCells.forEach((cell) => {
            if (!parentNodes.includes(cell) && cell.children != null) {
              excludeNodes.push({
                excell: cell,
                x: cell.geometry.x,
                y: cell.geometry.y,
              });
            }
          });
  
          console.log("excludeNodes", excludeNodes);

        model.beginUpdate();
        try {
            // Create an mxHierarchicalLayout instance
            var layout = new mxHierarchicalLayout(graph);

            // Configure the layout as horizontal
            layout.orientation = mxConstants.DIRECTION_WEST;
            layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
            console.log("layout", layout);
            
            layout.execute(graph.getDefaultParent(), parentNodes);

            excludeNodes.forEach((cell) => {
                var currentgeometry = model.getGeometry(cell.excell);
                currentgeometry.x = cell.x;
                currentgeometry.y = cell.y;

                console.log("currentgeometry", currentgeometry);
                console.log("cell", cell);

                model.setGeometry(cell.excell, currentgeometry);
            });
        } finally {
            model.endUpdate();
            graph.clearSelection();
        }      
    }
  
    /**
     * In some cases, the selected cells are part of narrative element, e.g. content cell. This function validates what cell can be added.
     */
    static isCellValid = function (cell) {
      console.log("isCellValid", cell);
      return (
        cell.value &&
        cell.value.tagName &&
        cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVE &&
        cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVELIST
      );
    };
  
    static isCellNarrative = function (cell) {
      return (
        cell.value &&
        cell.value.tagName &&
        cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVE
      );
    };
  }