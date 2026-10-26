import fs from 'fs';
import readline from 'readline';

async function extractStep(stepNumber, outFile) {
  const fileStream = fs.createReadStream('C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\051e1b0a-e8be-4e77-bc1d-b6c22c8eea9b\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes(`"step_index":${stepNumber}`) && line.includes('"source":"USER_EXPLICIT"')) {
      const obj = JSON.parse(line);
      fs.writeFileSync(outFile, obj.content);
      console.log(`Saved step ${stepNumber} to ${outFile} (${obj.content.length} bytes)`);
      break;
    }
  }
}

async function main() {
  await extractStep(934, 'step934.txt');
  await extractStep(1021, 'step1021.txt');
  await extractStep(1633, 'step1633.txt');
}
main();
