import {dziongRobertsFormula} from '../../src/formulas/dziong-roberts-formula';

describe('Erland Multirate Loss Model - Dziong-Roberts Formula more than 1 links', () => {
  const linksCapacity = {
    link1: 4,
    link2: 5
  };

  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 2,
      tk: 0,
      route: ['link1', 'link2']
    },
    {
      serviceClass: 2,
      bu: 2,
      incomingLoad_a: 1,
      tk:0,
      route: ['link2']
    }
  ];
  const result = dziongRobertsFormula(linksCapacity, serviceClasses);
  expect(result).toEqual({
    'q(0,0)': 1.0000000,
    'q(0,2)': 1.0000000,
    'q(0,4)': 0.5000000,
    'q(1,1)': 1.0000000,
    'q(1,3)': 1.0000000,
    'q(1,5)': 0.5000000,
    'q(2,2)': 0.5000000,
    'q(2,4)': 0.5000000,
    'q(3,3)': 0.1666667,
    'q(3,5)': 0.1666667,
    'q(4,4)': 0.0416667,
  })
});
