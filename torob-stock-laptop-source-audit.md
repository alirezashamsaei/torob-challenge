# Stock Laptop Offer Source Audit and Selection

Observed on November 17, 2026, Tehran time. Prices and availability below come from publicly viewable versions of offer pages. Some versions were cached and need a fresh check before entering the demo dataset. [Issue #7](https://github.com/alirezashamsaei/torob-challenge/issues/7)

## Inclusion criteria

- Each row represents one offer from a specific seller for a specific configuration. The offer page must identify the device as stock or used and show the model, CPU, RAM, storage, GPU, valid cash price in toman, and availability or an active purchase option. Consider open-box or refurbished devices only when the seller explicitly identifies them as such. Exclude unavailable items, accessories, call-for-price listings, and conflicting configurations until the ambiguity is resolved.
- Each offer needs at least one piece of evidence about the device itself, such as a disclosed cosmetic grade or a specific defect, or clear test and return terms that explicitly apply to the offer. Rated battery capacity, general model descriptions, promotional photos, and generic warranty badges without terms provide insufficient evidence of device condition. Use the purchase section for that offer's price and availability.
- Record the seller, URL, observation time, price, availability, specifications, and evidence for each value. Mark battery, chassis, display, keyboard, port condition, shipping cost, and defects as “Not disclosed” where evidence is missing. Count duplicate links and repeat listings for one offer once. Offers for the same model from different sellers count separately.
- To select a source, check its offer discovery path, whether its public pages are readable without signing in, the robots.txt rules for the actual crawler, and whether the crawl environment can reach it repeatedly. An indexed copy demonstrates readability. Assess crawl stability with two rounds of direct sampling and compare the observed prices and availability.

## Source decisions

| Source | Decision and evidence |
| --- | --- |
| Stock Iran | First priority for crawl testing. The paginated listing and public offer pages expose readable specifications and purchase sections. robots.txt returned HTTP 200 and permits the shop and offer paths for the generic user agent. The sales policy gives all laptops a seven-day hardware test period starting at delivery and offers replacement if a defect is found. Cosmetic issues must be reported within 24 hours. The terms require, among other things, that the seal remain intact. These terms establish hardware test coverage with conditions. Battery condition and unconditional returns remain unverified. [Listing](https://stockirshop.com/shop/) · [Sales terms](https://stockirshop.com/شرایط-فروش-و-مهلت-تست/) · [robots.txt](https://stockirshop.com/robots.txt) |
| Qeshmoff / Fars Pardazesh | Second priority for offers with evidence on their own pages, particularly gaming laptops. Qeshmoff is the marketplace, and Fars Pardazesh is the seller of the eligible sample. Readable versions of the listing and offer pages were available. robots.txt returned HTTP 200 and permits unfiltered /shop paths for the generic user agent while blocking certain agents and filtered URLs. Listing-level claims about grades and batteries need support on each offer page. [Listing](https://qeshmoff.com/shop/stock) · [robots.txt](https://qeshmoff.com/robots.txt) |
| Stockland | Conditional choice for everyday use and office work. The stock listing is separate from new and open-box devices. Offer pages show the SKU, specifications, availability, and cash price. Each offer page links to a general seven-day return policy effective from delivery. The customer pays return shipping unless the shop made an error. The listing and a sample offer returned HTTP 200. One robots.txt request succeeded and two connections were reset. Reading those rules successfully remains a prerequisite for automated crawling. [Listing](https://stockland.ir/product-category/laptop/laptop-stock) · [Return terms](https://stockland.ir/returns) · [robots.txt](https://stockland.ir/robots.txt) |
| Raitop | Conditional choice for broader budget coverage and additional gaming samples. Its stock listing includes items other than laptops, and its gaming category mixes device conditions. The sample offer page shows price, availability, specifications, and a returns link. The policy covers used and open-box items for seven days after delivery and requires technical issues to be reported within 48 hours. robots.txt returned HTTP 200 and permits the sampled public paths for the generic user agent. Direct listing and offer access from the crawl environment remains untested. [Stock listing](https://raitop.ir/status/stok/) · [Gaming](https://raitop.ir/usertypes/gaming/) · [Return terms](https://raitop.ir/return-policy-2/) · [robots.txt](https://raitop.ir/robots.txt) |
| Methoder System | Selected to expand office and graphics coverage. One listing and one offer returned HTTP 200 on direct requests, and robots.txt permits public offer paths for the generic user agent. The [ProBook 650 G5](https://methoder.ir/product/stock-laptop-hp-probook-650-g5-i5/) summary and description name different CPUs. The [HP 250 G4](https://methoder.ir/product/stock-laptop-hp-probook-250-g4-i5/) has conflicting CPU and storage details. The [EliteBook 845 G7](https://methoder.ir/product/stock-laptop-hp-elitebook-845-g7-ryzen5-pro/) shows a price and is out of stock. [Listing](https://methoder.ir/product-category/stock-laptop/) · [robots.txt](https://methoder.ir/robots.txt) |
| Ptech Plus | Reserve source for higher-priced graphics laptops. The sample offer shows available quantity and test and exchange terms. Only two of the 12 visible rows on the first listing page could be purchased, and some offer pages did not respond during the web review. robots.txt returned HTTP 200 and permits the sampled public paths for the generic user agent. [Listing](https://ptechplus.ir/product-category/laptop-stock/usage-lpst/) · [robots.txt](https://ptechplus.ir/robots.txt) |

Prioritize Stock Iran, Fars Pardazesh on Qeshmoff, and Methoder System for direct sampling. The listing and one offer page each for Stock Iran and Qeshmoff returned HTTP 200 in two closely spaced rounds. Methoder System had one successful round. Access across different days and from the demo host, and whether price and availability agree across rounds, are still unverified.

## Eligible offers in the sample

Prices are in millions of toman and come from the purchase sections of the versions reviewed. To reproduce the checks, open each offer's purchase section and specification table, then read the linked seller policy where applicable. The evidence column summarizes observations. Use cases are assigned from specifications to measure coverage. Actual gaming or graphics suitability depends on the game or application and the user's performance expectations.

| Seller | Offer | Price | Sample use case | Eligibility evidence |
| --- | --- | ---: | --- | --- |
| Stock Iran | [Dell Latitude 5580](https://stockirshop.com/product/لپ-تاپ-استوک-dell-latitude-5580/) | 57.97 | Everyday use and study | i7-7600U and 930MX, available for purchase and covered by hardware testing terms |
| Stock Iran | [HP ZBook 14 G2](https://stockirshop.com/product/لپ-تاپ-استوک-hp-zbook-14-g2/) | 55.79 | Everyday use and study | i7-5600U and FirePro M4150, available for purchase and covered by hardware testing terms |
| Stock Iran | [Dell Latitude 5410](https://stockirshop.com/product/لپ-تاپ-dell-latitude-5410/) | 87.77 | Office work | i7-10810U, available for purchase and covered by hardware testing terms |
| Stock Iran | [HP EliteBook x360 1040 G8](https://stockirshop.com/product/لپ-تاپ-hp-elitebook-x360-1040-g8/) | 126.79 | Office work | i7-1185G7 and 16 GB RAM, available for purchase and covered by hardware testing terms |
| Stock Iran | [Dell Precision 3551](https://stockirshop.com/product/dell-precision-3551/) | 147.77 | Graphics work | i9-10885H and Quadro P620, available for purchase and covered by hardware testing terms |
| Fars Pardazesh on Qeshmoff | [HP Victus 15-fa1128TX](https://qeshmoff.com/shop/hp-victus-15-fa1128tx-i5-13420h-16gb-512gb) | 210 | Gaming | RTX 2050, one in stock, and seller-reported like-new cosmetic condition. Battery health is undisclosed. |
| Stockland | [MacBook Air 2014 A1465](https://stockland.ir/products/apple-macbook-air-2014-a1465) | 46.90 | Everyday use and study | 4 GB RAM and SSD for light use, available for purchase and covered by the return policy |
| Stockland | [Dell Latitude 5580](https://stockland.ir/products/لپ-تاپ-dell-latitude-5580) | 54.50 | Everyday use and study | i5-7200U, available for purchase and covered by the return policy |
| Stockland | [HP 255 G8](https://stockland.ir/products/hp-255-g8-ryzen-5-5500u) | 79.30 | Everyday use and study | Ryzen 5 5500U, available for purchase and covered by the return policy |
| Stockland | [Dell Latitude 5410](https://stockland.ir/products/dell-latitude-5410) | 74 | Office work | i7-10610U, available for purchase and covered by the return policy |
| Stockland | [Dell Latitude 5511](https://stockland.ir/products/dell-latitude-5511) | 86.40 | Office work | i5-10400H, available for purchase and covered by the return policy |
| Stockland | [Dell Latitude 7320](https://stockland.ir/products/dell-latitude-7320) | 94 | Office work | i5-1135G7 and 16 GB RAM, available for purchase and covered by the return policy |
| Stockland | [HP EliteBook 630 G9](https://stockland.ir/products/hp-elitebook-630-g9) | 108 | Office work | i7-1255U, available for purchase and covered by the return policy |
| Raitop | [Lenovo IdeaPad 2-in-1 81CW](https://raitop.ir/product/lenovo-ideapad-2-in-1-14-81cw/) | 47.90 | Everyday use and study | Pentium 4415U and 4 GB RAM for light use, in stock and covered by the return policy |
| Raitop | [ASUS ROG Strix Scar 18 G834](https://raitop.ir/product/asus-rog-strix-scar-18-2024-g834/) | 810.079 | Gaming | Listed as open-box, RTX 4090, in stock and covered by the return policy |
| Methoder System | [HP ProBook 450 G7](https://methoder.ir/product/stock-laptop-hp-probook-450-g7-i5/) | 84.051 | Office work | i5-10210U and 16 GB RAM, available for purchase with Grade A and a seven-day test period |
| Methoder System | [HP ZBook G6 17w](https://methoder.ir/product/stock-laptop-hp-zbook-g6-17w-i7/) | 176.80 | Graphics work | i7-9750H and RTX 3000, available for purchase with Grade A and a seven-day test period |
| Methoder System | [HP ZBook G2 17w](https://methoder.ir/product/stock-laptop-hp-zbook-g2-17w-i7/) | 60 | Everyday use and study | i7-4700MQ and Quadro K1100M, available for purchase with Grade A and a seven-day test period |
| Ptech Plus | [Dell Precision 5690](https://ptechplus.ir/product/dell-precision-5690-ultra7-165h-64gb-512gb-nvidia-rtx-1000-ada-6gb/) | 385 | Graphics work | RTX 1000 Ada, one in stock, with seven days to test and exchange |

Excluded samples include the [HP EliteBook 840 G9](https://qeshmoff.com/shop/hp-elitebook-840-g9-i5-1245u-8gb-256gb), whose condition and battery health are undisclosed and whose offer lacks clear applicable terms, and the [Dell Precision 5540](https://qeshmoff.com/shop/dell-precision-5540-i7-9750h-16gb-512gb), whose configuration and condition need confirmation. The [Dell Latitude 7310](https://stockland.ir/products/dell-latitude-7310) showed a price in the listing, but the offer page marked it out of stock. The [HP ZBook 15 G5 Studio](https://stockirshop.com/product/لپ-تاپ-استوک-hp-zbook-15-g5-studio/) was also out of stock on its offer page.

## Coverage and product owner decision

Nineteen sampled offers from six sellers passed the offer-page criteria. Assigning each offer to one primary use case yields seven for everyday use and study, seven for office work, two for gaming, and three for graphics work. The counts below 60, from 60 to under 100, from 100 to under 150, and at or above 150 million toman are five, seven, three, and four, respectively. These bands describe this sample.

The sample is 21 offers short of the 40-offer target. Gaming and graphics work have the fewest offers, and the cheapest gaming offer costs 210 million toman. Most samples rely on test or return terms. Demonstrating a trade-off between price and condition requires devices with a specific defect, grade, or evidence of battery condition.

Two of the three priority sources were reachable on repeated direct checks on the same day. Zero sources have verified crawl stability from the demo host. If the next review fails to confirm at least three stable sources and 40 offers, the product owner must decide whether to expand the seller list or accept reduced coverage. Replacing crawling with manual collection would require a scope change approved by the product owner.

## Expanded offer sample

The following figures record the initial review, before the corrections in the later coverage section. The [offer sample CSV](docs/stock-laptop-offer-sample.csv) contains 120 distinct offer URLs across 25 reported sellers, including merchants identified on marketplaces. It includes 74 provisionally eligible offers from 16 sellers. The CSV retains listed price, condition and availability evidence, observation date, provenance, and screening status.

| Primary use case | Provisionally eligible | Needs further checks |
| --- | ---: | ---: |
| Everyday use and study | 23 | 27 |
| Office work | 28 | 13 |
| Gaming | 11 | 2 |
| Graphics work | 12 | 4 |
| **Total** | **74** | **46** |

Listed prices span 20 million to 810.079 million toman. The provisionally eligible range starts at 20,389,850 toman. Fourteen eligible offers fall below 60 million, 24 from 60 million to under 100 million, 14 from 100 million to under 150 million, and 22 at or above 150 million. Gaming has 11 provisionally eligible offers from five sellers. That group includes used RTX 3050 through RTX 4070 configurations and open-box RTX 4070 and RTX 4090 configurations, as well as the previously sampled RTX 2050.

### Device condition coverage

- Twenty-six entries have some seller-reported battery evidence and 18 have disclosed defects. Numeric battery readings range from 44% to 100%. Other entries report a threshold, a charge-cycle count, or a failed battery. These are seller claims from listing snapshots.
- Technolife marketplace listings include an Inspiron 7375 at 44% battery health, an Inspiron 7373 at 57% with impact damage, and an HP 15-ef2xxx with 10 dead pixels. These listings still need configuration confirmation. A provisionally eligible ThinkPad T14s has a disclosed left-hinge issue. ITjonoob also lists two laptops with failed batteries and a separate laptop with a failed keyboard. Those faults were visible on the catalog, while the offer pages returned HTTP 403.
- Cosmetic labels include Acceptable, Good, A, A+, A++, and Like new. Their scales vary by seller. Open-box and seller-labeled refurbished offers appear in the sample. Some Dubai Stock listings have a 25-day preorder lead time and require seller confirmation.

This is a snapshot of public seller and marketplace evidence, including indexed copies. Recheck price and availability before seeding the demo. Confirm the remaining configuration, condition, and availability gaps before promoting those rows. Crawl stability from the demo host remains unverified.

A follow-up matched two Surface Laptop offers and two Intel ThinkPad T14s Gen 2 offers to manufacturer storage and graphics specifications. It also normalized the Precision 3591 seller's GPU label to the 6 GB RTX 1000 Ada listed by Dell. [Surface Laptop 3](https://support.microsoft.com/en-us/surface/models/surface-laptop-3-specs-and-features) · [Surface Laptop 5 for Business](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/mcaps-federal-surface-RW10kfI.pdf) · [ThinkPad T14s Gen 2](https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_T14s_Gen_2_Intel/ThinkPad_T14s_Gen_2_Intel_Spec.pdf) · [Precision 3591](https://www.dell.com/support/manuals/en-us/precision-15-3591-laptop/precision-3591-owners-manual/gpudiscrete?guid=guid-037d4256-cab6-4135-bb2a-fce9ed20f9f9&lang=en-us)

## Demo source selection

This initial selection and its counts predate the later review below. Use Radin Computer, Stock Iran, Digi Store, and Ebadigi as the initial sources. Together they account for 50 provisionally eligible offers in the sample, covering all four use cases from 20.39 million to 383.88 million toman. Raitop is a reserve source, including for gaming.

| Selected shop | Provisional offers | Sample checked |
| --- | ---: | --- |
| Radin Computer | 24 | [Inspiron 5482 2-in-1](https://radincomputer.com/product/dell-inspiron-5482-2-in-1-core-i7-8565u-8gb-256gb-stock/) |
| Stock Iran | 10 | [Precision 3551](https://stockirshop.com/product/dell-precision-3551/) |
| Digi Store | 10 | [ProBook 645 G1](https://digistores.ir/products/hp-probook-645-g1/) |
| Ebadigi | 6 | [TUF Gaming F15](https://ebadigi.ir/product/asus-tuf-gaming-f15/) |

On November 17, 2026, this workspace retrieved public crawler rules and received HTTP 200 on two requests to each selected sample and the Raitop reserve sample. Digi Store and Ebadigi's first crawler-rule requests reset before succeeding on retry. These were same-day reachability checks. Runflare reported that this checkout was not linked to a deployment, so crawl stability from the demo host remains unverified. Recheck access, price, and availability on the deployment path before using the data in the demo.

At the initial review, the CSV included 106 seller image URLs, covering 70 of the then 74 provisionally eligible offers. Blank fields indicate that a matching seller image could not be verified.

### Review corrections and coverage

Review on November 17, 2026 used the recorded snapshot and accessible indexed source pages, some cached. The CSV is the source-evidence record. The review changed screening statuses and added the previous decision and reason to affected rows' notes. It also filled four configurations from the seller page, recording their original values and cached sources in the notes. Original listed prices, source URLs, observation dates, condition and policy claims remain intact. These decisions apply to the recorded snapshot and do not establish present availability.

- Fifteen offers previously marked provisionally eligible have `See source page` in place of complete configuration evidence. They now need exact configuration confirmation. The earlier notes contain some, but not all, required CPU, RAM, storage and GPU details.
- The [Stock Iran Precision 3551](https://stockirshop.com/product/dell-precision-3551/) was completed from its cached purchase section. It lists i9-10885H, 16 GB RAM, 512 GB SSD and Quadro P620 4 GB, with the same recorded price. Its original configuration field was `See source page`. The cached copy was about two weeks old when reviewed, so this remains provisional.
- Three other Stock Iran offers were completed from their cached purchase sections, which list the recorded prices and full configurations. These are the [ZBook 14 G2](https://stockirshop.com/product/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-%D8%A7%D8%B3%D8%AA%D9%88%DA%A9-hp-zbook-14-g2/), [Latitude 5410](https://stockirshop.com/product/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-dell-latitude-5410/), and [EliteBook x360 1040 G8](https://stockirshop.com/product/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-hp-elitebook-x360-1040-g8/). Their original configuration fields said `See source page`.
- Ten Digi Store offers previously marked provisionally eligible now need device condition or applicable terms. The recorded evidence gives a seven-day return claim but no policy conditions or specific device condition. For example, the [ProBook 645 G1 offer](https://digistores.ir/products/hp-probook-645-g1/) displays a seven-day return badge without terms in its purchase section. One offer page timed out during this review. The original claim is retained in each row for follow-up.
- The recorded Ebadigi TUF F16 FX607VU offer URL was inaccessible. Similar listings show different prices, so the row is held until the original offer is verified.
- The [Ebadigi TUF F15 FX507ZC4-HN009](https://ebadigi.ir/product/%D8%AF%D8%B1-%D8%AD%D8%AF-%D9%86%D9%88-%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-15-6-%D8%A7%DB%8C%D9%86%DA%86%DB%8C-%D8%A7%DB%8C%D8%B3%D9%88%D8%B3-%D9%85%D8%AF%D9%84-tuf-gaming-f15-fx507zc4-hn009-c/) has a seller-reported cosmetic condition, but the reviewed page did not establish the recorded test-period claim. It is held until those terms are confirmed.
- The [Martday TUF F15](https://martday.ir/store/products/asus-tuf-gaming-f15-fx507vi-i7-13620h-rtx4070-16gb-1tb) asks buyers to confirm the price despite displaying one, so it is held for price confirmation. Its page states the seven-day return conditions for all goods.
- The [Surface Laptop 3 on Technolife](https://www.technolife.com/product-579366/) shows a seven-day marketplace badge and 14 days in product details. It is held until the terms for the listed seller are confirmed.
- Three more Technolife offers with 14-day terms are held until those terms are reconciled with the marketplace [seven-day return policy](https://www.technolife.com/staticpage/page-11/%D8%B1%D9%88%DB%8C%D9%87). Their offer pages were inaccessible during this review.
- The other 46 offers already carried a specific reason for further checks. Their original screening reasons remain in the CSV. A request for confirmation is a hold, not a finding that the device is defective.

For policy evidence, Stock Iran's [sales terms](https://stockirshop.com/%D8%B4%D8%B1%D8%A7%DB%8C%D8%B7-%D9%81%D8%B1%D9%88%D8%B4-%D9%88-%D9%85%D9%87%D9%84%D8%AA-%D8%AA%D8%B3%D8%AA/) expressly cover all laptops, with a seven-day hardware test and a 24-hour window for cosmetic issues. Raitop's [return policy](https://raitop.ir/return-policy-2/) covers stock and open-box laptops and asks that technical issues be reported within 48 hours. Radin's [policy](https://radincomputer.com/shipping-and-returns/) covers stock goods for one week, while its [HP listing](https://radincomputer.com/product-category/stock-products/stock-laptop/stock-laptop-hp/) expressly advertises a one-week test for the open-box OmniBook 5. Offer-specific terms and grades remain seller claims. These policies do not establish the health of an individual device. The Martday offer itself says its seven-day return applies to all goods, with return shipping paid by the customer. Other seller claims remain as recorded and need offer-level verification before being used as applicable policy terms.

Counts below use the CSV's primary use-case assignment and `Provisionally eligible` status after these corrections. Budget bands are in millions of toman and are lower-inclusive, upper-exclusive. Counts describe initial screening, and do not establish fit for a particular game, application, or defect preference. A provisional status also does not verify every seller's policy, current stock, or current price.

| Primary use case | Under 60 | 60 to <100 | 100 to <150 | 150 and above | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Everyday use and study | 2 | 9 | 1 | 0 | 12 |
| Office work | 0 | 6 | 6 | 2 | 14 |
| Gaming | 0 | 0 | 0 | 6 | 6 |
| Graphics work | 0 | 1 | 3 | 6 | 10 |
| **Total** | **2** | **16** | **10** | **14** | **42** |

The application eligibility rules also allow an offer to serve a use case other than its primary audit category. The following counts were evaluated on a freshly seeded in-memory store using a one-billion-toman cap, acceptable chassis scratches, balanced expectations, Counter-Strike 2 for gaming, and Photoshop for graphics. Columns are disjoint offer-price bands, not maximum-budget totals. The same offer can appear in more than one use case. These are scenario-specific results under the current rules, not forecasts of game or application performance.

| Journey | Under 60 | 60 to <100 | 100 to <150 | 150 and above | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Everyday use and study | 1 | 16 | 10 | 8 | 35 |
| Office work | 1 | 16 | 10 | 8 | 35 |
| Gaming, Counter-Strike 2 | 0 | 0 | 0 | 6 | 6 |
| Graphics, Photoshop | 0 | 0 | 0 | 6 | 6 |

The everyday and office scenarios each admit 35 offers, five short of the 40-offer target. The 42 provisionally screened offers do not establish that 40 pass the application filters.

The remaining 78 offers are held for review. The selected-source counts and seller totals above are historical. Refresh the source selection and verify applicable terms before using these offers in the demo.

Existing SQLite stores retain their previous rows when seeding is repeated. Run `node scripts/apply-offer-review.mjs` against an existing store to apply these corrections. Set `OFFERS_DB_PATH` to choose the store. The script checks the full previous row before updating, reports missing or changed rows as conflicts, and leaves manual edits intact. A repeat run recognizes already applied corrections. Review any reported conflicts individually. A newly seeded store already contains the reviewed CSV values.
