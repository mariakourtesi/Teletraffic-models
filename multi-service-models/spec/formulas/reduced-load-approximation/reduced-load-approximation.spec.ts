import { callBlockingProbabilityinRLA } from '../../../src/formulas/reduced-load-approximation/reduced-load-approximation';
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
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 }
          ]
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }]
        }
      ],
      expected: {
        B1: 0.11479,
        B2: 0.26778
      }
    },
    {
      description: '2 links and 2 service classes with different capacities',
      links: [
        { link: 1, capacity: 2 },
        { link: 2, capacity: 3 }
      ],
      serviceClasses: [
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
          route: [{ link: 2, bu: 2 }]
        }
      ],
      expected: {
        B1: 0.34027,
        B2: 0.55634
      }
    },
    {
      description: '3 links and 2 service classes',
      links: [
        { link: 1, capacity: 3 },
        { link: 2, capacity: 4 },
        { link: 3, capacity: 5 }
      ],
      serviceClasses: [
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
          bu: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }]
        }
      ],
      expected: {
        B1: 0.21376,
        B2: 0.38066
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
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 1 }
          ]
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 }
          ]
        },
        {
          serviceClass: 3,
          incomingLoad_a: 1,
          route: [
            { link: 3, bu: 1 },
            { link: 4, bu: 1 }
          ]
        }
      ],
      expected: { B1: 0.46216, B2: 0.76463, B3: 0.06567 }
    },
    {
      description:
        '2 links and 2 service classes, service class 1 requires different bu from each link',
      links: [
        { link: 1, capacity: 4 },
        { link: 2, capacity: 5 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 2 }
          ]
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }]
        }
      ],
      expected: {
        B1: 0.40131,
        B2: 0.39952
      }
    },
    {
      description:
        '4 links and 3 service classes, service class 2 requires different bu from each link',
      links: [
        { link: 1, capacity: 10 },
        { link: 2, capacity: 12 },
        { link: 3, capacity: 11 },
        { link: 4, capacity: 10 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 3,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 2 }
          ]
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1.5,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 },
            { link: 3, bu: 2 },
            { link: 4, bu: 2 }
          ]
        },
        {
          serviceClass: 3,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 3 },
            { link: 2, bu: 3 },
            { link: 3, bu: 3 },
            { link: 4, bu: 2 }
          ]
        }
      ],
      expected: { B1: 0.31666, B2: 0.41514, B3: 0.53253 }
    },
    {
      description:
        '4 links and 1 service class, 1 service class requires same 1 bu from each link',
      links: [
        { link: 1, capacity: 5 },
        { link: 2, capacity: 5 },
        { link: 3, capacity: 5 },
        { link: 4, capacity: 5 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 2,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 1 }
          ]
        }
      ],
      expected: { B1: 0.10759 } // RLA gives different blocking probability compared to LAR and Kaufman-Roberts model
    },
    {
      description:
        '4 links and 1 service class, 1 service class requires same 1 bu from each link',
      links: [
        { link: 1, capacity: 5 },
        { link: 2, capacity: 5 },
        { link: 3, capacity: 5 },
        { link: 4, capacity: 5 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 2,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 },
            { link: 3, bu: 2 },
            { link: 4, bu: 2 }
          ]
        }
      ],
      expected: { B1: 0.59651 } // RLA gives different blocking probability compared to LAR and Kaufman-Roberts model
    }
  ])(`When $description`, ({ links, serviceClasses, expected }) => {
    it('should calculate the CBP for each service class that traverses the link network topology', () => {
      const result = callBlockingProbabilityinRLA(links, serviceClasses);
      expect(result).toEqual(expected);
    });
  });
});
