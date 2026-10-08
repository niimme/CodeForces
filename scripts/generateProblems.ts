import * as fs from 'fs';
import * as path from 'path';
import { ProblemMetadata, TestCase } from '../src/types';

export const PROBLEMS_DATA: ProblemMetadata[] = [
  {
    id: "4A",
    contestId: 4,
    index: "A",
    title: "Watermelon",
    emoji: "🍉",
    category: "Math / Brute Force",
    type: "exercise",
    rating: 800,
    solvedCount: 735683,
    timeLimit: "1.0s",
    memoryLimit: "64MB",
    descriptionHtml: `
      <p>One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed $w$ kilos.</p>
      <p>They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.</p>
      <p>Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs an <strong>even number of kilos</strong>, at the same time it is not obligatory that the parts are equal.</p>
      <p>The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and find out, if they can divide the watermelon in the way they want. For sure, each of them should get a part of positive weight.</p>
    `,
    inputSpecificationHtml: `
      <p>The first (and the only) input line contains integer number $w$ ($1 \\le w \\le 100$) &mdash; the weight of the watermelon bought by the boys.</p>
    `,
    outputSpecificationHtml: `
      <p>Print <code>YES</code>, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and <code>NO</code> in the opposite case.</p>
    `,
    sampleNotesHtml: `
      <p>For example, the boys can divide the watermelon into two parts of $2$ and $6$ kilos respectively (another variant &mdash; two parts of $4$ and $4$ kilos).</p>
    `,
    starterCode: `/**
 * Problem: 4A - Watermelon
 * Language: C++ (C++20 / clang++)
 * Input: w (integer weight, 1 <= w <= 100)
 * Output: "YES" or "NO"
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int w;
    if (cin >> w) {
        // Both parts must be positive even integers (>= 2).
        // Smallest even sum of two positive even numbers is 2 + 2 = 4.
        if (w > 2 && w % 2 == 0) {
            cout << "YES\n";
        } else {
            cout << "NO\n";
        }
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 4A - Watermelon
 * Language: C++ (C++20 / clang++)
 * Input: w (integer weight, 1 <= w <= 100)
 * Output: "YES" or "NO"
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int w;
    if (cin >> w) {
        // Both parts must be positive even integers (>= 2).
        // Smallest even sum of two positive even numbers is 2 + 2 = 4.
        if (w > 2 && w % 2 == 0) {
            cout << "YES\n";
        } else {
            cout << "NO\n";
        }
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 4A - Watermelon
 * Input: w (integer as string or number)
 * Return: 'YES' or 'NO'
 */
function solve(input) {
  const w = parseInt(input.trim(), 10);
  
  // Each part must weigh an even number of kilos, and be > 0.
  if (w > 2 && w % 2 === 0) {
    return "YES";
  }
  return "NO";
}
`,
    starterCodePy: `def solve(input_str):
    w = int(input_str.strip())
    if w > 2 and w % 2 == 0:
        return "YES"
    return "NO"
`,
    hints: [
      "Both parts must be even positive integers: part1 >= 2 and part2 >= 2.",
      "The sum of two even numbers is always even. So if w is odd, it's impossible!",
      "Beware of small even numbers: what happens when w = 2? The only positive division is 1 + 1, but 1 is odd!"
    ],
    explanation: "For the watermelon to be split into two positive even integers, say $2k$ and $2m$, the total weight must be $w = 2k + 2m = 2(k+m)$, which is even. Furthermore, since $k \\ge 1$ and $m \\ge 1$, $w \\ge 4$. Therefore, any even number strictly greater than 2 can be split into $2$ and $w - 2$. Hence, answer is YES if $w > 2$ and $w \\% 2 == 0$, else NO.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Even Weight 8",
        description: "Official sample test: 8 can be divided into 2 + 6 or 4 + 4.",
        input: "8",
        expectedOutput: "YES"
      },
      {
        id: 2,
        title: "Edge Case: Minimum Even Weight 2",
        description: "Critical edge case: 2 can only be split into 1 and 1, neither of which is even.",
        input: "2",
        expectedOutput: "NO"
      },
      {
        id: 3,
        title: "Edge Case: Smallest Valid Weight 4",
        description: "Smallest valid split: 2 + 2 = 4.",
        input: "4",
        expectedOutput: "YES"
      },
      {
        id: 4,
        title: "Odd Weight: 7",
        description: "An odd number cannot be the sum of two even numbers.",
        input: "7",
        expectedOutput: "NO"
      },
      {
        id: 5,
        title: "Maximum Constraint: 100",
        description: "Upper bound test case: 100 is even and > 2 (e.g. 50 + 50).",
        input: "100",
        expectedOutput: "YES"
      }
    ]
  },
  {
    id: "71A",
    contestId: 71,
    index: "A",
    title: "Way Too Long Words",
    emoji: "🔤",
    category: "Strings",
    type: "exercise",
    rating: 800,
    solvedCount: 535956,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Sometimes some words like <em>"localization"</em> or <em>"internationalization"</em> are so long that writing them many times in one text is quite tiresome.</p>
      <p>Let's consider a word <strong>too long</strong>, if its length is <strong>strictly more than 10 characters</strong>. All too long words should be replaced with a special abbreviation.</p>
      <p>This abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeroes.</p>
      <p>Thus, <em>"localization"</em> will be spelt as <em>"l10n"</em>, and <em>"internationalization"</em> will be spelt as <em>"i18n"</em>.</p>
      <p>You are suggested to automatize the process of changing the words with abbreviations. At that all too long words should be replaced by the abbreviation and the words that are not too long should not undergo any changes.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains an integer $n$ ($1 \\le n \\le 100$). Each of the following $n$ lines contains one word. All the words consist of lowercase Latin letters and possess lengths from $1$ to $100$ characters.</p>
    `,
    outputSpecificationHtml: `
      <p>Print $n$ lines. The $i$-th line should contain the result of replacing of the $i$-th word from the input data.</p>
    `,
    sampleNotesHtml: `
      <p>For a word of length $\\le 10$, output it as is. For a word of length $> 10$, abbreviation is <code>word[0] + (length - 2) + word[last]</code>.</p>
    `,
    starterCode: `/**
 * Problem: 71A - Way Too Long Words
 * Language: C++ (C++20 / clang++)
 * Input: n words
 * Output: Abbreviate words with length > 10
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        while (n--) {
            string s;
            cin >> s;
            if (s.length() > 10) {
                cout << s.front() << (s.length() - 2) << s.back() << "\n";
            } else {
                cout << s << "\n";
            }
        }
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 71A - Way Too Long Words
 * Language: C++ (C++20 / clang++)
 * Input: n words
 * Output: Abbreviate words with length > 10
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        while (n--) {
            string s;
            cin >> s;
            if (s.length() > 10) {
                cout << s.front() << (s.length() - 2) << s.back() << "\n";
            } else {
                cout << s << "\n";
            }
        }
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 71A - Way Too Long Words
 * Input: Multiline string containing n, followed by n words
 * Return: Abbreviated words separated by newline
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const n = parseInt(lines[0], 10);
  const results = [];
  
  for (let i = 1; i <= n; i++) {
    const word = lines[i];
    if (word.length > 10) {
      const abbr = word[0] + (word.length - 2) + word[word.length - 1];
      results.push(abbr);
    } else {
      results.push(word);
    }
  }
  
  return results.join('\n');
}
`,
    starterCodePy: `def solve(input_str):
    lines = [l.strip() for l in input_str.strip().split('\\n') if l.strip()]
    n = int(lines[0])
    res = []
    for word in lines[1:n+1]:
        if len(word) > 10:
            res.append(f"{word[0]}{len(word)-2}{word[-1]}")
        else:
            res.append(word)
    return '\\n'.join(res)
`,
    hints: [
      "Check length: is length strictly greater than 10? (> 10, not >= 10).",
      "If length <= 10, print the word untouched.",
      "The abbreviation formula is: word[0] + (word.length - 2) + word[word.length - 1]."
    ],
    explanation: "Iterate through each word. Check its character length. If length is greater than 10, format as the first char, the number (length - 2), and the last char. Otherwise output the original word.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Mixed Lengths",
        description: "Official sample with short words and extremely long words.",
        input: "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis",
        expectedOutput: "word\nl10n\ni18n\np43s"
      },
      {
        id: 2,
        title: "Boundary Test: Exact Length 10",
        description: "Words with exactly 10 letters must NOT be abbreviated.",
        input: "2\nautomobile\nrevolution",
        expectedOutput: "automobile\nrevolution"
      },
      {
        id: 3,
        title: "Boundary Test: Length 11",
        description: "Words with 11 letters are the smallest to be abbreviated (11 - 2 = 9).",
        input: "1\nexceptional",
        expectedOutput: "e9l"
      },
      {
        id: 4,
        title: "Single Character Words",
        description: "Very short single-letter words.",
        input: "3\na\nb\nz",
        expectedOutput: "a\nb\nz"
      },
      {
        id: 5,
        title: "Long Words With Repeating Letters",
        description: "Words with identical start and end letters.",
        input: "2\nabcdefghijka\nzzzzzzzzzzz",
        expectedOutput: "a10a\nz9z"
      }
    ]
  },
  {
    id: "231A",
    contestId: 231,
    index: "A",
    title: "Team",
    emoji: "👥",
    category: "Greedy / Brute Force",
    type: "exercise",
    rating: 800,
    solvedCount: 458979,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. Participants are usually offered several problems during programming contests. Long before the start the friends decided that they will implement a problem if at least two of them are sure about the solution. Otherwise, the friends won't write the problem's solution.</p>
      <p>This contest offers $n$ problems to the participants. For each problem we know, which friend is sure about the solution. Help the friends find the number of problems for which they will write a solution.</p>
    `,
    inputSpecificationHtml: `
      <p>The first input line contains a single integer $n$ ($1 \\le n \\le 1000$) &mdash; the number of problems in the contest. Then $n$ lines contain three integers each, each integer is either $0$ or $1$. If the first number in the line equals $1$, then Petya is sure about the problem's solution, otherwise he isn't sure. The second number shows Vasya's view on the solution, the third number shows Tonya's view. The numbers on the lines are separated by spaces.</p>
    `,
    outputSpecificationHtml: `
      <p>Print a single integer &mdash; the number of problems the friends will implement on the contest.</p>
    `,
    sampleNotesHtml: `
      <p>In the first sample, Petya and Vasya are sure on problem 1, all three are sure on problem 2, and only Petya on problem 3. Total solved = 2.</p>
    `,
    starterCode: `/**
 * Problem: 231A - Team
 * Language: C++ (C++20 / clang++)
 * Input: n lines of 3 binary integers
 * Output: Number of problems with >= 2 sure opinions
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            int a, b, c;
            cin >> a >> b >> c;
            if (a + b + c >= 2) {
                count++;
            }
        }
        cout << count << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 231A - Team
 * Language: C++ (C++20 / clang++)
 * Input: n lines of 3 binary integers
 * Output: Number of problems with >= 2 sure opinions
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            int a, b, c;
            cin >> a >> b >> c;
            if (a + b + c >= 2) {
                count++;
            }
        }
        cout << count << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 231A - Team
 * Input: Multiline string with n followed by lines of 3 numbers (0 or 1)
 * Return: Number of problems where sum >= 2
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const n = parseInt(lines[0], 10);
  let count = 0;
  
  for (let i = 1; i <= n; i++) {
    const [p, v, t] = lines[i].split(/\s+/).map(Number);
    if (p + v + t >= 2) {
      count++;
    }
  }
  
  return count.toString();
}
`,
    starterCodePy: `def solve(input_str):
    lines = [l.strip() for l in input_str.strip().split('\\n') if l.strip()]
    n = int(lines[0])
    count = 0
    for l in lines[1:n+1]:
        nums = list(map(int, l.split()))
        if sum(nums) >= 2:
            count += 1
    return str(count)
`,
    hints: [
      "For each problem, sum up the three values: Petya + Vasya + Tonya.",
      "If the sum is >= 2, increment your answer counter.",
      "Print the final total count."
    ],
    explanation: "For each problem, check whether at least two friends are confident (i.e. $a + b + c \\ge 2$). If yes, increment the answer.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: 3 Problems",
        description: "Official sample 1: two problems have >= 2 confident friends.",
        input: "3\n1 1 0\n1 1 1\n1 0 0",
        expectedOutput: "2"
      },
      {
        id: 2,
        title: "Sample Test 2: 2 Problems",
        description: "Official sample 2: one problem has >= 2 confident friends.",
        input: "2\n1 0 0\n0 1 1",
        expectedOutput: "1"
      },
      {
        id: 3,
        title: "No Agreement: All Single Votes",
        description: "Problems where at most 1 friend is sure.",
        input: "3\n1 0 0\n0 1 0\n0 0 1",
        expectedOutput: "0"
      },
      {
        id: 4,
        title: "Unanimous Agreement",
        description: "All 3 friends agree on all problems.",
        input: "4\n1 1 1\n1 1 1\n1 1 1\n1 1 1",
        expectedOutput: "4"
      },
      {
        id: 5,
        title: "Single Problem Edge Case",
        description: "Only 1 problem, 2 friends agree.",
        input: "1\n0 1 1",
        expectedOutput: "1"
      }
    ]
  },
  {
    id: "282A",
    contestId: 282,
    index: "A",
    title: "Bit++",
    emoji: "💻",
    category: "Implementation",
    type: "exercise",
    rating: 800,
    solvedCount: 382313,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>The classic programming language of Bitland is Bit++. A language that is so peculiar and complicated.</p>
      <p>The language is that peculiar as it has only one variable, called $x$. Also, there are two operations:</p>
      <ul>
        <li>Operation <code>++</code> increases the value of variable $x$ by 1.</li>
        <li>Operation <code>--</code> decreases the value of variable $x$ by 1.</li>
      </ul>
      <p>A statement in language Bit++ is a sequence, consisting of exactly one operation and one variable $x$. The statement is written without spaces, that is, it can only contain characters <code>+</code>, <code>-</code>, <code>X</code>. Executing a statement means applying its operation to variable $x$.</p>
      <p>A programme in Bit++ is a sequence of statements, each of them needs to be executed. Putting values to variable $x$ is called executing the programme. Initially the value of $x$ is 0.</p>
      <p>You are given a programme in Bit++. Execute it and find the final value of variable $x$.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains a single integer $n$ ($1 \\le n \\le 150$) &mdash; the number of statements in the programme. Next $n$ lines contain statements. Each line contains exactly one statement. The statements are valid Bit++ statements: <code>++X</code>, <code>X++</code>, <code>--X</code>, or <code>X--</code>.</p>
    `,
    outputSpecificationHtml: `
      <p>Print a single integer &mdash; the final value of $x$.</p>
    `,
    sampleNotesHtml: `
      <p>If the statement contains '+', $x$ increases by 1. If it contains '-', $x$ decreases by 1.</p>
    `,
    starterCode: `/**
 * Problem: 282A - Bit++
 * Language: C++ (C++20 / clang++)
 * Input: n operations containing ++ or --
 * Output: Final integer value of x
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        int x = 0;
        while (n--) {
            string s;
            cin >> s;
            if (s.find("++") != string::npos) {
                x++;
            } else {
                x--;
            }
        }
        cout << x << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 282A - Bit++
 * Language: C++ (C++20 / clang++)
 * Input: n operations containing ++ or --
 * Output: Final integer value of x
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        int x = 0;
        while (n--) {
            string s;
            cin >> s;
            if (s.find("++") != string::npos) {
                x++;
            } else {
                x--;
            }
        }
        cout << x << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 282A - Bit++
 * Input: Multiline string with n followed by n operations (++X, X++, --X, X--)
 * Return: Final integer value of x
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const n = parseInt(lines[0], 10);
  let x = 0;
  
  for (let i = 1; i <= n; i++) {
    if (lines[i].includes('+')) {
      x++;
    } else {
      x--;
    }
  }
  
  return x.toString();
}
`,
    starterCodePy: `def solve(input_str):
    lines = [l.strip() for l in input_str.strip().split('\\n') if l.strip()]
    n = int(lines[0])
    x = 0
    for op in lines[1:n+1]:
        if '+' in op:
            x += 1
        else:
            x -= 1
    return str(x)
`,
    hints: [
      "The variable starts at 0.",
      "Notice that every operation contains either '+' or '-'. If it contains '+', x = x + 1, otherwise x = x - 1.",
      "The position of X (prefix vs postfix) doesn't change the final accumulator value."
    ],
    explanation: "Start with $x = 0$. For each instruction, check if it contains the character '+'. If so, increment $x$ by 1. Otherwise decrement $x$ by 1. Return the final value.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Single Increment",
        description: "Official sample 1: ++X results in 1.",
        input: "1\n++X",
        expectedOutput: "1"
      },
      {
        id: 2,
        title: "Sample Test 2: Balanced Operations",
        description: "Official sample 2: X++ then --X returns to 0.",
        input: "2\nX++\n--X",
        expectedOutput: "0"
      },
      {
        id: 3,
        title: "Multiple Decrements Negative Result",
        description: "3 decrements starting from 0 reach -3.",
        input: "3\n--X\nX--\n--X",
        expectedOutput: "-3"
      },
      {
        id: 4,
        title: "Alternating Order",
        description: "Mixed prefix and postfix statements.",
        input: "4\n++X\nX++\n--X\n++X",
        expectedOutput: "2"
      },
      {
        id: 5,
        title: "Net Negative Operations",
        description: "More decrements than increments.",
        input: "5\n++X\n--X\n--X\n--X\nX++",
        expectedOutput: "-1"
      }
    ]
  },
  {
    id: "158A",
    contestId: 158,
    index: "A",
    title: "Next Round",
    emoji: "🏁",
    category: "Conditionals / Arrays",
    type: "exercise",
    rating: 800,
    solvedCount: 341706,
    timeLimit: "3.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>"Contestant who earns a score equal to or greater than the $k$-th place finisher's score will advance to the next round, as long as the contestant earns a positive score..." &mdash; an excerpt from contest rules.</p>
      <p>A total of $n$ participants took part in the contest ($n \\ge k$), and you already know their scores. Calculate how many participants will advance to the next round.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line of the input contains two integers $n$ and $k$ ($1 \\le k \\le n \\le 50$) separated by a single space.</p>
      <p>The second line contains $n$ space-separated integers $a_1, a_2, \\dots, a_n$ ($0 \\le a_i \\le 100$), where $a_i$ is the score earned by the participant who got the $i$-th place. The given sequence is non-increasing (that is, for all $i$ from $1$ to $n - 1$ the following condition is fulfilled: $a_i \\ge a_{i+1}$).</p>
    `,
    outputSpecificationHtml: `
      <p>Output the number of participants who advance to the next round.</p>
    `,
    sampleNotesHtml: `
      <p>In the first sample the participant on the 5th place earned 7 points. As the participant on the 6th place also earned 7 points, there are 6 advancers.</p>
      <p>In the second sample nobody got a positive score (score > 0), so 0 advance.</p>
    `,
    starterCode: `/**
 * Problem: 158A - Next Round
 * Language: C++ (C++20 / clang++)
 * Input: n contestants, k-th place cutoff, and n scores
 * Output: Count of participants with score >= k-th cutoff and score > 0
 */
#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) {
            cin >> a[i];
        }
        int cutoff = a[k - 1];
        int advancers = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] >= cutoff && a[i] > 0) {
                advancers++;
            }
        }
        cout << advancers << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 158A - Next Round
 * Language: C++ (C++20 / clang++)
 * Input: n contestants, k-th place cutoff, and n scores
 * Output: Count of participants with score >= k-th cutoff and score > 0
 */
