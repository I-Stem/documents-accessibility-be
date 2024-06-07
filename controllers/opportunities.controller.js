const puppeteer = require('puppeteer');
const { formResponse } = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const axios = require('axios');


const scrapeAndStore = async (category, region) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const mainPage = await browser.newPage();
    console.log(category, region);
    const url = `https://www.youthop.com/search/?_sft_category=${category}&_sft_regions=${region}`;
    await mainPage.goto(url);

    const totalPages = await mainPage.$$eval('#main-container > div > div > div > nav > ul > li', lis => lis.length);

    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const articles = await mainPage.$$('div#response article');

        for (const article of articles) {
            try {
                let content = '';
                const title = await article.$eval('a h3', element => element.textContent.trim());
                const link = await article.$eval('a', element => element.getAttribute('href'));
                console.log('Title:', title);
                console.log("link:", link);

                const existingGrant = await Grant.findOne({ title });

                if (existingGrant) {
                    console.log('Grant with the same title already exists:', title);
                } else {
                    // Open a new page for each article to fetch content
                    const page = await browser.newPage();
                    await page.goto(link);

                    try {
                        content = await page.$eval('div.article-content', element => element.innerHTML);
                    } catch (error) {
                        console.log('Content not found');
                    }

                    const grant = new Grant({
                        title: title,
                        category: category,
                        region: region,
                        htmlContent: content
                    });

                    await grant.save(); // Save the grant to the database
                    console.log('Stored grant:', title);
                }
            } catch (error) {
                console.log('Skipping grant due to missing title or link');
            }
        }

        const nextPageButton = await mainPage.$('a.next');
        if (nextPageButton && currentPage < totalPages) {
            currentPage++;
            await nextPageButton.click(); // Click on the "Next" button to navigate to the next page
            await mainPage.waitForNavigation(); // Wait for the page to load
        } else {
            hasNextPage = false;
        }
    }

    await browser.close();
};





// exports.getTitlesByCategoryAndRegions = async (req, res) => {

//     const { category, region, page } = req.query;

//     if (!category) {
//         return res.status(400).json({ error: 'Category query parameter is required.' });
//     }

//     let url;

//     // if (region) {
//     //     if (!page) {
//     //         return res.status(400).json({ error: 'Page query parameter is required when region is specified.' });
//     //     }
//     //     url = `https://www.youthop.com/search/_sft_category=${category}&_sft_regions=${region}&sf_paged=${page}`;
//     // } else {
//     //     url = `https://www.youthop.com/search/?_sft_category=${category}&sf_paged=${page || 1}`;
//     // }

//     if (region) {
//         url = `https://www.youthop.com/search/_sft_category=${category}&_sft_regions=${region}${page ? `&sf_paged=${page}` : ''}`;
//     } else {
//         url = `https://www.youthop.com/search/?_sft_category=${category}${page ? `&sf_paged=${page}` : ''}`;
//     }

//     try {
//         const browser = await puppeteer.launch({
//             headless: false

//         });
//         const mainPage = await browser.newPage();
//         await mainPage.goto(url);

//         const totalPages = await mainPage.$$eval('#main-container > div > div > div > nav > ul > li', lis => lis.length);

//         let currentPage = 1;
//         let hasNextPage = true;
//         const titles = [];

//         while (hasNextPage) {
//             const articles = await mainPage.$$('div#response article');

//             for (const article of articles) {
//                 try {
//                     const title = await article.$eval('a h3', element => element.textContent.trim().toLowerCase());
//                     titles.push(title);
//                 } catch (error) {
//                     console.log('Skipping grant due to missing title');
//                 }
//             }

//             const nextPageButton = await mainPage.$('a.next');
//             if (nextPageButton && currentPage < totalPages) {
//                 currentPage++;
//                 await nextPageButton.click();
//                 await mainPage.waitForNavigation();
//             } else {
//                 hasNextPage = false;
//             }
//         }

//         await browser.close();

//         res.json({ titles });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'An error occurred' });
//     }

// }



