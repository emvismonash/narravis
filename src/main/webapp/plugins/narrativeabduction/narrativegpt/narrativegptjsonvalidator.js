class NarrativeGPTJSONValidator extends NarrativeGPT{
    constructor(){
        super();
        this.createWindow();
    }

    formatPrompt(text){
        return this.formatjsonprompt + " Here is the text: \n" + text;        
    }

    setText(text){
        this.textareamessage.value = text;
    }

    createWindow(){
        const container = document.createElement("div");
        container.classList.add("na-window-content");

        const messagePanel = document.createElement('textarea');
        const textAreaJSON = document.createElement('textarea');
        const buttonSaveJSON = document.createElement('button');    
        const buttonDraw = document.createElement('button');
        const fileNameInput = document.createElement('input');      
        const loadingURL = "plugins/narrativeabduction/assets/loading.gif";
    

        fileNameInput.style = "font-size:small; witdth:200px;";
        fileNameInput.value = "generated-diagram";

        let t = this;

        buttonSaveJSON.innerHTML = "Save JSON";
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

        buttonDraw.innerHTML = "Turn to diagram";
        buttonDraw.addEventListener('click', function(){
            // Get the text you want to save
            var textToSave = textAreaJSON.value;              
            //trigger new narrative event
            let event = new CustomEvent(NASettings.Dictionary.EVENTS.INSERTJSON2DIAGRAM, {
              detail: {
                jsontext: textToSave
              },
            });
            document.dispatchEvent(event);
        });
        
        container.append(messagePanel);
        this.textareamessage = messagePanel;
        this.textareajson = textAreaJSON;

        let btnGenerate = NAUtil.AddButton("Generate", container, function(){
            let text = messagePanel.value;
            let prompt = t.formatPrompt(text);
            t.chatGPT(prompt);
            messagePanel.disabled = true;
            btnGenerate.disabled  = true;
            btnGenerate.innerHTML = "Generating <img src='"+loadingURL+"' width='20px'>";
          })

        container.append(textAreaJSON);
        container.append(buttonDraw);
        container.append(fileNameInput);
        container.append(buttonSaveJSON);



        this.uibuttongenerate = btnGenerate;

        let gptiwindow =  NAUtil.CreateWindow("gpt-window-json", "GPT JSON Generation", container, 700, 800, 500, 400);
        gptiwindow.setVisible(true);
        gptiwindow.setResizable(true);
      }

      async chatGPT(text){
        console.log("Sending ..." + text);
        this.chat(text)
        .then(result => {
          console.log(result);
          if(result.status == "success"){
            let jsonText = result.message;
            this.textareajson.value = jsonText;
            this.textareamessage.disabled = false;
            this.uibuttongenerate.disabled = false;
            this.uibuttongenerate.innerHTML = "Generate";
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
}