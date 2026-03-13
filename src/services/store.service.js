const staticJsonUtil = require('@utils/static-json.util');

class StoreService {
  async getProductById(productListingId) {
    const storeData = await staticJsonUtil.load('static/store/S_List.json');

    for (const store of storeData.data.store) {
      const product = store.productListingOnShelfWithTitle?.find(
        p => p._id === productListingId
      );
      if (product) {
        return product;
      }
    }

    return null;
  }

  async getStoreListings() {
    const storeData = await staticJsonUtil.load('static/store/S_List.json');
    return storeData.data.store;
  }

  async getAllProducts() {
    const storeData = await staticJsonUtil.load('static/store/S_List.json');
    const allProducts = [];

    for (const store of storeData.data.store) {
      if (store.productListingOnShelfWithTitle) {
        allProducts.push(...store.productListingOnShelfWithTitle);
      }
    }

    return allProducts;
  }
}

module.exports = new StoreService();
