class NarrativeLayoutSwimlane extends NarrativeLayout{
    constructor(app) {
        super(app);
        this.toplane = {
            container: null,
            boundcell: null,
            labelcell: null,
            narratives: [],
            uis: []
        };
        this.midlane = {
            container: null,
            boundcell: null,
            labelcell: null,
            narratives: [],
            uis: []
        }
        this.botlane = {
            container: null,
            boundcell: null,
            labelcell: null, 
            narratives: [],
            uis: []
        };        
        this.minHeight = 200;
        this.minWidth = 10;
        this.verticalLaneSpace = 10;        
        this.lanelabelstyle = "text;html=1;strokeColor=none;fillColor=none;align=center;locked=1;verticalAlign=middle;whiteSpace=wrap;rounded=0;flipV=0;direction=south;horizontal=0;fontSize=20;fontStyle=0;fontFamily=Helvetica;connectable=0;allowArrows=0;editable=1;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;pointerEvents=0;expand=0;recursiveResize=0;"; 
        this.laneboundstlye = "connectable=1;moveable=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#E6D0DE;fillColor=#dae8fc;strokeWidth=2;perimeterSpacing=3;fillStyle=solid;comic=0;container=0;collapsible=0;dropTarget=0;;editable=1;";
        this.initiate();
    }

    
    initiate(){
        this.toplane.narratives = this.app.narratives;

        if(this.toplane.container) this.toplane.container.remove();
        if(this.midlane.container) this.midlane.container.remove();
        if(this.botlane.container) this.botlane.container.remove();

        this.createLaneContainer(this.toplane, "<b>Top narratives</b>");
        this.app.narrativeaviewscontainer.listcontainer.append(this.toplane.container);
        this.createLaneContainer(this.midlane, "<b>Common evidence</b>");
        this.app.narrativeaviewscontainer.listcontainer.append(this.midlane.container);
        this.createLaneContainer(this.botlane, "<b>Bottom narratives</b>");
        this.app.narrativeaviewscontainer.listcontainer.append(this.botlane.container);

        this.updateLaneViews();
        this.createLaneCells();

         this.createLabelCell("Top narratives", this.toplane);
         this.createLabelCell("Common evidence", this.midlane);
         this.createLabelCell("Bottom narratives", this.botlane);

        this.initListenerNewDocument();
        this.initOverrideUpDowButton();
    }
    
    assignTopLane(narrative){
        this.assignToLane(narrative, this.toplane);
    }

    assignMidLane(narrative){
        this.assignToLane(narrative, this.midlane);
    }

    assignBotLane(narrative){
        this.assignToLane(narrative, this.botlane);
    }

    assignToLane(narrative, lane){
        let prevLane = this.getNarrativeLane(narrative);
        if(prevLane != null) prevLane.narratives =  NAUtil.RemoveElementArray(prevLane.narratives.indexOf(narrative), prevLane.narratives);

        //assign to new lane.
        lane.narratives.push(narrative); 

        //move view
        let listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        if(listView)
        lane.container.append(listView.container);
        this.updateLayout();
    }


