#!/usr/bin/env python3
"""
Codeforces Problem Scraper & Data Pipeline
Utilizes BeautifulSoup 4 (bs4) and requests to scrape and parse
Codeforces problem statements, LaTeX math, and official sample test cases.
"""

import json
import os
import re
import sys
import time
from typing import Dict, List, Any

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    # If dependencies are not yet installed in local environment
    pass

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

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

def scrape_codeforces_pipeline(limit: int = 25) -> List[Dict[str, Any]]:
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

    # Sort descending by popularity
    problems.sort(key=lambda x: x["solvedCount"], reverse=True)
    selected = problems[:limit]
    print(f"Ingesting top {len(selected)} problems using BeautifulSoup 4...")

    output_problems = []

    for idx, p in enumerate(selected, start=1):
        contest_id = p["contestId"]
        index = p["index"]
        pid = f"{contest_id}{index}"
        name = p["name"]
        print(f"[{idx}/{len(selected)}] Scraping {pid}: {name}...")

        url = f"https://codeforces.com/problemset/problem/{contest_id}/{index}"
        try:
            page_resp = requests.get(url, headers=HEADERS, timeout=15)
            page_resp.raise_for_status()
        except Exception as e:
            print(f"Failed to fetch {pid}: {e}", file=sys.stderr)
            continue

        soup = BeautifulSoup(page_resp.text, "html.parser")
        statement = soup.find("div", class_="problem-statement")
        if not statement:
            print(f"Problem statement DOM element not found for {pid}", file=sys.stderr)
            continue

        # Extract Header limits
        header = statement.find("div", class_="header")
        time_limit = "1.0s"
        memory_limit = "256MB"
        if header:
            t_el = header.find("div", class_="time-limit")
            if t_el:
                time_limit = t_el.get_text(strip=True).replace("time limit per test", "").strip()
            m_el = header.find("div", class_="memory-limit")
            if m_el:
                memory_limit = m_el.get_text(strip=True).replace("memory limit per test", "").strip()

        # Problem Statement Narrative (second child div)
        child_divs = statement.find_all("div", recursive=False)
        desc_html = str(child_divs[1]) if len(child_divs) > 1 else ""

        input_spec = statement.find("div", class_="input-specification")
        input_html = str(input_spec) if input_spec else ""

        output_spec = statement.find("div", class_="output-specification")
        output_html = str(output_spec) if output_spec else ""

        note_el = statement.find("div", class_="note")
        note_html = str(note_el) if note_el else ""

        # Extract Sample Test Cases using BeautifulSoup
        sample_tests = []
        sample_inputs = statement.select(".sample-test .input pre")
        sample_outputs = statement.select(".sample-test .output pre")

        for s_idx, (inp, out) in enumerate(zip(sample_inputs, sample_outputs), start=1):
            sample_tests.append({
                "id": s_idx,
                "title": f"Sample Test {s_idx}",
                "description": f"Official sample test case {s_idx} from Codeforces.",
                "input": inp.get_text(strip=True),
                "expectedOutput": out.get_text(strip=True),
            })

        output_problems.append({
            "id": pid,
            "contestId": contest_id,
            "index": index,
            "title": name,
            "emoji": "💡",
            "category": "Practice",
            "type": "exercise",
            "rating": p.get("rating", 800),
            "solvedCount": p["solvedCount"],
            "timeLimit": time_limit,
            "memoryLimit": memory_limit,
            "descriptionHtml": desc_html,
            "inputSpecificationHtml": input_html,
            "outputSpecificationHtml": output_html,
            "sampleNotesHtml": note_html,
            "starterCode": generate_starter_code_cpp(name, pid),
            "starterCodeJava": generate_starter_code_java(name, pid),
            "starterCodePy": generate_starter_code_py(name, pid),
            "testCases": sample_tests,
        })

        time.sleep(0.5)

    return output_problems

if __name__ == "__main__":
    try:
        data = scrape_codeforces_pipeline(limit=25)
        out_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "problems.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully processed {len(data)} problems with BeautifulSoup 4 -> {out_path}")
    except Exception as exc:
        print(f"Scraper error: {exc}", file=sys.stderr)
