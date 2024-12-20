# Multirate Loss Models

## Description
This project implements various mathematical models related to network optimization and performance analysis, 
it also implements the proposed analytic model, which calculates blocking probabilities in a cloud system offering IaaS, as described in the paper  <a href="https://ieeexplore.ieee.org/document/9483923" target="_blank">A Multiparameter Analytical Model of the Physical Infrastructure of a Cloud-Based System<a>

These formulas are widely used in telecommunications and network engineering to address challenges such as traffic management, resource allocation, and network dimensioning.

Each directory /formulas/* contains its own README with more information about each mathematical model.

#### For the Kaufman-Roberts model
[`cd src/formulas/kaufman-roberts`](src/formulas/kaufman-roberts)

#### For the Dziong-Roberts model
[`cd src/formulas/dziong-roberts-model`](src/formulas/dziong-roberts-model)

#### For the Reduced Load Approximation formula or knapsack approximation
`cd src/formulas/reduced-load-approximation`

#### For the Limited Available Resources Model
[`cd src/formulas/limited-available-resources-model`](src/formulas/limited-available-resources-model)

#### For the IEEE proposed model
[`cd src/formulas/IEEE-proposed-model`](src/formulas/IEEE-proposed-model)


#### For utility functions
1. binomial-distribution,
2. factorial,
3. k-permuations,
4. multinomial,
5. possible-arrangements
6. conditional transition probability

[`cd src/formulas/utils`](src/utils)

#### For the Erlang-B model 
`cd src/formulas/erlang`