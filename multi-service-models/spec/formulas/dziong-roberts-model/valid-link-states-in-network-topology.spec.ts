import { networkTopology, ServiceClassWithRoute } from '../../../src/formulas/types';
import { calculateValidLinkStates } from '../../../src/formulas/dziong-roberts-model/valid-link-states-in-network-topology';

describe('Valid link states in network topology', () => {
  describe.each([
    {
      description: 'two service classes with two links',
      topology: [
        { link: 1, bu: 4 },
        { link: 2, bu: 5 }
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
      expectedStates: [
        [0, 0],
        [0, 2],
        [0, 4],
        [1, 1],
        [1, 3],
        [1, 5],
        [2, 2],
        [2, 4],
        [3, 3],
        [3, 5],
        [4, 4]
      ]
    },
    {
      description: 'three service classes with four links',
      topology: [
        { link: 1, bu: 16 },
        { link: 2, bu: 16 },
        { link: 3, bu: 16 },
        { link: 4, bu: 16 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 3,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 1 }
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
            { link: 4, bu: 3 }
          ]
        }
      ],
      expectedStates: [
        [0, 0, 0, 0],
        [3, 3, 3, 3],
        [6, 6, 6, 6],
        [9, 9, 9, 9],
        [12, 12, 12, 12],
        [15, 15, 15, 15],
        [2, 2, 2, 2],
        [5, 5, 5, 5],
        [8, 8, 8, 8],
        [11, 11, 11, 11],
        [14, 14, 14, 14],
        [4, 4, 4, 4],
        [7, 7, 7, 7],
        [10, 10, 10, 10],
        [13, 13, 13, 13],
        [16, 16, 16, 16],
        [1, 1, 1, 1]
      ]
    }
  ])(`When $description`, ({ topology, serviceClasses, expectedStates }) => {
    it('should return valid link states', () => {
      const validLinkStates = calculateValidLinkStates(topology, serviceClasses);

      expect(validLinkStates).toEqual(expectedStates);
    });
  });
});
