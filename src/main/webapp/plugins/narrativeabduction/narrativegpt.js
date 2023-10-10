class NarrativeGPT{
    constructor(apikey){
        this.apikey = apikey
    }

    async extractNarrativesJSON(text) {
        const apiKey = this.apikey;
        const apiUrl = 'https://api.openai.com/v1/engines/davinci/completions'; // Replace with the appropriate engine and endpoint
        let prompt = 'Extract narratives from this text. Format the output as JSON that follows node - link diagram format. The node should have properties named id, title, description, and type. The link should have properties named id, sourceId, targetId, and type.  The value of the node"s type is NarrativeItem. The value of the link"s type is CauseLink.  Here is the text:';
        prompt = prompt + " " + text;
        const requestBody = {
            prompt,
            max_tokens: 50
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the API response data here
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}