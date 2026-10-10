#!/usr/bin/env python3
"""
Codeforces Problem Scraper & Data Pipeline
Exclusively uses BeautifulSoup 4 (bs4) and requests to scrape and parse
Codeforces problem statements, LaTeX math, and official sample test cases.
"""

import argparse
import json
import os
import re
import sys
import time
from typing import Dict, List, Any, Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError as err:
    print(
        f"Missing required Python dependencies: {err}\n"
        "Please install them via: pip install beautifulsoup4 requests",
        file=sys.stderr,
    )
    sys.exit(1)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Categorization and emoji mappings based on problem titles and tags
EMOJI_MAPPING: Dict[str, Dict[str, str]] = {
    "Watermelon": {"emoji": "🍉", "category": "Math / Brute Force"},
    "Way Too Long Words": {"emoji": "🔤", "category": "Strings"},
    "Team": {"emoji": "👥", "category": "Greedy / Brute Force"},
    "Next Round": {"emoji": "🏁", "category": "Conditionals / Arrays"},
    "Bit++": {"emoji": "💻", "category": "Implementation"},
    "Domino piling": {"emoji": "🁓", "category": "Math / Geometry"},
    "Beautiful Matrix": {"emoji": "🔲", "category": "Matrices / Simulation"},
    "Petya and Strings": {"emoji": "🔡", "category": "Strings / Comparison"},
    "Boy or Girl": {"emoji": "🚻", "category": "Hash Sets / Counting"},
    "Helpful Maths": {"emoji": "➕", "category": "Sorting / Strings"},
    "Elephant": {"emoji": "🐘", "category": "Math / Greedy"},
    "Word Capitalization": {"emoji": "🔠", "category": "Strings"},
    "Bear and Big Brother": {"emoji": "🐻", "category": "Loops / Math"},
    "Soldier and Bananas": {"emoji": "🍌", "category": "Math / Arithmetic"},
    "Wrong Subtraction": {"emoji": "➖", "category": "Simulation / Math"},
    "Nearly Lucky Number": {"emoji": "🍀", "category": "Strings / Counting"},
    "Tram": {"emoji": "🚋", "category": "Simulation / Greedy"},
    "Anton and Danik": {"emoji": "♟️", "category": "Strings / Counting"},
    "Translation": {"emoji": "🔄", "category": "Strings / Reversal"},
    "Stones on the Table": {"emoji": "💎", "category": "Strings / Greedy"},
    "In Search of an Easy Problem": {"emoji": "🔍", "category": "Arrays / Logic"},
    "Vanya and Fence": {"emoji": "🚶", "category": "Math / Logic"},
    "Word": {"emoji": "📝", "category": "Strings / Case"},
    "Anton and Letters": {"emoji": "✉️", "category": "Hash Sets / Strings"},
    "Hulk": {"emoji": "💚", "category": "Strings / Alternation"},
    "George and Accommodation": {"emoji": "🏠", "category": "Conditionals / Arrays"},
    "Magnets": {"emoji": "🧲", "category": "Arrays / Logic"},
    "Calculating Function": {"emoji": "🧮", "category": "Math / Parity"},
    "Hit the Lottery": {"emoji": "💵", "category": "Greedy / Math"},
    "Divisibility Problem": {"emoji": "➗", "category": "Math / Modulo"},
    "Ultra-Fast Mathematician": {"emoji": "⚡", "category": "Bitwise / Strings"},
    "Presents": {"emoji": "🎁", "category": "Arrays / Permutation"},
    "I Wanna Be the Guy": {"emoji": "🎮", "category": "Sets / Arrays"},
    "Drinks": {"emoji": "🍹", "category": "Math / Average"},
    "Insomnia cure": {"emoji": "🐉", "category": "Math / Divisibility"},
    "Queue at the School": {"emoji": "🏫", "category": "Simulation / Strings"},
    "Chat room": {"emoji": "💬", "category": "Greedy / Strings"},
    "Lucky Division": {"emoji": "🎰", "category": "Brute Force / Math"},
    "Twins": {"emoji": "🪙", "category": "Greedy / Sorting"},
    "String Task": {"emoji": "✂️", "category": "Strings / Filtering"},
    "Even Odds": {"emoji": "⚖️", "category": "Math / Formula"},
    "Football": {"emoji": "⚽", "category": "Strings / Sliding Window"},
    "Expression": {"emoji": "📐", "category": "Math / Brute Force"},
    "HQ9+": {"emoji": "⌨️", "category": "Implementation"},
    "Anton and Polyhedrons": {"emoji": "🎲", "category": "Geometry / Hash Map"},
    "Pangram": {"emoji": "🔤", "category": "Strings / Alphabet"},
    "Is your horseshoe on the other hoof?": {"emoji": "🐎", "category": "Sets / Counting"},
    "Games": {"emoji": "🎽", "category": "Brute Force / Arrays"},
    "Buy a Shovel": {"emoji": "⛏️", "category": "Math / Brute Force"},
    "Candies and Two Sisters": {"emoji": "🍬", "category": "Math / Combinatorics"},
}

