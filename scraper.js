import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

const keywords = [
  "phone stand",
  "desk lamp",
  "kitchen gadgets",
  "wireless earbuds",
  "water bottle"
];

function cleanText(value) {
  return value
    ? value.replace(/\s+/g, " ").trim()
    : "";
}

function detectBlock(html) {
  const lower = html.toLowerCase();

  return (
    lower.includes("captcha") ||
    lower.includes("robot check") ||
    lower.includes("enter the characters you see below") ||
    lower.includes("sorry, we just need to make sure you're not a robot")
  );
}

async function scrapeAmazonSearch(keyword) {
  const url =
    "https://www.amazon.com/s?k=" +
    encodeURIComponent(keyword);

  console.log("Testing:", keyword);

  const response = await axios.get(url, {
    timeout: 20000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language":
        "en-US,en;q=0.9",
      "Cache-Control":
        "no-cache"
    },
    validateStatus: () => true
  });

  const html = response.data || "";
  const $ = cheerio.load(html);

  const pageTitle =
    cleanText($("title").text());

  const captchaDetected =
    detectBlock(html);

  const productCards =
    $("[data-component-type='s-search-result']")
      .toArray();

  const products = [];

  for (const card of productCards) {
    const el = $(card);

    const asin =
      el.attr("data-asin") || "";

    const title =
      cleanText(
        el.find("h2 span").first().text()
      );

    const relativeUrl =
      el.find("a.a-link-normal.s-no-outline")
        .attr("href") ||
      el.find("h2 a").attr("href") ||
      "";

    const productUrl =
      relativeUrl.startsWith("http")
        ? relativeUrl
        : relativeUrl
          ? "https://www.amazon.com" + relativeUrl
          : "";

    const image =
      el.find("img.s-image").attr("src") || "";

    const priceWhole =
      cleanText(
        el.find(".a-price-whole").first().text()
      );

    const priceFraction =
      cleanText(
        el.find(".a-price-fraction").first().text()
      );

    const price =
      priceWhole
        ? `$${priceWhole}${priceFraction ? "." + priceFraction : ""}`
        : "";

    const rating =
      cleanText(
        el.find(".a-icon-alt").first().text()
      );

    const reviews =
      cleanText(
        el.find("span.a-size-base.s-underline-text")
          .first()
          .text()
      );

    if (title || asin) {
      products.push({
        asin,
        title,
        price,
        rating,
        reviews,
        image,
        url: productUrl
      });
    }
  }

  return {
    keyword,
    requestUrl: url,
    status: response.status,
    pageTitle,
    htmlLength: html.length,
    captchaDetected,
    productCardCount: productCards.length,
    extractedCount: products.length,
    sample: products.slice(0, 10)
  };
}

async function runTest() {
  const tests = [];

  for (const keyword of keywords) {
    try {
      const result =
        await scrapeAmazonSearch(keyword);

      tests.push({
        success:
          result.extractedCount > 0,
        ...result
      });
    } catch (error) {
      tests.push({
        keyword,
        success: false,
        error: error.message
      });
    }
  }

  const output = {
    tested_at: new Date().toISOString(),
    source: "custom-amazon-search-scraper",
    tests
  };

  fs.mkdirSync("results", {
    recursive: true
  });

  fs.writeFileSync(
    "results/amazon-own-test.json",
    JSON.stringify(output, null, 2)
  );

  console.log(
    "Saved results to results/amazon-own-test.json"
  );
}

runTest();
