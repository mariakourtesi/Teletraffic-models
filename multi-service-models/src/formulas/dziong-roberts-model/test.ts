import { normaliseProbabilityValues } from '../normalise-probabilities';
import { networkTopology, ServiceClassWithRoute } from '../types';
import { dziongRobertsFormula } from './dziong-roberts-formula';

export const normaliseProbabilitiesDziongRoberts = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};

  const unNormalisedProbabilities = dziongRobertsFormula(topology, serviceClasses);
  console.log('states count:', Object.keys(unNormalisedProbabilities).length);
  console.log('sample states (first 20):', Object.keys(unNormalisedProbabilities).slice(0, 20));
  const probValues = Object.values(unNormalisedProbabilities);
  const probKeys = Object.keys(unNormalisedProbabilities);
  const normalisedProbabilities = normaliseProbabilityValues(probValues);

  normalisedProbabilities.forEach((prob, index) => {
    result[probKeys[index]] = prob;
  });

  return result;
};

export const CBPDziongRoberts = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const normalisedProb = normaliseProbabilitiesDziongRoberts(topology, serviceClasses);
  const stateKeys = Object.keys(normalisedProb);

  // derive link order from topology so we can parse states consistently
  const linkOrder = topology.map((t) => t.link);

  // initialize blocking probabilities map with zeros for each link/class and per-class totals
  const blockingProbabilities: { [key: string]: number } = {};
  linkOrder.forEach((linkId) => {
    serviceClasses.forEach((sc) => {
      blockingProbabilities[`B_link${linkId}_class_${sc.serviceClass}`] = 0;
    });
  });
  serviceClasses.forEach((sc) => {
    blockingProbabilities[`B_class_${sc.serviceClass}_total`] = 0;
  });

  let parseWarningCount = 0;
  let blockedLogCount = 0;
  const MAX_WARN = 30;
  const MAX_BLOCK_LOGS = 50;

  stateKeys.forEach((stateKey) => {
    // robust parsing: support JSON-array keys or numeric separators
    let stateValues: number[] | null = null;
    const s = stateKey.trim();
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
          stateValues = parsed as number[];
        }
      } catch (e) {
        // fall through to regex
      }
    }
    if (!stateValues) {
      const nums = stateKey.match(/-?\d+/g)?.map(Number) ?? [];
      stateValues = nums.length ? nums : null;
    }

    // ACCEPT either per-link vectors (length === links) OR per-class vectors (length === classes).
    // Only skip when neither format matches.
    if (
      !stateValues ||
      (stateValues.length !== linkOrder.length && stateValues.length !== serviceClasses.length)
    ) {
      if (parseWarningCount < MAX_WARN) {
        console.warn('Skipping state (bad parse/length):', {
          stateKey,
          parsed: stateValues,
          expectedLengths: { links: linkOrder.length, classes: serviceClasses.length }
        });
      }
      parseWarningCount++;
      return;
    }

    // Map used BU per link using linkOrder to align positions
    const usedBU: Record<number, number> = {};
    // init zeros
    linkOrder.forEach((linkId) => (usedBU[linkId] = 0));

    // Interpret stateValues robustly:
    // - if length === number of links => entries are used BU per link
    // - if length === number of service classes => entries are calls per class (roll up)
    // Note: when links.length === classes.length the format is ambiguous -> disambiguate by
    // preferring the interpretation that yields per-link used BU <= link capacity.
    const L = linkOrder.length;
    const C = serviceClasses.length;

    const capFor = (linkId: number) => topology.find((t) => t.link === linkId)!.bu;

    const fillFromLinks = (): Record<number, number> => {
      const out: Record<number, number> = {};
      linkOrder.forEach((linkId, i) => (out[linkId] = stateValues![i] ?? 0));
      return out;
    };

    const fillFromClasses = (): Record<number, number> => {
      const out: Record<number, number> = {};
      linkOrder.forEach((id) => (out[id] = 0));
      serviceClasses.forEach((sc, classIdx) => {
        const calls = stateValues![classIdx] ?? 0;
        sc.route.forEach((hop) => {
          out[hop.link] = (out[hop.link] ?? 0) + calls * hop.bu;
        });
      });
      return out;
    };

    if (stateValues!.length === L && stateValues!.length === C) {
      // ambiguous: try both and pick the one that fits capacities (prefer per-link if both ok)
      const asLinks = fillFromLinks();
      const asClasses = fillFromClasses();
      const linksFit = linkOrder.every((id) => (asLinks[id] ?? 0) <= capFor(id));
      const classesFit = linkOrder.every((id) => (asClasses[id] ?? 0) <= capFor(id));

      if (linksFit && !classesFit) {
        Object.assign(usedBU, asLinks);
      } else if (!linksFit && classesFit) {
        Object.assign(usedBU, asClasses);
      } else {
        // both fit or both violate: prefer per-link (less transformation), but warn
        Object.assign(usedBU, asLinks);
        if (parseWarningCount < MAX_WARN) {
          console.warn(
            'Ambiguous state vector format (links==classes). Chose per-link interpretation.',
            {
              stateKey,
              asLinks,
              asClasses,
              caps: linkOrder.map((id) => capFor(id))
            }
          );
        }
      }
    } else if (stateValues!.length === L) {
      // unambiguous per-link vector
      linkOrder.forEach((linkId, i) => {
        usedBU[linkId] = stateValues![i] ?? 0;
      });
    } else if (stateValues!.length === C) {
      // per-class counts -> roll up to per-link used BU
      serviceClasses.forEach((sc, classIdx) => {
        const calls = stateValues![classIdx] ?? 0;
        sc.route.forEach((hop) => {
          usedBU[hop.link] = (usedBU[hop.link] ?? 0) + calls * hop.bu;
        });
      });
    } else {
      // fallback: take first L entries
      linkOrder.forEach((linkId, i) => {
        usedBU[linkId] = stateValues![i] ?? 0;
      });
      if (parseWarningCount < MAX_WARN) {
        console.warn('Unusual state vector length; attempted fallback mapping', {
          stateKey,
          parsedLength: stateValues!.length,
          links: L,
          classes: C
        });
      }
    }

    // DEBUG: log some parsed states for inspection
    if (blockedLogCount < 5) {
      console.log('parsed state sample:', {
        stateKey,
        stateValues,
        usedBU,
        prob: normalisedProb[stateKey]
      });
    }

    serviceClasses.forEach((sc) => {
      let classBlocked = false;

      sc.route.forEach((hop) => {
        const requiredBU = hop.bu;
        const linkCap = topology.find((t) => t.link === hop.link)?.bu ?? 0;
        const used = usedBU[hop.link] ?? 0;

        if (used + requiredBU > linkCap) {
          classBlocked = true;
          blockingProbabilities[`B_link${hop.link}_class_${sc.serviceClass}`] +=
            normalisedProb[stateKey];

          // DEBUG: log blocking contributions
          if (blockedLogCount < MAX_BLOCK_LOGS) {
            console.log('blocking event:', {
              stateKey,
              class: sc.serviceClass,
              hop,
              used,
              requiredBU,
              linkCap,
              prob: normalisedProb[stateKey]
            });
          }
          blockedLogCount++;
        }
      });

      if (classBlocked) {
        blockingProbabilities[`B_class_${sc.serviceClass}_total`] += normalisedProb[stateKey];
      }
    });
  });

  // quick per-link/class printout for verification
  console.log('per-link/class blocking summary:');
  linkOrder.forEach((linkId) => {
    serviceClasses.forEach((sc) => {
      console.log(
        `link ${linkId} class ${sc.serviceClass}:`,
        blockingProbabilities[`B_link${linkId}_class_${sc.serviceClass}`]
      );
    });
  });

  // after computing blockingProbabilities, print diagnostics
  const normalised = normaliseProbabilitiesDziongRoberts(topology, serviceClasses);
  const maxUsedPerLink: Record<number, number> = {};
  linkOrder.forEach((id) => (maxUsedPerLink[id] = 0));
  Object.keys(normalised).forEach((stateKey) => {
    // parse state as done above
    let vals: number[] | null = null;
    const s = stateKey.trim();
    if (s.startsWith('[')) {
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) vals = p as number[];
      } catch {}
    }
    if (!vals) vals = stateKey.match(/-?\d+/g)?.map(Number) ?? null;
    if (!vals) return;
    const used: Record<number, number> = {};
    linkOrder.forEach((id) => (used[id] = 0));
    if (vals.length === linkOrder.length) {
      linkOrder.forEach((id, i) => (used[id] = vals![i] ?? 0));
    } else if (vals.length === serviceClasses.length) {
      serviceClasses.forEach((sc, ci) => {
        const calls = vals![ci] ?? 0;
        sc.route.forEach((hop) => (used[hop.link] = (used[hop.link] ?? 0) + calls * hop.bu));
      });
    }
    linkOrder.forEach((id) => {
      maxUsedPerLink[id] = Math.max(maxUsedPerLink[id], used[id] ?? 0);
    });
  });

  console.log('maxUsedPerLink:', maxUsedPerLink);
  console.log('blocking thresholds (used must be >= threshold):');
  linkOrder.forEach((linkId) => {
    const cap = topology.find((t) => t.link === linkId)!.bu;
    serviceClasses.forEach((sc) => {
      const hop = sc.route.find((h) => h.link === linkId);
      const req = hop ? hop.bu : Infinity;
      const threshold = isFinite(req) ? cap - req + 1 : Infinity; // for > semantics
      console.log(
        `link ${linkId} class ${sc.serviceClass}: cap=${cap} req=${req} thresholdUsed>=${threshold}`
      );
    });
  });

  return blockingProbabilities;
};

