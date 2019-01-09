let rp = require('request-promise');
let cheerio = require('cheerio');

class YeezyFeaturedItems {
  crawl() {
    let options = {
      uri: 'http://yeezysupply.com/collections/men-footwear',
      transform: function(body) {
        return cheerio.load(body);
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
      },
    };

    rp(options)
      .then($ => {
        let featuredElement = $('#js-featured-json')[0];

        // cannot find featured items, retry 10 seconds
        if (featuredElement === undefined) {
          console.log('Unable to locate featured items');
          return setTimeout(() => {
            this.crawl();
          }, 10000);
        }

        let featured = [];

        featuredElement.children.map(child => {
          JSON.parse(child.data).products.forEach(product => {
            featured.push(product.handle);
          });
        });

        // check if featured items are different than when initially starting
        if (this.featured) {
          console.log(`current featured items are: ${this.featured}`);
          if (this.featured.toString() !== featured.toString()) {
            console.log('Featured Items Changed!', featured.toString());
          } else {
            console.log('Featured Items Unchanged', featured.toString());
          }
        }

        this.featured = featured;

        setTimeout(() => {
          this.crawl();
        }, 5000);
      })
      .catch(err => console.log(err));
  }
}

let yfi = new YeezyFeaturedItems();
yfi.crawl();
