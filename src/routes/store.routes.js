const router = require('express').Router();
const staticJson = require('@utils/static-json.util');

const { Taglist } = require('@controllers/store.taglist.controller');

router.post('/productlisting/list', staticJson.serve('static/store/P_List.json'));
router.post('/item/listall', staticJson.serve('static/store/I_List.json'));
router.post('/store/list', staticJson.serve('static/store/S_List.json'));
router.post('/store/productlisting/list/tag', Taglist);

module.exports = router;
