/**
 * csv関連の処理
 */
const stringify = require("csv-stringify");
const fs = require("fs");
const path = require("path");

/**
 * csvファイルを作成・編集する
 * @param {*} data
 */
exports.outputCsv = function (data, filename) {
  stringify(data, (error, csvString) => {
    fs.appendFile(
      path.join(__dirname, `../csv/${filename}.csv`),
      csvString,
      (err) => {
        if (err) throw err;
      }
    );
  });
}