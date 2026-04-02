/**
 * scrape_all.js
 *
 * One-time script to scrape and populate the professor directory from staff.pes.edu.
 * Iterates over all campuses and departments and upserts professor records into MongoDB.
 *
 * Usage:
 *   node server/scrape_all.js
 *
 * Ensure MONGODB_URI is set in server/.env before running.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { scrapeProfessors } = require("./services/scraper");

const CAMPUS_DATA = {
  "EC Campus": [
    { name: "Computer Science", url: "https://staff.pes.edu/ec/atoz/computer-science/" },
    { name: "Computer Science (AIML)", url: "https://staff.pes.edu/ec/atoz/computer-science-AIML/" },
    { name: "Electronics & Communications", url: "https://staff.pes.edu/ec/atoz/electronics-&-communications/" },
    { name: "Mechanical", url: "https://staff.pes.edu/ec/atoz/mechanical/" },
    { name: "Management Studies", url: "https://staff.pes.edu/ec/atoz/management-studies/" },
    { name: "Science & Humanities", url: "https://staff.pes.edu/ec/atoz/science-&-humanities/" },
    { name: "Pharmaceutical Sciences", url: "https://staff.pes.edu/ec/atoz/pharmaceutical-sciences/" },
  ],
  "RR Campus": [
    { name: "Architecture", url: "https://staff.pes.edu/rr/atoz/architecture/" },
    { name: "Biotechnology", url: "https://staff.pes.edu/rr/atoz/biotechnology/" },
    { name: "Civil", url: "https://staff.pes.edu/rr/atoz/civil/" },
    { name: "Computer Science", url: "https://staff.pes.edu/rr/atoz/computer-science/" },
    { name: "Computer Science (AIML)", url: "https://staff.pes.edu/rr/atoz/computer-science-AIML/" },
    { name: "Computer Application", url: "https://staff.pes.edu/rr/atoz/computer-application/" },
    { name: "Design", url: "https://staff.pes.edu/rr/atoz/design/" },
    { name: "Electrical & Electronics", url: "https://staff.pes.edu/rr/atoz/electrical-&-electronics/" },
    { name: "Electronics & Communications", url: "https://staff.pes.edu/rr/atoz/electronics-&-communications/" },
    { name: "Law", url: "https://staff.pes.edu/rr/atoz/law/" },
    { name: "Mechanical", url: "https://staff.pes.edu/rr/atoz/mechanical/" },
    { name: "Science & Humanities", url: "https://staff.pes.edu/rr/atoz/science-&-humanities/" },
    { name: "Commerce", url: "https://staff.pes.edu/rr/atoz/commerce/" },
    { name: "Psychology", url: "https://staff.pes.edu/rr/atoz/psychology/" },
  ]
};

async function scrapeEverything() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("localhost")) {
    console.warn("WARNING: Connecting to a local database. Update server/.env to target Atlas.");
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected.\n");

    const campuses = Object.keys(CAMPUS_DATA);
    let totalFound = 0;

    for (const campus of campuses) {
      console.log(`\n--- ${campus} ---`);

      const departments = CAMPUS_DATA[campus];

      for (const dept of departments) {
        console.log(`  Scraping: ${dept.name}`);
        const result = await scrapeProfessors(dept.url, dept.name, campus);
        if (result && result.processed) {
          totalFound += result.processed;
        }
      }
    }

    console.log(`\nFinished. Scraped/updated ${totalFound} professors across all campuses.`);

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  }
}

scrapeEverything();
