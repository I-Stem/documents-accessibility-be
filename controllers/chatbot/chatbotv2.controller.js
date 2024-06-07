const httpStatusCodes = require("../../constants/http-status-codes");
const { formResponse } = require("../../helpers/response");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const jwtHelper = require('../../helpers/jwt');
const Session = require("../../models/session.model");

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
  "unwomen.org",
];
const modelName = "chatbot";


exports.getAll = async (req, res, next) => {
  const methodName = "get all";
  createLog(methodName, modelName);
  try {
    let auth = req.headers['authorization'];
    let userData = jwtHelper.decodeJWT(auth);
    const userId = userData.sub;
    let results = await Session.find({user_id: userId}).lean().select('title _id');
    if (results) {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, results));
        return;
    } else {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, {}));
    }
  } catch (err) {
      handleError(err, methodName, modelName);
      res.status(httpStatusCodes[500].code)
          .json(formResponse(httpStatusCodes[500].code, {}));
  }
}

exports.getById = async (req, res, next) => {
  const methodName = "get by ID";
  createLog(methodName, modelName);
  try {
      let result = await Session.findById(req.params.id).lean();
      if (result) {
          res.status(httpStatusCodes[200].code)
              .json(formResponse(httpStatusCodes[200].code, result));
          return;
      } else {
          res.status(httpStatusCodes[404].code)
              .json(formResponse(httpStatusCodes[404].code, {}));
      }
  } catch (err) {
      handleError(err, methodName, modelName);
      res.status(httpStatusCodes[500].code)
          .json(formResponse(httpStatusCodes[500].code, {}));
  }
}


exports.create = async (req, res, next) => {
  const methodName = "create";

  createLog(methodName, modelName);

  let [sessionId, message, userId] = [req.body?.sessionId, req.body?.message, req.body?.userId];

  // if the session does not already exist

  if (sessionId === undefined) {
    try {
      let data = {
        user_id: userId,
        title: message.content,
        messages: [{
          role: 'system',
          content: `Hi, I am the GNYPWD bot that will help answer your questions 
          around disability programs, opportunities and initiatives at the UN, 
          DPOs and more generally. Ask me any question, and I will find information 
          from reliable websites.`
        },
        message],
      };

      var result = await Session.create(data);

      sessionId = result._id;
    } catch (err) {
      handleError(err, methodName, modelName);
      res
        .status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
  }

  // if the session already exist - add user message
  else {
    try {

      var result = await Session.findByIdAndUpdate(
        sessionId,
        { $push: { messages: message } },
        { upsert: true, new: true }
      );

    } catch (err) {
      handleError(err, methodName, modelName);
      res
        .status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
  }

  try {

    let messages = [];

    result.messages.map((item) => {

      messages.push({
        role: item.role,
        content: item.content,
      });
    });

    if (!messages.length) {
      throw new Error("No messages in body");
    }
    // Query the LLM for relevant search terms
    const searchTermsResponse = await axios.post(
      openaiUrl,
      {
        messages: [
          ...messages,
          {
            role: "system",
            content:
              "What would be the relevant search terms for the web search based on the user's question? Please provide only the search terms as they will be used programmatically.",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": openaiApiKey,
        },
      }
    );

    const searchTerms = searchTermsResponse.data.choices[0].message.content;

    const searchResponse = await axios.get(bingSearchUrl, {
      params: { q: searchTerms, textDecorations: true, textFormat: "HTML" },
      headers: { "Ocp-Apim-Subscription-Key": bingSearchApiKey },
    });
    const searchContent = [];
    const usedUrls = [];

    for (const result of searchResponse.data.webPages.value) {
      if (websites.some((website) => result.url.includes(website))) {
        console.log("connecting to " + result.url);
        try {
          const webpageResponse = await axios.get(result.url);
          const $ = cheerio.load(webpageResponse.data);
          const pageText = $("p")
            .toArray()
            .map((p) => $(p).text())
            .join(" ");
          searchContent.push(pageText);
          usedUrls.push(result.url);
          if (searchContent.length === 3) {
            break;
          }
        } catch (err) {
          console.log(err);
          continue;
        }
      }
    }

    const finalSearchContent = searchContent.join(" ");
    const payload = {
      messages: [
        ...messages,
        {
          role: "system",
          content: `Here's some additional information that can help you provide an up-to-date answer. 
          The following URLs were used for this information and you absolutely must cite these URLs in the 
          answer you provide the user: ${usedUrls.join(", ")}`,
        },
        {
          role: "system",
          content: `Your answer should be HTML code snippet with paragraph and lists within p and ul or ol 
          tags. The source links should also be proper hyperlinks with the href attribute pointing to 
          those links while the link text reflecting their titles or similar text defining the pages. 
          Do not give a plain text answer, make sure you provide an HTML code snippet as an answer.`
        },
        { role: "assistant", content: finalSearchContent },
      ],
    };
    const llmResponse = await axios.post(openaiUrl, payload, {
      headers: { "Content-Type": "application/json", "api-key": openaiApiKey },
    });
    const answer = llmResponse.data.choices[0].message.content;

    result = { role: "assistant", content: answer };

    // add assistant message

    try {

      var response = await Session.findByIdAndUpdate(
        sessionId,
        { $push: { messages: result } },
        { upsert: true, new: true }
      );

      console.log('response==>>', response)
    } catch (err) {
      handleError(err, methodName, modelName);
      res
        .status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }

    res
      .status(httpStatusCodes[200].code)
      .json(formResponse(httpStatusCodes[200].code, {title:response.title, result, sessionId }));
  } catch (err) {
    handleError(err, methodName, modelName);
    res
      .status(httpStatusCodes[500].code)
      .json(formResponse(httpStatusCodes[500].code, {}));
  }
};

exports.continueChat = async (req, res, next) => {
  const methodName = "continue chat";
  createLog(methodName, modelName);

  let messages = req.body?.messages;
  const payload = {
    messages: messages,  
  };
  const llmResponse = await axios.post(openaiUrl, payload, {
    headers: { "Content-Type": "application/json", "api-key": openaiApiKey },
  });
  const answer = llmResponse.data.choices[0].message.content;

  const result = { role: "assistant", content: answer }
  res.status(httpStatusCodes[200].code)
    .json(formResponse(httpStatusCodes[200].code, result));
}