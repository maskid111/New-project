const activityTiers = [
  {
    min: 0,
    max: 0,
    name: "Silent Parrot",
    remark: "Just watching from the tree"
  },
  {
    min: 1,
    max: 50,
    name: "Curious Chick",
    remark: "Testing the waters"
  },
  {
    min: 51,
    max: 100,
    name: "Flapping Rookie",
    remark: "Getting active"
  },
  {
    min: 101,
    max: 500,
    name: "Sky Explorer",
    remark: "Flying across Monad"
  },
  {
    min: 501,
    max: 1000,
    name: "Chain Surfer",
    remark: "Riding transactions daily"
  },
  {
    min: 1001,
    max: 5000,
    name: "Parrot Pro",
    remark: "Deep in the ecosystem"
  },
  {
    min: 5001,
    max: 10000,
    name: "Squad Captain",
    remark: "Leading the flock"
  },
  {
    min: 10001,
    max: 25000,
    name: "Onchain General",
    remark: "Heavy chain activity"
  },
  {
    min: 25001,
    max: 50000,
    name: "Monad Legend",
    remark: "Elite status unlocked"
  },
  {
    min: 50001,
    max: Number.POSITIVE_INFINITY,
    name: "Parrot Overlord",
    remark: "You run the skies"
  }
];

export function getTierFromTransactions(totalTransactions) {
  const count = Math.max(0, Number(totalTransactions) || 0);
  const tier =
    activityTiers.find((item) => count >= item.min && count <= item.max) || activityTiers[0];

  return {
    tierName: tier.name,
    tierRemark: tier.remark
  };
}
