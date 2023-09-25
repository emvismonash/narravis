/**
 * A class to handle the layou
 */
class NarrativeLayout {
    constructor(){
        this.narrativeabduction;
        this.graph;
    }

    addNarrative = function(n){
        this.narratives.push(n);
    }

    getNarrativeCells = function(){
        var cells = [];
        this.narrativeabduction.narratives.forEach(na => {
            cells.push(na.rootCell);
        });
        return cells;
    }

    applyLayoutNarrativeCellsNaive = function(){
        //update excluded cells position
        var model = this.graph.model;
        var graph = this.graph;
        var cells = this.getNarrativeCells();

        model.beginUpdate();
        try{
            var morph = new mxMorphing(graph);
            cells.forEach((cell, idx) => {
                var geom = cell.geometry;
                geom.x = 0; 
                geom.y = idx * 200;
                model.setGeometry(cell, geom);
            });
        }finally{
            morph.addListener(mxEvent.DONE, function()
            {
                model.endUpdate();
                graph.refresh();
            });      
            morph.startAnimation();
        }
    }

    applyLayoutNarrativeCells = function(){
        //update excluded cells position
        var model = this.graph.model;
        var graph = this.graph;

        var cells = this.getNarrativeCells();
        var excludeNodes = this.getExcludedCells(cells);

        model.beginUpdate();

        try{
            var parent = graph.getDefaultParent();
            parent.geometry = new mxGeometry(0, 0); //this is currently being hardcoded. 
            var morph = new mxMorphing(graph);

        }finally{
            try{
                var layout = new mxStackLayout(graph, false, 50);
                layout.execute(graph.getDefaultParent(), cells);
                morph.cells = cells;

                console.log("layout", layout);
    
                excludeNodes.forEach((cell) => {
                    var currentgeometry = model.getGeometry(cell.excell);
                    currentgeometry.x = cell.x;
                    currentgeometry.y = cell.y;
    
                    console.log("currentgeometry", currentgeometry);
                    console.log("cell", cell);
    
                    model.setGeometry(cell.excell, currentgeometry);
                });
    
            }finally{
                morph.addListener(mxEvent.DONE, function()
                {
                    model.endUpdate();
                    graph.refresh();
                });      
                morph.startAnimation();
            }
        }

       

    }

    getExcludedCells = function(selectedNodes){
        this.graph.selectAll();
        var excludeNodes = [];
        var selectedCells = this.graph.getSelectionCells();

        selectedCells.forEach((cell) => {
          if (!selectedNodes.includes(cell) && cell.children != null) {
            excludeNodes.push({
              excell: cell,
              x: cell.geometry.x,
              y: cell.geometry.y,
            });
          }
        });
        this.graph.clearSelection();

        return excludeNodes;
    }

    applyLayout = function(narrative){
        //update excluded cells position
        var model = this.graph.model;
        var graph = this.graph;

          // Identify parent nodes and children (replace with your logic)
          var parentNodes = narrative.cells; // Array of parent node cells

          // check excluded nodes
          var excludeNodes = this.getExcludedCells(parentNodes);
  
        console.log("excludeNodes", excludeNodes);

        model.beginUpdate();
        //the first update is to set the offset of the layout to a value, such as narrative cell position
        try{
          var parent = graph.getDefaultParent();
          parent.geometry = new mxGeometry(0, 50); //this is currently being hardcoded. 

        }finally{
          model.endUpdate();
          //then, based on the new graph parent position, we update the layout such that the resulting layout positions the cells next to the root cell (narrative cell)
          var morph;
          try {          
              // Create an mxHierarchicalLayout instance
              var layout = new mxHierarchicalLayout(graph);
              // Configure the layout as horizontal
              layout.orientation = mxConstants.DIRECTION_WEST;
              layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
              layout.moveParent = false;
              layout.maintainParentLocation = true;

              layout.execute(parent, parentNodes);
              var morph = new mxMorphing(graph);
              morph.cells = parentNodes;

              excludeNodes.forEach((cell) => {
                  var currentgeometry = model.getGeometry(cell.excell);
                  currentgeometry.x = cell.x;
                  currentgeometry.y = cell.y;

                  console.log("currentgeometry", currentgeometry);
                  console.log("cell", cell);

                  model.setGeometry(cell.excell, currentgeometry);
              });
          } finally {
              morph.addListener(mxEvent.DONE, function()
              {
                model.endUpdate();
              });      
              morph.startAnimation();
          }      
      }
    }
 
}