const topology: networkTopology[] = [
  { link: 1, bu: 4 },
  { link: 2, bu: 5 },
  { link: 3, bu: 6 },
  { link: 4, bu: 7 }
];

const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 0 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 4,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  }
];

console.log(CBPDziongRoberts(topology, serviceClasses));
// console.log('--- CBP per-link/class diagnostics for link 3 ---');
// const diag = (() => {
//   const normalisedProb = normaliseProbabilitiesDziongRoberts(topology, serviceClasses);
//   const stateKeys = Object.keys(normalisedProb);
//   const linkId = 3;
//   const linkCap = topology.find((t) => t.link === linkId)?.bu ?? 0;
//   // for simplicity assume worst-case required BU on this link across classes
//   const minRequiredBU = Math.min(
//     ...serviceClasses.map((sc) => {
//       const hop = sc.route.find((h) => h.link === linkId);
//       return hop ? hop.bu : Infinity;
//     })
//   );
//   const results = {
//     maxUsed: 0,
//     blockingProbMass: 0,
//     blockingCount: 0,
//     sampleBlockingStates: [] as Array<{
//       stateKey: string;
//       used: number;
//       prob: number;
//       originFormat: number[] | null;
//     }>
//   };

//   stateKeys.forEach((stateKey) => {
//     // parse state array same as in CBP function
//     let stateValues: number[] | null = null;
//     const s = stateKey.trim();
//     if (s.startsWith('[')) {
//       try {
//         const parsed = JSON.parse(s);
//         if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number'))
//           stateValues = parsed as number[];
//       } catch {}
//     }
//     if (!stateValues) {
//       const nums = stateKey.match(/-?\d+/g)?.map(Number) ?? [];
//       stateValues = nums.length ? nums : null;
//     }
//     if (!stateValues) return;

