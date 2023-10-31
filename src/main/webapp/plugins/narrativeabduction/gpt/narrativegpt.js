class NarrativeGPT{
    constructor(){
        this.messages = [];
        this.currentchunk;
        this.lastmessage;
        this.readablestream = new ReadableStream();        
    }

    //TODO
    static isSettingValid(){
        return true;
    }

    applySetting(jsonData){
        console.log("GPT setting", jsonData);
        this.apikey = jsonData.apiKey;
        this.prompt = jsonData.prompt;   
        this.apiURL = jsonData.apiURL;
        this.model = jsonData.model;
        this.formatjsonprompt = jsonData.formatjsonprompt;
        this.messages = [];
    }

    addMessage(mrole, mcontent){
        this.messages.push({
            role: mrole, 
            content: mcontent
        });
    }

    createRequest(prompt){
        
        this.addMessage("user", prompt);

        const requestBody = {
            model: this.model, 
            messages: this.messages,
            stream: true
            //max_tokens: 50
        };

        let request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apikey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }

        return {
            request: request, 
            url: this.apiURL
        }
    }

    extractChunkContent(json){
        return json.choices[0].delta.content;
    }

    stopStream(){
        this.readablestream.cancel();
    }

    parseChunksString(dataString){
        // Split the input string by newline characters to separate individual data objects
        const dataEntries = dataString.split('\n').filter(entry => entry.trim() !== '');
        // Initialize an array to store the parsed objects
        const result = [];
    
        // Iterate through each data entry and parse it as JSON
        for (const entry of dataEntries) {
          try {
            const parsedObject = JSON.parse(entry.replace('data: ', ''));
            result.push(parsedObject);
          } catch (error) {
            console.error(`Error parsing data entry: ${entry}`);
          }
        }
    
        return result;
    }

    extractChunksContent(chunks){
        let content = [];
        chunks.forEach(chunk => {
            //console.log(chunk);
            let msg = this.extractChunkContent(chunk);
            content.push(msg);
        });

        return content;
    }

    async chatStream(prompt, streamfunc, completefunc, t){
        this.currentmesage = "";
        const request = this.createRequest(prompt);
        try {
            const response =  await fetch(request.url, request.request)
                                        .then((response) => response.body)
                                        .then((rb) => {
                                            const reader = rb.getReader();      
                                            t.readablestream = new ReadableStream({
                                            start(controller) {
                                                // The following function handles each data chunk
                                                function push() {
                                                    reader.read().then(({ done, value }) => {
                                                        // If there is no more data to read
                                                        if (done) {
                                                            console.log("done", done);
                                                            t.addMessage("system", t.currentmesage);
                                                            completefunc(t);
                                                            controller.close();
                                                            return;
                                                        }
                                                        try{
                                                            controller.enqueue(value);
                                                            let string = new TextDecoder('utf-8').decode(value);
                                                            let chunks = t.parseChunksString(string);
                                                            let contents = t.extractChunksContent(chunks);
                                                            if(contents){
                                                                contents.forEach(element => {
                                                                    if(element != undefined){
                                                                        t.currentmesage += element;
                                                                        streamfunc(element, t);    
                                                                    }
                                    
                                                                });
                                                            }
                                                            push();
                                                        }catch(err){

                                                        }

                                                    });
                                                }
                                                push();
                                            },
                                            });
                                            return t.readablestream;
                                        });
          
            if (!response.ok) {
              throw new Error('Request failed');
            }          
            const data = await response.json();      
            // Process the data
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('Fetch request was canceled.');
            } else {
              console.error('Error: ' + error.message);
            }
        }
       
    }

    async chat(prompt){
        const request = this.createRequest(prompt);
        
        let result = {};
        let response = await fetch(request.url, request.request);

        if (response.ok) {
            try {
                let data = await response.json(); // This line awaits the response to be parsed as JSON
                if(data.choices[0]){
                    result.status = "success";
                    result.message = data.choices[0].message.content;   
                    this.addMessage("system", result.message);
                }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
        } else {
            console.error('Network response was not ok. Status:', response.status);
            result.status = "error";
            result.message = response.status;   
        }
        return result;
    }


    jsonStringifySafe(inputString) {
        // Escape special characters and enclose the string in double quotes
        const escapedString = JSON.stringify(inputString);
        // Remove the enclosing double quotes added by JSON.stringify
        return escapedString.slice(1, escapedString.length - 1);
    }



}