/**
 * A class to handle the layou
 */
class NarrativeLayout {
    constructor(app){
        this.app = app;
        this.graph;
        this.narrativecellslayout = [];
        this.verticalspace = 20;
        this.horizontalspacebetweennarrativeandlayout = 200;
        this.narrativesbounds = [];
    }

    updateNarrativeCellsLayout = function(){
        this.narrativecellslayout = [];
        var narrativeListViews = this.app.narrativeaviewscontainer.narrativealistviews;
        var sum = 0;
        console.log("narrativeListViews", narrativeListViews);
        for(var i = 0; i < narrativeListViews.length; i++){
            var bound, posY, height, posY;
            var na = narrativeListViews[i].narrative;
            if(!na.bound) na.updateCellsBound();
            bound  = na.bound;
            //if the height is zero because the narrative has not items, use the height of the narrative cell
            if(!bound){
                height = na.rootCell.getGeometry().height;
            }else{
                height = bound.height;
            }

            console.log("bound", bound);
            console.log("height", height);
            if(i == 0 ){         
                posY = 0;               
            }else{                    
                posY = sum;
            }

            sum += height + this.verticalspace;
            this.narrativecellslayout.push({
                nacell: na.rootCell,
                order: i,
                positionY: posY 
            });
        }
    }



    updateLayout = function(narratives){
        this.applyLayoutNarrativeCellsNaive(()=>{
            this.updateNarrativeCellsYPositions(() =>{
                this.app.narratives.forEach(narrative => {
                       this.applyLayout(narrative);
                 });  
            });
        })

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
                    if(naCellPos){
                        console.log("geom Y", geom.y);     
                        console.log("Layout pos", naCellPos);    
                        var dy = naCellPos.positionY;
                        geom.y = dy;
                        model.setGeometry(cell, geom);
                    }
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

    /**
     * Stack the narrative cells
     * @param {*} callback 
     * @param {*} change 
     * @param {*} post 
     */
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

    applyLayout = function(narrative, callback, change, post){
        //do not apply layout if narrative is hidden
        if(!narrative.isvisible) return;

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
            var order = this.getNarrativeCellLayout(narrative.rootCell);
            
            var dy = (order)? order.positionY: 0;
            targetCells.forEach(cell => {
                var currentgeometry = model.getGeometry(cell);
                currentgeometry.y = currentgeometry.y + dy;
                currentgeometry.x = currentgeometry.x + t.horizontalspacebetweennarrativeandlayout;
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
                narrative.updateCellsBound();
                if(callback) callback();
            }));
            
            morph.startAnimation();
        }
    }
}