#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) {
            cin >> a[i];
        }
        int cutoff = a[k - 1];
        int advancers = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] >= cutoff && a[i] > 0) {
                advancers++;
            }
        }
        cout << advancers << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 158A - Next Round
 * Input:
 *   Line 1: "n k"
 *   Line 2: scores separated by space
 * Return: Number of qualifying participants
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const [n, k] = lines[0].split(/\s+/).map(Number);
  const scores = lines[1].split(/\s+/).map(Number);
  
  const cutoffScore = scores[k - 1]; // 0-indexed k-th place
  let count = 0;
  
  for (let i = 0; i < n; i++) {
    if (scores[i] >= cutoffScore && scores[i] > 0) {
      count++;
    }
  }
  
  return count.toString();
}
`,
    starterCodePy: `def solve(input_str):
    lines = [l.strip() for l in input_str.strip().split('\\n') if l.strip()]
    n, k = map(int, lines[0].split())
    scores = list(map(int, lines[1].split()))
    cutoff = scores[k - 1]
    ans = sum(1 for s in scores if s >= cutoff and s > 0)
    return str(ans)
`,
    hints: [
      "Find the score of the k-th participant: remember in 0-indexed arrays, this is scores[k - 1].",
      "A participant qualifies if score >= scores[k - 1] AND score > 0.",
      "Even if a participant ties with the k-th place, their score must be strictly greater than 0!"
    ],
    explanation: "Read $n$ and $k$. The cutoff score is $scores[k-1]$. Count all scores $s$ such that $s \\ge scores[k-1]$ and $s > 0$.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Tie at Cutoff",
        description: "Official sample 1: 5th and 6th place tie with 7 points.",
        input: "8 5\n10 9 8 7 7 7 5 5",
        expectedOutput: "6"
      },
      {
        id: 2,
        title: "Sample Test 2: All Zero Scores",
        description: "Official sample 2: positive score rule eliminates everyone.",
        input: "4 2\n0 0 0 0",
        expectedOutput: "0"
      },
      {
        id: 3,
        title: "All Qualify",
        description: "All participants have identical positive score.",
        input: "5 3\n1 1 1 1 1",
        expectedOutput: "5"
      },
      {
        id: 4,
        title: "Cutoff is Zero",
        description: "Participants after index with positive score qualify.",
        input: "5 4\n5 4 3 0 0",
        expectedOutput: "3"
      },
      {
        id: 5,
        title: "Single Participant Positive",
        description: "1 participant with score 10.",
        input: "1 1\n10",
        expectedOutput: "1"
      }
    ]
  },
  {
    id: "50A",
    contestId: 50,
    index: "A",
    title: "Domino piling",
    emoji: "🁓",
    category: "Math / Geometry",
    type: "exercise",
    rating: 800,
    solvedCount: 338822,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>You are given a rectangular board of $M \\times N$ squares. You are also given an unlimited number of standard domino pieces of $2 \\times 1$ squares.</p>
      <p>You are asked to place as many dominoes as possible on the board so as to meet the following conditions:</p>
      <ol>
        <li>Each domino completely covers two squares.</li>
        <li>No two dominoes overlap.</li>
        <li>Each domino lies entirely inside the board. It is allowed to touch the edges of the board.</li>
      </ol>
      <p>Find the maximum number of dominoes, which can be placed under these restrictions.</p>
    `,
    inputSpecificationHtml: `
      <p>In a single line you are given two integers $M$ and $N$ ($1 \\le M \\le N \\le 16$).</p>
    `,
    outputSpecificationHtml: `
      <p>Output one number &mdash; the maximal number of dominoes, which can be placed.</p>
    `,
    sampleNotesHtml: `
      <p>Each domino covers exactly 2 squares. The board has $M \\times N$ squares. Maximum dominoes is $\\lfloor (M \\times N) / 2 \\rfloor$.</p>
    `,
    starterCode: `/**
 * Problem: 50A - Domino piling
 * Language: C++ (C++20 / clang++)
 * Input: Board dimensions M and N
 * Output: Maximum number of 2x1 dominoes that fit
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (cin >> m >> n) {
        cout << (m * n) / 2 << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 50A - Domino piling
 * Language: C++ (C++20 / clang++)
 * Input: Board dimensions M and N
 * Output: Maximum number of 2x1 dominoes that fit
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (cin >> m >> n) {
        cout << (m * n) / 2 << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 50A - Domino piling
 * Input: "M N"
 * Return: Maximum number of 2x1 dominoes that fit
 */
function solve(input) {
  const [m, n] = input.trim().split(/\s+/).map(Number);
  const ans = Math.floor((m * n) / 2);
  return ans.toString();
}
`,
    starterCodePy: `def solve(input_str):
    m, n = map(int, input_str.strip().split())
    return str((m * n) // 2)
`,
    hints: [
      "Total squares on the board = M * N.",
      "Each domino covers exactly 2 squares.",
      "Can we always tile all squares except 1 if total area is odd? Yes! The formula is simply floor((M * N) / 2)."
    ],
    explanation: "Because a domino covers 2 squares, at most $\\lfloor \\frac{M \\cdot N}{2} \\rfloor$ dominoes can be placed. Standard greedy strip-filling confirms this upper bound is always achievable.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: 2 x 4 Board",
        description: "Official sample 1: 2 * 4 = 8 squares, fits 4 dominoes.",
        input: "2 4",
        expectedOutput: "4"
      },
      {
        id: 2,
        title: "Sample Test 2: 3 x 3 Board",
        description: "Official sample 2: 3 * 3 = 9 squares, fits 4 dominoes with 1 leftover square.",
        input: "3 3",
        expectedOutput: "4"
      },
      {
        id: 3,
        title: "Single 1 x 1 Square",
        description: "A 1x1 board cannot fit even one 2x1 domino.",
        input: "1 1",
        expectedOutput: "0"
      },
      {
        id: 4,
        title: "Long 1 x 16 Strip",
        description: "1x16 board fits 8 dominoes.",
        input: "1 16",
        expectedOutput: "8"
      },
      {
        id: 5,
        title: "Maximum Grid: 16 x 16",
        description: "16x16 board = 256 squares = 128 dominoes.",
        input: "16 16",
        expectedOutput: "128"
      }
    ]
  },
  {
    id: "263A",
    contestId: 263,
    index: "A",
    title: "Beautiful Matrix",
    emoji: "🔲",
    category: "Matrices / Simulation",
    type: "exercise",
    rating: 800,
    solvedCount: 337389,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>You've got a $5 \\times 5$ matrix, consisting of 24 zeroes and a single number one. Let's index the matrix rows by numbers from 1 to 5 from top to bottom, let's index the matrix columns by numbers from 1 to 5 from left to right.</p>
      <p>In one move, you are allowed to apply one of the two following transformations to the matrix:</p>
      <ol>
        <li>Swap two neighboring matrix rows, that is, rows with indexes $i$ and $i + 1$ for some integer $i$ ($1 \\le i < 5$).</li>
        <li>Swap two neighboring matrix columns, that is, columns with indexes $j$ and $j + 1$ for some integer $j$ ($1 \\le j < 5$).</li>
      </ol>
      <p>You think that a matrix looks <strong>beautiful</strong>, if the single number one of the matrix is in the middle of it (in the cell that is on the intersection of the third row and the third column). Count the minimum number of moves needed to make the matrix beautiful.</p>
    `,
    inputSpecificationHtml: `
      <p>The input consists of five lines, each line contains five integers: the $j$-th integer in the $i$-th line of the input represents the element of the matrix that is located on the intersection of the $i$-th row and the $j$-th column. It is guaranteed that the matrix consists of 24 zeroes and a single number one.</p>
    `,
    outputSpecificationHtml: `
      <p>Print a single integer &mdash; the minimum number of moves needed to make the matrix beautiful.</p>
    `,
    sampleNotesHtml: `
      <p>The target position is $(3, 3)$. The minimum moves is the Manhattan distance: $|r - 3| + |c - 3|$.</p>
    `,
    starterCode: `/**
 * Problem: 263A - Beautiful Matrix
 * Language: C++ (C++20 / clang++)
 * Input: 5x5 matrix containing exactly one 1
 * Output: Minimum moves to bring 1 to matrix center (row 3, col 3)
 */
#include <iostream>
#include <cmath>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int val;
    for (int r = 1; r <= 5; r++) {
        for (int c = 1; c <= 5; c++) {
            cin >> val;
            if (val == 1) {
                cout << abs(r - 3) + abs(c - 3) << "\n";
                return 0;
            }
        }
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 263A - Beautiful Matrix
 * Language: C++ (C++20 / clang++)
 * Input: 5x5 matrix containing exactly one 1
 * Output: Minimum moves to bring 1 to matrix center (row 3, col 3)
 */
#include <iostream>
#include <cmath>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int val;
    for (int r = 1; r <= 5; r++) {
        for (int c = 1; c <= 5; c++) {
            cin >> val;
            if (val == 1) {
                cout << abs(r - 3) + abs(c - 3) << "\n";
                return 0;
            }
        }
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 263A - Beautiful Matrix
 * Input: 5 lines representing a 5x5 matrix with a single '1'
 * Return: Minimum row and column swaps to move '1' to (3, 3)
 */
function solve(input) {
  const rows = input.trim().split('\n').map(r => r.trim()).filter(Boolean);
  let targetRow = -1;
  let targetCol = -1;
  
  for (let r = 0; r < 5; r++) {
    const cols = rows[r].split(/\s+/).map(Number);
    for (let c = 0; c < 5; c++) {
      if (cols[c] === 1) {
        targetRow = r + 1; // 1-indexed
        targetCol = c + 1;
        break;
      }
    }
  }
  
  const moves = Math.abs(targetRow - 3) + Math.abs(targetCol - 3);
  return moves.toString();
}
`,
    starterCodePy: `def solve(input_str):
    rows = [l.strip().split() for l in input_str.strip().split('\\n') if l.strip()]
    for r in range(5):
        for c in range(5):
            if rows[r][c] == '1':
                return str(abs(r - 2) + abs(c - 2))
    return "0"
`,
    hints: [
      "Find the coordinates (row, col) of the number 1 (using 1-based indexing, from 1 to 5).",
      "The center of the 5x5 matrix is at row 3, column 3.",
      "Swapping adjacent rows changes row coordinate by 1; swapping adjacent columns changes col by 1.",
      "The total moves needed is the Manhattan distance: abs(row - 3) + abs(col - 3)."
    ],
    explanation: "Locate the coordinates $(r, c)$ of the element equal to 1. Moving adjacent rows/cols translates to Manhattan distance to the center $(3, 3)$, which equals $|r - 3| + |c - 3|$.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Corner (1, 1)",
        description: "Official sample 1: 1 is at (1, 1). Distance = |1-3| + |1-3| = 4.",
        input: "0 0 0 0 0\n0 0 0 0 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0",
        expectedOutput: "3"
      },
      {
        id: 2,
        title: "Sample Test 2: Already at Center (3, 3)",
        description: "Official sample 2: 1 is at center, 0 moves required.",
        input: "0 0 0 0 0\n0 0 0 0 0\n0 0 1 0 0\n0 0 0 0 0\n0 0 0 0 0",
        expectedOutput: "0"
      },
      {
        id: 3,
        title: "Top-Left Corner (1, 1)",
        description: "1 is at row 1, col 1: |1-3| + |1-3| = 4.",
        input: "1 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0",
        expectedOutput: "4"
      },
      {
        id: 4,
        title: "Bottom-Right Corner (5, 5)",
        description: "1 is at row 5, col 5: |5-3| + |5-3| = 4.",
        input: "0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 1",
        expectedOutput: "4"
      },
      {
        id: 5,
        title: "Off-Center (2, 4)",
        description: "1 is at row 2, col 4: |2-3| + |4-3| = 2.",
        input: "0 0 0 0 0\n0 0 0 1 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0",
        expectedOutput: "2"
      }
    ]
  },
  {
    id: "112A",
    contestId: 112,
    index: "A",
    title: "Petya and Strings",
    emoji: "🔡",
    category: "Strings / Comparison",
    type: "exercise",
    rating: 800,
    solvedCount: 303947,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Little Petya loves presents. His mum bought him two strings of the same size for his birthday. The strings consist of uppercase and lowercase Latin letters. Now Petya wants to compare those two strings <strong>lexicographically</strong>.</p>
      <p>The letters' case does not matter, that is an uppercase letter is considered equivalent to the corresponding lowercase letter.</p>
      <p>Compare the strings: print <code>-1</code> if the first string is less than the second one, <code>1</code> if the second string is less, or <code>0</code> if they are equal.</p>
    `,
    inputSpecificationHtml: `
      <p>Each of the first two lines contains a string. The lengths of the strings range from $1$ to $100$ inclusive. It is guaranteed that the strings are of the same length and also consist of uppercase and lowercase Latin letters.</p>
    `,
    outputSpecificationHtml: `
      <p>If the first string is less than the second string, print <code>-1</code>. If the second string is less than the first string, print <code>1</code>. If the strings are equal, print <code>0</code>. Note that the letters' case is not taken into consideration when the strings are compared.</p>
    `,
    sampleNotesHtml: `
      <p>Convert both strings to lowercase. Compare character by character.</p>
    `,
    starterCode: `/**
 * Problem: 112A - Petya and Strings
 * Language: C++ (C++20 / clang++)
 * Input: Two strings of equal length
 * Output: -1 if s1 < s2, 1 if s1 > s2, 0 if equal (case-insensitive)
 */
#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s1, s2;
    if (cin >> s1 >> s2) {
        transform(s1.begin(), s1.end(), s1.begin(), ::tolower);
        transform(s2.begin(), s2.end(), s2.begin(), ::tolower);
        if (s1 < s2) {
            cout << "-1\n";
        } else if (s1 > s2) {
            cout << "1\n";
        } else {
            cout << "0\n";
        }
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 112A - Petya and Strings
 * Language: C++ (C++20 / clang++)
 * Input: Two strings of equal length
 * Output: -1 if s1 < s2, 1 if s1 > s2, 0 if equal (case-insensitive)
 */
#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s1, s2;
    if (cin >> s1 >> s2) {
        transform(s1.begin(), s1.end(), s1.begin(), ::tolower);
        transform(s2.begin(), s2.end(), s2.begin(), ::tolower);
        if (s1 < s2) {
            cout << "-1\n";
        } else if (s1 > s2) {
            cout << "1\n";
        } else {
            cout << "0\n";
        }
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 112A - Petya and Strings
 * Input: Two lines with strings of equal length
 * Return: -1, 0, or 1
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim().toLowerCase());
  const [s1, s2] = lines;
  
  if (s1 < s2) return "-1";
  if (s1 > s2) return "1";
  return "0";
}
`,
    starterCodePy: `def solve(input_str):
    s1, s2 = [l.strip().lower() for l in input_str.strip().split('\\n') if l.strip()]
    if s1 < s2: return "-1"
    if s1 > s2: return "1"
    return "0"
`,
    hints: [
      "Convert both strings to lowercase first so letter casing is ignored.",
      "Compare them using standard string comparison (< and >).",
      "Return '-1', '1', or '0' accordingly."
    ],
    explanation: "Convert both strings to lowercase with `.toLowerCase()`. Compare using standard lexicographical comparison.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Equal Strings (Different Case)",
        description: "Official sample: 'aaaa' and 'aaaA' are equal ignoring case.",
        input: "aaaa\naaaA",
        expectedOutput: "0"
      },
      {
        id: 2,
        title: "Sample Test 2: First is Less",
        description: "Official sample: 'abs' < 'Abz'.",
        input: "abs\nAbz",
        expectedOutput: "-1"
      },
      {
        id: 3,
        title: "Sample Test 3: Second is Less",
        description: "Official sample: 'abcdefg' > 'AbCdEfF'.",
        input: "abcdefg\nAbCdEfF",
        expectedOutput: "1"
      },
      {
        id: 4,
        title: "Single Characters Differing in Case",
        description: "Single char 'Z' vs 'a': lowercase 'z' is greater than 'a'.",
        input: "Z\na",
        expectedOutput: "1"
      },
      {
        id: 5,
        title: "Identical Strings",
        description: "Both strings have identical case and characters.",
        input: "hellocodeforces\nhellocodeforces",
        expectedOutput: "0"
      }
    ]
  },
  {
    id: "236A",
    contestId: 236,
    index: "A",
    title: "Boy or Girl",
    emoji: "🚻",
    category: "Hash Sets / Counting",
    type: "exercise",
    rating: 800,
    solvedCount: 298654,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Those days, many boys use beautiful girls' photos as avatars in forums. So it is very hard to tell the gender of a user at the first glance.</p>
      <p>Here is a method: if the number of distinct characters in one's user name is odd, then he is a male, otherwise she is a female.</p>
      <p>You are given the string that denotes the user name, please help our hero to determine the gender of this user by his method.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains a non-empty string, that contains only lowercase English letters &mdash; the user name. The string doesn't contain more than $100$ letters.</p>
    `,
    outputSpecificationHtml: `
      <p>If the user is a female by our hero's method, print <code>CHAT WITH HER!</code>. If the user is a male, print <code>IGNORE HIM!</code>.</p>
    `,
    sampleNotesHtml: `
      <p>Count the distinct characters using a Set. If size is even: "CHAT WITH HER!". If odd: "IGNORE HIM!".</p>
    `,
    starterCode: `/**
 * Problem: 236A - Boy or Girl
 * Language: C++ (C++20 / clang++)
 * Input: Username string
 * Output: "CHAT WITH HER!" if distinct character count is even, else "IGNORE HIM!"
 */
#include <iostream>
#include <string>
#include <unordered_set>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        unordered_set<char> distinct(s.begin(), s.end());
        if (distinct.size() % 2 == 0) {
            cout << "CHAT WITH HER!\n";
        } else {
            cout << "IGNORE HIM!\n";
        }
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 236A - Boy or Girl
 * Language: C++ (C++20 / clang++)
 * Input: Username string
 * Output: "CHAT WITH HER!" if distinct character count is even, else "IGNORE HIM!"
 */
#include <iostream>
#include <string>
#include <unordered_set>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        unordered_set<char> distinct(s.begin(), s.end());
        if (distinct.size() % 2 == 0) {
            cout << "CHAT WITH HER!\n";
        } else {
            cout << "IGNORE HIM!\n";
        }
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 236A - Boy or Girl
 * Input: A single string with the username
 * Return: 'CHAT WITH HER!' if distinct chars is even, else 'IGNORE HIM!'
 */
function solve(input) {
  const username = input.trim();
  const distinctLetters = new Set(username);
  
  if (distinctLetters.size % 2 === 0) {
    return "CHAT WITH HER!";
  } else {
    return "IGNORE HIM!";
  }
}
`,
    starterCodePy: `def solve(input_str):
    name = input_str.strip()
    return "CHAT WITH HER!" if len(set(name)) % 2 == 0 else "IGNORE HIM!"
`,
    hints: [
      "Use a Set or frequency array to count the number of unique characters.",
      "Check whether `distinctCount % 2 === 0`.",
      "Even -> 'CHAT WITH HER!', Odd -> 'IGNORE HIM!'."
    ],
    explanation: "Insert all characters into a Set to filter duplicates. Check the parity of the set size: even corresponds to female ('CHAT WITH HER!'), odd to male ('IGNORE HIM!').",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: wjmzbmr (6 distinct letters)",
        description: "Official sample: {w, j, m, z, b, r} has 6 letters (even).",
        input: "wjmzbmr",
        expectedOutput: "CHAT WITH HER!"
      },
      {
        id: 2,
        title: "Sample Test 2: xiaodao (5 distinct letters)",
        description: "Official sample: {x, i, a, o, d} has 5 letters (odd).",
        input: "xiaodao",
        expectedOutput: "IGNORE HIM!"
      },
      {
        id: 3,
        title: "Sample Test 3: sevenkplus (8 distinct letters)",
        description: "Official sample: 8 distinct characters (even).",
        input: "sevenkplus",
        expectedOutput: "CHAT WITH HER!"
      },
      {
        id: 4,
        title: "Single Repeated Character",
        description: "'aaaaa' has only 1 unique letter (odd).",
        input: "aaaaa",
        expectedOutput: "IGNORE HIM!"
      },
      {
        id: 5,
        title: "Alphabet Subset (2 distinct)",
        description: "'ab' has 2 distinct letters (even).",
        input: "ab",
        expectedOutput: "CHAT WITH HER!"
      }
    ]
  },
  {
    id: "339A",
    contestId: 339,
    index: "A",
    title: "Helpful Maths",
    emoji: "➕",
    category: "Sorting / Strings",
    type: "exercise",
    rating: 800,
    solvedCount: 291842,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Xenia is a beginner mathematician. Today the teacher wrote the sum of numbers 1, 2 and 3 on the board. The sum consisted of several numbers and signs "+".</p>
      <p>Xenia has just begun learning counting, so she can only calculate a sum if the summands follow in <strong>non-decreasing order</strong>. For example, she can't calculate a sum $1+3+2+1$ but she can calculate sums $1+1+2$ and $3+3$.</p>
      <p>You've got the sum that was written on the board. Rearrange the summands and print the sum in such a way that Xenia can calculate the sum.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains a non-empty string $s$ &mdash; the sum Xenia needs to count. String $s$ contains no spaces. It only contains digits and characters "+". The length of string $s$ cannot exceed $100$ characters.</p>
    `,
    outputSpecificationHtml: `
      <p>Print the new sum that Xenia can count.</p>
    `,
    sampleNotesHtml: `
      <p>Extract all numbers, sort them ascending, and join them back with '+'.</p>
    `,
    starterCode: `/**
 * Problem: 339A - Helpful Maths
 * Language: C++ (C++20 / clang++)
 * Input: Expression string like "3+2+1"
 * Output: Non-decreasing ordered expression like "1+2+3"
 */
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        vector<char> nums;
        for (char c : s) {
            if (c != '+') nums.push_back(c);
        }
        sort(nums.begin(), nums.end());
        for (size_t i = 0; i < nums.size(); i++) {
            if (i > 0) cout << "+";
            cout << nums[i];
        }
        cout << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 339A - Helpful Maths
 * Language: C++ (C++20 / clang++)
 * Input: Expression string like "3+2+1"
 * Output: Non-decreasing ordered expression like "1+2+3"
 */
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        vector<char> nums;
        for (char c : s) {
            if (c != '+') nums.push_back(c);
        }
        sort(nums.begin(), nums.end());
        for (size_t i = 0; i < nums.size(); i++) {
            if (i > 0) cout << "+";
            cout << nums[i];
        }
        cout << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 339A - Helpful Maths
 * Input: String expression like "3+2+1"
 * Return: Sorted expression like "1+2+3"
 */
function solve(input) {
  const nums = input.trim().split('+').map(Number);
  nums.sort((a, b) => a - b);
  return nums.join('+');
}
`,
    starterCodePy: `def solve(input_str):
    nums = sorted(input_str.strip().split('+'))
    return '+'.join(nums)
`,
    hints: [
      "Split the input string by '+' to get an array of number strings.",
      "Sort the numbers in ascending order.",
      "Join the array back with '+' as the separator."
    ],
    explanation: "Split the string along '+', convert or sort the digits ascendingly, and join them back with '+'.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: 3+2+1",
        description: "Official sample: numbers 3, 2, 1 sorted become 1+2+3.",
        input: "3+2+1",
        expectedOutput: "1+2+3"
      },
      {
        id: 2,
        title: "Sample Test 2: 1+1+3+1+3",
        description: "Official sample: repeated digits.",
        input: "1+1+3+1+3",
        expectedOutput: "1+1+1+3+3"
      },
      {
        id: 3,
        title: "Sample Test 3: Single Number 2",
        description: "Official sample with only one summand.",
        input: "2",
        expectedOutput: "2"
      },
      {
        id: 4,
        title: "Already Sorted",
        description: "Expression that is already in non-decreasing order.",
        input: "1+2+2+3",
        expectedOutput: "1+2+2+3"
      },
      {
        id: 5,
        title: "All Same Numbers",
        description: "Expression containing identical numbers.",
        input: "3+3+3+3",
        expectedOutput: "3+3+3+3"
      }
    ]
  },
  {
    id: "281A",
    contestId: 281,
    index: "A",
    title: "Word Capitalization",
    emoji: "🔠",
    category: "Strings",
    type: "exercise",
    rating: 800,
    solvedCount: 285730,
    timeLimit: "2.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Capitalization is writing a word with its first letter as a capital letter. Your task is to capitalize the given word.</p>
      <p>Note, that during capitalization all the other letters remain unchanged.</p>
    `,
    inputSpecificationHtml: `
      <p>A single line contains a non-empty word consisting of lowercase and uppercase Latin letters. Its length will not exceed $10^3$.</p>
    `,
    outputSpecificationHtml: `
      <p>Output the given word after capitalization.</p>
    `,
    sampleNotesHtml: `
      <p>Ensure the first character is uppercase, leave the rest of the string as is.</p>
    `,
    starterCode: `/**
 * Problem: 281A - Word Capitalization
 * Language: C++ (C++20 / clang++)
 * Input: Single word
 * Output: Word with first character capitalized
 */
#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        s[0] = toupper(s[0]);
        cout << s << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 281A - Word Capitalization
 * Language: C++ (C++20 / clang++)
 * Input: Single word
 * Output: Word with first character capitalized
 */
#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        s[0] = toupper(s[0]);
        cout << s << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 281A - Word Capitalization
 * Input: Single word
 * Return: Word with first character capitalized
 */
function solve(input) {
  const word = input.trim();
  if (!word) return "";
  return word[0].toUpperCase() + word.slice(1);
}
`,
    starterCodePy: `def solve(input_str):
    w = input_str.strip()
    return w[0].upper() + w[1:] if w else ""
`,
    hints: [
      "Access the first character word[0] and call .toUpperCase().",
      "Append the rest of the string using word.slice(1).",
      "Do NOT lowercase the rest of the letters; only uppercase the first letter!"
    ],
    explanation: "Capitalize the first character using `word[0].toUpperCase()` and preserve `word.slice(1)`.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Lowercase Word",
        description: "Official sample: 'ApPLe' -> 'ApPLe'.",
        input: "ApPLe",
        expectedOutput: "ApPLe"
      },
      {
        id: 2,
        title: "Sample Test 2: All Lowercase",
        description: "Official sample: 'konjac' -> 'Konjac'.",
        input: "konjac",
        expectedOutput: "Konjac"
      },
      {
        id: 3,
        title: "Single Lowercase Letter",
        description: "'z' -> 'Z'.",
        input: "z",
        expectedOutput: "Z"
      },
      {
        id: 4,
        title: "Already Capitalized Word",
        description: "'Codeforces' remains 'Codeforces'.",
        input: "Codeforces",
        expectedOutput: "Codeforces"
      },
      {
        id: 5,
        title: "All Uppercase Letters",
        description: "'HELLO' remains 'HELLO'.",
        input: "HELLO",
        expectedOutput: "HELLO"
      }
    ]
  },
  {
    id: "791A",
    contestId: 791,
    index: "A",
    title: "Bear and Big Brother",
    emoji: "🐻",
    category: "Loops / Math",
    type: "exercise",
    rating: 800,
    solvedCount: 273222,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Bear Limak wants to become the largest of bears, or at least to become larger than his brother Bob.</p>
      <p>Right now, Limak and Bob weigh $a$ and $b$ respectively. It's guaranteed that Limak's weight is smaller than or equal to his brother's weight.</p>
      <p>Limak eats a lot and his weight is tripled after every year, while Bob's weight is doubled after every year.</p>
      <p>After how many full years will Limak become <strong>strictly larger</strong> than Bob (that is, strictly more weight)?</p>
    `,
    inputSpecificationHtml: `
      <p>The only line of the input contains two integers $a$ and $b$ ($1 \\le a \\le b \\le 10$) &mdash; the initial weights of Limak and Bob respectively.</p>
    `,
    outputSpecificationHtml: `
      <p>Print one integer, denoting the integer number of years after which Limak will become strictly larger than Bob.</p>
    `,
    sampleNotesHtml: `
      <p>Year 1: Limak becomes $a \\times 3$, Bob becomes $b \\times 2$. Continue until Limak > Bob.</p>
    `,
    starterCode: `/**
 * Problem: 791A - Bear and Big Brother
 * Language: C++ (C++20 / clang++)
 * Input: Limak weight a, Bob weight b
 * Output: Number of years until a > b (a triples each year, b doubles each year)
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int a, b;
    if (cin >> a >> b) {
        int years = 0;
        while (a <= b) {
            a *= 3;
            b *= 2;
            years++;
        }
        cout << years << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 791A - Bear and Big Brother
 * Language: C++ (C++20 / clang++)
 * Input: Limak weight a, Bob weight b
 * Output: Number of years until a > b (a triples each year, b doubles each year)
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int a, b;
    if (cin >> a >> b) {
        int years = 0;
        while (a <= b) {
            a *= 3;
            b *= 2;
            years++;
        }
        cout << years << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 791A - Bear and Big Brother
 * Input: "a b"
 * Return: Years until a > b (a triples each year, b doubles each year)
 */
function solve(input) {
  let [a, b] = input.trim().split(/\s+/).map(Number);
  let years = 0;
  
  while (a <= b) {
    a *= 3;
    b *= 2;
    years++;
  }
  
  return years.toString();
}
`,
    starterCodePy: `def solve(input_str):
    a, b = map(int, input_str.strip().split())
    years = 0
    while a <= b:
        a *= 3
        b *= 2
        years += 1
    return str(years)
`,
    hints: [
      "Use a simple while loop: condition `while (a <= b)`.",
      "In each iteration, multiply a by 3 and b by 2, and increment years by 1.",
      "Stop when a is strictly greater than b."
    ],
    explanation: "Simulate year by year. Because $a$ triples and $b$ doubles, Limak's weight grows exponentially faster than Bob's, stopping within very few iterations ($< 10$).",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: 4 and 7",
        description: "Official sample: after 2 years Limak is 36, Bob is 28 (36 > 28).",
        input: "4 7",
        expectedOutput: "2"
      },
      {
        id: 2,
        title: "Sample Test 2: 4 and 9",
        description: "Official sample: after 3 years Limak is 108, Bob is 72.",
        input: "4 9",
        expectedOutput: "3"
      },
      {
        id: 3,
        title: "Sample Test 3: 1 and 1",
        description: "Official sample: identical initial weight, after 1 year 3 > 2.",
        input: "1 1",
        expectedOutput: "1"
      },
      {
        id: 4,
        title: "Initial Weight: 1 and 10",
        description: "Maximum disparity for initial bounds.",
        input: "1 10",
        expectedOutput: "6"
      },
      {
        id: 5,
        title: "Same Weight Max: 10 and 10",
        description: "Both start at 10, after 1 year 30 > 20.",
        input: "10 10",
        expectedOutput: "1"
      }
    ]
  },
  {
    id: "617A",
    contestId: 617,
    index: "A",
    title: "Elephant",
    emoji: "🐘",
    category: "Math / Greedy",
    type: "exercise",
    rating: 800,
    solvedCount: 266455,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>An elephant decided to visit his friend. It turned out that the elephant's house is located at point 0 and his friend's house is located at point $x$ ($x > 0$) of the coordinate line.</p>
      <p>In one step the elephant can move 1, 2, 3, 4 or 5 positions forward. Determine, what is the minimum number of steps he need to make in order to reach his friend's house.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line of the input contains an integer $x$ ($1 \\le x \\le 1\\,000\\,000$) &mdash; the coordinate of the friend's house.</p>
    `,
    outputSpecificationHtml: `
      <p>Print the minimum number of steps that elephant needs to make to get from point 0 to point $x$.</p>
    `,
    sampleNotesHtml: `
      <p>The greedy strategy is to make as many steps of length 5 as possible. Result is $\\lceil x / 5 \\rceil$.</p>
    `,
    starterCode: `/**
 * Problem: 617A - Elephant
 * Language: C++ (C++20 / clang++)
 * Input: Target coordinate x
 * Output: Minimum steps of sizes {1, 2, 3, 4, 5}
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int x;
    if (cin >> x) {
        cout << (x + 4) / 5 << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 617A - Elephant
 * Language: C++ (C++20 / clang++)
 * Input: Target coordinate x
 * Output: Minimum steps of sizes {1, 2, 3, 4, 5}
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int x;
    if (cin >> x) {
        cout << (x + 4) / 5 << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 617A - Elephant
 * Input: x (distance)
 * Return: Minimum steps of sizes {1, 2, 3, 4, 5}
 */
function solve(input) {
  const x = parseInt(input.trim(), 10);
  return Math.ceil(x / 5).toString();
}
`,
    starterCodePy: `import math

def solve(input_str):
    x = int(input_str.strip())
    return str(math.ceil(x / 5))
`,
    hints: [
      "To minimize steps, greedily take the largest step possible (length 5).",
      "If the remaining distance is less than 5, you can cover it with a single step of size 1, 2, 3, or 4.",
      "The formula is ceil(x / 5) or floor((x + 4) / 5)."
    ],
    explanation: "Greedy choice: make as many size-5 steps as possible. If $x \\% 5 \\ne 0$, one more step of size $x \\% 5$ is needed. Total is $\\lceil x / 5 \\rceil$.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: Distance 5",
        description: "Official sample: 1 step of length 5.",
        input: "5",
        expectedOutput: "1"
      },
      {
        id: 2,
        title: "Sample Test 2: Distance 12",
        description: "Official sample: two steps of 5 and one step of 2 -> 3 steps.",
        input: "12",
        expectedOutput: "3"
      },
      {
        id: 3,
        title: "Distance 1",
        description: "1 step of size 1.",
        input: "1",
        expectedOutput: "1"
      },
      {
        id: 4,
        title: "Multiple of 5: 100",
        description: "20 steps of size 5.",
        input: "100",
        expectedOutput: "20"
      },
      {
        id: 5,
        title: "Large Coordinate: 1,000,000",
        description: "1,000,000 / 5 = 200,000 steps.",
        input: "1000000",
        expectedOutput: "200000"
      }
    ]
  },
  {
    id: "977A",
    contestId: 977,
    index: "A",
    title: "Wrong Subtraction",
    emoji: "➖",
    category: "Simulation / Math",
    type: "exercise",
    rating: 800,
    solvedCount: 230498,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>Little girl Tanya is learning how to decrease a number by one, but she does it wrong with a number consisting of two or more digits. Tanya subtracts one from a number by the following algorithm:</p>
      <ul>
        <li>if the last digit of the number is non-zero, she decreases the number by one;</li>
        <li>if the last digit of the number is zero, she divides the number by 10 (i.e. removes the last digit).</li>
      </ul>
      <p>You are given two integer numbers $n$ and $k$. Tanya will subtract one from $n$ $k$ times. Your task is to print the result after all $k$ subtractions.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line of the input contains two integer numbers $n$ and $k$ ($2 \\le n \\le 10^9$, $1 \\le k \\le 50$) &mdash; the initial number and the number of subtractions.</p>
    `,
    outputSpecificationHtml: `
      <p>Print one integer number &mdash; the result of the decreasing $n$ by one $k$ times.</p>
    `,
    sampleNotesHtml: `
      <p>512 -> 511 -> 510 -> 51 -> 50. Total 4 steps for 512 with k=4 results in 50.</p>
    `,
    starterCode: `/**
 * Problem: 977A - Wrong Subtraction
 * Language: C++ (C++20 / clang++)
 * Input: Number n and k operations
 * Output: Number after k steps of subtraction
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n;
    int k;
    if (cin >> n >> k) {
        while (k--) {
            if (n % 10 == 0) {
                n /= 10;
            } else {
                n--;
            }
        }
        cout << n << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 977A - Wrong Subtraction
 * Language: C++ (C++20 / clang++)
 * Input: Number n and k operations
 * Output: Number after k steps of subtraction
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n;
    int k;
    if (cin >> n >> k) {
        while (k--) {
            if (n % 10 == 0) {
                n /= 10;
            } else {
                n--;
            }
        }
        cout << n << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 977A - Wrong Subtraction
 * Input: "n k"
 * Return: Number after k steps of Tanya's subtraction
 */
function solve(input) {
  let [n, k] = input.trim().split(/\s+/).map(Number);
  
  for (let i = 0; i < k; i++) {
    if (n % 10 === 0) {
      n = Math.floor(n / 10);
    } else {
      n--;
    }
  }
  
  return n.toString();
}
`,
    starterCodePy: `def solve(input_str):
    n, k = map(int, input_str.strip().split())
    for _ in range(k):
        if n % 10 == 0:
            n //= 10
        else:
            n -= 1
    return str(n)
`,
    hints: [
      "Simulate k steps in a loop.",
      "Check the last digit: if n % 10 === 0, divide by 10 (Math.floor(n / 10)).",
      "Otherwise, subtract 1 (n--)."
    ],
    explanation: "Loop $k$ times. In each iteration, if $n$ ends with a zero ($n \\% 10 == 0$), integer divide $n$ by 10. Otherwise, decrease $n$ by 1.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: 512 with 4 steps",
        description: "Official sample 1: 512 -> 511 -> 510 -> 51 -> 50.",
        input: "512 4",
        expectedOutput: "50"
      },
      {
        id: 2,
        title: "Sample Test 2: 1000000000 with 9 steps",
        description: "Official sample 2: nine zero divisions removes all 9 zeroes, leaving 1.",
        input: "1000000000 9",
        expectedOutput: "1"
      },
      {
        id: 3,
        title: "Single Step Non-Zero",
        description: "Single step on 42 gives 41.",
        input: "42 1",
        expectedOutput: "41"
      },
      {
        id: 4,
        title: "Single Step Ending in Zero",
        description: "Single step on 30 gives 3.",
        input: "30 1",
        expectedOutput: "3"
      },
      {
        id: 5,
        title: "Multiple Consecutive Decrements",
        description: "15 with 5 steps: 15 -> 14 -> 13 -> 12 -> 11 -> 10.",
        input: "15 5",
        expectedOutput: "10"
      }
    ]
  },
  {
    id: "266A",
    contestId: 266,
    index: "A",
    title: "Stones on the Table",
    emoji: "💎",
    category: "Strings / Greedy",
    type: "exercise",
    rating: 800,
    solvedCount: 258419,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>There are $n$ stones on the table in a row, each of them can be red, green or blue. Count the minimum number of stones to take from the table so that any two neighboring stones had different colors. Stones of the same color are considered neighboring if there are no other stones between them.</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains integer $n$ ($1 \\le n \\le 50$) &mdash; the number of stones on the table.</p>
      <p>The next line contains string $s$, which represents the colors of the stones. We'll consider the stones in the row numbered from 1 to $n$ from left to right. Then the $i$-th character $s$ equals "R", if the $i$-th stone is red, "G", if it's green and "B", if it's blue.</p>
    `,
    outputSpecificationHtml: `
      <p>Print a single integer &mdash; the minimum number of stones you need to remove.</p>
    `,
    sampleNotesHtml: `
      <p>Whenever $s[i] == s[i-1]$, we must remove one stone. So count all adjacent pairs with identical colors.</p>
    `,
    starterCode: `/**
 * Problem: 266A - Stones on the Table
 * Language: C++ (C++20 / clang++)
 * Input: n stones, string of colors
 * Output: Minimum removals so no two adjacent stones share color
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    string s;
    if (cin >> n >> s) {
        int removals = 0;
        for (int i = 1; i < n; i++) {
            if (s[i] == s[i - 1]) {
                removals++;
            }
        }
        cout << removals << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 266A - Stones on the Table
 * Language: C++ (C++20 / clang++)
 * Input: n stones, string of colors
 * Output: Minimum removals so no two adjacent stones share color
 */
#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    string s;
    if (cin >> n >> s) {
        int removals = 0;
        for (int i = 1; i < n; i++) {
            if (s[i] == s[i - 1]) {
                removals++;
            }
        }
        cout << removals << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 266A - Stones on the Table
 * Input:
 *   Line 1: n
 *   Line 2: string s of 'R', 'G', 'B'
 * Return: Count of adjacent identical pairs to remove
 */
function solve(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const n = parseInt(lines[0], 10);
  const s = lines[1];
  let removals = 0;
  
  for (let i = 1; i < n; i++) {
    if (s[i] === s[i - 1]) {
      removals++;
    }
  }
  
  return removals.toString();
}
`,
    starterCodePy: `def solve(input_str):
    lines = [l.strip() for l in input_str.strip().split('\\n') if l.strip()]
    n = int(lines[0])
    s = lines[1]
    return str(sum(1 for i in range(1, n) if s[i] == s[i-1]))
`,
    hints: [
      "Any adjacent pair of identical colors violates the rule.",
      "Iterate from index 1 to n - 1.",
      "If s[i] === s[i - 1], increment the count."
    ],
    explanation: "Two adjacent stones with the same color require at least one removal. Therefore, the minimum removals required is simply the count of indices $i$ where $s[i] == s[i-1]$.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: RRG",
        description: "Official sample: 1 removal required.",
        input: "3\nRRG",
        expectedOutput: "1"
      },
      {
        id: 2,
        title: "Sample Test 2: RRRRR",
        description: "Official sample: 4 removals required.",
        input: "5\nRRRRR",
        expectedOutput: "4"
      },
      {
        id: 3,
        title: "Sample Test 3: BRBG",
        description: "Official sample: no two adjacent have the same color.",
        input: "4\nBRBG",
        expectedOutput: "0"
      },
      {
        id: 4,
        title: "Single Stone",
        description: "Only 1 stone on the table.",
        input: "1\nG",
        expectedOutput: "0"
      },
      {
        id: 5,
        title: "Alternating Stones with One Duplicate",
        description: "RGBRGBB -> 1 removal.",
        input: "7\nRGBRGBB",
        expectedOutput: "1"
      }
    ]
  },
  {
    id: "546A",
    contestId: 546,
    index: "A",
    title: "Soldier and Bananas",
    emoji: "🍌",
    category: "Math / Arithmetic",
    type: "exercise",
    rating: 800,
    solvedCount: 249941,
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    descriptionHtml: `
      <p>A soldier wants to buy $w$ bananas in the shop. He has to pay $k$ dollars for the first banana, $2k$ dollars for the second one and so on (in other words, he has to pay $i \\cdot k$ dollars for the $i$-th banana).</p>
      <p>He has $n$ dollars. How many dollars does he have to borrow from his friend soldier to buy $w$ bananas?</p>
    `,
    inputSpecificationHtml: `
      <p>The first line contains three positive integers $k, n, w$ ($1 \\le k, w \\le 1000$, $0 \\le n \\le 10^9$) &mdash; the cost of the first banana, initial number of dollars the soldier has and number of bananas he wants.</p>
    `,
    outputSpecificationHtml: `
      <p>Output one integer &mdash; the amount of dollars that the soldier must borrow from his friend. If he doesn't have to borrow money, output <code>0</code>.</p>
    `,
    sampleNotesHtml: `
      <p>Total cost is $k \\times (1 + 2 + \\dots + w) = k \\times \\frac{w(w+1)}{2}$. Borrow amount is $\\max(0, \\text{totalCost} - n)$.</p>
    `,
    starterCode: `/**
 * Problem: 546A - Soldier and Bananas
 * Language: C++ (C++20 / clang++)
 * Input: Cost of 1st banana k, money n, bananas to buy w
 * Output: Dollars soldier needs to borrow (or 0 if sufficient)
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long k, n, w;
    if (cin >> k >> n >> w) {
        long long total = k * (w * (w + 1) / 2);
        long long borrow = total - n;
        if (borrow < 0) borrow = 0;
        cout << borrow << "\n";
    }
    return 0;
}
`,
    starterCodeCpp: `/**
 * Problem: 546A - Soldier and Bananas
 * Language: C++ (C++20 / clang++)
 * Input: Cost of 1st banana k, money n, bananas to buy w
 * Output: Dollars soldier needs to borrow (or 0 if sufficient)
 */
#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long k, n, w;
    if (cin >> k >> n >> w) {
        long long total = k * (w * (w + 1) / 2);
        long long borrow = total - n;
        if (borrow < 0) borrow = 0;
        cout << borrow << "\n";
    }
    return 0;
}
`,
    starterCodeJava: `/**
 * Problem: 546A - Soldier and Bananas
 * Input: "k n w"
 * Return: Dollars soldier must borrow (or 0 if has enough)
 */
function solve(input) {
  const [k, n, w] = input.trim().split(/\s+/).map(Number);
  const totalCost = k * (w * (w + 1)) / 2;
  const borrow = Math.max(0, totalCost - n);
  return borrow.toString();
}
`,
    starterCodePy: `def solve(input_str):
    k, n, w = map(int, input_str.strip().split())
    total_cost = k * w * (w + 1) // 2
    return str(max(0, total_cost - n))
`,
    hints: [
      "The sum of numbers from 1 to w is w * (w + 1) / 2.",
      "The total cost is k * w * (w + 1) / 2.",
      "If the soldier has enough dollars (n >= totalCost), he borrows 0. Output max(0, totalCost - n)."
    ],
    explanation: "The total cost of $w$ bananas is $k \\cdot \\sum_{i=1}^w i = k \\cdot \\frac{w(w+1)}{2}$. The borrowed amount is $\\max(0, \\text{total} - n)$.",
    testCases: [
      {
        id: 1,
        title: "Sample Test 1: k=3, n=17, w=4",
        description: "Official sample: total cost = 3 * 10 = 30. Borrows 30 - 17 = 13.",
        input: "3 17 4",
        expectedOutput: "13"
      },
      {
        id: 2,
        title: "Exact Amount: No Borrowing",
        description: "Soldier has exactly enough money -> borrows 0.",
        input: "3 30 4",
        expectedOutput: "0"
      },
      {
        id: 3,
        title: "More than Enough Money",
        description: "Soldier has extra dollars -> borrows 0.",
        input: "5 100 2",
        expectedOutput: "0"
      },
      {
        id: 4,
        title: "Zero Initial Dollars",
        description: "Soldier has 0 dollars -> must borrow entire cost.",
        input: "10 0 3",
        expectedOutput: "60"
      },
      {
        id: 5,
        title: "Large Number of Bananas",
        description: "k=1, n=50, w=10 -> cost is 55, borrows 5.",
        input: "1 50 10",
        expectedOutput: "5"
      }
    ]
  }
];

// Write to src/data/problems.json
const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const outPath = path.join(dataDir, 'problems.json');
fs.writeFileSync(outPath, JSON.stringify(PROBLEMS_DATA, null, 2), 'utf-8');
console.log(`Successfully generated ${PROBLEMS_DATA.length} comprehensive problems with 5 test cases each to ${outPath}`);
