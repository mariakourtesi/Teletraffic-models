// Network topology:
// o------------link1=4bu-----------o---------link2=5bu----------o
// o------------link1=4bu/Class-1-----------o---------link2=5bu/ Class-1 and Class-2----------o
// b1 = 1, b2 = 2, a1 = a2 = 1

import { networkTopology, ServiceClassWithRoute } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult: { [key: string]: number }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  const finalResult: { [key: string]: number } = {};
  let initialResult = 1;

console.log('previousResult================', previousResult);

  links.forEach((link_in_network) => {
    let cbp = 0;
    let stateProbabilityValues;

   

    let newServiceClasses: ServiceClassWithRoute[] = [];
    const { capacity } = link_in_network; // link1

    console.log('newServiceClasses', newServiceClasses)

   

    serviceClasses.forEach((serviceClass) => {
      const { route } = serviceClass;
      let incomingLoad_a= serviceClass.incomingLoad_a; // link 2, class 2 , load 1
      let productForm = 1;

      if (route.includes(link_in_network.link)) {
        console.log('link_in_network, serviceClass', link_in_network.link, serviceClass.serviceClass);
        const linkMinusCurrentLink = route.filter((link) => link !== link_in_network.link);
        

        console.log('linkMinusCurrentLink', linkMinusCurrentLink);


        if (Object.keys(previousResult).length === 0) {
          result[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = initialResult;
        } else{
          result[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = previousResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`];
        }


        linkMinusCurrentLink.forEach((otherLinks) => {
          console.log('previous',previousResult[`V_link${otherLinks}_class_${serviceClass.serviceClass}`])
  
         console.log('otherLink',otherLinks);
         if (Object.keys(previousResult).length === 0) {
          result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`] = initialResult;
        } 
        else{
          result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`] = previousResult[`V_link${otherLinks}_class_${serviceClass.serviceClass}`]
          // previousResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`];
        }

        console.log('result should be 0', result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`]);
          productForm = (1 - result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`])
          console.log('productForm', productForm);

          //result[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = (1 - result[`V_link${link}_class_${serviceClass.serviceClass}`])

          // productForm *= productForm;

       
          incomingLoad_a = incomingLoad_a * productForm;
          console.log('incomingLoad', incomingLoad_a);
          
        });

       const  neWSC = {
          ...serviceClass,
          incomingLoad_a: incomingLoad_a 
        }
  
        newServiceClasses.push(neWSC);

        console.log('newServiceClasses___after', newServiceClasses);
  
      }

     
    });


    console.log('newServiceClasses', newServiceClasses);

    stateProbabilityValues = kaufmanRoberts(capacity, newServiceClasses);
    
    console.log('stateProbabilityValues', stateProbabilityValues);

    newServiceClasses.forEach((serviceClass) => {
      const bu = serviceClass.bu;
    // for (let j = capacity - bu + 1; j <= capacity; j++) {
      let j = capacity - bu + 1;
        const q_j = stateProbabilityValues[`q(${j})`] || 0;
        console.log('q_j',q_j)
        cbp += q_j;
        console.log('cbp', cbp);
  // }

      console.log(link_in_network.link, serviceClass.serviceClass, cbp);
      
      console.log('what====cbp',  finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`]= cbp);
      if( finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] === undefined){
        finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = cbp;
      }
      console.log('resultssssssss',  result);
      finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = cbp;
 
    });
    
  });

  console.log('previousResult======================', previousResult);

  return finalResult;
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

// const calculateCallBloackingProbabilitiesInRLA = (
//   links: networkTopology[],
//   serviceClasses: ServiceClassWithRoute[]
// ) => {
//   const predefinedValue = 0.0000001;
//   let cbp = {};
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, {});

//   console.log('1stIteration===================');
//   console.log('cbp', cbp);
//   console.log('2ndIteration===================');
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, cbp);
//   console.log('3rdIteration===================');
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, cbp);
//   console.log('4thIteration===================');
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, cbp);
//   console.log('5thIteration===================');
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, cbp);
//   console.log('6thIteration===================');
//   cbp = blockingProbabilityNetworkTopology(links, serviceClasses, cbp);
//   return cbp;
// };

const calculateCallBlockingProbabilitiesInRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
) => {
  const predefinedValue = 0.0000001;

  // Define cbp and previousCbp with string keys and number values
  let cbp: { [key: string]: number } = {};
  let previousCbp: { [key: string]: number } = {};
  let difference: number;

  // Initial calculation
  cbp = blockingProbabilityNetworkTopology(links, serviceClasses, {});

  do {
    previousCbp = { ...cbp };
    cbp = blockingProbabilityNetworkTopology(links, serviceClasses, previousCbp);

    // Calculate the maximum difference between current and previous values
    difference = Math.max(
      ...Object.keys(cbp).map(key => Math.abs(cbp[key] - previousCbp[key]))
    );

  } while (difference > predefinedValue);

  return cbp;
};

console.log(calculateCallBlockingProbabilitiesInRLA(links, serviceClasses));
