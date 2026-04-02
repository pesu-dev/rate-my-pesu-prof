const axios = require("axios");
const cheerio = require("cheerio");

/**
 * AcademyService
 * Responsible for scraping student's academic history (professor names) from pesuacademy.com.
 * Used during login to populate a student's list of professors they are allowed to review.
 */

const ACADEMY_BASE_URL = "https://www.pesuacademy.com";

function log(msg) {
    console.log(`[AcademyService] ${msg}`);
}

async function getAllowedProfessors(username, password) {
    log(`Fetching academic history for ${username}...`);

    try {
        // Step 1: Initial GET to establish a session and obtain cookies
        const response = await axios.get(`${ACADEMY_BASE_URL}/Academy/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let cookies = response.headers['set-cookie'] || [];
        let cookieString = cookies.map(c => c.split(';')[0]).join('; ');

        // Step 2: Authenticate with PESU Academy
        const loginPayload = new URLSearchParams();
        loginPayload.set("j_username", username);
        loginPayload.set("j_password", password);

        const loginRes = await axios.post(
            `${ACADEMY_BASE_URL}/Academy/j_spring_security_check`,
            loginPayload.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': `${ACADEMY_BASE_URL}/Academy/`
                },
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400
            }
        );

        if (loginRes.headers['set-cookie']) {
            cookieString = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }

        // Step 3: Fetch current semester attendance summary
        const attendanceRes = await axios.get(
            `${ACADEMY_BASE_URL}/Academy/attendance/studentAttendanceSummary`,
            {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );

        // Step 4: Fetch historical academic record (past semesters)
        let recordsData = "";
        try {
            const recordsRes = await axios.get(
                `${ACADEMY_BASE_URL}/Academy/student/record`,
                {
                    headers: {
                        'Cookie': cookieString,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                }
            );
            recordsData = recordsRes.data;
        } catch (e) {
            log(`Could not fetch academic record: ${e.message}`);
        }

        // Parse professor names from the combined HTML
        const fullHtml = attendanceRes.data + recordsData;
        const $ = cheerio.load(fullHtml);
        const professorNames = new Set();

        $('table tr').each((_, row) => {
            $(row).find('td').each((_, cell) => {
                const text = $(cell).text().trim()
                    .replace(/\s+/g, ' ')
                    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s*/i, "");

                if (
                    text.length > 5 &&
                    text.split(' ').length >= 2 &&
                    !/^\d/.test(text) &&
                    !text.includes('%') &&
                    !text.includes('Total') &&
                    !text.includes('Academic') &&
                    !text.includes('Course') &&
                    !text.includes('Semester') &&
                    text.length < 50
                ) {
                    professorNames.add(text);
                }
            });
        });

        log(`Extracted ${professorNames.size} unique professor names.`);
        return Array.from(professorNames);

    } catch (err) {
        log(`Error fetching academic history: ${err.message}`);
        return null;
    }
}

module.exports = { getAllowedProfessors };
