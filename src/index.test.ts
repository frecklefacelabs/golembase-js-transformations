import { transformPOJOToKeyValuePairs, transformAnnotationsToPOJO } from './index';

describe('Annotation Transformers', () => {

  it('should correctly transform a POJO to annotations and back to the original POJO - true/false go to strings', () => {
    // 1. Define the original object
    const originalObject = {
      name: "Test Item",
      value: 99,
      id: "xyz-123",
      isValid: true
    };

    // 2. Perform the round-trip transformation
    const annotations = transformPOJOToKeyValuePairs(originalObject);
    const reconstructedObject = transformAnnotationsToPOJO(annotations, false);
    
    // 3. Define what you expect the object to look like after the round-trip
    // Your current functions only handle strings and numbers.
    const expectedObject = {
        name: "Test Item",
        value: 99,
        id: "xyz-123",
		isValid: "true" // Notice this one remains a string.
    };

    // 4. Use .toEqual() to compare the result with the expected object
    expect(reconstructedObject).toEqual(expectedObject);
  });

  it('should correctly transform a POJO to annotations and back to the original POJO', () => {
    // 1. Define the original object
    const originalObject = {
      name: "Test Item",
      value: 99,
      id: "xyz-123",
      isValid: true
    };

    // 2. Perform the round-trip transformation
    const annotations = transformPOJOToKeyValuePairs(originalObject);
    const reconstructedObject = transformAnnotationsToPOJO(annotations, true); // True means convert "true" and "false" to true and false respectively.
    
    // 3. Define what you expect the object to look like after the round-trip
    // Your current functions only handle strings and numbers.
    const expectedObject = {
        name: "Test Item",
        value: 99,
        id: "xyz-123",
		isValid: true // Now it's back to bool.
    };

    // 4. Use .toEqual() to compare the result with the expected object
    expect(reconstructedObject).toEqual(expectedObject);
  });


});