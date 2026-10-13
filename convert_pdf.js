const { fromPath } = require("pdf2pic");
const path = require("path");

const options = {
  density: 300,
  saveFilename: "pdf_page_1",
  savePath: "./",
  format: "png",
  width: 1200,
  height: 1600
};

const storeAsImage = fromPath("/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf", options);
storeAsImage(1).then((resolve) => {
  console.log("Page 1 is now converted as image");
  return resolve;
});
