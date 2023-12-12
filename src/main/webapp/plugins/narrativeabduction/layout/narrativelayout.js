/**
 * A static class to handle the layout
 */
class NarrativeLayout {
    
    static applyLayoutEvidenceGroup(narrative, graph, dx, dy, callback, change, post){
        
        let model = graph.getModel();
        let targetCells = narrative.cells; // Array of parent node cells
        let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
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
                let currentgeometry = cell.geometry;
                currentgeometry.y += dy;
                currentgeometry.x += dx;
                  //get edte
                  let edges = graph.getEdges(cell);
                  //get the middle position
                  let sum = 0;
                  edges.forEach(edge => {
                      //get connected x
                      sum += edge.source.geometry.x;
                  });    
                  let resx = (edges.length == 0)? currentgeometry.x: sum/edges.length;
                  currentgeometry.x = resx;
            });

            //remove overlaps 
            let rects = [];
            targetCells.forEach(cell => {
                let edges = model.getEdges(cell);
                rects.push({
                    x: cell.geometry.x,
                    y: cell.geometry.y,
                    width: cell.geometry.width,
                    height: cell.geometry.height,
                    edges: edges
                })
            });
            //update excluded cells position            
            //let results = NarrativeLayout.removeOverlapsHorizontal(rects);
            let results = NarrativeLayout.removeOverlapsCola(rects);

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
        if(!dx || !dy){
            dx = narrative.rootcell.geometry.x + narrative.rootcell.geometry.width + 50;
            dy = narrative.rootcell.geometry.y;
        }
        if(NarrativeLayout.isNarrativeEvidenceOnly(narrative)){
            NarrativeLayout.applyLayoutEvidenceGroup(narrative, graph, dx, dy, callback, change, post);
        }else{
            NarrativeLayout.applyLayoutHierarchical(narrative, graph, dx, dy, callback, change, post);
        }
        
    }


    static applyCellsLayout(graph, model, cells, dx, dy, callback, change, post){
        //update excluded cells position
        let targetCells = cells; // Array of parent node cells
        let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        layout.edgeStyle = mxHierarchicalLayout.prototype.ORTHOGONAL_EDGE_STYLE;
        let excludeNodes = NarrativeLayout.getExcludedCells(graph, targetCells);

        dx = (dx == undefined)? 0: dx;
        dy = (dy == undefined)? 0: dy;

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



    static isNarrativeEvidenceOnly(narrative){
        let res = true;
        narrative.cells.forEach(cell => {
            if(!NarrativeAbductionApp.isCellDocumentItemType(cell, NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE)){
                res = false;
            }
        });

        return res;
    }

    static removeOverlapsCola(rects) {
        var rs = [];
        rects.forEach(function (r) {
            let x = r.x + Math.random(); 
            let y = r.y + Math.random();
            let w = r.width;
            let h = r.height;
            rs.push(new cola.Rectangle(x, x + w, y, y + h));
        });
        
        cola.removeOverlaps(rs);
        return rs;
    }
}
