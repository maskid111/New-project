const activityTiers = [
  {
    min: 0,
    max: 0,
    name: "Sleeping Wing",
    remark: "Not active yet... but you're here."
  },
  {
    min: 1,
    max: 9,
    name: "New Feather",
    remark: "Just getting started... we see you."
  },
  {
    min: 10,
    max: 29,
    name: "Perch Watcher",
    remark: "Watching closely... moving carefully."
  },
  {
    min: 30,
    max: 79,
    name: "Wild Feather",
    remark: "Unpredictable... but active."
  },
  {
    min: 80,
    max: 149,
    name: "Signal Catcher",
    remark: "You know when to move."
  },
  {
    min: 150,
    max: 299,
    name: "Steady Wing",
    remark: "Consistent... no noise needed."
  },
  {
    min: 300,
    max: 599,
    name: "Sharp Beak",
    remark: "You move with intention."
  },
  {
    min: 600,
    max: 999,
    name: "Sky Hunter",
    remark: "You don't hesitate... you act."
  },
  {
    min: 1000,
    max: 1999,
    name: "Relentless Wing",
    remark: "Always in motion... no slowdowns."
  },
  {
    min: 2000,
    max: Number.POSITIVE_INFINITY,
    name: "High Flyer",
    remark: "Already ahead... still moving."
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
