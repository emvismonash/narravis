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


    // loadExistingCells(){
    //     let graph = this.graph;
    //     let cells = graph.getModel().getCells();
    //     console.log(cells);
    //     let lanerootcells = [];
    //     let laneboundcells = [];
    //     cells.forEach(cell => {
    //         let c = cell.getChildAt(0);
    //         if(c){
    //             console.log(c);
    //             console.log(graph.getModel().getChildCount(c));
    //             console.log(c.getChildCount());
    //             console.log(graph.getModel().getCells(c));


    //         }
    //         if(cell.isVertex() && cell.getAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE) == NASettings.Dictionary.ATTRIBUTES.SWIMLANEINDICATOR){
    //             lanerootcells.push(cell);
    //         }
    //         if(cell.isVertex() && cell.getAttribute(NASettings.Dictionary.ATTRIBUTES.NATYPE) == NASettings.Dictionary.ATTRIBUTES.SWIMLANEINDICATOR){
    //             laneboundcells.push(cell);
    //         }
    //     });
    //     console.log("lanerootcells", lanerootcells);
    //     console.log("laneboundcells", laneboundcells);
    // }


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
        console.log("top", this.toplane.isCellInLane(cell));
        console.log("mid", this.evidencelane.isCellInLane(cell));
        console.log("bot", this.botlane.isCellInLane(cell));

        return (this.toplane.isCellInLane(cell) || this.evidencelane.isCellInLane(cell) || this.botlane.isCellInLane(cell));
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