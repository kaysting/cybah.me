
const fs = require('fs');
const axios = require('axios');

// Recycled from gpt.simplecyber.org
const getModelResponse = async(prompt, n = 1) => {
    try {
        const model = 'gpt-4-1106-preview';
        const systemPrompt = 'You are a helpful assistant.';
        const key = '';
        const requestTimeout = 90*1000;
        let retryCount = 3;
        let res;
        while (retryCount > 0) {
            try {
                res = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model, n,
                    messages: [{
                        role: 'system',
                        content: systemPrompt
                    }, {
                        role: 'user',
                        content: prompt
                    }]
                }, {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                    },
                    timeout: requestTimeout
                });
                break;
            } catch (error) {
                retryCount--;
                if (retryCount == 0) {
                    throw error;
                }
            }
        }
        return {
            time: Date.now(),
            model,
            system_prompt: systemPrompt,
            prompt,
            response:
                res.data.choices.length == 1
                    ? res.data.choices[0].message.content
                    : res.data.choices.map(x => x.message.content),
            tokens: {
                input: res.data.usage.prompt_tokens,
                output: res.data.usage.completion_tokens
            }
        };
    } catch (error) {
        console.error(error, error.response?.data);
        return {
            error: error.response?.data?.error?.message || `${error}`
        };
    }
};

const generateSection = async section => {
    const prompt = fs.readFileSync('./prompt.txt', 'utf8');
    const file = `./${section}.md`;
    if (fs.existsSync(file)) return console.error(`File ${file} already exists`);
    console.log(`Generating section ${section}`);
    const res = await getModelResponse(prompt.replace('SECTION_PLACEHOLDER', section));
    if (!res.response) return console.error(res.error);
    fs.writeFileSync(file, res.response);
    console.log(`Wrote ${file}`);
};

(async() => {
    const sections = process.argv[2].split(',');
    for (const section of sections)
        await generateSection(section);
})();