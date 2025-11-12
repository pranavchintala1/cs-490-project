from bs4 import BeautifulSoup
import requests, tldextract, asyncio, base64
from playwright.sync_api import sync_playwright
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
        # elif ext.domain.lower() == "linkedin":
        #     return await linkedin_scrape(html)
        # elif ext.domain.lower() == "glassdoor":
        #     return await glassdoor_scrape(html)
        else:
            raise URLScrapeError("Unsupported domain, please import from a supported website")
    except URLScrapeError:
        raise
    except Exception as e:
        raise ValueError(f"Error trying to scrape URL: {e}") from e

async def indeed_scrape(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    title = soup.select_one(".jobsearch-JobInfoHeader-title span").find(text = True, recursive = False)
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
    href = soup.select_one('[data-testid="inlineHeader-companyName"] a')
    company_url = href.get("href") if href else None

    # Safely extract job_type text
    job_type_text = None
    if job_type:
        stripped_strings = list(job_type.stripped_strings)
        if len(stripped_strings) > 1:
            job_type_text = stripped_strings[1]

    # company data  
    company_data = await indeed_company_info(company_url) if company_url else None

    return {
        "title": title.get_text(strip = True) if title else None,
        "company": company.get_text(strip = True) if company else None,
        "location": location.get_text(strip = True) if location else None,
        "salary": salary.get_text(strip = True) if salary else None,
        "deadline": None,
        "industry": company_data["industry"],
        "job_type": job_type_text,
        "description": description.get_text(strip = True) if description else None,
        "company": company_data, # --> object containing all company info
    }

async def indeed_company_info(url: str):
    loop = asyncio.get_event_loop()
    html = await loop.run_in_executor(_executor, _scrape_with_playwright, url)

    soup = BeautifulSoup(html, "html.parser")

    # company size
    size_tab = soup.select_one('li[data-testid="companyInfo-employee"]')
    outer_span = size_tab.find("span") if size_tab else None
    inner_span = outer_span.find("span") if outer_span else None

    inner_text = inner_span.get_text(strip = True) if inner_span else ""
    company_size = outer_span.get_text(strip = True).replace(inner_text, "") if outer_span  else ""
    comparator = inner_span.find(text = True, recursive = False)

    # company industry
    industry_div = soup.select_one('li[data-testid="companyInfo-industry"] > div:nth-of-type(2)')

    # company headquarters location
    headquarters_div = soup.select_one('li[data-testid="companyInfo-headquartersLocation"] > span:nth-of-type(1)')

    # company description
    homepage_link = soup.select_one('li[data-testid="companyInfo-companyWebsite"] > div:nth-of-type(2) > a').get("href")

    # company homepage more-text less-text
    description = soup.select_one('div[data-testid="less-text"] > p').get_text(strip = True)

    # profile image
    image_url = soup.select_one('div[data-testid="cmp-HeaderLayout"] img').get("src")
    res = requests.get(image_url)
    res.raise_for_status()

    img_b64 = base64.b64encode(res.content).decode("utf-8")
    
    return {
        "size": f"{comparator} {company_size}",
        "industry": industry_div.get_text(strip = True) if industry_div else None,
        "location": headquarters_div.get_text(strip = True) if headquarters_div else None,
        "website": homepage_link,
        "description": description,
        "image": img_b64
    }