    createLabelCell(value, lane){
        let boundcell = lane.boundcell;
        let yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 100;
        let graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                let labelVertex = graph.insertVertex(graph.getDefaultParent(), null, '', -100, yPos, 100, 200);
                labelVertex.setStyle(this.lanelabelstyle);  
                labelVertex.setValue(value);    
                lane.labelcell = labelVertex;
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    createLaneCell(lane, order){
        let graph = this.graph;
        let maxWidth = this.minWidth;
        let height = this.getLaneHeight(lane);
        let yPos = this.getYPos(order);    
        graph.getModel().beginUpdate();
        try{
            let vertex = graph.insertVertex(graph.getDefaultParent(), null, '', 0, yPos, maxWidth, height);
            vertex.setStyle(this.laneboundstlye);
            lane.boundcell = vertex;
            graph.orderCells(true, [vertex]);
            graph.setCellStyles(mxConstants.STYLE_EDITABLE, '0', [vertex]);
        }finally{
          graph.getModel().endUpdate(); 
          graph.refresh();             
        }
    }


    createLaneCells(){
        this.createLaneCell(this.toplane, 1);
        this.createLaneCell(this.midlane, 2);
        this.createLaneCell(this.botlane, 3);
    }

    createLaneContainer(lane, label){
        lane.container = document.createElement("div");
        lane.container.style.padding = "2px";
        let title = document.createElement("div");
        title.innerHTML = label;
        lane.container.append(title);
        lane.uis.push(title);
    }


    getNarrativeLane(narrative){
        if(this.toplane.narratives.includes(narrative)) return this.toplane;
        if(this.midlane.narratives.includes(narrative)) return this.midlane;
        if(this.botlane.narratives.includes(narrative)) return this.botlane;
        return null;
    }

    getYPos(order){
        let prevHeight = 0;
        switch(order){
            case 2:
                prevHeight = this.getLaneHeightAdjusted(this.toplane);
                break;
            case 3: 
                prevHeight = this.getLaneHeightAdjusted(this.toplane) + this.getLaneHeightAdjusted(this.midlane);                
        }
        return prevHeight; 
    }


    /**
     * The lane height is calculated based on the narrative bound's height and vertical spacing. 
     * @param {*} lane 
     * @returns 
     */
    getLaneHeight(lane){
        let height = 0;
        lane.narratives.forEach(narrative => {
            narrative.updateCellsBound();
            if(narrative.bound){
                height += narrative.bound.height;
            }            
            height += this.verticalspace; 
        });
        //set minimun height
        height = Math.max(this.minHeight, height);
        return height;
    }

    getLaneHeightAdjusted(lane){
        return Math.max(this.minHeight, this.getLaneHeight(lane));
    }

    getLaneWidth(lane){
        let maxWidth = 0;
        lane.narratives.forEach(narrative => {
            if(narrative.bound && narrative.bound.width > maxWidth){
                maxWidth = narrative.bound.width;
            }
        });
        if(maxWidth < this.minWidth) maxWidth = this.minWidth;
        maxWidth += this.horizontalspacebetweennarrativeandlayout;
        return maxWidth;
    }

    /**
     * Determine the closest lane based on the given y position
     * @param {} yPos 
     */
    getLaneByPosition(yPos){
        let topCellGeom = this.toplane.boundcell.geometry;
        let botCellGeom = this.botlane.boundcell.geometry;

        let topY = topCellGeom.y + (topCellGeom.height * 0.5);
        let botY = botCellGeom.y + (botCellGeom.height * 0.5);

        if(Math.abs(yPos - topY) < Math.abs(yPos - botY)){
            return this.toplane;
        }else{
            return this.botlane;
        }
    }

    initOverrideUpDowButton(){
        let t = this;
        this.app.narrativeaviewscontainer.moveUp = function(narrative){
            t.moveUp(narrative);
        }
        this.app.narrativeaviewscontainer.moveDown = function(narrative){
            t.moveDown(narrative);
        }
    }
    
    initListenerNewDocument() {
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, function(evt){
            let data = evt.detail;
            let narrative = data.narrative;
            if(narrative){

                if(!t.isNarrativeInLane(narrative, t.botlane)){
                    let cell = data.cell;


                    let lane = t.getLaneByPosition(cell.geometry.y + (cell.geometry.height * 0.5));
                    t.assignToLane(narrative, lane);
                }
                t.updateLayout();
                t.updateLaneViews();
            }
        })  
    }

    isNarrativeInAnyLane(narrative){
        return (this.isNarrativeInLane(narrative, this.toplane) || this.isNarrativeInLane(narrative, this.midlane) || this.isNarrativeInLane(narrative, this.botlane));
    }

    isNarrativeInLane(narrative, lane){
        return (lane.narratives.includes(narrative));
    }

    moveUp(narrative){
        let listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        let lane = this.getNarrativeLane(narrative);
        let currentIdx = lane.narratives.indexOf(narrative);
        let targetIdx = currentIdx - 1;        
        let na2 = lane.narratives[targetIdx];
        if(na2){
            let targetView = this.app.narrativeaviewscontainer.getListViewByNarrative(na2);
            this.app.narrativeaviewscontainer.swapElementsPositions(listView, targetView);
            this.swapNarrativesPositions(narrative, na2, lane);
            let t = this;
            this.updateLayout(function(){
                t.updateLaneCell(lane);
            });
            
        }
        
    }
  
    moveDown(narrative){
        let listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        let lane = this.getNarrativeLane(narrative);
        let currentIdx = lane.narratives.indexOf(narrative);
        let targetIdx = currentIdx + 1;        
        let na2 = lane.narratives[targetIdx];
        if(na2){
            let targetView = this.app.narrativeaviewscontainer.getListViewByNarrative(na2);
            this.app.narrativeaviewscontainer.swapElementsPositions(targetView, listView);
            this.swapNarrativesPositions(narrative, na2, lane);
             let t = this;
            this.updateLayout(function(){
                t.updateLaneCell(lane);
            });
        }
    }

