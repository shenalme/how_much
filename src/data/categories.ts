import type { IconName } from '../components/ui/Icon';

export type CategoryId =
  | 'garden'
  | 'home'
  | 'construction'
  | 'converters'
  | 'math'
  | 'automotive'
  | 'animals'
  | 'cooking'
  | 'finance'
  | 'travel'
  | 'time'
  | 'business';

export interface Category {
  /** URL segment, e.g. /garden. Permanent: do not change once published. */
  id: CategoryId;
  /** Short name used in navigation and breadcrumbs. */
  name: string;
  /** H1 on the category page. */
  heading: string;
  /** One line used on category cards. */
  summary: string;
  /** Meta description for the category page. */
  metaDescription: string;
  /** Introductory paragraphs shown above the tool grid. */
  intro: string[];
  /** Practical tips shown below the tool grid. */
  tips?: { title: string; text: string }[];
  related: CategoryId[];
  icon: IconName;
}

export const categories: Category[] = [
  {
    id: 'garden',
    name: 'Garden',
    heading: 'Garden calculators',
    summary: 'Mulch, soil, compost, seed, sod and fencing for your yard.',
    metaDescription:
      'Garden calculators for mulch, soil, compost, grass seed, sod, raised beds and fencing. Work out how much to buy before you order.',
    intro: [
      'Most garden materials are sold by volume (cubic yards, cubic feet, litres or cubic metres) or by coverage area, but projects are measured in length, width and depth. These calculators do that conversion for you so you can order the right amount the first time.',
      'Measure each bed or lawn area separately and add the results together if your space is irregular. For loose materials, order slightly more than the calculated amount: mulch and soil settle after they are spread and watered.',
    ],
    tips: [
      {
        title: 'Bulk or bags?',
        text: 'Bagged material is convenient for small jobs. For a few cubic yards or more, bulk delivery is usually cheaper per unit volume; compare the prices using the cubic-yard or cubic-metre figure each calculator shows.',
      },
      {
        title: 'Measuring odd shapes',
        text: 'Break curved or L-shaped beds into rectangles, circles and triangles, calculate each with the Garden Area Calculator, then add the areas.',
      },
    ],
    related: ['home', 'construction', 'animals'],
    icon: 'leaf',
  },
  {
    id: 'home',
    name: 'Home',
    heading: 'Home improvement calculators',
    summary: 'Paint, flooring, tile and concrete for DIY projects.',
    metaDescription:
      'Home improvement calculators for paint, flooring, tile and concrete. Estimate materials, boxes and bags for your next DIY project.',
    intro: [
      'Running out of paint halfway through a wall or ordering one box too few of discontinued tile is a familiar DIY frustration. These calculators turn room measurements into the quantities you will actually buy: gallons or litres, boxes, tiles and bags.',
      'Each calculator lets you add a waste allowance. Cuts, breakage and pattern matching use up material, and buying a little extra from the same batch is cheaper than a second trip and avoids colour or dye-lot mismatches.',
    ],
    tips: [
      {
        title: 'Check the label',
        text: 'Coverage figures differ between products. Where a calculator asks for coverage per gallon or per box, use the number printed on the product you plan to buy.',
      },
    ],
    related: ['construction', 'garden', 'math'],
    icon: 'house',
  },
  {
    id: 'construction',
    name: 'Construction',
    heading: 'Construction calculators',
    summary: 'Concrete, gravel and decking quantities for outdoor builds.',
    metaDescription:
      'Construction calculators for concrete, gravel and decks. Estimate cubic yards, tons, bags, boards and joists for outdoor projects.',
    intro: [
      'Outdoor building projects are priced by volume and weight: cubic yards of concrete, tons of gravel, linear feet of decking. These calculators estimate those quantities from simple measurements, with the formulas shown so you can check the numbers.',
      'They are planning tools, not structural design. Footing sizes, slab thickness, joist spans and fastener schedules depend on local building codes, loads and soil conditions. Confirm requirements with your building department or a qualified professional before you build.',
    ],
    related: ['home', 'garden', 'converters'],
    icon: 'brick',
  },
  {
    id: 'converters',
    name: 'Conversions',
    heading: 'Unit converters',
    summary: 'Length, weight, area and temperature conversions.',
    metaDescription:
      'Unit converters for feet and meters, inches and centimeters, pounds and kilograms, acres and hectares, and Fahrenheit and Celsius. Exact factors and quick reference tables.',
    intro: [
      'Every converter here uses the exact internationally agreed definition of each unit. Since 1959 the international inch has been exactly 2.54 centimetres and the international pound exactly 0.45359237 kilograms, so conversions between imperial and metric units are exact by definition, not approximations.',
      'Each converter shows the formula, a reference table of common values and a link to the reverse conversion. Results are rounded for display; the copy button gives you the same rounded value you see on screen.',
    ],
    related: ['math', 'cooking', 'construction'],
    icon: 'arrows',
  },
  {
    id: 'math',
    name: 'Math',
    heading: 'Math calculators',
    summary: 'Percentages, discounts, ratios, averages and age.',
    metaDescription:
      'Everyday math calculators: percentages, percentage change, discounts, ratios, averages, median and age. Clear answers with the working shown.',
    intro: [
      'These calculators handle the arithmetic that comes up in everyday life: what 15% of a bill is, how much a sale actually saves, how to scale a ratio, or what the average of a list of numbers is.',
      'Each one shows the formula it uses and a worked example, so you can follow the steps and check the result yourself.',
    ],
    related: ['finance', 'converters', 'time'],
    icon: 'sigma',
  },
  {
    id: 'automotive',
    name: 'Automotive',
    heading: 'Automotive calculators',
    summary: 'Fuel cost, fuel economy and road trip planning.',
    metaDescription:
      'Automotive calculators for fuel cost, MPG, litres per 100 km and road trip fuel. Works with US and UK gallons, miles and kilometres.',
    intro: [
      'Fuel economy is quoted in different ways around the world: miles per US gallon in the United States, miles per imperial gallon in the UK, and litres per 100 kilometres in most other countries. These calculators accept any of them and convert between them exactly.',
      'Real-world consumption varies with speed, load, traffic, weather and tyre pressure, so treat the results as estimates and use your own measured fuel economy when you have it.',
    ],
    related: ['travel', 'finance', 'converters'],
    icon: 'car',
  },
  {
    id: 'animals',
    name: 'Animals',
    heading: 'Animal and livestock calculators',
    summary: 'Horse fencing, pasture size and daily feed estimates.',
    metaDescription:
      'Horse calculators for pasture acreage, fencing materials and daily hay requirements. Planning estimates with the assumptions explained.',
    intro: [
      'Planning for horses involves land, fencing and feed. These calculators give starting estimates for each, based on commonly published guidelines from equine extension services and nutrition references.',
      'Every horse and property is different. Climate, soil, forage quality, the size and workload of each horse and how pasture is managed all change the right answer. Use these numbers for planning and budgeting, and talk to your veterinarian, an equine nutritionist or your local extension office about your specific situation.',
    ],
    related: ['garden', 'construction', 'converters'],
    icon: 'horseshoe',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    heading: 'Cooking calculators',
    summary: 'Scale recipes and convert oven temperatures.',
    metaDescription:
      'Cooking calculators to scale recipes up or down and convert oven temperatures between Fahrenheit and Celsius.',
    intro: [
      'Recipes are written for a fixed number of servings and often in units from another country. These tools scale ingredient quantities and convert oven temperatures so you can cook from any recipe with confidence.',
      'Scaling is exact arithmetic, but cooking is not always linear: baking times, pan sizes and seasoning may need adjusting when you make a much larger or smaller batch.',
    ],
    related: ['converters', 'math', 'time'],
    icon: 'pot',
  },
  {
    id: 'finance',
    name: 'Finance',
    heading: 'Personal finance calculators',
    summary: 'Mortgage payments, tips and everyday money math.',
    metaDescription:
      'Personal finance calculators for mortgage payments, interest, tips and bill splitting. Standard formulas with clear breakdowns.',
    intro: [
      'These calculators use standard financial formulas to show what a loan will cost each month and over its lifetime, or how to split a bill fairly.',
      'They provide estimates for planning only and are not financial advice. Lenders include fees, insurance requirements and rate details that a general calculator cannot know, so always compare official loan estimates before you commit.',
    ],
    related: ['business', 'math', 'automotive'],
    icon: 'coin',
  },
  {
    id: 'travel',
    name: 'Travel',
    heading: 'Travel calculators',
    summary: 'Driving time, fuel and trip costs.',
    metaDescription:
      'Travel calculators for driving time, road trip fuel and cost per passenger. Plan your journey in miles or kilometres.',
    intro: [
      'Planning a trip comes down to two questions: how long will it take, and what will it cost? These calculators estimate driving time from distance and average speed, and fuel cost from distance and fuel economy.',
      'Average speed over a whole trip is usually well below the speed limit once traffic, towns and stops are included, so use a realistic figure.',
    ],
    related: ['automotive', 'time', 'finance'],
    icon: 'map',
  },
  {
    id: 'time',
    name: 'Time & Dates',
    heading: 'Time and date calculators',
    summary: 'Days between dates, date differences and age in days.',
    metaDescription:
      'Date calculators to count days between dates, find the difference in years, months and days, count weekdays and work out your age in days.',
    intro: [
      'Counting days by hand is error-prone because months have different lengths and leap years add an extra day. These calculators use the Gregorian calendar and count whole calendar days, so the results match a wall calendar.',
      'All calculations happen in your browser using calendar dates only, without time zones or daylight saving changes affecting the count.',
    ],
    related: ['math', 'business', 'travel'],
    icon: 'calendar',
  },
  {
    id: 'business',
    name: 'Business',
    heading: 'Business calculators',
    summary: 'Profit margin, markup and pricing.',
    metaDescription:
      'Business calculators for profit margin, markup and pricing. Find the selling price for a target margin and see the difference between margin and markup.',
    intro: [
      'Margin and markup are easy to confuse, and mixing them up leads to underpricing. These calculators show both figures side by side so you can price products and services with confidence.',
    ],
    related: ['finance', 'math', 'time'],
    icon: 'briefcase',
  },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category | undefined {
  return byId.get(id as CategoryId);
}

export function isCategoryId(id: string): id is CategoryId {
  return byId.has(id as CategoryId);
}
