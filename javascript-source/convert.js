const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const katex = require('katex');
const fs = require('node:fs/promises');
const path = require('node:path');

function recurse(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      recurse(obj[key]);
    }
    if (key === 'tex') {
      let isBlock = obj[':@']?.["@_display"] === "block";
      let html = katex.renderToString(
        obj.tex[0]["#text"],
        {
          trust: true,
          throwOnError: false,
          displayMode: isBlock
        }
      )
      obj.tex.push({
        rendered: [{
          "#text": html
        }]
      })
    }
  }
}

async function convert(name) {
  const file = await fs.readFile(name);
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    alwaysCreateTextNode: true,
    preserveOrder: true,
    trimValues: false,
    parseTagValue: false,
    parseAttributeValue: false
  };
  let parser = new XMLParser(options);
  let obj = parser.parse(file);
  recurse(obj);
  let builder = new XMLBuilder(options);
  const result = builder.build(obj);
  await fs.writeFile(name, result);
}

async function start() {
  const files = await fs.readdir("output");
  for (const file of files) {
    if (file.endsWith("xml")) {
      console.log("Converting", file);
      convert(path.join("output", file));
    }
  }
}

start();
