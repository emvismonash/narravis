class NarrativeLanesController {
    constructor(graph, app){
        this.app = app;
        this.graph = graph;
        this.margin = 20;
        this.toplane = new NarrativeLane(graph, "Top Narratives", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.evidencelane = new NarrativeLane(graph, "Evidence Lane", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.botlane = new NarrativeLane(graph, "Bottom Narratives", NarrativeLane.GROWDIRECTION.DOWNWARD, app);
        this.envidencegroup;
        this.initated = false;
        this.initListenerNewDocument();
        this.initListenerLayouUpdated();
    }

    initListenerNewDocument() {
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.NEWDOCUMENTITEM, function(evt){
           if(!t.initated){
                let data = evt.detail;
                let narrative = data.narrative;

                t.toplane.initiate();
                t.evidencelane.initiate();
                t.botlane.initiate();
 
                t.updateLanesPosition();

                t.toplane.checkNarrativeInLane(narrative);
                t.evidencelane.checkNarrativeInLane(narrative);
                t.botlane.checkNarrativeInLane(narrative);


                t.initated = true;
           }
        })  
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

    updateLanesPosition(){

        this.graph.getModel().beginUpdate();
        try{
            let topHeight = this.toplane.getLaneHeight();
            let midHeight = this.evidencelane.getLaneHeight();
            this.toplane.rootcell.geometry.y = 0;
            this.toplane.boundcell.geometry.y = 0;
            this.evidencelane.rootcell.geometry.y = this.toplane.boundcell.geometry.y + topHeight + this.margin;
            this.evidencelane.boundcell.geometry.y = this.toplane.boundcell.geometry.y + topHeight + this.margin;
            this.botlane.rootcell.geometry.y = this.evidencelane.boundcell.geometry.y + midHeight + this.margin;
            this.botlane.boundcell.geometry.y = this.evidencelane.boundcell.geometry.y + midHeight + this.margin;
        }finally{
            this.graph.getModel().endUpdate();
            this.toplane.updateNarrativesPositions();
            this.evidencelane.updateNarrativesPositions();
            this.botlane.updateNarrativesPositions();
        }        
       

    }

}