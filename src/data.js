export const seedInstitutions = [
  {
    id: 1, region: "North Rift", county: "Turkana", subCounty: "AROO", zone: "KAINUK",
    nemisCode: "XGWH", name: "AGAPE KAINUK", type: "PUBLIC",
    latitude: "1.780226466", longitude: "35.50888243",
    replacement: "", connectivityStatus: "Scheduled(UNICEF)", comments: ""
  },
  {
    id: 2, region: "North Rift", county: "Turkana", subCounty: "AROO", zone: "KAINUK",
    nemisCode: "SUA4", name: "JULUK", type: "PUBLIC",
    latitude: "2.031", longitude: "35.52776",
    replacement: "", connectivityStatus: "ProposedUsingISPs(Urban+Peri-Urban)", comments: ""
  },
  {
    id: 3, region: "North Rift", county: "Turkana", subCounty: "AROO", zone: "KATILU",
    nemisCode: "5U8E", name: "KALEMNGOROK", type: "PUBLIC",
    latitude: "2.137085", longitude: "35.49735",
    replacement: "", connectivityStatus: "EARTTDFP", comments: ""
  },
  {
    id: 4, region: "North Rift", county: "West Pokot", subCounty: "KIPKOMO", zone: "BATEI",
    nemisCode: "A47E", name: "CHEPKORIONG JUNIOR SECONDARY", type: "PUBLIC",
    latitude: "1.320778531", longitude: "35.37987272",
    replacement: "", connectivityStatus: "ProposedUsing_LEO(Rural)", comments: ""
  },
  {
    id: 5, region: "North Rift", county: "Trans Nzoia", subCounty: "KIMININI", zone: "Kiminini",
    nemisCode: "PBGU", name: "KIMININI JUNIOR SECONDARY", type: "PUBLIC",
    latitude: "0.888392772", longitude: "34.92747553",
    replacement: "", connectivityStatus: "Planned under DSH II", comments: ""
  },
  {
    id: 6, region: "North Rift", county: "Uasin Gishu", subCounty: "AINABKOI", zone: "KAPSOYA",
    nemisCode: "W2WW", name: "ELDORET SPECIAL SCHOOL FOR HEARING IMPAIRED", type: "PUBLIC",
    latitude: "0.515451", longitude: "35.300507",
    replacement: "", connectivityStatus: "Connected by Gok", comments: ""
  },
  {
    id: 7, region: "North Rift", county: "Elgeyo Marakwet", subCounty: "KEIYO NORTH", zone: "KAMARINY",
    nemisCode: "EJNJ", name: "ITEN JSS", type: "PUBLIC",
    latitude: "0.67027", longitude: "35.50588",
    replacement: "", connectivityStatus: "Connected by Gok", comments: ""
  },
  {
    id: 8, region: "North Rift", county: "Nandi", subCounty: "CHESUMEI", zone: "CHEMUNDU",
    nemisCode: "7CFC", name: "KAPSABET BOYS", type: "PUBLIC",
    latitude: "0.203047179", longitude: "35.11772947",
    replacement: "", connectivityStatus: "Scheduled(DSH)", comments: ""
  },
  {
    id: 9, region: "North Rift", county: "Baringo", subCounty: "BARINGO CENTRAL", zone: "KABARNET",
    nemisCode: "MV36", name: "AIC VISA OSHWAL JSS", type: "PUBLIC",
    latitude: "0.49244", longitude: "35.74253",
    replacement: "", connectivityStatus: "Planned under DSH II", comments: ""
  },
  {
    id: 10, region: "North Rift", county: "Elgeyo Marakwet", subCounty: "KEIYO NORTH", zone: "KAPTUM",
    nemisCode: "SMMX", name: "SALABA", type: "PRIVATE",
    latitude: "0.8126", longitude: "35.55066",
    replacement: "", connectivityStatus: "ProposedUsingISPs(Urban+Peri-Urban)", comments: ""
  }
];

export const usersSeed = [
  { id: 1, name: "System Administrator", email: "admin@connectivity.go.ke", role: "admin", active: true },
  { id: 2, name: "Regional Viewer", email: "user@connectivity.go.ke", role: "user", active: true }
];

export const loginAccounts = {
  "admin@connectivity.go.ke": { password: "Admin123!", role: "admin", name: "System Administrator" },
  "user@connectivity.go.ke": { password: "User123!", role: "user", name: "Regional Viewer" }
};
