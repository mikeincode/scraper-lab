import fs from "fs";
import amazonScraper from "amazon-buddy";

async function runTest() {
  try {
    console.log("Starting Amazon scraper test...");

    const results = await amazonScraper.products({
      keyword: "viral gadgets",
      number: 10,
      country: "US"
    });

    const output = {
      tested_at: new Date().toISOString(),
      source: "amazon-buddy",
      keyword: "viral gadgets",
      success: true,
      results
    };

    fs.mkdirSync("results", { recursive: true });

    fs.writeFileSync(
      "results/amazon-test.json",
      JSON.stringify(output, null, 2)
    );

    console.log("Saved results to results/amazon-test.json");
  } catch (error) {
    const output = {
      tested_at: new Date().toISOString(),
      source: "amazon-buddy",
      keyword: "viral gadgets",
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    };

    fs.mkdirSync("results", { recursive: true });

    fs.writeFileSync(
      "results/amazon-test.json",
      JSON.stringify(output, null, 2)
    );

    console.error("Scraper failed, saved error output.");
    process.exit(1);
  }
}

runTest();
