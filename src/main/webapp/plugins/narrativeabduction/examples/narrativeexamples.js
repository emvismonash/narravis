class NarrativeExamples{
    constructor(app){
        let exampledata = [
            {
                title: "Saki Airfield Explosion",
                description: "Narrative of Saki airforce field explosion [Human authored].",
                drawiofilepath: "plugins/narrativeabduction/examples/sakipaperexample.drawio"
            },
            {
                title: "Three Little Pigs",
                description: "Competing narratives of three little pigs story [GPT authored]",
                drawiofilepath: "plugins/narrativeabduction/examples/threepigs.drawio"
            },
            {
                title: "Istanbul Explosion (Hypothetical)",
                description: "Hypothetical narratives of an explosion in Istanbul [GPT authored]",
                drawiofilepath: "plugins/narrativeabduction/examples/istanbulexplosion.drawio"
            },

            
        ]
        this.app = app;
        this.examples = exampledata;
        this.createWindow();
    }

    createWindow(){
        const container = document.createElement("div");
        container.classList.add("na-window-content");
  
        NAUIHelper.CreateHelpText(container, "This window contains a list of pre-defined narrative examples");
  
        this.examples.forEach(item => {
            let c = this.createListView(item);
            container.append(c);
        });

        this.window =  NAUIHelper.CreateWindow("narrative-examples", "Examples", container, 1000, 500, 400, 600);
        this.window.setResizable(true);
        this.window.setVisible(true);
    }

    createListView(exampleitem){
        const container = document.createElement("div");
        const titleelmt = document.createElement("div");
        const descelmt = document.createElement("div");
        const loadbutton = document.createElement("button");

        titleelmt.innerHTML = exampleitem.title;
        descelmt.innerHTML = exampleitem.description;
        loadbutton.innerHTML = "Load";

        titleelmt.style = "font-weight:bold;font-size:larger;";
        descelmt.style = "margin-bottom:5px";
        container.style = "padding:5px;margin-bottom:5px;border:1px solid gray;border-radius:5px";

        container.append(titleelmt);
        container.append(descelmt);
        container.append(loadbutton);

        let app = this.app;
        loadbutton.onclick = function(){           
            // Example using XMLHttpRequest
            var xhr = new XMLHttpRequest();
            xhr.open("GET", exampleitem.drawiofilepath, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var xmlData = xhr.responseText;
                    var e = mxUtils.parseXml(xmlData);
                    app.editorui.editor.setGraphXml(e.documentElement);
                    app.loadExistingNarratives();

                    //app.editorui.openLocalFile(xmlData); // this opens a new window but does not load the narrative components
                }
            };
            xhr.send();
        }

        return container;
    }
}