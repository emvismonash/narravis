/**
 * A class to handle the layou
 */
class NarrativeLayout {
    constructor(app){
        this.app = app;
        this.graph = app.editorui.editor.graph;
        this.narrativecellslayout = [];
        this.verticalspace = 20;
        this.horizontalspacebetweennarrativeandlayout = 400;
        this.narrativesbounds = [];        
    }


    /**
     * Calculate the bound and order of each narrative
     */
    updateNarrativeCellsLayout(){
        this.narrativecellslayout = [];
        let narrativeListViews = this.app.narrativeaviewscontainer.narrativealistviews;
        let sum = 0;
        for(let i = 0; i < narrativeListViews.length; i++){
            let bound, posY, height;
            let na = narrativeListViews[i].narrative;
            if(!na.bound) na.updateCellsBound();
            bound  = na.bound;
            //if the height is zero because the narrative has not items, use the height of the narrative cell
            if(!bound){
                height = na.rootcell.getGeometry().height;
            }else{
                height = bound.height;
            }

            if(i == 0 ){         
                posY = 0;               
            }else{                    
                posY = sum;
            }

            sum += height + this.verticalspace;
            this.narrativecellslayout.push({
                nacell: na.rootcell,
                order: i,
                positionY: posY 
            });
        }
    }

    updateLayout(narratives){
        this.applyLayoutNarrativeCellsNaive(()=>{
            this.updateNarrativeCellsYPositions(() =>{
                this.app.narratives.forEach(narrative => {
                       this.applyLayout(narrative);
                 });  
            });
        })
    }

