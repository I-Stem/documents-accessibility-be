const httpStatusCodes = require("../../constants/http-status-codes");
const {formResponse} = require("../../helpers/response");
const {handleError} = require("../../helpers/error");
const {createLog} = require("../../helpers/logger");
const cheerio = require('cheerio');
const axios = require('axios');

const openaiApiKey = process.env.OPENAI_API_KEY;
const bingSearchApiKey = process.env.BING_SEARCH_API_KEY;
const openaiUrl = process.env.OPENAI_URL;
const bingSearchUrl = process.env.BING_SEARCH_URL;
const websites = [
    "un.org",
    "unicef.org",
    "unesco.org",
    "undp.org",
    "wfp.org",
    "unhcr.org",
    "unodc.org",
    "unep.org",
    "unfpa.org",
    "who.int",
    "ilo.org",
    "imf.org",
    "worldbank.org",
    "ifad.org",
    "unido.org",
    "unitar.org",
    "wmo.int",
    "wipo.int",
    "unrwa.org",
    "icao.int",
    "imo.org",
    "ohchr.org",
    "fao.org",
    "unwomen.org"
];
const modelName = "chatbot";

exports.create = async (req, res, next) => {
    const methodName = "create";
    try {
        messages = req.body.messages;
        if (!messages.length) {
            throw new Error("No messages in body")
        }
        // Query the LLM for relevant search terms
        const searchTermsResponse = await axios.post(openaiUrl, {
            messages: [...messages, { role: 'system', content: 'What would be the relevant search terms for the web search based on the user\'s question? Please provide only the search terms as they will be used programmatically.' }],
        }, {
            headers: { 'Content-Type': 'application/json', 'api-key': openaiApiKey }
        });
        const searchTerms = searchTermsResponse.data.choices[0].message.content;
        
        const searchResponse = await axios.get(bingSearchUrl, {
            params: { q: searchTerms, textDecorations: true, textFormat: 'HTML' },
            headers: { 'Ocp-Apim-Subscription-Key': bingSearchApiKey }
        });
        const searchContent = [];
        const usedUrls = [];
    
        for (const result of searchResponse.data.webPages.value) {
            if (websites.some(website => result.url.includes(website))) {
                console.log("connecting to " + result.url)
                try {
                    const webpageResponse = await axios.get(result.url);
                    const $ = cheerio.load(webpageResponse.data);
                    const pageText = $('p').toArray().map(p => $(p).text()).join(' ');
                    searchContent.push(pageText);
                    usedUrls.push(result.url);
                    if (searchContent.length === 3) {
                        break;
                    }
                } catch(err) {
                    console.log(err);
                    continue;
                }
            }
        }
        
        const finalSearchContent = searchContent.join(' ');
        const payload = {
            messages: [
                ...messages,
                { role: 'system', content: `Here's some additional information that can help you provide an up-to-date answer. The following URLs were used for this information and you absolutely must cite these URLs in the answer you provide the user: ${usedUrls.join(', ')}` },
                { role: 'assistant', content: finalSearchContent }
            ],
        }
        const llmResponse = await axios.post(openaiUrl, payload, {
            headers: { 'Content-Type': 'application/json', 'api-key': openaiApiKey }
        });
        const answer = llmResponse.data.choices[0].message.content;
        
        result = { role: 'assistant', content: answer }
        res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code, result));
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
}