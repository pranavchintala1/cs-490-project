from bs4 import BeautifulSoup
import requests, tldextract
from playwright.sync_api import sync_playwright
import asyncio
from concurrent.futures import ThreadPoolExecutor


# INSTALLING PLAYWRIGHT --> do ```playwright install``` in your terminal

class URLScrapeError(Exception):
    def __init__(self, message: str = "Unable to scrape this URL"):
        super().__init__(message)

# Thread pool for running sync Playwright (Windows compatibility)
_executor = ThreadPoolExecutor(max_workers=3)

def _scrape_with_playwright(url: str) -> str:
    """Synchronous function that uses sync_playwright for Windows compatibility"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "font"] else route.continue_())
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        html = page.content()
        browser.close()
        return html

async def job_from_url(url: str):
    ext = tldextract.extract(url)

    # Run the sync playwright code in a thread pool
    loop = asyncio.get_event_loop()
    html = await loop.run_in_executor(_executor, _scrape_with_playwright, url)
    
    try:
        if ext.domain.lower() == "indeed":
            return await indeed_scrape(html)
        elif ext.domain.lower() == "linkedin":
            return await linkedin_scrape(html)
        elif ext.domain.lower() == "glassdoor":
            return await glassdoor_scrape(html)
        else:
            raise URLScrapeError("Unsupported domain, please import from a supported website")
    except URLScrapeError:
        raise
    except Exception as e:
        raise ValueError(f"Error trying to scrape URL: {e}") from e


# should be job schema
async def linkedin_scrape(url: str) -> dict:
    pass # FIXME: currently not able to be implemented due to linkedin security

async def glassdoor_scrape(url: str) -> dict:
    pass # TODO: implement

async def indeed_scrape(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    title = soup.select_one(".jobsearch-JobInfoHeader-title span")
    company = soup.select_one('[data-testid="jobsearch-CompanyInfoContainer"] a')
    location = soup.select_one('[data-testid="inlineHeader-companyLocation"] div')

    info = soup.select_one("#salaryInfoAndJobType")
    salary = None
    job_type = None
    
    if info:
        spans = info.find_all("span")
        if len(spans) > 0:
            salary = spans[0]
        if len(spans) > 1:
            job_type = spans[1]
    
    description = soup.select_one("#jobDescriptionText")

    # Safely extract job_type text
    job_type_text = None
    if job_type:
        stripped_strings = list(job_type.stripped_strings)
        if len(stripped_strings) > 1:
            job_type_text = stripped_strings[1]

    return {
        "title": title.get_text(strip = True) if title else None,
        "company": company.get_text(strip = True) if company else None,
        "location": location.get_text(strip = True) if location else None,
        "salary": salary.get_text(strip = True) if salary else None,
        "deadline": None,
        "industry": None,
        "job_type": job_type_text,
        "description": description.get_text(strip = True) if description else None
    }