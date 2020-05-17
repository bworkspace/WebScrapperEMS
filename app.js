const express = require("express");
const request = require("request-promise");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());


 async function main(url,exclude){
    const result = await request.get(url);
    const $ = cheerio.load(result);
    let ar = [];
    
    $("table > tbody > tr").each((index, element) => {
        if(index === 0) return true;
        const td = $(element).find("td");
        const nodeName = $(td[0]).text().toString().trim();
        const eventCount = $(td[3]).text().trim();

        if(eventCount > 0 && (nodeName.search("expired") > -1)){
            ar.push({
                name : nodeName.replace(exclude,'').toString(),
                count : eventCount
            })
        }
    })
    return `${JSON.stringify(ar)}, ${url}`;
}

const getUrl = (req,res) => {
    const url = ("https://" + req.params.ip + "/" + req.params.page + "." + req.params.extension).toString();
    const exclude = (req.params.exclude).toString();
    async function callForValue(){
        res.end(await main(url,exclude));
    }
    callForValue();
}
app.get("/:ip/:page/:extension/:exclude", getUrl);


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
