import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';
import FileDownloader from '../lib/file_downloader';
import LocalIndex from '../lib/local_index';

import DocumentDownloadCardComponent from './document_download_card.jsx';

function parseUrl() {
  const paths = window.location.pathname.split('/').filter(s => s);
  if (paths.length !== 3) {
    throw(`Invalid download URL (path=${window.location.pathname}`)
  }
  return { hash: paths[2], username: paths[1] };
}

class DownloadComponent extends Component {
  constructor() {
    super();
    this.state = { document: null };
  }

  componentDidMount() {
    const urlData = parseUrl();

    var username = urlData.username;
    if (!username.includes('.')) {
      username += '.id.blockstack';
    }

    new FileDownloader(username, urlData.hash)
      .download()
      .then((gaiaDocument) => {
        this.setState({ document: gaiaDocument })
      });
      // TODO: .catch(() => /* do something when file doesn't exist */);
  }

  render() {
    if (this.state.document) {
      return (
        <div className="ev-download__container">
          <DocumentDownloadCardComponent doc={this.state.document} />
        </div>
      );
    }
    else {
      return '';
    }
  }
}

export default DownloadComponent;
