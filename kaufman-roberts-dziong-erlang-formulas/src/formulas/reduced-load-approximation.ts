// Network topology:
// o------------link1=4bu-----------o---------link2=5bu----------o
// o------------link1=4bu/Class-1-----------o---------link2=5bu/ Class-1 and Class-2----------o
// b1 = 1, b2 = 2, a1 = a2 = 1

import { networkTopology, ServiceClassWithRoute } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';

//************* STEP 1 *************//

// Blocking of class 1 at link 1
// B11 = [C1; ax, for each x that belongs to the service class 1] = kaufmanRoberts formula (j = C1-b1+1)

// Blocking of class 1 at link 2
// B21 = [C2; ax, for each x that belongs to the service class 1] = kaufmanRoberts formula (j = C2-b1+1)

// Blocking of class 2 at link 2
// B22 = [C2; ax, for each x that belongs to the service class 2] = kaufmanRoberts formula (j = C2-b2+1)

//************* STEP 2 *************//
// Calculate the reduced traffic load ax in each link

// reduced traffic load  at link 1 class 1
// i  belongs to the service class 1 traffic flow minus the current link l
// x= 1, l = 1
// axΠ(1-Vix) = a1Π(1-Vi1) = a1*Π(1-V21)

// reduced traffic load at link 2 class 1
// i  belongs to the service class 1 traffic flow minus the current link l (which is link =2)
// x= 1, l = 2
// axΠ(1-Vix) = a1Π(1-Vi1) = a1*Π(1-V11)

// reduced traffic load at link 2 class 2
// i  belongs to the service class 2 traffic flow minus the current link l (which is link =2)
// x= 2, l = 2
// axΠ(1-Vix) = a2Π(1-Vi2) = a2 (since there is no other link for class 2)

//************* STEP 3 *************//
// Calculate the CBP for each service class in each link

// V11 = B11 = [C1, a1(1-V21)]

// V21 = B21 = [C2, a1(1-V11), a2]

// V22 = B22 =[C2, a1(1-V11), a2]

//************* STEP 4 *************//
// we start calculating the V11, V21, V22 values by repeated substitutions strating with V11=V21=V22=1 (assuming that CBP is 100%)
// we carry on the repetitions until the difference between the new and the old values is less than a certain threshold value (e.g. 0.0000001)

// const {incomingLoad_a, bu, route} = serviceClass;
// const {link} = route;

// if(link.length === 1){
//   return incomingLoad_a * (1 - V11);
// }

// if(link.length === 2){
//   return incomingLoad_a * (1 - V21);
// }

// return incomingLoad_a * (1 - V22);

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult?: { [key: string]: number }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};

  const predefinedValue = 0.0000001;
  let initialResult = 1;

  // o--------link1-------o----link2-----------o



  links.forEach((link_in_network) => {
    // o--------link1-------o
    let cbp = 0;
    let stateProbabilityValues;

    let newServiceClasses: ServiceClassWithRoute[] = [];
    const { capacity, link } = link_in_network; // link1

    serviceClasses.forEach((serviceClass) => {
  // service class 1, link 1
      const { route, incomingLoad_a } = serviceClass; 

      if (route.includes(link_in_network.link)) {
        const linkMinusCurrentLink = route.filter((link) => link !== link_in_network.link);
        let productForm = 1;

        linkMinusCurrentLink.forEach((link) => {
            result[`V_link${link}_class_${serviceClass.serviceClass}`] = 1;
            
           
          productForm *= (1 - result[`V_link${link}_class_${serviceClass.serviceClass}`]);
          result[`V_link${link}_class_${serviceClass.serviceClass}`] = (1 - result[`V_link${link}_class_${serviceClass.serviceClass}`])
          console.log('result_____inside=======>',result)
        });

        console.log('productForm_____1=======>',productForm)

        serviceClass.incomingLoad_a = incomingLoad_a *  productForm;

        newServiceClasses.push(serviceClass);
      }
    });

    console.log(`which link_____1======>:  ${link}`   , `newServiceClasses:   ${JSON.stringify(newServiceClasses)}`)
    //which link_____1======>:  1 newServiceClasses:   [{"serviceClass":1,"bu":1,"incomingLoad_a":0,"route":[1,2]}]

    stateProbabilityValues = kaufmanRoberts(capacity, newServiceClasses);

    console.log('what stateProbabilityValues_____2======>', stateProbabilityValues)
    // what stateProbabilityValues_____2======> { 'q(0)': 1, 'q(1)': 0, 'q(2)': 0, 'q(3)': 0, 'q(4)': 0 }

    console.log('result_____4===before=======>',result)

    newServiceClasses.forEach((serviceClass) => {
      console.log('which class______3=======> ', serviceClass)
      //which class______3=======>  { serviceClass: 1, bu: 1, incomingLoad_a: 0, route: [ 1, 2 ] }
      const bu = serviceClass.bu;
      for (let j = capacity - bu + 1; j <= capacity; j++) {
        const q_j = stateProbabilityValues[`q(${j})`] || 0;
        cbp += q_j;
      }

      console.log(`which link_____???======>:  ${link}`   , `newServiceClasses:   ${JSON.stringify(newServiceClasses)}`)

      result[`V_link${link}_class_${serviceClass.serviceClass}`] = cbp;
      console.log('result_____4=======>',result)
      // result_____4=======> { V_link2_class_1: 1, V_link1_class_1: 0 }
      // expected  V_link1_class_1: 0
    });

    console.log('result_____5==================================')
  });

  console.log('previousResult', previousResult)
  if (previousResult) {
   // previousResult { V_link2_class_1: 0, V_link1_class_1: 0, V_link2_class_2: 0.2 }
   console.log('currentResult', result)
    let difference = 0;
    for (const key in result) {
      if (Math.abs(result[key] - previousResult[key]) > predefinedValue) {
        console.log('is diff?', Math.abs(result[key] - previousResult[key]) )
        difference++;
        break;
      }
    }
    if (difference === 0) {
      return result;
    }
  }


  return blockingProbabilityNetworkTopology(links, serviceClasses, result);

};

const links = [
  { link: 1, capacity: 4 },
  { link: 2, capacity: 5 }
];

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

console.log(blockingProbabilityNetworkTopology(links, serviceClasses));
