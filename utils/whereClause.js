// base - Product.find()
// bigQ - search=coder&page=2&category=shortsleeves&brand=adidas&rating[gte]=4&price[lte]=999

class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        const searchword = this.bigQ.search ? {
            name: {
                $regex: searchword,
                $options: 'i'
            }
        } : {}

        this.base = this.base.find({ ...searchword });
        return this
    }

    filter() {
        const copyQ = { ...this.bigQ };

        delete copyQ["search"];
        delete copyQ["page"];
        delete copyQ["limit"];

        // convert copyQ into string
        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
    }


    pager(resultPerPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }

        const skipVal = (currentPage - 1) * resultPerPage;

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }
}

module.exports = WhereClause;