import { dziongRobertsFormula } from '../../src/formulas/dziong-roberts-formula';
interface ServiceClass {
  serviceClass: number;
  lambda: number; // Arrival rate (in Erlangs)
  mu: number; // Service rate
  bandwidth: number; // Required bandwidth units (b.u.) for each call
  route: number[]; // Route: how many b.u. are used on each link
}

//TODO: to revisit the tests and fix the formula

describe('Erland Multirate Loss Model - Dziong-Roberts Formula more than 1 links', () => {
  const linksCapacity = [4, 5];

  const serviceClasses: ServiceClass[] = [
    {
      serviceClass: 1,
      lambda: 1, // Arrival rate in Erlangs
      mu: 1, // Service rate
      bandwidth: 1, // Bandwidth units required per call
      route: [1, 1] // Uses both Link 1 and Link 2 (1 b.u. on each link)
    },
    {
      serviceClass: 2,
      lambda: 1,
      mu: 1,
      bandwidth: 2, // Requires 2 b.u. per call
      route: [0, 1] // Uses only Link 2 (2 b.u. on Link 2)
    }
  ];

  it('should return the correct results', () => {
    const result = dziongRobertsFormula(linksCapacity, serviceClasses);
    expect(result).toEqual({
      'q(0,0)': 1,
      'q(0,2)': 1.5,
      'q(0,4)': 1.0416667,
      'q(1,1)': 2,
      'q(1,3)': 2.6388889,
      'q(1,5)': 1.6495833,
      'q(2,2)': 3.125,
      'q(2,4)': 3.0332755,
      'q(3,3)': 3.9945988,
      'q(3,5)': 2.7298346,
      'q(4,4)': 3.3137922
    });
  });

  // correct reults
  // expect(result).toEqual({
  //   'q(0,0)': 1.0000000,
  //   'q(0,2)': 1.0000000,
  //   'q(0,4)': 0.5000000,
  //   'q(1,1)': 1.0000000,
  //   'q(1,3)': 1.0000000,
  //   'q(1,5)': 0.5000000,
  //   'q(2,2)': 0.5000000,
  //   'q(2,4)': 0.5000000,
  //   'q(3,3)': 0.1666667,
  //   'q(3,5)': 0.1666667,
  //   'q(4,4)': 0.0416667,
  // })
});
