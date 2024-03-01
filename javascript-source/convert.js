const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const katex = require('katex');
const fs = require('node:fs/promises');

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

async function test() {
  const file = await fs.readFile("./test.xml");
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    alwaysCreateTextNode: true,
    preserveOrder: true,
    trimValues: false
  };
  let parser = new XMLParser(options);
  let obj = parser.parse(file);
  recurse(obj);
  let builder = new XMLBuilder(options);
  const result = builder.build(obj);
  await fs.writeFile("./testr.xml", result);
}

test();
