import type { Person, PlantCode, Role } from "../types";

// Fictional people with the kinds of job titles Lumax advertises (plant head, PPC
// manager, senior engineer for moulding). No one here is a real Lumax employee, and
// no event in the demo is attributed to a named Lumax executive.
const p = (name: string, title: string, role: Role, extension: string, plants?: PlantCode[]): Person => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  title,
  role,
  extension,
  initials: name
    .split(" ")
    .map((w) => w[0])
    .join(""),
  plants,
});

export const people: Person[] = [
  p("Vikram Sethi", "Chief Operating Officer", "executive", "1001"),
  p("Naveen Bansal", "VP Operations, North and Sanand", "executive", "1002"),
  p("Gayatri Iyengar", "VP Operations, West and South", "executive", "1003"),

  p("Rakesh Yadav", "Plant head, Dharuhera", "plant-manager", "2101", ["DHR"]),
  p("Sunil Dahiya", "Plant head, Bawal lighting", "plant-manager", "2201", ["BWL"]),
  p("Anjali Sharma", "Plant head, Bawal Electronics", "plant-manager", "2301", ["BWE"]),
  p("Manish Rawat", "Plant head, Pantnagar", "plant-manager", "2401", ["PNT"]),
  p("Deepak Negi", "Plant head, Haridwar", "plant-manager", "2501", ["HDW"]),
  p("Sachin Kulkarni", "Plant head, Chakan II", "plant-manager", "2601", ["CK2"]),
  p("Amol Pawar", "Plant head, Chakan III", "plant-manager", "2701", ["CK3"]),
  p("Nitin Jadhav", "Plant head, Chinchwad", "plant-manager", "2801", ["CCW"]),
  p("Hardik Patel", "Plant head, Sanand", "plant-manager", "2901", ["SND"]),
  p("Bhavesh Shah", "Plant head, Sanand II", "plant-manager", "3001", ["SN2"]),
  p("Ravi Gowda", "Plant head, Bengaluru", "plant-manager", "3101", ["BLR"]),

  // Programme leads: each owns one OEM's schedules across the plants that build them.
  p("Kunal Desai", "Programme lead, Maruti Suzuki Gujarat", "lead-engineer", "4101"),
  p("Neeraj Chauhan", "Programme lead, Maruti Suzuki North", "lead-engineer", "4102"),
  p("Shruti Apte", "Programme lead, Mahindra", "lead-engineer", "4103"),
  p("Rohan Bhosale", "Programme lead, Skoda-VW and Tata Motors", "lead-engineer", "4104"),
  p("Prakash Reddy", "Programme lead, two-wheelers", "lead-engineer", "4105"),
  p("Pooja Arora", "Manager, PPC, Bawal Electronics", "lead-engineer", "4106"),

  // Machine and line owners
  p("Vijay Saini", "Senior engineer, moulding, DHR", "lead-engineer", "5101"),
  p("Kavita Rao", "Process engineer, metallizing and hard coat, DHR", "lead-engineer", "5102"),
  p("Sandeep Kadian", "Quality engineer, assembly and test, DHR", "lead-engineer", "5103"),
  p("Mohit Yadav", "Senior engineer, moulding, BWL", "lead-engineer", "5201"),
  p("Priyanka Sharma", "Process engineer, surface treatment, BWL", "lead-engineer", "5202"),
  p("Ajay Rathi", "Quality engineer, assembly and test, BWL", "lead-engineer", "5203"),
  p("Harish Kumar", "SMT process engineer, BWE", "lead-engineer", "5301"),
  p("Sneha Verma", "Test engineer, ICT and FCT, BWE", "lead-engineer", "5302"),
  p("Rajendra Bisht", "Production engineer, PNT", "lead-engineer", "5401"),
  p("Pankaj Rana", "Production engineer, HDW", "lead-engineer", "5501"),
  p("Swapnil More", "Production engineer, CK2", "lead-engineer", "5601"),
  p("Tushar Gaikwad", "Senior engineer, moulding, CK3", "lead-engineer", "5701"),
  p("Pallavi Shinde", "Process engineer, surface treatment, CK3", "lead-engineer", "5702"),
  p("Omkar Patil", "Quality engineer, assembly and test, CK3", "lead-engineer", "5703"),
  p("Ganesh Kale", "Production engineer, CCW", "lead-engineer", "5801"),
  p("Nirav Joshi", "Production engineer, SND", "lead-engineer", "5901"),
  p("Jignesh Mehta", "Senior engineer, moulding, SN2", "lead-engineer", "6001"),
  p("Rina Trivedi", "Process engineer, surface treatment, SN2", "lead-engineer", "6002"),
  p("Chirag Solanki", "Quality engineer, ADB lines, SN2", "lead-engineer", "6003"),
  p("Santosh Hegde", "Senior engineer, moulding, BLR", "lead-engineer", "6101"),
  p("Lakshmi Narayan", "Process engineer, surface treatment, BLR", "lead-engineer", "6102"),
  p("Arun Shetty", "Quality engineer, 2W lines, BLR", "lead-engineer", "6103"),
];

export const personById = Object.fromEntries(people.map((x) => [x.id, x])) as Record<string, Person>;
