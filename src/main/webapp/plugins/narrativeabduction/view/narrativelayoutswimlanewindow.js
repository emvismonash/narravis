class NarrativeLayoutSwimlaneWindow {
    constructor(app, layout){
        this.layout = layout;
        this.app = app;
        this.window;
        this.container;

        this.createWindow();
        this.initListenerLayoutUpdated();
    }

    initListenerLayoutUpdated(){
        let t = this;
        document.addEventListener(NASettings.Dictionary.EVENTS.LANELAYOUTUPDATED, function(evt){
            console.log("Update window");
            t.updateList();
        })
    }

    updateList(){
        if(this.container.firstChild) this.container.firstChild.remove();

        let container = document.createElement('div');
        let topLabel = document.createElement('div');
        topLabel.innerHTML = "Top lane";
        container.append(topLabel);
        this.layout.toplane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);               
        });
        let midLabel = document.createElement('div');
        midLabel.innerHTML = "Mid lane";
        container.append(midLabel);
        this.layout.midlane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);       
        });
        let botLabel = document.createElement('div');
        botLabel.innerHTML = "Top lane";
        container.append(botLabel);
        this.layout.botlane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);                
        });

        this.container.append(container);
    }

    createWindow(){
        this.container = document.createElement("div");
        this.window = NAUIHelper.CreateWindow("Swimlane Window", "Swimlane Window", this.container, 0, 0, 500, 500);
        this.window.setVisible(true);
    }
}