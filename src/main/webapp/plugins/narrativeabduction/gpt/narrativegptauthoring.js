class NarrativeGPTAuthoring extends NarrativeGPT{
    constructor(app){
        super();
        this.app = app;
        this.container = {};
        this.menus = [
          {
            name: "Chat",
            actions: [
              {
                name: "New chat",
                title: "Create a new chat. The current one will be removed.",
                func: ()=>{
                  console.log("New chat");
                  var userResponse = window.confirm("Current chat will be gone, cancel and donwload chat first to keep it. Confirm ignore current chat and start a new chat?");
                  if (userResponse) {
                    this.newChat();
                  }
                }
              },
              {
                name: "Download chat",
                title: "Download current chat as a JSON file.",
                func: ()=>{
                  console.log("Download chat");
                  this.downloadChat();
                }
              },
              {
                name: "Load chat",
                title: "Load a chat from a JSON file.",
                func: ()=>{
                  console.log("Load chat");
                  this.loadChat();
                }
              }         
            ]
          },
          {
            name:"Other",
            actions: [              
              {
                name: "JSON Generation",
                title: "Show JSON generation window",
                func: ()=>{
                    this.toggleJSONGenerationWindow();
                }
              }
            ]
          }
        ];
        this.createChatWindow();
        this.jsonvalidator = new NarrativeGPTJSONValidator(app);
        this.initListenerJSON2Diagram();
        this.initListenerJSON2DocumentItem();
        this.currentmessage;        
        this.loadingurl = "plugins/narrativeabduction/assets/loading.gif";


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
      document.addEventListener(NASettings.Dictionary.EVENTS.JSON2ITEM, function(evt){
        let data = evt.detail;
        console.log(data);
        let itemobject = data.itemobject;
        let isnode = data.isnode;
        let nodes = data.nodes;
        
        if(isnode){
          console.log(itemobject);
          t.app.insertDocumentItemFromJSONObject(itemobject);
        }else{
          t.app.insertDocumentLinkFromJSONObject(itemobject, nodes);
        }
      });   
    }

    toggleJSONGenerationWindow(){
      this.jsonvalidator.window.setVisible(!this.jsonvalidator.window.isVisible());
    }

    applySetting(jsonData){
        console.log("GPT setting", jsonData);
        this.apikey = jsonData.apiKey;
        this.prompt = jsonData.prompt;   
        this.apiURL = jsonData.apiURL;
        this.model = jsonData.model;
        this.jsonvalidator.applySetting(jsonData);
    }

    stopGenerate(){
      super.stopStream();
      this.enableChat();
    }


  /**
   * this.container
   *    this.container.chatcontainer
   *        this.messagepanel
   *        this.chatpanel
   */
   createChatWindow(){
    const container = document.createElement("div");
    this.window =  NAUIHelper.CreateWindow("gpt-window", "GPT Authoring Window", container, 1000, 100, 400, 400);
    this.window.setVisible(true);
    this.window.setResizable(true);

    const textAreaChatInput = document.createElement('textarea');
    const chatContainer = document.createElement('div');
    const messagePanel = document.createElement('div');
    const chatPanel = document.createElement('div');

    let menus = this.menus;
    NAUIHelper.CreateMenu(menus, container);

    chatContainer.style = "display:flex; flex-direction: column; height:100%;";
    messagePanel.style = 'min-height:80px;padding-top:10px;padding-bot:5px;overflow-y: scroll;flex:1;';
    chatPanel.style = "height: 200px;margin-bottom:20px";

    chatContainer.append(messagePanel);
    chatContainer.append(chatPanel);
    chatPanel.append(textAreaChatInput);
    
    const inputElementJSONSetting = document.createElement('input');

    messagePanel.setAttribute('id', 'nagpt-message');

    container.classList.add("na-window-content");
    
    NAUIHelper.CreateHelpText(container, "Chat with GPT to craft a clear causal story. Start by loading the GPT setting JSON file using the Browse button. Use the chat window to compose the narrative, ensuring it conveys the intended cause-and-effect sequence. Once the narrative is ready, transfer it to the GPT JSON Generation window using the button under the response to create a properly formatted document for importing into a diagram.", false);

    let t = this;
    // Set attributes for the text area
    textAreaChatInput.rows = '4';
    textAreaChatInput.cols = '20';
    textAreaChatInput.setAttribute('style', 'resize: none; ');

    container.append(inputElementJSONSetting); 
    container.append(chatContainer);
    
    let btnGenerate = NAUIHelper.AddButton("Send", chatPanel, function(){
      t.sendMessage();
    })

    let btnStopGenerate = NAUIHelper.AddButton("Stop", chatPanel, function(){
      t.stopGenerate();
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
            if(NarrativeGPT.isSettingValid(jsonData)) {
              t.applySetting(jsonData);
              t.container.uitext.value = "Hello GPT";
              t.sendMessage();
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        };
        fileReader.readAsText(selectedFile);
      }
    });

    this.container.chatcontainer = chatContainer;
    this.container.messagepanel = messagePanel;
    this.container.chatpanel = chatPanel;
    this.container.uitext = textAreaChatInput;
    this.container.uibuttonstopgenerate = btnStopGenerate;
    this.container.uibuttongenerate = btnGenerate;
    this.container.uitext.value = "Load GPT setting JSON file to start.";
    this.container.uitext.disabled = true;
    this.container.uibuttongenerate.disabled = true;
    this.container.uibuttonstopgenerate.style.display = "none";
  }

  loadChat(){
    let t = this;
    NAUtil.loadJSONFile("json", async (messages)=>{
        console.log(messages);
        this.messages = messages;
        for (const message of messages) {
          t.container.messagepanel.append(t.createNewMessage(message.content, message.role == "system").container);
          await new Promise((resolve) => setTimeout(resolve, 500));
          t.scrollDown(this.container.messagepanel.scrollHeight + 5);
        }
    });
  }

  newChat(){
    this.container.messagepanel.innerHTML = "";
    this.messages = [];
  }

  downloadChat(){
    let blob = new Blob([JSON.stringify(this.messages)], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);

    let filename = "chat-" + (new Date()).toISOString();;
    a.download = filename + ".json";
    a.click();   
    a.remove();
  }

  sendMessage(){
    this.currentmessage = this.createNewMessage(this.container.uitext.value, false);
    this.container.messagepanel.append(this.currentmessage.container);
    this.chatGPTStream(this.container.uitext.value);
    this.container.uitext.value = "";
    this.disableChat();
    this.scrollDown(this.container.messagepanel.scrollHeight);
  }

  enableChat(){
    this.container.uitext.disabled = false;
    this.container.uibuttongenerate.disabled = false;
    this.container.uibuttongenerate.innerHTML = "Send";
    this.container.uibuttonstopgenerate.style.display = "none";
  }

  disableChat(){
    this.container.uitext.disabled = true;
    this.container.uibuttongenerate.disabled = true;
    this.container.uibuttongenerate.innerHTML = "GPT is responding <img src='"+this.loadingurl+"' width='20px'>";
    this.container.uibuttonstopgenerate.style.display = "block";

  }

  scrollDown(value){
    let t = this;
    requestAnimationFrame(function(){
      t.container.messagepanel.scrollTo({
        top: value,
        behavior: 'smooth'
      });
    })
  }
  
  async chatGPTStream(text){
    console.log("Sending ..." + text);
    this.createNewMessage("", true);
    const messagePanel = this.container.messagepanel;
    messagePanel.append(this.currentmessage.container);
    this.scrollDown(this.container.messagepanel.scrollHeight + 5);
    await this.chatStream(text, this.updateStreamResponse, this.completeStreamResponse, this);
  }

  createNewMessage(text, system){
    this.currentmessage = new NarrativeGPTAuthoringMessage(text, system);
    if(system) this.addButtonsToMessage(this.currentmessage); //add buttons to message
    return this.currentmessage;
  }

  addButtonsToMessage(msg){
    let container = msg.container;
    let buttonStyle = "font-size:8px;"
    
    const selectButton = document.createElement('button');
    const copyTextButton = document.createElement('button');
    const downloadTextButton = document.createElement('button');

    selectButton.style = buttonStyle;
    selectButton.innerHTML = "select";
    selectButton.title = "Copy and paste this response to the GPT JSON Generation window.";
    copyTextButton.title = "Insert this text into the chat."
    copyTextButton.style = buttonStyle;
    copyTextButton.innerHTML = "copy to chat";

    let t = this;
    selectButton.onclick = function(){
        t.jsonvalidator.setText(msg.unformattedtext);
    }

    copyTextButton.onclick = function(){
      t.container.uitext.value += msg.unformattedtext;
    }

    downloadTextButton.style = buttonStyle;
    downloadTextButton.innerHTML = "download";
    downloadTextButton.title = "Save this response as a text file";
    downloadTextButton.addEventListener('click', function(){
      let blob = new Blob([msg.unformattedtext], { type: "text/plain" });
      let a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);

      let filename = "gpt-response-" + (new Date()).toISOString();;
      a.download = filename + ".txt";
      a.click();         
    });

    container.append(selectButton);
    container.append(copyTextButton);
    container.append(downloadTextButton);
  }

  updateStreamResponse(content, t){
    t.currentmessage.appendMessage(content);
    let currentScrollHeight = t.container.messagepanel.scrollHeight;
    let wndw = t.window.getElement;
    t.window.setSize(wndw.width, wndw.height + 10);
    t.scrollDown(currentScrollHeight);
  }

  completeStreamResponse(t){
    console.log("Stream completed");
    t.enableChat();
    t.container.uitext.focus();
  }