def get_emoji_and_category(title: str, tags: Optional[List[str]] = None) -> Dict[str, str]:
    tags = tags or []
    if title in EMOJI_MAPPING:
        return EMOJI_MAPPING[title]

    title_lower = title.lower()
    for key, mapping in EMOJI_MAPPING.items():
        if key.lower() in title_lower:
            return mapping

    emoji = "💡"
    category = " / ".join(t.capitalize() for t in tags[:2]) if tags else "Implementation"

    tag_set = {t.lower() for t in tags}
    if "math" in tag_set:
        emoji = "🔢"
    elif "strings" in tag_set:
        emoji = "🔤"
    elif "greedy" in tag_set:
        emoji = "💎"
    elif "brute force" in tag_set:
        emoji = "🔨"
    elif "dp" in tag_set:
        emoji = "🧩"
    elif "sortings" in tag_set:
        emoji = "📊"
    elif "data structures" in tag_set:
        emoji = "🗂️"
    elif "geometry" in tag_set:
        emoji = "📐"

    return {"emoji": emoji, "category": category}

def generate_starter_code_cpp(title: str, pid: str) -> str:
    return f"""// Problem: {pid} - {title}
#include <iostream>
using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // TODO: implement your solution here
    return 0;
}}
"""

def generate_starter_code_java(title: str, pid: str) -> str:
    return f"""// Problem: {pid} - {title}
import java.util.Scanner;

public class Solution {{
    public static void main(String[] args) {{
        Scanner scanner = new Scanner(System.in);
        // TODO: implement your solution here
    }}
}}
"""

def generate_starter_code_py(title: str, pid: str) -> str:
    return f"""# Problem: {pid} - {title}
import sys

def solve():
    # TODO: implement your solution here
    pass

if __name__ == '__main__':
    solve()
"""

def extract_pre_text(pre_elem) -> str:
    """Extract clean formatted text from a <pre> element using BeautifulSoup."""
    if not pre_elem:
        return ""
    # Check for Codeforces test-example-line elements
    example_lines = pre_elem.find_all("div", class_=lambda c: c and "test-example-line" in c)
    if example_lines:
        return "\n".join(el.get_text().strip() for el in example_lines)

    # Clone/modify br elements into newlines
    for br in pre_elem.find_all("br"):
        br.replace_with("\n")

    return pre_elem.get_text().strip()

