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
        const copyTextButton = document.createElement('button');
        const downloadTextButton = document.createElement('button');

        const messageContainer = document.createElement('div');
        const formattedText = message.replace(/\n/g, '<br>');
        messageContainer.innerHTML = formattedText;

        let buttonStyle = "font-size:8px;"
        selectButton.style = buttonStyle;
        selectButton.innerHTML = "select";

        selectButton.title = "Copy and paste this response to the GPT JSON Generation window.";
        copyTextButton.title = "Insert this text into the chat."
        
        copyTextButton.style = buttonStyle;
        copyTextButton.innerHTML = "copy to chat";

        let t = this;
        selectButton.onclick = function(){
            t.jsonvalidator.setText(message);
        }

        copyTextButton.onclick = function(){
          t.container.uitext.value += message;
        }

        container.append(messageContainer);
        if(system){
          container.append(selectButton);
          container.append(copyTextButton);
          container.append(downloadTextButton);
        } 

        let systemstyle = "margin-bottom: 5px;border: 1px solid white; background:lightblue; border-radius: 5px;padding: 5px;";
        let userstyle =  "margin-bottom: 5px;border: 1px solid lightgray; font-style:italic; border-radius: 5px;padding: 5px;"
        if(!system) {
          messageContainer.style = userstyle;
        } else{
          messageContainer.style = systemstyle;
        }
        container.style = "margin-bottom:5px";

        downloadTextButton.style = buttonStyle;
        downloadTextButton.innerHTML = "download";
        downloadTextButton.title = "Save this response as a text file";
        downloadTextButton.addEventListener('click', function(){
          let blob = new Blob([message], { type: "text/plain" });
          let a = document.createElement("a");
          a.href = window.URL.createObjectURL(blob);

          let filename = "gpt-response-" + (new Date()).toISOString();;
          a.download = filename + ".txt";
          a.click();         
        });

        return container;
    }

   createChatWindow(){
    const container = document.createElement("div");
    const textAreaChatInput = document.createElement('textarea');
    const messagePanel = document.createElement('div');
    const chatPanel = document.createElement('div');

    chatPanel.style = "width:95%; position:absolute; bottom:5px;";
    const inputElementJSONSetting = document.createElement('input');
    const loadingURL = "plugins/narrativeabduction/assets/loading.gif";

    messagePanel.setAttribute('id', 'nagpt-message');
    messagePanel.setAttribute('style', 'height:100%;min-height:300px;overflow-y: scroll;');

    container.classList.add("na-window-content");
    
    NAUIHelper.CreateHelpText(container, "Chat with GPT to craft a clear causal story. Start by loading the GPT setting JSON file using the Browse button. Use the chat window to compose the narrative, ensuring it conveys the intended cause-and-effect sequence. Once the narrative is ready, transfer it to the GPT JSON Generation window using the button under the response to create a properly formatted document for importing into a diagram. Note: the chat is 'stateless', meaning GPT does not store the context of the coversation.", false);


    let t = this;
    // Set attributes for the text area
    textAreaChatInput.rows = '4';
    textAreaChatInput.cols = '40';
    textAreaChatInput.setAttribute('style', 'resize: none; ');
    textAreaChatInput.value = "Put your chat here, and say hello to GPT."

    container.append(inputElementJSONSetting); 
    container.append(messagePanel);
    container.append(chatPanel);
    chatPanel.append(textAreaChatInput);
    
    let btnGenerate = NAUIHelper.AddButton("Send", chatPanel, function(){
      messagePanel.append(t.formatMessage(textAreaChatInput.value, false));
      t.chatGPT(textAreaChatInput.value);
      textAreaChatInput.value = "";
      textAreaChatInput.disabled  = true;
      btnGenerate.disabled  = true;
      btnGenerate.innerHTML = "Waiting response <img src='"+loadingURL+"' width='20px'>";
    })

    // Add an event listener to the textarea for the 'keydown' event
    textAreaChatInput.addEventListener("keydown", function (event) {
      // Check if the Ctrl key (or Command key on Mac) is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          // Prevent the default behavior of a newline character
          event.preventDefault();

          // Add your custom action here
          btnGenerate.click();
      }
    });

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

    let gptiwindow =  NAUIHelper.CreateWindow("gpt-window", "GPT Authoring Window", container, 200, 800, 500, 400);
    gptiwindow.setVisible(true);
    gptiwindow.setResizable(true);
  }

  enableChat(){
    this.container.uitext.disabled = false;
    this.container.uibuttongenerate.disabled = false;
    this.container.uibuttongenerate.innerHTML = "Send";
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
          }else{
            alert(result);
          }
          this.enableChat();
        })
        .catch(error => {
          console.error('Error:', error);
          alert(error);
          this.enableChat();
        });
      }

}