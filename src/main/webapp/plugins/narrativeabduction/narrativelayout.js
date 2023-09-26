/**
 * A class to handle the layou
 */
class NarrativeLayout {
    constructor(){
        this.narrativeabduction;
        this.graph;
        this.narrativecellslayout = [];
        this.margin = 600;
    }

    addNarrative = function(n){
        this.narratives.push(n);
    }

    updateNarrativeCellsLayout = function(){
        var temp = [];

        //visible cells on top
        var i = 0;
        this.narrativeabduction.narratives.forEach(na => {
            if(na.isvisible){
                temp.push({
                    nacell: na.rootCell,
                    order: i,
                    positionY: i * this.margin
                });
                i++;
            }
        });
        this.narrativeabduction.narratives.forEach(na => {
            if(!na.isvisible){
                temp.push({
                    nacell: na.rootCell,
                    order: i,
                    positionY: i * this.margin
                });
                i++;
            }
        });

        console.log("temp", temp);

        this.narrativecellslayout = [];
        this.narrativecellslayout = Array.from(temp);
    }

    updateNarrativeCellsYPositions = function(){
         //update excluded cells position
         var model = this.graph.model;
         var graph = this.graph;
         var t = this;
         this.updateNarrativeCellsLayout();
         model.beginUpdate();
         try{
             var morph = new mxMorphing(graph);
             this.narrativeabduction.narratives.forEach(narrative =>{
                narrative.cells.forEach(cell => {
                    var geom = cell.geometry;
                    geom.x = geom.x;
                    var newY = t.getNarrativeCellYPosition(narrative.rootCell);
                    console.log("current geom", geom);

                    console.log("narrative cell", graph.getView().getState(narrative.rootCell, false));
                    console.log("narrative cell geom", narrative.rootCell.geometry);
                    geom.y = geom.y + (newY - geom.y);
                    model.setGeometry(cell, geom);
                })
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
            var morph = new mxMorphing(graph);
            cells.forEach((cell) => {
                var geom = cell.geometry;
                geom.x = 0; 
                geom.y = t.getNarrativeCellYPosition(cell);
                model.setGeometry(cell, geom);
            });
        }finally{
            morph.addListener(mxEvent.DONE, function()
            {
                model.endUpdate();
                graph.refresh();
                if(callback) callback();
            });      
            morph.startAnimation();
        }
    }

    // applyLayoutNarrativeCells = function(){
    //     //update excluded cells position
    //     var model = this.graph.model;
    //     var graph = this.graph;

    //     var cells = this.getNarrativeCells();
    //     var excludeNodes = this.getExcludedCells(cells);

    //     model.beginUpdate();

    //     try{
    //         var parent = graph.getDefaultParent();
    //         parent.geometry = new mxGeometry(0, 0); //this is currently being hardcoded. 
    //         var morph = new mxMorphing(graph);

    //     }finally{
    //         try{
    //             var layout = new mxStackLayout(graph, false, 50);
    //             layout.execute(graph.getDefaultParent(), cells);
    //             morph.cells = cells;    
    //             excludeNodes.forEach((cell) => {
    //                 var currentgeometry = model.getGeometry(cell.excell);
    //                 currentgeometry.x = cell.x;
    //                 currentgeometry.y = cell.y;    
    //                 model.setGeometry(cell.excell, currentgeometry);
    //             });
    
    //         }finally{
    //             morph.addListener(mxEvent.DONE, function()
    //             {
    //                 model.endUpdate();
    //             });      
    //             morph.startAnimation();
    //         }
    //     }
    // }

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
  
        model.beginUpdate();
        //the first update is to set the offset of the layout to a value, such as narrative cell position
        try{
          var parent = graph.getDefaultParent();
          parent.geometry = new mxGeometry(0, this.getNarrativeCellYPosition(narrative)); //this is currently being hardcoded. 

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