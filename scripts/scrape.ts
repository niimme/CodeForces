import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { getEmojiAndCategory } from '../src/lib/emojiDict';
import { ProblemMetadata, TestCase } from '../src/types';

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}

interface CFProblemStat {
  contestId: number;
  index: string;
  solvedCount: number;
}

interface CFApiResponse {
  status: string;
  result: {
    problems: CFProblem[];
    problemStatistics: CFProblemStat[];
  };
}

async function fetchWithRetry(url: string, headers: Record<string, string> = {}, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          ...headers,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, err);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

async function scrape() {
  console.log('Fetching Codeforces problemset list...');
  const jsonText = await fetchWithRetry('https://codeforces.com/api/problemset.problems');
  const apiData: CFApiResponse = JSON.parse(jsonText);

  if (apiData.status !== 'OK') {
    throw new Error('Codeforces API returned non-OK status: ' + apiData.status);
  }

  // Map statistics by contestId + index
  const statMap = new Map<string, number>();
  for (const stat of apiData.result.problemStatistics) {
    statMap.set(`${stat.contestId}-${stat.index}`, stat.solvedCount);
  }

  // Attach solvedCount and sort descending
  const enrichedProblems = apiData.result.problems.map(p => ({
    ...p,
    solvedCount: statMap.get(`${p.contestId}-${p.index}`) || 0,
  }));

  enrichedProblems.sort((a, b) => b.solvedCount - a.solvedCount);

  // Take top 25 problems
  const topProblems = enrichedProblems.slice(0, 25);
  console.log(`Top ${topProblems.length} problems selected:`);
  topProblems.slice(0, 5).forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.contestId}${p.index} - ${p.name} (Solved: ${p.solvedCount})`);
  });

  const parsedProblems: ProblemMetadata[] = [];

  for (let i = 0; i < topProblems.length; i++) {
    const p = topProblems[i];
    const problemId = `${p.contestId}${p.index}`;
    console.log(`[${i + 1}/${topProblems.length}] Scraping ${problemId}: ${p.name}...`);

    const problemUrl = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
    let html = '';
    try {
      html = await fetchWithRetry(problemUrl);
    } catch (err) {
      console.error(`Failed to fetch HTML for ${problemId}:`, err);
      continue;
    }

    const $ = cheerio.load(html);
    const $statement = $('.problem-statement');

    if ($statement.length === 0) {
      console.warn(`Could not find .problem-statement for ${problemId}`);
      continue;
    }

    const title = $('.header .title', $statement).text().trim() || `${p.index}. ${p.name}`;
    const timeLimit = $('.header .time-limit', $statement).text().replace('time limit per test', '').trim();
    const memoryLimit = $('.header .memory-limit', $statement).text().replace('memory limit per test', '').trim();

    // Problem body (usually the div right after header)
    const $bodyDiv = $statement.children('div').eq(1);
    const descriptionHtml = $bodyDiv.html() || '';

    const inputSpecHtml = $('.input-specification', $statement).html() || '';
    const outputSpecHtml = $('.output-specification', $statement).html() || '';
    const noteHtml = $('.note', $statement).html() || '';

    // Sample tests
    const testCases: TestCase[] = [];
    $('.sample-test .input', $statement).each((idx, elem) => {
      const inputPre = $(elem).find('pre').text().trim();
      const outputPre = $(elem).next('.output').find('pre').text().trim();

      testCases.push({
        id: idx + 1,
        title: `Sample Test ${idx + 1}`,
        description: `Official sample test case ${idx + 1} from Codeforces.`,
        input: inputPre,
        expectedOutput: outputPre,
      });
    });

    const { emoji, category } = getEmojiAndCategory(p.name, p.tags);

    parsedProblems.push({
      id: problemId,
      contestId: p.contestId,
      index: p.index,
      title: p.name,
      emoji,
      category,
      type: 'exercise',
      rating: p.rating || 800,
      solvedCount: p.solvedCount,
      timeLimit,
      memoryLimit,
      descriptionHtml,
      inputSpecificationHtml: inputSpecHtml,
      outputSpecificationHtml: outputSpecHtml,
      sampleNotesHtml: noteHtml,
      starterCode: generateStarterCode(p.name, problemId),
      starterCodeJava: generateStarterCodeJava(p.name, problemId),
      starterCodePy: generateStarterCodePy(p.name, problemId),
      testCases,
    });

    // Be courteous with requests
    await new Promise(r => setTimeout(r, 600));
  }

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outPath = path.join(dataDir, 'problems.json');
  fs.writeFileSync(outPath, JSON.stringify(parsedProblems, null, 2), 'utf-8');
  console.log(`Successfully saved ${parsedProblems.length} problems to ${outPath}`);
}

function generateStarterCode(title: string, id: string): string {
  return `// Problem: ${id} - ${title}
#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // TODO: implement your solution here
    return 0;
}
`;
}

function generateStarterCodeJava(title: string, id: string): string {
  return `// Problem: ${id} - ${title}
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // TODO: implement your solution here
    }
}
`;
}

function generateStarterCodePy(title: string, id: string): string {
  return `# Problem: ${id} - ${title}
import sys

def solve():
    input_data = sys.stdin.read().strip().split()
    if not input_data:
        return
    # TODO: implement your solution here
    pass

if __name__ == '__main__':
    solve()
`;
}

scrape().catch(err => {
  console.error('Scrape script failed:', err);
  process.exit(1);
});
