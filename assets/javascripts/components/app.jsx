import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';
import LocalIndex from '../lib/local_index';
import Page from '../lib/page';

import DocumentListComponent from './document_list.jsx';
import DropZoneComponent from './drop_zone.jsx';
import MainDialogComponent from './main_dialog.jsx';

class AppComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.localIndex = new LocalIndex();
    this.gaiaIndex = new GaiaIndex();
    this.state = Object.assign({},
      Dialogs.initState(),
      { documents: [], deleting: null, loading: true }
    );
  }

  componentDidMount() {
    Page.preventClose(async () => {
      this.gaiaIndex.onChange(() => {
        this.setState({ documents: this.gaiaIndex.documents });
      });

      await this.localIndex.load();

      if (this.localIndex.tempDocuments.length > 0) {
        this.setState({ documents: this.localIndex.tempDocuments });
        await this.gaiaIndex.addDocuments(this.localIndex.tempDocuments);
        this.localIndex.setTempDocuments([]);
      } else {
        await this.gaiaIndex.load();
      }

      this.setState({ loading: false });

      return true;
    });
  }

  handleInputChange = async (evt) => {
    await this.uploadFiles([...evt.target.files]);
    this.inputRef.current.value = null;
  }

  uploadFiles(files) {
    if (files.some(file => file.size > Constants.FILE_SIZE_LIMIT)) {
      Dialogs.open((state) => this.setState(state), Dialogs.MAXIMUM_FILE_SIZE);
      return;
    }

    if (files.some(file => file.size === 0)) {
      Dialogs.open((state) => this.setState(state), Dialogs.EMPTY_FILE);
      return;
    }

    Page.preventClose(() => {
      const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
      this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
      return this.gaiaIndex.addDocuments(gaiaDocuments);
    });
  }

  onDocumentDelete = (doc, callback) => {
    Dialogs.open(
      (state) => this.setState(state),
      Dialogs.DELETE_CONFIRMATION,
      { onAccept: () => this.onConfirmDelete(doc) }
    );
  }

  onConfirmDelete = (doc) => {
    this.setState({ deleting: doc });
    this.gaiaIndex.deleteDocument(doc);
  }

  showEmptyState() {
    return !this.state.loading && this.state.documents.length === 0;
  }

  renderUpload() {
    return (
      <div className="ev-upload__wrapper">
        {this.showEmptyState() && (
          <div className="ev-upload__arrow-wrapper">
            <div className="ev-upload__arrow-text">Start here</div>
            <img className="ev-upload__arrow-image" src="/images/arrow.svg" />
          </div>
        )}
        <div className="ev-upload__btn-wrapper">
          <label className="ev-upload__btn" htmlFor="file-upload">
            <MaterialIcon icon="add" />
            <span>UPLOAD</span>
          </label>
        </div>
        <input
          ref={this.inputRef}
          className="ev-upload__input"
          id="file-upload"
          onChange={this.handleInputChange}
          type="file"
          name="file-upload" />
      </div>
    );
  }

  render() {
    return (
      <div className="ev-app__container">
        {this.renderUpload()}
        {this.showEmptyState() ?
            <div className="ev-app__empty-state">
              <img className="ev-app__empty-state-image" src="/images/bg-empty-state.svg" />
              <div className="ev-app__empty-state-text">
                Looking a little empty? Share your files, music, images, videos ...
              </div>
            </div>
            :
            <DocumentListComponent
              deleting={this.state.deleting}
              documents={this.state.documents}
              onDelete={this.onDocumentDelete}
            />
        }
        <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
        <MainDialogComponent {...this.state.dialog} />
      </div>
    );
  }
}

export default AppComponent;
