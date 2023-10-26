class NarrativeGPTAuthoring extends NarrativeGPT{
    constructor(app){
        super();
        this.app = app;
        this.container = {};
        this.messages = [];
        this.createChatWindow();
        this.jsonvalidator = new NarrativeGPTJSONValidator();
        this.iniListenerJSON2Diagram();
    }

    iniListenerJSON2Diagram(){
      let t = this;
      document.addEventListener(NASettings.Dictionary.EVENTS.INSERTJSON2DIAGRAM, function(evt){
        let data = evt.detail;
        let json = data.jsontext;
        t.app.createDocumentItemsFromJSON(JSON.parse(json));
      });
      
    }

    applySetting(jsonData){
        console.log("GPT setting", jsonData);
        this.apikey = jsonData.apiKey;
        this.prompt = jsonData.prompt;   
        this.apiURL = jsonData.apiURL;
        this.model = jsonData.model;
        this.jsonvalidator.applySetting(jsonData);
    }

    formatMessage(message, system){
        const container = document.createElement('div');
        const selectButton = document.createElement('button');
        const messageContainer = document.createElement('div');
        const formattedText = message.replace(/\n/g, '<br>');
        messageContainer.innerHTML = formattedText;

        selectButton.style = "font-size:8px;";
        selectButton.innerHTML = "select";

        let t = this;
        selectButton.onclick = function(){
            t.jsonvalidator.setText(message);
        }

        if(system) container.append(selectButton);
        container.append(messageContainer);
        container.style = "margin-bottom:5px";

        return container;
    }

   createChatWindow(){
    const container = document.createElement("div");
    const textAreaChatInput = document.createElement('textarea');
    const messagePanel = document.createElement('div');
    const inputElementJSONSetting = document.createElement('input');
    const loadingURL = "plugins/narrativeabduction/assets/loading.gif";

    messagePanel.setAttribute('id', 'nagpt-message');
    messagePanel.setAttribute('style', 'height:200px;overflow-y: scroll;');

    container.classList.add("na-window-content");

    let t = this;
    // Set attributes for the text area
    textAreaChatInput.rows = '4';
    textAreaChatInput.cols = '40';
    textAreaChatInput.setAttribute('style', 'resize: none; ');

    container.append(inputElementJSONSetting); 
    container.append(messagePanel);
    container.append(textAreaChatInput);
    
    let btnGenerate = NAUtil.AddButton("Send", container, function(){
      messagePanel.append(t.formatMessage(textAreaChatInput.value, false));
      t.chatGPT(textAreaChatInput.value);
      textAreaChatInput.value = "";
      textAreaChatInput.disabled  = true;
      btnGenerate.disabled  = true;
      btnGenerate.innerHTML = "Waiting response <img src='"+loadingURL+"' width='20px'>";
    })

    //    //const buttonSaveJSON = document.createElement('button');
   // textAreaJSON.setAttribute('id', 'nagpt-jsonoutput');

    // buttonSaveJSON.innerHTML = "Save JSON";
    // buttonSaveJSON.addEventListener('click', function(){
    //     // Get the text you want to save
    //     var textToSave = textAreaJSON.value;

    //     // Create a Blob with the text content
    //     var blob = new Blob([textToSave], { type: "text/plain" });

    //     // Create a temporary link element for triggering the download
    //     var a = document.createElement("a");
    //     a.href = window.URL.createObjectURL(blob);
    //     a.download = "generateddiagram.json";

    //     // Trigger a click event on the link to initiate the download
    //     a.click();
        
    // });

    //Load the setting
    // Create a new input element

    // Set the type attribute to 'file' for a file input
    inputElementJSONSetting.setAttribute('type', 'file');

    // Optionally, set other attributes or properties, such as an ID or name
    inputElementJSONSetting.setAttribute('id', 'fileInput-gpt-setting');
    inputElementJSONSetting.setAttribute('name', 'fileInputGptSetting');

    // Add event listener to handle selected file
    inputElementJSONSetting.addEventListener('change', function(e) {
      e.preventDefault();
      const selectedFile = inputElementJSONSetting.files[0];
      if (selectedFile) {
        // Read the selected JSON file
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
          // Parse the JSON data into a JavaScript object
          try {
            const jsonData = JSON.parse(event.target.result);
            // Do something with the parsed JSON data
            console.log('Parsed JSON data:', jsonData);
            t.applySetting(jsonData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        };
        fileReader.readAsText(selectedFile);
      }
    });

    this.container.uitext = textAreaChatInput;
    this.container.uibuttongenerate = btnGenerate;

    let gptiwindow =  NAUtil.CreateWindow("gpt-window", "Chat Window", container, 0, 0, 500, 400);
    gptiwindow.setVisible(true);
  }


  async chatGPT(text){
        console.log("Sending ..." + text);
        this.chat(text)
        .then(result => {
          console.log(result);
          if(result.status == "success"){
            let jsonText = result.message;
            // Do something with the parsed JSON data
            const messagePanel = document.getElementById("nagpt-message");
            if(messagePanel) messagePanel.append(this.formatMessage(jsonText, true));
            // enable uis
            this.container.uitext.disabled = false;
            this.container.uibuttongenerate.disabled = false;
            this.container.uibuttongenerate.innerHTML = "Send";
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }

}