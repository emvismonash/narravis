class NarrativeGPT{
    constructor(){
        this.apikey;
        this.prompt;
        this.apirURL;
        this.container = {};
    }

    applySetting(jsonData){
        console.log("GPT setting", jsonData);
        this.apikey = jsonData.apiKey;
        this.prompt = jsonData.prompt;   
        this.apiURL = jsonData.apiURL;
        this.model = jsonData.model;
    }

    jsonStringifySafe(inputString) {
        // Escape special characters and enclose the string in double quotes
        const escapedString = JSON.stringify(inputString);
        // Remove the enclosing double quotes added by JSON.stringify
        return escapedString.slice(1, escapedString.length - 1);
    }

    async extractNarrativesJSON(text) {
        text = this.jsonStringifySafe(text);
        const apiKey = this.apikey;
        const apiUrl = this.apiURL; // Replace with the appropriate engine and endpoint
        let prompt = this.prompt + "\n\n" + text;
        const requestBody = {
            model: this.model, 
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
            //max_tokens: 50
        };
        

        console.log("request", requestBody);
        let result = {};
        let response = await  fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (response.ok) {
            try {
                let data = await response.json(); // This line awaits the response to be parsed as JSON
                console.log("json", data);
                if(data.choices[0]){
                    result.status = "success";
                    result.message = data.choices[0].message.content;   
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
}