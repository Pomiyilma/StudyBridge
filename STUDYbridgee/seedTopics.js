const mongoose = require("mongoose");
const Topic = require("./src/models/Topic");

// Flattened Ethiopian curriculum topics
const topics = [
  {
    title: "Algebra Basics",
    description: "Introduction to algebraic concepts and operations.",
  },

  // Biology Grade 9
  {
    title: "Biology and Technology (Grade 9)",
    description: "Ethiopian biologists, biological research",
  },
  {
    title: "Cell Biology (Grade 9)",
    description: "Microscope, cell, cell environment, diffusion, osmosis",
  },
  {
    title: "Human Biology and Health (Grade 9)",
    description:
      "Food nutrition, digestive system, respiratory system, cellular respiration, circulatory system",
  },
  {
    title: "Micro-organisms and Disease (Grade 9)",
    description: "Micro-organisms, diseases, HIV AIDS",
  },
  {
    title: "Classification (Grade 9)",
    description: "Principles of classification, five kingdoms",
  },
  {
    title: "Environment (Grade 9)",
    description:
      "Ecosystems, food relationships, recycling in nature, adaptations, tree-growing",
  },

  // Chemistry Grade 9
  {
    title: "Structure of the Atom (Grade 9)",
    description:
      "Atomic theory, fundamental particles, isotopes, atomic models",
  },
  {
    title: "Periodic Classification (Grade 9)",
    description: "Modern periodic table, periodic properties",
  },
  {
    title: "Chemical Bonding (Grade 9)",
    description:
      "Ionic bonding, covalent bonding, metallic bonding, intermolecular forces",
  },
  {
    title: "Chemical Reactions & Stoichiometry (Grade 9)",
    description:
      "Chemical equations, energy changes, reaction types, stoichiometry, redox reactions, reaction rates",
  },
  {
    title: "States of Matter (Grade 9)",
    description: "Kinetic theory, gaseous state, liquid state, solid state",
  },

  // Physics Grade 9
  {
    title: "Vectors (Grade 9 Physics)",
    description: "Representation, addition, subtraction, applications",
  },
  {
    title: "Motion in Straight Line (Grade 9 Physics)",
    description:
      "Uniform motion, uniformly accelerated motion, equations of motion, relative velocity",
  },
  {
    title: "Forces & Newton's Laws (Grade 9 Physics)",
    description:
      "Forces in nature, Newton's second law, friction, Newton's third law, conservation of momentum, collisions, equilibrium",
  },
  {
    title: "Work, Energy & Power (Grade 9 Physics)",
    description:
      "Mechanical work, work-energy theorem, conservation of energy, mechanical power",
  },
  {
    title: "Simple Machines (Grade 9 Physics)",
    description: "Inclined plane, wedge, screw, levers",
  },
  {
    title: "Fluid Statics (Grade 9 Physics)",
    description: "Air pressure, fluid pressure",
  },
  {
    title: "Temperature & Heat (Grade 9 Physics)",
    description:
      "Temperature concepts, expansion, specific heat, changes of state",
  },
  {
    title: "Wave Motion & Sound (Grade 9 Physics)",
    description:
      "Wave propagation, mechanical waves, wave properties, sound waves",
  },

  // Mathematics Grade 9
  {
    title: "Algebra (Grade 9 Math)",
    description: "Equations, inequalities, expressions",
  },
  {
    title: "Geometry (Grade 9 Math)",
    description: "Shapes, angles, area, volume",
  },
  {
    title: "Trigonometry (Grade 9 Math)",
    description: "Basic trigonometry, sine, cosine, tangent",
  },
  {
    title: "Statistics (Grade 9 Math)",
    description: "Data collection, mean, median, mode, graphs",
  },
  {
    title: "Probability (Grade 10 Math)",
    description: "Likelihood of events happening",
  },

  // …continue flattening Grade 10–12 Biology, Chemistry, Physics, Math
  // Each subject + grade + unit becomes a topic object
];

mongoose
  .connect("mongodb://localhost:27017/studybridge")
  .then(async () => {
    await Topic.insertMany(topics);
    console.log("✅ Ethiopian curriculum topics seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error(err));
