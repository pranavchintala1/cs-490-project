from bs4 import BeautifulSoup
import requests, tldextract
from playwright.async_api import async_playwright


# INSTALLING PLAYWRIGHT --> do ```playwrite install``` in your terminal

class URLScrapeError(Exception):
    def __init__(self, message: str = "Unable to scrape this URL"):
        super().__init__(message)

async def job_from_url(url: str):
    ext = tldextract.extract(url)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "font"] else route.continue_())
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        html = await page.content()
        await browser.close()
    
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
    spans = info.find_all("span")
    salary = spans[0]
    job_type = spans[1]
    description = soup.select_one("#jobDescriptionText")

    return {
        "title": title.get_text(strip = True) if title else None,
        "company": company.get_text(strip = True) if company else None,
        "location": location.get_text(strip = True) if location else None,
        "salary": salary.get_text(strip = True) if salary else None,
        "deadline": None,
        "industry": None,
        "job_type": list(job_type.stripped_strings)[1] if job_type else None,
        "description": description.get_text(strip = True) if description else None
    }