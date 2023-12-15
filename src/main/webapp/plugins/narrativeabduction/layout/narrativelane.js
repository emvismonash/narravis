class NarrativeLane {
    constructor(graph, name, id, growdirection, app){
        this.app = app;
        this.narratives = [];
        this.container; // this is the container on the side menu
        this.boundcell; // this is the indicator
        this.rootcell; //this is the label
        this.growdirection = growdirection;
        this.graph = graph;
        this.minheight = 120;
        this.margin = 10;
        this.name = name;
        this.id = id;
        this.rootid = id+"root";
        this.boundid = id+"bound";
        this.lanelabelstyle = "text;html=1;strokeColor=none;fillColor=none;align=center;locked=1;verticalAlign=middle;whiteSpace=wrap;rounded=0;flipV=0;direction=south;horizontal=0;fontSize=20;fontStyle=0;fontFamily=Helvetica;connectable=0;allowArrows=0;editable=1;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;pointerEvents=0;expand=0;recursiveResize=0;fontColor=#c0c0c0;"; 
        this.laneboundstyle = "connectable=1;moveable=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#E6D0DE;fillColor=#ddd;strokeWidth=2;perimeterSpacing=3;fillStyle=solid;comic=0;container=0;collapsible=0;dropTarget=0;;editable=1;movable=0;rotatable=0;";
    }
    
    static GROWDIRECTION = {
        UPWARD:"upward",
        EQUAL: "equal",
        DOWNWARD: "downward"
    }

    initiate(){
        this.createLaneCell();
        this.createLabelCell();
        this.initListenerNarrativeMoved();
    }

    assignNarrative(narrative){        
       if(!this.narratives.includes(narrative)) this.narratives.push(narrative); 
    }

    createLabelCell(){
        let boundcell = this.boundcell;
        let yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 20;
        let graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                let labelVertex = graph.insertVertex(graph.getDefaultParent(), null, '', -100, yPos, 100, this.minheight);
                labelVertex.setStyle(this.lanelabelstyle);  
                labelVertex.setValue(this.name);   
                labelVertex.id = this.rootid;
                labelVertex.setAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE, NASettings.Dictionary.ATTRIBUTES.SWIMLANELABEL);
                this.rootcell = labelVertex;
            }finally{
              graph.getModel().endUpdate(); 
              graph.refresh();             
        }
    }

    createLaneCell(){
        let graph = this.graph;
        let maxWidth = 10;
        let height = this.getLaneHeight();
        let yPos = 0;    
        graph.getModel().beginUpdate();
        try{
            let vertex = graph.insertVertex(graph.getDefaultParent(), null, '', 0, yPos, maxWidth, height);
            vertex.setStyle(this.laneboundstyle);
            vertex.geometry.width = maxWidth;
            vertex.setAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE, NASettings.Dictionary.ATTRIBUTES.SWIMLANEINDICATOR);
            vertex.id= this.boundid;
            this.boundcell = vertex;
            graph.orderCells(true, [vertex]);
            graph.setCellStyles(mxConstants.STYLE_EDITABLE, '0', [vertex]);
        }finally{
          graph.getModel().endUpdate(); 
          graph.refresh();             
        }
    }

    checkNarrativeInLane(narrative){
        if(narrative){
            if(this.isCellInLane(narrative.cells[0])){                
                if(!this.narratives.includes(narrative)){
                    this.assignNarrative(narrative);
                    NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {
                    });
                } 
            }
        }
    }
 
    /**
     * The lane height is calculated based on the narrative bound's height and vertical spacing. 
     * @param {*} lane 
     * @returns 
     */
    getLaneHeight(){
        let height = 0;
        if(this.narratives.length > 2) console.log("get lane height", this.narratives);
        this.narratives.forEach(narrative => {
            if(narrative){
                narrative.updateCellsBound();
                if(narrative.bound){
                    if(this.narratives.length > 2) console.log("narrative.rootcell", narrative.rootcell);
                    if(this.narratives.length > 2) console.log("narrative.rootcell.geometry.height", narrative.rootcell.geometry.height);
                    if(this.narratives.length > 2) console.log("narrative.bound.height", narrative.bound.height);

                    let h = Math.max(narrative.rootcell.geometry.height, narrative.bound.height);
                    height += h + this.margin;
                    if(this.narratives.length > 2) console.log("height", height);

                }
            }
            
        });
        //set minimun height
        if(this.narratives.length > 2) console.log("height", height);

        height = Math.max(this.minheight, height);
        return height;
    }

    initListenerNarrativeRemoved(){
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.DELETENARRATIVE, (evt)=>{
            let data = evt.detail;
            let narrative = data.narrative;
            this.narratives.splice(this.narratives.indexOf(narrative), 1);
            this.updateLaneLayout();
        });
    }

    initListenerNarrativeMoved(){
        let t = this;
        let graph = this.graph;
        graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt){
          let cells = evt.getProperty("cells");
          let dx = evt.getProperty("dx");
          let dy = evt.getProperty("dy");
          cells.forEach(cell => {
              if(Narrative.isCellNarrative(cell)){
                //if cell is narrative root and it is not in the list, add to the list
                  if(t.isCellInLane(cell)){
                    let na = t.app.getNarrativeFromRootCell(cell, t.narratives);
                    //if narrative is not part of existing lane, assign 
                    if(!t.narratives.includes(na)) {
                        t.assignNarrative(na)
                    }
                    //reorder
                    t.reorder();
                    t.updateLaneLayout();
                  }else{
                    let na = NAUtil.GetNarrativeFromCell(cell, t.narratives);
                    if(na) {
                        t.unAssignNarrative(na)
                        //reorder
                        t.reorder();
                        t.updateLaneLayout();
                    } 
                  }
              }
          });        
        })
    }

    initListenerNewDocument() {
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, function(evt){
            let data = evt.detail;
            let narrative = data.narrative;
            t.checkNarrativeInLane(narrative);
            t.updateLayout();
        })  
    }
    
    isCellInLane(cell){
        let top = this.boundcell.geometry.y;
        let bot = top + this.getLaneHeight();
        return (cell.geometry.y >= top && cell.geometry.y <= bot); 
    }

    /**
     * Move towards x and y direction
     * @param {*} x 
     * @param {*} y 
     */
    move(x, y){
        let graph = this.graph;
        graph.getModel().beginUpdate();
        try{
            //move label
            this.rootcell.geometry.x += x;
            this.rootcell.geometry.y += y;

            this.boundcell.geometry.x += x
            this.boundcell.geometry.y += y;

            //move narratives
            this.narratives.forEach(narrative => {
                narrative.moveTo(x, y);
            });
        }finally{
            graph.getModel().endUpdate();                    
        }
    }

    /**
     * update the stacked position of the narrative
     */
    updateNarrativesPositions(){
        this.graph.getModel().beginUpdate();
        try{
            let prevY =  this.boundcell.geometry.y;
            for(let i = 0; i < this.narratives.length; i++){
                let narrative = this.narratives[i];
                narrative.rootcell.geometry.y = prevY;
                narrative.rootcell.geometry.x = 10;
                if(NarrativeLayout.isNarrativeEvidenceOnly(narrative)) {
                    narrative.updateCellsPositions(false, true);
                }else{
                    narrative.updateCellsPositions();
                }

                prevY = Math.max(narrative.rootcell.geometry.y + narrative.rootcell.geometry.height, narrative.rootcell.geometry.y + narrative.bound.height);
                prevY += this.margin;
            };
        }finally{
            this.graph.getModel().endUpdate();      
        }
       
    }

    updateLayout(){
        this.narratives.forEach(narrative => {
            let dx = narrative.rootcell.geometry.x + narrative.rootcell.geometry.width + 50;
            let dy = narrative.rootcell.geometry.y;
            NarrativeLayout.applyLayout(narrative, this.graph, dx, dy);                  
      });  
      this.updateLaneLayout();
    }

    /**
     * Update the size of the lane indicator, and the position of the narrative
     */
    updateLaneLayout(){
        let currentheight = this.boundcell.geometry.height;
        //get the height
        let height = this.getLaneHeight();
        let diff = currentheight - height;
        let model = this.graph.getModel();
        this.graph.getModel().beginUpdate();
        try{
            //update height
            let boundgeom = model.getGeometry(this.boundcell);
            let rootgeom = model.getGeometry(this.rootcell);

            //move the root and indicator according to grow direction, 
            switch(this.growdirection){
                case NarrativeLane.GROWDIRECTION.UPWARD:
                    //move up of the height
                    boundgeom.y += diff;
                    rootgeom.geometry.y += diff;
                    break;
                case NarrativeLane.GROWDIRECTION.EQUAL:
                    //move up half of the height
                    boundgeom.y += diff * 0.5;
                    rootgeom.geometry.y += diff * 0.5;
                    break;
                case NarrativeLane.GROWDIRECTION.DOWNWARD:
                    boundgeom.height = height;
                    break;
            }

            model.setGeometry(this.boundcell, boundgeom);
            model.setGeometry(this.rootcell, rootgeom);

        }finally{
            // let morph = new mxMorphing(this.graph);
            // morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
            // {
                              
            // }));
            // morph.startAnimation();
            this.graph.getModel().endUpdate();      
            this.updateNarrativesPositions();  
            this.graph.refresh();
            NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {
            });       
        }
    }

    unAssignNarrative(narrative){
        this.narratives = NAUtil.RemoveElementArray(this.narratives.indexOf(narrative), this.narratives);
        NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, {
        });
    }

    /**
     * reorder the y position of the narrative
     */
    reorder(){
        let n = [];
        this.narratives.forEach(narrative => {
            n.push({
                na: narrative, 
                posY: narrative.rootcell.geometry.y
            })
        });
        n.sort((a, b) => a.posY - b.posY);
        this.narratives = [];
        n.forEach(elm => {
            this.narratives.push(elm.na)
        });
    }

    removeCells(){
        let graph = this.graph;
        let model = this.graph.getModel();      
        graph.getModel().beginUpdate();
        try{
            model.remove(this.rootcell);
            model.remove(this.boundcell);
        }finally{
            graph.getModel().endUpdate(); 
            graph.refresh();             
        }
    }

    resetLaneCellsReferences(){
        let model = this.graph.getModel();
        let rootId  = this.rootid;
        let boundid = this.boundid;

        let rootCell = model.getCell(rootId);
        this.rootcell = rootCell;

        let boundCell = model.getCell(boundid);
        this.boundcell = boundCell;
    }

    resetCells(){
        this.removeCells();
        this.initiate();
    }

}
