class NarrativeGPT{
    constructor(){
        this.messages = [];
        this.currentchunk;
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

    async chatStream(prompt, streamfunc, completefunc, t){
        const request = this.createRequest(prompt);
        let c = this;
        try {
            const response =  await fetch(request.url, request.request)
                                        .then((response) => response.body)
                                        .then((rb) => {
                                            const reader = rb.getReader();      
                                            c.readablestream = new ReadableStream({
                                            start(controller) {
                                                // The following function handles each data chunk
                                                function push() {
                                                    reader.read().then(({ done, value }) => {
                                                        // If there is no more data to read
                                                        if (done) {
                                                            console.log("done", done);
                                                            completefunc(t);
                                                            controller.close();
                                                            return;
                                                        }
                                                        try{
                                                            controller.enqueue(value);
                                                            streamfunc(value, t);                                          
                                                            push();
                                                        }catch(err){

                                                        }

                                                    });
                                                }
                                                push();
                                            },
                                            });
                                            return c.readablestream;
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