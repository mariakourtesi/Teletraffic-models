import { kaufmanRobertsFormula, ServiceClass } from '../src/index';

describe('Kaufman Roberts Formulas', () => {
  describe.each([
    {
      description: 'no service classes provided',
      capacity: 4,
      serviceClasses: [],
      expectedUnormalisedValue: undefined
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
      expectedUnormalisedValue: 1
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
      expectedUnormalisedValue: 0
    }
  ])(`When $description`, ({ capacity, serviceClasses, expectedUnormalisedValue }) => {
    it(`should return ${expectedUnormalisedValue}`, () => {
      const result = kaufmanRobertsFormula(capacity, serviceClasses);
      expect(result).toEqual(expectedUnormalisedValue);
    });
  });

  it.skip('should calculate the Kaufman Roberts formula', () => {
    const capacity = 4;
    const serviceClasses: ServiceClass[] = [
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
    ];

    const returnedUnormalisedValues = [1, 2, 3, 10 / 3, 19 / 6];

    const result = kaufmanRobertsFormula(capacity, serviceClasses);

    expect(result).toEqual(returnedUnormalisedValues);
  });
});
