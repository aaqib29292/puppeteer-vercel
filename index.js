const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    const domain = 'https://finschoolb.dev.newtonclassroom.com'
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaXNzaW9uT2ZmaWNlciIsImVtYWlsIjoicHJvLmFkbUBnZWR1LmRlbW8uc3VycmVhbC5jb21wYW55Iiwic2Nob29sSWQiOjE3LCJzY2hvb2xDb2RlIjoiZmluc2Nob29sYiIsImlhdCI6MTY3NjI4Njk0Mn0.5ZAzo7p7jnrxSHzDawub5tcmBC4waExoJLhXueM8wDo'

    let browser = await puppeteer.launch(options);

    const page = await browser.newPage();
    await page.goto(`${domain}/login?status=success&jwt=${token}&role=admin`, {
      waitUntil: 'networkidle2',
    })
    await page.goto(`${domain}/no-menu/receipts/fees`, {
      waitUntil: 'networkidle2',
    });
    // page.pdf() is currently supported only in headless mode.
    // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
    const buffer = await page.pdf({
      format: 'A4',
    });

    // await browser.close();

    res.set('Content-Type', 'application/pdf')
    res.status(201).send(Buffer.from(buffer, "binary"))
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
