const express = require("express");
const router = express.Router();
const multer = require("multer");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Set up Multer storage with a destination and filename function
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

router.post("/generate-pdf", upload.single("file"), async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const filePath = process.cwd() + "/uploads/" + req.file.filename;

  const relativeFilePath = path.join("uploads/", req.file.filename);

  // Convert filePath to a file URL
  const fileUrl = "file://" + filePath.replace(/\\/g, "/"); // Replace backslashes with forward slashes

  await page.goto(fileUrl, {
    waitUntil: "networkidle2",
  });

  const pdfPath = `${process.cwd()}/uploads/${Math.random()}.pdf`;
  await page.pdf({
    path: pdfPath,
    format: "a4",
    scale: 1.3,
    printBackground: true,
    margin: {
      left: 30,
      top: 30,
      bottom: 30,
      right: 30,
    },
    displayHeaderFooter: true,
  });
  await browser.close();

  const clearImage = (filePath) => {
    fs.unlink(filePath, (err) => console.log(err));
  };

  res.sendFile(pdfPath);

  // Delete all the files after 10 seconds
  setTimeout(() => {
    clearImage(relativeFilePath);
    clearImage(pdfPath);
  }, 10000);
});

module.exports = router;
