class NarrativeLanesController {
    constructor(graph, app){
        this.app = app;
        this.graph = graph;
        this.margin = 20;
        this.toplane = new NarrativeLane(graph, "Narratives", "toplane", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.evidencelane = new NarrativeLane(graph, "Evidence", "evidencelane", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.botlane = new NarrativeLane(graph, "Narratives", "botlane", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.evidencenarrative = null;
        this.initListenerLayoutUpdated();
        this.initListenerNarrativeCellMoved(); 
    }

    initiate(){
        this.toplane.initiate();
        this.evidencelane.initiate();
        this.botlane.initiate();
        this.updateLanesPosition();
        this.graph.refresh();
    }

        /**
     * Assign narrative to appropriate lane, useful when on move action is not triggered (e.g., load file)
     * @param {*} narrative 
     */
        assignNarrativeToAppropriateLane(narrative){
            if(this.toplane.isCellInLane(narrative.rootcell)){
                this.toplane.assignNarrative(narrative);
            }
            if(this.evidencelane.isCellInLane(narrative.rootcell)){
                this.evidencelane.assignNarrative(narrative);
            }
            if(this.botlane.isCellInLane(narrative.rootcell)){
                this.botlane.assignNarrative(narrative);
            }
        }

    /**
     * TODO
     * @param {*} cell 
     * @returns 
     */
    getClosestLane(cell){
        let intop = this.toplane.isCellInLane(cell);
        return (intop)? this.toplane : this.botlane;
    }

     /**
     * Hide cross links if the narrative is not in the lane
     */
     initListenerNarrativeCellMoved(){
        let t = this;
        let graph = this.graph;
        graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt){
            let cells = evt.getProperty("cells");
            let narrativecell;
            cells.forEach(cell => {
                if(NarrativeAbductionApp.isCellNarrativeCell(cell)){
                  narrativecell = cell;
                }
            });

            if(narrativecell){
                let narrative = t.app.getNarrativeFromRootCell(narrativecell);
                if(narrative){
                    let crosslinks = narrative.getCrossLinks();
                    crosslinks.forEach(link => {
                        let style = NAUtil.ParseStyleString(graph.getModel().getStyle(link));

                        if(!t.isCellInAnyLane(narrativecell)){
                            style.opacity = 0;
                            style.textOpacity= 0;
                            let stringstyle = NAUtil.StringifyStyleObject(style);
                            graph.getModel().setStyle(link, stringstyle); 
                            graph.refresh();
                        }else{
                            style.opacity = 100;
                            style.textOpacity= 100;
                            let stringstyle = NAUtil.StringifyStyleObject(style);
                            graph.getModel().setStyle(link, stringstyle);
                            graph.refresh(); 
                        }
                    });
                }
            }
        });
      }
  

    initListenerLayoutUpdated(){
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
     * Reset the reference of the root and bound cell of the narrative lane
     */
    resetLanesCellsReferences(){
        this.toplane.resetLaneCellsReferences();
        this.evidencelane.resetLaneCellsReferences();
        this.botlane.resetLaneCellsReferences();
    }

    removeLanesCells(){
        this.toplane.removeCells();
        this.evidencelane.removeCells();
        this.botlane.removeCells();
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