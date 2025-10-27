
import { useState, useCallback } from 'react';
import type { CrawledData } from '../types';

export const useCrawler = () => {
  const [isCrawling, setIsCrawling] = useState<boolean>(false);

  const crawl = useCallback((url: string): Promise<CrawledData> => {
    setIsCrawling(true);
    return new Promise((resolve) => {
      // Simulate network delay for crawling
      setTimeout(() => {
        // Generate pseudo-random but realistic data
        const domain = new URL(url).hostname;
        const keywordBase = domain.split('.')[0] || 'example';

        const data: CrawledData = {
          url: url,
          title: `Discover the Best ${keywordBase} Products | ${domain}`,
          description: `Explore our top-rated ${keywordBase} solutions, designed for excellence and reliability. Get the best value and performance today.`,
          keywords: [`${keywordBase}`, `best ${keywordBase}`, `${keywordBase} solutions`, `buy ${keywordBase}`],
          h1s: [`The Ultimate Guide to ${keywordBase}`],
          contentSample: `Welcome to our deep dive into the world of ${keywordBase}. This article explores the various aspects of ${keywordBase}, from its history to its modern applications. We'll cover key features, benefits, and how you can get started. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
          imageCount: Math.floor(Math.random() * 10) + 5, // 5 to 14 images
          altTextMissing: Math.floor(Math.random() * 4), // 0 to 3 missing alt texts
          internalLinks: Math.floor(Math.random() * 20) + 10, // 10 to 29 internal links
          externalLinks: Math.floor(Math.random() * 5) + 2, // 2 to 6 external links
        };
        setIsCrawling(false);
        resolve(data);
      }, 1500 + Math.random() * 1000); // Simulate crawl time between 1.5s and 2.5s
    });
  }, []);

  return { crawl, isCrawling };
};
