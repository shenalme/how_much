/**
 * Search vocabulary. Each group lists words that mean the same thing to a
 * person searching; any word in a group matches all the others.
 * Add groups here as you notice searches that miss.
 */
export const SYNONYM_GROUPS: string[][] = [
  ['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  ['lb', 'lbs', 'pound', 'pounds'],
  ['g', 'gram', 'grams'],
  ['oz', 'ounce', 'ounces'],
  ['ft', 'foot', 'feet'],
  ['m', 'meter', 'meters', 'metre', 'metres'],
  ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  ['in', 'inch', 'inches'],
  ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  ['mi', 'mile', 'miles'],
  ['ac', 'acre', 'acres', 'acreage'],
  ['ha', 'hectare', 'hectares'],
  ['f', 'fahrenheit'],
  ['c', 'celsius', 'centigrade'],
  ['temp', 'temperature'],
  ['sqft', 'square', 'area', 'footage'],
  ['yard', 'yards', 'yd', 'yds'],
  ['gas', 'fuel', 'petrol', 'diesel', 'gasoline'],
  ['mpg', 'mileage', 'economy', 'consumption'],
  ['car', 'vehicle', 'auto', 'automotive', 'driving', 'drive'],
  ['trip', 'journey', 'travel', 'roadtrip'],
  ['horse', 'horses', 'equine', 'pony', 'ponies'],
  ['hay', 'feed', 'forage'],
  ['pasture', 'paddock', 'grazing', 'field'],
  ['fence', 'fencing', 'posts', 'rails'],
  ['soil', 'topsoil', 'dirt', 'earth', 'fill'],
  ['mulch', 'bark', 'woodchips', 'chips'],
  ['compost', 'manure', 'humus'],
  ['grass', 'lawn', 'turf', 'seed'],
  ['sod', 'turf'],
  ['garden', 'yard', 'bed', 'beds', 'planter'],
  ['concrete', 'cement', 'slab', 'footing', 'footings'],
  ['gravel', 'stone', 'rock', 'aggregate', 'crushed'],
  ['deck', 'decking', 'boards', 'joists'],
  ['floor', 'flooring', 'laminate', 'vinyl', 'hardwood'],
  ['tile', 'tiles', 'tiling'],
  ['paint', 'painting', 'gallons', 'primer'],
  ['percent', 'percentage', 'pct'],
  ['discount', 'sale', 'off', 'savings'],
  ['average', 'mean', 'median', 'mode'],
  ['ratio', 'proportion'],
  ['age', 'old', 'birthday', 'born'],
  ['days', 'day', 'daycount'],
  ['date', 'dates', 'calendar'],
  ['between', 'difference', 'until', 'since'],
  ['weekdays', 'business', 'working'],
  ['mortgage', 'loan', 'repayment', 'repayments'],
  ['tip', 'gratuity'],
  ['margin', 'profit', 'markup'],
  ['recipe', 'ingredients', 'servings', 'scale'],
  ['oven', 'baking', 'cooking'],
  ['time', 'duration', 'hours'],
  ['convert', 'conversion', 'converter'],
];

const lookup = new Map<string, Set<string>>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    const set = lookup.get(word) ?? new Set<string>();
    group.forEach((w) => set.add(w));
    lookup.set(word, set);
  }
}

/** The word itself plus its synonyms. */
export function expandWord(word: string): string[] {
  return [...(lookup.get(word) ?? new Set([word]))];
}