def scrape_problem_page(contest_id: int, index: str, p_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Scrape and parse a single Codeforces problem page with BeautifulSoup 4."""
    pid = f"{contest_id}{index}"
    name = p_data.get("name", pid)
    url = f"https://codeforces.com/problemset/problem/{contest_id}/{index}"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as exc:
        print(f"Failed to fetch {url} ({pid}): {exc}", file=sys.stderr)
        return None

    # Parse HTML document strictly using BeautifulSoup 4
    soup = BeautifulSoup(resp.text, "html.parser")
    statement = soup.find("div", class_="problem-statement")
    if not statement:
        print(f"No .problem-statement element found on {url}", file=sys.stderr)
        return None

    # Limits from header
    time_limit = "1.0s"
    memory_limit = "256MB"
    header = statement.find("div", class_="header")
    if header:
        t_el = header.find("div", class_="time-limit")
        if t_el:
            time_limit = t_el.get_text(strip=True).replace("time limit per test", "").strip()
        m_el = header.find("div", class_="memory-limit")
        if m_el:
            memory_limit = m_el.get_text(strip=True).replace("memory limit per test", "").strip()

    # Narrative problem description (second direct div inside statement)
    child_divs = statement.find_all("div", recursive=False)
    desc_html = child_divs[1].decode_contents() if len(child_divs) > 1 else ""

    # Input Specification
    input_html = ""
    input_spec = statement.find("div", class_="input-specification")
    if input_spec:
        sec_title = input_spec.find("div", class_="section-title")
        if sec_title:
            sec_title.decompose()
        input_html = input_spec.decode_contents()

    # Output Specification
    output_html = ""
    output_spec = statement.find("div", class_="output-specification")
    if output_spec:
        sec_title = output_spec.find("div", class_="section-title")
        if sec_title:
            sec_title.decompose()
        output_html = output_spec.decode_contents()

    # Note section
    note_html = ""
    note_el = statement.find("div", class_="note")
    if note_el:
        sec_title = note_el.find("div", class_="section-title")
        if sec_title:
            sec_title.decompose()
        note_html = note_el.decode_contents()

    # Extract sample test cases with BeautifulSoup 4
    sample_tests = []
    inputs = statement.select(".sample-test .input pre")
    outputs = statement.select(".sample-test .output pre")

    for s_idx, (inp, out) in enumerate(zip(inputs, outputs), start=1):
        sample_tests.append({
            "id": s_idx,
            "title": f"Sample Test {s_idx}",
            "description": f"Official sample test case {s_idx} from Codeforces.",
            "input": extract_pre_text(inp),
            "expectedOutput": extract_pre_text(out),
        })

    meta = get_emoji_and_category(name, p_data.get("tags", []))
    cpp_starter = generate_starter_code_cpp(name, pid)
    java_starter = generate_starter_code_java(name, pid)
    py_starter = generate_starter_code_py(name, pid)

    return {
        "id": pid,
        "contestId": contest_id,
        "index": index,
        "title": name,
        "emoji": meta["emoji"],
        "category": meta["category"],
        "type": "exercise",
        "rating": p_data.get("rating", 800),
        "solvedCount": p_data.get("solvedCount", 0),
        "timeLimit": time_limit,
        "memoryLimit": memory_limit,
        "descriptionHtml": desc_html,
        "inputSpecificationHtml": input_html,
        "outputSpecificationHtml": output_html,
        "sampleNotesHtml": note_html,
        "starterCode": cpp_starter,
        "starterCodeCpp": cpp_starter,
        "starterCodeJava": java_starter,
        "starterCodePy": py_starter,
        "testCases": sample_tests,
    }

def scrape_codeforces_pipeline(limit: int = 25, specific_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch Codeforces problemset and scrape problem statements with BeautifulSoup 4."""
    print("Fetching Codeforces problemset list via API...")
    api_url = "https://codeforces.com/api/problemset.problems"
    resp = requests.get(api_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    api_data = resp.json()

    if api_data.get("status") != "OK":
        raise RuntimeError("Codeforces API error: " + str(api_data.get("status")))

    problems = api_data["result"]["problems"]
    stats = api_data["result"]["problemStatistics"]

    stat_map = {f"{s['contestId']}-{s['index']}": s.get("solvedCount", 0) for s in stats}
    for p in problems:
        p["solvedCount"] = stat_map.get(f"{p['contestId']}-{p['index']}", 0)

    if specific_id:
        target = specific_id.strip().upper()
        selected = [p for p in problems if f"{p['contestId']}{p['index']}".upper() == target]
        if not selected:
            raise ValueError(f"Problem {specific_id} not found in Codeforces problemset.")
    else:
        # Sort descending by solved count (most popular problems)
        problems.sort(key=lambda x: x["solvedCount"], reverse=True)
        selected = problems[:limit]

    print(f"Scraping {len(selected)} problems using BeautifulSoup 4 (bs4)...")
    results = []

    for idx, p in enumerate(selected, start=1):
        contest_id = p["contestId"]
        index = p["index"]
        pid = f"{contest_id}{index}"
        print(f"[{idx}/{len(selected)}] Scraping {pid}: {p['name']} with BeautifulSoup 4...")

        problem_entry = scrape_problem_page(contest_id, index, p)
        if problem_entry:
            results.append(problem_entry)

        time.sleep(0.5)

    return results

def main():
    parser = argparse.ArgumentParser(description="Codeforces scraper using BeautifulSoup 4")
    parser.add_argument("--limit", type=int, default=25, help="Number of problems to scrape (default: 25)")
    parser.add_argument("--id", type=str, default=None, help="Scrape a specific problem ID (e.g. 4A)")
    parser.add_argument("--output", type=str, default=None, help="Output JSON path")
    args = parser.parse_args()

    default_out = os.path.join(os.path.dirname(__file__), "..", "src", "data", "problems.json")
    out_path = args.output or default_out

    # Load existing problems to preserve any handcrafted hints/explanations
    existing_lookup: Dict[str, Dict[str, Any]] = {}
    if os.path.exists(out_path):
        try:
            with open(out_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if isinstance(existing_data, list):
                    for item in existing_data:
                        if isinstance(item, dict) and "id" in item:
                            existing_lookup[item["id"]] = item
        except Exception:
            pass

    scraped_problems = scrape_codeforces_pipeline(limit=args.limit, specific_id=args.id)

    # Merge preserved fields (like curated hints and explanations)
    for p in scraped_problems:
        pid = p["id"]
        if pid in existing_lookup:
            old = existing_lookup[pid]
            if "hints" in old and old["hints"]:
                p["hints"] = old["hints"]
            if "explanation" in old and old["explanation"]:
                p["explanation"] = old["explanation"]
            # If curated test cases exist and exceed sample count, preserve them
            if "testCases" in old and len(old["testCases"]) > len(p.get("testCases", [])):
                p["testCases"] = old["testCases"]

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(scraped_problems, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Successfully scraped and parsed {len(scraped_problems)} problems via BeautifulSoup 4!")
    print(f"     Output saved to: {out_path}")

if __name__ == "__main__":
    main()
