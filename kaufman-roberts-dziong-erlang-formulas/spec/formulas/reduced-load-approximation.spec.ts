
import {callBlockingProbabilityinRLA} from '../../src/formulas/reduced-load-approximation';
describe('Reduced Load Approximation', () => {

describe.each([
  {
    description: '2 links and 2 service classes',
    links: [
      { link: 1, capacity: 4 },
      { link: 2, capacity: 5 }
    ],
    serviceClasses: [
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
    ],
    expected: {
      'B1': 0.11479,
      'B2': 0.26778
    }
  },
  {
    description: '2 links and 2 service classes with different capacities',
    links: [
      { link: 1, capacity:2 },
      { link: 2, capacity: 3 }
    ],
    serviceClasses: [
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
    ],
    expected: {
      'B1': 0.34027,
      'B2':0.55634
    }
  },
  {
    description: '3 links and 2 service classes',
    links: [
      { link: 1, capacity:3 },
      { link: 2, capacity: 4 },
      { link: 3, capacity: 5 }
    ],
    serviceClasses: [
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
    ],
    expected: {
      'B1': 0.21376,
      'B2':0.38066
    }
  },
  {
    description: '4 links and 3 service classes',
    links: [
      { link: 1, capacity: 2 },
      { link: 2, capacity: 3 },
      { link: 3, capacity: 4 },
      { link: 4, capacity: 5 }
    ],
    serviceClasses: [
      {
        serviceClass: 1,
        bu: 1,
        incomingLoad_a: 1,
        route: [1, 2, 3, 4]
      },
      {
        serviceClass: 2,
        bu: 2,
       incomingLoad_a: 1,
        route: [1,2]
      },
      {
        serviceClass: 3,
        bu: 1,
        incomingLoad_a: 1,
        route: [3,4]
      }
    ],
    expected:{ 'B1': 0.46216, 'B2': 0.76463,'B3': 0.06567 }
  }
])(`%s`, ({ links, serviceClasses, expected }) => {


  it('should calculate the CBP for each service class that traverses the link network topology', () => {
    const result = callBlockingProbabilityinRLA(links, serviceClasses);
    expect(result).toEqual(expected);
});
});
});
