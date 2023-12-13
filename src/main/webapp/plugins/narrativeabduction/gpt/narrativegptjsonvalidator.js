class NarrativeGPTJSONValidator extends NarrativeGPT{
    constructor(app){
        super();
        this.app = app;
        this.createWindow();
        this.window;        
        this.loadingurl = "plugins/narrativeabduction/assets/loading.gif";
        this.streamparser;
        this.currentnarrativeresult;
        this.initListenerJSON2Diagram();
        this.initListenerJSON2DocumentItem();
    }

    completeStreamResponse(t){
      NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.JSON2ITEMDONE, {
      
      });
      t.enableChat();
    }

    async chatGPTStream(text){
      this.streamparser = new NarrativeGPTJSONStreamParser();
      await this.chatStream(text, this.updateStreamResponse, this.completeStreamResponse, this);
    }

    createWindow(){
      const container = document.createElement("div");
      container.classList.add("na-window-content");

      const responseTextArea = document.createElement('textarea');
      const textAreaJSON = document.createElement('textarea');
      const buttonSaveJSON = document.createElement('button');    
      const buttonDraw = document.createElement('button');
      const fileNameInput = document.createElement('input');      

      NAUIHelper.CreateHelpText(container, "This window can turn narrative text into the JSON format needed to create diaram. It requires gtp setting from GPT Authoring Window to work properly.")

      let textAreaStyle = "min-height:200px;resize: vertical;";
      textAreaJSON.style = textAreaStyle;
      responseTextArea.style = textAreaStyle;

      fileNameInput.style = "font-size:small; witdth:200px;";
      fileNameInput.value = "generated-diagram";

      let t = this;

      buttonSaveJSON.innerHTML = "Download";
      buttonSaveJSON.title = "Download the JSON data into file";
      buttonSaveJSON.addEventListener('click', function(){
          // Get the text you want to save
          let textToSave = textAreaJSON.value;
  
          // Create a Blob with the text content
          let blob = new Blob([textToSave], { type: "text/plain" });
  
          // Create a temporary link element for triggering the download
          let a = document.createElement("a");
          a.href = window.URL.createObjectURL(blob);

          let filename = fileNameInput.value;
          a.download = filename + ".json";
  
          // Trigger a click event on the link to initiate the download
          a.click();
          
      });

      buttonDraw.innerHTML = "Visualise";
      buttonDraw.title = "Parse the JSON data into cells";
      buttonDraw.style.marginRight = "20px";
      buttonDraw.addEventListener('click', function(){
          // Get the text you want to save
          var textToSave = textAreaJSON.value;              
          //trigger new narrative event
          NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.INSERTJSON2DIAGRAM, {
            jsontext: textToSave
          });
      });
      
      container.append(responseTextArea);
      this.container = container;
      this.container.textareamessage = responseTextArea;
      this.container.textareajson = textAreaJSON;

      let btnGenerate = NAUIHelper.AddButton("Generate", container, function(){
          let text = responseTextArea.value;
          let prompt = t.formatPrompt(text);
          t.container.textareajson.value = "";
          t.chatGPTStream(prompt);           
          t.disableChat();            
          NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.JSON2ITEMSTART, {
          });
        })

     let btnStopGenerate = NAUIHelper.AddButton("Stop", container, function(){
          t.stopGenerate();
     })

      container.append(textAreaJSON);
      container.append(buttonDraw);
      container.append(fileNameInput);
      container.append(buttonSaveJSON);

      this.container.uibuttongenerate = btnGenerate;
      this.container.uibuttonstopgenerate = btnStopGenerate;
      this.container.uibuttonstopgenerate.style.display = "none";


      this.window =  NAUIHelper.CreateWindow("gpt-window-json", "GPT JSON Generation", container, 1000, 500, 400, 600);
      this.window.setResizable(true);
      this.window.setVisible(false);

    }

    disableChat(){
      this.container.textareamessage.disabled = true;
      this.container.uibuttongenerate.disabled = true;
      this.container.uibuttongenerate.innerHTML = "Generating <img src='"+this.loadingurl+"' width='20px'>";
      this.container.uibuttonstopgenerate.style.display = "block";    
    }
    enableChat(){
      this.container.textareamessage.disabled = false;
      this.container.uibuttongenerate.disabled = false;
      this.container.uibuttongenerate.innerHTML = "Generate";
      this.container.uibuttonstopgenerate.style.display = "none";
    }
  
    formatPrompt(text){
        return this.formatjsonprompt + " Here is the text: \n" + text;        
    }

    initListenerJSON2Diagram(){
      let t = this;
      document.addEventListener(NASettings.Dictionary.EVENTS.INSERTJSON2DIAGRAM, function(evt){
        let data = evt.detail;
        let json = data.jsontext;
        t.app.createDocumentItemsFromJSON(JSON.parse(json));
      });   
    }

    initListenerJSON2DocumentItem(){
      let t = this;
      document.addEventListener(NASettings.Dictionary.EVENTS.JSON2ITEMSTART, function(evt){       
        t.app.generatingsession = true;
        t.currentnarrativeresult = t.app.newNarrative();
        t.currentnarrativeresult.narrative.rootcell.geometry.x = 30;
        t.currentnarrativeresult.narrative.rootcell.geometry.y = 480;
        t.currentnarrativeresult.narrative.rootcell.geometry.width = 260;
        t.currentnarrativeresult.narrative.rootcell.geometry.height = 40;

        t.app.editorui.editor.graph.refresh();
      });   
      document.addEventListener(NASettings.Dictionary.EVENTS.JSON2ITEM, function(evt){
        let data = evt.detail;
        let itemobject = data.itemobject;
        let isnode = data.isnode;
        let nodes = data.nodes;
        
        if(isnode){
          let cells = t.app.insertDocumentItemFromJSONObject(itemobject);
          t.app.assignNodes(t.currentnarrativeresult.narrativeview, cells)
          t.currentnarrativeresult.narrativeview.applyLayout(t.currentnarrativeresult.narrativeview);      
        }else{
          t.app.insertDocumentLinkFromJSONObject(itemobject, nodes);
        }
      });
      
      document.addEventListener(NASettings.Dictionary.EVENTS.JSON2ITEMDONE, function(evt){       
        t.app.generatingsession = false; 
        t.currentnarrativeresult.narrativeview.applyLayout(t.currentnarrativeresult.narrativeview);      
      });   
    }

    stopGenerate(){
      super.stopStream()
      this.enableChat();
    }

    setText(text){
      this.container.textareamessage.value = text;
    }

    updateStreamResponse(content, t){
      t.container.textareajson.value += content;
      t.streamparser.evaluate(content);
    }


}


