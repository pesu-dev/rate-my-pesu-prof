const axios = require("axios");
const cheerio = require("cheerio");
const Professor = require("../models/Professor");

const BASE_URL = "https://staff.pes.edu";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeProfessors(targetUrl, targetDepartment, targetCampus) {
  console.log(`[Scraper] Starting: ${targetDepartment} @ ${targetCampus} (${targetUrl})`);

  let page = 1;
  let totalFoundAcrossPages = 0;
  let totalProcessedAcrossPages = 0;
  const seenProfessorNames = new Set();

  try {
    while (true) {
      const pagedUrl = `${targetUrl}?page=${page}`;
      console.log(`[Scraper] Fetching page ${page}...`);

      const { data } = await axios.get(pagedUrl);
      const $ = cheerio.load(data);

      const professors = [];
      let newProfessorsOnPage = 0;

      $(".staff-profile").each((_, element) => {
        let nameText = $(element).find(".agent_card-title h4").text().trim();
        let designationText = $(element).find(".agent_card-title h5").text().trim();

        nameText = nameText.replace(/\s+/g, ' ').trim();
        designationText = designationText.replace(/\s+/g, ' ').trim();

        const profileHref = $(element).find('a.geodir-category-img_item').attr("href");
        const profileUrl = profileHref
          ? (profileHref.startsWith("http") ? profileHref : `${BASE_URL}${profileHref}`)
          : "";

        if (nameText) {
          professors.push({
            name: nameText,
            designation: designationText,
            profileUrl,
            department: targetDepartment,
            campus: targetCampus,
          });

          if (!seenProfessorNames.has(nameText)) {
            newProfessorsOnPage++;
            seenProfessorNames.add(nameText);
          }
        }
      });

      if (professors.length === 0 || newProfessorsOnPage === 0) {
        console.log(`[Scraper] No new professors found on page ${page}. Stopping.`);
        break;
      }

      console.log(`[Scraper] Found ${newProfessorsOnPage} new professor(s) on page ${page}. Writing to DB...`);
      totalFoundAcrossPages += newProfessorsOnPage;

      for (const prof of professors) {
        try {
          await Professor.updateOne(
            { name: prof.name },
            { $setOnInsert: prof },
            { upsert: true }
          );
          totalProcessedAcrossPages++;
          await delay(100);
        } catch (insertError) {
          console.error(`[Scraper] Error inserting ${prof.name}:`, insertError.message);
        }
      }

      page++;
    }

    console.log(`[Scraper] Done. Upserted ${totalProcessedAcrossPages} professors for ${targetDepartment}.`);
    return {
      success: true,
      totalFound: totalFoundAcrossPages,
      processed: totalProcessedAcrossPages,
    };
  } catch (error) {
    console.error(`[Scraper] Failed:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { scrapeProfessors };
