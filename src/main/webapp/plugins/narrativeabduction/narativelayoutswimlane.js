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
        this.verticalLaneSpace = 10;        
        this.lanelabelstyle = "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;flipV=0;direction=south;horizontal=0;fontSize=30;fontStyle=0;fontFamily=Helvetica;connectable=0;allowArrows=0;editable=1;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;pointerEvents=0;expand=0;recursiveResize=0;"; 
        this.laneboundstlye = "connectable=0;editable=1;moveable=0;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#D4D4D4;fillColor=#F0F0F0;strokeWidth=3;perimeterSpacing=3;dashed=1;";
        this.initiate();
        this.updateLayout();
    }

    initListenerNewNarrative= function() {
        var t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWNARRATIVE, function(evt){
            console.log("EVT", evt);
            var data = evt.detail;

            var narrative = data.narrative;
            if(narrative){
                t.assignTopLane(narrative);
                t.addAssignButtons(narrative);
                t.updateLaneViews();
            }
        })  
    }

    remove = function(){
        //remove cells
        var graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                graph.getModel().remove(this.toplane.boundcell);
                graph.getModel().remove(this.midlane.boundcell);
                graph.getModel().remove(this.botlane.boundcell);

                graph.getModel().remove(this.toplane.labelcell);
                graph.getModel().remove(this.midlane.labelcell);
                graph.getModel().remove(this.botlane.labelcell);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
        this.removeLane(this.toplane);
        this.removeLane(this.midlane);
        this.removeLane(this.botlane);
    }

    removeLane = function(lane){
        lane.uis.forEach(element => {
            element.remove();
        });
        var children = Array.from(lane.container.children); 
        console.log("children", children);
        children.forEach(child => {
            this.app.narrativeaviewscontainer.listcontainer.append(child);
        });        

        lane.container.remove();
    }

    createLabelCell = function(value, lane){
        var boundcell = lane.boundcell;
        var yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 100;
        var graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                var labelVertex = graph.insertVertex(graph.getDefaultParent(), null, '', -100, yPos, 100, 200);
                labelVertex.setStyle(this.lanelabelstyle);  
                labelVertex.setValue(value);    
                lane.labelcell = labelVertex;
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    updateLabelPosition = function(lane){
        var boundcell = lane.boundcell;
        var yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 100;
        var graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                var geom = lane.labelcell.geometry;
                geom.y = yPos;
                graph.getModel().setGeometry(lane.labelcell, geom);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    initListenerNewDocumentItem = function(){
        var t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, function(evt){
            console.log("New document item", evt);
            var data = evt.detail;

            var narrative = data.narrative;
            var lane = t.getNarrativeLane(narrative);
            if(lane){
                t.updateLayout();
            }
        })  
    }

    initOverrideUpDowButton = function(){
        var t = this;
        this.app.narrativeaviewscontainer.moveUp = function(narrative){
            t.moveUp(narrative);
        }
        this.app.narrativeaviewscontainer.moveDown = function(narrative){
            t.moveDown(narrative);
        }
    }
    
    moveUp = function(narrative){
        var listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        var lane = this.getNarrativeLane(narrative);
        var currentIdx = lane.narratives.indexOf(narrative);
        var targetIdx = currentIdx - 1;        
        var na2 = lane.narratives[targetIdx];
        if(na2){
            var targetView = this.app.narrativeaviewscontainer.getListViewByNarrative(na2);
            this.app.narrativeaviewscontainer.swapElementsPositions(listView, targetView);
            this.swapNarrativesPositions(narrative, na2, lane);
            var t = this;
            this.updateLayout(function(){
                t.updateLaneCell(lane);
            });
            
        }
        
    }
  
    moveDown = function(narrative){
        var listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        var lane = this.getNarrativeLane(narrative);
        var currentIdx = lane.narratives.indexOf(narrative);
        var targetIdx = currentIdx + 1;        
        var na2 = lane.narratives[targetIdx];
        if(na2){
            var targetView = this.app.narrativeaviewscontainer.getListViewByNarrative(na2);
            this.app.narrativeaviewscontainer.swapElementsPositions(targetView, listView);
            this.swapNarrativesPositions(narrative, na2, lane);
             var t = this;
            this.updateLayout(function(){
                t.updateLaneCell(lane);
            });
        }
    }

    swapNarrativesPositions = function(na1, na2, lane){
        var tmp = na1;
        var idx1 = lane.narratives.indexOf(na1);
        var idx2 = lane.narratives.indexOf(na2);
        lane.narratives[idx1] = na2;
        lane.narratives[idx2] = tmp;
    }

    initiate = function(){
        this.toplane.narratives = this.app.narratives;
        console.log("narratives", this.app.narratives);
        this.createLaneContainer(this.toplane, "<b>Top Lane</b>");
        this.createLaneContainer(this.midlane, "<b>Middle Lane</b>");
        this.createLaneContainer(this.botlane, "<b>Bottom Lane</b>");
        this.app.narrativeaviewscontainer.listcontainer.append(this.toplane.container);
        this.app.narrativeaviewscontainer.listcontainer.append(this.midlane.container);
        this.app.narrativeaviewscontainer.listcontainer.append(this.botlane.container);

        this.updateLaneViews();
        this.updateLaneCells();
        this.createAssignButtons();

        this.createLabelCell("Top lane", this.toplane);
        this.createLabelCell("Middle lane", this.midlane);
        this.createLabelCell("Bottom lane", this.botlane);

        this.initListenerNewNarrative();
        this.initOverrideUpDowButton();
        this.initListenerNewDocumentItem();
    }

    updateLaneViews = function(){
        var t = this;
        this.toplane.narratives.forEach(narrative => {
            var lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.toplane.container.append(lv.container);
        });
        this.midlane.narratives.forEach(narrative => {
            var lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.midlane.container.append(lv.container);
        });
        this.botlane.narratives.forEach(narrative => {
            var lv = t.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
            if(lv) t.botlane.container.append(lv.container);
        });
    }

    createAssignButtons = function(){
        var t = this;
        this.app.narratives.forEach(narrative => {
            t.addAssignButtons(narrative);
        });
    }

    createLaneContainer = function(lane, label){
        lane.container = document.createElement("div");
        lane.container.style.padding = "2px";
        var title = document.createElement("div");
        title.innerHTML = label;
        lane.container.append(title);
        lane.uis.push(title);
    }

    addAssignButtons = function(narrative){
        var listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        var t = this;

        if(listView){              
                var btnATop = document.createElement("button");
                btnATop.innerHTML = "T";
                btnATop.title = "Move group to Top Lane";
                btnATop.onclick = function () {
                        t.assignTopLane(narrative);                    
                };

                //mid
                var btnAMid = document.createElement("button");
                btnAMid.innerHTML = "M";
                btnAMid.title = "Move group to Middle Lane";
                btnAMid.onclick = function () {
                       t.assignMidLane(narrative);
                
                };

                //mid
                var btnABot = document.createElement("button");
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

    getNarrativeLane = function(narrative){
        if(this.toplane.narratives.includes(narrative)) return this.toplane;
        if(this.midlane.narratives.includes(narrative)) return this.midlane;
        if(this.botlane.narratives.includes(narrative)) return this.botlane;
        return null;
    }

    assignTopLane = function(narrative){
        this.assignToLane(narrative, this.toplane);
    }

    assignMidLane = function(narrative){
        this.assignToLane(narrative, this.midlane);
    }

    assignBotLane = function(narrative){
        this.assignToLane(narrative, this.botlane);
    }

    assignToLane = function(narrative, lane){
        //remove from previous lane
        this.app.narratives.forEach(element => {
            console.log("all narratives", element);

        });

        var prevLane = this.getNarrativeLane(narrative);
        if(prevLane != null) prevLane.narratives =  NAUtil.RemoveElementArray(prevLane.narratives.indexOf(narrative), prevLane.narratives);

        //assign to new lane.
        lane.narratives.push(narrative); 

        //move view
        var listView = this.app.narrativeaviewscontainer.getListViewByNarrative(narrative);
        if(listView)
        lane.container.append(listView.container);
        this.updateLayout();
        this.app.narratives.forEach(element => {
            console.log("all narratives after", element);
        });
    }

    updateLaneCells = function(){
        this.updateLaneCell(this.toplane, 1);
        this.updateLaneCell(this.midlane, 2);
        this.updateLaneCell(this.botlane, 3);
    }

    getLaneHeight = function(lane){
        var height = 0;
        var t = this;
        lane.narratives.forEach(narrative => {
            console.log("Narrative", narrative);
            narrative.updateCellsBound();
            if(narrative.bound){
                height += narrative.bound.height;
            }
            
            height += t.verticalspace; 
        });

        return height;
    }

    getLaneHeightAdjusted = function(lane){
        return Math.max(200, this.getLaneHeight(lane));
    }

    getLaneWidth = function(lane){
        var maxWidth = 0;
        lane.narratives.forEach(narrative => {
            if(narrative.bound && narrative.bound.width > maxWidth){
                maxWidth = narrative.bound.width;
            }
        });
        maxWidth += this.horizontalspacebetweennarrativeandlayout;
        return maxWidth;
    }

    updateLaneCell = function(lane, order){
        var graph = this.graph;
        //get the max width and height
        var maxWidth = Math.max(200, this.getLaneWidth(lane));
        var height = Math.max(200, this.getLaneHeight(lane));
        var prevHeight = 0;
        switch(order){
            case 2:
                prevHeight = this.getLaneHeightAdjusted(this.toplane);
                break;
            case 3: 
                prevHeight = this.getLaneHeightAdjusted(this.toplane) + this.getLaneHeightAdjusted(this.midlane);                
        }
        var yPos = prevHeight;       

        if(!lane.boundcell){
            graph.getModel().beginUpdate();
            try{
                var vertex = graph.insertVertex(graph.getDefaultParent(), null, '', 0, yPos, maxWidth, height);
                vertex.setStyle(this.laneboundstlye);
                lane.boundcell = vertex;
                graph.orderCells(true, [vertex]);
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
            }
        }else{
            graph.getModel().beginUpdate();
            try{
                var geometry = lane.boundcell.geometry;
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

    
    updateLayout = function(callback){
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
    updateNarrativeCellsLayoutLane = function(lane){
        var layoutdata = [];      
        var originY = lane.boundcell.geometry.y;
        var sumY = originY;      
        for(var i = 0; i < lane.narratives.length; i++){
            var narrative = lane.narratives[i];
            narrative.updateCellsBound();
            //narrative can have not cell

            var posY = sumY;
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

    updateNarrativeCellsLayout = function(){
        this.narrativecellslayout = [];
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.toplane));
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.midlane));
        this.narrativecellslayout = this.narrativecellslayout.concat(this.updateNarrativeCellsLayoutLane(this.botlane));

        console.log("this.toptlane.narratives", this.updateNarrativeCellsLayoutLane(this.toplane));
        console.log("this.midlane.narratives", this.updateNarrativeCellsLayoutLane(this.midlane));
        console.log("this.botlane.narratives", this.updateNarrativeCellsLayoutLane(this.botlane));
        console.log("this.narrativecellslayout", this.narrativecellslayout);

    }


}