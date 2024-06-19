import Product from "../models/productModel.js";

class AdvancedSearch{
    constructor(query)
    {
        this.query=query;
    }
    modifyQuery(){
        if("name" in this.query)
        {
            this.query.name={$regex: `^(?i)${this.query.name}(?-i)`} // i option enables case sensitive search
        }
        if("lte","gte" in this.query) // lte,gte leke aa raha hun price range se jo user choose karega, agar yeh user ne choose kara toh mein bhar lunga price wale key mein and lte, gte ko query se hata dunga 5000-10000 gte=5000,lte=10,000
        {
            this.query.price={$gte:(Number)(this.query.gte),$lte:(Number)(this.query.lte)};
            delete this.query.gte;
            delete this.query.lte;
        } 
        // pagination functionality, page toh hoga hi hoga, by default bhi 1 hoga page, query mein , baad mein query se hata denge page ko 
        this.productsPerPage=8;
        this.productsSkipped=(this.query.page-1)*this.productsPerPage; // page=3, db=12 products, page1,2=4 
        delete this.query.page;

        // apart from this, there can becategory filter from frontend which is predefined
    }
    async searchResults(){
        this.results=await Product.find(this.query).skip(this.productsSkipped).limit(this.productsPerPage);
        console.log(this.results);
    }
}

export default AdvancedSearch