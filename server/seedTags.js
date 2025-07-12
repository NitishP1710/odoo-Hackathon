const mongoose = require('mongoose');
const Tag = require('./models/Tag');
require('dotenv').config();

const tags = [
  // Web Development
  { name: 'react', description: 'React.js library for building user interfaces', category: 'Web Development' },
  { name: 'javascript', description: 'JavaScript programming language', category: 'Web Development' },
  { name: 'html', description: 'HyperText Markup Language', category: 'Web Development' },
  { name: 'css', description: 'Cascading Style Sheets', category: 'Web Development' },
  { name: 'nodejs', description: 'Node.js runtime environment', category: 'Web Development' },
  { name: 'express', description: 'Express.js web application framework', category: 'Web Development' },
  { name: 'mongodb', description: 'MongoDB NoSQL database', category: 'Web Development' },
  { name: 'rest-api', description: 'RESTful API development', category: 'Web Development' },
  { name: 'vuejs', description: 'Vue.js progressive framework', category: 'Web Development' },
  { name: 'angular', description: 'Angular framework by Google', category: 'Web Development' },
  { name: 'typescript', description: 'TypeScript programming language', category: 'Web Development' },
  { name: 'nextjs', description: 'Next.js React framework', category: 'Web Development' },
  { name: 'graphql', description: 'GraphQL query language', category: 'Web Development' },
  { name: 'docker', description: 'Docker containerization platform', category: 'Web Development' },
  { name: 'aws', description: 'Amazon Web Services', category: 'Web Development' },
  
  // Programming
  { name: 'python', description: 'Python programming language', category: 'Programming' },
  { name: 'java', description: 'Java programming language', category: 'Programming' },
  { name: 'cpp', description: 'C++ programming language', category: 'Programming' },
  { name: 'csharp', description: 'C# programming language', category: 'Programming' },
  { name: 'go', description: 'Go programming language', category: 'Programming' },
  { name: 'rust', description: 'Rust programming language', category: 'Programming' },
  { name: 'php', description: 'PHP programming language', category: 'Programming' },
  { name: 'ruby', description: 'Ruby programming language', category: 'Programming' },
  { name: 'swift', description: 'Swift programming language', category: 'Programming' },
  { name: 'kotlin', description: 'Kotlin programming language', category: 'Programming' },
  { name: 'scala', description: 'Scala programming language', category: 'Programming' },
  
  // Data Science & ML
  { name: 'machine-learning', description: 'Machine Learning algorithms and techniques', category: 'Data Science' },
  { name: 'deep-learning', description: 'Deep Learning and neural networks', category: 'Data Science' },
  { name: 'tensorflow', description: 'TensorFlow machine learning framework', category: 'Data Science' },
  { name: 'pytorch', description: 'PyTorch machine learning framework', category: 'Data Science' },
  { name: 'scikit-learn', description: 'Scikit-learn machine learning library', category: 'Data Science' },
  { name: 'pandas', description: 'Pandas data manipulation library', category: 'Data Science' },
  { name: 'numpy', description: 'NumPy numerical computing library', category: 'Data Science' },
  { name: 'matplotlib', description: 'Matplotlib plotting library', category: 'Data Science' },
  { name: 'seaborn', description: 'Seaborn statistical data visualization', category: 'Data Science' },
  { name: 'jupyter', description: 'Jupyter notebooks and environment', category: 'Data Science' },
  { name: 'data-analysis', description: 'Data analysis and visualization', category: 'Data Science' },
  { name: 'nlp', description: 'Natural Language Processing', category: 'Data Science' },
  { name: 'computer-vision', description: 'Computer Vision and image processing', category: 'Data Science' },
  
  // DevOps
  { name: 'devops', description: 'DevOps practices and tools', category: 'DevOps' },
  { name: 'kubernetes', description: 'Kubernetes container orchestration', category: 'DevOps' },
  { name: 'jenkins', description: 'Jenkins CI/CD automation', category: 'DevOps' },
  { name: 'git', description: 'Git version control system', category: 'DevOps' },
  { name: 'github', description: 'GitHub code hosting platform', category: 'DevOps' },
  { name: 'gitlab', description: 'GitLab DevOps platform', category: 'DevOps' },
  { name: 'terraform', description: 'Terraform infrastructure as code', category: 'DevOps' },
  { name: 'ansible', description: 'Ansible automation tool', category: 'DevOps' },
  { name: 'prometheus', description: 'Prometheus monitoring system', category: 'DevOps' },
  { name: 'grafana', description: 'Grafana monitoring and visualization', category: 'DevOps' },
  { name: 'nginx', description: 'Nginx web server', category: 'DevOps' },
  { name: 'apache', description: 'Apache web server', category: 'DevOps' },
  
  // Mobile Development
  { name: 'react-native', description: 'React Native mobile development', category: 'Mobile Development' },
  { name: 'flutter', description: 'Flutter mobile app framework', category: 'Mobile Development' },
  { name: 'ios', description: 'iOS development', category: 'Mobile Development' },
  { name: 'android', description: 'Android development', category: 'Mobile Development' },
  { name: 'xamarin', description: 'Xamarin cross-platform development', category: 'Mobile Development' },
  { name: 'ionic', description: 'Ionic mobile app framework', category: 'Mobile Development' },
  
  // Competitive Programming & DSA
  { name: 'dsa', description: 'Data Structures and Algorithms', category: 'Programming' },
  { name: 'competitive-programming', description: 'Competitive programming problems', category: 'Programming' },
  { name: 'binary-search', description: 'Binary search algorithms', category: 'Programming' },
  { name: 'graphs', description: 'Graph algorithms and data structures', category: 'Programming' },
  { name: 'dynamic-programming', description: 'Dynamic programming techniques', category: 'Programming' },
  { name: 'greedy', description: 'Greedy algorithms', category: 'Programming' },
  { name: 'sorting', description: 'Sorting algorithms', category: 'Programming' },
  { name: 'trees', description: 'Tree data structures and algorithms', category: 'Programming' },
  { name: 'strings', description: 'String algorithms and manipulation', category: 'Programming' },
  { name: 'math', description: 'Mathematical algorithms and concepts', category: 'Programming' },
  { name: 'bit-manipulation', description: 'Bit manipulation techniques', category: 'Programming' },
  { name: 'sliding-window', description: 'Sliding window technique', category: 'Programming' },
  { name: 'two-pointers', description: 'Two pointers technique', category: 'Programming' },
  { name: 'backtracking', description: 'Backtracking algorithms', category: 'Programming' },
  { name: 'recursion', description: 'Recursive algorithms and techniques', category: 'Programming' },
  
  // Other
  { name: 'database', description: 'Database design and management', category: 'Other' },
  { name: 'sql', description: 'SQL database queries', category: 'Other' },
  { name: 'postgresql', description: 'PostgreSQL database', category: 'Other' },
  { name: 'mysql', description: 'MySQL database', category: 'Other' },
  { name: 'redis', description: 'Redis in-memory database', category: 'Other' },
  { name: 'elasticsearch', description: 'Elasticsearch search engine', category: 'Other' },
  { name: 'blockchain', description: 'Blockchain technology', category: 'Other' },
  { name: 'cybersecurity', description: 'Cybersecurity and security', category: 'Other' },
  { name: 'testing', description: 'Software testing and QA', category: 'Other' },
  { name: 'agile', description: 'Agile development methodologies', category: 'Other' },
  { name: 'microservices', description: 'Microservices architecture', category: 'Other' },
  { name: 'api-design', description: 'API design and documentation', category: 'Other' },
  { name: 'performance', description: 'Performance optimization', category: 'Other' },
  { name: 'scalability', description: 'System scalability and architecture', category: 'Other' }
];

const seedTags = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing tags
    await Tag.deleteMany({});
    console.log('Cleared existing tags');

    // Insert new tags
    const createdTags = await Tag.insertMany(tags);
    console.log(`Created ${createdTags.length} tags`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedTags(); 