// Only streaming is allowed
//   async chatGPT(text){
//         console.log("Sending ..." + text);
//         let t = this;
//         let currentScrollHeight = this.container.messagepanel.scrollHeight;
//         this.chat(text)
//         .then(result => {
//           console.log(result);
//           if(result.status == "success"){
//             let jsonText = result.message;
//             // Do something with the parsed JSON data
//             const messagePanel = this.container.messagepanel;
//             if(messagePanel) {              
//               t.currentmessage =  t.createNewMessage(jsonText, true);
//               messagePanel.append(t.currentmessage.container);
//               t.scrollDown(currentScrollHeight + 5);
//             }
//             // enable uis
//           }else{
//             alert(result);
//           }
//           this.enableChat();
//         })
//         .catch(error => {
//           console.error('Error:', error);
//           alert(error);
//           this.enableChat();
//         });
//   }
}


class NarrativeGPTAuthoringMessage {
  constructor(message, system){
      this.createUI(message, system);
      this.container;
      this.messagecontainer;
      this.formattedtext;
      this.unformattedtext;
      this.systemrole;
  }

  appendMessage(text){
    if(text){
      this.unformattedtext += text;
      let fromattertext = text.replace("\n", "<br/>");
      this.messagecontainer.innerHTML += fromattertext;
    }
  }

  createUI(message, system){
    const container = document.createElement('div');
    const messageContainer = document.createElement('div');
    const formattedText = message.replace(/\n/g, '<br>');

    this.container = container;
    this.messagecontainer = messageContainer;
    this.formattedtext = formattedText;
    this.unformattedtext = message;
    this.systemrole = system;

    messageContainer.innerHTML = formattedText;

  
    container.append(messageContainer);

    let systemstyle = "margin-bottom: 5px;border: 1px solid white; background:lightblue; border-radius: 5px;padding: 5px;";
    let userstyle =  "margin-bottom: 5px;border: 1px solid lightgray; font-style:italic; border-radius: 5px;padding: 5px;"
    if(!system) {
      messageContainer.style = userstyle;
    } else{
      messageContainer.style = systemstyle;
    }
    container.style = "margin-bottom:5px";


    return container;
  }
}