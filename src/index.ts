/**
 * Represents a single key-value annotation.
 */
export class Annotation<V> {
  readonly key: string;
  readonly value: V;

  constructor(key: string, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * An interface representing a collection of annotations, separated by type.
 */
export interface Annotations {
  stringAnnotations: Annotation<string>[];
  numericAnnotations: Annotation<number>[];
}

/**
 * Transforms a plain JavaScript object (POJO) into an Annotations object.
 * It separates properties into numeric types and converts all other types
 * into string annotations.
 * @param myobj The plain JavaScript object to transform.
 * @returns An Annotations object.
 */
export const transformPOJOToKeyValuePairs = (myobj: Omit<any, 'entityKey'>): Annotations => {
  const stringAnnotations: Annotation<string>[] = [];
  const numericAnnotations: Annotation<number>[] = [];

  for (const [key, value] of Object.entries(myobj)) {
    if (typeof value === 'number' && !isNaN(value)) {
      numericAnnotations.push(new Annotation(key, value));
    } else {
      stringAnnotations.push(new Annotation(key, String(value)));
    }
  }

  return {
    stringAnnotations,
    numericAnnotations
  };
};

/**
 * Transforms an Annotations object back into a single plain JavaScript object.
 * @param annotations An object containing arrays of string and numeric annotations.
 * @param convertBools A flag to determine if string 'true'/'false' should be converted to booleans.
 * @returns A plain JavaScript object.
 */
export const transformAnnotationsToPOJO = (annotations: Annotations, convertBools = true): { [key: string]: string | number | boolean } => {
    const pojo: { [key: string]: string | number | boolean } = {};

    // Process all string annotations
    for (const annotation of annotations.stringAnnotations) {
        // Correctly convert string 'true' and 'false' to booleans
        if (convertBools && (annotation.value === 'true' || annotation.value === 'false')) {
            pojo[annotation.key] = annotation.value === 'true';
        }
        else {
            pojo[annotation.key] = annotation.value;
        }
    }

    // Process all numeric annotations
    for (const annotation of annotations.numericAnnotations) {
        pojo[annotation.key] = annotation.value;
    }

    return pojo;
};

/**
 * Transforms a POJO with array values into an Annotations object.
 * Each array is converted into a comma-separated string, with optional sorting.
 * @param listObj The object with array values.
 * @param sort A flag to determine if the arrays should be sorted before joining.
 * @returns An Annotations object.
 */
export const transformListPOJOToAnnotations = (listObj: { [key: string]: any[] }, sort = true): Annotations => {
    const stringAnnotations: Annotation<string>[] = [];

    for (const [key, value] of Object.entries(listObj)) {
        if (Array.isArray(value)) {
            // Use a copy of the array to avoid modifying the original
            let arrayToProcess = [...value];
            if (sort) {
                arrayToProcess.sort();
            }
            stringAnnotations.push(new Annotation(key, arrayToProcess.join(',')));
        }
    }

    return {
        stringAnnotations,
        numericAnnotations: [] // This transform assumes all lists become string annotations
    };
};

/**
 * Transforms an Annotations object with comma-separated strings back into a POJO with arrays.
 * It dynamically detects if the array items are numeric or boolean.
 * @param annotations The Annotations object.
 * @param convertBools A flag to determine if string 'true'/'false' should be converted to booleans.
 * @param sort A flag to determine if the resulting arrays should be sorted.
 * @returns A POJO with array values.
 */
export const transformAnnotationsToListPOJO = (annotations: Annotations, convertBools = true, sort = true): { [key: string]: (string | number | boolean)[] } => {
    const pojo: { [key: string]: (string | number | boolean)[] } = {};

    for (const annotation of annotations.stringAnnotations) {
        const key = annotation.key;
        // First, create a definitive array of strings.
        const stringItems = annotation.value.split(',').map(item => item.trim());

        // Check if all items in the array are valid numbers.
        const areAllNumeric = stringItems.length > 0 && stringItems.every(item => !isNaN(parseFloat(item)) && isFinite(Number(item)));

        // Check if all items are 'true' or 'false'.
        const areAllBooleans = stringItems.length > 0 && stringItems.every(item => item === 'true' || item === 'false');

        if (areAllNumeric) {
            // If all are numeric, parse them.
            const numericValues = stringItems.map(item => parseFloat(item));
            if (sort) {
                numericValues.sort((a, b) => a - b);
            }
            pojo[key] = numericValues;
        } else if (convertBools && areAllBooleans) {
            // If all are boolean strings, parse them.
            const booleanValues = stringItems.map(item => item === 'true');
            if (sort) {
                booleanValues.sort((a, b) => Number(a) - Number(b)); // Sorts false before true
            }
            pojo[key] = booleanValues;
        } else {
            // Otherwise, treat as a string array.
            if (sort) {
                stringItems.sort();
            }
            pojo[key] = stringItems;
        }
    }

    return pojo;
};


// --- Example Usage for List Transformers ---

// 1. Start with a POJO with arrays
const originalListObject = {
    people: ['Fred Franklin', 'Julie Jackson', 'Susie Smith'],
    places: ['Grand Junction', 'New York'],
    favorites: [5, 10, 12, 25],
    bools: [true, false, false]
};

console.log("Original List POJO:", originalListObject);

// 2. Transform it to an Annotations object
const listAnnotations = transformListPOJOToAnnotations(originalListObject);
console.log("Transformed List Annotations:", JSON.stringify(listAnnotations, null, 2));

// 3. Transform it back to a POJO
const reconstructedListObject = transformAnnotationsToListPOJO(listAnnotations);
console.log("Reconstructed List POJO:", reconstructedListObject);


// --- Example Usage ---

// 1. Start with a POJO containing various data types
const originalObject = {
  name: "Example Item",
  age: 42,
  id: 12345,
  category: "examples",
  isActive: true,
  metadata: { version: 2 },
  endDate: null
};

console.log("Original POJO:", originalObject);

// 2. Transform it to an Annotations object
const annotationsObject = transformPOJOToKeyValuePairs(originalObject);
console.log("Transformed Annotations:", JSON.stringify(annotationsObject, null, 2));

// 3. Transform it back to a POJO
const reconstructedObject = transformAnnotationsToPOJO(annotationsObject);
console.log("Reconstructed POJO:", reconstructedObject);

let listObj = {
	people: [
		'Fred Franklin',
		'Julie Jackson',
		'Susie Smith'
	],
	places: [
		'Grand Juncion',
		'New York'
	],
	favorites: [
		5, 10, 12, 25
	],
	bools: [
		true, false, false
	]
};

let listAnnot: Annotations = 
{
	stringAnnotations: [
		{key: 'people', value: 'Fred Franklin,Julie Jackson, Susie Smith'},
		{key: 'places', value: 'Grand Junction,New York'},
		{key: 'favorites', value: '5,10,12,25'},
		{key: 'bools', value: 'true,false,false'}
	],
	numericAnnotations: []
}

