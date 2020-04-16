/**
 * 昨日日時を取得
 */
exports.getYesterday = function (format) {
  let now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  return dateToStr24HPad0(yesterday, format)
}

exports.getExistScrapingDay = function (format) {
  let now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)
  return dateToStr24HPad0(yesterday, format)
}

/**
 * 日付フォーマッター
 * @param {*} date 
 * @param {*} format 
 */
function dateToStr24HPad0(date, format) {
  if (!format) {
    // デフォルト値
    format = "YYYY/MM/DD hh:mm:ss";
  }

  // フォーマット文字列内のキーワードを日付に置換する
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ("0" + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ("0" + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));

  return format;
}