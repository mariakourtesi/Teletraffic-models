import {
  kaufmanRoberts,
  normaliseProbabilityValues,
  unnormalisedKaufmanRobertsFormula
} from '../../src/commands/kaufman-roberts-formula';

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

describe('Kaufman Roberts normalised formula', () => {
  describe.each([
    {
      description: 'no service classes provided',
      capacity: 4,
      serviceClasses: [],
      expectedValue: {}
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
      expectedValue: {
        'q(0)': 0.08,
        'q(1)': 0.16,
        'q(2)': 0.24,
        'q(3)': 0.267,
        'q(4)': 0.253
      }
    },
    {
      description: '4 different service classes provided with system total capacity of 10bu',
      capacity: 10,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 4,
          incomingLoad_a: 1
        },
        {
          serviceClass: 2,
          bu: 3,
          incomingLoad_a: 2
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 3
        },
        {
          serviceClass: 4,
          bu: 1,
          incomingLoad_a: 4
        }
      ],
      expectedValue: {
        'q(0)': 0.001,
        'q(1)': 0.002,
        'q(2)': 0.006,
        'q(3)': 0.014,
        'q(4)': 0.028,
        'q(5)': 0.049,
        'q(6)': 0.08,
        'q(7)': 0.12,
        'q(8)': 0.171,
        'q(9)': 0.231,
        'q(10)': 0.298
      }
    },
    {
      description:
        '3 different service classes provided and the 3rd service class has no incoming traffic load',
      capacity: 3,
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
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 0
        }
      ],
      expectedValue: {
        'q(0)': 0.107,
        'q(1)': 0.214,
        'q(2)': 0.321,
        'q(3)': 0.357
      }
    },
    {
      description:
        '2 different service classes provided, the second one has a higher bu than the system capacity',
      capacity: 1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2
        },
        {
          serviceClass: 2,
          bu: 5,
          incomingLoad_a: 3
        }
      ],
      expectedValue: {
        'q(0)': 0.333,
        'q(1)': 0.667
      }
    },
    {
      description: '1 service class, that has a higher bu than the system capacity',
      capacity: 1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 5,
          incomingLoad_a: 3
        }
      ],
      expectedValue: {
        'q(0)': 1,
        'q(1)': 0
      }
    }
  ])(`When $description`, ({ capacity, serviceClasses, expectedValue }) => {
    it(`should return expected normalised probabilities`, () => {
      const result = kaufmanRoberts(capacity, serviceClasses);
      expect(result).toEqual(expectedValue);
    });
  });
});