class NarrativeGPTJSONStreamParser {
    constructor(){
      this.nodes = [];
      this.links = [];
      this.currenttext = "";
      this.currentprocces = "";
    }

    addItem(arr, isnode){
      let jsonPattern = /\{[^{}]*\}/g;
      let items = NarrativeGPTJSONStreamParser.findJSONObjectsExcludeArrays(this.currenttext, jsonPattern);
      items.forEach(item => {
        try {
          if(!this.elementExists(arr, item)) {
            arr.push(item);
            NAUtil.DispatchEvent(NASettings.Dictionary.EVENTS.JSON2ITEM, {
              itemobject: item,
              isnode: isnode,
              nodes: this.nodes,
              links: this.links
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    }

    elementExists(arr, elminput){
      let res = false;
      arr.forEach(elm => {
        if(elm.id == elminput.id) res = true;      
      });
      return res;
    }

    evaluate(textchunk){
      let nodePattern =  /"nodes": \[/;
      let linkPattern =  /"links": \[/;

      this.currenttext += textchunk;

      let nodeFound = nodePattern.test(this.currenttext);
      let linkFound = linkPattern.test(this.currenttext);

      if (nodeFound && !linkFound) {
        if(this.currentprocces != "node") {
          this.currentprocces = "node";
        }
        this.addItem(this.nodes, true);
      } 
      if(linkFound){
        if(this.currentprocces != "link") {
          this.currentprocces = "link";
          this.currenttext = '"links":' + textchunk;
        }
        this.addItem(this.links, false);
      }
    }

    static findJSONObjectsExcludeArrays(inputString) {
      const jsonObjectRegex = /{[^[\]{}]+}/g;
      const jsonObjects = inputString.match(jsonObjectRegex);
    
      if (jsonObjects) {
        return jsonObjects.map((jsonStr) => JSON.parse(jsonStr));
      } else {
        return [];
      }
    }
    
    static match(text, pattern){
      return text.match(pattern);
    }

}