import { normaliseProbabilityValues, unnormalisedKaufmanRobertsFormula } from '../src/index';

describe('Kaufman Roberts Formulas', () => {
  describe.each([
    {
      description: 'no service classes provided',
      capacity: 4,
      serviceClasses: [],
      expectedUnormalisedValue: []
    },
    {
      description: '0 bu are occupied [base case] q(j) = 0, then q(0) = 1',
      capacity: 0,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1
        }
      ],
      expectedUnormalisedValue: [1]
    },
    {
      description: 'less than 0 bu are occupied meaning q(j) = -1, then q(-1) = 0',
      capacity: -1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1
        }
      ],
      expectedUnormalisedValue: []
    },
    {
      description: '2 different service classes provided',
      capacity: 4,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1
        }
      ],
      expectedUnormalisedValue: [1, 2, 3, 3.333, 3.167]
    }
  ])(`When $description`, ({ capacity, serviceClasses, expectedUnormalisedValue }) => {
    it(`should return ${expectedUnormalisedValue}`, () => {
      const result = unnormalisedKaufmanRobertsFormula(capacity, serviceClasses);
      expect(result).toEqual(expectedUnormalisedValue);
    });
  });
});

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
      expectedNormalisedValue: [0.333, 0.667]
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
