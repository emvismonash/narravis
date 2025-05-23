class NarrativeLayoutSwimlaneWindow {
    constructor(app, layout){
        this.layout = layout;
        this.app = app;
        this.window;
        this.container;

        this.createWindow();
        this.initListenerLayoutUpdated();
    }

    createWindow(){
        this.container = document.createElement("div");
        this.window = NAUIHelper.CreateWindow("Swimlane Window", "Swimlane Viewer", this.container, 0, 0, 200, 200);
        this.window.setVisible(true);
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
        topLabel.innerHTML = this.layout.toplane.name;
        container.append(topLabel);
        this.layout.toplane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);               
        });
        let midLabel = document.createElement('div');
        midLabel.innerHTML = this.layout.evidencelane.name;
        container.append(midLabel);
        this.layout.evidencelane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);       
        });
        let botLabel = document.createElement('div');
        botLabel.innerHTML = this.layout.botlane.name;
        container.append(botLabel);
        this.layout.botlane.narratives.forEach(narrative => {
            let d = document.createElement('div');
            d.innerHTML = " - " + narrative.name;    
            container.append(d);                
        });

        this.container.append(container);
    }


}