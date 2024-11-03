
import {blockingProbabilityinRLA} from '../../src/formulas/reduced-load-approximation';
describe('Reduced Load Approximation', () => {
  // Network topology:
// o------------link1=4bu-----------o---------link2=5bu----------o
// o------------link1=4bu/Class-1-----------o---------link2=5bu/ Class-1 and Class-2----------o
// b1 = 1, b2 = 2, a1 = a2 = 1

  const links = [
    {link: 1, capacity: 4},
    {link: 2, capacity: 5}
  ]

  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 1,
      route: [1, 2]
    },
    {
      serviceClass: 2,
      bu: 2,
     incomingLoad_a: 1,
      route: [2]
    }
  ];

  it('should calculate the CBP for each service class that traverses the link network topology', () => {
    const result = blockingProbabilityinRLA(links, serviceClasses);
    expect(result).toEqual({
      'B1': 0.11479,
      'B2':  0.26778
  });
});

});
