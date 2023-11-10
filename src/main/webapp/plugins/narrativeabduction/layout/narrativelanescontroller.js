class NarrativeLanesController {
    constructor(graph){
        this.graph = graph;
        this.toplane = new NarrativeLane(graph, "Top Narratives");
        this.evidencelane = new NarrativeLane(graph, "Evidence Lane");
        this.botlane = new NarrativeLane(graph, "Bottom Narratives");
        this.updateLanesPosition();
    }

    updateLanesPosition(){
        let topHeight = this.toplane.getLaneHeight();
        let midHeight = this.evidencelane.getLaneHeight();

        this.evidencelane.move(0, topHeight);
        this.botlane.move(0, topHeight+midHeight);
        this.graph.refresh();
    }

}