    updateNarrativeCellsYPositions(callback, change, post){
         //update excluded cells position
         let model = this.graph.getModel();
         let graph = this.graph;
         let t = this;
         this.updateNarrativeCellsLayout();
         model.beginUpdate();
         try{
            if (change != null)
            {
                change();
            }
             this.app.narratives.forEach(narrative =>{
                narrative.cells.forEach(cell => {
                    let geom = cell.geometry;
                    geom.x = geom.x;
                    let naCellPos = t.getNarrativeCellLayout(narrative.rootcell);
                    if(naCellPos){
                        let dy = naCellPos.positionY;
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
            let morph = new mxMorphing(graph);
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
    applyLayoutNarrativeCellsNaive(callback, change, post){
        //update excluded cells position
        let model = this.graph.getModel();
        let graph = this.graph;
        let cells = [];
        let t = this;
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
                let geom = cell.geometry;
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
             let morph = new mxMorphing(graph);
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

    getNarrativeCellLayout(nacell){
        let res;
        this.narrativecellslayout.forEach(element => {
            if(nacell == element.nacell){
                res = element;
            }
        });
        return res;
    }

    getNarrativeCellYPosition(nacell){
        let pos;
        this.narrativecellslayout.forEach(element => {
            if(nacell == element.nacell){
                pos = element.positionY;
            }
        });
        return pos;
    }

    static getExcludedCells(graph, selectedNodes){
        //first select all cells in the editor and get all selected celss
        graph.selectAll();
        let excludeNodes = [];
        let selectedCells = graph.getSelectionCells();

        //for each selected cell, excluded cell is
        //not part of the selectedNodes array
        selectedCells.forEach((cell) => {
          if (!selectedNodes.includes(cell)) {
            excludeNodes.push({
              excell: cell,
              x: cell.geometry.x,
              y: cell.geometry.y,
            });
          }
        });
        graph.clearSelection();
        return excludeNodes;
    }

    static applyCellsLayout(graph, model, cells, callback, change, post){
        //update excluded cells position
        let targetCells = cells; // Array of parent node cells
        let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
        let excludeNodes = NarrativeLayout.getExcludedCells(graph, targetCells);

        graph.getModel().beginUpdate();
        try
        {
            if (change != null)
            {
                change();
            }
            
            layout.execute(graph.getDefaultParent(), targetCells);
            let t = this;
            excludeNodes.forEach((cell) => {
                let currentgeometry = model.getGeometry(cell.excell);
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
            let morph = new mxMorphing(graph);
            morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
            {
                graph.getModel().endUpdate();
                
                if (post != null)
                {
                    post();
                }
                if(callback) callback();
            }));
            
            morph.startAnimation();
        }
    }

    static isNarrativeEvidenceOnly(narrative){
        let res = true;
        narrative.cells.forEach(cell => {
            if(!NarrativeAbductionApp.isCellDocumentItemType(cell, NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE)){
                res = false;
            }
        });

        return res;
    }

    static removeOverlaps(rects) {
        var rs = [];
        rects.forEach(function (r) {
            let x = r.x; 
            let y = r.y;
            let w = r.width;
            let h = r.height;
            rs.push(new cola.Rectangle(x, x + w, y, y + h));
        });
        
        cola.removeOverlaps(rs);
        console.log(rects);
        console.log(rs);
        return rs;
    }

    static removeOverlapsHorizontal(rectangles) {
        let hasOverlaps = true;
    
        while (hasOverlaps) {
            hasOverlaps = false;
    
            // Sort rectangles by their x-coordinate
            rectangles.sort((a, b) => a.x - b.x);
    
            for (let i = 1; i < rectangles.length; i++) {
                // Check for overlap with the previous rectangle
                if (rectangles[i].x < rectangles[i - 1].x + rectangles[i - 1].width) {
                    // If overlap, adjust the x-coordinate of the current rectangle
                    rectangles[i].x = rectangles[i - 1].x + rectangles[i - 1].width;
                    hasOverlaps = true; // Set flag to true for another iteration
                }
            }
        }
    
        return rectangles;
    }

    static applyLayoutEvidenceGroup(narrative, graph, dx, dy, callback, change, post){
       
        let model = graph.getModel();
        let targetCells = narrative.cells; // Array of parent node cells
        let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
        layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
        layout.disableEdgeStyle = false;
        let excludeNodes = NarrativeLayout.getExcludedCells(graph, targetCells);

        graph.getModel().beginUpdate();
        try
        {
            if (change != null)
            {
                change();
            }
            
            layout.execute(graph.getDefaultParent(), targetCells);           

            targetCells.forEach(cell => {
                let currentgeometry = model.getGeometry(cell);
                currentgeometry.y += dy;
                //get edte
                let edges = graph.getEdges(cell);
                //get the middle position
                let sum = 0;
                edges.forEach(edge => {
                    //get connected x
                    sum += edge.source.geometry.x;
                });    
                let resx = (edges.length > 0)? sum/edges.length : currentgeometry.x;
                currentgeometry.x = resx;   
                model.setGeometry(cell, currentgeometry);
            });

            //remove overlaps using cola
            let rects = [];
            targetCells.forEach(cell => {
                rects.push({
                    x: cell.geometry.x,
                    y: cell.geometry.y,
                    width: cell.geometry.width,
                    height: cell.geometry.height
                })
            });
            //update excluded cells position            
            let results = NarrativeLayout.removeOverlapsHorizontal(rects);
            console.log(rects);

            console.log(results);
            results.forEach((res,  i) => {
                console.log(i);
                console.log(res);

                let cell = targetCells[i];
                let currentgeometry = model.getGeometry(cell);
                currentgeometry.x = res.x;
                currentgeometry.y = res.y;  
                console.log(currentgeometry);
                model.setGeometry(cell, currentgeometry);
            });
            
            excludeNodes.forEach((cell) => {
                let currentgeometry = model.getGeometry(cell.excell);
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
            let morph = new mxMorphing(graph);
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

    
    /***
     * Apply mxHierarchicalLayout layout to a narrative group
     */
    static applyLayoutHierarchical(narrative, graph, dx, dy, callback, change, post){

        //update excluded cells position
        let model = graph.getModel();
        let targetCells = narrative.cells; // Array of parent node cells
        let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        layout.disableEdgeStyle = false;
        layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
        let excludeNodes = NarrativeLayout.getExcludedCells(graph, targetCells);

        graph.getModel().beginUpdate();
        try
        {
            if (change != null)
            {
                change();
            }
            
            layout.execute(graph.getDefaultParent(), targetCells);           

            targetCells.forEach(cell => {
                let currentgeometry = model.getGeometry(cell);
                currentgeometry.x += dx;
                currentgeometry.y += dy;
                model.setGeometry(cell, currentgeometry);
            });
            
            excludeNodes.forEach((cell) => {
                let currentgeometry = model.getGeometry(cell.excell);
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
            let morph = new mxMorphing(graph);
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

    /***
     * Apply mxHierarchicalLayout layout to a narrative group
     */
    static applyLayout(narrative, graph, dx, dy, callback, change, post){
        if(NarrativeLayout.isNarrativeEvidenceOnly(narrative)){
            NarrativeLayout.applyLayoutEvidenceGroup(narrative, graph, dx, dy, callback, change, post);
        }else{
            NarrativeLayout.applyLayoutHierarchical(narrative, graph, dx, dy, callback, change, post);
        }
        
    }
}
