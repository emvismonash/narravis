class Narrative {
    #event;
    constructor(rootCell, graph, name, id) {
      this.id = id;
      this.rootCell = rootCell;
      this.name = name;
      this.cells = [];
      this.boundcell;
      this.graph = graph;
      this.ishighlight = false;
      this.isvisible = true;
      this.bound;

      this.initListenerUpdateBound();
    }
  
    initListenerUpdateBound = function(){
      var graph = this.graph;
      var t = this;
      graph.addListener(mxEvent.CELLS_MOVED, function (sender, evt) {
        var cells = evt.getProperty('cells'); // Get the moved cells
        if(cells){
          cells.forEach(cell => {
            if(t.cells.includes(cell)){
              t.updateCellsBound();
            }
          });
        }
      });
      graph.addListener(mxEvent.CELL_ADDED, function(sender, evt) {
        var cells = evt.getProperty('cells'); // Get the moved cells
        if(cells){
          cells.forEach(cell => {
            if(t.cells.includes(cell)){
              t.updateCellsBound();
            }
          });
        }
      });
      // Add a listener for the cell removed event
      graph.addListener(mxEvent.CELL_REMOVED, function(sender, evt) {
        var cells = evt.getProperty('cells'); // Get the moved cells
        if(cells){
          cells.forEach(cell => {
            if(t.cells.includes(cell)){
              t.updateCellsBound();
            }
          });
        }
      });
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
     * 
     * @param {*} callback 
     */
    updateCellsBound = function(){
      var cellsToCalculateBoundary = this.cells;

      // Initialize variables to store the boundary coordinates
      var minX = Number.MAX_VALUE;
      var minY = Number.MAX_VALUE;
      var maxX = Number.MIN_VALUE;
      var maxY = Number.MIN_VALUE;
      
      // Iterate through the cells and calculate the boundary
      for (var i = 0; i < cellsToCalculateBoundary.length; i++) {
          var cell = cellsToCalculateBoundary[i];
          var geometry = cell.getGeometry();

          if (geometry != null) {
              var x = geometry.x;
              var y = geometry.y;
              var width = geometry.width;
              var height = geometry.height;

              // Update the min and max coordinates to expand the bounding box
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x + width);
              maxY = Math.max(maxY, y + height);
          }
      }

      var w = maxX - minX;
      var h = maxY - minY;
      var centerX = (minX + maxX) * 0.5;
      var centerY = (minY + maxY) * 0.5;

      //the anchor is top left point
      var tcenterX = minX;
      var tcenterY = minY;

      var bound ={
          minx: minX,
          miny: minY,
          maxx: maxX,
          maxy: maxY,
          width: w,
          height: h,
          cx: centerX,
          cy: centerY,
          tcx: tcenterX, 
          tcy: tcenterY
      }

      this.bound = bound;
      console.log("bound", this.bound);

      //update bound cell
      var graph = this.graph;
      if(!this.boundcell){
        var vertex = graph.insertVertex(this.graph.getDefaultParent(), null, '', this.bound.cx, this.bound.cy, this.bound.width, this.bound.height);
        vertex.setStyle("connectable=0;editable=1;moveable=0;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#808080;dashed=1;dashPattern=12 12;");
        this.boundcell = vertex;
        graph.orderCells(true, [this.boundcell]);
        this.updateCellsBound();
      }else{
        graph.getModel().beginUpdate();
        try{
          var geom = this.boundcell.getGeometry();
          geom.x = this.bound.tcx;
          geom.y = this.bound.tcy;
          geom.width = this.bound.width;
          geom.height = this.bound.height;
          console.log("geom", geom);
          graph.getModel().setGeometry(this.boundcell, geom);
          graph.orderCells(true, [this.boundcell]);
        }finally{
          graph.getModel().endUpdate(); 
          graph.refresh();             
        }
      }
      console.log("boundcell", this.boundcell);
  };


    /**
     * Add cells into the narrative cell, also add the cells as children of rootcells
     * @param {*} cells
     */
    addCells = function (cells) {
      var t = this;
      cells.forEach((element) => {
        if (Narrative.isCellValid(element)) {
          t.addCell(element);
        }
      });
    };
   
    /**
     * In some cases, the selected cells are part of narrative element, e.g. content cell. This function validates what cell can be added.
     */
    static isCellValid = function (cell) {
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