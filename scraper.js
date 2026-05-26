import fs from "fs";
import amazonScraper from "amazon-buddy";

const keywords = [
  "phone stand",
  "desk lamp",
  "kitchen gadgets",
  "wireless earbuds",
  "water bottle"
];

async function runTest() {
  const allResults = [];

  for (const keyword of keywords) {
    try {
      console.log(`Testing keyword: ${keyword}`);

      const results = await amazonScraper.products({
        keyword,
        number: 10,
        country: "US"
      });

      allResults.push({
        keyword,
        success: true,
        totalProducts: results.totalProducts || null,
        category: results.category || null,
        resultCount: results.result ? results.result.length : 0,
        sample: results.result ? results.result.slice(0, 3) : []
      });
    } catch (error) {
      allResults.push({
        keyword,
        success: false,
        error: error.message
      });
    }
  }

  const output = {
    tested_at: new Date().toISOString(),
    source: "amazon-buddy",
    tests: allResults
  };

  fs.mkdirSync("results", { recursive: true });

  fs.writeFileSync(
    "results/amazon-test.json",
    JSON.stringify(output, null, 2)
  );

  console.log("Saved results to results/amazon-test.json");
}

runTest();
