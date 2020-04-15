const puppeteer = require("puppeteer");
const stringify = require("csv-stringify");
const fs = require("fs");
const path = require("path");
const date = require("./helper/date");

const existChannelLists = require("./definitions/exist_channel_list");

/**
 * 新規channelスクレイピングする時に取得する
 */
(async () => {
  // open browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await scraping(page, existChannelLists);

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
    await scrapingYoutube(page, channel.url);
  }
}

/**
 * yourtubeからデータを映画紹介をスクレピングする
 * @param {*} page
 * @param string channelUrl
 */
async function scrapingYoutube(page, channelUrl) {
  await page.goto(channelUrl, {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  /////////////////////
  // 検索処理
  // ボタンアイコン押下
  const search_button_selector =
    "#tabsContent > .style-scope > .style-scope > #button > .style-scope";
  await page.waitForSelector(search_button_selector);
  await page.click(search_button_selector);

  // フィルター記述
  const search_field_selector =
    "#container > .input-wrapper > #labelAndInputContainer > #input-1 > .style-scope";
  await page.waitForSelector(search_field_selector);
  // 昨日の日付
  // await page.type(search_field_selector, `after:${date.getYesterday("YYYY-MM-DD")}`);
  await page.type(search_field_selector, "after:2020-04-10");
  await page.keyboard.press("Enter");

  /////////////////////
  // 検索結果の動画一覧を取得
  await page.waitForSelector(
    "ytd-item-section-renderer.ytd-section-list-renderer:nth-child(1) > #contents"
  );

  await page.waitFor(3000);

  const data = await page.evaluate(() => {
    const elementCount = document.querySelectorAll(
      "ytd-item-section-renderer.ytd-section-list-renderer"
    ).length;
    const data = [];

    for (let i = 1; i <= elementCount; i++) {
      let text = document.querySelector(
        `ytd-item-section-renderer.ytd-section-list-renderer:nth-child(${i}) > #contents > ytd-video-renderer > #dismissable > .text-wrapper > #meta > #title-wrapper > h3 > a#video-title`
      );

      // nullで抜ける
      if (text === null) break;

      let movie = [
        text.textContent.trim(),
        "https://www.youtube.com/" + text.getAttribute("href").trim(),
      ];

      data.push(movie);
    }

    return data;
  });

  await outputCsv(data);
}

/**
 * csvファイルを作成・編集する
 * @param {*} data
 */
async function outputCsv(data) {
  stringify(data, (error, csvString) => {
    fs.appendFile(
      path.join(__dirname, `csv/${date.getYesterday("YYYY-MM-DD")}-movies.csv`),
      csvString,
      (err) => {
        if (err) throw err;
      }
    );
  });
}