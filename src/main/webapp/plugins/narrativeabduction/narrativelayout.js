/**
 * A class to handle the layou
 */
class NarrativeLayout {
    constructor(app){
        this.app = app;
        this.graph;
        this.narrativecellslayout = [];
        this.margin = 600;
        this.cellsOffset = 200;
    }

    addNarrative = function(n){
        this.narratives.push(n);
    }

    updateNarrativeCellsLayout = function(){
        this.narrativecellslayout = [];
        var narrativeListViews = this.app.narrativeaviewscontainer.narrativealistviews;
        narrativeListViews.forEach((listView,i) => {
            var na = listView.narrative;
            this.narrativecellslayout.push({
                nacell: na.rootCell,
                order: i,
                positionY: i * this.margin
            });
        });
    }

    updateLayout = function(narrative){
        this.applyLayoutNarrativeCellsNaive(()=>{
            this.updateNarrativeCellsYPositions(()=>{
                if(narrative) this.applyLayout(narrative);
                // this.app.narratives.forEach(narrative => {
                //     this.applyLayout(narrative);
                // });
            });
        })
    }

    updateNarrativeCellsYPositions = function(callback){
         //update excluded cells position
         var model = this.graph.model;
         var graph = this.graph;
         var t = this;
         this.updateNarrativeCellsLayout();
         model.beginUpdate();
         try{
             this.app.narratives.forEach(narrative =>{
                narrative.cells.forEach(cell => {
                    var geom = cell.geometry;
                    geom.x = geom.x;
                    var naCellPos = t.getNarrativeCellLayout(narrative.rootCell);
                    console.log("geom Y", geom.y);     
                    console.log("Layout pos", naCellPos);    
                    var dy = naCellPos.positionY;
                    geom.y = dy;
                    model.setGeometry(cell, geom);
                })
             });            
         }finally{
            model.endUpdate();
            graph.refresh();
            graph.getView().refresh();
            if(callback) callback();
         }
         
    }

    applyLayoutNarrativeCellsNaive = function(callback){
        //update excluded cells position
        var model = this.graph.model;
        var graph = this.graph;
        var cells = [];
        var t = this;
        this.updateNarrativeCellsLayout();
        this.narrativecellslayout.forEach(cell =>{
            cells.push(cell.nacell);
        });

        model.beginUpdate();
        try{
            cells.forEach((cell) => {
                var geom = cell.geometry;
                geom.x = 0; 
                geom.y = t.getNarrativeCellYPosition(cell);
                model.setGeometry(cell, geom);
            });
        }finally{
            model.endUpdate();
            graph.refresh();
            graph.getView().refresh();
            if(callback) callback();
        }



    }


    getNarrativeCellLayout = function(nacell){
        var res;
        this.narrativecellslayout.forEach(element => {
            if(nacell == element.nacell){
                res = element;
            }
        });
        return res;
    }

    getNarrativeCellYPosition = function(nacell){
        var pos;
        this.narrativecellslayout.forEach(element => {
            if(nacell == element.nacell){
                pos = element.positionY;
            }
        });
        return pos;
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

        console.log("Excluded nodes", excludeNodes);

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
  
          model.endUpdate();
          //then, based on the new graph parent position, we update the layout such that the resulting layout positions the cells next to the root cell (narrative cell)
          try {          
              // Create an mxHierarchicalLayout instance
              var layout = new mxHierarchicalLayout(graph);
              // Configure the layout as horizontal
              layout.orientation = mxConstants.DIRECTION_WEST;
              layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
              layout.moveParent = false;
              layout.maintainParentLocation = true;

              layout.execute(graph.getDefaultParent(), parentNodes);

              excludeNodes.forEach((cell) => {
                  var currentgeometry = model.getGeometry(cell.excell);
                  currentgeometry.x = cell.x;
                  currentgeometry.y = cell.y;
                  model.setGeometry(cell.excell, currentgeometry);
              });

              var t = this;
              parentNodes.forEach(cell => {
                var currentgeometry = model.getGeometry(cell);
                var rootCellGeom = model.getGeometry(narrative.rootCell);
                currentgeometry.y = currentgeometry.y + rootCellGeom.y;
                currentgeometry.x = currentgeometry.x + t.cellsOffset;
                model.setGeometry(cell, currentgeometry);
              });

          } finally {
            model.endUpdate();
            graph.refresh();
            graph.getView().refresh();
          }      


    }
 
}