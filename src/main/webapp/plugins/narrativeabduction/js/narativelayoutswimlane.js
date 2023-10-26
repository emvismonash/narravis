class NarrativeLayoutSwimlanes extends NarrativeLayout{
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
        this.minWidth = 900;
        this.verticalLaneSpace = 10;        
        this.lanelabelstyle = "text;html=1;strokeColor=none;fillColor=none;align=center;locked=1;verticalAlign=middle;whiteSpace=wrap;rounded=0;flipV=0;direction=south;horizontal=0;fontSize=30;fontStyle=0;fontFamily=Helvetica;connectable=0;allowArrows=0;editable=1;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;pointerEvents=0;expand=0;recursiveResize=0;"; 
        this.laneboundstlye = "connectable=0;moveable=0;movable=0;resizable=0;rotatable=0;deletable=0;locked=1;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#D4D4D4;fillColor=default;strokeWidth=3;perimeterSpacing=3;dashed=1;fillStyle=zigzag-line;comic=0;container=0;collapsible=0;dropTarget=0;gradientColor=none;;";
        this.remove();
        this.initiate();
    }

    
    initiate(){
        this.toplane.narratives = this.app.narratives;
        console.log("narratives", this.app.narratives);

        if(!this.toplane.container) this.createLaneContainer(this.toplane, "<b>Top Lane</b>");
        if(!this.midlane.container) this.createLaneContainer(this.midlane, "<b>Middle Lane</b>");
        if(!this.botlane.container) this.createLaneContainer(this.botlane, "<b>Bottom Lane</b>");
        this.app.narrativeaviewscontainer.listcontainer.append(this.toplane.container);
        this.app.narrativeaviewscontainer.listcontainer.append(this.midlane.container);
        this.app.narrativeaviewscontainer.listcontainer.append(this.botlane.container);

        this.updateLaneViews();
        this.createLaneCells();
        this.createAssignButtons();

        // this.createLabelCell("Top lane", this.toplane);
        // this.createLabelCell("Middle lane", this.midlane);
        // this.createLabelCell("Bottom lane", this.botlane);

        this.initListenerNewNarrative();
        this.initOverrideUpDowButton();
        this.initListenerNewDocumentItem();
    }

    addAssignButtons(narrative){
        let listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        let t = this;

        if(listView){              
                let btnATop = document.createElement("button");
                btnATop.innerHTML = "T";
                btnATop.title = "Move group to Top Lane";
                btnATop.onclick = function () {
                        t.assignTopLane(narrative);                    
                };

                //mid
                let btnAMid = document.createElement("button");
                btnAMid.innerHTML = "M";
                btnAMid.title = "Move group to Middle Lane";
                btnAMid.onclick = function () {
                       t.assignMidLane(narrative);
                
                };

                //mid
                let btnABot = document.createElement("button");
                btnABot.innerHTML = "B";
                btnABot.title = "Move group to Bottom Lane";
                btnABot.onclick = function () {
                       t.assignBotLane(narrative);                
                };

                this.toplane.uis.push(btnATop);
                this.midlane.uis.push(btnAMid);
                this.botlane.uis.push(btnABot);

                listView.headContainer.bottompart.append(btnATop);
                listView.headContainer.bottompart.append(btnAMid);
                listView.headContainer.bottompart.append(btnABot);
        }
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
        //remove from previous lane
        this.app.narratives.forEach(element => {
            console.log("all narratives", element);

        });

        let prevLane = this.getNarrativeLane(narrative);
        if(prevLane != null) prevLane.narratives =  NAUtil.RemoveElementArray(prevLane.narratives.indexOf(narrative), prevLane.narratives);

        //assign to new lane.
        lane.narratives.push(narrative); 

        //move view
        let listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        if(listView)
        lane.container.append(listView.container);
        this.updateLayout();
        this.app.narratives.forEach(element => {
            console.log("all narratives after", element);
        });
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
        let maxWidth = this.getLaneWidth(lane);
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

    createAssignButtons(){
        let t = this;
        this.app.narratives.forEach(narrative => {
            t.addAssignButtons(narrative);
        });
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


    getLaneHeight(lane){
        let height = 0;
        let t = this;
        lane.narratives.forEach(narrative => {
            console.log("Narrative", narrative);
            narrative.updateCellsBound();
            if(narrative.bound){
                height += narrative.bound.height;
            }
            
            height += t.verticalspace; 
        });
        if(height < this.minHeight) height = this.minHeight;
        return height;
    }

    getLaneHeightAdjusted(lane){
        return Math.max(200, this.getLaneHeight(lane));
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

    initListenerNewDocumentItem(){
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, function(evt){
            console.log("New document item", evt);
            let data = evt.detail;

            let narrative = data.narrative;
            let lane = t.getNarrativeLane(narrative);
            if(lane){
                t.updateLayout();
            }
        })  
    }

    
    initListenerNewNarrative() {
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWNARRATIVE, function(evt){
            console.log("EVT", evt);
            let data = evt.detail;

            let narrative = data.narrative;
            if(narrative){
                t.assignTopLane(narrative);
                t.addAssignButtons(narrative);
                t.updateLaneViews();
            }
        })  
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
        let maxWidth = this.getLaneWidth(lane);
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
        this.updateLaneCells();
        this.applyLayoutNarrativeCellsNaive(()=>{
            this.updateNarrativeCellsYPositions(() =>{
                this.toplane.narratives.forEach(narrative => {
                       this.applyLayout(narrative);
                 });  
                 this.midlane.narratives.forEach(narrative => {
                    this.applyLayout(narrative);
                }); 
                this.botlane.narratives.forEach(narrative => {
                    this.applyLayout(narrative);
                }); 
                if(callback) callback();
            });
        })
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

        console.log("this.toptlane.narratives", this.updateNarrativeCellsLayoutLane(this.toplane));
        console.log("this.midlane.narratives", this.updateNarrativeCellsLayoutLane(this.midlane));
        console.log("this.botlane.narratives", this.updateNarrativeCellsLayoutLane(this.botlane));
        console.log("this.narrativecellslayout", this.narrativecellslayout);

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

        //bring back move up and down, currently very ugly approach
        let t = this;
        let nlc = this.app.narrativeaviewscontainer;
        this.app.narrativeaviewscontainer.moveUp = function(narrative){
            let listView = nlc.getListViewByNarrative(narrative);
            let currentIdx = nlc.narrativealistviews.indexOf(listView);
            let targetIdx = currentIdx - 1;        
            if(nlc.narrativealistviews[targetIdx]){
                nlc.swapElementsPositions(listView, nlc.narrativealistviews[targetIdx]);
                nlc.app.narrativelayout.updateLayout([narrative, nlc.narrativealistviews[targetIdx].narrative]);
            }
        }
        this.app.narrativeaviewscontainer.moveDown = function(narrative){
            let listView = nlc.getListViewByNarrative(narrative);
            let currentIdx = nlc.narrativealistviews.indexOf(listView);
            let targetIdx = currentIdx + 1;        
      
            if(nlc.narrativealistviews[targetIdx]){
                nlc.swapElementsPositions(nlc.narrativealistviews[targetIdx], listView);
                nlc.app.narrativelayout.updateLayout([narrative, nlc.narrativealistviews[targetIdx].narrative]);
            }  
        }
    }

    removeLane(lane){
        lane.uis.forEach(element => {
            element.remove();
        });        
        let children;
        if(lane.container && lane.container.children) children = Array.from(lane.container.children); 
        console.log("Remove lane", children);
        if(children)
        children.forEach(child => {
            this.app.narrativeaviewscontainer.listcontainer.append(child);
        });        

        if(lane.container) lane.container.remove();
    }



}