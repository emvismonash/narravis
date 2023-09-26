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

    updateLayout = function(narratives){
        this.applyLayoutNarrativeCellsNaive(()=>{
            this.updateNarrativeCellsYPositions(() =>{
                    this.app.narratives.forEach(narrative => {
                        this.applyLayout(narrative);     //this one causes the graph not updating properly
                    });
                });
               
        });

    }

    updateNarrativeCellsYPositions = function(callback, change, post){
         //update excluded cells position
         var model = this.graph.getModel();
         var graph = this.graph;
         var t = this;
         this.updateNarrativeCellsLayout();
         model.beginUpdate();
         try{
            if (change != null)
            {
                change();
            }
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
         }catch (e)
         {
             throw e;
         }finally{
            // New API for animating graph layout results asynchronously
            var morph = new mxMorphing(graph);
            morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
            {
                graph.getModel().endUpdate();
                graph.refresh();                
                if (post != null)
                {
                    post();
                }

                if(callback) callback();
            }));
            
            morph.startAnimation();
         }
         
    }

    applyLayoutNarrativeCellsNaive = function(callback, change, post){
        //update excluded cells position
        var model = this.graph.getModel();
        var graph = this.graph;
        var cells = [];
        var t = this;
        this.updateNarrativeCellsLayout();
        this.narrativecellslayout.forEach(cell =>{
            cells.push(cell.nacell);
        });

        model.beginUpdate();
        try{
            if (change != null)
            {
                change();
            }

            cells.forEach((cell) => {
                var geom = cell.geometry;
                geom.x = 0; 
                geom.y = t.getNarrativeCellYPosition(cell);
                model.setGeometry(cell, geom);
            });
        }
        catch (e)
        {
            throw e;
        }
        finally
        {
             // New API for animating graph layout results asynchronously
             var morph = new mxMorphing(graph);
             morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
             {
                 graph.getModel().endUpdate();
                 graph.refresh();
                 if (post != null)
                 {
                     post();
                 }

                 if(callback) callback();
             }));
             
             morph.startAnimation();
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

    applyLayout = function(narrative, change, post){
        //update excluded cells position
        var graph = this.graph;
        var model = this.graph.getModel();
        var targetCells = narrative.cells; // Array of parent node cells
        var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
        var excludeNodes = this.getExcludedCells(targetCells);

        graph.getModel().beginUpdate();
        try
        {
            if (change != null)
            {
                change();
            }
            
            layout.execute(graph.getDefaultParent(), targetCells);
            var t = this;
            targetCells.forEach(cell => {
                var currentgeometry = model.getGeometry(cell);
                var rootCellGeom = model.getGeometry(narrative.rootCell);
                currentgeometry.y = currentgeometry.y + rootCellGeom.y;
                currentgeometry.x = currentgeometry.x + t.cellsOffset;
                model.setGeometry(cell, currentgeometry);
            });

            excludeNodes.forEach((cell) => {
                var currentgeometry = model.getGeometry(cell.excell);
                currentgeometry.x = cell.x;
                currentgeometry.y = cell.y;
                model.setGeometry(cell.excell, currentgeometry);
            });
        }
        catch (e)
        {
            throw e;
        }
        finally
        {
            // New API for animating graph layout results asynchronously
            var morph = new mxMorphing(graph);
            morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
            {
                graph.getModel().endUpdate();
                
                if (post != null)
                {
                    post();
                }
            }));
            
            morph.startAnimation();
        }
    }
}