//     // compute usedBU as in function
//     const linkOrder = topology.map((t) => t.link);
//     const usedBU: Record<number, number> = {};
//     linkOrder.forEach((id) => (usedBU[id] = 0));
//     if (stateValues.length === linkOrder.length) {
//       linkOrder.forEach((id, i) => (usedBU[id] = stateValues[i] ?? 0));
//     } else if (stateValues.length === serviceClasses.length) {
//       serviceClasses.forEach((sc, classIdx) => {
//         const calls = stateValues[classIdx] ?? 0;
//         sc.route.forEach((hop) => {
//           usedBU[hop.link] = (usedBU[hop.link] ?? 0) + calls * hop.bu;
//         });
//       });
//     } else {
//       // ignore unusual format
//       return;
//     }

//     const used = usedBU[linkId] ?? 0;
//     results.maxUsed = Math.max(results.maxUsed, used);
//     const prob = normalisedProb[stateKey] ?? 0;
//     // integer blocking threshold: used + required > cap  => used >= cap - required + 1
//     // check per-class; if any class would be blocked on this link, count prob
//     const anyClassBlockedOnLink = serviceClasses.some((sc) => {
//       const hop = sc.route.find((h) => h.link === linkId);
//       if (!hop) return false;
//       return used + hop.bu > linkCap;
//     });
//     if (anyClassBlockedOnLink) {
//       results.blockingProbMass += prob;
//       results.blockingCount++;
//       if (results.sampleBlockingStates.length < 10) {
//         results.sampleBlockingStates.push({ stateKey, used, prob, originFormat: stateValues });
//       }
//     }
//   });

//   return results;
// })();
// console.log('link 3 diagnostics:', diag);
