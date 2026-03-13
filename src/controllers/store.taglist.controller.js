const staticJson = require('@utils/static-json.util');

const tagMappings = [
  {
    tags: ['character', 'survivor'],
    file: 'static/store/taglist/C_Survivor.json'
  },
  {
    tags: ['perksurvivor'],
    file: 'static/store/taglist/P_Survivor.json'
  },
  {
    tags: ['effect', 'hunter'],
    file: 'static/store/taglist/Effect_Hunter.json'
  },
  {
    tags: ['perkhunter'],
    file: 'static/store/taglist/P_Hunter.json'
  },
  {
    tags: ['character', 'hunter'],
    file: 'static/store/taglist/C_Hunter.json'
  }
];

function arraysMatch(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
}

exports.Taglist = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Tags array is required'
      });
    }

    const mapping = tagMappings.find(m => arraysMatch(m.tags, tags));

    if (!mapping) {
      return res.status(404).json({
        error: 'No matching data found',
        message: `No data file found for tags: ${tags.join(', ')}`
      });
    }

    const jsonData = await staticJson.load(mapping.file);

    res.json(jsonData);

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
