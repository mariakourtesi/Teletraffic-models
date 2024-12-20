import { normaliseProbabilityValues } from '../../src/formulas/normalise-probabilities';

describe('Normalise Probability Values', () => {
  describe.each([
    {
      description: 'no probabilities provided',
      probabilities: [],
      expectedNormalisedValue: []
    },
    {
      description: '2 different probabilities provided',
      probabilities: [1, 2],
      expectedNormalisedValue: [0.3333333, 0.6666667]
    }
  ])(`When $description`, ({ probabilities, expectedNormalisedValue }) => {
    let result: number[];
    let sumOfProbablilities: number;
    beforeEach(() => {
      result = normaliseProbabilityValues(probabilities);
    });

    it(`should return ${expectedNormalisedValue}`, () => {
      expect(result).toEqual(expectedNormalisedValue);
    });

    it('should equal 1 when all probabilities are summed', () => {
      if (result.length <= 0) {
        sumOfProbablilities = 1;
      } else {
        sumOfProbablilities = result.reduce((acc, curr) => acc + curr, 0);
      }

      expect(sumOfProbablilities).toEqual(1);
    });
  });
});
