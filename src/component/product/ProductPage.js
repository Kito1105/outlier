import React, { Component } from 'react';

import { Col, Row } from 'reactstrap';
import { Table } from 'reactstrap';

import { ReleaseImagesUnique } from '../ReleaseImages';
import { Histogram, BinnedScatter } from '../chart';

function urlToHttps(url) { return url.replace(/^http:\/\//, "https://") }

function siteUrl(productUrl, filteredReleases, tld) {
  if (filteredReleases.length < 1) return null;
  let search = null, replace = null;
  if (tld === ".cc") { search = /outlier\.nyc/; replace = "outlier.cc" }
  if (tld === ".nyc") { search = /outlier\.cc/; replace = "outlier.nyc" }

  return productUrl.replace(search, replace);
}

function outlierProductUrls(releases) {
  // The switch to .nyc happened 2016-07-07 was the first .nyc url
  const cutoffDate = new Date(2016, 7, 7);
  const productUrl = urlToHttps(releases[0]['InSitu']);
  const ccReleases = releases.filter(r => r.releaseDate < cutoffDate);
  const nycReleases = releases.filter(r => r.releaseDate >= cutoffDate);
  const outlierCcUrl = siteUrl(productUrl, ccReleases, '.cc');
  const outlierNycUrl = siteUrl(productUrl, nycReleases, '.nyc');
  return {outlierCcUrl, outlierNycUrl}
}

class ProductPageHeader extends Component {
  render() {
    const productName = this.props.productName;
    const outlierCcUrl = this.props.outlierCcUrl;
    const outlierNycUrl = this.props.outlierNycUrl;
    const productUrlString = encodeURI(productName);
    const googleUrl = `https://google.com/search?q=${productUrlString}`;
    const redditUrl = `https://www.reddit.com/r/Outlier/search?q=${productUrlString}`;
    const archiveUrls = [];
    if (outlierCcUrl != null) {
      archiveUrls.push(<a key="outlierccurl" href={`https://web.archive.org/web/*/${outlierCcUrl}`}>Archive.org [outlier.cc]</a>);
      archiveUrls.push((<span key="outlierccurl_space">&nbsp;</span>))
    }
    if (outlierNycUrl != null)
      archiveUrls.push(<a key="outliernycurl" href={`https://web.archive.org/web/*/${outlierNycUrl}`}>Archive.org [outlier.nyc]</a>);
    const linkUrl = (outlierNycUrl != null) ? outlierNycUrl : outlierCcUrl;
    return [
      <h3 key="heading"><a href={linkUrl}>{productName} [outlier.nyc]</a></h3>,
      <p key="refs">
        <a href={googleUrl}>Google</a> &nbsp;
        <a href={redditUrl}>Reddit</a> &nbsp;
        {archiveUrls}
      </p>,
      <p key="prices">{this.props.priceString}</p>
    ]
  }
}

class ProductImages extends Component {
  render() {
    const releases = this.props.releases;
    return [
      <h3 key="header">Images</h3>,
      <ReleaseImagesUnique key="images" releases={releases} />
    ]
  }
}

class ProductSummary extends Component {
  render() {
    const monthHistogram = this.props.summary.monthHistogram;
    const seasonHistogram = this.props.summary.seasonHistogram;
    const releaseGapWeeks = this.props.summary.releaseGapWeeks;
    const releaseGap = releaseGapWeeks.every(d => d.count < 1) ?
      <div></div> :
      <div>
        <h3 key="releaseDurationHeader">Release Gap</h3>
        <BinnedScatter key="releaseDuration" data={releaseGapWeeks} />
      </div>

    return <div className="d-flex flex-wrap">
      <div>
        <h3 key="seasonHeader">Season</h3>
        <Histogram key="seasonHistogram" data={seasonHistogram} />
      </div>
      <div>
        <h3 key="monthHeader">Month</h3>
        <Histogram key="monthHistogram" data={monthHistogram} />
      </div>
      { releaseGap }
    </div>
  }
}

class ProductReleasesTable extends Component {
  render() {
    const releases = this.props.releases;
    const showReleaseNames = this.props.showReleaseNames;
    const releaseRows = releases.map((r, i) =>
    <tr key={i}><td>{r.Price}</td><td>{r.Colors}</td><td>{r.Release}</td>{(showReleaseNames) ? <td>{r.Product}</td> : null}</tr>)
    return <Table>
        <thead>
          <tr><th>Price</th><th>Colors</th><th>Release</th>{(showReleaseNames) ? <th>Release Name</th> : null}</tr>
        </thead>
        <tbody>
          {releaseRows}
        </tbody>
      </Table>
  }
}

class ProductReleases extends Component {
  render() {
    const releases = this.props.releases;
    const releasesCount = releases.length;
    return [
      <h3 key="header">Releases ({releasesCount})</h3>,
      <ProductReleasesTable key="table" releases={releases} showReleaseNames={this.props.showReleaseNames} />
    ]
  }
}


class ProductPage extends Component {
  render() {
    const releases = this.props.releases;
    if (releases.length < 1) return [];
    const productName = this.props.productName;
    const {outlierCcUrl, outlierNycUrl} = outlierProductUrls(releases);
    var prices = releases.map(function(d) { return d["Price"] });
    var minPrice = Math.min(...prices);
    var maxPrice = Math.max(...prices);
    var priceString = "Price: $" + ((minPrice === maxPrice) ? "" + minPrice : "" + minPrice + " - " + maxPrice);
    return [
      <Row key="header"><Col>
        <ProductPageHeader
          productName={productName} priceString={priceString}
          outlierCcUrl={outlierCcUrl} outlierNycUrl={outlierNycUrl} />
      </Col></Row>,
      <Row key="summary">
        <Col md={6}><ProductImages releases={releases} /></Col>
        <Col md={6}><ProductSummary summary={this.props.summary} /></Col>
      </Row>,
      <Row key="releases">
        <Col><ProductReleases releases={releases} showReleaseNames={this.props.showReleaseNames} /></Col>
      </Row>
    ]
  }
}

export default ProductPage;