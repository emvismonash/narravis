class NarrativeGPT{

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
            messages: this.messages
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