    swapNarrativesPositions(na1, na2, lane){
        let tmp = na1;
        let idx1 = lane.narratives.indexOf(na1);
        let idx2 = lane.narratives.indexOf(na2);
        lane.narratives[idx1] = na2;
        lane.narratives[idx2] = tmp;
    }
 
    updateLaneViews(){
        let t = this;
        this.toplane.narratives.forEach(narrative => {
            let lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.toplane.container.append(lv.container);
        });
        this.midlane.narratives.forEach(narrative => {
            let lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.midlane.container.append(lv.container);
        });
        this.botlane.narratives.forEach(narrative => {
            let lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.botlane.container.append(lv.container);
        });
    }

    updateLabelPosition(lane){
        if(!lane.labelcell) return;
        let boundcell = lane.boundcell;
        let yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 100;
        let graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                let geom = lane.labelcell.geometry;
                geom.y = yPos;
                graph.getModel().setGeometry(lane.labelcell, geom);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    updateLaneCells(){
        this.updateLaneCell(this.toplane, 1);
        this.updateLaneCell(this.midlane, 2);
        this.updateLaneCell(this.botlane, 3);
    }

    updateLaneCell(lane, order){
        let graph = this.graph;
        let yPos = this.getYPos(order);
        let height = this.getLaneHeight(lane);
        let maxWidth = this.minWidth;
        //get the max width and height
        if(lane.boundcell){           
            graph.getModel().beginUpdate();
            try{
                let geometry = lane.boundcell.geometry;
                geometry.y = yPos;
                geometry.height = height;
                geometry.width = maxWidth;
                graph.getModel().setGeometry(this.boundcell, geometry);
                graph.orderCells(true, [this.boundcell]);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
              this.updateLabelPosition(lane);
            }
        }
    }

    
    updateLayout(callback){
        // this.updateLaneCells();
        // this.applyLayoutNarrativeCellsNaive(()=>{
        //     this.updateNarrativeCellsYPositions(() =>{
        //         this.toplane.narratives.forEach(narrative => {
        //                this.applyLayout(narrative);
        //          });  
        //          this.midlane.narratives.forEach(narrative => {
        //             this.applyLayout(narrative);
        //         }); 
        //         this.botlane.narratives.forEach(narrative => {
        //             this.applyLayout(narrative);
        //         });
        //         NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {}); 
        //         if(callback) callback();
        //     });
        // })

        this.applyLayoutNarrativeCellsNaive(()=>{
            // this.updateNarrativeCellsYPositions(() =>{
            //     NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {}); 
            //     if(callback) callback();
            // });
        })

        this.toplane.narratives.forEach(narrative => {
            this.applyLayout(narrative);
        });  
    }
    updateNarrativeCellsLayoutLane(lane){
        let layoutdata = [];      
        let originY = lane.boundcell.geometry.y;
        let sumY = originY;      
        for(let i = 0; i < lane.narratives.length; i++){
            let narrative = lane.narratives[i];
            narrative.updateCellsBound();
            //narrative can have not cell

            let posY = sumY;
            if(narrative.bound) {
                sumY += narrative.bound.height + this.verticalspace;
            }
            layoutdata.push({
                nacell: narrative.rootCell,
                lane: lane,
                positionY: posY 
            });
        }

        return layoutdata;
    }

    updateNarrativeCellsLayout(){
        this.narrativecellslayout = [];
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.toplane));
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.midlane));
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.botlane));
    }
    
    removeLaneCells(){
        let graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                graph.getModel().remove(this.toplane.boundcell);
                graph.getModel().remove(this.midlane.boundcell);
                graph.getModel().remove(this.botlane.boundcell);

                if(this.toplane.labelcell) graph.getModel().remove(this.toplane.labelcell);
                if(this.midlane.labelcell) graph.getModel().remove(this.midlane.labelcell);
                if(this.botlane.labelcell) graph.getModel().remove(this.botlane.labelcell);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    remove(){
        //remove cells
        this.removeLaneCells();
        this.removeLane(this.toplane);
        this.removeLane(this.midlane);
        this.removeLane(this.botlane);       
    }

    removeLane(lane){
        lane.uis.forEach(element => {
            element.remove();
        });        
        let children;
        if(lane.container && lane.container.children) children = Array.from(lane.container.children); 
        if(children)
        children.forEach(child => {
            this.app.narrativeaviewscontainer.listcontainer.append(child);
        });        

        if(lane.container) lane.container.remove();
    }



}