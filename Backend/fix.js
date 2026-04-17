const fs = require('fs');
const lines = fs.readFileSync('controller/projectController.js','utf8').split('\n');

const fixed = [
  ...lines.slice(0, 670),
  '    console.error("Admin stats error:", error);',
  '    res.status(500).json({ success: false, message: error.message });',
  '  }',
  '};',
  '',
  ...lines.slice(870)
];

fs.writeFileSync('controller/projectController.js', fixed.join('\n'));

//console.log("File fixed!");
