class NarrativeLane {
    constructor(graph, name){
        this.name = name;
        this.narratives = [];
        this.container;
        this.boundcell;
        this.rootcell;
        this.graph = graph;
        this.lanelabelstyle = "text;html=1;strokeColor=none;fillColor=none;align=center;locked=1;verticalAlign=middle;whiteSpace=wrap;rounded=0;flipV=0;direction=south;horizontal=0;fontSize=20;fontStyle=0;fontFamily=Helvetica;connectable=0;allowArrows=0;editable=1;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;cloneable=0;pointerEvents=0;expand=0;recursiveResize=0;"; 
        this.laneboundstyle = "connectable=1;moveable=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#E6D0DE;fillColor=#dae8fc;strokeWidth=2;perimeterSpacing=3;fillStyle=solid;comic=0;container=0;collapsible=0;dropTarget=0;;editable=1;";
        this.initiate();
        this.initListenerNewDocument();
        this.initListenerNarrativeMoved();
    }

    initiate(){
        this.createLaneContainer();
        this.createLaneCell();
        this.createLabelCell();
    }

    assignNarrative(narrative){
        //assign to new lane.
        this.narratives.push(narrative); 
    }

    updateLayout(){
        this.narratives.forEach(narrative => {
            let dx = narrative.rootCell.geometry.x + narrative.rootCell.geometry.width;
            let dy = narrative.rootCell.geometry.y;

            console.log(dx, dy);
            NarrativeLayout.applyLayout(narrative, this.graph, dx, dy, ()=>{
                //narrative.updateCellsPositions();
            });
      });  
    }

    createLaneContainer(){
        this.container = document.createElement("div");
        this.container.style.padding = "2px";
        let title = document.createElement("div");
        title.innerHTML = this.name;
        this.container.append(title);
        this.container.title = title;
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

    initListenerNarrativeMoved(){
        let t = this;
        let graph = this.graph;
        graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt){
          let cells = evt.getProperty("cells");
          let dx = evt.getProperty("dx");
          let dy = evt.getProperty("dy");
          cells.forEach(cell => {
              if(Narrative.isCellNarrative(cell)){
                  if(t.isCellInLane(cell)){
                    console.log(t.name + "IN LANE");
                  }else{
                    console.log(t.name + "OUT LANE");
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
            let cell = data.cell;
            
            if(narrative){
                if(!t.isCellInLane(narrative.rootCell)){
                    t.assignNarrative(narrative);
                }
                t.updateLayout();
            }
        })  
    }

    isCellInLane(cell){
        let top = this.boundcell.geometry.y;
        let bot = top + this.boundcell.geometry.height;
        return (cell.geometry.y >= top && cell.geometry.y <= bot); 
    }

    /**
     * The lane height is calculated based on the narrative bound's height and vertical spacing. 
     * @param {*} lane 
     * @returns 
     */
    getLaneHeight(){
        let height = 0;
        this.narratives.forEach(narrative => {
            narrative.updateCellsBound();
            if(narrative.bound){
                height += narrative.bound.height;
            }            
            height += this.verticalspace; 
        });
        //set minimun height
        height = Math.max(200, height);
        return height;
    }

    createLabelCell(){
        let boundcell = this.boundcell;
        let yPos = boundcell.geometry.y + (boundcell.geometry.height * 0.5) - 100;
        let graph = this.graph;
        graph.getModel().beginUpdate();
            try{
                let labelVertex = graph.insertVertex(graph.getDefaultParent(), null, '', -200, yPos, 100, 200);
                labelVertex.setStyle(this.lanelabelstyle);  
                labelVertex.setValue(this.name);    
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
            this.boundcell = vertex;
            graph.orderCells(true, [vertex]);
            graph.setCellStyles(mxConstants.STYLE_EDITABLE, '0', [vertex]);
        }finally{
          graph.getModel().endUpdate(); 
          graph.refresh();             
        }
    }
}