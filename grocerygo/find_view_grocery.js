const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\deepak\\.gemini\\antigravity-ide\\brain\\04bdc314-7b2e-4227-8987-59cd0f745381\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let matchIndex = 0;
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      // Let's look for any step content or tool calls that contain the file content
      const contentStr = JSON.stringify(data);
      if (contentStr.includes('view-grocery/page.tsx') && contentStr.includes('Manage Groceries')) {
        fs.writeFileSync(`found_content_${matchIndex}.json`, line);
        matchIndex++;
      }
    } catch (e) {
      // ignore
    }
  }
  console.log(`Found ${matchIndex} matching lines in transcript.`);
}

main();
