const newChannelLists = require("./definitions/new_channel_list");

const puppeteer = require("puppeteer");
const date = require("./helper/date");
const csv = require("./helper/csv");

/**
 * 新規channelスクレイピングする時に取得する
 */
(async () => {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await scraping(page, newChannelLists)

  await browser.close();
})();

/**
 * 全チャンネルスクレイピングする
 * この関数を作らないと、非同期をforeachで回した時に`await is only valid in async function`エラーがでる
 * @param {*} page 
 * @param {*} channelLists 
 */
async function scraping(page, channelLists) {
  for (channel of channelLists) {
    await scrapingYoutube(page, channel.url)
    process.stdout.write('.')
  }
}

/**
 * yourtubeからデータを映画紹介をスクレピングする
 * @param {*} page 
 * @param string channelUrl 
 */
async function scrapingYoutube(page, channelUrl) {
  await page.goto(
    channelUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 0
    });

  await page.waitForSelector("#items", {
    waitUntil: "domcontentloaded",
    timeout: 0
  });

  await page.waitForSelector("ytd-grid-video-renderer");

  const data = await page.evaluate(() => {
    const elementCount = document.getElementsByTagName(
      "ytd-grid-video-renderer"
    ).length;
    const data = [];

    for (let i = 1; i <= elementCount; i++) {
      let text = document.querySelector(
        `ytd-grid-renderer #items ytd-grid-video-renderer:nth-child(${i}) #dismissable #details #meta h3 a`
      );

      let href = "https://www.youtube.com/" + text.getAttribute("href").trim()
      let sql = [
        `INSERT INTO movies (title, title_for_search, youtube_url) VALUES ('${text.textContent.trim()}', '${text.textContent.trim()}', '${href}');`
      ]

      data.push(sql);
    }

    return data;
  });

  const today = await date.getToday('YYYY-MM-DD');
  await csv.outputCsv(data, `${today}-new-channel`);
}