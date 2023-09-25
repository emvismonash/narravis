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