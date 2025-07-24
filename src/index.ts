import { Annotation } from "golem-base-sdk";

export interface Annotations {
	stringAnnotations: Annotation<string>[],
	numericAnnotations: Annotation<number>[]
}

/**
 * Transforms a plain JavaScript object (POJO) into an Annotations object,
 * separating properties into string and numeric types.
 * @param myobj The plain JavaScript object to transform.
 * @returns An Annotations object.
 */
export const transformPOJOToKeyValuePairs = (myobj: Omit<any, 'entityKey'>): Annotations => {
	const stringAnnotations: Annotation<string>[] = [];
	const numericAnnotations: Annotation<number>[] = [];
	for (const [key, value] of Object.entries(myobj)) {
		// Check if the value is a number.
		if (typeof value === 'number' && !isNaN(value)) {
			numericAnnotations.push(new Annotation(key, value));
		} else {
			// For all other types (string, boolean, object, null, etc.),
			// convert the value to a string and store it.
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
 * @returns A plain JavaScript object.
 */
export const transformAnnotationsToPOJO = (annotations: Annotations, convertBools = true): { [key: string]: string | number | Boolean } => {
	const pojo: { [key: string]: string | number | Boolean } = {};

	// Process all string annotations
	for (const annotation of annotations.stringAnnotations) {
		if (convertBools && (annotation.value == 'true' || annotation.value == 'false')) {
			pojo[annotation.key] = Boolean(annotation.value);
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