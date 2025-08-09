import { dziongRobertsFormula } from '../../../src/formulas/dziong-roberts-model/dziong-roberts-formula';
import { ServiceClassWithRoute } from '../../../src/formulas/types';

describe('Erland Multirate Loss Model - Dziong-Roberts Formula more than 1 links', () => {
  const linksCapacity = [
    { link: 1, bu: 4 },
    { link: 2, bu: 5 }
  ];

  const serviceClasses: ServiceClassWithRoute[] = [
    {
      serviceClass: 1,
      incomingLoad_a: 1,
      route: [
        { link: 1, bu: 1 },
        { link: 2, bu: 1 }
      ]
    },
    {
      serviceClass: 2,
      incomingLoad_a: 1,
      route: [
        { link: 1, bu: 0 },
        { link: 2, bu: 2 }
      ]
    }
  ];

  it('should return the correct results', () => {
    const result = dziongRobertsFormula(linksCapacity, serviceClasses);
    expect(result).toEqual({
      'q(0,0)': 1.0,
      'q(0,2)': 1.0,
      'q(0,4)': 0.5,
      'q(1,1)': 1.0,
      'q(1,3)': 1.0,
      'q(1,5)': 0.5,
      'q(2,2)': 0.5,
      'q(2,4)': 0.5,
      'q(3,3)': 0.1666667,
      'q(3,5)': 0.1666667,
      'q(4,4)': 0.0416667
    });
  });
});
