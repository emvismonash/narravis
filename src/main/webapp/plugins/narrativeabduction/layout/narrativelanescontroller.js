class NarrativeLanesController {
    constructor(graph, app){
        this.app = app;
        this.graph = graph;
        this.margin = 20;
        this.toplane = new NarrativeLane(graph, "Top Narratives", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.evidencelane = new NarrativeLane(graph, "Evidence Lane", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.botlane = new NarrativeLane(graph, "Bottom Narratives", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.evidencenarrative = null;
        this.initListenerLayouUpdated();
    }

    initiate(){
        this.toplane.initiate();
        this.evidencelane.initiate();
        this.botlane.initiate();
        this.updateLanesPosition();
        this.graph.refresh();
    }


    initListenerLayouUpdated(){
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, function(evt){
            (async()=>{
                await new Promise((resolve) => setTimeout(resolve, 500));    
                t.updateLanesPosition();
            })();   
        })
    }

    /**
     * Check is given cell is in any of the lane
     * @param {*} cell 
     * @returns 
     */
    isCellInAnyLane(cell){
        return (this.toplane.isCellInLane(cell) || this.evidencelane.isCellInLane(cell) || this.botlane.isCellInLane(cell));
    }

    removeNarrative(narrative){
        if(this.toplane.narratives.includes(narrative)) this.toplane.unAssignNarrative(narrative);
        if(this.evidencelane.narratives.includes(narrative)) this.evidencelane.unAssignNarrative(narrative);
        if(this.botlane.narratives.includes(narrative)) this.botlane.unAssignNarrative(narrative);
      }
  

    /**
     * Get either top or bot lane that is closes to cell, mid lane is dedicated for evidence
     * @param {*} cell 
     * @returns 
     */
    getClosestLane(cell){
        let intop = this.toplane.isCellInLane(cell);
        return (intop)? this.toplane : this.botlane;
    }

    updateLanesGrowth(){
        this.toplane.updateLaneLayout();
        this.evidencelane.updateLaneLayout();
        this.botlane.updateLaneLayout();
    }

    updateLanesPosition(){
        let topHeight = this.toplane.getLaneHeight();
        let midHeight = this.evidencelane.getLaneHeight();
        this.toplane.rootcell.geometry.y = 0;
        this.toplane.boundcell.geometry.y = 0;
        this.evidencelane.rootcell.geometry.y = this.toplane.boundcell.geometry.y + topHeight + this.margin;
        this.evidencelane.boundcell.geometry.y = this.toplane.boundcell.geometry.y + topHeight + this.margin;
        this.botlane.rootcell.geometry.y = this.evidencelane.boundcell.geometry.y + midHeight + this.margin;
        this.botlane.boundcell.geometry.y = this.evidencelane.boundcell.geometry.y + midHeight + this.margin;
        this.toplane.updateNarrativesPositions();
        this.evidencelane.updateNarrativesPositions();
        this.botlane.updateNarrativesPositions();       
        this.graph.refresh();

    }

}