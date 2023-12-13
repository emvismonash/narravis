class NarrativeExamples{
    constructor(app, exampledata){
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

        this.window =  NAUIHelper.CreateWindow("narrative-examples", "Examples", container, 1000, 500, 400, 400);
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
            if (window.confirm("Do you want clear the current narratives and load " + exampleitem.title + "?")) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", exampleitem.drawiofilepath, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            app.clearNarratives();
                            var xmlData = xhr.responseText;
                            var e = mxUtils.parseXml(xmlData);
                            app.editorui.editor.setGraphXml(e.documentElement);
                            app.loadExistingNarratives();
                            //app.editorui.openLocalFile(xmlData); // this opens a new window but does not load the narrative components
                        }
                    };
                    xhr.send();
            }
                     

        }

        return container;
    }
}