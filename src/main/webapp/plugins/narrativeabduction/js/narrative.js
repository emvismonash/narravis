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

      if(this.getBoundCell()){
        this.boundcell = this.getBoundCell();
        this.graph.getModel().setStyle(this.boundcell, NASettings.Styles.NarrativeBound);
      }
      this.initListenerUpdateBound();
      this.initListenerRemoveCell();
    }

    hideBound(){
      this.toggleBoundVisible(false);
    }

    showBound(){
      this.toggleBoundVisible(true);
    }

    toggleBoundVisible(status){
      if(!this.boundcell) return;

      const graph = this.graph;  
      graph.getModel().beginUpdate();
      try {
         graph.cellsToggled([this.boundcell], status);
      } finally {
         graph.getModel().endUpdate();
      }
      graph.refresh();
    }
  
    deleteBound(){
      this.graph.getModel().beginUpdate();
      try{
        this.graph.cellsRemoved([this.boundcell]);
      }finally{
        this.graph.getModel().endUpdate();
      }
    }

    initListenerRemoveCell(){
      let t = this;
      let graph = this.graph;
      graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt){
        let cells = evt.getProperty("cells");
        cells.forEach(cell => {
          if (t.cells.includes(cell)) {
            t.removeCell(cell);
          }
        });
      })
    }
    initListenerUpdateBound(){
      const graph = this.graph;
      const t = this;
      graph.addListener(mxEvent.CELLS_MOVED, function (sender, evt) {
        const cells = evt.getProperty('cells'); // Get the moved cells
        if(cells){
          cells.forEach(cell => {
            if(t.cells.includes(cell)){
              t.updateCellsBound();
            }
          });
        }
      });
      graph.addListener(mxEvent.CELL_ADDED, function(sender, evt) {
        const cells = evt.getProperty('cells'); // Get the moved cells
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
        const cells = evt.getProperty('cells'); // Get the moved cells
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
    removeCell(c) {
      const idx = this.cells.indexOf(c);
      this.cells.splice(idx, 1);
      this.unsaveCell(c);
    };
  
    addCell(c) {
      if (!this.cells.includes(c)) {
        this.cells.push(c);
        this.saveCell(c);
        this.updateCellsBound();
      }
    };
  
    /**
     * Push cell id to the cells attribute of the rootCell.
     */
    saveCell(c) {
      let cellstring = this.rootCell.value.getAttribute(
        NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLS
      );
      let cellsarr = Narrative.stringCellsToArray(cellstring);
  
      cellsarr.push(c.id);
      cellstring = Narrative.arrayCellsToString(cellsarr);
      this.rootCell.value.setAttribute(
        NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLS,
        cellstring
      );
    };
  
    static stringCellsToArray = function (cellstring) {
      if (cellstring == null) cellstring = "[]";
      const cellsarr = JSON.parse(cellstring);
      return cellsarr;
    };
  
    static arrayCellsToString = function (cellsarr) {
      return JSON.stringify(cellsarr);
    };
  
    /**
     * Remove cell from the root cell cells attribute
     * @param {*} c
     */
    unsaveCell(c) {
      let cellstring = this.rootCell.value.getAttribute(
        NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLS
      );
      const cellsarr = Narrative.stringCellsToArray(cellstring);
      const idx = cellsarr.indexOf(c.idx);
      cellsarr.splice(idx, 1);
      cellstring = Narrative.arrayCellsToString(cellsarr);
      this.rootCell.value.setAttribute(
        NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLS,
        cellstring
      );
    };
  
    getBoundCell(){
      const cell = this.graph.getModel().getCell(this.getBoundCellID());
      return cell;
    }

    getBoundCellID(){
      return NASettings.Dictionary.ATTRIBUTES.NARRATIVECELLSBOUND + "-" + this.rootCell.id;
    }

    /**
     * 
     * @param {*} callback 
     */
    updateCellsBound(){
      // can't calculate bound if cells are hidden
      if(!this.isvisible) return;
      if(this.cells.length == 0) return;

      let cellsToCalculateBoundary = this.cells;

      // Initialize variables to store the boundary coordinates
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let maxY = Number.MIN_VALUE;
      
      // Iterate through the cells and calculate the boundary
      for (let i = 0; i < cellsToCalculateBoundary.length; i++) {
          let cell = cellsToCalculateBoundary[i];
          let geometry = cell.getGeometry();

          if (geometry != null) {
              let x = geometry.x;
              let y = geometry.y;
              let width = geometry.width;
              let height = geometry.height;

              // Update the min and max coordinates to expand the bounding box
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x + width);
              maxY = Math.max(maxY, y + height);
          }
      }

      let w = maxX - minX;
      let h = maxY - minY;
      let centerX = (minX + maxX) * 0.5;
      let centerY = (minY + maxY) * 0.5;

      //the anchor is top left point
      let tcenterX = minX;
      let tcenterY = minY;

      let bound ={
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
      const graph = this.graph;
      if(!this.boundcell){
        let vertex = graph.insertVertex(this.graph.getDefaultParent(), null, '', this.bound.cx, this.bound.cy, this.bound.width, this.bound.height);
        vertex.setStyle(NASettings.Styles.NarrativeBound);
        vertex.id = this.getBoundCellID();
        this.boundcell = vertex;
        graph.orderCells(true, [this.boundcell]);
        this.updateCellsBound();
      }else{
        graph.getModel().beginUpdate();
        try{
          let geom = this.boundcell.getGeometry();
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
    addCells(cells) {
      const t = this;
      cells.forEach((element) => {
        if (Narrative.isCellValid(element)) {
          t.addCell(element);
        }
      });
    };
   
    /**
     * In some cases, the selected cells are part of narrative element, e.g. content cell. This function validates what cell can be added.
     */
    static isCellValid(cell) {
      return (
        cell.value &&
        cell.value.tagName &&
        cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVE &&
        cell.value.tagName != NASettings.Dictionary.CELLS.NARRATIVELIST
      );
    };
  
    static isCellNarrative(cell) {
      return (
        cell.value &&
        cell.value.tagName &&
        cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVE
      );
    };
  }