exports.getTitlesByCategoryAndRegions = async (req, res) => {

    const { category, region, page } = req.query;


    // console.log(region)
    let url;


    if (!category && !region) {
        if(page == undefined) {
            console.log(`inside page with !page !category and !region specified`)
            url = `https://www.youthop.com/search/`;
        }
        else if (page == 1) {
            console.log(`inside page ${page} with !category and !region specified`)
            url = `https://www.youthop.com/search/`
        }
        else {
            console.log(`inside page ${page} with !category and !region specified`)
            url = `https://www.youthop.com/search/?sf_paged=${page}`
        }

    }
    else if (category && region) {
        if(page == undefined) {
            console.log(`inside page with !page region and category specidied!`)
            url = `https://www.youthop.com/search/?_sft_category=${category}&_sft_regions=${region}`;
        }
        else if (page == 1) {
            console.log(`inside page ${page} with region and category specidied!`)
            url = `https://www.youthop.com/search/?_sft_category=${category}&_sft_regions=${region}`;
        }
        else {
            console.log(`inside page ${page} with region and  category specidied!`)

            url = `https://www.youthop.com/search/?_sft_category=${category}&_sft_regions=${region}&sf_paged=${page}`;
        }
    } 
    else if (region) {
        if(page == undefined) {
            console.log(`inside page with !page region and category specidied!`)
            url = `https://www.youthop.com/search/?_sft_regions=${region}`;
        } 
        else if (page == 1) {
            console.log(`inside page ${page} with only region  specified`)
            url = `https://www.youthop.com/search/?_sft_regions=${region}`;
        }
        else {
            console.log(`inside page ${page} with only region specified`)
            url = `https://www.youthop.com/search/?_sft_regions=${region}&sf_paged=${page}`
        }
    } else if (category) {
        if(page == undefined) {
            console.log(`inside page with !page region and category specidied!`)
            url = `https://www.youthop.com/search/?_sft_category=${category}`;
        }
        else if (page == 1) {
            console.log(`inside page ${page} with only category specidied!`)

            url = `https://www.youthop.com/search/?_sft_category=${category}`;
        }
        else {
            console.log(`inside page ${page} with only category specidied!`)

            url = `https://www.youthop.com/search/?_sft_category=${category}&sf_paged=${page}`;

        }
    }
    else {
        return res.status(400).json({ error: 'please provide category or region to get the result!' });
    }


    try {      
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();    
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.$$eval('article', nodes => nodes.map(node => {
            const href = node.querySelector('.post-image a')?.href;
            const title = node.querySelector('.post-header a h3')?.innerText.trim();
            return { href, title };
        }));
        await browser.close();
        if (!articles) {
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'No titles found'));
        }
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, { articles }));
    } catch (error) {
        console.error('Error:', error);
        return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An Error occurred by searching titles'));
    }
}


exports.getTitleBySearch = async (req, res) => {
    const { search, page } = req.query;

    let url;
    if (page == 1) {
        console.log(`searching inside ${page} `)
        url = `https://www.youthop.com/search?s=${search}`;
    }
    else {
        console.log(`searching inside ${page} `)
        url = `https://www.youthop.com/search/?s=${search}&sf_paged=${page}`
    }


    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const mainPage = await browser.newPage();
        await mainPage.goto(url);

        const totalPages = await mainPage.$$eval('#main-container > div > div > div > nav > ul > li', lis => lis.length);

        // let currentPage = 1;
        // let hasNextPage = true;
        const titles = [];

        // while (hasNextPage) {
        const articles = await mainPage.$$('div#response article');

        for (const article of articles) {
            try {
                const title = await article.$eval('a h3', element => element.textContent.trim().toLowerCase());
                titles.push(title);
            } catch (error) {
                console.log('Skipping grant due to missing title');
            }

        }

        await browser.close();

        if (titles.length === 0) {
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'No titles found'));
        }
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, titles));



    } catch (error) {
        console.error('Error:', error);
        return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An Error occurred by searching titles'));
    }

}


exports.getContentByTitleAndCategory = async (req, res) => {

    // #----------------------------------
    const { category, title } = req.query;
    console.log(title)
    if (!category || !title) {
        return res.status(400).send('Both category and title query parameters are required.');
    }

    const formattedTitle = title.replace(/\b(at|in)\b/g, '').replace(/,/g, '').replace(/\s+/g, '-') // Convert spaces to hyphens
    console.log(formattedTitle)
    const link = `https://www.youthop.com/${category}/${formattedTitle}?ref=browse_page`;


    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto(link);

        try {
            // Capture the HTML content and CSS styles
            const content = await page.$eval('div.article-content', element => {
                const styles = Array.from(document.styleSheets).map(sheet => {
                    if (sheet.href) {
                        return `<link rel="stylesheet" href="${sheet.href}">`;
                    } else {
                        return `<style>${sheet.ownerNode.textContent}</style>`;
                    }
                }).join('');

                const html = element.innerHTML;

                // Remove all <aside> tags
                const cleanedHtml = html.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '');

                return styles + cleanedHtml;
            });

            res.send(content);
        } catch (error) {
            console.log('Content not found');
            res.status(404).send('Content not found');
        }

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
}


exports.getContentByHref = async (req, res) => {
    const url = req.body?.url;
    if (!url) {
        return res.status(400).send('URL is Required.');
    }
    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto(url);

        try {
            // Capture the HTML content and CSS styles
            const content = await page.$eval('div.article-content', element => {
                const styles = Array.from(document.styleSheets).map(sheet => {
                    if (sheet.href) {
                        return `<link rel="stylesheet" href="${sheet.href}">`;
                    } else {
                        return `<style>${sheet.ownerNode.textContent}</style>`;
                    }
                }).join('');

                const html = element.innerHTML;

                // Remove all <aside> tags
                const cleanedHtml = html.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '');

                return styles + cleanedHtml;
            });

            await browser.close();
            res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, { content: content }));
        } catch (error) {
            console.log('Content not found');
            res.status(404).send('Content not found');
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
}

// module.exports = scrapeAndStore


